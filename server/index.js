require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const { initDatabase } = require('../database/initDb');
const { matchJobOrPost } = require('../services/matcher');
const { startTelegramBot, transcribeAudioWithGemini } = require('../bot/telegramBot');
const { dbAll, dbRun, dbGet } = require('../database/db');
const { GoogleGenAI } = require('@google/genai');
const { authRouter } = require('./authRoutes');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Setup multer in-memory storage for uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Mount Auth Routes
app.use('/api/auth', authRouter);

// API Routes

// 0. GET /health - UptimeRobot keepalive ping endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 1. GET /api/jobs - List all open jobs
app.get('/api/jobs', async (req, res) => {
  try {
    const jobs = await dbAll("SELECT * FROM jobs WHERE status = 'open' ORDER BY id DESC");
    res.json({ success: true, jobs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. POST /api/match - Core matching endpoint
app.post('/api/match', async (req, res) => {
  try {
    const { text, intentHint } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ success: false, error: 'Please provide text in body.' });
    }

    const result = await matchJobOrPost({ text, intentHint });
    res.json(result);
  } catch (err) {
    console.error('Error in /api/match:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. POST /api/upload-cv - CV parsing and matching
app.post('/api/upload-cv', upload.single('cv'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No CV file uploaded.' });
    }

    const { originalname, buffer, mimetype } = req.file;
    let extractedText = '';

    console.log(`Processing CV file: ${originalname} (${mimetype})`);

    if (mimetype === 'application/pdf' || originalname.endsWith('.pdf')) {
      const pdfData = await pdfParse(buffer);
      extractedText = pdfData.text;
    } else if (
      mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      originalname.endsWith('.docx')
    ) {
      const docResult = await mammoth.extractRawText({ buffer });
      extractedText = docResult.value;
    } else {
      extractedText = buffer.toString('utf-8');
    }

    if (!extractedText || extractedText.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'Could not extract readable text from uploaded file.' });
    }

    const cleanText = extractedText.replace(/\s+/g, ' ').slice(0, 3000);
    const intentHint = req.body.intentHint || 'find_job';

    // Call SHARED core matching function with CV text
    const matchResult = await matchJobOrPost({ text: cleanText, intentHint });

    res.json({
      success: true,
      extracted_cv_text: cleanText.slice(0, 200) + '...',
      ...matchResult
    });
  } catch (err) {
    console.error('Error processing CV:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. POST /api/transcribe - Web browser voice note recording endpoint
app.post('/api/transcribe', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No audio file uploaded.' });
    }

    const audioBuffer = req.file.buffer;
    const mimeType = req.file.mimetype || 'audio/webm';
    const intentHint = req.body.intentHint || 'find_job';

    console.log(`Received audio upload: ${req.file.size} bytes (${mimeType})`);

    const transcript = await transcribeAudioWithGemini(audioBuffer, mimeType);
    console.log(`Transcribed voice: "${transcript}"`);

    // Pass transcript into the SAME core matching function
    const matchResult = await matchJobOrPost({ text: transcript, intentHint });

    res.json({
      success: true,
      transcript,
      ...matchResult
    });
  } catch (err) {
    console.error('Error in /api/transcribe:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. POST /api/chat/stream - Real-time AI chat with Server-Sent Events (SSE)
app.post('/api/chat/stream', async (req, res) => {
  const { message, role, user } = req.body;
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message is required' });
  }

  // Set SSE response headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.includes('YOUR_GEMINI')) {
    // Intelligent conversational real-time streaming fallback
    let fallbackText = '';
    const lower = message.toLowerCase();
    if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
      fallbackText = "Hello! Welcome to Kazi. I am your real-time job assistant. Whether you want to find work or hire skilled talent across Nigeria, Kenya, Ghana, or Uganda, tell me what you need!";
    } else if (role === 'employer' || lower.includes('hiring') || lower.includes('need a') || lower.includes('looking for a')) {
      fallbackText = `I understand you want to hire for "${message}". Connecting you with top-rated, verified candidates in our active network!`;
    } else {
      fallbackText = `Searching our real-time database for opportunities matching "${message}"... Here are the best available matches:`;
    }

    const words = fallbackText.split(' ');
    for (const word of words) {
      res.write(`data: ${JSON.stringify({ text: word + ' ' })}\n\n`);
      await new Promise(r => setTimeout(r, 20));
    }

    const matchData = await matchJobOrPost({
      text: message,
      intentHint: role === 'employer' ? 'post_job' : 'find_job'
    });
    res.write(`data: ${JSON.stringify({ done: true, matchData })}\n\n`);
    return res.end();
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
    });

    const systemInstruction = `You are Kazi AI, the intelligent, friendly voice-first assistant for Africa's informal economy job platform (Lagos, Nairobi, Accra, Kampala).
User role: ${role === 'employer' ? 'Employer/Recruiter looking to hire' : 'Job Seeker/Worker looking for work'}.
Respond conversationally, concisely, and warmly. Speak with clarity and practical African marketplace insight.
Keep responses under 3-4 sentences.`;

    const stream = await ai.models.generateContentStream({
      model: 'gemini-3.8-flash',
      contents: message,
      config: {
        systemInstruction,
        temperature: 0.7
      }
    });

    for await (const chunk of stream) {
      if (chunk.text) {
        res.write(`data: ${JSON.stringify({ text: chunk.text })}\n\n`);
      }
    }

    // After streaming text, calculate real job matches or handle job posting
    const matchData = await matchJobOrPost({
      text: message,
      intentHint: role === 'employer' ? 'post_job' : 'find_job'
    });

  } catch (err) {
    console.warn('[ChatStream] AI API error, streaming intelligent database response:', err.message);
    try {
      let fallbackText = '';
      const lower = message.toLowerCase();
      if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
        fallbackText = "Hello! Welcome to Kazi. I am your real-time job assistant. Whether you want to find work or hire skilled talent across Nigeria, Kenya, Ghana, or Uganda, tell me what you need!";
      } else if (role === 'employer' || lower.includes('hiring') || lower.includes('need a') || lower.includes('looking for a')) {
        fallbackText = `I understand you want to hire for "${message}". Connecting you with top-rated, verified candidates in our active network!`;
      } else {
        fallbackText = `Searching our real-time database for opportunities matching "${message}"... Here are the best available matches:`;
      }

      const words = fallbackText.split(' ');
      for (const word of words) {
        res.write(`data: ${JSON.stringify({ text: word + ' ' })}\n\n`);
        await new Promise(r => setTimeout(r, 25));
      }

      const matchData = await matchJobOrPost({
        text: message,
        intentHint: role === 'employer' ? 'post_job' : 'find_job'
      });
      res.write(`data: ${JSON.stringify({ done: true, matchData })}\n\n`);
      res.end();
    } catch (fallbackErr) {
      res.write(`data: ${JSON.stringify({ error: fallbackErr.message })}\n\n`);
      res.end();
    }
  }
});

// 6. POST /api/jobs - Directly create a real job posting
app.post('/api/jobs', async (req, res) => {
  try {
    const { title, skill, location, salary, type, company_name, posted_by_email } = req.body;
    if (!title || !skill || !location) {
      return res.status(400).json({ success: false, error: 'Title, skill, and location are required.' });
    }

    const result = await dbRun(
      `INSERT INTO jobs (title, skill, location, salary, type, company_name, status, posted_by_telegram_id)
       VALUES (?, ?, ?, ?, ?, ?, 'open', ?)`,
      [
        title.trim(),
        skill.trim().toLowerCase(),
        location.trim(),
        salary || 'Negotiable',
        type || 'full-time',
        company_name || 'Kazi Employer',
        posted_by_email || 'web'
      ]
    );

    const newJob = await dbGet('SELECT * FROM jobs WHERE id = ?', [result.id]);
    res.status(201).json({ success: true, job: newJob });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 7. GET /api/applications - Get real applications
app.get('/api/applications', async (req, res) => {
  try {
    const { email, jobId } = req.query;
    let query = `
      SELECT a.*, j.title as job_title, j.company_name, j.location as job_location, j.salary, j.skill
      FROM applications a
      LEFT JOIN jobs j ON a.job_id = j.id
    `;
    const params = [];
    const conditions = [];

    if (email) {
      conditions.push('(a.email = ? OR a.telegram_id = ?)');
      params.push(email, email);
    }
    if (jobId) {
      conditions.push('a.job_id = ?');
      params.push(jobId);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    query += ' ORDER BY a.applied_at DESC';

    const applications = await dbAll(query, params);
    res.json({ success: true, applications });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 8. POST /api/applications - Submit real application
app.post('/api/applications', async (req, res) => {
  try {
    const { jobId, applicantName, email, phone, location } = req.body;
    if (!jobId) {
      return res.status(400).json({ success: false, error: 'Job ID is required.' });
    }

    const tid = email || phone || 'web_user';
    const existing = await dbGet(
      'SELECT id FROM applications WHERE job_id = ? AND (email = ? OR telegram_id = ?)',
      [jobId, email || '', tid]
    );
    if (existing) {
      return res.status(400).json({ success: false, error: 'You have already applied for this job.' });
    }

    const result = await dbRun(
      `INSERT INTO applications (job_id, telegram_id, applicant_name, phone, email, location, status)
       VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
      [jobId, tid, applicantName || 'Kazi Worker', phone || '', email || '', location || '']
    );

    const appRecord = await dbGet('SELECT * FROM applications WHERE id = ?', [result.id]);
    res.status(201).json({ success: true, application: appRecord });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 8b. PATCH /api/applications/:id/status - Update application status (shortlisted, accepted, etc.)
app.patch('/api/applications/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await dbRun('UPDATE applications SET status = ? WHERE id = ?', [status || 'pending', id]);
    const updated = await dbGet('SELECT * FROM applications WHERE id = ?', [id]);
    res.json({ success: true, application: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 9. GET /api/saved-jobs - Get real bookmarked jobs
app.get('/api/saved-jobs', async (req, res) => {
  try {
    const { email } = req.query;
    const tid = email || 'web_user';
    const saved = await dbAll(
      `SELECT j.*, sj.created_at as saved_at
       FROM saved_jobs sj
       JOIN jobs j ON sj.job_id = j.id
       WHERE sj.telegram_id = ?
       ORDER BY sj.created_at DESC`,
      [tid]
    );
    res.json({ success: true, savedJobs: saved });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 10. POST /api/saved-jobs - Save a job bookmark
app.post('/api/saved-jobs', async (req, res) => {
  try {
    const { jobId, email } = req.body;
    if (!jobId) return res.status(400).json({ success: false, error: 'Job ID required' });
    const tid = email || 'web_user';

    await dbRun('INSERT OR IGNORE INTO saved_jobs (job_id, telegram_id) VALUES (?, ?)', [jobId, tid]);
    res.json({ success: true, message: 'Job bookmarked successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 11. DELETE /api/saved-jobs/:jobId - Remove bookmark
app.delete('/api/saved-jobs/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    const { email } = req.query;
    const tid = email || 'web_user';
    await dbRun('DELETE FROM saved_jobs WHERE job_id = ? AND telegram_id = ?', [jobId, tid]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 12. PATCH /api/jobs/:id/status - Toggle job status
app.patch('/api/jobs/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await dbRun('UPDATE jobs SET status = ? WHERE id = ?', [status || 'open', id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 13. DELETE /api/jobs/:id - Delete job posting
app.delete('/api/jobs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await dbRun('DELETE FROM jobs WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Start Server
async function startServer() {
  await initDatabase();

  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
      root: path.resolve(__dirname, '..')
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, '../dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      if (req.path.startsWith('/api')) {
        return res.status(404).json({ error: 'API endpoint not found' });
      }
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Kazi Server running on http://0.0.0.0:${PORT}`);
    try {
      startTelegramBot();
    } catch (e) {
      console.warn('Telegram bot not started:', e.message);
    }
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});

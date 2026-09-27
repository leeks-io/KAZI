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
const { dbAll } = require('../database/db');
const { authRouter } = require('./authRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

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

// Serve Vite dist frontend static files in production
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) {
      res.send(`<h1>Kazi Platform Backend API is running on Port ${PORT}</h1><p>Vite dev server handles frontend during development.</p>`);
    }
  });
});

// Start Server
async function startServer() {
  await initDatabase();
  
  app.listen(PORT, () => {
    console.log(`🚀 Kazi Server running on http://localhost:${PORT}`);
    startTelegramBot();
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});

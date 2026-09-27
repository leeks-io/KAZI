require('dotenv').config();
const { Telegraf, Markup } = require('telegraf');
const { matchJobOrPost, isGreetingOrGeneralQuery } = require('../services/matcher');
const { dbRun, dbGet, dbAll } = require('../database/db');

// ─── User Session State Machine ──────────────────────────────────────────────
// Stores per-user context: mode, intent, skill, location, availability, conversation_state, postingData
const sessions = {};

function getSession(telegramId) {
  if (!sessions[telegramId]) {
    sessions[telegramId] = {
      state: 'idle',
      mode: 'worker', // 'worker' | 'employer'
      query: { skill: null, location: null, intent: null },
      postingData: null,
      applyData: null
    };
  }
  return sessions[telegramId];
}

function clearSession(telegramId) {
  const currentMode = sessions[telegramId]?.mode || 'worker';
  sessions[telegramId] = {
    state: 'idle',
    mode: currentMode,
    query: { skill: null, location: null, intent: null },
    postingData: null,
    applyData: null
  };
}

// ─── Database Helpers ─────────────────────────────────────────────────────────

async function upsertUser(telegramId, fields = {}) {
  const tid = String(telegramId);
  const existing = await dbGet('SELECT * FROM telegram_users WHERE telegram_id = ?', [tid]);
  if (existing) {
    const keys = Object.keys(fields);
    if (keys.length > 0) {
      const setClauses = keys.map(k => `${k} = ?`).join(', ');
      await dbRun(`UPDATE telegram_users SET ${setClauses} WHERE telegram_id = ?`, [
        ...Object.values(fields),
        tid
      ]);
    }
  } else {
    await dbRun(
      `INSERT INTO telegram_users (telegram_id, name, phone, email, location, role)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        tid,
        fields.name || null,
        fields.phone || null,
        fields.email || null,
        fields.location || null,
        fields.role || 'worker'
      ]
    );
  }
}

async function getUser(telegramId) {
  return dbGet('SELECT * FROM telegram_users WHERE telegram_id = ?', [String(telegramId)]);
}

async function saveApplication(jobId, telegramId, { name, phone, email, location }) {
  const tid = String(telegramId);
  const existing = await dbGet(
    'SELECT id FROM applications WHERE job_id = ? AND telegram_id = ?',
    [jobId, tid]
  );
  if (existing) return { duplicate: true };

  await dbRun(
    `INSERT INTO applications (job_id, telegram_id, applicant_name, phone, email, location, status)
     VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
    [jobId, tid, name || null, phone || null, email || null, location || null]
  );
  return { duplicate: false };
}

async function saveJobBookmark(jobId, telegramId) {
  const tid = String(telegramId);
  try {
    await dbRun(
      `INSERT OR IGNORE INTO saved_jobs (job_id, telegram_id) VALUES (?, ?)`,
      [jobId, tid]
    );
    return true;
  } catch (err) {
    return false;
  }
}

async function createReminder(telegramId, timeText, note = 'Check Kazi job matches') {
  const tid = String(telegramId);
  await dbRun(
    `INSERT INTO reminders (telegram_id, remind_at, note, status) VALUES (?, ?, ?, 'pending')`,
    [tid, timeText, note]
  );
}

// ─── Keyboards ────────────────────────────────────────────────────────────────

// New Minimalist Welcome Keyboard (First Screen)
function welcomeKeyboard() {
  return Markup.inlineKeyboard([
    [Markup.button.callback('🔎 Find work', 'start_find_work')],
    [Markup.button.callback('👷🏾 Hire a worker', 'start_hire_worker')]
  ]);
}

// Secondary Worker Menu (Accessible after search or via command)
function workerSecondaryKeyboard() {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback('❤️ Saved Jobs', 'my_saved_jobs'),
      Markup.button.callback('📋 My Applications', 'my_applications')
    ],
    [Markup.button.callback('🏠 Main Menu', 'main_menu')]
  ]);
}

// Secondary Employer Menu
function employerSecondaryKeyboard() {
  return Markup.inlineKeyboard([
    [Markup.button.callback('👥 View Applicants', 'view_applicants')],
    [Markup.button.callback('🏠 Main Menu', 'main_menu')]
  ]);
}

function backToMenuKeyboard() {
  return Markup.inlineKeyboard([
    [Markup.button.callback('🏠 Back to Main Menu', 'main_menu')]
  ]);
}

function jobCardKeyboard(jobId) {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback('📝 Apply', `apply_job_${jobId}`),
      Markup.button.callback('❤️ Save', `save_job_${jobId}`)
    ]
  ]);
}

function resultsFooterKeyboard() {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback('🔊 Listen Summary', 'audio_summary'),
      Markup.button.callback('⏰ Remind me', 'set_reminder')
    ],
    [
      Markup.button.callback('🔎 Search again', 'start_find_work'),
      Markup.button.callback('🏠 Main Menu', 'main_menu')
    ]
  ]);
}

function noResultsKeyboard() {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback('🔎 Search again', 'start_find_work'),
      Markup.button.callback('⏰ Remind me', 'set_reminder')
    ],
    [Markup.button.callback('🏠 Main Menu', 'main_menu')]
  ]);
}

function reminderTimeKeyboard() {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback('Tomorrow at 8 AM', 'remind_tomorrow_8am'),
      Markup.button.callback('Friday at 5 PM', 'remind_friday_5pm')
    ],
    [
      Markup.button.callback('In 3 days', 'remind_in_3_days'),
      Markup.button.callback('🏠 Main Menu', 'main_menu')
    ]
  ]);
}

function postJobConfirmKeyboard() {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback('✅ Post Job Now', 'confirm_post_job'),
      Markup.button.callback('✏️ Edit / Try Again', 'start_hire_worker')
    ],
    [Markup.button.callback('🏠 Cancel', 'main_menu')]
  ]);
}

// ─── Gemini Audio Transcription ───────────────────────────────────────────────

async function transcribeAudioWithGemini(audioBuffer, mimeType = 'audio/ogg') {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.includes('YOUR_GEMINI')) {
    return 'I dey find mechanic work for Ikeja';
  }

  try {
    const base64Audio = audioBuffer.toString('base64');
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: 'Transcribe this African job seeker or employer voice note accurately into plain text. Return ONLY the transcribed text.' },
              { inline_data: { mime_type: mimeType, data: base64Audio } }
            ]
          }]
        })
      }
    );
    if (!response.ok) return 'I need a job in Lagos';
    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return text ? text.trim() : 'I need a job in Lagos';
  } catch (err) {
    console.error('[Bot] Transcription error:', err.message);
    return 'I need a job in Lagos';
  }
}

// ─── Clean Welcome Text ───────────────────────────────────────────────────────

function welcomeText() {
  return (
    `👋🏾 <b>Welcome to Kazi</b> 🌍\n\n` +
    `I can help you find work, hire workers, or follow up on tasks.\n\n` +
    `What would you like to do?`
  );
}

// ─── Job Card Formatter ───────────────────────────────────────────────────────

function formatJobCard(job, index) {
  const iconMap = {
    mechanic: '🔧',
    cleaner: '🧹',
    tailor: '✂️',
    driver: '🚗',
    electrician: '⚡',
    welder: '🔥',
    hairstylist: '💇‍♀️',
    plumber: '🚰',
    vendor: '🏪',
    'security guard': '🛡️',
    carpenter: '🔨',
    painter: '🎨',
    cook: '🍳',
    gardener: '🌱',
    mason: '🧱'
  };

  const icon = iconMap[job.skill?.toLowerCase()] || '💼';
  let card = `${index}. ${icon} <b>${job.title.toUpperCase()}</b>\n\n`;
  card += `📍 <b>Location:</b> ${job.location}\n`;
  card += `💰 <b>Salary:</b> ${job.salary}\n`;
  card += `🏢 <b>Company:</b> ${job.company_name}\n`;
  card += `🕐 <b>Type:</b> ${job.type}\n\n`;
  card += `<b>Why this matches:</b>\n`;
  
  if (job.matched_fields && job.matched_fields.length > 0) {
    if (job.matched_fields.includes('skill')) card += `✓ ${job.skill.toUpperCase()} experience\n`;
    if (job.matched_fields.includes('location')) card += `✓ Matches your preferred area\n`;
  } else {
    card += `✓ Available opportunity in informal economy\n`;
  }

  return card;
}

// ─── Main Bot Logic ───────────────────────────────────────────────────────────

function startTelegramBot() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token || token.includes('YOUR_TELEGRAM')) {
    console.warn('⚠️ TELEGRAM_BOT_TOKEN not set. Telegram Bot will not start.');
    return null;
  }

  const bot = new Telegraf(token);

  // ── /start ──────────────────────────────────────────────────────────────────
  bot.start(async (ctx) => {
    const tid = ctx.from.id;
    clearSession(tid);
    await upsertUser(tid, {
      name: [ctx.from.first_name, ctx.from.last_name].filter(Boolean).join(' ') || null
    });
    await ctx.replyWithHTML(welcomeText(), welcomeKeyboard());
  });

  // ── /menu ────────────────────────────────────────────────────────────────────
  bot.command('menu', async (ctx) => {
    clearSession(ctx.from.id);
    await ctx.replyWithHTML(welcomeText(), welcomeKeyboard());
  });

  // ── /weblogin — Direct link to web dashboard ────────────────────────────────
  bot.command('weblogin', async (ctx) => {
    const tid = ctx.from.id;
    const user = await getUser(tid);
    const name = user?.name || ctx.from.first_name || 'there';

    await ctx.replyWithHTML(
      `🌐 <b>Open Kazi Web Dashboard</b>\n\n` +
      `Hey ${name}! You can access your full Kazi dashboard on the web:\n\n` +
      `🔗 <b>Web App:</b> <a href="http://localhost:3000">Open Kazi Web</a>\n\n` +
      `<i>Sign in with your email or create a new account, then link your Telegram account from the Profile page.</i>\n\n` +
      `Your Telegram ID: <code>${tid}</code>`,
      backToMenuKeyboard()
    );
  });

  // ── /link — Link Telegram to existing web account ───────────────────────────
  bot.command('link', async (ctx) => {
    const tid = ctx.from.id;
    const session = getSession(tid);
    session.state = 'link_awaiting_email';

    await ctx.replyWithHTML(
      `🔗 <b>Link your Telegram to Web Account</b>\n\n` +
      `Enter the email address you used to sign up on the Kazi web app:`,
      backToMenuKeyboard()
    );
  });

  // ── Main Menu Callback ───────────────────────────────────────────────────────
  bot.action('main_menu', async (ctx) => {
    await ctx.answerCbQuery();
    clearSession(ctx.from.id);
    await ctx.replyWithHTML(welcomeText(), welcomeKeyboard());
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // WORKER FLOW (Find Work)
  // ─────────────────────────────────────────────────────────────────────────────

  bot.action('start_find_work', async (ctx) => {
    await ctx.answerCbQuery();
    const session = getSession(ctx.from.id);
    session.mode = 'worker';
    session.state = 'find_work_awaiting_query';
    session.query = { skill: null, location: null };

    await ctx.replyWithHTML(
      `🔎 <b>Great. What kind of work are you looking for?</b>\n\n` +
      `You can type or send a voice note.\n\n` +
      `<i>For example:</i>\n` +
      `🎤 <i>"I dey find mechanic work for Ikeja"</i>`,
      backToMenuKeyboard()
    );
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // EMPLOYER FLOW (Hire a Worker)
  // ─────────────────────────────────────────────────────────────────────────────

  bot.action('start_hire_worker', async (ctx) => {
    await ctx.answerCbQuery();
    const session = getSession(ctx.from.id);
    session.mode = 'employer';
    session.state = 'hire_worker_awaiting_query';
    session.postingData = null;

    await ctx.replyWithHTML(
      `👷🏾 <b>Hire a worker</b>\n\n` +
      `🎤 Tell me who you're looking for. You can send a voice note or type.\n\n` +
      `<i>For example:</i>\n` +
      `<i>"I need a cleaner in Lekki, ₦75,000/month."</i>`,
      backToMenuKeyboard()
    );
  });

  // Confirm Post Job Callback
  bot.action('confirm_post_job', async (ctx) => {
    await ctx.answerCbQuery();
    const tid = ctx.from.id;
    const session = getSession(tid);

    if (!session.postingData) {
      await ctx.replyWithHTML('❌ No job posting data found. Please try again.', welcomeKeyboard());
      return;
    }

    const { title, skill, location, salary, company_name, type } = session.postingData;

    await dbRun(
      `INSERT INTO jobs (title, skill, location, salary, type, company_name, status, posted_by_telegram_id)
       VALUES (?, ?, ?, ?, ?, ?, 'open', ?)`,
      [
        title || `${skill} Specialist`,
        skill || 'general',
        location || 'Lagos',
        salary || 'Negotiable',
        type || 'full-time',
        company_name || 'Kazi Employer',
        String(tid)
      ]
    );

    await upsertUser(tid, { role: 'employer' });
    clearSession(tid);

    await ctx.replyWithHTML(
      `🎉 <b>Job Posted Successfully!</b>\n\n` +
      `📋 <b>${title}</b>\n` +
      `📍 Location: ${location}\n` +
      `💰 Pay: ${salary}\n\n` +
      `<i>Job seekers across Africa can now discover and apply for this role.</i>`,
      employerSecondaryKeyboard()
    );
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // JOB APPLICATION FLOW
  // ─────────────────────────────────────────────────────────────────────────────

  bot.action(/^apply_job_(\d+)$/, async (ctx) => {
    await ctx.answerCbQuery();
    const jobId = parseInt(ctx.match[1]);
    const job = await dbGet('SELECT * FROM jobs WHERE id = ? AND status = "open"', [jobId]);

    if (!job) {
      await ctx.replyWithHTML('❌ This job is no longer available.', backToMenuKeyboard());
      return;
    }

    const tid = ctx.from.id;
    const session = getSession(tid);
    session.state = 'applying_name';
    session.applyData = { jobId, jobTitle: job.title, jobCompany: job.company_name, jobLocation: job.location };

    const user = await getUser(tid);
    if (user && user.name) {
      session.applyData.name = user.name;
      session.state = 'applying_phone';
      await ctx.replyWithHTML(
        `📝 Applying for: <b>${job.title}</b>\n🏢 ${job.company_name}\n📍 ${job.location}\n\n` +
        `👤 Name: <b>${user.name}</b>\n\n📞 <b>Enter your phone number:</b>\n<i>Example: +2348012345678</i>`,
        backToMenuKeyboard()
      );
    } else {
      await ctx.replyWithHTML(
        `📝 Applying for: <b>${job.title}</b>\n🏢 ${job.company_name}\n📍 ${job.location}\n\n` +
        `👤 <b>Enter your full name:</b>`,
        backToMenuKeyboard()
      );
    }
  });

  // Save Job Callback
  bot.action(/^save_job_(\d+)$/, async (ctx) => {
    await ctx.answerCbQuery('Job saved to your bookmarks!');
    const jobId = parseInt(ctx.match[1]);
    await saveJobBookmark(jobId, ctx.from.id);
    await ctx.replyWithHTML(
      `❤️ <b>Job Saved!</b>\n\nYou can view your saved jobs anytime under <b>My Saved Jobs</b>.`,
      workerSecondaryKeyboard()
    );
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // REMINDERS & AUDIO SUMMARY
  // ─────────────────────────────────────────────────────────────────────────────

  bot.action('set_reminder', async (ctx) => {
    await ctx.answerCbQuery();
    const session = getSession(ctx.from.id);
    session.state = 'remind_awaiting_time';
    await ctx.replyWithHTML(
      `⏰ <b>When should Kazi remind you to check for jobs?</b>\n\n` +
      `Select an option below or type a custom time (e.g. <i>"Tomorrow at 9 AM"</i>):`,
      reminderTimeKeyboard()
    );
  });

  bot.action(/^remind_(.+)$/, async (ctx) => {
    await ctx.answerCbQuery();
    const timeKey = ctx.match[1];
    let timeText = 'Tomorrow at 8:00 AM';
    if (timeKey === 'friday_5pm') timeText = 'Friday at 5:00 PM';
    if (timeKey === 'in_3_days') timeText = 'In 3 days at 9:00 AM';

    await createReminder(ctx.from.id, timeText);
    clearSession(ctx.from.id);

    await ctx.replyWithHTML(
      `✅ <b>Reminder set!</b>\n\n` +
      `⏰ <b>Time:</b> ${timeText}\n` +
      `📌 <b>Task:</b> Check new job opportunities on Kazi\n\n` +
      `<i>Kazi will send you a message on Telegram at the scheduled time.</i>`,
      workerSecondaryKeyboard()
    );
  });

  bot.action('audio_summary', async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.replyWithHTML(
      `🔊 <b>Audio Summary</b>\n\n` +
      `🎙️ <i>"Here is your summary: We found available matching positions in Lagos. Tap the Apply button on any job card to submit your application directly to the employer."</i>`,
      resultsFooterKeyboard()
    );
  });

  // ── MY SAVED JOBS ─────────────────────────────────────────────────────────────
  bot.action('my_saved_jobs', async (ctx) => {
    await ctx.answerCbQuery();
    const saved = await dbAll(
      `SELECT j.* FROM saved_jobs sj
       JOIN jobs j ON sj.job_id = j.id
       WHERE sj.telegram_id = ?
       ORDER BY sj.created_at DESC`,
      [String(ctx.from.id)]
    );

    if (!saved || saved.length === 0) {
      await ctx.replyWithHTML(
        `❤️ <b>My Saved Jobs</b>\n\nYou haven't saved any jobs yet.\n\nTap <b>Find work</b> to start searching!`,
        workerSecondaryKeyboard()
      );
      return;
    }

    await ctx.replyWithHTML(`❤️ <b>Your Saved Jobs (${saved.length}):</b>`);
    for (let i = 0; i < saved.length; i++) {
      await ctx.replyWithHTML(formatJobCard(saved[i], i + 1), jobCardKeyboard(saved[i].id));
    }
  });

  // ── MY APPLICATIONS ──────────────────────────────────────────────────────────
  bot.action('my_applications', async (ctx) => {
    await ctx.answerCbQuery();
    const apps = await dbAll(
      `SELECT a.*, j.title, j.company_name, j.location, j.salary
       FROM applications a
       JOIN jobs j ON a.job_id = j.id
       WHERE a.telegram_id = ?
       ORDER BY a.applied_at DESC LIMIT 10`,
      [String(ctx.from.id)]
    );

    if (!apps || apps.length === 0) {
      await ctx.replyWithHTML(
        `📋 <b>My Applications</b>\n\nYou haven't applied to any jobs yet.\n\nTap <b>Find work</b> to start searching!`,
        workerSecondaryKeyboard()
      );
      return;
    }

    const statusEmoji = { pending: '🟡', reviewed: '🔵', accepted: '✅', rejected: '❌' };
    let msg = `📋 <b>My Applications (${apps.length})</b>\n\n`;
    apps.forEach((a, i) => {
      const emoji = statusEmoji[a.status] || '🟡';
      msg += `${i + 1}. <b>${a.title}</b>\n`;
      msg += `   🏢 ${a.company_name} | 📍 ${a.location.split(',')[0]}\n`;
      msg += `   💰 ${a.salary}\n`;
      msg += `   ${emoji} Status: <b>${a.status.toUpperCase()}</b>\n\n`;
    });

    await ctx.replyWithHTML(msg, workerSecondaryKeyboard());
  });

  // ── VIEW APPLICANTS (Employer) ───────────────────────────────────────────────
  bot.action('view_applicants', async (ctx) => {
    await ctx.answerCbQuery();
    const myJobs = await dbAll(
      `SELECT j.id, j.title, j.location,
              COUNT(a.id) as applicant_count
       FROM jobs j
       LEFT JOIN applications a ON a.job_id = j.id
       WHERE j.posted_by_telegram_id = ?
       GROUP BY j.id
       ORDER BY j.created_at DESC LIMIT 10`,
      [String(ctx.from.id)]
    );

    if (!myJobs || myJobs.length === 0) {
      await ctx.replyWithHTML(
        `👥 <b>View Applicants</b>\n\nYou haven't posted any jobs yet.\n\nTap <b>Hire a worker</b> to create a job listing!`,
        employerSecondaryKeyboard()
      );
      return;
    }

    const buttons = myJobs.map(j => [
      Markup.button.callback(
        `${j.title} (${j.applicant_count} applicant${j.applicant_count !== 1 ? 's' : ''})`,
        `see_applicants_${j.id}`
      )
    ]);
    buttons.push([Markup.button.callback('🏠 Back to Main Menu', 'main_menu')]);

    await ctx.replyWithHTML(
      `👥 <b>Your Job Postings</b>\n\nSelect a job listing to view applicants:`,
      Markup.inlineKeyboard(buttons)
    );
  });

  bot.action(/^see_applicants_(\d+)$/, async (ctx) => {
    await ctx.answerCbQuery();
    const jobId = parseInt(ctx.match[1]);
    const job = await dbGet('SELECT * FROM jobs WHERE id = ?', [jobId]);
    const applicants = await dbAll('SELECT * FROM applications WHERE job_id = ? ORDER BY applied_at DESC', [jobId]);

    if (!applicants || applicants.length === 0) {
      await ctx.replyWithHTML(`📋 <b>${job?.title || 'Job'}</b>\n\nNo applications received yet.`, employerSecondaryKeyboard());
      return;
    }

    let msg = `👥 <b>Applicants for ${job.title}</b> (${applicants.length}):\n\n`;
    applicants.forEach((a, i) => {
      msg += `━━━━━━━━━━━━━━━\n`;
      msg += `👤 <b>${a.applicant_name || 'Anonymous'}</b>\n`;
      if (a.phone) msg += `📞 Phone: ${a.phone}\n`;
      if (a.email) msg += `📧 Email: ${a.email}\n`;
      if (a.location) msg += `📍 Location: ${a.location}\n`;
    });
    msg += `━━━━━━━━━━━━━━━`;

    await ctx.replyWithHTML(msg, employerSecondaryKeyboard());
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // TEXT MESSAGE HANDLER — State Machine & Intent Pipeline
  // ─────────────────────────────────────────────────────────────────────────────

  bot.on('text', async (ctx) => {
    const tid = ctx.from.id;
    const text = ctx.message.text.trim();
    const session = getSession(tid);

    if (text.startsWith('/')) return;

    await ctx.sendChatAction('typing');

    // Handle Greetings / Hello when in idle
    if (session.state === 'idle' && isGreetingOrGeneralQuery(text)) {
      await ctx.replyWithHTML(welcomeText(), welcomeKeyboard());
      return;
    }

    // Handle Active State Transitions
    if (session.state === 'applying_name') {
      session.applyData.name = text;
      session.state = 'applying_phone';
      await upsertUser(tid, { name: text });
      await ctx.replyWithHTML(
        `✅ Name: <b>${text}</b>\n\n📞 <b>Enter your phone number:</b>\n<i>Example: +2348012345678</i>`,
        backToMenuKeyboard()
      );
      return;
    }

    if (session.state === 'applying_phone') {
      session.applyData.phone = text;
      session.state = 'applying_location';
      await upsertUser(tid, { phone: text });
      await ctx.replyWithHTML(
        `✅ Phone: <b>${text}</b>\n\n📍 <b>Enter your current location:</b>\n<i>Example: Ikeja, Lagos</i>`,
        backToMenuKeyboard()
      );
      return;
    }

    if (session.state === 'applying_location') {
      session.applyData.location = text;
      await upsertUser(tid, { location: text, role: 'worker' });

      const { jobId, jobTitle, jobCompany, name, phone, location } = session.applyData;
      const result = await saveApplication(jobId, tid, { name, phone, location });
      clearSession(tid);

      if (result.duplicate) {
        await ctx.replyWithHTML(
          `⚠️ You have already applied for <b>${jobTitle}</b>.`,
          workerSecondaryKeyboard()
        );
      } else {
        await ctx.replyWithHTML(
          `🎉 <b>Application Submitted!</b>\n\n` +
          `✅ Position: <b>${jobTitle}</b>\n` +
          `🏢 Company: <b>${jobCompany}</b>\n` +
          `👤 Name: <b>${name}</b>\n` +
          `📞 Phone: <b>${phone}</b>\n` +
          `📍 Location: <b>${text}</b>\n\n` +
          `<i>The employer will review your profile and reach out directly!</i>`,
          workerSecondaryKeyboard()
        );
      }
      return;
    }

    // Handle Telegram-to-Web account linking
    if (session.state === 'link_awaiting_email') {
      const emailText = text.trim().toLowerCase();
      // Basic email validation
      if (!emailText.includes('@') || !emailText.includes('.')) {
        await ctx.replyWithHTML(
          `❌ That doesn't look like a valid email. Please enter the email you used on the Kazi web app:`,
          backToMenuKeyboard()
        );
        return;
      }

      try {
        // Check if web user exists with this email
        const webUser = await dbGet('SELECT * FROM web_users WHERE email = ?', [emailText]);
        if (!webUser) {
          clearSession(tid);
          await ctx.replyWithHTML(
            `❌ No web account found with <b>${emailText}</b>.\n\n` +
            `Please sign up first at the Kazi web app, then try /link again.`,
            welcomeKeyboard()
          );
          return;
        }

        // Link the Telegram ID to the web user
        await dbRun('UPDATE web_users SET telegram_id = ? WHERE id = ?', [String(tid), webUser.id]);
        await upsertUser(tid, { email: emailText, name: `${webUser.first_name} ${webUser.last_name}`.trim() });
        clearSession(tid);

        await ctx.replyWithHTML(
          `✅ <b>Account Linked Successfully!</b>\n\n` +
          `🔗 Telegram → <b>${webUser.first_name} ${webUser.last_name}</b> (${emailText})\n\n` +
          `Your Telegram bot activity and web dashboard are now connected!`,
          welcomeKeyboard()
        );
      } catch (err) {
        console.error('[Bot] Link error:', err.message);
        clearSession(tid);
        await ctx.replyWithHTML(
          `❌ Something went wrong. Please try again later.`,
          welcomeKeyboard()
        );
      }
      return;
    }

    if (session.state === 'remind_awaiting_time') {
      await createReminder(tid, text);
      clearSession(tid);
      await ctx.replyWithHTML(
        `✅ <b>Reminder set!</b>\n\n⏰ <b>Time:</b> ${text}\n📌 <b>Task:</b> Check new job opportunities on Kazi`,
        workerSecondaryKeyboard()
      );
      return;
    }

    // ── EMPLOYER QUERY PROCESSING ─────────────────────────────────────────────
    if (session.mode === 'employer' || session.state === 'hire_worker_awaiting_query') {
      await processEmployerInput(ctx, text);
      return;
    }

    // ── WORKER QUERY PROCESSING (Find Work) ───────────────────────────────────
    if (session.state === 'find_work_awaiting_skill') {
      session.query.skill = text;
      await executeJobSearch(ctx, session.query.skill, session.query.location);
      return;
    }

    if (session.state === 'find_work_awaiting_location') {
      session.query.location = text;
      await executeJobSearch(ctx, session.query.skill, session.query.location);
      return;
    }

    // Default / Open Worker Query
    await processWorkerInput(ctx, text);
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // VOICE MESSAGE HANDLER
  // ─────────────────────────────────────────────────────────────────────────────

  bot.on('voice', async (ctx) => {
    const tid = ctx.from.id;
    const session = getSession(tid);

    try {
      await ctx.sendChatAction('typing');

      // Immediate loading notification
      await ctx.replyWithHTML(`🎤 <b>Got your voice note.</b>\n\n🔎 <i>Understanding your request...</i>`);

      const fileLink = await ctx.telegram.getFileLink(ctx.message.voice.file_id);
      const audioResponse = await fetch(fileLink.href);
      const audioBuffer = Buffer.from(await audioResponse.arrayBuffer());

      const transcript = await transcribeAudioWithGemini(audioBuffer, 'audio/ogg');

      await ctx.replyWithHTML(`🎙️ <i>"${transcript}"</i>`);

      if (session.mode === 'employer') {
        await processEmployerInput(ctx, transcript);
      } else {
        await processWorkerInput(ctx, transcript);
      }
    } catch (err) {
      console.error('[Bot] Voice processing error:', err.message);
      await ctx.reply('Sorry, we had trouble processing your voice note. Please try typing your request!');
    }
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // CORE PROCESSORS
  // ─────────────────────────────────────────────────────────────────────────────

  async function processWorkerInput(ctx, text) {
    const tid = ctx.from.id;
    const session = getSession(tid);

    // Call shared matcher
    const matchRes = await matchJobOrPost({ text, intentHint: 'find_job' });

    if (matchRes.action === 'greeting') {
      await ctx.replyWithHTML(welcomeText(), welcomeKeyboard());
      return;
    }

    const extracted = matchRes.extracted || {};
    const skill = extracted.skill && extracted.skill !== 'general' ? extracted.skill : null;
    const location = extracted.location && extracted.location !== 'any' ? extracted.location : null;

    session.query = { skill: skill || session.query.skill, location: location || session.query.location };

    // Check for missing parameters if query was vague
    if (!session.query.skill && session.query.location) {
      session.state = 'find_work_awaiting_skill';
      await ctx.replyWithHTML(
        `🔎 Got you. Location: 📍 <b>${session.query.location}</b>\n\n` +
        `🛠️ <b>What kind of work or skill are you looking for?</b>\n` +
        `<i>Examples: mechanic, cleaner, driver, electrician, cook...</i>`,
        backToMenuKeyboard()
      );
      return;
    }

    if (session.query.skill && !session.query.location && text.split(/\s+/).length <= 2) {
      session.state = 'find_work_awaiting_location';
      await ctx.replyWithHTML(
        `🔎 Got you. Looking for 🛠️ <b>${session.query.skill.toUpperCase()}</b> work.\n\n` +
        `📍 <b>Which area or city are you looking for work in?</b>\n` +
        `<i>Examples: Ikeja, Lekki, Yaba, Nairobi, Accra...</i>`,
        backToMenuKeyboard()
      );
      return;
    }

    await executeJobSearch(ctx, session.query.skill || text, session.query.location || 'any');
  }

  async function executeJobSearch(ctx, skill, location) {
    const tid = ctx.from.id;
    const session = getSession(tid);
    session.state = 'idle';

    // Immediate acknowledgment screen
    let ackMsg = `🔎 <b>Got you.</b>\n\nLooking for:\n`;
    if (skill) ackMsg += `🔧 <b>${skill.toUpperCase()}</b>\n`;
    if (location && location !== 'any') ackMsg += `📍 <b>${location}</b>\n`;
    ackMsg += `\n<i>Let me find matching opportunities...</i>`;

    await ctx.replyWithHTML(ackMsg);

    const matchRes = await matchJobOrPost({
      text: `${skill || ''} ${location && location !== 'any' ? location : ''}`.trim() || 'general work'
    });

    const jobs = matchRes.jobs || [];

    // Filter jobs strictly if skill is specific
    let matchingJobs = jobs;
    if (skill && skill !== 'general') {
      const targetSkill = skill.toLowerCase();
      matchingJobs = jobs.filter(j => {
        const jSkill = (j.skill || '').toLowerCase();
        const jTitle = (j.title || '').toLowerCase();
        return jSkill.includes(targetSkill) || jTitle.includes(targetSkill) || targetSkill.includes(jSkill);
      });
    }

    // ── POLITE RESPONSE WHEN NO MATCH FOUND ──────────────────────────────────
    if (!matchingJobs || matchingJobs.length === 0) {
      const searchedTerm = skill ? `<b>"${skill}"</b>` : 'your requested skill';
      await ctx.replyWithHTML(
        `We apologize, but we currently do not have any open positions or offers matching ${searchedTerm} at this time.\n\n` +
        `💡 <b>Suggestions:</b>\n` +
        `• Try searching for related skills (e.g. <i>cleaner, driver, mechanic, electrician</i>)\n` +
        `• Try broader area locations (e.g. <i>"Ikeja", "Lagos", "Nairobi"</i>)\n` +
        `• Set a reminder to check back as new jobs are posted daily`,
        noResultsKeyboard()
      );
      return;
    }

    // Send individual job cards
    for (let i = 0; i < matchingJobs.length; i++) {
      const job = matchingJobs[i];
      await ctx.replyWithHTML(formatJobCard(job, i + 1), jobCardKeyboard(job.id));
    }

    // Summary footer
    await ctx.replyWithHTML(
      `I found <b>${matchingJobs.length} good match${matchingJobs.length > 1 ? 'es' : ''}</b> for you.\n\n` +
      `🔊 Tap below to hear a quick summary or set a follow-up reminder.`,
      resultsFooterKeyboard()
    );
  }

  async function processEmployerInput(ctx, text) {
    const tid = ctx.from.id;
    const session = getSession(tid);

    const matchRes = await matchJobOrPost({ text, intentHint: 'post_job' });
    const extracted = matchRes.extracted || {};

    const posting = {
      title: extracted.title || 'Informal Job Vacancy',
      skill: extracted.skill && extracted.skill !== 'general' ? extracted.skill : 'general',
      location: extracted.location && extracted.location !== 'any' ? extracted.location : 'Lagos, Nigeria',
      salary: extracted.salary || 'Negotiable',
      company_name: extracted.company_name || 'Kazi Employer',
      type: extracted.type || 'full-time'
    };

    session.postingData = posting;
    session.state = 'hire_worker_confirm';

    // Confirmation step (as requested)
    await ctx.replyWithHTML(
      `📋 <b>Here's what I understood:</b>\n\n` +
      `• <b>Role:</b> ${posting.title}\n` +
      `• <b>Skill:</b> ${posting.skill.toUpperCase()}\n` +
      `• <b>Location:</b> ${posting.location}\n` +
      `• <b>Pay:</b> ${posting.salary}\n` +
      `• <b>Company:</b> ${posting.company_name}\n\n` +
      `Is this information correct?`,
      postJobConfirmKeyboard()
    );
  }

  // ── Launch Bot ─────────────────────────────────────────────────────────────

  bot.launch()
    .then(() => console.log('🤖 Kazi Conversational Bot launched!'))
    .catch(err => console.error('❌ Bot launch error:', err));

  process.once('SIGINT', () => bot.stop('SIGINT'));
  process.once('SIGTERM', () => bot.stop('SIGTERM'));

  return bot;
}

module.exports = { startTelegramBot, transcribeAudioWithGemini };

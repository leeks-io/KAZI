# 🌍 KAZI — Voice-First Informal Economy Job Matching Platform

Kazi is a complete web and Telegram application — a voice-first, two-sided job-matching platform designed for Africa's informal economy. It connects job seekers with companies looking to hire using one shared AI matching engine.

---

## 🏗️ Architecture & Project Structure

The project is structured as a single clean repository separating shared matching logic, Telegram bot integration, database handling, and the React web application:

```
KAZI/
├── database/
│   ├── db.js             # SQLite connection & promisified helper methods
│   ├── initDb.js         # Table initialization & pre-populates 20 African job postings
│   └── kazi.db           # SQLite database file
├── services/
│   └── matcher.js        # 🌟 SHARED CORE MATCHING LOGIC (Gemini AI entity extraction & SQLite fuzzy match)
├── bot/
│   └── telegramBot.js    # Telegraf bot (handles text & voice note notes, /start command)
├── server/
│   └── index.js          # Express Web API server (/api/match, /api/upload-cv, /api/transcribe)
├── src/                  # Vite + React Frontend
│   ├── components/
│   │   ├── Navbar.jsx        # Logo, wordmark, nav links & hamburger
│   │   ├── MobileMenu.jsx    # Full-screen mobile overlay menu
│   │   ├── Hero.jsx          # Video background, stats, stacked word animation
│   │   ├── StatsRow.jsx      # Animated metrics row
│   │   ├── TogglePill.jsx    # Find Work / Post a Job sliding pill toggle
│   │   ├── JobCard.jsx       # Job result card with terracotta border & match checkmarks
│   │   ├── MessageBubble.jsx # User & Kazi chat bubbles
│   │   └── ChatInterface.jsx # Interactive chat box, CV upload & browser mic recorder
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css         # Tailwind styles & Space Grotesk/Inter fonts
├── .env.example          # Environment variable template
├── .env                  # Local environment file (PASTE KEYS HERE)
├── vite.config.mjs
├── tailwind.config.js
├── postcss.config.js
└── package.json
```

---

## 🔑 Environment Variables & Where to Paste Credentials

Open the `.env` file in the root of the project directory and paste your credentials:

```env
# 1. Google Gemini API Key (For AI intent parsing & voice note transcription)
# Get a free API key at: https://aistudio.google.com/
GEMINI_API_KEY=your_actual_gemini_api_key_here

# 2. Telegram Bot Token (For running the Telegram bot process)
# Get your token from @BotFather on Telegram
TELEGRAM_BOT_TOKEN=your_actual_telegram_bot_token_here

# Server Port (Default: 5000)
PORT=5000
```

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Initialize Database & Seed Jobs
Pre-populates the SQLite database with 20 realistic African informal economy jobs across Lagos (Ikeja, Yaba, Lekki, Surulere, Lagos Island), Nairobi (Westlands), Kampala, Kumasi, & Accra in local currencies (₦, KSh, GH₵):
```bash
npm run seed
```

### 3. Run Development Web Server & Frontend
```bash
# Terminal 1: Run Express Server & Telegram Bot
npm start

# Terminal 2: Run Vite React Frontend
npm run dev
```
Open `http://localhost:3000` in your browser.

---

## 🛠️ Production Build & Deployment

### Build Frontend
```bash
npm run build
```
This builds the production React application into the `dist/` folder, which the Express server serves automatically.

### Deploying to Render / Railway / Fly.io / Heroku
1. Push this repository to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of Kazi platform"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```
2. Create a Web Service on your hosting provider (e.g. Render or Railway).
3. Set the build command to: `npm install && npm run build`
4. Set the start command to: `npm start`
5. Add your environment variables (`GEMINI_API_KEY` and `TELEGRAM_BOT_TOKEN`) in your deployment environment settings.

---

## 📱 Features

- **Voice-First & CV Parsing**: Speech-to-text transcription via Gemini API for browser microphone and Telegram voice notes. PDF/DOCX CV text extraction.
- **Shared Matching Engine**: A single shared matching function (`services/matcher.js`) handles all channels without code duplication.
- **Fuzzy Relevance Ranking**: Matches skills (e.g., "mechanic" -> "auto mechanic") and locations with visual checkmarks for matched fields.
- **African Informal Economy Focused**: Tailored for mechanics, cleaners, tailors, drivers, electricians, welders, hairstylists, plumbers, vendors, security guards, carpenters, painters, cooks, and gardeners.
- **High Performance UI**: Deep indigo (#12102A), terracotta (#E8632C), and ochre gold (#F2A03D) color theme built with React, Tailwind CSS, and Framer Motion animations.

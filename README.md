# KAZI — Voice-First Informal Economy Job Matching Platform

Kazi is a web and Telegram application for voice-first, two-sided job matching across Africa's informal economy. It connects job seekers with companies through one shared matching experience.

## Project structure

```text
KAZI/
├── database/       # SQLite connection and seed data
├── services/       # Shared matching logic
├── bot/            # Telegram bot integration
├── server/         # Express API server
├── src/            # Vite + React web application
├── vite.config.mjs
├── tailwind.config.js
├── postcss.config.js
└── package.json
```

## Getting started

```bash
npm install
npm run seed
npm run dev
```

Open the local URL printed by Vite, typically `http://localhost:3000`.

## Environment variables

Create a local `.env` file for services that require credentials. Never commit actual values.

```env
GEMINI_API_KEY=your_gemini_api_key
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
PORT=5000
```

## Features

- Voice and CV intake for job seekers
- Shared job matching across web and Telegram
- Relevance ranking by skills, location, and experience
- Job cards focused on clear next actions
- Support for informal-economy roles and local markets

## Production

Build the web application with:

```bash
npm run build
```

The generated `dist/` directory can be served by the production server or deployed through Vercel using the repository's Vite configuration.

## Security

Keep API keys, bot tokens, passwords, private keys, and credential files out of Git. Review staged changes before pushing.

# Kazi

Kazi is a **voice-first, two-sided job-matching platform for Africa's informal economy**, built for the **StacStart Career Summit 2026 hackathon**.

It helps job seekers discover relevant opportunities and helps employers reach suitable local talent through the channels people already use.

## How it works

1. A job seeker or employer sends a message through **Telegram** or the **web app**.
2. If the message is a voice note, the audio is transcribed.
3. AI extracts intent and structured job details such as role, location, skills, availability, and experience.
4. The shared matching layer searches the job database and ranks relevant opportunities or candidates.
5. Results are returned as clear **job cards** with the key details and next action.

## Repository structure

The codebase is intentionally separated so three contributors can work in parallel:

```text
kazi/
├── shared/       # Shared types, matching, AI orchestration, and data contracts
├── telegram-bot/ # Telegram webhook/polling adapter and bot presentation logic
├── web-app/      # Browser UI, web API integration, and web-specific components
└── README.md
```

Keep channel-specific behavior in `telegram-bot/` or `web-app/`; reusable business logic belongs in `shared/`.

## Tech stack

- **TypeScript / Node.js** for the shared domain layer and service code
- **Telegram Bot API** for conversational job discovery and employer intake
- **React + Vite** for the web application UI
- **OpenAI-compatible speech-to-text and LLM APIs** for transcription and intent extraction
- **SQLite locally or PostgreSQL in deployment** for jobs, profiles, and match data
- **GitHub** for collaboration and hackathon submission

The repository currently contains the clean starter scaffold; implementation can be added independently in each top-level area without changing the collaboration boundaries.

## Getting started

### Prerequisites

- Node.js 20+
- npm, pnpm, or another Node package manager
- A Telegram bot created through [@BotFather](https://t.me/BotFather) if working on the bot
- An OpenAI-compatible API key if enabling transcription or AI extraction
- A local SQLite database or a PostgreSQL instance for persistence

### Setup

```bash
git clone https://github.com/leeks-io/KAZI.git
cd KAZI
cp .env.example .env   # create this locally; never commit .env
npm install
```

Run the relevant workspace once its package scripts are in place:

```bash
npm run dev --workspace web-app
npm run dev --workspace telegram-bot
```

### Required environment variables

Create a local `.env` file with values for the variables needed by the services you run. **Do not put actual values in this README or commit them.**

| Variable | Used by | Purpose |
|---|---|---|
| `OPENAI_API_KEY` | `shared` | Speech transcription and AI intent/detail extraction |
| `OPENAI_API_BASE` | `shared` | Optional OpenAI-compatible API base URL |
| `TELEGRAM_BOT_TOKEN` | `telegram-bot` | Telegram Bot API authentication |
| `TELEGRAM_WEBHOOK_SECRET` | `telegram-bot` | Optional webhook request verification |
| `DATABASE_URL` | `shared`, services | SQLite path or PostgreSQL connection string |
| `WEB_APP_URL` | `telegram-bot` | Public web app URL for links in bot responses |
| `PORT` | services | Local HTTP port |

Never commit API keys, bot tokens, passwords, private keys, or credential files. The repository `.gitignore` excludes common secret and local-environment patterns; review `git diff --cached` before every push.

## Contribution workflow

1. Create a branch from `main`.
2. Keep changes within the relevant area (`shared`, `telegram-bot`, or `web-app`) where possible.
3. Run tests and lint checks before opening a pull request.
4. Use focused commit messages and request review from another team member.

## Hackathon context

Kazi is being prepared as a StacStart Career Summit 2026 hackathon submission. The product goal is to make informal-economy opportunities more discoverable and actionable across African markets, including for users who prefer voice and messaging over conventional job boards.

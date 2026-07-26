# SkillSphere — Peer-to-Peer Skill Exchange Platform

A functional web prototype of SkillSphere: AI-matched skill trading, requests,
session booking, chat, progress tracking, gamification, community groups, and
a live AI learning assistant.

## Project structure

```
skillsphere-project/
├── package.json
├── server.js            Express server: serves the frontend + proxies AI calls
├── .env.example          Copy to .env and add your Anthropic API key
└── public/
    ├── index.html
    ├── css/style.css
    └── js/
        ├── icons.js       Inline SVG icon set
        ├── data.js        Mock user data, categories, badge definitions
        ├── state.js       App state, localStorage persistence, matching algorithm
        ├── render.js       All screen rendering + interaction handlers
        └── app.js         Entry point (boots the app)
```

## Running it in Antigravity (or any IDE)

1. **Open the folder** `skillsphere-project` in Antigravity.
2. **Open the integrated terminal** and install dependencies:
   ```bash
   npm install
   ```
3. **Add your API key** (only needed for the AI Assistant / roadmap / session
   summary features — everything else works without it):
   ```bash
   cp .env.example .env
   # then edit .env and paste your key from https://console.anthropic.com
   ```
4. **Start the server**:
   ```bash
   npm start
   ```
5. Open **http://localhost:3000** in your browser.

Requires Node.js 18 or newer (uses the built-in `fetch`).

## What's real vs. mocked

- **Real**: the AI skill-matching score algorithm, request/accept/reject flow,
  session booking, chat, progress/badge tracking, and — if you add an API key —
  live calls to Claude for the learning roadmap, the AI assistant Q&A, and
  auto-generated session summaries.
- **Mocked**: the 12 partner profiles (no real backend/database of users yet),
  chat replies from partners (canned responses), and video calls (not
  implemented — would need WebRTC).

## Data persistence

The frontend uses `localStorage`, so your profile, requests, sessions, and
chats persist across reloads in the same browser, but only there — there's no
shared database yet. Wiring this to a real database (e.g. the
Firebase Firestore / PostgreSQL + Node/Express API described in the original
project spec) is the natural next step if you want multiple real users.

## Next steps toward the full spec

This prototype covers the core loop end-to-end but doesn't yet include: real
user authentication, a persisted multi-user backend, video meetings (WebRTC),
or the Flutter mobile client. Happy to help scaffold any of those next.

# MockMate

MockMate is a production-oriented full-stack mock interview platform inspired by Omegle-style random pairing. It supports HR and Technical interviews, Redis-based queue matching, JWT auth, WebRTC video, real-time chat, timer/question panels, and MongoDB-backed feedback.

## Stack

- Frontend: React + TypeScript + Vite + Tailwind CSS
- Backend: Spring Boot 3 + JWT + WebSocket/STOMP + Redis + MongoDB
- Realtime: WebRTC for media, WebSocket for signaling and chat

## Folder Structure

```text
backend/   Spring Boot API, auth, matchmaking, signaling, feedback
frontend/  React app with responsive pages and interview UI
```

## Run Locally

1. Start infra:

```bash
docker compose up -d
```

2. Start backend:

```bash
cd backend
mvn spring-boot:run
```

3. Start frontend:

```bash
cd frontend
npm install
npm run dev
```

## Main Flows

- `/` Login / Signup
- `/dashboard` Choose interview type and role preference
- `/waiting` Queue state + retry + cancel
- `/interview/:roomId` Video call, chat, timer, question panel
- `/feedback` Submit structured review

## Important Config Hotspots

- API URL:
  [frontend/src/lib/api.ts](C:/Users/shahi/Documents/Codex/2026-04-27-build-a-production-grade-full-stack/frontend/src/lib/api.ts)
- Frontend env example:
  [frontend/.env.example](C:/Users/shahi/Documents/Codex/2026-04-27-build-a-production-grade-full-stack/frontend/.env.example)
- Backend server config:
  [backend/src/main/resources/application.yml](C:/Users/shahi/Documents/Codex/2026-04-27-build-a-production-grade-full-stack/backend/src/main/resources/application.yml)
- Backend env example:
  [backend/.env.example](C:/Users/shahi/Documents/Codex/2026-04-27-build-a-production-grade-full-stack/backend/.env.example)
- UI styles/theme:
  [frontend/src/styles.css](C:/Users/shahi/Documents/Codex/2026-04-27-build-a-production-grade-full-stack/frontend/src/styles.css)

## Responsive Design Notes

- Mobile-first layout
- Video stack on mobile, side-by-side on large screens
- Minimum 44px touch targets on action controls
- `clamp(...)` based typography for major headings
- Grid/flex layouts with fluid widths only

## Production Notes

- Replace the default JWT secret before deploying
- Add TURN servers for more reliable NAT traversal in production
- Move from the in-memory Spring simple broker to a broker relay when scaling horizontally
- Add persistence for room/session analytics if you want reconnect continuity across pods
"# MockPlatform" 
"# MockMate_Interview" 
"# MockMate_Interview" 
"# MockMate_Interview" 
"# MockMate_Interview" 

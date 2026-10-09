# Catatan Ujian Pintar

Next.js frontend and API backend for a personal study workspace. The backend uses PostgreSQL, Drizzle ORM, and Better Auth.

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a PostgreSQL database, then copy `.env.example` to `.env.local` and set:

   - `DATABASE_URL` — PostgreSQL connection URL.
   - `BETTER_AUTH_SECRET` — a unique secret of at least 32 characters. Generate one with `node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"`.
   - `BETTER_AUTH_URL` — the canonical app URL, for example `http://localhost:3000`.
   - `OPENAI_API_KEY` and `GEMINI_API_KEY` — provider API keys, kept server-side.
   - `OPENAI_QUIZ_MODEL`, `GEMINI_SUMMARY_MODEL`, and `GEMINI_QUIZ_MODEL` — optional model overrides; defaults are `gpt-4.1-mini` and `gemini-3.5-flash` for both Gemini features.

3. Apply the existing Drizzle migrations (the checked-in migrations include the material category column):

   ```bash
   npm run db:migrate
   ```

4. Start the app:

   ```bash
   npm run dev
   ```

## Authentication

Better Auth's email/password endpoints are served at `/api/auth/*`. Use `/api/auth/sign-up/email`, `/api/auth/sign-in/email`, `/api/auth/sign-out`, and `/api/auth/get-session`. Better Auth manages the session cookie; API requests should use the same origin and include cookies.

All study-data endpoints require a signed-in user. Records are scoped to the authenticated user's ID, and quiz answers are scored by the server. Correct answers are excluded from quiz read responses.

Register with a JSON `POST` body such as:

```json
{
  "name": "Rian Pratama",
  "email": "rian@example.com",
  "password": "a-long-unique-password"
}
```

If signup returns `503`, check that `.env.local` contains a real `DATABASE_URL` and a unique `BETTER_AUTH_SECRET` with at least 32 characters, and that PostgreSQL is reachable. Apply the migrations before registering. A browser message that the server cannot be reached means the Next.js app is not running at the configured URL.

After signing in, use the session cookie for study-data requests. API route handlers return `401` when no valid session is present. Keep `BETTER_AUTH_SECRET` private and use a strong, unique value outside local development.

## API

| Method | Endpoint | Purpose |
|---|---|---|
| `GET`, `POST` | `/api/materials` | List materials (optional `?search=`) and create a material record |
| `PATCH`, `DELETE` | `/api/materials/:materialId` | Update material title/subject or delete it |
| `GET`, `POST` | `/api/notes` | List and create notes |
| `GET`, `PATCH`, `DELETE` | `/api/notes/:noteId` | Read, update, and delete a note |
| `GET`, `POST` | `/api/study-sessions` | List sessions (optional `?from=&to=`) and create a session |
| `PATCH`, `DELETE` | `/api/study-sessions/:sessionId` | Update or delete a session |
| `GET`, `POST` | `/api/quizzes` | List quizzes or create a quiz with its questions |
| `GET`, `DELETE` | `/api/quizzes/:quizId` | Read a quiz without answer keys or delete it |
| `GET`, `POST` | `/api/quizzes/:quizId/attempts` | List attempts or submit answers for server-side scoring |
| `GET`, `PATCH` | `/api/preferences` | Read and update theme and notification preferences |
| `POST` | `/api/ai/summary` | Generate a draft summary with Gemini from supplied note text |
| `POST` | `/api/ai/quiz` | Generate validated multiple-choice questions with OpenAI from supplied note text |

Request validation errors return `400`, unauthenticated requests return `401`, and inaccessible or missing records return `404`. Successful responses use a `{ "data": ... }` envelope.

## Data and storage notes

Drizzle schema and migration configuration live in `lib/db/schema.ts` and `drizzle.config.ts`. User-owned records cascade on account deletion.

The frontend uses the Better Auth React client for sign-up, sign-in, session state, profile-name updates, and sign-out. After authentication it loads the signed-in user's materials, notes, study sessions, quizzes, attempts, and preferences from the API. Material, note, quiz attempt, schedule, theme, and notification changes are saved through the API.

Material endpoints currently persist source URLs or file metadata only. Selecting a file in the frontend does not upload its bytes, and source URLs are not fetched or extracted. AI generation therefore operates on text in the user's note editor; it does not read linked or uploaded material contents. Gemini drafts summaries, and OpenAI generates quizzes with Gemini as a fallback when OpenAI is rate-limited or temporarily unavailable. Generated summaries remain editable until saved; generated questions are validated and stored through the quiz API. Provider keys are accessed only by server route handlers and must not use a `NEXT_PUBLIC_` prefix.

## Checks

```bash
npm run lint
npm run build
```

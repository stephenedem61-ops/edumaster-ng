# EduMaster NG

A Nigerian-first teacher productivity platform starter. It includes a responsive dashboard, lesson-note generation, examination question generation, marking-scheme generation, browser-based resource preview, a starter class register, an AI API route, and an initial Supabase schema.

## 1. Requirements

- Node.js 20.9 or newer
- npm
- An OpenAI API key for AI generation
- A Supabase project for production accounts and cloud data

## 2. Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000.

The dashboard and browser-preview features can be explored without Supabase. AI generation will display a setup message until `OPENAI_API_KEY` is configured.

## 3. Configure AI

Add your OpenAI API key to `.env.local`:

```env
OPENAI_API_KEY=your_server_side_key
```

Never add the secret to a `NEXT_PUBLIC_` variable or commit `.env.local` to GitHub. Restart the development server after editing environment variables.

## 4. Configure Supabase

1. Create a Supabase project.
2. Open the SQL Editor.
3. Review and run `supabase/schema.sql`.
4. Add the project URL and anon key to `.env.local`.
5. Connect Supabase Auth and implement the production account flow before collecting real user data.

The current visual MVP stores preview documents, class entries and preferences in browser local storage. This is not cloud storage and is not suitable for real student records. The Supabase schema is the starting data model, not a claim that cloud persistence is already wired into every screen.

## 5. Deploy to Vercel

1. Create a GitHub repository and push this project.
2. Import the repository into Vercel.
3. Add `OPENAI_API_KEY` and `NEXT_PUBLIC_APP_URL` in Vercel Project Settings → Environment Variables.
4. Add Supabase environment variables after configuring the Supabase project.
5. Deploy and test the live URL.

## 6. Before accepting payments or school data

This is an MVP foundation, not yet a production-ready commercial service. Before public paid launch, complete:

- Supabase-backed authentication and school membership flows.
- Server-side persistence and access-control tests.
- Payment gateway merchant onboarding, signed webhook verification, transaction verification and subscription enforcement.
- Usage quotas, rate limiting, abuse protection and cost monitoring for AI.
- DOCX/PDF export (current download is plain text).
- Curriculum source verification, licensing review and versioning.
- Privacy notice, retention/deletion controls, backups and security review.
- Testing with Nigerian teachers and school administrators.

Do not enter real children's personal information into the local preview. Protect student records and follow applicable Nigerian data-protection requirements. Have legal/privacy obligations reviewed before launch.

## 7. Nigerian education content

The generators create original draft content. They do not establish official NERDC, WAEC, NECO or JAMB endorsement. Load verified curriculum material only after recording its source, version, permitted use and update date. Teachers must review generated questions, answers and lesson notes before use.

## Project structure

```text
app/
  api/generate/route.ts
  lesson-planner/
  exam-generator/
  marking-assistant/
  classes/
  resources/
  settings/
components/
  AppShell.tsx
  Generator.tsx
supabase/
  schema.sql
```

## Current status

The UI and AI-generation API route are implemented. Cloud authentication, cloud persistence, payment processing, verified curriculum imports, and production-grade export are explicitly pending. Do not advertise those pending features as live.

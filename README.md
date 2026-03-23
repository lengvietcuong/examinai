# Examinai

AI-powered IELTS practice platform with writing assessment, speaking practice, and an IELTS knowledge assistant.

## Features

- **Writing Practice** — Timed IELTS Writing tests (Task 1 & 2) with multi-expert AI feedback covering task response, coherence, lexical resource, and grammar. Includes corrected and improved essays.
- **Speaking Practice** — Live conversation with an AI examiner simulating IELTS Speaking Parts 1, 2, and 3 with real-time speech-to-text and text-to-speech.
- **Knowledge Assistant** — Chat with an AI that can search a curated IELTS knowledge base covering rules, scoring, tips, and exam format.

## Tech Stack

- **Framework:** Next.js 16 (App Router), React 19, TypeScript
- **AI:** Vercel AI SDK v6, Fireworks AI (minimax, qwen3-vl, llama-70b), Deepgram TTS
- **Database:** Supabase (PostgreSQL, Auth, Storage), Drizzle ORM
- **UI:** Tailwind CSS 4, shadcn/ui, base-ui, Lottie animations

## Getting Started

### Environment Variables

Create `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=
DATABASE_URL=
FIREWORKS_AI_API_KEY=
DEEPGRAM_API_KEY=
```

### Local Development

```bash
pnpm install
pnpm dev
```

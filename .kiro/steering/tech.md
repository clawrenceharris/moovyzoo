---
inclusion: manual
---

# Tech Steering – Zoovie

## Stack

- Frontend: Next.js + TypeScript + Tailwind
- Backend: Supabase
  - Auth: Supabse Authentication (email/password for MVP)
  - Data: Supabase (social data), Realtime Database (presence + party sync) + TMDB (Movie Data)
  - Storage: Supabase Storage for media
- State: TanStack Query or direct listeners (hook wrappers)
- Tests: Vitest (unit) TDD methodology
- Deploy: Vercel

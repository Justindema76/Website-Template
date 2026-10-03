# Public Website

This is the reusable public website application.

It keeps the page-renderer, reusable blocks, global styles, header/footer controls, blog support and project-request drawer from the working site structure, but contains no client-specific content.

## Local setup

```bash
cp .env.example .env
npm install
npm run dev
```

Public Supabase values use the `VITE_` variables. Privileged database keys are server-only and must be configured in the deployment environment.

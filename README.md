# Website Template

Reusable website + admin starter based on the proven structure used for JustinDeMatteis.com.

## Apps

- `website/` — public Vite/React website
- `admin/` — protected website management app and API
- `supabase/` — clean database migrations / setup
- `docs/` — setup and deployment notes

## Template rules

- No production secrets are stored in this repository.
- No client-specific content or live data belongs in the template.
- Frontend and admin are separate apps in the same repository.
- Each app can be deployed independently.
- Configure environment variables from the included `.env.example` files.

## Intended workflow

1. Copy this repository for a new client.
2. Add branding, content and required service-specific features.
3. Create/configure the client Supabase project.
4. Deploy the website and admin separately.

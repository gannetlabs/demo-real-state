# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server at localhost:3000
npm run build    # Production build + TypeScript check
npm run lint     # ESLint
```

There are no tests. `npm run build` is the primary correctness check — it runs TypeScript and catches type errors across all pages.

## What This Is

**PropIA** — a sales demo MVP for a SaaS platform targeting real estate agencies. It demonstrates AI-powered multichannel content generation from a single property upload. State lives in Zustand stores persisted to localStorage; images are generated server-side via OpenAI and stored in Supabase Storage.

Demo credentials: `martin@garciaasociados.com` / `demo2026`

## User Flow (7 screens)

```
/login → /dashboard → /dashboard/propiedades/nueva
  → /dashboard/generar/[propertyId]      (8-step animation + real API call to /api/generate-images)
  → /dashboard/contenido/[propertyId]    (preview + approve/edit/regenerate, shows real images)
  → /dashboard/calendario/[propertyId]   (weekly schedule, day selectors)
  → /dashboard/confirmacion/[propertyId] (confirm + success modal with confetti)
```

All post-login screens live under `src/app/(dashboard)/dashboard/` and share the layout in `src/app/(dashboard)/layout.tsx`, which enforces auth via `useAuthStore`.

## Architecture

### State (Zustand + localStorage)

Four stores in `src/store/`:

| Store | localStorage key | Responsibility |
|-------|-----------------|----------------|
| `use-auth-store` | `propia-auth` | Login state + mock user |
| `use-property-store` | `propia-properties` | Property CRUD; seeded with 3 mock properties |
| `use-content-store` | `propia-content` | Generated content keyed by `propertyId` |
| `use-calendar-store` | `propia-calendar` | Weekly schedule keyed by `propertyId` |

The property store's Zustand initial state is `mockProperties` from `src/data/mock-properties.ts` — if localStorage is cleared, the 3 demo properties reappear automatically.

### Content Generation

Copy is always mock. Images are real (generated server-side by OpenAI or reused from Supabase).

**Mock copy** — `src/data/mock-content.ts` exports:
- `generateMockContent(property)` — returns 7 `GeneratedContent` objects (one per platform) with copy interpolated from property fields
- `alternateContent` — swap-in text used when the user clicks "Regenerar"

**Image generation** — `POST /api/generate-images` (`src/app/api/generate-images/route.ts`):
1. Receives `{ property, referenceImageDataUrl }` (base64 data URL of the first uploaded photo).
2. Calls OpenAI `gpt-image-1` via `src/lib/openai.ts` to generate a hero image.
3. Resizes it to each platform's dimensions via `sharp` (`src/lib/image-resize.ts`, dimensions in `src/data/platform-dimensions.ts`).
4. Uploads all 7 variants to Supabase Storage and returns a `Record<ContentPlatform, string>` of public URLs (`src/lib/supabase.ts`).

The generation page fires this API call in parallel with the 8-step animation, merges the image URLs into the mock content array, and navigates when both complete.

**Demo mode** — set `USE_DEMO_IMAGES=true` in `.env.local` to skip OpenAI entirely: the API route lists the bucket and returns the most recently generated set of 7 images. Useful during sales presentations to avoid token costs. Clear or set to `false` to re-enable real generation.

**Property photos** are stored as base64 data URLs (`data:image/...;base64,...`) in the property store — NOT blob URLs. This is required because blob URLs die on page reload and the API route needs the raw bytes to send to OpenAI.

### Platform Content Types

Seven `ContentPlatform` values: `web_listing`, `blog_article`, `instagram_carousel`, `instagram_story`, `facebook_post`, `linkedin_post`, `tiktok_script`. Platform metadata (display name, icon name, hex color) lives in `src/data/platforms.ts`.

### Brand Icons

`lucide-react` v1.8 does not include social brand icons. Custom SVG components for Instagram, Facebook, LinkedIn, and TikTok are in `src/components/icons/brand-icons.tsx`. Always import brand icons from there, never from lucide.

### Styling

- **Fonts**: Playfair Display (`--font-playfair`, apply with `font-heading` class) for headings; DM Sans (`--font-dm-sans`) for body
- **Brand colors**: Navy `#1a2332`, Gold `#d4a853`, Teal `#2dd4bf` — defined as CSS custom properties in `globals.css`
- **Utility CSS classes** in `globals.css`: `btn-shimmer` (gold shimmer animation for CTAs), `glow-gold` (pulsing shadow), `animate-float`, `cursor-blink`, `gradient-mesh`, `confetti-piece`
- Tailwind v4 with shadcn/ui v4. Add components: `npx shadcn@latest add <component>`

### Motion (Framer Motion v12)

Animations use `motion/react`. When defining `Variants`, do not use `ease: "string"` inside `transition` — TypeScript will reject it. Use `duration` only or numeric easing values.

### StepIndicator

A 5-step progress bar (Datos → Generación → Contenido → Calendario → Confirmación) is defined inline in each of the 4 flow pages. If extracted, move to `src/components/shared/step-indicator.tsx`.

### Calendar Default Schedule

`useCalendarStore.createDefaultSchedule()` maps platforms to days on first visit: Facebook→Mon, Instagram Story→Tue, Instagram Carousel→Wed, LinkedIn→Thu, TikTok→Fri.

### Image Server Libs (`src/lib/`)

| File | Responsibility |
|---|---|
| `openai.ts` | OpenAI singleton + `generateHeroImage(property, referenceDataUrl?)` — calls `gpt-image-1` |
| `supabase.ts` | Supabase server-side client (service role) + `uploadGeneratedImage()` + `listLatestDemoImages()` |
| `image-resize.ts` | `resizeForPlatform(buffer, platform)` — sharp resize/crop to platform dimensions |

### Environment Variables

Required in `.env.local` (see `.env.local.example` for a template):

| Variable | Purpose |
|---|---|
| `OPENAI_API_KEY` | Server-side only. Calls `gpt-image-1`. |
| `SUPABASE_URL` | Server-side. Self-hosted Supabase endpoint. |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side. JWT for uploading to Storage. |
| `NEXT_PUBLIC_SUPABASE_URL` | Client-side. Used by `next/image` to render Supabase-hosted images. |
| `SUPABASE_STORAGE_BUCKET` | Bucket name (default: `propia-generated-images`). |
| `USE_DEMO_IMAGES` | Set to `true` to skip OpenAI and reuse existing bucket images. |

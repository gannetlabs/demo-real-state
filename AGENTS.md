<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Project: PropIA

Sales demo MVP for a real estate SaaS. Read `CLAUDE.md` for the full architecture reference.

### Key constraints

- **No test suite.** Run `npm run build` to validate TypeScript across all pages — this is the correctness gate.
- **Branch per feature.** Every new feature gets a fresh `feature/<slug>` branch off `main`. After implementation completes (and before opening the PR), update `CLAUDE.md` and this `AGENTS.md` to reflect new files, endpoints, conventions, or store actions.
- **Framer Motion v12**: import from `motion/react`, not `framer-motion`. Never use `ease: "string"` in Variants `transition` objects — TypeScript rejects it.
- **Brand icons**: `lucide-react` v1.8 lacks social icons. Import Instagram/Facebook/LinkedIn/TikTok from `src/components/icons/brand-icons.tsx`.
- **Property photos**: stored as base64 data URLs in Zustand, never blob URLs. Blob URLs die on page reload.
- **Tailwind v4**: use `bg-linear-to-b` (not `bg-gradient-to-b`), `aspect-[w/h]` syntax for custom ratios.
- **Demo reset**: `/dashboard/configuracion` exposes a reset action backed by `POST /api/reset-demo`, which calls `pruneStorageKeepingLatestSet` in `src/lib/supabase.ts`. Each persisted store (`use-property-store`, `use-content-store`, `use-calendar-store`) has a `reset()` action; `use-auth-store` does not.

### Calendar drag-and-drop

Step 4 uses `@dnd-kit/core` (`DndContext` + `useDraggable` + `useDroppable`) over a 13-hour timeline (08:00–20:00, 1 h granularity). Collision detection: `closestCenter`. Drop targets are `${day}__${hour}` slots; on drop, call `useCalendarStore.movePublicationSlot(propertyId, pubId, day, time)` — it updates day and time atomically. Same-slot collisions stack via `(offsetX, offsetY)` per stack index sorted by id. See `src/app/(dashboard)/dashboard/calendario/[propertyId]/page.tsx` and `src/store/use-calendar-store.ts`.

**Zustand selector rule**: select raw sub-state (`s.scheduleByProperty[propertyId]`), never a getter method (`s.getSchedule`) — methods are stable references and won't trigger re-renders when data changes. Use a module-level `EMPTY_*` constant as the nullish-coalescing fallback to avoid creating a new array each render.

### Content preview approval semantics

`getApprovedCount` (in `use-content-store`) counts only `status === "approved"`. The `"edited"` status does not count — saving an edit requires the user to re-approve. The content preview page (`contenido/[propertyId]`) uses controlled Tabs: approving auto-advances to the next tab in sequence; TikTok (last) stays put. Callback chain: `handleApproved` (page) → `onApproved` prop (ContentCardWrapper → ActionsBar).

### Image generation pipeline

`POST /api/generate-images` → `src/lib/openai.ts` → `src/lib/image-resize.ts` → `src/lib/supabase.ts`.
Controlled by `USE_DEMO_IMAGES` env var (see `CLAUDE.md` for details).

### Environment

Requires `.env.local` with 6 variables — see `.env.local.example`.

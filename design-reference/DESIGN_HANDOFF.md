# Handoff: House of Pochi — Murder Mystery Night (mobile web experience)

## Overview
A mobile-first, single-page "secret dossier" web experience for a surprise Murder Mystery Night at a birthday party. Guests open a personalized link on their phone: welcome screen → confidential profile (hidden role) → "Gerard never arrived" alert → a growing feed of case clues (unlocked live by the host) → a suspect message box ("Yo sé quién lo mató") → a final reveal button (host-gated) with the "Francisca — The Last Vampire" reveal. A hidden host view (`?host=1`) lets the host release clues, toggle the final reveal, and edit the late-arrivals summary text — all synced live across every guest's phone over the internet (no login, no app install).

## About the Design Files
The files in this bundle are **design references built as an interactive HTML/React prototype** (a single "Design Component" file, `House of Pochi.dc.html`, running on a custom no-build runtime — `support.js` + the bundled design-system files). They are not production code to copy verbatim. The task is to **recreate this design and its behavior in the target codebase's environment** — likely a simple static site or lightweight React/Next app, using whatever hosting/realtime approach the team prefers. If no environment exists yet, a plain static HTML+JS site (or a minimal React app) is the most appropriate choice given the scope (no backend, one shared realtime channel).

## Fidelity
**High-fidelity.** Colors, type, spacing, copy (in Spanish), animations, and interaction states are final as designed. Recreate pixel-close using the design tokens below; don't restyle.

## Screens / Views

The experience is one continuous vertical scroll on a guest's phone (max-width ~480px, centered), gated behind two toggles: `entered` (has the guest tapped past welcome) and which stage of the story is visible. There is also a separate Host view reachable by URL param.

### 1. Welcome (`!entered`)
- Full-height centered column, text-center, padding 40px/28px, gap 22px.
- Kicker: "Top Secret" — 12px, letter-spacing .2em, uppercase, 70% opacity.
- Stamp badge: "CONFIDENCIAL" — inline-flex, 3px solid accent border, accent-colored text, Barlow/heading font weight 600, 15px, letter-spacing .12em, padding 10px 22px, `transform: rotate(-6deg)`, entrance animation `hopStampIn` (0.6s: scale 1.7→0.92→1, opacity 0→1, rotate settles at -6deg).
- H1: "Bienvenida,\n{{guestName}}" — Playfair Display, weight 700, 32px, line-height 1.1.
- Subtext, 14px, 75% opacity, max-width 300px: "Tu perfil ya está listo en el expediente. Esta noche, nada es lo que parece."
- Primary button, full-width up to 280px, padding 16px, font-size 15px: "Entrar al expediente" → sets `entered = true` (persisted in `sessionStorage`).
- `guestName` (and role/detail below) come from URL query params (`?name=`, `?role=`, `?detail=`) so each guest's link is personalized — this is the "each guest's QR/profile is part of the narrative" mechanic.

### 2. Header bar (once entered)
- Sticky-feeling top row (not actually sticky in current build — consider making it sticky in production), flex row, justify-between, padding 16px 20px 4px.
- Left: "House of Pochi · {{editionLabel}}" small caps label, 11px, 62% opacity text color.
- Right: two ghost buttons — "Resumen" (text-only, accent-800 color, opens summary dialog) and "Actualizar" (bordered pill, ↻ icon that spins via `hopSpin` animation while refreshing, 11px label).

### 3. Profile card
- `.card.blueprint.elev-md` (see Design Tokens/Components) with corner registration marks, padding 18px.
- Kicker: "Perfil confidencial".
- H1: guest name, Playfair Display 800, 30px.
- Role chip: outlined pill, 11px uppercase, accent-800 text/border, e.g. "Testigo del círculo íntimo" (from `?role=`).
- Body copy 14px, 82% opacity: the guest's hidden-role detail text (from `?detail=`).
- Footnote, italic, 12px, 55% opacity: "Tu rol es confidencial. No lo compartas con nadie... todavía."
- Entrance: `hopFadeUp` (translateY 16px→0, opacity 0→1, 0.5s).

### 4. "Gerard never arrived" alert strip
- Flex row, gap 14px, padding 14px 16px, 1px solid divider border (no card frame — a plain bordered strip).
- Left: small "ALERTA" stamp (2px accent border, accent text, rotate -5deg, 11px).
- Right: title "Gerard nunca llegó." (Playfair 700, 17px) + subtext "Estaba confirmado. El lugar donde debía estar sigue vacío." (12px, 65% opacity).

### 5. Clues feed ("Pistas del expediente")
- Section label: small caps kicker "A medida que avanza la noche" + H2 "Pistas del expediente" (Playfair 800, 24px).
- Empty state (0 clues released): italic 13px, 60% opacity: "Aún no hay pistas liberadas. Toca 'Actualizar' más tarde."
- Each unlocked clue is a full-width tappable `.card.blueprint.elev-sm` row: 72×72px photo slot (image-slot component, rect shape) + text column (kicker "Evidencia 0N", a tag pill e.g. "Digital"/"Física", title, one-line teaser). The most recently unlocked card carries a small pulsing "Nueva" ribbon badge (top-right, accent bg, `hopPulse` animation).
- Tapping a card opens a modal dialog (`.dialog-backdrop` + `.dialog`) with a larger 4:3 photo slot and the full clue description text.
- Content model — 4 clues in the current design (host can release/retract from 0–4, one at a time):
  1. "El QR perdido" (Digital) — QR found taped under a chair, led to a blurry photo of Gerard arriving.
  2. "La invitación rota" (Física) — Gerard's invitation found torn in two near the bar, dark red stain on one half.
  3. "El mensaje sin enviar" (Digital) — an unsent text on a phone found in the hallway: "Fran, necesito hablar cont..."
  4. "El baúl del quincho" (Física) — something wearing Gerard's clothes found inside a trunk; doesn't move, doesn't breathe.
  (Full copy is in the source file's `EVIDENCE` array — reuse verbatim, in Spanish, no graphic/gore language.)

### 6. Suspect box ("¿Quién lo hizo?")
- `.card.blueprint.elev-md`, centered text, padding 18px.
- H2: "¿Quién lo hizo?" (Playfair 800, 22px).
- Before sending: a textarea (min-height 80px) placeholder "Escribe aquí tu sospecha..." + primary block button "Yo sé quién lo mató" (disabled while textarea is empty).
- After sending: a "SOSPECHA REGISTRADA" stamp badge (same stamp visual language as CONFIDENCIAL/ALERTA) + the submitted text echoed back in quotes, 13px, 70% opacity.
- This is a lightweight guest→host message, not a public vote tally.

### 7. Final reveal gate
- Centered column, padding-top 6px.
- If host has not enabled the reveal: italic, 50% opacity, centered: "El expediente final se abrirá cuando la fiesta lo decida."
- If host enabled it but guest hasn't opened it: a pulsing primary block button (`hopPulse` loop), max-width 320px, padding 18px: "Ver la revelación final".
- On tap, reveals one of two variant layouts (host-selectable design-time prop, not per-party toggle):
  - **Editorial variant**: centered text block — "CASO CERRADO" stamp, "FRANCISCA" (Playfair 900, 40px), "The Last Vampire" label bordered top/bottom (16px, uppercase, accent-800, letter-spacing .1em), a square 1:1 portrait photo slot (max-width 320px, duotone), body copy "Gerard nunca desapareció. Francisca le succionó todo — su brillo, su carisma, su lugar en el escenario." (15px), italic tagline "End of issue. Begin the afterparty." (16px).
  - **Cinematic variant**: full-bleed portrait photo as background (duotone), bottom-anchored gradient-scrim overlay fading to the page background, flickering H1 "FRANCISCA / THE LAST VAMPIRE" (`hopFlicker` animation — opacity flickers like a failing light, 2.4s loop), thin accent divider rule, same body copy + tagline over the scrim.

### 8. Summary dialog (for late arrivals)
- Modal `.dialog`, kicker "Para quien llegó tarde", title "Resumen del expediente", body = plain text authored by the host in the backoffice (whitespace preserved), single "Cerrar" primary button.
- Default seed text (host can overwrite): "Gerard Way fue anunciado como invitado especial y nunca llegó al salón. Desde entonces han aparecido pistas por todo el quincho. La fiesta sospecha de todos. El expediente sigue abierto."

### 9. Host view (`?host=1` in the URL)
Purely a private control panel — same visual language, not guest-facing.
- Header: "Backoffice" (Playfair 700, 34px) + "House of Pochi — control del expediente" subtitle.
- Card "Evidencia": big counter "{{n}} / 4 pistas liberadas" + two side-by-side buttons "Liberar pista" / "Retirar" (disabled at bounds).
- Card "Revelación final": explanatory copy + one toggle button "Habilitar revelación final" / "Deshabilitar revelación final" (fills solid accent when enabled).
- Card "Resumen (para quien llega tarde)": textarea bound to the summary text guests see.
- Card "Horario de referencia": 5 labeled text inputs — Inicio de la fiesta, Gerard no llegó, Primera evidencia, Votación, Revelación. (Currently reference-only for the host; not wired into guest-side timing logic.)
- Card "Acceso": explains guests get a shared link with optional `?name=&role=&detail=` query params per person, shows the current URL in a monospace box, and a link to preview the guest view.

## Interactions & Behavior
- **Entry flow**: `sessionStorage` flag (`hop_entered`) so returning to the tab skips the welcome screen for that session.
- **Personalization**: guest name/role/detail read from URL query params at load (`?name=Ana&role=...&detail=...`); default fallback role/detail copy is generic ("Testigo del círculo íntimo...").
- **Clue reveal animation**: cards fade+slide up (`hopFadeUp`) on mount; newest card shows a pulsing "Nueva" ribbon until the guest opens it (tapping marks it seen, stored per-device in `localStorage`).
- **Suspect submission**: textarea is local-only in this prototype (persisted to `localStorage` on this device) — in production this should actually deliver the guest's message to the host (e.g. write to the same realtime channel/topic, or a simple backend endpoint), not just visually mark "sent."
- **Reveal gating**: guest cannot open the final reveal until the host flips "Habilitar revelación final"; once enabled, the CTA pulses to draw attention. Reveal variant (editorial vs. cinematic) is a build-time choice, not runtime-switchable by the host.
- **Cross-device live sync (important, non-obvious)**: there is no real backend. The prototype uses a public pub/sub relay (ntfy.sh) as a stand-in — the host's actions (release/retract clue, toggle reveal, edit summary) POST a JSON snapshot to a shared topic; every guest phone holds an SSE (Server-Sent Events) subscription to that same topic and applies incoming snapshots live, with a polling fallback (every 8s) and forced reconnect+poll on `visibilitychange`/`focus` (phones suspend SSE when the screen locks or app backgrounds, so this is required for clues to reliably "arrive" without the guest manually refreshing). **For production, replace this with a real realtime backend** (e.g. Firebase Realtime DB/Firestore listeners, Supabase Realtime, Pusher, or a small WebSocket server) — ntfy.sh is a public, unauthenticated, rate-limited demo channel and should not be relied on for the real event.
- **Manual refresh fallback**: "Actualizar" button lets a guest force a re-poll if live sync lags — keep this even after moving to a real backend, as a safety net during a live event on spotty venue wifi.
- **No push notifications**: intentional design constraint — everything is either live-pushed while the tab is open/foregrounded, or picked up on manual refresh/refocus.

## State Management
Guest-side state: `entered` (bool, sessionStorage), `evidenceCount` (0–4, mirrors host's released-clue count, localStorage + remote), `seenEvidence` (per-device, which clue index the guest has opened, for the "Nueva" badge), `voteDraft`/`voteSent` (per-device, local — needs real delivery in production), `revealEnabled` (host-controlled, remote), `revealedOpen` (per-device, has this guest tapped to view it), `showSummary`/`activeEvidenceId` (transient UI/modal state), `summaryText` (host-controlled, remote), `guestName`/`guestRole`/`guestDetail` (from URL params, static per link).

Host-side state: same `evidenceCount`, `revealEnabled`, `summaryText` as above (source of truth it publishes), plus local-only `schedule` (5 time strings, reference display, not functionally wired).

State transitions are all manual/host-triggered — there is no timer-based auto-advance; the host explicitly presses buttons to release each clue and to enable the reveal.

## Design Tokens
Custom dark theme values layered on top of the bound "Industry" design system's component classes/CSS variables (`.card`, `.blueprint` + corner marks, `.btn`, `.dialog`, `.input`, `.field`, `.tag` come from that system's `styles.css` and `_ds_bundle.js` — see Assets). The screen overrides the system's light steel palette with these custom CSS variables scoped to the page's root div:

- `--color-bg`: `#0b0809` (near-black)
- `--color-surface`: `#171113` (card background)
- `--color-text`: `#f3e8dd` (warm cream — primary text)
- `--color-accent` / `--color-accent-2`: `#b21230` (wine/crimson)
- `--color-accent-600`: `#8f0f27`
- `--color-accent-700`: `#730c1f`
- `--color-accent-100`: `#2a0d12`
- `--color-accent-800`: `#f2c9cf` (soft pink-cream — used for small caps labels/kickers)
- `--color-accent-900`: `#160607`
- `--color-divider`: `color-mix(in srgb, #f3e8dd 18%, transparent)`
- Also referenced directly in a couple of spots: `--hop-wine: #4a0d18`, `--hop-crimson: #b21230`, `--hop-cream: #f3e8dd`

Typography:
- `--font-display`: `'Playfair Display', 'Barlow Condensed', serif` (loaded from Google Fonts, weights 500/700/900 + italic 600) — used for all editorial headlines and the italic taglines.
- Body/UI text and small-caps kickers use the Industry design system's own `--font-heading` (Barlow Condensed) / `--font-body` (Barlow) tokens — do not hardcode a different body font.

Background texture: a fixed full-viewport layer (z-index 0, non-interactive) combining two soft radial wine-colored glows (top-right and bottom-left, low opacity) with a repeating 1px horizontal line pattern at 3% text-color opacity — a subtle "paper grain / dossier" texture. Reproduce as a fixed absolutely-positioned div behind content, not a body background-image asset.

Animations (all CSS `@keyframes`, reproduce with your framework's animation/transition system):
- `hopStampIn` — 0.6s ease-out: opacity 0→1, scale 1.7→0.92→1, rotate settles ~-6/-7deg. Used for every "stamp" badge (CONFIDENCIAL, ALERTA, SOSPECHA REGISTRADA, CASO CERRADO).
- `hopFadeUp` — 0.4–0.5s ease-out: translateY 16px→0, opacity 0→1. Used on card/section entrances.
- `hopFlicker` — 2.4s ease-in-out infinite: opacity oscillates (1 → .35 → .9 → .25 → 1) to mimic a failing light. Used only on the cinematic reveal headline.
- `hopPulse` — 1.4–1.8s ease-in-out infinite: opacity .6↔1 and scale 1↔1.25. Used on the "Nueva" badge dot and the pulsing final-reveal CTA.
- `hopSpin` — 0.6s linear infinite: full rotation. Used on the ↻ refresh icon while refreshing.

Layout: single column, `max-width: 480px`, centered (`margin: 0 auto`), `min-height: 100vh`. Section padding generally `24px` top/bottom, `20–26px` sides. Cards use `padding: 18px`. Gaps between stacked sections: 16–22px.

## Assets
- **Industry design system** (bound design system for this project) — provides `.card`/`.blueprint` (+ corner registration-mark `<i>` elements), `.btn` variants, `.dialog`/`.dialog-backdrop`, `.input`/`.field`, `.tag`, and the base color/type/spacing CSS variables this design layers custom colors on top of. Its stylesheet (`styles.css`) and JS bundle (`_ds_bundle.js`) are included in this handoff folder under `_ds/`. The design system's own guide/readme is included as `_ds/README.md` for reference — recreate its tokens/components in the target codebase's own design system if one exists, rather than shipping this CSS file as-is.
- **`image-slot.js`** — a drag-and-drop placeholder web component used everywhere a photo goes (profile-adjacent imagery, each clue's thumbnail + detail photo, the final reveal portrait). In production, replace every instance with a real `<img>` sourced from actual party photography — there are 4 clue photos + 1 reveal portrait + 1 optional "empty seat"/cover photo needed. Placeholder copy for each: "Foto del expediente" (cover), "Foto" (clue thumbnails), "Foto de la evidencia" (clue detail), "Retrato de Francisca" (reveal, both variants).
- Google Fonts: Playfair Display (weights 500, 700, 900, italic 600) loaded via `@import url(...)` — should be self-hosted or loaded via `<link>` in production for reliability at a live event with venue wifi.
- **ntfy.sh** (external, third-party) — used only as a placeholder pub/sub relay for the live sync prototype (topic name `house-of-pochi-francisca-vampira-2026`). Not an asset to ship; see the sync note under Interactions & Behavior.

## Screenshots
Included in `screenshots/` (phone-width captures of the live prototype):
- `01-flow.png` — Welcome screen (personalized greeting + "Entrar al expediente" CTA + CONFIDENCIAL stamp).
- `03-flow.png` — Guest view after entering: profile card, "Gerard nunca llegó" alert strip, and the start of the clues feed.
- `04-flow.png` — Host backoffice (`?host=1`): clue counter/release controls, reveal toggle, and summary textarea.

These are reference captures only — always cross-check exact spacing/type against the live HTML file, since a screenshot can shift slightly with viewport width.

## Known Rough Edges / Things to Decide in Production
- **Realtime backend**: as noted above, ntfy.sh is a placeholder. Pick a real provider before the actual event and load-test with the expected number of guest phones on venue wifi.
- **Suspect message delivery**: "Yo sé quién lo mató" currently only saves to the guest's own device (`localStorage`) — it does not actually reach the host. Needs a real write path (e.g. POST to the same realtime channel/topic with a `type: 'suspicion'` payload, or a simple form endpoint) plus a way for the host to read incoming messages (not designed yet — would need a new "Sospechas" list in the host view).
- **Schedule fields in the host view** are currently for the host's own reference only (displayed, editable, persisted) and are not wired to any automatic guest-facing countdown or auto-advance — all stage changes are manual host button-presses.
- **Reveal variant** (editorial vs. cinematic) is chosen once at build/design time via a component prop, not a runtime host toggle — decide which one ships, or add a host control if both should stay available.
- **Header bar** is not pinned/sticky in the current build; consider making "Resumen"/"Actualizar" sticky so they're reachable from anywhere in the scroll on a long guest session.
- **Accessibility**: stamp/badge text relies on color + rotation for emphasis, not just semantics — verify contrast (crimson on near-black) meets at least WCAG AA for body-sized text, and that disabled states (e.g. suspect textarea empty) are announced to screen readers.

## Files
- `House of Pochi.dc.html` — the full design/prototype (guest experience + host view in one file). This is the primary reference for exact markup structure, inline styles, and the interaction logic (state, sync, animations) described above.
- `_ds/` — the bound Industry design system's stylesheet, JS bundle, and guide (copied here for reference; do not ship this CSS wholesale — recreate equivalent tokens/components in the target codebase's own system).
- `image-slot.js` — the drag-and-drop image placeholder component referenced by the prototype (for behavior reference only; production should use real images).
- `screenshots/` — reference captures of key screens (see Screenshots section above).

# Plan: Self-served T-shirt "Ads" (Fourthwall promo)

## Context

The site owner created a programming-themed t-shirt on Fourthwall and wants to
promote it on dict2json.com using display-ad-style placements. The placements
should look and feel like Google AdSense slots — fixed-position banners that
mimic standard ad behavior — but be self-served (linking directly to the
Fourthwall product page) rather than running through an ad network. They must
be dismissible, respectful of the user's choice, and constrained to viewport
sizes where they won't damage the site's primary purpose (a working developer
utility).

Confirmed decisions from clarifying questions:
- **Ad sizes:** Standard IAB. Side rails 160×600 (Skyscraper), bottom 728×90 (Leaderboard).
- **Dismiss persistence:** 7 days, stored in localStorage.
- **Mobile bottom banner:** Skip entirely. GA shows 98% desktop traffic.
- **Existing Amazon "Recommended Reading" section:** Keep as-is. T-shirt ads are additive.

## Approach

Add a single React component (`TshirtAds`) that mounts at the App root and uses
`ReactDOM.createPortal` to render three fixed-position ad slots directly to
`document.body`. This avoids constraint by parent stacking contexts and keeps
the ads architecturally separate from the converter UI.

The component:
- Reads a `tshirt-ad-dismissed-at` timestamp from localStorage on mount.
- If `now - dismissedAt < 7 days`, renders nothing.
- Otherwise, renders three portal-mounted ad slots: left rail, right rail, bottom banner.
- Each slot wraps the product image in an `<a>` (target="_blank", rel="noopener sponsored") and has a small close "×" button absolutely positioned in the top-right corner.
- Clicking the ad image fires a `gtag('event', 'tshirt_ad_click', { ad_position })` event before navigating.
- Clicking the close button writes `Date.now()` to localStorage, fires a `gtag('event', 'tshirt_ad_dismissed', { ad_position })` event, and unmounts all three slots (single dismiss-all — clicking X anywhere kills the campaign for 7 days).

Visibility is gated by CSS media queries — no JS-driven viewport detection:
- Side rails: visible only when viewport ≥ 1280px (otherwise they'd overlap the centered `.app` content which uses `max-width: 80%`).
- Bottom banner: visible only when viewport ≥ 768px (728px width + breathing room).

Each ad slot has a small "Ad" label in the corner — minor honesty signal that this is a promotional placement, mirroring AdSense's labeling pattern.

## Files to add

### `src/components/TshirtAds.js`

New functional component following the existing pattern (named import of React + hooks, destructured props, `export default`). Internal structure:
- `useState` for `dismissed` boolean.
- `useEffect` on mount: read localStorage `tshirt-ad-dismissed-at`, compute TTL, set `dismissed` accordingly.
- Returns three `ReactDOM.createPortal(<AdSlot ... />, document.body)` calls inside a fragment, or `null` if dismissed.
- Inner `AdSlot` subcomponent or inline JSX for each position. Renders `<img>` from the per-position asset, dismiss button, "Ad" label.
- Receives a single `fourthwallUrl` prop or hard-codes the URL (open decision below).

### `src/styles/ads.css`

New themed CSS file (consistent with the per-functional-area pattern in
`src/styles/`). Contains:
- `.tshirt-ad` base class — `position: fixed`, `z-index: 9000` (above content, below modals/toasts).
- `.tshirt-ad--left`, `.tshirt-ad--right` — vertical centering via `top: 50%; transform: translateY(-50%)`, plus `left: 16px` / `right: 16px`.
- `.tshirt-ad--bottom` — `bottom: 16px; left: 50%; transform: translateX(-50%)`.
- `.tshirt-ad__dismiss` — top-right close button, ~24×24px, semi-transparent background, "×" character.
- `.tshirt-ad__label` — bottom-left "Ad" badge, ~10px font, low contrast.
- `.tshirt-ad__image` — `display: block`, fixed pixel dimensions matching the IAB size.
- Media queries: hide side rails below 1280px, hide bottom banner below 768px.

### `public/ads/` (new directory)

Image assets the **user must provide**:
- `tshirt-160x600.png` — vertical skyscraper for side rails (same image used both sides).
- `tshirt-160x600@2x.png` — 320×1200, retina version (optional but recommended).
- `tshirt-728x90.png` — horizontal leaderboard for bottom.
- `tshirt-728x90@2x.png` — 1456×180, retina version (optional but recommended).

Image element will use `srcset` for retina variants if provided; otherwise the
1x version is fine.

## Files to modify

### `src/App.js`

- Add `import './styles/ads.css';` alongside the existing style imports.
- Add `import TshirtAds from './components/TshirtAds';`.
- Render `<TshirtAds />` inside the top-level `<div className="app ...">` — placement within the tree doesn't matter functionally since the component uses portals, but rendering it inside `App` keeps the component lifecycle tied to the app.

No other files require modification.

## Existing patterns reused

- Functional component + hooks pattern: see `src/components/InputSection.js:1-4` and other components in `src/components/`.
- CSS organization by functional area: see `src/styles/` (variables, layout, editor, toolbar, components, responsive). New `ads.css` slots in cleanly.
- GA infrastructure: `gtag` global is already loaded via `public/index.html:107-114`. The component fires events via `window.gtag(...)` — first event-tracking code in the app, simple direct call (no abstraction needed for one event type).

## Behavior details

- **Click target:** Entire image is clickable. The Fourthwall product URL opens in a new tab (`target="_blank"`, `rel="noopener sponsored"`).
- **Dismiss UX:** Clicking the "×" anywhere hides all three slots immediately (no animation needed for v1) and writes the dismissal timestamp to localStorage. No undo affordance — if the user wants them back, they can clear site storage.
- **Server-side rendering:** Not applicable (CRA-style client render).
- **Accessibility:** Each ad has an `aria-label` describing the t-shirt; dismiss button has `aria-label="Dismiss ad"`. Images have descriptive `alt` text.
- **Performance:** Images load eagerly (small, above-the-fold on desktop). No lazy-loading needed for IAB-sized creatives.

## Open items (need from user before implementation)

1. **Fourthwall product URL** — the canonical link the ads should send users to.
2. **The four image assets** (160×600, 728×90, plus optional @2x versions) placed in `public/ads/`.
3. **Alt text** for the t-shirt (e.g., "Programmer's Dict-to-JSON t-shirt — Shop on Fourthwall"). I can write a default; user can swap.

## Verification

1. `npm run build` succeeds with no warnings.
2. Open `public/index.html` after build (or use `npm run build:dev` which serves on :3000).
3. **Desktop ≥ 1280px:** All three ads visible (left rail, right rail, bottom banner). None overlap the centered converter content.
4. **Desktop 768–1279px:** Only bottom banner visible.
5. **Mobile < 768px:** No ads visible.
6. Click an ad → opens Fourthwall URL in new tab; GA Realtime shows the `tshirt_ad_click` event.
7. Click the "×" → all three ads disappear immediately.
8. Reload page → ads remain hidden.
9. In DevTools, clear localStorage and reload → ads reappear.
10. Verify the GA `tshirt_ad_dismissed` event fires when "×" is clicked (Realtime view).

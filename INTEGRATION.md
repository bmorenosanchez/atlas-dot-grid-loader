# Dot Grid Loader — Atlas integration

A subtle dot-grid loading background. An invisible circle orbits the grid, lifting nearby dots in scale and opacity. Designed to sit **behind** content while it loads, rather than block it with a spinner.

## What's in this bundle

- `DotGridLoader.tsx` — the React component (TypeScript)
- `DotGridLoader.css` — the styles + animation hooks
- `INTEGRATION.md` — this file

## Step 1 — Drop the files in

Place both files in a shared loaders folder, e.g.:

```
src/components/loaders/DotGridLoader.tsx
src/components/loaders/DotGridLoader.css
```

If Atlas uses a different conventional path (e.g. `ui/`, `shared/`, `common/`), use that. Co-locate the `.css` with the `.tsx`. Do not split them.

## Step 2 — Component API

```tsx
import { DotGridLoader } from "@/components/loaders/DotGridLoader";

<DotGridLoader
  fullWidth        // fills its container; rows/cols computed from container size
  edgeFade         // radial mask: dots fade out toward the outer edges
  cellSize={20}    // pixel size of each grid cell (square)
  dotSize={3}      // diameter of each dot
  color="#2D6BFF"  // dot color; defaults to currentColor so theming via parent works too
/>
```

| Prop | Default | Notes |
| --- | --- | --- |
| `fullWidth` | `false` | When true, the grid fills 100% width/height of its container and recomputes rows/cols on resize. **Required for the Atlas integration below.** |
| `edgeFade` | `false` | Applies a radial-gradient mask so the outer edges fade to transparent. **Required for all Atlas integrations below.** |
| `cellSize` | `dotSize + gap` | Square cell size in px. Smaller → denser grid. |
| `dotSize` | `4` | Dot diameter in px. |
| `color` | `currentColor` | Use `#2D6BFF` for Atlas. |
| `orbitDuration` | `4000` | Time (ms) for the bump to complete one orbit. |
| `bumpScale` | `0.6` | Peak extra scale of dots inside the bump. |
| `bumpRadiusRatio` | `0.28` | Bump radius as a fraction of the grid's smaller side. |
| `orbitRadiusRatio` | `0.35` | Orbit radius as a fraction of the grid's smaller side. |

The component is `position: relative`-agnostic — it sizes to its container. The container must have a non-zero width and height for `fullWidth` to compute rows/cols.

## Step 3 — Where to apply it in Atlas

Replace existing skeleton/spinner placeholders on the three surfaces below. The loader goes **as the background of the loading container**, not next to the content. When data arrives, swap it out for the rendered content.

### Surface A — Atlas tasks cards (while loading)

**Find:** the task card component in the Atlas tasks list. Look for `TaskCard`, `tasks/Card`, `TaskListItem`, or any component that renders an individual task row/card and has an `isLoading` / pending / skeleton branch.

**Apply:** when the card is in its loading state, render the loader as an absolutely-positioned background filling the card's content area. Keep any existing title/chrome that should remain visible during load; just replace the skeleton block.

```tsx
<div style={{ position: "relative", width: "100%", minHeight: 96 }}>
  {isLoading ? (
    <DotGridLoader fullWidth edgeFade cellSize={16} dotSize={3} color="#2D6BFF" />
  ) : (
    <TaskCardContent task={task} />
  )}
</div>
```

Use `cellSize={16}` for tasks cards — they're compact, so a denser grid reads better.

### Surface B — Point bar in the customer activity container

**Find:** the "point bar" inside the customer activity container — likely a horizontal bar/chart/scale that visualizes a numeric value or progress. Search for `PointBar`, `points-bar`, `customer-activity`, or similar in the customer activity feature folder.

**Apply:** while the point bar's data is loading, render the loader behind the bar's track area. The bar's frame/labels can remain rendered; the loader replaces the empty track fill.

```tsx
<div className="point-bar" style={{ position: "relative" }}>
  {isLoading ? (
    <DotGridLoader fullWidth edgeFade cellSize={14} dotSize={2} color="#2D6BFF" />
  ) : (
    <PointBarFill value={value} max={max} />
  )}
</div>
```

Use `cellSize={14}` and `dotSize={2}` — the bar is short vertically, so a tight grid keeps the motion legible.

### Surface C — Slideout cards in the customer activity details slideout

**Find:** the slideout (drawer) that opens when a customer activity row is clicked. Inside it, individual content cards display details. Search for the slideout/drawer component for customer activity and look for its inner card components.

**Apply:** each card in the slideout that is independently loadable should show the loader behind its content area while pending. Use one loader per card, scoped to that card's container.

```tsx
<div className="activity-card" style={{ position: "relative", minHeight: 140 }}>
  {isLoading ? (
    <DotGridLoader fullWidth edgeFade cellSize={20} dotSize={3} color="#2D6BFF" />
  ) : (
    <ActivityCardBody data={data} />
  )}
</div>
```

Use `cellSize={20}` — slideout cards are larger, so a slightly more open grid feels right.

## Step 4 — Required parent positioning

The loader is `position: static` by default. The **parent** container must be `position: relative` (or any non-static positioning) so the loader can fill it via `width/height: 100%`. If the parent doesn't have an explicit height, give it a `min-height` so the loader has space to render.

## Step 5 — Accessibility

The component renders `role="status"` and `aria-label="Loading"`. If a surrounding container already exposes a loading status to assistive tech, pass a className via `className` and let the parent own the role:

```tsx
<DotGridLoader fullWidth edgeFade color="#2D6BFF" aria-hidden />
```

(Add `aria-hidden` by extending the props in `DotGridLoader.tsx` if needed.)

Reduced-motion users automatically get a static 0.5-opacity grid — no orbit, no animation — via the existing `@media (prefers-reduced-motion: reduce)` rule in `DotGridLoader.css`.

## Step 6 — Verification

After integrating each surface:

1. Trigger the loading state (network throttling to "Slow 3G" in DevTools, or stub the query to never resolve).
2. Confirm the dot grid renders as the **background** of the container, with the orbit motion visible.
3. Confirm the dots use `#2D6BFF` and the edges fade smoothly into the surrounding UI.
4. Confirm content appears in place of the loader once data resolves — the loader should fully unmount, not just be hidden.
5. Test `prefers-reduced-motion: reduce` (DevTools → Rendering → Emulate CSS media feature) and confirm the grid is static, not animated.

## Notes for the Claude session running this

- Don't move the `.css` import out of the `.tsx`. The component is self-contained on purpose.
- Don't refactor existing skeleton components to use this loader globally — only the three surfaces listed above.
- If a target surface already uses a `<Skeleton />` or `<LoadingPlaceholder />` primitive, replace **just the usage on that surface**, not the primitive itself.
- The loader's animation runs on `requestAnimationFrame` and self-cancels on unmount. Don't wrap it in `React.memo` or `useMemo` over its dots — it relies on remounting to reset the orbit when props change.
- If the host card uses CSS-in-JS / `styled-components`, the `position: relative` requirement still applies to the parent. Pass it via styled wrapper or inline `style`.

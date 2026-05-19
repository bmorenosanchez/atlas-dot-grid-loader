# @optimaldynamics/dot-grid-loader

A subtle dot-grid background loader for React. An invisible circle orbits the grid, lifting nearby dots in scale and opacity — designed to sit **behind** content while it loads, not block it with a spinner.

![Dot Grid Loader](./demo/preview.png)

## Install

```bash
npm install @optimaldynamics/dot-grid-loader
```

Peer dep: `react >= 18`.

## Quick start

```tsx
import { DotGridLoader } from "@optimaldynamics/dot-grid-loader";
import "@optimaldynamics/dot-grid-loader/style.css";

function Card({ isLoading, data }) {
  return (
    <div style={{ position: "relative", minHeight: 140 }}>
      {isLoading ? (
        <DotGridLoader fullWidth edgeFade color="#2D6BFF" />
      ) : (
        <CardBody data={data} />
      )}
    </div>
  );
}
```

The parent must be `position: relative` (or any non-static positioning) and have a non-zero height. The loader fills it.

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `fullWidth` | `boolean` | `false` | When true, the grid fills 100% width/height of its container and recomputes rows/cols on resize via `ResizeObserver`. |
| `edgeFade` | `boolean` | `false` | Applies a radial-gradient mask so outer dots fade to transparent. |
| `cellSize` | `number` | `dotSize + gap` | Square cell size in px. Smaller → denser grid. Required only when `fullWidth` is on. |
| `dotSize` | `number` | `4` | Dot diameter in px. |
| `gap` | `number` | `18` | Used only when `fullWidth` is off — gap between dots in the static grid. |
| `rows` | `number` | `12` | Used only when `fullWidth` is off. |
| `cols` | `number` | `20` | Used only when `fullWidth` is off. |
| `color` | `string` | `"currentColor"` | Dot color. Inherits from parent's `color` by default. |
| `orbitDuration` | `number` | `4000` | Time (ms) for the invisible bump to complete one orbit. |
| `bumpScale` | `number` | `0.6` | Peak extra scale of dots inside the bump (1 + bumpScale). |
| `bumpRadiusRatio` | `number` | `0.28` | Bump radius as a fraction of the grid's smaller side. |
| `orbitRadiusRatio` | `number` | `0.35` | Orbit radius as a fraction of the grid's smaller side. |
| `className` | `string` | `""` | Extra class for the root element. |
| `style` | `CSSProperties` | — | Merged into the root element's inline style (after CSS variables). |

## Common configurations

**Background of a compact card (task lists, table rows):**

```tsx
<DotGridLoader fullWidth edgeFade cellSize={16} dotSize={3} color="#2D6BFF" />
```

**Background of a wide, short element (progress bars, sliders):**

```tsx
<DotGridLoader fullWidth edgeFade cellSize={14} dotSize={2} color="#2D6BFF" />
```

**Background of a large panel (slideouts, modals, hero sections):**

```tsx
<DotGridLoader fullWidth edgeFade cellSize={20} dotSize={3} color="#2D6BFF" />
```

## How it works

- The grid is a CSS `display: grid` with square cells (`cellSize × cellSize`).
- A `ResizeObserver` recomputes `rows` and `cols` from the container's dimensions whenever `fullWidth` is on.
- A single `requestAnimationFrame` loop moves an invisible "bump" center in a circular orbit. For each dot, it computes the distance to the bump center and writes two CSS custom properties: `--s` (scale, smoothstepped from 1 to `1 + bumpScale`) and `--o` (opacity, from 0.2 to 1.0).
- The CSS rule for each dot reads those variables: `transform: scale(var(--s, 1)); opacity: var(--o, 0.2);` — so the GPU handles the actual paint.
- With `edgeFade`, a `mask-image: radial-gradient(...)` softens the outer edges into transparent.

## Accessibility

- Renders `role="status"` and `aria-label="Loading"` so screen readers announce it as a loading indicator.
- Respects `prefers-reduced-motion: reduce` — the orbit is disabled and the grid becomes a static, 50% opacity backdrop.

## Demo

```bash
npm run demo
```

Then open http://localhost:5175.

The demo is a standalone HTML page (no build step) that mirrors the React component's animation in vanilla JS, useful for quick visual reference.

## Atlas integration

If you're integrating into Optimal Dynamics' Atlas product, see [INTEGRATION.md](./INTEGRATION.md) for the three target surfaces (tasks cards, customer activity point bar, customer activity slideout cards) and the per-surface `cellSize` recommendations.

## License

MIT

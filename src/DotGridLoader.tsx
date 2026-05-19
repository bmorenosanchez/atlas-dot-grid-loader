import { useEffect, useRef, useState, type CSSProperties } from "react";
import "./DotGridLoader.css";

export interface DotGridLoaderProps {
  rows?: number;
  cols?: number;
  dotSize?: number;
  gap?: number;
  cellSize?: number;
  color?: string;
  orbitDuration?: number;
  bumpScale?: number;
  bumpRadiusRatio?: number;
  orbitRadiusRatio?: number;
  fullWidth?: boolean;
  edgeFade?: boolean;
  className?: string;
  style?: CSSProperties;
}

export function DotGridLoader({
  rows: rowsProp = 12,
  cols: colsProp = 20,
  dotSize = 4,
  gap = 18,
  cellSize,
  color = "currentColor",
  orbitDuration = 4000,
  bumpScale = 0.6,
  bumpRadiusRatio = 0.28,
  orbitRadiusRatio = 0.35,
  fullWidth = false,
  edgeFade = false,
  className = "",
  style,
}: DotGridLoaderProps) {
  const ref = useRef<HTMLDivElement>(null);
  const cell = cellSize ?? dotSize + gap;
  const [size, setSize] = useState({ rows: rowsProp, cols: colsProp });

  useEffect(() => {
    if (!fullWidth) {
      setSize({ rows: rowsProp, cols: colsProp });
      return;
    }
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({
        rows: Math.max(1, Math.floor(height / cell)),
        cols: Math.max(1, Math.floor(width / cell)),
      });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [fullWidth, cell, rowsProp, colsProp]);

  const { rows, cols } = size;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const dots = el.querySelectorAll<HTMLSpanElement>(".dot-grid-loader__dot");
    if (!dots.length) return;

    const ccol = (cols - 1) / 2;
    const crow = (rows - 1) / 2;
    const minDim = Math.min(cols, rows);
    const orbitR = minDim * orbitRadiusRatio;
    const bumpR = minDim * bumpRadiusRatio;

    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const angle = ((now - start) / orbitDuration) * Math.PI * 2;
      const cx = ccol + orbitR * Math.cos(angle);
      const cy = crow + orbitR * Math.sin(angle);
      for (let i = 0; i < dots.length; i++) {
        const r = (i / cols) | 0;
        const c = i - r * cols;
        const dx = c - cx;
        const dy = r - cy;
        const d = Math.sqrt(dx * dx + dy * dy);
        const f = Math.max(0, 1 - d / bumpR);
        const eased = f * f * (3 - 2 * f);
        dots[i].style.setProperty("--s", String(1 + bumpScale * eased));
        dots[i].style.setProperty("--o", String(0.2 + 0.8 * eased));
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [rows, cols, orbitDuration, bumpScale, bumpRadiusRatio, orbitRadiusRatio]);

  const classes = [
    "dot-grid-loader",
    fullWidth && "is-full-width",
    edgeFade && "is-edge-fade",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      ref={ref}
      className={classes}
      style={
        {
          "--dot-size": `${dotSize}px`,
          "--gap": `${gap}px`,
          "--cell-size": `${cell}px`,
          "--cols": cols,
          "--rows": rows,
          "--color": color,
          ...style,
        } as CSSProperties
      }
      role="status"
      aria-label="Loading"
    >
      {Array.from({ length: rows * cols }, (_, i) => (
        <span key={i} className="dot-grid-loader__dot" />
      ))}
    </div>
  );
}

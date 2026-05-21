import { useEffect, useRef, useState, type CSSProperties } from "react";
import "./DotGridLoader.css";

export interface DotGridLoaderProps {
  rows?: number;
  cols?: number;
  dotSize?: number;
  gap?: number;
  cellSize?: number;
  color?: string;
  bumpScale?: number;
  bumpRadiusRatio?: number;
  bumpSpeed?: number;
  pulseAmount?: number;
  pulseSpeed?: number;
  chaos?: number;
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
  bumpScale = 0.6,
  bumpRadiusRatio = 0.28,
  bumpSpeed = 6,
  pulseAmount = 0.5,
  pulseSpeed = 0.4,
  chaos = 0.5,
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

    const minDim = Math.min(cols, rows);
    const baseBumpR = minDim * bumpRadiusRatio;
    const maxX = cols - 1;
    const maxY = rows - 1;

    let x = maxX / 2;
    let y = maxY / 2;
    const initialAngle = Math.random() * Math.PI * 2;
    let vx = bumpSpeed * Math.cos(initialAngle);
    let vy = bumpSpeed * Math.sin(initialAngle);

    const perturb = () => {
      const speed = Math.sqrt(vx * vx + vy * vy);
      const delta = (Math.random() - 0.5) * (Math.PI / 4);
      const angle = Math.atan2(vy, vx) + delta;
      vx = speed * Math.cos(angle);
      vy = speed * Math.sin(angle);
    };

    let lastTime = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      x += vx * dt;
      y += vy * dt;
      if (x < 0)    { x = -x;            vx = -vx; perturb(); }
      if (x > maxX) { x = 2 * maxX - x;  vx = -vx; perturb(); }
      if (y < 0)    { y = -y;            vy = -vy; perturb(); }
      if (y > maxY) { y = 2 * maxY - y;  vy = -vy; perturb(); }
      if (chaos > 0 && Math.random() < chaos * 0.1) perturb();

      const pulse = 1 + pulseAmount * Math.sin(now * 0.001 * pulseSpeed * Math.PI * 2);
      const currentBumpR = Math.max(0.5, baseBumpR * pulse);

      for (let i = 0; i < dots.length; i++) {
        const r = (i / cols) | 0;
        const c = i - r * cols;
        const dx = c - x;
        const dy = r - y;
        const d = Math.sqrt(dx * dx + dy * dy);
        const f = Math.max(0, 1 - d / currentBumpR);
        const eased = f * f * (3 - 2 * f);
        dots[i].style.setProperty("--s", String(1 + bumpScale * eased));
        dots[i].style.setProperty("--o", String(0.2 + 0.8 * eased));
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [rows, cols, bumpScale, bumpRadiusRatio, bumpSpeed, pulseAmount, pulseSpeed, chaos]);

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

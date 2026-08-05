"use client";

import { useEffect, useRef } from "react";

const ICON_SIZE = 44;
const REPEL_RADIUS = 90;
const REPEL_STRENGTH = 1400;

const ICONS = [
  {
    key: "notion",
    title: "Notion",
    svg: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="3" />
        <line x1="7" y1="8" x2="17" y2="8" />
        <line x1="7" y1="12" x2="14" y2="12" />
        <line x1="7" y1="16" x2="12" y2="16" />
      </>
    ),
  },
  {
    key: "github",
    title: "GitHub",
    svg: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M9 18c-3.5 1-3.5-2-5-2" />
        <path d="M9 20v-2.6c0-.7.2-1.2.6-1.6-2-.2-4.1-1-4.1-4.5 0-1 .3-1.8 1-2.5-.1-.2-.4-1.2.1-2.6 0 0 .8-.3 2.7 1a9.4 9.4 0 0 1 4.9 0c1.9-1.3 2.7-1 2.7-1 .5 1.4.2 2.4.1 2.6.6.7 1 1.5 1 2.5 0 3.5-2.1 4.3-4.1 4.5.3.4.6 1 .6 1.9V20" />
      </>
    ),
  },
  {
    key: "slack",
    title: "Slack",
    svg: (
      <>
        <rect x="9" y="2" width="4" height="9" rx="2" />
        <rect x="9" y="13" width="4" height="9" rx="2" />
        <rect x="13" y="9" width="9" height="4" rx="2" />
        <rect x="2" y="9" width="9" height="4" rx="2" />
      </>
    ),
  },
  {
    key: "vscode",
    title: "VS Code",
    svg: (
      <>
        <polyline points="9 8 4 12 9 16" />
        <polyline points="15 8 20 12 15 16" />
        <line x1="13" y1="5" x2="11" y2="19" />
      </>
    ),
  },
  {
    key: "browser",
    title: "Browser tabs",
    svg: (
      <>
        <rect x="2" y="5" width="20" height="15" rx="2" />
        <line x1="2" y1="9" x2="22" y2="9" />
        <line x1="5.5" y1="7" x2="8" y2="7" />
        <line x1="10.5" y1="7" x2="13" y2="7" />
      </>
    ),
  },
  {
    key: "terminal",
    title: "Terminal",
    svg: (
      <>
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <polyline points="6 9 10 12 6 15" />
        <line x1="12" y1="15" x2="17" y2="15" />
      </>
    ),
  },
  {
    key: "textfile",
    title: "Text file",
    svg: (
      <>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="8" y1="13" x2="16" y2="13" />
        <line x1="8" y1="17" x2="13" y2="17" />
      </>
    ),
  },
  {
    key: "bookmark",
    title: "Bookmark",
    svg: <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z" />,
  },
];

export function ChaosVisual() {
  const boundsRef = useRef<HTMLDivElement>(null);
  const iconRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const bounds = boundsRef.current;
    if (!bounds) return;

    let width = bounds.clientWidth;
    let height = bounds.clientHeight;

    const state = ICONS.map(() => {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.4 + Math.random() * 0.35;
      return {
        x: Math.random() * Math.max(width - ICON_SIZE, 1),
        y: Math.random() * Math.max(height - ICON_SIZE, 1),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        rotPhase: Math.random() * Math.PI * 2,
        rotSpeed: 0.4 + Math.random() * 0.4,
        scalePhase: Math.random() * Math.PI * 2,
        scaleSpeed: 0.5 + Math.random() * 0.5,
      };
    });

    let mouseX: number | null = null;
    let mouseY: number | null = null;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = bounds.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    };
    const handleMouseLeave = () => {
      mouseX = null;
      mouseY = null;
    };
    const handleResize = () => {
      width = bounds.clientWidth;
      height = bounds.clientHeight;
    };

    bounds.addEventListener("mousemove", handleMouseMove);
    bounds.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("resize", handleResize);

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let lastTime = performance.now();
    let rafId: number;

    function tick(now: number) {
      const dt = Math.min((now - lastTime) / 16.67, 3);
      lastTime = now;
      const t = now / 1000;

      state.forEach((s, i) => {
        const maxX = Math.max(width - ICON_SIZE, 0);
        const maxY = Math.max(height - ICON_SIZE, 0);

        s.x += s.vx * dt;
        s.y += s.vy * dt;

        if (mouseX !== null && mouseY !== null) {
          const cx = s.x + ICON_SIZE / 2;
          const cy = s.y + ICON_SIZE / 2;
          const dx = cx - mouseX;
          const dy = cy - mouseY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < REPEL_RADIUS && dist > 0.01) {
            const force = ((REPEL_RADIUS - dist) / REPEL_RADIUS) * REPEL_STRENGTH;
            s.x += (dx / dist) * force * 0.001 * dt;
            s.y += (dy / dist) * force * 0.001 * dt;
          }
        }

        if (s.x <= 0) {
          s.x = 0;
          s.vx = Math.abs(s.vx);
        } else if (s.x >= maxX) {
          s.x = maxX;
          s.vx = -Math.abs(s.vx);
        }

        if (s.y <= 0) {
          s.y = 0;
          s.vy = Math.abs(s.vy);
        } else if (s.y >= maxY) {
          s.y = maxY;
          s.vy = -Math.abs(s.vy);
        }

        const rot = prefersReducedMotion ? 0 : Math.sin(t * s.rotSpeed + s.rotPhase) * 8;
        const scale = prefersReducedMotion ? 1 : 1 + Math.sin(t * s.scaleSpeed + s.scalePhase) * 0.08;

        const el = iconRefs.current[i];
        if (el) el.style.transform = `translate(${s.x}px, ${s.y}px) rotate(${rot}deg) scale(${scale})`;
      });

      rafId = requestAnimationFrame(tick);
    }

    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      bounds.removeEventListener("mousemove", handleMouseMove);
      bounds.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div ref={boundsRef} className="absolute top-13 right-5 bottom-5 left-5">
      {ICONS.map((icon, i) => (
        <div
          key={icon.key}
          ref={(el) => {
            iconRefs.current[i] = el;
          }}
          title={icon.title}
          className="absolute top-0 left-0 flex h-11 w-11 origin-center items-center justify-center rounded-xl border border-border bg-muted text-muted-foreground will-change-transform"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5.5 w-5.5"
          >
            {icon.svg}
          </svg>
        </div>
      ))}
    </div>
  );
}

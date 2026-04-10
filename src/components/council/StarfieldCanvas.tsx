import React, { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  r: number;
  alpha: number;
  dAlpha: number;
  color: string;
  vx: number;
  vy: number;
}

interface Shooter {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  len: number;
  active: boolean;
}

const PALETTE = [
  '#ffffff',
  '#e8e8ff',
  '#fff8e8',
  '#c4b5fd', // purple tint
  '#99f6e4', // teal tint
  '#fed7aa', // amber tint
];

const NUM_STARS = 220;
const MAX_CONN_DIST = 120;
const DRIFT_SPEED = 0.12;

function randBetween(a: number, b: number) {
  return a + Math.random() * (b - a);
}

function makeShooter(w: number): Shooter {
  return {
    x: Math.random() * w,
    y: randBetween(0, 60),
    vx: randBetween(3, 6),
    vy: randBetween(1.5, 3),
    alpha: 1,
    len: randBetween(80, 160),
    active: true,
  };
}

export function StarfieldCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const shootersRef = useRef<Shooter[]>([]);
  const rafRef = useRef<number>(0);
  const nextShooterRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    const init = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      starsRef.current = Array.from({ length: NUM_STARS }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: randBetween(0.3, 2.0),
        alpha: randBetween(0.2, 0.9),
        dAlpha: randBetween(0.003, 0.008) * (Math.random() > 0.5 ? 1 : -1),
        color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
        vx: randBetween(-DRIFT_SPEED, DRIFT_SPEED),
        vy: randBetween(-DRIFT_SPEED, DRIFT_SPEED),
      }));
    };

    const drawFrame = (ts: number) => {
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      // ── Nebula gradient blobs (static) ──────────────────────────────────
      const paintNebula = (cx: number, cy: number, r: number, color: string, a: number) => {
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        g.addColorStop(0, color.replace(')', `, ${a})`).replace('rgb', 'rgba'));
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
      };
      paintNebula(width * 0.15, height * 0.2, 180, 'rgb(139,92,246)', 0.04);
      paintNebula(width * 0.85, height * 0.75, 160, 'rgb(20,184,166)', 0.04);
      paintNebula(width * 0.5, height * 0.5, 220, 'rgb(245,158,11)', 0.02);

      // ── Constellation lines ──────────────────────────────────────────────
      const stars = starsRef.current;
      ctx.lineWidth = 0.4;
      for (let i = 0; i < stars.length; i++) {
        for (let j = i + 1; j < stars.length; j++) {
          const dx = stars[i].x - stars[j].x;
          const dy = stars[i].y - stars[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MAX_CONN_DIST) {
            const opacity = ((1 - dist / MAX_CONN_DIST) * 0.18 * (stars[i].alpha + stars[j].alpha)) / 2;
            ctx.strokeStyle = `rgba(180,180,255,${opacity})`;
            ctx.beginPath();
            ctx.moveTo(stars[i].x, stars[i].y);
            ctx.lineTo(stars[j].x, stars[j].y);
            ctx.stroke();
          }
        }
      }

      // ── Stars ──────────────────────────────────────────────────────────
      for (const s of stars) {
        // drift
        s.x += s.vx;
        s.y += s.vy;
        if (s.x < 0) s.x = width;
        if (s.x > width) s.x = 0;
        if (s.y < 0) s.y = height;
        if (s.y > height) s.y = 0;

        // twinkle
        s.alpha += s.dAlpha;
        if (s.alpha >= 0.92) { s.alpha = 0.92; s.dAlpha *= -1; }
        if (s.alpha <= 0.08) { s.alpha = 0.08; s.dAlpha *= -1; }

        // glow halo for larger stars
        if (s.r > 1.2) {
          const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 5);
          g.addColorStop(0, `rgba(255,255,255,${s.alpha * 0.18})`);
          g.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.r * 5, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.globalAlpha = s.alpha;
        ctx.fillStyle = s.color;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      // ── Shooting stars ──────────────────────────────────────────────────
      if (ts > nextShooterRef.current) {
        shootersRef.current.push(makeShooter(width));
        nextShooterRef.current = ts + randBetween(4000, 9000);
      }
      shootersRef.current = shootersRef.current.filter((sh) => sh.alpha > 0.01);
      for (const sh of shootersRef.current) {
        const tail = ctx.createLinearGradient(
          sh.x - sh.vx * sh.len * 0.1,
          sh.y - sh.vy * sh.len * 0.1,
          sh.x,
          sh.y,
        );
        tail.addColorStop(0, `rgba(255,255,255,0)`);
        tail.addColorStop(1, `rgba(255,255,255,${sh.alpha * 0.7})`);
        ctx.strokeStyle = tail;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(sh.x - sh.vx * sh.len * 0.1, sh.y - sh.vy * sh.len * 0.1);
        ctx.lineTo(sh.x, sh.y);
        ctx.stroke();
        sh.x += sh.vx;
        sh.y += sh.vy;
        sh.alpha -= 0.018;
        if (sh.x > width || sh.y > height) sh.alpha = 0;
      }

      rafRef.current = requestAnimationFrame(drawFrame);
    };

    init();
    window.addEventListener('resize', init);
    rafRef.current = requestAnimationFrame(drawFrame);

    return () => {
      window.removeEventListener('resize', init);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: 0.75 }}
    />
  );
}

'use client';
import { useEffect, useRef } from 'react';

/**
 * Atmospheric background:
 *  - Layered aurora gradient blobs (CSS, animated)
 *  - Canvas particle field (purple/cyan, slow drift)
 *  - Sparse falling sakura petals (sparse, dim)
 *  - Edge vignette applied via a sibling div on the body
 *
 * Single fixed canvas keeps cost low. All animations honour prefers-reduced-motion.
 */
export function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let raf = 0;

    function resize() {
      const c = canvasRef.current;
      if (!c) return;
      c.width = window.innerWidth * dpr;
      c.height = window.innerHeight * dpr;
      c.style.width = `${window.innerWidth}px`;
      c.style.height = `${window.innerHeight}px`;
    }
    resize();
    window.addEventListener('resize', resize);

    // Star particles
    const starCount = reduceMotion ? 40 : 110;
    const stars = Array.from({ length: starCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.6 + 0.3,
      vx: (Math.random() - 0.5) * 0.12,
      vy: (Math.random() - 0.5) * 0.12,
      a: Math.random() * 0.55 + 0.15,
      // pre-assign hue so they don't strobe between purple/cyan every frame
      hue: Math.random() > 0.55 ? '168,85,247' : '34,211,238',
      twinklePhase: Math.random() * Math.PI * 2,
    }));

    // Sakura petals — sparse, slow-falling
    const petalCount = reduceMotion ? 0 : 14;
    const petals = Array.from({ length: petalCount }, () => spawnPetal(canvas, true));

    function spawnPetal(c: HTMLCanvasElement, anywhere = false) {
      return {
        x: Math.random() * c.width,
        y: anywhere ? Math.random() * c.height : -20,
        size: 5 + Math.random() * 5,
        vx: -0.18 - Math.random() * 0.25,  // drift left
        vy: 0.35 + Math.random() * 0.45,
        rot: Math.random() * Math.PI * 2,
        vrot: (Math.random() - 0.5) * 0.012,
        alpha: 0.22 + Math.random() * 0.18,
      };
    }

    function drawPetal(x: number, y: number, size: number, rot: number, alpha: number) {
      if (!ctx) return;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);
      // Stylised teardrop sakura petal
      ctx.beginPath();
      ctx.moveTo(0, -size);
      ctx.bezierCurveTo(size, -size, size, size, 0, size * 0.9);
      ctx.bezierCurveTo(-size, size, -size, -size, 0, -size);
      ctx.closePath();
      const grad = ctx.createLinearGradient(0, -size, 0, size);
      grad.addColorStop(0, `rgba(255, 192, 232, ${alpha})`);
      grad.addColorStop(1, `rgba(236, 72, 153, ${alpha * 0.7})`);
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.restore();
    }

    let frame = 0;
    function tick() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      frame++;

      // Stars with subtle twinkle
      for (const p of stars) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        const twinkle = 0.5 + 0.5 * Math.sin(frame * 0.015 + p.twinklePhase);
        const a = p.a * (0.5 + twinkle * 0.5);
        ctx.fillStyle = `rgba(${p.hue},${a})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * dpr, 0, Math.PI * 2);
        ctx.fill();
      }

      // Sakura petals — drift down-left, respawn at top when off-screen
      for (let i = 0; i < petals.length; i++) {
        const pe = petals[i];
        pe.x += pe.vx;
        pe.y += pe.vy;
        pe.rot += pe.vrot;
        if (pe.y > canvas.height + 20 || pe.x < -40) {
          petals[i] = spawnPetal(canvas);
        }
        drawPetal(pe.x, pe.y, pe.size * dpr, pe.rot, pe.alpha);
      }

      raf = requestAnimationFrame(tick);
    }
    tick();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <>
      {/* Aurora gradient blobs — CSS animated, big blurry pools of colour */}
      <div className="aurora" aria-hidden="true">
        <div
          className="animate-aurora"
          style={{
            top: '-15%',
            left: '-10%',
            width: '60vw',
            height: '60vw',
            background: 'radial-gradient(circle, rgba(168,85,247,0.55) 0%, rgba(168,85,247,0) 70%)',
            animationDelay: '0s',
          }}
        />
        <div
          className="animate-aurora"
          style={{
            bottom: '-20%',
            right: '-10%',
            width: '55vw',
            height: '55vw',
            background: 'radial-gradient(circle, rgba(34,211,238,0.45) 0%, rgba(34,211,238,0) 70%)',
            animationDelay: '-6s',
            animationDuration: '24s',
          }}
        />
        <div
          className="animate-aurora"
          style={{
            top: '30%',
            left: '40%',
            width: '40vw',
            height: '40vw',
            background: 'radial-gradient(circle, rgba(236,72,153,0.32) 0%, rgba(236,72,153,0) 70%)',
            animationDelay: '-12s',
            animationDuration: '28s',
          }}
        />
      </div>

      {/* Star + petal canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none opacity-80"
        style={{ zIndex: -1 }}
        aria-hidden="true"
      />
    </>
  );
}

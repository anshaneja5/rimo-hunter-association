'use client';
import { useEffect } from 'react';

/**
 * Soft purple/cyan light that follows the cursor.
 * Hooks --cursor-x / --cursor-y CSS vars on the body; the actual glow is rendered
 * by the .cursor-glow::after rule in globals.css.
 */
export function CursorGlow() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    function onMove(e: PointerEvent) {
      document.body.style.setProperty('--cursor-x', `${e.clientX}px`);
      document.body.style.setProperty('--cursor-y', `${e.clientY}px`);
    }

    document.body.classList.add('cursor-glow');
    window.addEventListener('pointermove', onMove);
    return () => {
      window.removeEventListener('pointermove', onMove);
      document.body.classList.remove('cursor-glow');
    };
  }, []);

  return null;
}

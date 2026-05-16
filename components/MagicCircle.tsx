'use client';

/**
 * Rotating mystical sigil — concentric runic rings with tick marks.
 * Drops behind the MVP avatar / S-tier hero shots.
 *
 * Two halves spin in opposite directions for the Solo-Leveling-summoning effect.
 * Pure SVG, GPU-cheap, honours prefers-reduced-motion via tailwind classes.
 */
export function MagicCircle({
  size = 320,
  color = '#a855f7',
  accentColor = '#22d3ee',
  className = '',
}: {
  size?: number;
  color?: string;
  accentColor?: string;
  className?: string;
}) {
  return (
    <div
      className={`pointer-events-none select-none ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 200 200" width="100%" height="100%" fill="none">
        {/* Outermost ring — slow spin */}
        <g className="animate-spin-slow" style={{ transformOrigin: '100px 100px' }}>
          <circle cx="100" cy="100" r="96" stroke={color} strokeWidth="0.6" opacity="0.55" />
          <circle cx="100" cy="100" r="94" stroke={color} strokeWidth="0.3" opacity="0.4" strokeDasharray="1 3" />
          {/* 12 evenly spaced runes around the outer ring */}
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i / 12) * Math.PI * 2;
            const cx = 100 + Math.cos(angle) * 96;
            const cy = 100 + Math.sin(angle) * 96;
            return (
              <g key={i} transform={`translate(${cx} ${cy})`}>
                <circle r="2.5" fill={color} opacity="0.7" />
                <circle r="4.5" stroke={color} strokeWidth="0.4" opacity="0.5" />
              </g>
            );
          })}
        </g>

        {/* Middle ring — reverse spin */}
        <g className="animate-spin-reverse" style={{ transformOrigin: '100px 100px' }}>
          <circle cx="100" cy="100" r="76" stroke={accentColor} strokeWidth="0.4" opacity="0.45" />
          <circle cx="100" cy="100" r="74" stroke={accentColor} strokeWidth="0.3" opacity="0.3" strokeDasharray="2 5" />
          {/* 6 larger glyphs */}
          {Array.from({ length: 6 }).map((_, i) => {
            const angle = (i / 6) * Math.PI * 2;
            const cx = 100 + Math.cos(angle) * 76;
            const cy = 100 + Math.sin(angle) * 76;
            return (
              <g key={i} transform={`translate(${cx} ${cy}) rotate(${(angle * 180) / Math.PI})`}>
                <path
                  d="M -5 0 L 0 -5 L 5 0 L 0 5 Z"
                  fill={accentColor}
                  opacity="0.55"
                />
              </g>
            );
          })}
        </g>

        {/* Inner ring — slow spin */}
        <g className="animate-spin-slow" style={{ transformOrigin: '100px 100px', animationDuration: '40s' }}>
          <circle cx="100" cy="100" r="56" stroke={color} strokeWidth="0.3" opacity="0.35" />
          <polygon
            points="100,46 146,76 128,128 72,128 54,76"
            stroke={color}
            strokeWidth="0.5"
            opacity="0.35"
            fill="none"
          />
        </g>

        {/* Central pentagram */}
        <g style={{ transformOrigin: '100px 100px' }}>
          <polygon
            points="100,52 116,96 162,96 124,124 138,166 100,140 62,166 76,124 38,96 84,96"
            stroke={accentColor}
            strokeWidth="0.4"
            opacity="0.2"
            fill="none"
          />
        </g>
      </svg>
    </div>
  );
}

'use client';

import { useId } from 'react';

export function HilalLogo({ className = '', size = 28 }: { className?: string; size?: number }) {
  const maskId = `crescent-cutout-${useId().replace(/:/g, '')}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      role="img"
      aria-label="Hilal Browser"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="512" height="512">
          <rect x="0" y="0" width="512" height="512" fill="#ffffff" />
          <ellipse
            fill="#000000"
            cx="287.41422"
            cy="228.92976"
            rx="210.00037"
            ry="209.99965"
            transform="matrix(0.99963114,-0.02715838,0.02709598,0.99963284,0,0)"
          />
        </mask>
      </defs>
      <ellipse
        style={{ fill: '#b1d9f2', fillOpacity: 1, strokeWidth: 1.21776 }}
        cx="256"
        cy="256.00128"
        rx="256"
        ry="256.00128"
        mask={`url(#${maskId})`}
      />
    </svg>
  );
}

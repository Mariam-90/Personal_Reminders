import React from 'react';

export default function ProgressRing({ value, total, size = 92 }) {
  const r = 40;
  const circumference = 2 * Math.PI * r;
  const ratio = total ? value / total : 0;

  return (
    <svg className="ring" width={size} height={size} viewBox="0 0 100 100" role="img" aria-label={`${value} מתוך ${total} בוצעו`}>
      <defs>
        <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>
      </defs>
      <circle className="ring-bg" cx="50" cy="50" r={r} />
      <circle
        className="ring-fg"
        cx="50"
        cy="50"
        r={r}
        strokeDasharray={circumference}
        strokeDashoffset={circumference * (1 - ratio)}
        transform="rotate(-90 50 50)"
      />
      <text x="50" y="58" textAnchor="middle">
        {total ? `${Math.round(ratio * 100)}%` : '—'}
      </text>
    </svg>
  );
}

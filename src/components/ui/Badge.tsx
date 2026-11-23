import type { ReactNode } from 'react';

type BadgeTone = 'neutral' | 'orange' | 'lime' | 'red' | 'yellow' | 'blue' | 'rose';

const TONE_MAP: Record<BadgeTone, string> = {
  neutral: 'bg-[#1E1E24] text-[#D1D5DB] border-[#2E2E38]',
  orange: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  lime: 'bg-lime-500/15 text-lime-400 border-lime-500/30',
  red: 'bg-red-500/15 text-red-400 border-red-500/30',
  yellow: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  blue: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
  rose: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
};

interface BadgeProps {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
}

export function Badge({ children, tone = 'neutral', className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border text-[11px] font-medium ${TONE_MAP[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

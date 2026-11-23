import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <section
      className={`rounded-2xl bg-[#16161A] border border-[#25252C] p-4 ${className}`}
    >
      {children}
    </section>
  );
}

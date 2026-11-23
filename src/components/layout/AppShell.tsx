import type { ReactNode } from 'react';

interface AppShellProps {
  title: string;
  subtitle?: string;
  headerRight?: ReactNode;
  children: ReactNode;
}

export function AppShell({ title, subtitle, headerRight, children }: AppShellProps) {
  return (
    <div className="min-h-dvh bg-[#0B0B0D] text-[#F4F4F6] pb-28">
      <header className="sticky top-0 z-30 bg-[#0B0B0D]/90 backdrop-blur-md border-b border-[#1E1E24] safe-top">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-lg font-bold tracking-tight truncate">{title}</h1>
            {subtitle && (
              <p className="text-xs text-[#9CA3AF] truncate">{subtitle}</p>
            )}
          </div>
          {headerRight && <div className="shrink-0">{headerRight}</div>}
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 pt-4 space-y-4">{children}</main>
    </div>
  );
}

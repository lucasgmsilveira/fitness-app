import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-8 px-4">
      <div className="w-12 h-12 rounded-2xl bg-[#1E1E24] border border-[#25252C] text-[#9CA3AF] flex items-center justify-center mb-3">
        {icon}
      </div>
      <p className="text-sm font-semibold text-[#F4F4F6]">{title}</p>
      <p className="text-xs text-[#9CA3AF] mt-1 max-w-xs leading-relaxed">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

import { Dumbbell, Home, Plus, Settings, Utensils } from 'lucide-react';

export type AppTab = 'home' | 'nutrition' | 'workouts' | 'settings';

interface BottomNavProps {
  activeTab: AppTab;
  onChangeTab: (tab: AppTab) => void;
  onQuickAction: () => void;
  hasActiveWorkout?: boolean;
}

export function BottomNav({
  activeTab,
  onChangeTab,
  onQuickAction,
  hasActiveWorkout = false,
}: BottomNavProps) {
  const itemClass = (tab: AppTab) =>
    `flex flex-col items-center justify-center gap-1 py-1.5 px-2 text-[11px] font-medium transition-colors ${
      activeTab === tab ? 'text-[#F43F5E]' : 'text-[#9CA3AF] hover:text-[#F4F4F6]'
    }`;

  return (
    <nav
      aria-label="Navegação principal"
      className="fixed bottom-0 inset-x-0 z-40 bg-[#121216]/95 backdrop-blur-md border-t border-[#25252C] safe-bottom"
    >
      <div className="max-w-3xl mx-auto grid grid-cols-5 items-center h-16 px-2">
        <button
          type="button"
          onClick={() => onChangeTab('home')}
          className={itemClass('home')}
        >
          <Home className="w-5 h-5" />
          <span>Início</span>
        </button>

        <button
          type="button"
          onClick={() => onChangeTab('nutrition')}
          className={itemClass('nutrition')}
        >
          <Utensils className="w-5 h-5" />
          <span>Nutrição</span>
        </button>

        <div className="flex items-center justify-center">
          <button
            type="button"
            onClick={onQuickAction}
            aria-label="Ação rápida"
            className="relative -top-3 w-13 h-13 rounded-full bg-[#1C1C22] border border-[#32323D] shadow-lg flex items-center justify-center text-[#F43F5E] hover:bg-[#25252D] active:scale-95 transition-transform"
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>

        <button
          type="button"
          onClick={() => onChangeTab('workouts')}
          className={`relative ${itemClass('workouts')}`}
        >
          <div className="relative">
            <Dumbbell className="w-5 h-5" />
            {hasActiveWorkout && (
              <span className="absolute -top-1 -right-1.5 w-2.5 h-2.5 rounded-full bg-[#84CC16] ring-2 ring-[#121216]" />
            )}
          </div>
          <span>Treinos</span>
        </button>

        <button
          type="button"
          onClick={() => onChangeTab('settings')}
          className={itemClass('settings')}
        >
          <Settings className="w-5 h-5" />
          <span>Ajustes</span>
        </button>
      </div>
    </nav>
  );
}

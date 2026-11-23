import { Activity, Dumbbell, Scale, Utensils } from 'lucide-react';
import { Modal } from '../ui/Modal';

export type QuickActionType = 'workout' | 'meal' | 'weight' | 'lumbar';

interface QuickActionSheetProps {
  open: boolean;
  onClose: () => void;
  onSelect: (action: QuickActionType) => void;
  hasActiveWorkout: boolean;
}

export function QuickActionSheet({
  open,
  onClose,
  onSelect,
  hasActiveWorkout,
}: QuickActionSheetProps) {
  const actions: Array<{
    id: QuickActionType;
    title: string;
    desc: string;
    icon: typeof Dumbbell;
    accent: string;
  }> = [
    {
      id: 'workout',
      title: hasActiveWorkout ? 'Retomar Treino Ativo' : 'Iniciar Treino',
      desc: hasActiveWorkout
        ? 'Continuar a sessão em andamento'
        : 'Escolher uma rotina ou começar treino livre',
      icon: Dumbbell,
      accent: 'bg-lime-500/15 text-lime-400',
    },
    {
      id: 'meal',
      title: 'Registrar Refeição',
      desc: 'Adicionar alimento ou entrada rápida de macros',
      icon: Utensils,
      accent: 'bg-orange-500/15 text-orange-400',
    },
    {
      id: 'weight',
      title: 'Peso e Medidas',
      desc: 'Atualizar peso corporal e circunferências de hoje',
      icon: Scale,
      accent: 'bg-sky-500/15 text-sky-400',
    },
    {
      id: 'lumbar',
      title: 'Check-in Lombar (0–10)',
      desc: 'Registrar bem-estar, rigidez ou resposta pós-treino',
      icon: Activity,
      accent: 'bg-rose-500/15 text-rose-400',
    },
  ];

  return (
    <Modal open={open} onClose={onClose} title="Registro Rápido">
      <div className="grid grid-cols-1 gap-2.5">
        {actions.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                onClose();
                onSelect(item.id);
              }}
              className="flex items-center gap-3.5 w-full text-left p-3.5 rounded-2xl bg-[#1E1E24] hover:bg-[#272730] border border-[#2A2A33] transition-colors"
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${item.accent}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#F4F4F6]">{item.title}</p>
                <p className="text-xs text-[#9CA3AF] mt-0.5">{item.desc}</p>
              </div>
            </button>
          );
        })}
      </div>
    </Modal>
  );
}

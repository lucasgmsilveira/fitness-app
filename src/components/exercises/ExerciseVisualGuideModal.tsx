import { useEffect, useState } from 'react';
import { Activity, AlertCircle, CheckCircle2, Info, Wind } from 'lucide-react';
import type { Exercise } from '../../db/types';
import { EXERCISE_ANIMATIONS } from '../../data/exerciseAnimations';
import { getExerciseGuide } from '../../data/exerciseGuides';
import { MUSCLE_DEFINITIONS, type MuscleId } from '../../data/muscleAnatomy';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { MuscleAnatomyDiagram } from './MuscleAnatomyDiagram';
import { ExerciseExecutionPlayer } from './ExerciseExecutionScene';

export type GuideModalTab = 'execution' | 'muscles';

interface ExerciseVisualGuideModalProps {
  open: boolean;
  onClose: () => void;
  exercise: Exercise | null;
  initialTab?: GuideModalTab;
}

export function ExerciseVisualGuideModal({
  open,
  onClose,
  exercise,
  initialTab = 'execution',
}: ExerciseVisualGuideModalProps) {
  const [tab, setTab] = useState<GuideModalTab>(initialTab);
  const [focusedMuscle, setFocusedMuscle] = useState<MuscleId | null>(null);

  useEffect(() => {
    if (!open) return;
    setTab(initialTab);
    setFocusedMuscle(null);
  }, [open, initialTab, exercise?.id]);

  if (!exercise) return null;

  const { guide } = getExerciseGuide(exercise);
  const animationSpec = EXERCISE_ANIMATIONS[exercise.id];

  function handleInspectMuscle(id: MuscleId) {
    setFocusedMuscle(id);
    setTab('muscles');
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={exercise.name}
      subtitle={`${exercise.muscleGroup} · ${exercise.equipment} · Descanso padrão ${exercise.defaultRestSec}s`}
      maxWidthClass="sm:max-w-xl"
    >
      {/* Seletor de Abas */}
      <div className="grid grid-cols-2 gap-1 p-1 rounded-2xl bg-[#101014] border border-[#25252C]">
        <button
          type="button"
          onClick={() => setTab('execution')}
          className={`py-2 rounded-xl text-xs font-semibold transition-colors ${
            tab === 'execution'
              ? 'bg-[#25252C] text-[#F4F4F6]'
              : 'text-[#9CA3AF] hover:text-[#F4F4F6]'
          }`}
        >
          Execução & Técnica
        </button>
        <button
          type="button"
          onClick={() => setTab('muscles')}
          className={`py-2 rounded-xl text-xs font-semibold transition-colors ${
            tab === 'muscles'
              ? 'bg-[#25252C] text-[#F4F4F6]'
              : 'text-[#9CA3AF] hover:text-[#F4F4F6]'
          }`}
        >
          Músculos Trabalhados
        </button>
      </div>

      {tab === 'execution' && (
        <div className="space-y-4">
          {animationSpec ? (
            <ExerciseExecutionPlayer
              spec={animationSpec}
              phaseLabels={guide.phaseLabels}
            />
          ) : (
            <div className="rounded-2xl bg-[#101014] border border-[#25252C] p-4 flex items-start gap-3">
              <Info className="w-5 h-5 text-[#38BDF8] shrink-0 mt-0.5" />
              <div className="space-y-2 text-xs text-[#D1D5DB]">
                <p>
                  Este é um exercício personalizado sem animação dedicada. Você pode consultar
                  os músculos trabalhados e as diretrizes técnicas abaixo.
                </p>
                <button
                  type="button"
                  onClick={() => setTab('muscles')}
                  className="px-3 py-1.5 rounded-lg bg-[#1E1E24] border border-[#2C2C35] text-xs font-semibold text-[#F97316]"
                >
                  Ver mapa muscular
                </button>
              </div>
            </div>
          )}

          {/* Atalhos rápidos dos músculos principais */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[0.75rem] text-[#9CA3AF] mr-1">Foco principal:</span>
            {guide.primaryMuscles.map((mId) => (
              <button
                key={mId}
                type="button"
                onClick={() => handleInspectMuscle(mId)}
                className="px-2 py-0.5 rounded-full text-[0.75rem] font-medium bg-[#F97316]/15 text-[#F97316] border border-[#F97316]/35 hover:bg-[#F97316]/25 transition-colors"
              >
                {MUSCLE_DEFINITIONS[mId].name}
              </button>
            ))}
          </div>

          {/* Passo a passo */}
          <div className="rounded-2xl bg-[#101014] border border-[#24242E] p-3.5 space-y-2.5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#9CA3AF] flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-[#84CC16]" />
              Como executar
            </h3>
            <ol className="space-y-2 text-xs text-[#E5E7EB]">
              {guide.executionSteps.map((step, index) => (
                <li key={index} className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#1E1E24] border border-[#2C2C35] text-[0.7rem] font-bold text-[#84CC16] flex items-center justify-center shrink-0 mt-0.5">
                    {index + 1}
                  </span>
                  <span className="leading-relaxed">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Respiração e pontos posturais */}
          <div className="grid grid-cols-1 gap-2.5">
            <div className="rounded-2xl bg-[#101014] border border-[#24242E] p-3 flex items-start gap-2.5">
              <Wind className="w-4 h-4 text-[#38BDF8] shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-semibold text-[#F4F4F6]">Respiração</p>
                <p className="text-[#D1D5DB] mt-0.5 leading-relaxed">{guide.breathing}</p>
              </div>
            </div>

            <div className="rounded-2xl bg-[#101014] border border-[#24242E] p-3 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#84CC16] shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <p className="font-semibold text-[#F4F4F6]">Pontos de atenção e postura</p>
                <ul className="space-y-1 text-[#D1D5DB]">
                  {guide.postureCues.map((cue, idx) => (
                    <li key={idx} className="leading-relaxed">
                      • {cue}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {exercise.notes && (
              <div className="rounded-2xl bg-[#F97316]/10 border border-[#F97316]/30 p-3 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-[#F97316] shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-semibold text-[#FDBA74]">Nota da sua ficha</p>
                  <p className="text-[#F4F4F6] mt-0.5 leading-relaxed">{exercise.notes}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'muscles' && (
        <div className="space-y-4">
          <MuscleAnatomyDiagram
            primaryMuscles={guide.primaryMuscles}
            secondaryMuscles={guide.secondaryMuscles}
            focusedMuscle={focusedMuscle}
            onSelectMuscle={setFocusedMuscle}
          />

          <div className="rounded-2xl bg-[#101014] border border-[#24242E] p-3.5 space-y-3">
            <div className="space-y-1.5">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#F97316]">
                Músculos Principais (Agonistas)
              </p>
              <div className="flex flex-wrap gap-1.5">
                {guide.primaryMuscles.map((mId) => {
                  const active = focusedMuscle === mId;
                  return (
                    <button
                      key={mId}
                      type="button"
                      onClick={() => setFocusedMuscle(active ? null : mId)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                        active
                          ? 'bg-[#F97316] text-black border-[#F97316]'
                          : 'bg-[#F97316]/15 text-[#FDBA74] border-[#F97316]/35 hover:bg-[#F97316]/25'
                      }`}
                    >
                      {MUSCLE_DEFINITIONS[mId].name}
                    </button>
                  );
                })}
              </div>
            </div>

            {guide.secondaryMuscles.length > 0 && (
              <div className="space-y-1.5 pt-1 border-t border-[#202028]">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#38BDF8]">
                  Secundários e Estabilizadores
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {guide.secondaryMuscles.map((mId) => {
                    const active = focusedMuscle === mId;
                    return (
                      <button
                        key={mId}
                        type="button"
                        onClick={() => setFocusedMuscle(active ? null : mId)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                          active
                            ? 'bg-[#38BDF8] text-black border-[#38BDF8]'
                            : 'bg-[#38BDF8]/12 text-[#BAE6FD] border-[#38BDF8]/30 hover:bg-[#38BDF8]/20'
                        }`}
                      >
                        {MUSCLE_DEFINITIONS[mId].name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="pt-2 border-t border-[#202028] flex items-center justify-between gap-2">
              <p className="text-[0.72rem] text-[#9CA3AF]">{guide.referenceNote}</p>
              <Badge tone="neutral">
                {guide.movementType === 'isometric' ? 'Isométrico' : 'Dinâmico'}
              </Badge>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}

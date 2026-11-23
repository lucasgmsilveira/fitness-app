import { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './db/database';
import { ensureInitialSeed, INITIAL_GOAL } from './db/seed';
import type { MealType } from './db/types';
import { BottomNav, type AppTab } from './components/layout/BottomNav';
import { QuickActionSheet, type QuickActionType } from './components/layout/QuickActionSheet';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { WorkoutsPage } from './features/workouts/WorkoutsPage';
import { ActiveWorkoutView } from './features/workouts/ActiveWorkoutView';
import { NutritionPage } from './features/nutrition/NutritionPage';
import { AddMealEntryModal } from './features/nutrition/AddMealEntryModal';
import { SettingsPage } from './features/settings/SettingsPage';
import { Modal } from './components/ui/Modal';
import { BodyMetricsPanel } from './features/settings/BodyMetricsPanel';
import { LumbarCheckinPanel } from './features/settings/LumbarCheckinPanel';
import { getLocalDateString } from './utils/date';

export function App() {
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState<AppTab>('home');
  const [activeWorkoutOpen, setActiveWorkoutOpen] = useState(false);
  const [quickSheetOpen, setQuickSheetOpen] = useState(false);
  const [quickMealModalMeal, setQuickMealModalMeal] = useState<MealType | null>(null);
  const [quickCheckinModal, setQuickCheckinModal] = useState<'weight' | 'lumbar' | null>(null);

  useEffect(() => {
    void ensureInitialSeed(db).then(() => setReady(true));
  }, []);

  const exercises = useLiveQuery(() => db.exercises.toArray(), []) ?? [];
  const routines = useLiveQuery(() => db.routines.toArray(), []) ?? [];
  const sessions = useLiveQuery(() => db.workoutSessions.toArray(), []) ?? [];
  const foods = useLiveQuery(() => db.foods.toArray(), []) ?? [];
  const mealEntries = useLiveQuery(() => db.mealEntries.toArray(), []) ?? [];
  const goals = useLiveQuery(() => db.nutritionGoals.toArray(), []) ?? [];
  const checkins = useLiveQuery(() => db.dailyCheckins.toArray(), []) ?? [];
  const lastBackupMeta = useLiveQuery(() => db.appMeta.get('lastBackupAt'), []);

  const goal = goals[0] ?? INITIAL_GOAL;
  const activeSession = sessions.find((s) => s.status === 'active');
  const completedSessions = sessions.filter((s) => s.status === 'completed');

  function handleQuickAction(action: QuickActionType) {
    if (action === 'workout') {
      if (activeSession) {
        setActiveWorkoutOpen(true);
      } else {
        setTab('workouts');
      }
      return;
    }
    if (action === 'meal') {
      setQuickMealModalMeal('almoco');
      return;
    }
    if (action === 'weight') {
      setQuickCheckinModal('weight');
      return;
    }
    if (action === 'lumbar') {
      setQuickCheckinModal('lumbar');
    }
  }

  if (!ready) {
    return (
      <div className="min-h-dvh bg-[#0B0B0D] flex items-center justify-center text-sm text-[#9CA3AF]">
        Carregando dados locais...
      </div>
    );
  }

  if (activeWorkoutOpen && activeSession) {
    return (
      <ActiveWorkoutView
        session={activeSession}
        exercises={exercises}
        completedSessions={completedSessions}
        onMinimize={() => setActiveWorkoutOpen(false)}
        onFinished={() => {
          setActiveWorkoutOpen(false);
          setTab('workouts');
        }}
      />
    );
  }

  return (
    <>
      {tab === 'home' && (
        <DashboardPage
          mealEntries={mealEntries}
          goal={goal}
          sessions={sessions}
          exercises={exercises}
          checkins={checkins}
          activeSession={activeSession}
          onGoNutrition={() => setTab('nutrition')}
          onGoWorkouts={() => setTab('workouts')}
          onOpenActiveWorkout={() => setActiveWorkoutOpen(true)}
          onOpenQuickCheckin={() => setQuickCheckinModal('lumbar')}
        />
      )}

      {tab === 'nutrition' && (
        <NutritionPage
          foods={foods}
          mealEntries={mealEntries}
          goal={goal}
          dailyCheckins={checkins}
        />
      )}

      {tab === 'workouts' && (
        <WorkoutsPage
          routines={routines}
          exercises={exercises}
          sessions={sessions}
          activeSession={activeSession}
          onOpenActiveSession={() => setActiveWorkoutOpen(true)}
        />
      )}

      {tab === 'settings' && (
        <SettingsPage
          counts={{
            routines: routines.length,
            sessions: completedSessions.length,
            exercises: exercises.length,
            foods: foods.length,
            meals: mealEntries.length,
            checkins: checkins.length,
          }}
          checkins={checkins}
          sessions={sessions}
          lastBackupAt={lastBackupMeta?.value}
        />
      )}

      <BottomNav
        activeTab={tab}
        onChangeTab={setTab}
        onQuickAction={() => setQuickSheetOpen(true)}
        hasActiveWorkout={Boolean(activeSession)}
      />

      <QuickActionSheet
        open={quickSheetOpen}
        onClose={() => setQuickSheetOpen(false)}
        onSelect={handleQuickAction}
        hasActiveWorkout={Boolean(activeSession)}
      />

      <AddMealEntryModal
        open={quickMealModalMeal !== null}
        onClose={() => setQuickMealModalMeal(null)}
        date={getLocalDateString()}
        initialMealType={quickMealModalMeal ?? 'almoco'}
        foods={foods}
      />

      <Modal
        open={quickCheckinModal !== null}
        onClose={() => setQuickCheckinModal(null)}
        title={
          quickCheckinModal === 'weight'
            ? 'Registrar Peso / Medidas'
            : 'Check-in Diário (Bem-estar / Lombar)'
        }
      >
        {quickCheckinModal === 'weight' && <BodyMetricsPanel checkins={checkins} />}
        {quickCheckinModal === 'lumbar' && <LumbarCheckinPanel checkins={checkins} />}
      </Modal>
    </>
  );
}

export default App;

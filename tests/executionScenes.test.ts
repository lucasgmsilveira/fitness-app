// @vitest-environment jsdom
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { ExerciseExecutionPlayer, ExerciseExecutionScene } from '../src/components/exercises/ExerciseExecutionScene';
import { EXERCISE_ANIMATIONS as animations, exerciseViews, type AnimationView } from '../src/data/exerciseAnimations';
import { dumbbellAxis, executionPose, pallofPlan } from '../src/data/animations/executionGeometry';

function scene(id: string, view: AnimationView, progress: number) {
  const container = document.createElement('div');
  container.innerHTML = renderToStaticMarkup(createElement(ExerciseExecutionScene, { spec: animations[id], view, progress }));
  return container.querySelector('svg[role="img"]')!;
}

describe('Geometria e profundidade das animações', () => {
  it('conserva os segmentos e mantém as juntas no quadro em 101 posições de cada exercício', () => {
    for (const spec of Object.values(animations)) {
      const rest = executionPose(spec, 0);
      function lengths({ side, front }: typeof rest) {
        return (['near', 'far'] as const).flatMap(s => {
          const f = s === 'near' ? 'right' : 'left';
          const bones = [
            [side.shoulder, side[`${s}Elbow`], front[`${f}Shoulder`], front[`${f}Elbow`]],
            [side[`${s}Elbow`], side[`${s}Hand`], front[`${f}Elbow`], front[`${f}Hand`]],
            [side.hip, side[`${s}Knee`], front[`${f}Hip`], front[`${f}Knee`]],
            [side[`${s}Knee`], side[`${s}Foot`], front[`${f}Knee`], front[`${f}Foot`]],
          ];
          return bones.map(([a, b, c, d]) => Math.hypot(a.x - b.x, a.y - b.y, c.x - d.x));
        });
      }
      const reference = lengths(rest);
      let maxError = 0;
      let inBounds = true;
      for (let i = 0; i <= 100; i++) {
        const sample = executionPose(spec, i / 100);
        const cameras = spec.topReplacesSide ? [pallofPlan(sample.side, sample.front), sample.front] : [sample.side, sample.front];
        for (const camera of cameras) {
          for (const point of Object.values(camera)) {
            if (typeof point === 'object') inBounds &&= point.x >= 0 && point.x <= 320 && point.y >= 0 && point.y <= 220;
          }
        }
        lengths(sample).forEach((n, j) => { maxError = Math.max(maxError, Math.abs(n - reference[j])); });
      }
      expect(maxError, spec.exerciseId).toBeLessThan(0.01);
      expect(inBounds, spec.exerciseId).toBe(true);
    }
  });

  it('projeta a inclinação real dos pesos na elevação lateral, martelo e testa', () => {
    function axis(id: string, view: AnimationView, t: number) {
      const spec = animations[id];
      const { side } = executionPose(spec, t);
      return dumbbellAxis(spec, view, side.nearElbow, side.nearHand);
    }
    for (const t of [0, .25, .5, .75, 1]) {
      expect(axis('ex-elevacao-lateral', 'side', t)).toEqual({ x: 1, y: 0, towardCamera: 0 });
    }
    expect(Math.abs(axis('ex-rosca-martelo', 'front', 0).y)).toBeLessThan(.25);
    expect(Math.abs(axis('ex-rosca-martelo', 'front', .5).y)).toBeGreaterThan(.9);
    expect(Math.abs(axis('ex-triceps-testa-halter', 'top', 0).towardCamera)).toBeGreaterThan(.8);
    expect(Math.abs(axis('ex-triceps-testa-halter', 'top', 1).towardCamera)).toBeLessThan(.15);
    for (const [id, view] of [['ex-rosca-martelo', 'front'], ['ex-triceps-testa-halter', 'top']] as const) {
      const plates = (t: number) => scene(id, view, t).querySelector('[data-load="dumbbell"] ellipse')?.getAttribute('rx');
      expect(plates(0)).not.toEqual(plates(.5));
    }
  });

  it('preserva apoios, sobreposições e a geometria das duas novas vistas superiores', () => {
    const pallof = animations['ex-pallof-press'];
    const bench = animations['ex-supino-halter'];
    expect(exerciseViews(pallof)).toEqual(['top', 'front']);
    expect(exerciseViews(bench)).toEqual(['side', 'top']);
    const plans = [0, .25, .5, .75, 1].map(t => {
      const { side, front } = executionPose(pallof, t);
      return pallofPlan(side, front);
    });
    for (const [i, plan] of plans.entries()) {
      expect(plan.leftShoulder).toEqual(plans[0].leftShoulder);
      expect(plan.rightFoot).toEqual(plans[0].rightFoot);
      expect(plan.leftHand.y).toBeCloseTo(plan.rightHand.y);
      if (i > 0) expect(plan.rightHand.y).toBeLessThan(plans[i - 1].rightHand.y);
    }
    const start = executionPose(bench, 0).front, end = executionPose(bench, 1).front;
    expect(Math.hypot(start.rightElbow.x - start.rightHand.x, start.rightElbow.y - start.rightHand.y)).toBeLessThan(5);
    expect(end.rightHand.x - end.leftHand.x).toBeGreaterThan(25);
    expect(end.rightHand.x).toBeLessThan(start.rightHand.x);
    for (const t of [0, .5, 1]) {
      const pose = executionPose(animations['ex-agach-bulgaro'], t);
      expect(pose.front.leftFoot.y).toBe(147);
      expect(pose.side.farFoot.y).toBe(145);
      const squat = scene('ex-agach-bulgaro', 'front', t);
      const order = (a: Element, b: Element) => Boolean(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);
      expect(order(squat.querySelector('[data-part="shins"]')!, squat.querySelector('[data-part="thighs"]')!)).toBe(true);
      const fly = scene('ex-voador-invertido', 'side', t);
      const torso = fly.querySelector('[data-part="torso"]')!;
      const lever = fly.querySelector('[data-part="near-lever"]')!;
      expect(order(fly.querySelector('[data-part="far-lever"]')!, torso)).toBe(true);
      expect(order(torso, lever)).toBe(true);
      expect(order(lever, fly.querySelector('[data-part="near-hand"]')!)).toBe(true);
      const curl = scene('ex-cadeira-flexora', 'front', t);
      for (const foot of curl.querySelectorAll('[data-part="foot"]')) {
        expect(order(curl.querySelector('[data-part="thigh-pad"]')!, foot)).toBe(true);
      }
      const { front } = executionPose(animations['ex-cadeira-flexora'], t);
      expect(front.leftFoot.y + 5).toBeLessThan(188);
      expect(curl.querySelectorAll('[data-part="foot"]')).toHaveLength(2);
      expect(scene('ex-triceps-frances-halter', 'front', t).querySelectorAll('[data-load="dumbbell"]')).toHaveLength(1);
    }
  });

  it('usa a câmera selecionada na reprodução e nas duas imagens de fase', async () => {
    const host = document.createElement('div');
    const root = createRoot(host);
    const previous = Reflect.get(globalThis, 'IS_REACT_ACT_ENVIRONMENT');
    Reflect.set(globalThis, 'IS_REACT_ACT_ENVIRONMENT', true);
    let tick: FrameRequestCallback | undefined;
    const frames = vi.spyOn(window, 'requestAnimationFrame').mockImplementation(callback => {
      tick = callback;
      return 1;
    });
    const clock = vi.spyOn(performance, 'now').mockReturnValue(0);
    const click = async (label: string) => {
      const button = [...host.querySelectorAll('button')].find(b => b.textContent === label);
      expect(button).toBeDefined();
      await act(async () => button!.click());
    };
    try {
      for (const id of ['ex-pallof-press', 'ex-supino-halter']) {
        await act(async () => root.render(createElement(ExerciseExecutionPlayer, {
          key: id, spec: animations[id], phaseLabels: { start: 'Início', end: 'Fim' },
        })));
        await click('Vista Superior');
        expect(host.querySelector('svg[role="img"]')?.getAttribute('aria-label')).toContain('superior');
        const hand = () => host.querySelector('svg[role="img"] [data-part="right-hand"]')?.getAttribute('transform');
        const initial = hand();
        expect(initial).toBeTruthy();
        for (let time = 100; time <= 600; time += 100) {
          await act(async () => tick!(time));
        }
        expect(hand()).not.toBe(initial);
        await click('Fases (2 imagens)');
        expect(host.querySelectorAll('svg[aria-label*="superior"]')).toHaveLength(2);
        expect(hand()).toBe(initial);
      }
    } finally {
      await act(async () => root.unmount());
      frames.mockRestore();
      clock.mockRestore();
      Reflect.set(globalThis, 'IS_REACT_ACT_ENVIRONMENT', previous);
    }
  });
});

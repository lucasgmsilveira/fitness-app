import {
  interpolateFrontPose, interpolateSidePose,
  type AnimationView, type ExerciseAnimationSpec, type FrontPose, type Point2D, type SidePose,
} from './types';

type ProfileJoint = keyof Omit<SidePose, 'faceDir'>;
type FaceJoint = keyof FrontPose;

type Vector = [number, number, number];
type Joint = [ProfileJoint, FaceJoint];

function subtract(a: Vector, b: Vector): Vector {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

function advance(origin: Vector, direction: Vector, scale: number): Vector {
  return [origin[0] + direction[0] * scale, origin[1] + direction[1] * scale, origin[2] + direction[2] * scale];
}

function position(p: SidePose, f: FrontPose, [s, w]: Joint): Vector {
  return [f[w].x, p[s].x, p[s].y];
}

// Intersection of two spheres: the hand/foot stays on its target and the
// authored elbow/knee picks the bending plane and side of the joint.
function solveHinge(root: Vector, hint: Vector, tip: Vector, upper: number, lower: number): Vector {
  const reach = subtract(tip, root);
  const distance = Math.hypot(...reach);
  if (distance < 1e-6) return hint;
  const axis = reach.map(v => v / distance) as Vector;
  const towardHint = subtract(hint, root);
  const along = towardHint.reduce((sum, v, i) => sum + v * axis[i], 0);
  const normal = advance(towardHint, axis, -along);
  const normalLength = Math.hypot(...normal);
  const offset = (upper * upper - lower * lower + distance * distance) / (2 * distance);
  const center = advance(root, axis, offset);
  const radius = Math.sqrt(Math.max(0, upper * upper - offset * offset));
  return normalLength < 1e-6 ? center : advance(center, normal, radius / normalLength);
}

export function executionPose(spec: ExerciseAnimationSpec, progress: number) {
  const profile = spec.side;
  const face = spec.front;
  const side = interpolateSidePose(profile.start, profile.mid, profile.end, progress);
  const front = interpolateFrontPose(face.start, face.mid, face.end, progress);
  const rawSide = { ...side };
  const rawFront = { ...front };

  function chain(root: Joint, hinge: Joint, tip: Joint, free: boolean) {
    const read = (joint: Joint) => position(rawSide, rawFront, joint);
    const a = read(root), b = read(hinge), c = read(tip);
    const start = [root, hinge, tip].map(j => position(profile.start, face.start, j));
    const end = [root, hinge, tip].map(j => position(profile.end, face.end, j));
    const distance = (u: Vector, v: Vector) => Math.hypot(...subtract(u, v));
    // Calibrate once from the most extended phase. For a free limb use the
    // shorter of the two drawings to avoid propagating perspective exaggeration.
    const reference = distance(start[0], start[2]) > distance(end[0], end[2]) ? start : end;
    const length = (j: number) => free
      ? Math.min(distance(start[j], start[j + 1]), distance(end[j], end[j + 1]))
      : distance(reference[j], reference[j + 1]);
    const upper = length(0), lower = length(1);
    function write([s, f]: Joint, point: Vector, preserveFraming = false) {
      side[s] = { x: point[1], y: point[2] };
      const vertical = face.projection === 'top' ? 1 : 2;
      const projectedY = preserveFraming
        ? rawFront[f].y + point[vertical] - position(rawSide, rawFront, [s, f])[vertical]
        : rawFront[root[1]].y + point[vertical] - a[vertical];
      front[f] = { x: point[0], y: projectedY };
    }
    if (free) {
      const elbow = advance(a, subtract(b, a), upper / (distance(b, a) || 1));
      write(hinge, elbow);
      write(tip, advance(elbow, subtract(c, b), lower / (distance(c, b) || 1)));
    } else {
      write(hinge, solveHinge(a, b, c, upper, lower), true);
      // Both contacts keep their authored positions in their respective views.
    }
  }

  const coreReach = spec.exerciseId === 'ex-bird-dog' || spec.exerciseId === 'ex-dead-bug';
  const freeArms = ['ex-elevacao-frontal', 'ex-elevacao-lateral', 'ex-elevacao-lateral-cabo',
    'ex-crucifixo-halter', 'ex-rosca-halter', 'ex-rosca-martelo', 'ex-rosca-scott',
    'ex-triceps-testa-halter', 'ex-triceps-frances-halter', 'ex-triceps-polia',
    'ex-crossover-polia'].includes(spec.exerciseId) || profile.apparatus === 'peck-deck';
  const freeLegs = ['leg-extension', 'seated-leg-curl', 'lying-leg-curl', 'hip-adductor', 'hip-abductor'].includes(profile.apparatus);
  for (const [s, f] of [['near', 'right'], ['far', 'left']] as const) {
    const hand = `${s}Hand` as const, foot = `${s}Foot` as const;
    const moves = (k: ProfileJoint) => profile.start[k].x !== profile.end[k].x || profile.start[k].y !== profile.end[k].y;
    chain(['shoulder', `${f}Shoulder`], [`${s}Elbow`, `${f}Elbow`], [hand, `${f}Hand`], freeArms || (coreReach && moves(hand)));
    chain(['hip', `${f}Hip`], [`${s}Knee`, `${f}Knee`], [foot, `${f}Foot`], freeLegs || (coreReach && moves(foot)));
  }
  // Small near/far offsets separate the silhouettes in profile. A mirrored
  // grip or pair of footrests must remain level when seen from the front.
  for (const joint of ['Elbow', 'Hand', 'Knee', 'Foot'] as const) {
    const left = `left${joint}` as const, right = `right${joint}` as const;
    const mirrored = [face.start, face.mid ?? face.start, face.end].every(p =>
      p[left].y === p[right].y &&
      Math.abs(p[left].x + p[right].x - p.leftHip.x - p.rightHip.x) < 1);
    if (mirrored) {
      const y = (front[left].y + front[right].y) / 2;
      front[left] = { ...front[left], y };
      front[right] = { ...front[right], y };
    }
  }
  return { side, front };
}

// Looking down on the standing athlete. Forward is up on the page.
// The profile contains a small drawing offset between bilateral limbs. Use
// their common depth for this symmetric press and one shared cable handle.
export function pallofPlan(side: SidePose, front: FrontPose): FrontPose {
  const plan = { ...front };
  const y = (depth: number) => 119 - (depth - side.hip.x);
  for (const [f, s] of [['Shoulder', 'shoulder'], ['Hip', 'hip']] as const) {
    for (const limb of ['left', 'right'] as const) {
      plan[`${limb}${f}`] = { x: front[`${limb}${f}`].x, y: y(side[s].x) };
    }
  }
  for (const joint of ['Elbow', 'Hand', 'Knee', 'Foot'] as const) {
    const depth = (side[`near${joint}`].x + side[`far${joint}`].x) / 2;
    for (const limb of ['left', 'right'] as const) {
      plan[`${limb}${joint}`] = { x: front[`${limb}${joint}`].x, y: y(depth) };
    }
  }
  plan.head = { x: front.head.x, y: y(side.head.x) };
  plan.neck = { x: front.neck.x, y: y(side.neck.x) };
  return plan;
}

export interface ProjectedAxis {
  x: number;
  y: number;
  towardCamera: number;
}

// Both halves of the rope have the same fixed length. Locate the attachment
// ring on the cable side of the hands before projecting it into either view.
export function ropeRing(spec: ExerciseAnimationSpec, side: SidePose, front: FrontPose) {
  const anchor: Vector = [spec.front.apparatusConfig?.anchorX ?? 160,
    spec.side.apparatusConfig?.anchorX ?? 234, spec.side.apparatusConfig?.anchorY ?? 28];
  const left = position(side, front, ['farHand', 'leftHand']);
  const right = position(side, front, ['nearHand', 'rightHand']);
  const ring = solveHinge(left, anchor, right, 36, 36);
  return {
    side: { x: ring[1], y: ring[2] },
    front: { x: ring[0], y: ring[2] + (front.leftHand.y + front.rightHand.y - left[2] - right[2]) / 2 },
  };
}

// A neutral-grip shaft is transverse to the forearm in the sagittal plane.
// Project the same unit vector into each camera, including the hidden axis.
export function dumbbellAxis(spec: ExerciseAnimationSpec, view: AnimationView, elbow: Point2D, hand: Point2D): ProjectedAxis {
  let width = 0, depth = 0, down = 0;
  if (spec.side.grip !== 'neutral') {
    width = 1;
  } else if (['ex-elevacao-lateral', 'ex-crucifixo-halter', 'ex-agach-bulgaro'].includes(spec.exerciseId)) {
    depth = 1;
  } else {
    const dx = hand.x - elbow.x, dy = hand.y - elbow.y;
    const length = Math.hypot(dx, dy) || 1;
    depth = dy / length;
    down = -dx / length;
  }
  if (view === 'side') return { x: depth, y: down, towardCamera: width };
  if (view === 'top') return { x: width, y: depth, towardCamera: -down };
  return { x: width, y: down, towardCamera: depth };
}

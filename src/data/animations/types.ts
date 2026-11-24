export interface Point2D {
  x: number;
  y: number;
}

export interface SidePose {
  head: Point2D;
  neck: Point2D;
  shoulder: Point2D;
  hip: Point2D;
  farElbow: Point2D;
  farHand: Point2D;
  nearElbow: Point2D;
  nearHand: Point2D;
  farKnee: Point2D;
  farFoot: Point2D;
  nearKnee: Point2D;
  nearFoot: Point2D;
  faceDir?: 1 | -1;
}

export interface FrontPose {
  head: Point2D;
  neck: Point2D;
  leftShoulder: Point2D;
  rightShoulder: Point2D;
  leftHip: Point2D;
  rightHip: Point2D;
  leftElbow: Point2D;
  rightElbow: Point2D;
  leftHand: Point2D;
  rightHand: Point2D;
  leftKnee: Point2D;
  rightKnee: Point2D;
  leftFoot: Point2D;
  rightFoot: Point2D;
}

export type ApparatusPreset =
  | 'none'
  | 'mat'
  | 'flat-bench'
  | 'incline-bench'
  | 'chest-press-machine'
  | 'peck-deck'
  | 'dual-cable-high'
  | 'lat-pulldown'
  | 'chest-supported-row'
  | 'seated-cable-row'
  | 'cable-single'
  | 'shoulder-press-machine'
  | 'preacher-bench'
  | 'leg-press-45'
  | 'bulgarian-bench'
  | 'leg-extension'
  | 'seated-leg-curl'
  | 'lying-leg-curl'
  | 'hip-thrust-bench'
  | 'hip-abductor'
  | 'hip-adductor'
  | 'seated-calf'
  | 'standing-calf';

export type LoadStyle =
  | 'none'
  | 'dumbbells'
  | 'dumbbell-near'
  | 'bar-wide'
  | 'v-bar'
  | 'rope'
  | 'cable-handle'
  | 'hip-barbell';

export type ActiveBodyRegion =
  | 'chest'
  | 'upper-back'
  | 'lats'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'abs'
  | 'obliques'
  | 'lower-back'
  | 'glutes'
  | 'quads'
  | 'adductors'
  | 'hamstrings'
  | 'calves'
  | 'forearms'
  | 'traps';

export interface ApparatusConfig {
  anchorX?: number;
  anchorY?: number;
  benchX?: number;
  benchY?: number;
  seatX?: number;
  seatY?: number;
  pivotX?: number;
  pivotY?: number;
  padX?: number;
  padY?: number;
  cableHand?: 'left' | 'right' | 'both' | 'near' | 'far';
}

export type AnimationView = 'side' | 'front';

export type GripType = 'pronated' | 'supinated' | 'neutral' | 'open' | 'mixed';

export interface SideViewSpec {
  apparatus: ApparatusPreset;
  apparatusConfig?: ApparatusConfig;
  load: LoadStyle;
  grip: GripType;
  gripNote: string;
  start: SidePose;
  mid?: SidePose;
  end: SidePose;
  motionArrows: string[];
}

export interface FrontViewSpec {
  apparatus: ApparatusPreset;
  apparatusConfig?: ApparatusConfig;
  load: LoadStyle;
  grip: GripType;
  gripNote: string;
  start: FrontPose;
  mid?: FrontPose;
  end: FrontPose;
  motionArrows: string[];
}

export interface ExerciseAnimationSpec {
  exerciseId: string;
  defaultView: AnimationView;
  isometric?: boolean;
  activeHighlights: ActiveBodyRegion[];
  side: SideViewSpec;
  front: FrontViewSpec;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function quadBezier(a: number, b: number, c: number, t: number): number {
  const u = 1 - t;
  return u * u * a + 2 * u * t * b + t * t * c;
}

function interpPoint(
  a: Point2D,
  b: Point2D | undefined,
  c: Point2D,
  t: number
): Point2D {
  if (!b) {
    return { x: lerp(a.x, c.x, t), y: lerp(a.y, c.y, t) };
  }
  return {
    x: quadBezier(a.x, b.x, c.x, t),
    y: quadBezier(a.y, b.y, c.y, t),
  };
}

export function easeInOutSine(t: number): number {
  const clamped = Math.max(0, Math.min(1, t));
  return -(Math.cos(Math.PI * clamped) - 1) / 2;
}

export function interpolateSidePose(
  start: SidePose,
  mid: SidePose | undefined,
  end: SidePose,
  rawT: number
): SidePose {
  const t = easeInOutSine(rawT);
  return {
    head: interpPoint(start.head, mid?.head, end.head, t),
    neck: interpPoint(start.neck, mid?.neck, end.neck, t),
    shoulder: interpPoint(start.shoulder, mid?.shoulder, end.shoulder, t),
    hip: interpPoint(start.hip, mid?.hip, end.hip, t),
    farElbow: interpPoint(start.farElbow, mid?.farElbow, end.farElbow, t),
    farHand: interpPoint(start.farHand, mid?.farHand, end.farHand, t),
    nearElbow: interpPoint(start.nearElbow, mid?.nearElbow, end.nearElbow, t),
    nearHand: interpPoint(start.nearHand, mid?.nearHand, end.nearHand, t),
    farKnee: interpPoint(start.farKnee, mid?.farKnee, end.farKnee, t),
    farFoot: interpPoint(start.farFoot, mid?.farFoot, end.farFoot, t),
    nearKnee: interpPoint(start.nearKnee, mid?.nearKnee, end.nearKnee, t),
    nearFoot: interpPoint(start.nearFoot, mid?.nearFoot, end.nearFoot, t),
    faceDir: end.faceDir ?? start.faceDir ?? 1,
  };
}

export function interpolateFrontPose(
  start: FrontPose,
  mid: FrontPose | undefined,
  end: FrontPose,
  rawT: number
): FrontPose {
  const t = easeInOutSine(rawT);
  return {
    head: interpPoint(start.head, mid?.head, end.head, t),
    neck: interpPoint(start.neck, mid?.neck, end.neck, t),
    leftShoulder: interpPoint(start.leftShoulder, mid?.leftShoulder, end.leftShoulder, t),
    rightShoulder: interpPoint(start.rightShoulder, mid?.rightShoulder, end.rightShoulder, t),
    leftHip: interpPoint(start.leftHip, mid?.leftHip, end.leftHip, t),
    rightHip: interpPoint(start.rightHip, mid?.rightHip, end.rightHip, t),
    leftElbow: interpPoint(start.leftElbow, mid?.leftElbow, end.leftElbow, t),
    rightElbow: interpPoint(start.rightElbow, mid?.rightElbow, end.rightElbow, t),
    leftHand: interpPoint(start.leftHand, mid?.leftHand, end.leftHand, t),
    rightHand: interpPoint(start.rightHand, mid?.rightHand, end.rightHand, t),
    leftKnee: interpPoint(start.leftKnee, mid?.leftKnee, end.leftKnee, t),
    rightKnee: interpPoint(start.rightKnee, mid?.rightKnee, end.rightKnee, t),
    leftFoot: interpPoint(start.leftFoot, mid?.leftFoot, end.leftFoot, t),
    rightFoot: interpPoint(start.rightFoot, mid?.rightFoot, end.rightFoot, t),
  };
}

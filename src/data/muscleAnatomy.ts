import type { MuscleGroup } from '../db/types';

export type MuscleId =
  | 'chest-upper'
  | 'chest-mid'
  | 'deltoid-front'
  | 'deltoid-side'
  | 'deltoid-rear'
  | 'traps-upper'
  | 'traps-mid'
  | 'lats'
  | 'rotator-cuff'
  | 'lower-back'
  | 'biceps'
  | 'triceps'
  | 'forearms'
  | 'abs'
  | 'obliques'
  | 'glutes'
  | 'glute-med'
  | 'quads'
  | 'adductors'
  | 'hamstrings'
  | 'calves-gastroc'
  | 'calves-soleus';

export interface MuscleDefinition {
  id: MuscleId;
  name: string;
  region: string;
  views: ('front' | 'back')[];
}

export const MUSCLE_DEFINITIONS: Record<MuscleId, MuscleDefinition> = {
  'chest-upper': {
    id: 'chest-upper',
    name: 'Peitoral Superior (Clavicular)',
    region: 'Peito',
    views: ['front'],
  },
  'chest-mid': {
    id: 'chest-mid',
    name: 'Peitoral Maior (Esternal)',
    region: 'Peito',
    views: ['front'],
  },
  'deltoid-front': {
    id: 'deltoid-front',
    name: 'Deltoide Anterior',
    region: 'Ombros',
    views: ['front'],
  },
  'deltoid-side': {
    id: 'deltoid-side',
    name: 'Deltoide Lateral (Medial)',
    region: 'Ombros',
    views: ['front', 'back'],
  },
  'deltoid-rear': {
    id: 'deltoid-rear',
    name: 'Deltoide Posterior',
    region: 'Ombros',
    views: ['back'],
  },
  'traps-upper': {
    id: 'traps-upper',
    name: 'Trapézio Superior',
    region: 'Costas / Ombros',
    views: ['front', 'back'],
  },
  'traps-mid': {
    id: 'traps-mid',
    name: 'Trapézio Médio / Romboides',
    region: 'Costas',
    views: ['back'],
  },
  lats: {
    id: 'lats',
    name: 'Grande Dorsal (Latíssimo)',
    region: 'Costas',
    views: ['front', 'back'],
  },
  'rotator-cuff': {
    id: 'rotator-cuff',
    name: 'Manguito Rotador (Infraespinal / Redondo Menor)',
    region: 'Ombros / Costas',
    views: ['back'],
  },
  'lower-back': {
    id: 'lower-back',
    name: 'Eretores da Espinha / Lombar',
    region: 'Costas / Core',
    views: ['back'],
  },
  biceps: {
    id: 'biceps',
    name: 'Bíceps Braquial / Braquial',
    region: 'Braços',
    views: ['front'],
  },
  triceps: {
    id: 'triceps',
    name: 'Tríceps Braquial',
    region: 'Braços',
    views: ['back'],
  },
  forearms: {
    id: 'forearms',
    name: 'Antebraços / Braquiorradial',
    region: 'Braços',
    views: ['front', 'back'],
  },
  abs: {
    id: 'abs',
    name: 'Reto Abdominal / Transverso',
    region: 'Core',
    views: ['front'],
  },
  obliques: {
    id: 'obliques',
    name: 'Oblíquos (Interno / Externo)',
    region: 'Core',
    views: ['front'],
  },
  glutes: {
    id: 'glutes',
    name: 'Glúteo Máximo',
    region: 'Quadril / Pernas',
    views: ['back'],
  },
  'glute-med': {
    id: 'glute-med',
    name: 'Glúteo Médio / Abdutores',
    region: 'Quadril / Pernas',
    views: ['front', 'back'],
  },
  quads: {
    id: 'quads',
    name: 'Quadríceps (Anterior da Coxa)',
    region: 'Pernas',
    views: ['front'],
  },
  adductors: {
    id: 'adductors',
    name: 'Adutores da Coxa',
    region: 'Pernas',
    views: ['front'],
  },
  hamstrings: {
    id: 'hamstrings',
    name: 'Isquiotibiais (Posterior de Coxa)',
    region: 'Pernas',
    views: ['back'],
  },
  'calves-gastroc': {
    id: 'calves-gastroc',
    name: 'Panturrilha (Gastrocnêmio)',
    region: 'Pernas',
    views: ['back'],
  },
  'calves-soleus': {
    id: 'calves-soleus',
    name: 'Panturrilha (Sóleo)',
    region: 'Pernas',
    views: ['front', 'back'],
  },
};

export interface MusclePathGroup {
  id: MuscleId;
  paths: string[];
}

// Vista Anterior (Frente) — viewBox 0 0 200 420, eixo central em x = 100
export const FRONT_BODY_SILHOUETTE = [
  // Cabeça e pescoço
  'M 100 18 C 89 18 82 27 82 39 C 82 51 89 60 100 60 C 111 60 118 51 118 39 C 118 27 111 18 100 18 Z',
  // Corpo completo simétrico (pescoço, ombros, braços, tronco, quadris, pernas e pés)
  'M 90 59 L 87 70 L 66 76 C 52 80 46 92 43 108 L 35 152 L 26 196 C 24 205 27 215 33 216 C 38 217 42 209 44 198 L 53 156 L 60 118 L 62 152 L 66 196 L 61 232 C 57 260 61 292 67 322 L 69 374 L 64 396 C 63 403 69 406 76 406 C 83 406 87 401 86 393 L 86 372 L 94 318 L 96 252 L 100 246 L 104 252 L 106 318 L 114 372 L 114 393 C 113 401 117 406 124 406 C 131 406 137 403 136 396 L 131 374 L 133 322 C 139 292 143 260 139 232 L 134 196 L 138 152 L 140 118 L 147 156 L 156 198 C 158 209 162 217 167 216 C 173 215 176 205 174 196 L 165 152 L 157 108 C 154 92 148 80 134 76 L 113 70 L 110 59 Z',
];

export const FRONT_MUSCLE_PATHS: MusclePathGroup[] = [
  {
    id: 'traps-upper',
    paths: [
      'M 88 64 L 67 77 L 82 81 L 93 70 Z',
      'M 112 64 L 133 77 L 118 81 L 107 70 Z',
    ],
  },
  {
    id: 'deltoid-front',
    paths: [
      'M 66 78 C 57 82 53 91 54 103 L 64 98 C 67 89 69 83 66 78 Z',
      'M 134 78 C 143 82 147 91 146 103 L 136 98 C 133 89 131 83 134 78 Z',
    ],
  },
  {
    id: 'deltoid-side',
    paths: [
      'M 56 83 C 47 88 44 101 47 113 L 55 107 C 54 97 56 89 56 83 Z',
      'M 144 83 C 153 88 156 101 153 113 L 145 107 C 146 97 144 89 144 83 Z',
    ],
  },
  {
    id: 'chest-upper',
    paths: [
      'M 98 83 L 71 81 L 67 93 L 98 95 Z',
      'M 102 83 L 129 81 L 133 93 L 102 95 Z',
    ],
  },
  {
    id: 'chest-mid',
    paths: [
      'M 98 96 L 67 95 C 66 110 73 121 88 121 L 98 117 Z',
      'M 102 96 L 133 95 C 134 110 127 121 112 121 L 102 117 Z',
    ],
  },
  {
    id: 'lats',
    paths: [
      'M 64 116 L 59 144 L 68 152 L 71 124 Z',
      'M 136 116 L 141 144 L 132 152 L 129 124 Z',
    ],
  },
  {
    id: 'biceps',
    paths: [
      'M 47 115 C 44 128 45 142 50 150 L 57 146 C 59 135 58 123 54 113 Z',
      'M 153 115 C 156 128 155 142 150 150 L 143 146 C 141 135 142 123 146 113 Z',
    ],
  },
  {
    id: 'forearms',
    paths: [
      'M 43 153 L 33 191 L 41 193 L 52 156 Z',
      'M 157 153 L 167 191 L 159 193 L 148 156 Z',
    ],
  },
  {
    id: 'abs',
    paths: [
      // Segmentos bilaterais do reto abdominal
      'M 88 125 H 98 V 142 H 88 Z',
      'M 102 125 H 112 V 142 H 102 Z',
      'M 88 145 H 98 V 162 H 88 Z',
      'M 102 145 H 112 V 162 H 102 Z',
      'M 89 165 H 98 V 182 H 89 Z',
      'M 102 165 H 111 V 182 H 102 Z',
      'M 90 185 L 98 185 L 98 209 L 92 203 Z',
      'M 110 185 L 102 185 L 102 209 L 108 203 Z',
    ],
  },
  {
    id: 'obliques',
    paths: [
      'M 70 132 L 84 128 L 86 184 L 74 196 C 68 175 68 152 70 132 Z',
      'M 130 132 L 116 128 L 114 184 L 126 196 C 132 175 132 152 130 132 Z',
    ],
  },
  {
    id: 'glute-med',
    paths: [
      'M 67 196 L 76 202 L 72 224 L 62 218 Z',
      'M 133 196 L 124 202 L 128 224 L 138 218 Z',
    ],
  },
  {
    id: 'quads',
    paths: [
      'M 64 224 C 60 252 62 288 71 312 L 88 312 C 92 282 91 250 85 224 Z',
      'M 136 224 C 140 252 138 288 129 312 L 112 312 C 108 282 109 250 115 224 Z',
    ],
  },
  {
    id: 'adductors',
    paths: [
      'M 96 228 L 87 228 L 91 294 L 97 272 Z',
      'M 104 228 L 113 228 L 109 294 L 103 272 Z',
    ],
  },
  {
    id: 'calves-soleus',
    paths: [
      'M 70 330 C 66 346 68 364 73 375 L 82 375 C 85 361 85 344 82 330 Z',
      'M 130 330 C 134 346 132 364 127 375 L 118 375 C 115 361 115 344 118 330 Z',
    ],
  },
];

// Vista Posterior (Costas) — viewBox 0 0 200 420, eixo central em x = 100
export const BACK_BODY_SILHOUETTE = [
  'M 100 18 C 89 18 82 27 82 39 C 82 51 89 60 100 60 C 111 60 118 51 118 39 C 118 27 111 18 100 18 Z',
  'M 90 59 L 87 70 L 66 76 C 52 80 46 92 43 108 L 35 152 L 26 196 C 24 205 27 215 33 216 C 38 217 42 209 44 198 L 53 156 L 60 118 L 62 152 L 65 192 L 61 232 C 58 260 61 292 67 322 L 69 374 L 65 396 C 64 403 70 406 76 406 C 83 406 87 401 86 393 L 86 372 L 94 318 L 96 250 L 100 245 L 104 250 L 106 318 L 114 372 L 114 393 C 113 401 117 406 124 406 C 130 406 136 403 135 396 L 131 374 L 133 322 C 139 292 142 260 139 232 L 135 192 L 138 152 L 140 118 L 147 156 L 156 198 C 158 209 162 217 167 216 C 173 215 176 205 174 196 L 165 152 L 157 108 C 154 92 148 80 134 76 L 113 70 L 110 59 Z',
];

export const BACK_MUSCLE_PATHS: MusclePathGroup[] = [
  {
    id: 'traps-upper',
    paths: [
      'M 100 62 L 88 62 L 69 78 L 88 86 L 100 88 L 112 86 L 131 78 L 112 62 Z',
    ],
  },
  {
    id: 'traps-mid',
    paths: [
      'M 86 87 L 100 89 L 114 87 L 112 121 L 100 134 L 88 121 Z',
    ],
  },
  {
    id: 'deltoid-rear',
    paths: [
      'M 67 79 C 59 83 56 93 58 104 L 70 100 L 73 86 Z',
      'M 133 79 C 141 83 144 93 142 104 L 130 100 L 127 86 Z',
    ],
  },
  {
    id: 'deltoid-side',
    paths: [
      'M 57 83 C 47 88 44 101 47 113 L 56 108 C 55 98 57 89 57 83 Z',
      'M 143 83 C 153 88 156 101 153 113 L 144 108 C 145 98 143 89 143 83 Z',
    ],
  },
  {
    id: 'rotator-cuff',
    paths: [
      'M 72 95 L 85 95 L 84 114 L 68 112 Z',
      'M 128 95 L 115 95 L 116 114 L 132 112 Z',
    ],
  },
  {
    id: 'lats',
    paths: [
      'M 64 115 L 84 118 L 93 140 L 89 172 L 70 162 C 63 145 62 128 64 115 Z',
      'M 136 115 L 116 118 L 107 140 L 111 172 L 130 162 C 137 145 138 128 136 115 Z',
    ],
  },
  {
    id: 'lower-back',
    paths: [
      'M 90 142 L 99 142 L 98 192 L 87 188 Z',
      'M 110 142 L 101 142 L 102 192 L 113 188 Z',
    ],
  },
  {
    id: 'triceps',
    paths: [
      'M 47 115 C 44 129 46 143 51 151 L 58 147 C 60 135 58 123 55 113 Z',
      'M 153 115 C 156 129 154 143 149 151 L 142 147 C 140 135 142 123 145 113 Z',
    ],
  },
  {
    id: 'forearms',
    paths: [
      'M 43 153 L 33 191 L 41 193 L 52 156 Z',
      'M 157 153 L 167 191 L 159 193 L 148 156 Z',
    ],
  },
  {
    id: 'glute-med',
    paths: [
      'M 66 190 L 86 193 L 78 210 L 63 206 Z',
      'M 134 190 L 114 193 L 122 210 L 137 206 Z',
    ],
  },
  {
    id: 'glutes',
    paths: [
      'M 64 207 C 61 224 67 242 84 244 L 98 238 L 97 202 L 77 207 Z',
      'M 136 207 C 139 224 133 242 116 244 L 102 238 L 103 202 L 123 207 Z',
    ],
  },
  {
    id: 'hamstrings',
    paths: [
      'M 66 245 C 62 271 65 298 72 316 L 91 316 C 94 292 93 266 90 245 Z',
      'M 134 245 C 138 271 135 298 128 316 L 109 316 C 106 292 107 266 110 245 Z',
    ],
  },
  {
    id: 'calves-gastroc',
    paths: [
      'M 69 327 C 65 341 67 355 74 361 L 84 360 C 88 349 87 336 83 326 Z',
      'M 131 327 C 135 341 133 355 126 361 L 116 360 C 112 349 113 336 117 326 Z',
    ],
  },
  {
    id: 'calves-soleus',
    paths: [
      'M 72 361 L 83 361 L 81 381 L 74 381 Z',
      'M 128 361 L 117 361 L 119 381 L 126 381 Z',
    ],
  },
];

export const MUSCLE_GROUP_FALLBACK_MAP: Record<
  MuscleGroup,
  { primary: MuscleId[]; secondary: MuscleId[] }
> = {
  Peito: {
    primary: ['chest-mid', 'chest-upper'],
    secondary: ['deltoid-front', 'triceps'],
  },
  Costas: {
    primary: ['lats', 'traps-mid'],
    secondary: ['deltoid-rear', 'biceps'],
  },
  Pernas: {
    primary: ['quads', 'glutes'],
    secondary: ['hamstrings', 'calves-gastroc'],
  },
  Ombros: {
    primary: ['deltoid-side', 'deltoid-front'],
    secondary: ['traps-upper', 'triceps'],
  },
  Braços: {
    primary: ['biceps', 'triceps'],
    secondary: ['forearms'],
  },
  Core: {
    primary: ['abs', 'obliques'],
    secondary: ['lower-back', 'glutes'],
  },
  'Cardio/Mobilidade': {
    primary: ['quads', 'calves-gastroc'],
    secondary: ['abs', 'glutes'],
  },
  Outro: {
    primary: ['abs'],
    secondary: ['lower-back'],
  },
};

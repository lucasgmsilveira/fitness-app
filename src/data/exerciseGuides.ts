import type { Exercise } from '../db/types';
import { MUSCLE_GROUP_FALLBACK_MAP, type MuscleId } from './muscleAnatomy';

export interface ExerciseGuide {
  exerciseId: string;
  primaryMuscles: MuscleId[];
  secondaryMuscles: MuscleId[];
  executionSteps: string[];
  breathing: string;
  postureCues: string[];
  movementType: 'dynamic' | 'isometric';
  phaseLabels: {
    start: string;
    end: string;
  };
  referenceNote: string;
}

const DEFAULT_REF_NOTE =
  'Mapeamento anatômico baseado em cinesiologia padrão (ExRx.net · NSCA · ACE Fitness).';

export const EXERCISE_GUIDES: Record<string, ExerciseGuide> = {
  // === CORE E ESTABILIDADE ===
  'ex-prancha': {
    exerciseId: 'ex-prancha',
    primaryMuscles: ['abs'],
    secondaryMuscles: ['obliques', 'lower-back', 'glutes', 'deltoid-front', 'quads'],
    executionSteps: [
      'Apoie os antebraços no solo com os cotovelos alinhados exatamente abaixo dos ombros.',
      'Estenda as pernas atrás mantendo os pés na largura do quadril e eleve o corpo em linha reta.',
      'Ative abdômen e glúteos para evitar que o quadril caia ou suba em excesso durante toda a série.',
    ],
    breathing: 'Respiração contínua e controlada pelo diafragma sem prender o ar.',
    postureCues: [
      'Mantenha cabeça alinhada ao tronco olhando para o solo entre as mãos.',
      'Empurre levemente o chão com os antebraços para estabilizar as escápulas.',
    ],
    movementType: 'isometric',
    phaseLabels: { start: 'Alinhamento Inicial', end: 'Sustentação Isométrica' },
    referenceNote: DEFAULT_REF_NOTE,
  },
  'ex-dead-bug': {
    exerciseId: 'ex-dead-bug',
    primaryMuscles: ['abs', 'obliques'],
    secondaryMuscles: ['lower-back', 'quads'],
    executionSteps: [
      'Deite-se de costas com braços estendidos para o teto e quadris e joelhos flexionados a 90°.',
      'Pressione suavemente a região lombar contra o solo ativando o abdômen profundo.',
      'Estenda simultaneamente um braço para trás e a perna oposta à frente sem tirar a lombar do chão.',
      'Retorne devagar à posição inicial e alterne os lados com controle.',
    ],
    breathing: 'Expire lentamente ao estender braço e perna; inspire ao retornar ao centro.',
    postureCues: [
      'Interrompa a extensão da perna antes que a lombar comece a arquear.',
      'Mantenha costelas baixas e pescoço relaxado apoiado no colchonete.',
    ],
    movementType: 'dynamic',
    phaseLabels: { start: 'Posição Inicial (90°)', end: 'Extensão Cruzada' },
    referenceNote: DEFAULT_REF_NOTE,
  },
  'ex-bird-dog': {
    exerciseId: 'ex-bird-dog',
    primaryMuscles: ['lower-back', 'glutes'],
    secondaryMuscles: ['abs', 'obliques', 'hamstrings', 'deltoid-rear', 'traps-mid'],
    executionSteps: [
      'Posicione-se em quatro apoios com mãos sob os ombros e joelhos sob os quadris, mantendo coluna neutra.',
      'Estenda simultaneamente um braço à frente e a perna oposta para trás até ficarem paralelos ao solo.',
      'Segure por 1 a 2 segundos contraindo glúteo e core, depois retorne sem balançar o tronco.',
    ],
    breathing: 'Expire ao estender os membros e estabilizar; inspire ao retornar à base.',
    postureCues: [
      'Evite elevar a perna acima da linha do quadril para não hiperestender a lombar.',
      'Mantenha a pelve nivelada, sem girar o quadril para o lado elevado.',
    ],
    movementType: 'dynamic',
    phaseLabels: { start: 'Base em 4 Apoios', end: 'Extensão Estabilizada' },
    referenceNote: DEFAULT_REF_NOTE,
  },
  'ex-pallof-press': {
    exerciseId: 'ex-pallof-press',
    primaryMuscles: ['obliques', 'abs'],
    secondaryMuscles: ['lower-back', 'glute-med', 'deltoid-front'],
    executionSteps: [
      'Posicione a polia na altura do peito, segure o pegador com as duas mãos e afaste-se lateralmente até gerar tensão.',
      'Com pés na largura dos ombros e joelhos destravados, traga as mãos junto ao centro do esterno.',
      'Empurre as mãos retas à frente estendendo os cotovelos sem deixar o cabo girar o tronco.',
      'Sustente por 1 a 2 segundos e retorne ao peito de forma controlada.',
    ],
    breathing: 'Expire ao estender os braços à frente; inspire ao trazer as mãos ao peito.',
    postureCues: [
      'Mantenha ombros nivelados, longe das orelhas, e tronco imóvel contra a tração lateral.',
      'Ative glúteos e abdômen antes de empurrar o pegador.',
    ],
    movementType: 'dynamic',
    phaseLabels: { start: 'Pegador no Centro', end: 'Extensão Anti-Rotação' },
    referenceNote: DEFAULT_REF_NOTE,
  },
  'ex-prancha-lateral': {
    exerciseId: 'ex-prancha-lateral',
    primaryMuscles: ['obliques', 'abs'],
    secondaryMuscles: ['glute-med', 'lower-back', 'deltoid-side'],
    executionSteps: [
      'Deite-se de lado apoiando o antebraço no solo com o cotovelo diretamente abaixo do ombro.',
      'Alinhe tornozelos, joelhos, quadris e ombros formando uma linha reta lateral.',
      'Eleve o quadril do chão e sustente a posição mantendo o tronco firme sem inclinar à frente.',
    ],
    breathing: 'Respire de forma ritmada e constante durante toda a sustentação.',
    postureCues: [
      'Empurre o ombro de apoio para longe da orelha mantendo o peito aberto.',
      'Se necessário reduzir a alavanca, flexione os joelhos apoiando-os no solo.',
    ],
    movementType: 'isometric',
    phaseLabels: { start: 'Apoio Lateral', end: 'Sustentação Lateral' },
    referenceNote: DEFAULT_REF_NOTE,
  },

  // === PEITO ===
  'ex-supino-halter': {
    exerciseId: 'ex-supino-halter',
    primaryMuscles: ['chest-mid'],
    secondaryMuscles: ['chest-upper', 'deltoid-front', 'triceps'],
    executionSteps: [
      'Deite-se no banco reto com os pés firmes no chão e escápulas levemente retraídas contra o estofado.',
      'Segure os halteres alinhados ao meio do peito com cotovelos a cerca de 45° em relação ao tronco.',
      'Empurre os halteres para cima em arco suave até quase estender os cotovelos sem bater os pesos.',
      'Desça controladamente em 2 a 3 segundos até a linha lateral do peitoral.',
    ],
    breathing: 'Inspire na descida controlada; expire ao empurrar os halteres para cima.',
    postureCues: [
      'Mantenha glúteos apoiados no banco e curvatura lombar natural sem arco excessivo.',
      'Evite abrir os cotovelos a 90° para proteger a articulação dos ombros.',
    ],
    movementType: 'dynamic',
    phaseLabels: { start: 'Descida no Peito', end: 'Extensão Superior' },
    referenceNote: DEFAULT_REF_NOTE,
  },
  'ex-crucifixo-halter': {
    exerciseId: 'ex-crucifixo-halter',
    primaryMuscles: ['chest-mid', 'chest-upper'],
    secondaryMuscles: ['deltoid-front', 'biceps'],
    executionSteps: [
      'Deite-se no banco reto com halteres erguidos acima do peito, palmas voltadas uma para a outra.',
      'Com uma leve flexão fixa nos cotovelos, abra os braços lateralmente em arco amplo e controlado.',
      'Desça apenas até sentir alongamento confortável no peitoral na altura dos ombros.',
      'Retorne fechando os braços como se abraçasse um tronco largo, contraindo o peito.',
    ],
    breathing: 'Inspire ao abrir os braços; expire ao fechá-los acima do peito.',
    postureCues: [
      'Não transforme o movimento em supino dobrando muito os cotovelos no fundo.',
      'Mantenha lombar estável e pés firmes no chão.',
    ],
    movementType: 'dynamic',
    phaseLabels: { start: 'Abertura Lateral', end: 'Adução / Fechamento' },
    referenceNote: DEFAULT_REF_NOTE,
  },
  'ex-supino-inclinado-halter': {
    exerciseId: 'ex-supino-inclinado-halter',
    primaryMuscles: ['chest-upper'],
    secondaryMuscles: ['chest-mid', 'deltoid-front', 'triceps'],
    executionSteps: [
      'Ajuste o banco inclinado em aproximadamente 30° e apoie totalmente costas e cabeça.',
      'Posicione os halteres na linha superior do peitoral com cotovelos levemente fechados (~45°).',
      'Empurre verticalmente acima da parte superior do peito até extensão controlada dos braços.',
      'Desça devagar mantendo os punhos alinhados sobre os cotovelos.',
    ],
    breathing: 'Inspire na descida; expire durante a subida dos halteres.',
    postureCues: [
      'Evite inclinação muito alta (>45°) para não transferir o foco excessivamente aos ombros.',
      'Mantenha pés firmes no solo e coluna estabilizada contra o encosto.',
    ],
    movementType: 'dynamic',
    phaseLabels: { start: 'Halteres no Peito Superior', end: 'Empurrada Inclinada' },
    referenceNote: DEFAULT_REF_NOTE,
  },
  'ex-supino-maquina': {
    exerciseId: 'ex-supino-maquina',
    primaryMuscles: ['chest-mid'],
    secondaryMuscles: ['chest-upper', 'deltoid-front', 'triceps'],
    executionSteps: [
      'Ajuste o banco para que os pegadores fiquem alinhados à altura média do peitoral.',
      'Apoie costas e cabeça firmemente no encosto, mantendo ombros baixos e para trás.',
      'Empurre as alavancas à frente até quase estender os cotovelos sem travar a articulação.',
      'Retorne devagar resistindo ao peso até sentir leve alongamento peitoral.',
    ],
    breathing: 'Expire ao empurrar à frente; inspire no retorno controlado.',
    postureCues: [
      'Não projete os ombros para a frente ao final do movimento; mantenha escápulas apoiadas.',
      'Mantenha punhos neutros alinhados aos antebraços.',
    ],
    movementType: 'dynamic',
    phaseLabels: { start: 'Posição Inicial', end: 'Extensão Guiada' },
    referenceNote: DEFAULT_REF_NOTE,
  },
  'ex-crucifixo-maquina': {
    exerciseId: 'ex-crucifixo-maquina',
    primaryMuscles: ['chest-mid'],
    secondaryMuscles: ['chest-upper', 'deltoid-front'],
    executionSteps: [
      'Ajuste o assento de modo que braços e pegadores fiquem na linha do meio do peitoral.',
      'Apoie totalmente as costas no encosto e segure os pegadores com cotovelos levemente flexionados.',
      'Aproxime os braços à frente do peito em movimento contínuo e contraia por 1 segundo.',
      'Retorne abrindo até o limite confortável dos ombros sem perder o apoio das costas.',
    ],
    breathing: 'Expire ao juntar os braços à frente; inspire ao abrir.',
    postureCues: [
      'Evite desencostar a lombar ou inclinar a cabeça à frente na contração.',
      'Mantenha os ombros baixos durante todo o arco.',
    ],
    movementType: 'dynamic',
    phaseLabels: { start: 'Braços Abertos', end: 'Adução Frontal' },
    referenceNote: DEFAULT_REF_NOTE,
  },
  'ex-crossover-polia': {
    exerciseId: 'ex-crossover-polia',
    primaryMuscles: ['chest-mid'],
    secondaryMuscles: ['chest-upper', 'deltoid-front', 'abs'],
    executionSteps: [
      'Posicione as polias acima da linha dos ombros e dê um passo à frente em base alternada.',
      'Incline levemente o tronco à frente mantendo coluna neutra e abdômen firme.',
      'Com cotovelos levemente dobrados, puxe os cabos para baixo e para o centro à frente do quadril.',
      'Retorne abrindo os braços com controle até a linha do tronco.',
    ],
    breathing: 'Expire ao cruzar/aproximar as mãos à frente; inspire ao abrir.',
    postureCues: [
      'A base alternada (um pé à frente do outro) estabiliza a lombar contra a tração dos cabos.',
      'Evite balançar o tronco para ajudar na puxada.',
    ],
    movementType: 'dynamic',
    phaseLabels: { start: 'Abertura Alta', end: 'Fechamento Inferior' },
    referenceNote: DEFAULT_REF_NOTE,
  },

  // === COSTAS ===
  'ex-puxada-alta': {
    exerciseId: 'ex-puxada-alta',
    primaryMuscles: ['lats'],
    secondaryMuscles: ['traps-mid', 'deltoid-rear', 'biceps', 'forearms', 'rotator-cuff'],
    executionSteps: [
      'Sente-se com as coxas bem travadas no apoio e segure a barra em pegada pronada um pouco além dos ombros.',
      'Inicie abaixando os ombros (depressão escapular) e leve os cotovelos para baixo e para os lados.',
      'Puxe a barra até a altura da parte superior do peito mantendo o peito aberto.',
      'Estenda os braços devagar na volta até alongar completamente as dorsais sem soltar os ombros.',
    ],
    breathing: 'Expire ao puxar a barra para baixo; inspire durante a subida controlada.',
    postureCues: [
      'Evite inclinar exageradamente o tronco para trás usando impulso lombar.',
      'Concentre a força em puxar pelos cotovelos, não apenas pelas mãos.',
    ],
    movementType: 'dynamic',
    phaseLabels: { start: 'Braços Estendidos', end: 'Barra no Peito Superior' },
    referenceNote: DEFAULT_REF_NOTE,
  },
  'ex-puxada-triangulo': {
    exerciseId: 'ex-puxada-triangulo',
    primaryMuscles: ['lats'],
    secondaryMuscles: ['traps-mid', 'biceps', 'forearms', 'deltoid-rear'],
    executionSteps: [
      'Prenda o triângulo na polia alta, trave as coxas no apoio e segure em pegada neutra.',
      'Mantenha o tronco quase vertical com leve abertura de peito e coluna neutra.',
      'Puxe o triângulo em direção à parte superior do esterno conduzindo os cotovelos próximos ao tronco.',
      'Retorne de forma controlada até estender os braços por completo.',
    ],
    breathing: 'Expire ao puxar o triângulo para baixo; inspire ao retornar.',
    postureCues: [
      'Evite arredondar a parte superior das costas no final da puxada.',
      'Mantenha o abdômen firme para estabilizar a pelve.',
    ],
    movementType: 'dynamic',
    phaseLabels: { start: 'Alongamento Superior', end: 'Puxada Fechada' },
    referenceNote: DEFAULT_REF_NOTE,
  },
  'ex-remada-apoiada': {
    exerciseId: 'ex-remada-apoiada',
    primaryMuscles: ['lats', 'traps-mid'],
    secondaryMuscles: ['deltoid-rear', 'biceps', 'forearms', 'rotator-cuff'],
    executionSteps: [
      'Apoie o peito no banco inclinado e firme os pés no chão.',
      'Deixe um halter sob cada ombro, com as palmas voltadas uma para a outra.',
      'Puxe os halteres até as costelas, levando os cotovelos para trás junto ao tronco.',
      'Retorne devagar controlando o peso até estender os braços.',
    ],
    breathing: 'Expire ao puxar para trás; inspire ao baixar os halteres.',
    postureCues: [
      'Mantenha o peito em contato contínuo com o apoio durante toda a execução.',
      'Evite elevar os ombros em direção às orelhas ao contrair.',
    ],
    movementType: 'dynamic',
    phaseLabels: { start: 'Halteres sob os ombros', end: 'Retração Escapular' },
    referenceNote: DEFAULT_REF_NOTE,
  },
  'ex-remada-maquina-aberta': {
    exerciseId: 'ex-remada-maquina-aberta',
    primaryMuscles: ['traps-mid', 'deltoid-rear'],
    secondaryMuscles: ['traps-upper', 'biceps', 'lats'],
    executionSteps: [
      'Ajuste o assento e o apoio de peito para que o tronco fique firme e confortável sobre o estofado.',
      'Segure as alças horizontais com pegada pronada mais aberta que os ombros.',
      'Aproxime as escápulas e puxe as alças em direção ao peito, com cotovelos abertos pouco abaixo da linha dos ombros.',
      'Retorne devagar controlando o peso até estender os braços.',
    ],
    breathing: 'Expire ao puxar para trás; inspire ao estender os braços à frente.',
    postureCues: [
      'Mantenha o peito em contato contínuo com o apoio durante toda a execução.',
      'Evite elevar os ombros em direção às orelhas ao contrair.',
    ],
    movementType: 'dynamic',
    phaseLabels: { start: 'Alcance Frontal', end: 'Retração Escapular' },
    referenceNote: DEFAULT_REF_NOTE,
  },
  'ex-remada-convergente-unilateral': {
    exerciseId: 'ex-remada-convergente-unilateral',
    primaryMuscles: ['lats', 'traps-mid'],
    secondaryMuscles: ['deltoid-rear', 'biceps', 'forearms', 'rotator-cuff'],
    executionSteps: [
      'Ajuste o assento e apoie firmemente o peito no estofado frontal, segurando o pegador inativo com a mão livre para estabilizar o tronco.',
      'Segure a alavanca do lado de trabalho com pegada neutra e braço estendido à frente sem soltar o ombro.',
      'Puxe a alavanca em arco convergente levando o cotovelo junto às costelas e retraindo a escápula.',
      'Retorne devagar controlando o peso até o alongamento completo, finalize as repetições e troque de lado.',
    ],
    breathing: 'Expire ao puxar o cotovelo para trás; inspire no retorno controlado.',
    postureCues: [
      'Mantenha o peito colado ao apoio e evite rodar o tronco ou a lombar para puxar mais carga.',
      'Conduza o movimento pelo cotovelo com o ombro abaixado (longe da orelha).',
    ],
    movementType: 'dynamic',
    phaseLabels: { start: 'Alongamento Unilateral', end: 'Puxada Convergente' },
    referenceNote: DEFAULT_REF_NOTE,
  },
  'ex-remada-baixa': {
    exerciseId: 'ex-remada-baixa',
    primaryMuscles: ['lats', 'traps-mid'],
    secondaryMuscles: ['deltoid-rear', 'biceps', 'forearms', 'lower-back'],
    executionSteps: [
      'Sente-se com joelhos levemente flexionados, pés firmes na plataforma e coluna ereta.',
      'Segure o triângulo com os braços estendidos mantendo a curvatura neutra da lombar.',
      'Puxe o pegador em direção ao umbigo mantendo os cotovelos próximos às costelas.',
      'Estenda os braços à frente com controle sem flexionar a coluna para ganhar alcance.',
    ],
    breathing: 'Expire na puxada até o tronco; inspire ao retornar à frente.',
    postureCues: [
      'Evite balançar o tronco para trás e para frente a cada repetição.',
      'Mantenha o peito aberto e a cabeça alinhada à coluna.',
    ],
    movementType: 'dynamic',
    phaseLabels: { start: 'Braços à Frente', end: 'Puxada ao Abdômen' },
    referenceNote: DEFAULT_REF_NOTE,
  },
  'ex-remada-unilateral': {
    exerciseId: 'ex-remada-unilateral',
    primaryMuscles: ['lats', 'traps-mid'],
    secondaryMuscles: ['deltoid-rear', 'biceps', 'forearms', 'obliques', 'lower-back'],
    executionSteps: [
      'Apoie uma mão e o joelho do mesmo lado no banco (ou peito no banco inclinado), mantendo coluna neutra e paralela ao solo.',
      'Com o braço livre estendido, segure o halter com a palma voltada para o corpo.',
      'Puxe o halter em arco suave em direção ao quadril mantendo o cotovelo próximo ao tronco.',
      'Desça controladamente alongando a dorsal sem girar a coluna.',
    ],
    breathing: 'Expire ao puxar o halter em direção ao quadril; inspire na descida.',
    postureCues: [
      'Evite rodar o tronco ou a lombar para elevar cargas maiores.',
      'Mantenha ombros nivelados e pescoço alinhado olhando para o banco.',
    ],
    movementType: 'dynamic',
    phaseLabels: { start: 'Braço Estendido', end: 'Puxada ao Quadril' },
    referenceNote: DEFAULT_REF_NOTE,
  },
  'ex-face-pull': {
    exerciseId: 'ex-face-pull',
    primaryMuscles: ['deltoid-rear', 'rotator-cuff'],
    secondaryMuscles: ['traps-mid', 'deltoid-side', 'forearms'],
    executionSteps: [
      'Ajuste a polia na altura do rosto ou um pouco acima e segure a corda com polegares voltados para trás.',
      'Dê um passo atrás em base firme e estenda os braços mantendo ombros relaxados.',
      'Puxe a corda em direção à testa abrindo as mãos e realizando rotação externa dos ombros.',
      'Segure brevemente na contração posterior e retorne com controle.',
    ],
    breathing: 'Expire ao puxar a corda em direção ao rosto; inspire ao estender.',
    postureCues: [
      'Mantenha costelas encaixadas sem inclinar o tronco para trás.',
      'Os punhos e antebraços devem terminar alinhados verticalmente ao lado da cabeça.',
    ],
    movementType: 'dynamic',
    phaseLabels: { start: 'Braços Estendidos', end: 'Puxada + Rotação Externa' },
    referenceNote: DEFAULT_REF_NOTE,
  },

  // === OMBROS E TRAPÉZIO ===
  'ex-desenv-halter': {
    exerciseId: 'ex-desenv-halter',
    primaryMuscles: ['deltoid-front', 'deltoid-side'],
    secondaryMuscles: ['triceps', 'chest-upper', 'traps-upper'],
    executionSteps: [
      'Sente-se em banco com encosto firme (~75–80°), pés apoiados no chão e costelas encaixadas.',
      'Posicione os halteres ao lado das orelhas com cotovelos levemente à frente do plano do tronco.',
      'Empurre os halteres acima da cabeça em trajetória levemente convergente sem travar os cotovelos.',
      'Desça devagar até a altura dos ombros mantendo controle total.',
    ],
    breathing: 'Expire ao empurrar acima da cabeça; inspire na descida controlada.',
    postureCues: [
      'Evite desencostar a lombar do encosto quando os braços sobem.',
      'Mantenha o pescoço neutro sem projetar o queixo à frente.',
    ],
    movementType: 'dynamic',
    phaseLabels: { start: 'Halteres nos Ombros', end: 'Extensão Acima da Cabeça' },
    referenceNote: DEFAULT_REF_NOTE,
  },
  'ex-desenv-maquina': {
    exerciseId: 'ex-desenv-maquina',
    primaryMuscles: ['deltoid-front', 'deltoid-side'],
    secondaryMuscles: ['triceps', 'traps-upper', 'chest-upper'],
    executionSteps: [
      'Regule o banco para que os pegadores iniciem na altura das orelhas/ombros.',
      'Apoie costas totalmente no encosto e pés firmes no chão.',
      'Empurre as alças para cima até quase estender os cotovelos.',
      'Retorne devagar controlando a descida até a posição inicial.',
    ],
    breathing: 'Expire ao empurrar para cima; inspire ao descer.',
    postureCues: [
      'Não eleve os ombros em direção às orelhas durante a subida.',
      'Mantenha punhos retos diretamente acima dos cotovelos.',
    ],
    movementType: 'dynamic',
    phaseLabels: { start: 'Pegadores nos Ombros', end: 'Empurrada Guiada' },
    referenceNote: DEFAULT_REF_NOTE,
  },
  'ex-elevacao-frontal': {
    exerciseId: 'ex-elevacao-frontal',
    primaryMuscles: ['deltoid-front'],
    secondaryMuscles: ['deltoid-side', 'chest-upper', 'traps-upper'],
    executionSteps: [
      'Sente-se apoiando totalmente as costas no encosto com um halter em cada mão ao lado do quadril.',
      'Com cotovelos quase estendidos (leve flexão), eleve os braços à frente até a altura dos ombros.',
      'Controle o topo por um instante e desça devagar sem usar impulso do tronco.',
    ],
    breathing: 'Expire ao elevar os halteres à frente; inspire durante a descida.',
    postureCues: [
      'Evite subir acima da linha dos ombros se gerar pinçamento ou compensação cervical.',
      'Mantenha tronco imóvel contra o banco durante toda a série.',
    ],
    movementType: 'dynamic',
    phaseLabels: { start: 'Braços Abaixo', end: 'Elevação na Linha dos Ombros' },
    referenceNote: DEFAULT_REF_NOTE,
  },
  'ex-elevacao-lateral': {
    exerciseId: 'ex-elevacao-lateral',
    primaryMuscles: ['deltoid-side'],
    secondaryMuscles: ['deltoid-front', 'traps-upper', 'rotator-cuff'],
    executionSteps: [
      'Segure os halteres ao lado do corpo (sentado ou em pé estável) com cotovelos levemente flexionados.',
      'Eleve os braços lateralmente (ligeiramente à frente do tronco, plano escapular) até a linha dos ombros.',
      'Desça de forma controlada resistindo à gravidade sem encostar bruscamente nas coxas.',
    ],
    breathing: 'Expire durante a subida lateral; inspire na descida controlada.',
    postureCues: [
      'Conduza o movimento pelos cotovelos mantendo os ombros abaixados (sem encolher o trapézio).',
      'Evite balançar o quadril para impulsionar os pesos.',
    ],
    movementType: 'dynamic',
    phaseLabels: { start: 'Braços ao Lado', end: 'Abdução até Ombros' },
    referenceNote: DEFAULT_REF_NOTE,
  },
  'ex-elevacao-lateral-cabo': {
    exerciseId: 'ex-elevacao-lateral-cabo',
    primaryMuscles: ['deltoid-side'],
    secondaryMuscles: ['deltoid-front', 'traps-upper', 'obliques'],
    executionSteps: [
      'Ajuste a polia baixa, fique de lado para a coluna de pesos e segure a estrutura com a mão livre.',
      'Segure o pegador na frente ou atrás da coxa com o cotovelo levemente dobrado.',
      'Eleve o braço lateralmente em arco amplo até a altura do ombro sem inclinar o tronco.',
      'Retorne devagar mantendo tensão constante no cabo.',
    ],
    breathing: 'Expire ao elevar o braço lateralmente; inspire ao retornar.',
    postureCues: [
      'Mantenha o tronco vertical e firme sem inclinar-se para longe da máquina.',
      'Evite rodar o braço internamente no topo do movimento.',
    ],
    movementType: 'dynamic',
    phaseLabels: { start: 'Tensão na Base', end: 'Abdução na Linha do Ombro' },
    referenceNote: DEFAULT_REF_NOTE,
  },
  'ex-voador-invertido': {
    exerciseId: 'ex-voador-invertido',
    primaryMuscles: ['deltoid-rear'],
    secondaryMuscles: ['traps-mid', 'rotator-cuff', 'deltoid-side'],
    executionSteps: [
      'Ajuste o banco voltado para o encosto de peito com os pegadores na altura dos ombros.',
      'Apoie o tronco no estofado e segure os pegadores à frente com cotovelos quase estendidos.',
      'Abra os braços para trás em arco horizontal focando na parte posterior dos ombros.',
      'Retorne devagar à frente sem deixar os pesos baterem.',
    ],
    breathing: 'Expire ao abrir os braços para trás; inspire ao fechar à frente.',
    postureCues: [
      'Mantenha o peito apoiado e evite esmagar demais as escápulas se quiser isolar o deltoide posterior.',
      'Mantenha ombros abaixados e pescoço relaxado.',
    ],
    movementType: 'dynamic',
    phaseLabels: { start: 'Braços à Frente', end: 'Abdução Horizontal' },
    referenceNote: DEFAULT_REF_NOTE,
  },
  'ex-encolhimento-apoiado': {
    exerciseId: 'ex-encolhimento-apoiado',
    primaryMuscles: ['traps-upper'],
    secondaryMuscles: ['traps-mid', 'forearms'],
    executionSteps: [
      'Ajuste o banco em cerca de 45° a 60° e apoie o peito firmemente contra o encosto.',
      'Segure os halteres com os braços estendidos abaixo mantendo o pescoço alinhado ao tronco.',
      'Eleve os ombros em direção às orelhas e levemente para trás, segurando 1 segundo no topo.',
      'Desça os ombros por completo alongando o trapézio sem dobrar os cotovelos.',
    ],
    breathing: 'Expire ao elevar os ombros; inspire na descida completa.',
    postureCues: [
      'Não faça círculos com os ombros; o movimento é linear para cima e levemente para trás.',
      'Mantenha o peito apoiado para evitar compressão vertical excessiva na coluna.',
    ],
    movementType: 'dynamic',
    phaseLabels: { start: 'Ombros Relaxados', end: 'Elevação de Trapézio' },
    referenceNote: DEFAULT_REF_NOTE,
  },

  // === BRAÇOS ===
  'ex-rosca-halter': {
    exerciseId: 'ex-rosca-halter',
    primaryMuscles: ['biceps'],
    secondaryMuscles: ['forearms'],
    executionSteps: [
      'Sente-se em banco inclinado (45°–60°) apoiando totalmente costas e cabeça, braços pendentes ao lado.',
      'Com palmas voltadas à frente (supinação), flexione os cotovelos elevando os halteres sem avançar os ombros.',
      'Contraia o bíceps no topo por 1 segundo e desça devagar até estender quase totalmente os braços.',
    ],
    breathing: 'Expire ao subir os halteres; inspire na descida controlada.',
    postureCues: [
      'Mantenha os cotovelos fixos apontando para baixo sem balançar os braços para a frente.',
      'Costas firmes no encosto garantem execução limpa sem compensação lombar.',
    ],
    movementType: 'dynamic',
    phaseLabels: { start: 'Extensão Inclinada', end: 'Flexão Completa' },
    referenceNote: DEFAULT_REF_NOTE,
  },
  'ex-rosca-scott': {
    exerciseId: 'ex-rosca-scott',
    primaryMuscles: ['biceps'],
    secondaryMuscles: ['forearms'],
    executionSteps: [
      'Regule a altura do assento para que as axilas encaixem sobre a borda superior do apoio inclinado.',
      'Apoie a parte posterior dos braços sobre o estofado e segure os pegadores com palmas para cima.',
      'Flexione os cotovelos elevando a carga em arco suave até perto dos ombros.',
      'Desça devagar até quase estender os cotovelos sem dar tranco no fundo.',
    ],
    breathing: 'Expire na subida da carga; inspire na descida.',
    postureCues: [
      'Mantenha tronco ereto e ombros encaixados sem curvar as costas sobre o apoio.',
      'Controle o final da descida para proteger os tendões do cotovelo.',
    ],
    movementType: 'dynamic',
    phaseLabels: { start: 'Braços Apoiados', end: 'Contração no Topo' },
    referenceNote: DEFAULT_REF_NOTE,
  },
  'ex-rosca-martelo': {
    exerciseId: 'ex-rosca-martelo',
    primaryMuscles: ['forearms', 'biceps'],
    secondaryMuscles: [],
    executionSteps: [
      'Segure os halteres ao lado do corpo com pegada neutra (palmas voltadas para dentro).',
      'Mantendo os cotovelos próximos às costelas, flexione os braços elevando os halteres até a altura do peito.',
      'Retorne devagar mantendo a pegada neutra durante todo o percurso.',
    ],
    breathing: 'Expire ao flexionar os braços; inspire ao retornar à extensão.',
    postureCues: [
      'Evite inclinar o tronco para trás para iniciar a subida.',
      'Mantenha punhos firmes e alinhados ao antebraço.',
    ],
    movementType: 'dynamic',
    phaseLabels: { start: 'Pegada Neutra Baixa', end: 'Flexão Neutra' },
    referenceNote: DEFAULT_REF_NOTE,
  },
  'ex-triceps-polia': {
    exerciseId: 'ex-triceps-polia',
    primaryMuscles: ['triceps'],
    secondaryMuscles: ['forearms', 'abs'],
    executionSteps: [
      'Prenda a corda na polia alta, segure as pontas com pegada neutra e incline o tronco muito levemente.',
      'Trave os cotovelos junto às laterais do tronco com os antebraços paralelos ao chão.',
      'Empurre a corda para baixo estendendo totalmente os cotovelos e abrindo levemente as mãos no final.',
      'Retorne devagar apenas flexionando os cotovelos até cerca de 90° sem mover os ombros.',
    ],
    breathing: 'Expire ao estender para baixo; inspire no retorno controlado.',
    postureCues: [
      'Mantenha abdômen firme e joelhos destravados para evitar balanço do corpo.',
      'Não deixe os cotovelos subirem ou avançarem na volta.',
    ],
    movementType: 'dynamic',
    phaseLabels: { start: 'Cotovelos a 90°', end: 'Extensão Completa' },
    referenceNote: DEFAULT_REF_NOTE,
  },
  'ex-triceps-testa-halter': {
    exerciseId: 'ex-triceps-testa-halter',
    primaryMuscles: ['triceps'],
    secondaryMuscles: ['forearms'],
    executionSteps: [
      'Deite-se no banco reto com pés firmes no chão, lombar neutra e um halter em cada mão em pegada neutra (palmas voltadas uma para a outra).',
      'Eleve os braços acima do peito e incline-os levemente para trás (~10°) mantendo os cotovelos estáveis.',
      'Flexione apenas os cotovelos descendo os halteres devagar ao lado das têmporas/testa.',
      'Estenda os cotovelos de volta ao topo contraindo o tríceps sem abrir os braços para fora.',
    ],
    breathing: 'Inspire ao descer os halteres ao lado da cabeça; expire ao estender para cima.',
    postureCues: [
      'Manter a pegada neutra com halteres reduz a tensão nos punhos e cotovelos em comparação à barra reta.',
      'Apoie costas e pés firmemente no banco/solo para garantir estabilidade total da lombar.',
    ],
    movementType: 'dynamic',
    phaseLabels: { start: 'Flexão ao Lado da Cabeça', end: 'Extensão Vertical' },
    referenceNote: DEFAULT_REF_NOTE,
  },
  'ex-triceps-frances-halter': {
    exerciseId: 'ex-triceps-frances-halter',
    primaryMuscles: ['triceps'],
    secondaryMuscles: ['abs', 'forearms'],
    executionSteps: [
      'Sente-se em banco com encosto firme e eleve o halter acima da cabeça segurando com as duas mãos (ou unilateral).',
      'Mantenha os braços apontando para cima ao lado da cabeça e flexione apenas os cotovelos levando o peso atrás da nuca.',
      'Estenda os cotovelos de volta acima da cabeça contraindo o tríceps sem abrir demais os braços.',
    ],
    breathing: 'Inspire ao descer o halter atrás da cabeça; expire ao estender para cima.',
    postureCues: [
      'Encaixe as costelas e mantenha as costas apoiadas para não arquear a lombar.',
      'Desça apenas até uma amplitude confortável para ombros e cotovelos.',
    ],
    movementType: 'dynamic',
    phaseLabels: { start: 'Flexão Atrás da Cabeça', end: 'Extensão Acima' },
    referenceNote: DEFAULT_REF_NOTE,
  },

  // === PERNAS ===
  'ex-leg-press': {
    exerciseId: 'ex-leg-press',
    primaryMuscles: ['quads'],
    secondaryMuscles: ['glutes', 'adductors', 'calves-soleus'],
    executionSteps: [
      'Sente-se no aparelho apoiando completamente lombar, glúteos e cabeça no encosto.',
      'Posicione os pés na plataforma na largura dos ombros, destrave o carrinho e mantenha joelhos alinhados aos pés.',
      'Desça a plataforma devagar flexionando quadris e joelhos até o limite em que o quadril permanece colado ao banco.',
      'Empurre a plataforma pelos calcanhares e meio do pé sem hiperextender (travar) os joelhos no topo.',
    ],
    breathing: 'Inspire durante a descida controlada; expire ao empurrar a plataforma.',
    postureCues: [
      'Interrompa a descida imediatamente antes que o sacro/quadril comece a descolar do estofado.',
      'Não deixe os joelhos caírem para dentro durante a subida.',
    ],
    movementType: 'dynamic',
    phaseLabels: { start: 'Joelhos Estendidos', end: 'Flexão Controlada' },
    referenceNote: DEFAULT_REF_NOTE,
  },
  'ex-agach-bulgaro': {
    exerciseId: 'ex-agach-bulgaro',
    primaryMuscles: ['quads', 'glutes'],
    secondaryMuscles: ['adductors', 'calves-soleus', 'abs'],
    executionSteps: [
      'Posicione o peito do pé de trás sobre um banco baixo e dê um passo firme à frente com a perna de trabalho.',
      'Mantenha o tronco ereto ou levemente inclinado com coluna neutra e segure os halteres ao lado do corpo.',
      'Desça flexionando o joelho da frente até a coxa ficar próxima da horizontal.',
      'Empurre o chão com a perna da frente para retornar à posição inicial.',
    ],
    breathing: 'Inspire na descida controlada; expire ao subir empurrando o solo.',
    postureCues: [
      'Mantenha o joelho da frente alinhado na direção do segundo/terceiro dedo do pé.',
      'A maioria da carga fica na perna da frente; a perna de trás apenas equilibra.',
    ],
    movementType: 'dynamic',
    phaseLabels: { start: 'Base Unilateral Alta', end: 'Descida Controlada' },
    referenceNote: DEFAULT_REF_NOTE,
  },
  'ex-cadeira-extensora': {
    exerciseId: 'ex-cadeira-extensora',
    primaryMuscles: ['quads'],
    secondaryMuscles: [],
    executionSteps: [
      'Ajuste o encosto e o rolo inferior para que o eixo da máquina alinhe ao joelho e o rolo apoie acima do tornozelo.',
      'Segure as alças laterais mantendo costas e quadril firmes contra o banco.',
      'Estenda os joelhos elevando o rolo até a extensão completa e segure 1 segundo no topo.',
      'Retorne devagar controlando a descida sem bater os pesos.',
    ],
    breathing: 'Expire ao estender as pernas; inspire ao dobrar os joelhos na volta.',
    postureCues: [
      'Evite levantar o quadril do assento durante a fase final da extensão.',
      'Mantenha tornozelos em posição neutra (dedos apontando para cima).',
    ],
    movementType: 'dynamic',
    phaseLabels: { start: 'Joelhos a 90°', end: 'Extensão de Quadríceps' },
    referenceNote: DEFAULT_REF_NOTE,
  },
  'ex-cadeira-flexora': {
    exerciseId: 'ex-cadeira-flexora',
    primaryMuscles: ['hamstrings'],
    secondaryMuscles: ['calves-gastroc'],
    executionSteps: [
      'Ajuste o encosto para alinhar o eixo da máquina ao joelho, o rolo inferior atrás dos tornozelos e o apoio superior sobre as coxas.',
      'Apoie totalmente a lombar no encosto mantendo o tronco estável.',
      'Flexione os joelhos puxando o rolo para baixo e para trás até a amplitude completa.',
      'Retorne controladamente até quase estender os joelhos sem perder tensão.',
    ],
    breathing: 'Expire ao flexionar as pernas para baixo; inspire ao estender.',
    postureCues: [
      'Mantenha glúteos e lombar encostados no banco durante todo o movimento.',
      'Evite dar trancos no início da puxada.',
    ],
    movementType: 'dynamic',
    phaseLabels: { start: 'Pernas Estendidas', end: 'Flexão Posterior' },
    referenceNote: DEFAULT_REF_NOTE,
  },
  'ex-mesa-flexora': {
    exerciseId: 'ex-mesa-flexora',
    primaryMuscles: ['hamstrings'],
    secondaryMuscles: ['calves-gastroc', 'glutes'],
    executionSteps: [
      'Deite-se de bruços alinhando os joelhos ao eixo de giro da máquina e o rolo logo acima dos calcanhares.',
      'Segure as alças frontais e ative levemente abdômen e glúteos para pressionar o quadril contra o banco.',
      'Flexione os joelhos trazendo os calcanhares em direção aos glúteos de forma contínua.',
      'Desça devagar resistindo ao peso até estender quase completamente.',
    ],
    breathing: 'Expire ao flexionar os joelhos; inspire durante a descida.',
    postureCues: [
      'Não deixe o quadril levantar do banco ao puxar o peso para não sobrecarregar a lombar.',
      'Mantenha o pescoço alinhado olhando para baixo.',
    ],
    movementType: 'dynamic',
    phaseLabels: { start: 'Pernas Estendidas', end: 'Flexão na Mesa' },
    referenceNote: DEFAULT_REF_NOTE,
  },
  'ex-elevacao-pelvica': {
    exerciseId: 'ex-elevacao-pelvica',
    primaryMuscles: ['glutes'],
    secondaryMuscles: ['hamstrings', 'quads', 'abs'],
    executionSteps: [
      'Apoie a base das escápulas na borda do banco e posicione os pés no chão de modo que as canelas fiquem verticais no topo.',
      'Apoie a barra acolchoada (ou cinto da máquina) sobre a dobra do quadril.',
      'Empurre pelos calcanhares elevando o quadril até formar uma linha reta dos ombros aos joelhos, mantendo o queixo levemente recolhido.',
      'Contraia os glúteos por 1 segundo no topo e desça com controle em bloco único.',
    ],
    breathing: 'Expire ao subir o quadril e contrair os glúteos; inspire na descida.',
    postureCues: [
      'Mova tronco e pelve juntos em bloco, sem hiperextender a lombar no topo.',
      'Olhar à frente (queixo recolhido) ajuda a manter a pelve em posição neutra.',
    ],
    movementType: 'dynamic',
    phaseLabels: { start: 'Quadril Baixo', end: 'Extensão de Quadril' },
    referenceNote: DEFAULT_REF_NOTE,
  },
  'ex-cadeira-adutora': {
    exerciseId: 'ex-cadeira-adutora',
    primaryMuscles: ['adductors'],
    secondaryMuscles: ['glutes'],
    executionSteps: [
      'Ajuste a abertura inicial da máquina para um alongamento confortável sem forçar a região da virilha.',
      'Sente-se com lombar e costas totalmente apoiadas no encosto e segure as alças laterais.',
      'Feche as pernas de forma contínua pressionando a face interna das coxas contra as almofadas.',
      'Pause por 1 segundo na contração máxima e retorne devagar resistindo à abertura.',
    ],
    breathing: 'Expire ao fechar as pernas; inspire ao controlar a abertura.',
    postureCues: [
      'Mantenha a coluna neutra contra o encosto sem curvar o tronco à frente para fazer força.',
      'Controle o retorno na abertura para evitar trancos nos tendões adutores.',
    ],
    movementType: 'dynamic',
    phaseLabels: { start: 'Abertura Controlada', end: 'Adução Medial' },
    referenceNote: DEFAULT_REF_NOTE,
  },
  'ex-cadeira-abdutora': {
    exerciseId: 'ex-cadeira-abdutora',
    primaryMuscles: ['glute-med'],
    secondaryMuscles: ['glutes'],
    executionSteps: [
      'Sente-se na máquina com as costas apoiadas no encosto e a face externa das coxas nas almofadas.',
      'Afaste os joelhos lateralmente de forma controlada até o máximo confortável.',
      'Segure brevemente na abertura máxima e retorne devagar resistindo ao fechamento.',
    ],
    breathing: 'Expire ao abrir as pernas; inspire ao retornar ao centro.',
    postureCues: [
      'Mantenha a coluna apoiada sem arredondar a lombar para a frente.',
      'Evite soltar o peso de volta rapidamente.',
    ],
    movementType: 'dynamic',
    phaseLabels: { start: 'Coxas Fechadas', end: 'Abdução Lateral' },
    referenceNote: DEFAULT_REF_NOTE,
  },
  'ex-panturrilha-sentado': {
    exerciseId: 'ex-panturrilha-sentado',
    primaryMuscles: ['calves-soleus'],
    secondaryMuscles: ['calves-gastroc'],
    executionSteps: [
      'Sente-se no aparelho (ou no Leg Press) apoiando a ponta dos pés na borda da plataforma.',
      'Desça os calcanhares devagar até sentir alongamento completo na panturrilha e pause brevemente.',
      'Empurre com a ponta dos pés elevando os calcanhares ao máximo possível e contraia no topo.',
    ],
    breathing: 'Expire ao elevar os calcanhares; inspire ao descer para o alongamento.',
    postureCues: [
      'Evite quicar no ponto mais baixo; a pausa embaixo melhora o recrutamento.',
      'Mantenha a coluna ereta e apoiada sem sobrecarga vertical.',
    ],
    movementType: 'dynamic',
    phaseLabels: { start: 'Alongamento Inferior', end: 'Flexão Plantar' },
    referenceNote: DEFAULT_REF_NOTE,
  },
  'ex-panturrilha-pe': {
    exerciseId: 'ex-panturrilha-pe',
    primaryMuscles: ['calves-gastroc'],
    secondaryMuscles: ['calves-soleus'],
    executionSteps: [
      'Posicione a ponta dos pés no degrau com os joelhos estendidos (destravados) e apoios firmes nos ombros.',
      'Desça os calcanhares devagar até o alongamento completo sem dobrar os joelhos.',
      'Suba na ponta dos pés o mais alto possível, segure 1 segundo no topo e desça com controle.',
    ],
    breathing: 'Expire na subida; inspire ao descer os calcanhares.',
    postureCues: [
      'Mantenha abdômen firme e tronco alinhado sem hiperextender a lombar sob o apoio.',
      'Execute a amplitude completa em ritmo controlado.',
    ],
    movementType: 'dynamic',
    phaseLabels: { start: 'Calcanhares Baixos', end: 'Elevação Máxima' },
    referenceNote: DEFAULT_REF_NOTE,
  },
};

export function getExerciseGuide(exercise: Exercise): {
  guide: ExerciseGuide;
  isFallback: boolean;
} {
  const existing = EXERCISE_GUIDES[exercise.id];
  if (existing) {
    return { guide: existing, isFallback: false };
  }

  const fallbackMuscles = MUSCLE_GROUP_FALLBACK_MAP[exercise.muscleGroup];
  return {
    isFallback: true,
    guide: {
      exerciseId: exercise.id,
      primaryMuscles: fallbackMuscles.primary,
      secondaryMuscles: fallbackMuscles.secondary,
      executionSteps: [
        `Prepare o equipamento (${exercise.equipment || 'livre'}) mantendo postura estável e alinhada.`,
        'Execute a fase concêntrica de forma controlada, focando no grupo muscular principal.',
        'Retorne à posição inicial resistindo à carga sem usar impulso do tronco.',
      ],
      breathing: 'Expire durante o esforço principal e inspire no retorno controlado.',
      postureCues: [
        'Mantenha a coluna neutra e o abdômen levemente contraído durante toda a série.',
        'Priorize amplitude confortável e controle técnico antes de aumentar a carga.',
      ],
      movementType: 'dynamic',
      phaseLabels: { start: 'Posição Inicial', end: 'Contração Máxima' },
      referenceNote:
        'Mapeamento estimado pelo grupo muscular cadastrado (exercício personalizado).',
    },
  };
}

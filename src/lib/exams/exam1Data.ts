export type ReadSelectQuestion = {
  id: string;
  type: "read_select";
  section: "read_select";
  sectionLabel: string;
  word: string;
  timeSeconds: number;
  points: number;
  correctAnswer: "yes" | "no";
  explanation: string;
};

export type FillBlankQuestion = {
  id: string;
  type: "fill_blank";
  section: "fill_blank";
  sectionLabel: string;
  prompt: string;
  hint: string;
  timeSeconds: number;
  points: number;
  correctAnswer: string;
  /** If true, first letter must match casing (e.g. Sustainable). */
  requireCapitalized?: boolean;
  explanation: string;
};

export type WritingQuestion = {
  id: string;
  type: "writing";
  section: "writing";
  sectionLabel: string;
  promptHtml: string;
  rubricHtml: string;
  timeSeconds: number;
  points: number;
  explanation: string;
};

export type Exam1Question = ReadSelectQuestion | FillBlankQuestion | WritingQuestion;

export const EXAM_1_QUESTIONS: Exam1Question[] = [
  {
    id: "rs1",
    type: "read_select",
    section: "read_select",
    sectionLabel: "1. Read and Select",
    word: "leverage",
    timeSeconds: 10,
    points: 10,
    correctAnswer: "yes",
    explanation:
      "Palabra real. Significa apalancar o aprovechar una ventaja. Común en B2.",
  },
  {
    id: "rs2",
    type: "read_select",
    section: "read_select",
    sectionLabel: "1. Read and Select",
    word: "analysation",
    timeSeconds: 10,
    points: 10,
    correctAnswer: "no",
    explanation:
      "Falsa. Aunque deriva de analyze, el sustantivo correcto es «analysis». Trap clásico del DET.",
  },
  {
    id: "rs3",
    type: "read_select",
    section: "read_select",
    sectionLabel: "1. Read and Select",
    word: "resilient",
    timeSeconds: 10,
    points: 10,
    correctAnswer: "yes",
    explanation:
      "Palabra real. Significa capaz de recuperarse rápido de dificultades (resiliente).",
  },
  {
    id: "rs4",
    type: "read_select",
    section: "read_select",
    sectionLabel: "1. Read and Select",
    word: "actually",
    timeSeconds: 10,
    points: 10,
    correctAnswer: "yes",
    explanation:
      "Palabra real. Significa «en realidad» o «de hecho» (Lección 0).",
  },
  {
    id: "rs5",
    type: "read_select",
    section: "read_select",
    sectionLabel: "1. Read and Select",
    word: "interestingness",
    timeSeconds: 10,
    points: 10,
    correctAnswer: "no",
    explanation:
      "Falsa. Error de sobre-generalización del sufijo «-ness». Se debe usar «interest».",
  },
  {
    id: "fb1",
    type: "fill_blank",
    section: "fill_blank",
    sectionLabel: "2. Fill the Blanks",
    prompt:
      "The project manager requested a d_ _ _ _ _ _ report to analyze the team's progress before the final deployment.",
    hint:
      "Including many facts or specifics; thorough and comprehensive. (Starts with «d».)",
    timeSeconds: 20,
    points: 15,
    correctAnswer: "detailed",
    explanation:
      "Completa el adjetivo «detailed» (detallado) que califica lógicamente a «report».",
  },
  {
    id: "fb2",
    type: "fill_blank",
    section: "fill_blank",
    sectionLabel: "2. Fill the Blanks",
    prompt:
      "We need to find an efficient solution because the current bottleneck is slowing down our s_ _ _ _ _ _ _ _ _ _",
    hint:
      "The ability of a system, network, or process to handle a growing amount of work or to be enlarged. (Starts with «s».)",
    timeSeconds: 25,
    points: 20,
    correctAnswer: "scalability",
    explanation:
      "Término técnico de la Lección 1. «Scalability» (escalabilidad) encaja con la infraestructura.",
  },
  {
    id: "fb3",
    type: "fill_blank",
    section: "fill_blank",
    sectionLabel: "2. Fill the Blanks",
    prompt:
      "S_ _ _ _ _ _ _ _ _ _ urban planning is essential for creating livable cities. This involves not only improving public transportation but also reducing carbon emissions.",
    hint:
      "Able to be maintained over time without depleting natural resources or causing serious harm to the environment. (Starts with «S».)",
    timeSeconds: 30,
    points: 25,
    correctAnswer: "Sustainable",
    requireCapitalized: true,
    explanation:
      "Nivel B2. Exige mayúscula inicial por comienzo de oración. «Sustainable» (sustentable).",
  },
  {
    id: "fb4",
    type: "fill_blank",
    section: "fill_blank",
    sectionLabel: "2. Fill the Blanks",
    prompt:
      "The transition to a circular economy requires a shift in how we p_ _ _ _ _ _ and consume goods to minimize waste.",
    hint:
      "To make, create, or manufacture something, especially goods on a large scale. (Starts with «p».)",
    timeSeconds: 20,
    points: 15,
    correctAnswer: "produce",
    explanation:
      "Verbo simple pero preciso en contexto económico. «Produce» contrasta con «consume».",
  },
  {
    id: "fb5",
    type: "fill_blank",
    section: "fill_blank",
    sectionLabel: "2. Fill the Blanks",
    prompt:
      "The dashboard loaded much faster after the update; h_ _ _ _ _ _, several users still could not export large reports.",
    hint:
      "Used to introduce a contrast with what was just said; means «but» or «nevertheless». (Starts with «h».)",
    timeSeconds: 28,
    points: 25,
    correctAnswer: "however",
    explanation:
      "«However» es un conector de contraste muy frecuente en B1–B2: la mejora es cierta, pero el problema sigue.",
  },
  {
    id: "w1",
    type: "writing",
    section: "writing",
    sectionLabel: "3. Writing (Task 1)",
    promptHtml:
      "<b>Prompt:</b> Tell the story of a day when everything worked out perfectly for you.<br>What did you accomplish, and what made the day so satisfying? (Write for 5 minutes)",
    rubricHtml:
      "<b>Rúbrica DET:</b><br>1. Grammatical Accuracy (25%): Uso correcto de tiempos verbales (pasado simple/continuo).<br>2. Lexical Sophistication (25%): Uso de vocabulario avanzado (ej. «accomplish», «substantial»).<br>3. Coherence (25%): Fluidez lógica usando conectores.<br>4. Task Relevance (25%): Responder exactamente qué se logró y por qué fue satisfactorio.",
    timeSeconds: 300,
    points: 10,
    explanation:
      "Evaluación automática según la rúbrica DET: gramática, vocabulario, coherencia y relevancia.",
  },
  {
    id: "w2",
    type: "writing",
    section: "writing",
    sectionLabel: "3. Writing (Task 2)",
    promptHtml:
      "<b>Prompt (Follow-up):</b> Describe a specific moment from that day that stands out as particularly memorable. (Write for 3 minutes)",
    rubricHtml:
      "<b>Rúbrica DET:</b><br>1. Grammatical Complexity (30%): Variedad de estructuras gramaticales.<br>2. Vocabulary Precision (30%): Evitar repeticiones y palabras vacías como «good» o «nice».<br>3. Contextual Alignment (40%): Continuidad estricta y lógica con la historia redactada en el bloque de 5 minutos.",
    timeSeconds: 180,
    points: 10,
    explanation:
      "Evaluación automática según la rúbrica DET, incluyendo continuidad con tu Task 1.",
  },
];

export const EXAM_1_MAX_AUTO_POINTS = EXAM_1_QUESTIONS.reduce((sum, q) => sum + q.points, 0);

export const EXAM_1_MAX_LEVEL_POINTS = 170;

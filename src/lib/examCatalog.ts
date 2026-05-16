export type ExamDefinition = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  /** Seconds allowed per question (DET-style timed items). */
  secondsPerQuestion: number;
  /** Set when question bank is wired; 0 = shell only. */
  questionCount: number;
  enabled: boolean;
  skills: string[];
};

export const EXAM_CATALOG: ExamDefinition[] = [
  {
    id: "exam-1",
    title: "Examen 1 · Diagnóstico inicial",
    subtitle: "Read & Select · Fill the Blanks · Writing",
    description:
      "12 ítems cronometrados: vocabulario (Yes/No), completar espacios con pistas opcionales y dos tareas de writing. Cada pregunta tiene su tiempo; al final verás puntaje, nivel MCER y explicación de cada respuesta.",
    secondsPerQuestion: 10,
    questionCount: 12,
    enabled: true,
    skills: ["READING", "WRITING"],
  },
];

export function getExamById(examId: string): ExamDefinition | undefined {
  return EXAM_CATALOG.find((e) => e.id === examId);
}

export function getEnabledExams(): ExamDefinition[] {
  return EXAM_CATALOG.filter((e) => e.enabled);
}

export type RubricCriterionDef = {
  id: string;
  label: string;
  weightPercent: number;
  /** Short feedback templates keyed by score band */
  feedbackStrong: string;
  feedbackWeak: string;
};

export const WRITING_W1_CRITERIA: RubricCriterionDef[] = [
  {
    id: "grammatical_accuracy",
    label: "Grammatical Accuracy",
    weightPercent: 25,
    feedbackStrong: "Buen uso de pasado y pocas correcciones gramaticales.",
    feedbackWeak: "Revisá tiempos verbales en pasado y concordancia sujeto-verbo.",
  },
  {
    id: "lexical_sophistication",
    label: "Lexical Sophistication",
    weightPercent: 25,
    feedbackStrong: "Vocabulario variado con términos más precisos que good/nice.",
    feedbackWeak: "Probá verbos y adjetivos más específicos (accomplish, substantial, memorable).",
  },
  {
    id: "coherence",
    label: "Coherence",
    weightPercent: 25,
    feedbackStrong: "Buena secuencia con conectores que enlazan las ideas.",
    feedbackWeak: "Sumá conectores (however, because, then, finally) para ordenar la historia.",
  },
  {
    id: "task_relevance",
    label: "Task Relevance",
    weightPercent: 25,
    feedbackStrong: "Respondés qué lograste y por qué el día fue satisfactorio.",
    feedbackWeak: "Incluí explícitamente qué lograste y qué hizo satisfactorio ese día.",
  },
];

export const WRITING_W2_CRITERIA: RubricCriterionDef[] = [
  {
    id: "grammatical_complexity",
    label: "Grammatical Complexity",
    weightPercent: 30,
    feedbackStrong: "Variedad de estructuras y oraciones bien encadenadas.",
    feedbackWeak: "Combiná oraciones con which/when/because y evitá solo frases muy cortas.",
  },
  {
    id: "vocabulary_precision",
    label: "Vocabulary Precision",
    weightPercent: 30,
    feedbackStrong: "Poco uso de palabras vacías y buena variedad léxica.",
    feedbackWeak: "Reemplazá good/nice/very por adjetivos más precisos y evitá repetir las mismas palabras.",
  },
  {
    id: "contextual_alignment",
    label: "Contextual Alignment",
    weightPercent: 40,
    feedbackStrong: "El momento memorable conecta con tu historia del Task 1.",
    feedbackWeak: "Referí personas, lugares o hechos de tu texto anterior para mantener continuidad.",
  },
];

export function getWritingCriteria(questionId: string): RubricCriterionDef[] | null {
  if (questionId === "w1") return WRITING_W1_CRITERIA;
  if (questionId === "w2") return WRITING_W2_CRITERIA;
  return null;
}

/**
 * Utility functions for restoring question state from Redux store
 */

// Generic interface for question results
export interface QuestionResult {
  questionId: number;
  result: "pass" | "fail";
  mainAnswer: "yes" | "no";
  subAnswers: (string | "yes" | "no")[];
  completed: boolean;
}

/**
 * Hook to get existing result for a question
 */
export const useQuestionResult = (questionId: number, questionResults: any[]): QuestionResult | undefined => {
  return questionResults?.find((result: any) => result.questionId === questionId);
};

/**
 * Helper to restore simple yes/no answers from subAnswers array
 */
export const restoreYesNoAnswers = (
  subAnswers: (string | "yes" | "no")[],
  setters: Array<(value: "yes" | "no" | null) => void>
): void => {
  subAnswers.forEach((answer, index) => {
    if (setters[index] && (answer === "yes" || answer === "no")) {
      setters[index](answer);
    }
  });
};

/**
 * Helper to restore score from result
 */
export const restoreScore = (
  result: "pass" | "fail",
  setScore: (score: 0 | 1 | null) => void
): void => {
  const finalScore = result === "pass" ? 0 : 1;
  setScore(finalScore);
};

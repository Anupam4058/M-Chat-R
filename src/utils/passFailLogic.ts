/**
 * Pass/Fail Logic Utilities
 * Contains reusable functions for calculating pass/fail results based on different conditions
 */

export type PassConditionType =
  | "all-yes"
  | "all-no"
  | "any-yes"
  | "any-no"
  | "max-yes"
  | "max-no"
  | "pass-direct"
  | "fail-direct"
  | "yes-to-only-pass-fail"
  | "yes-to-one-or-less"
  | "yes-to-two-or-more"
  | "next-layer";

/**
 * Calculate pass/fail result based on condition type and answers
 * @param condition - The pass condition type
 * @param answers - Array of yes/no answers
 * @returns "pass" | "fail" | null
 */
export const calculatePassFail = (
  condition: PassConditionType,
  answers: ("yes" | "no")[]
): "pass" | "fail" | null => {
  if (answers.length === 0) return null;

  const yesCount = answers.filter(answer => answer === "yes").length;
  const noCount = answers.filter(answer => answer === "no").length;

  switch (condition) {
    case "all-yes":
      return yesCount === answers.length ? "pass" : "fail";
    
    case "all-no":
      return noCount === answers.length ? "pass" : "fail";
    
    case "any-yes":
      return yesCount > 0 ? "pass" : "fail";
    
    case "any-no":
      return noCount > 0 ? "pass" : "fail";
    
    case "max-yes":
      return yesCount <= 1 ? "pass" : "fail";
    
    case "max-no":
      return noCount <= 1 ? "pass" : "fail";
    
    case "pass-direct":
      return "pass";
    
    case "fail-direct":
      return "fail";
    
    case "yes-to-only-pass-fail":
      // Special logic: if only one yes, pass; if more than one yes, fail
      if (yesCount === 1) return "pass";
      if (yesCount > 1) return "fail";
      return null; // Need at least one yes to determine
    
    case "yes-to-one-or-less":
      return yesCount <= 1 ? "pass" : "fail";
    
    case "yes-to-two-or-more":
      return yesCount >= 2 ? "pass" : "fail";
    
    default:
      return null;
  }
};

/**
 * Calculate pass/fail for a specific question based on main answer and sub-answers
 * @param mainAnswer - The main yes/no answer
 * @param subAnswers - Array of sub-question answers
 * @param yesCondition - Pass condition for yes answer
 * @param noCondition - Pass condition for no answer
 * @returns "pass" | "fail" | null
 */
export const calculateQuestionResult = (
  mainAnswer: "yes" | "no" | "",
  subAnswers: ("yes" | "no")[],
  yesCondition: PassConditionType,
  noCondition: PassConditionType
): "pass" | "fail" | null => {
  if (!mainAnswer) return null;

  if (mainAnswer === "yes") {
    return calculatePassFail(yesCondition, subAnswers);
  } else if (mainAnswer === "no") {
    return calculatePassFail(noCondition, subAnswers);
  }

  return null;
};

/**
 * Check if all sub-questions have been answered
 * @param subAnswers - Array of sub-question answers
 * @returns boolean
 */
export const areAllSubQuestionsAnswered = (subAnswers: ("yes" | "no")[]): boolean => {
  return subAnswers.every(answer => answer === "yes" || answer === "no");
};

/**
 * Get the number of answered sub-questions
 * @param subAnswers - Array of sub-question answers
 * @returns number
 */
export const getAnsweredSubQuestionsCount = (subAnswers: ("yes" | "no")[]): number => {
  return subAnswers.filter(answer => answer === "yes" || answer === "no").length;
};

/**
 * Check if a question is ready to calculate result
 * @param mainAnswer - The main yes/no answer
 * @param subAnswers - Array of sub-question answers
 * @returns boolean
 */
export const isQuestionReadyForResult = (
  mainAnswer: "yes" | "no" | "",
  subAnswers: ("yes" | "no")[]
): boolean => {
  return mainAnswer !== "" && areAllSubQuestionsAnswered(subAnswers);
}; 
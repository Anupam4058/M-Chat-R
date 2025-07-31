export type passConditionType = "pass-direct" | "fail-direct";

export type yesSelectedType = {
  questions: [];
  passCondition: passConditionType;
};

export type noSelectedType = {
  questions: [];
  passCondition: passConditionType;
};

export type questionType = {
  id: number;
  title: string;
  description: string;
  yesDescription?: string;
  noDescription?: string;
  yesSelected: yesSelectedType;
  noSelected: noSelectedType;
  answer?: "pass" | "fail";
};

// Simplified Answer state type definition
export type AnswerState = {
  mainAnswer: "yes" | "no" | "";
  passCheck?: "pass" | "fail";
};
export type passConditionType =
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

export type nextLayerConditionType =
  | "yes-to-two-or-more"
  | "yes-to-only-one"
  | "all-no"
  | "all-yes"

export type exampleQuestionType = {
  title: string;
  example?: "pass" | "fail" | "";
};

export type yesSelectedType = {
  title?: string;
  questions: exampleQuestionType[] | [];
  passCondition: passConditionType ;
  allSelectionRequired?: boolean;
  answer?: any;
  nextLayer?: yesSelectedType;
  nextLayerCondition?: nextLayerConditionType;
};

export type noSelectedType = {
  title?: string;
  questions: exampleQuestionType[] | [];
  passCondition: passConditionType ;
  allSelectionRequired?: boolean;
  answer?: any;
  nextLayer?: noSelectedType;
  nextLayerCondition?: nextLayerConditionType;
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

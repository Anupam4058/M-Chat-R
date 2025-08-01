/**
 * Question Component
 * Handles the display and interaction logic for individual questions in the questionnaire.
 * Features:
 * - Main question display with Yes/No options
 * - Sub-questions handling
 * - Progress tracking
 * - Validation logic
 * - Navigation between questions
 */
import React, { useEffect, useRef, useState } from "react";
import {
  exampleQuestionType,
  nextLayerConditionType,
  noSelectedType,
  passConditionType,
  questionType,
  yesSelectedType,
} from "../types";
import { toast } from "react-toastify";
import ProgressBar from "./ui/ProgessBar";
import { cn } from "./functions";

interface PropType {
  question: questionType;
  questionNo: number;
  handleNextQuestion: Function;
  handlePrevClick: Function;
  totalQuestions: number;
  answer?: any;
}

const Question = ({
  question,
  questionNo,
  handleNextQuestion,
  handlePrevClick,
  totalQuestions,
  answer,
}: PropType) => {
  // State management for question answers and UI
  const [mainAnswer, setMainAnswer] = useState<"yes" | "no" | "">("");
  const [subAnswer, setSubAnswer] = useState<("yes" | "no")[] | []>([]);
  const [currentSubQuestionIndex, setCurrentSubQuestionIndex] = useState<number>(0);
  const [currentLayer, setCurrentLayer] = useState<yesSelectedType | noSelectedType>();
  const [isPassCheckDone, setIsPassCheckDone] = useState<boolean>(false);
  const [isSelectionOn, setIsSelectionOn] = useState<boolean>(false);
  const [selectionAnswer, setselectionAnswer] = useState<exampleQuestionType[] | []>([]);
  const [passCheck, setpassCheck] = useState<"pass" | "fail">();
  const [subAnswerProgress, setSubAnswerProgress] = useState<number>(0);

  // Add new state for third layer
  const [thirdLayerSubAnswer, setThirdLayerSubAnswer] = useState<("yes" | "no")[] | []>([]);
  const [thirdLayerProgress, setThirdLayerProgress] = useState<number>(0);
  const [thirdLayerPassCheck, setThirdLayerPassCheck] = useState<"pass" | "fail" | undefined>();
  const [thirdLayerIsDone, setThirdLayerIsDone] = useState<boolean>(false);

  // Add a flag to track if third layer is required
  const [isThirdLayerRequired, setIsThirdLayerRequired] = useState(false);

  // Reset state when question changes
  useEffect(() => {
    if (answer) {
      setMainAnswer(answer.mainAnswer || "");
      setSubAnswer(answer.subAnswer || []);
      setCurrentSubQuestionIndex(answer.currentSubQuestionIndex || 0);
      setCurrentLayer(answer.currentLayer || undefined);
      setIsPassCheckDone(answer.isPassCheckDone || false);
      setIsSelectionOn(answer.isSelectionOn || false);
      setselectionAnswer(answer.selectionAnswer || []);
      setpassCheck(answer.passCheck || undefined);
      setSubAnswerProgress(answer.subAnswerProgress || 0);
    } else {
      setMainAnswer("");
      setSubAnswer([]);
      setCurrentSubQuestionIndex(0);
      setCurrentLayer(undefined);
      setIsPassCheckDone(false);
      setIsSelectionOn(false);
      setselectionAnswer([]);
      setpassCheck(undefined);
      setSubAnswerProgress(0);
    }
  }, [question]);

  // Reset third layer state when currentLayer changes
  useEffect(() => {
    setThirdLayerSubAnswer([]);
    setThirdLayerProgress(0);
    setThirdLayerPassCheck(undefined);
    setThirdLayerIsDone(false);
    setIsThirdLayerRequired(false);
  }, [question, currentLayer]);

  // Refs for animation handling
  const questionRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Animation effect for sub-questions
  useEffect(() => {
    const ref = questionRefs.current[currentSubQuestionIndex];

    if (ref) {
      ref.classList.add("slide-in");

      const timeoutId = setTimeout(() => {
        ref.classList.remove("slide-in");
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  }, [currentSubQuestionIndex, mainAnswer]);

  /**
   * Handles the main question answer selection
   * @param data - The selected answer ("yes" or "no")
   */
  const onMainAnswerChange = (data: "yes" | "no") => {
    setMainAnswer(data);
    setSubAnswer([]);
    setCurrentSubQuestionIndex(0);
    setSubAnswerProgress(0)
    if (data === "yes") {
      setCurrentLayer(question.yesSelected);
      if (question.yesSelected.questions.length === 0) {
        handleValidation(subAnswer, question.yesSelected.passCondition);
      }
    } else {
      setCurrentLayer(question.noSelected);
      if (question.noSelected.questions.length === 0) {
        handleValidation(subAnswer, question.noSelected.passCondition);
      }
    }
  };

  /**
   * Handles sub-question answer selection
   * @param answer - The selected answer ("yes" or "no")
   * @param index - The index of the sub-question
   */
  const onSubAnswerChange = (answer: "yes" | "no", index: number) => {
    let arr = [...subAnswer];
    arr[index] = answer;
    setSubAnswer(arr);
    if (currentLayer?.questions) {
      // Calculate progress based on answered questions only
      const answeredQuestions = arr.filter(ans => ans === 'yes' || ans === 'no').length;
      setSubAnswerProgress(
        (answeredQuestions * 100) / currentLayer.questions.length
      );
    }
    if (currentLayer?.questions) {
      if (currentLayer.questions.length - 1 === index) {
        // Only set progress to 100 if all questions are answered
        const allAnswered = arr.filter(ans => ans === 'yes' || ans === 'no').length === currentLayer.questions.length;
        setSubAnswerProgress(allAnswered ? 100 : (arr.filter(ans => ans === 'yes' || ans === 'no').length * 100) / currentLayer.questions.length);
        handleValidation(arr, currentLayer.passCondition);
        return;
      }
    }
    setTimeout(() => {
      setCurrentSubQuestionIndex(index + 1);
    }, 100);
  };

  /**
   * Handles selection type answers
   * @param data - The selected example question
   * @param bool - Whether the selection is being added or removed
   * @param index - The index of the selection
   */
  const handleSelectionAnswer = (
    data: exampleQuestionType,
    bool: boolean,
    index: number
  ) => {
    let temp = [...selectionAnswer];
    if (bool) {
      temp[index] = data;
    } else {
      temp.splice(index, 1);
    }
    setselectionAnswer(temp);

    let passCount = 0;
    let failCount = 0;
    temp.forEach((e) => {
      if (e?.example === "pass") {
        passCount++;
      } else if (e?.example === "fail") {
        failCount++;
      }
    });

    setpassCheck(
      passCount >= failCount ? "pass" : failCount > 0 ? "fail" : undefined
    );
    setIsPassCheckDone(temp.length > 0);
  };

  /**
   * Checks if answers contain only pass or fail conditions
   * @returns "pass", "fail", or "both"
   */
  const checkForYesToOnlyPassFail: () => "pass" | "fail" | "both" = () => {
    let passCount: number = 0;
    let failCount: number = 0;
    let questionsArr = currentLayer?.questions ?? [];
    subAnswer.forEach((e, i) => {
      if (e === "yes" && questionsArr[i].example === "pass") {
        passCount++;
      }
      if (e === "yes" && questionsArr[i].example === "fail") {
        failCount++;
      }
    });

    if (passCount > 0 && failCount === 0) {
      return "pass";
    } else if (failCount > 0 && passCount === 0) {
      return "fail";
    } else {
      return "both";
    }
  };

  /**
   * Validates answers based on pass/fail conditions
   * @param subAnswerList - List of sub-answers
   * @param conditionargs - Condition to check against
   * @returns Validation result
   */
  const handlePassFailCheck = (
    subAnswerList?: ("yes" | "no")[],
    conditionargs?: passConditionType | nextLayerConditionType
  ) => {
    let yesCount: number = 0;
    let noCount: number = 0;

    let answerList = subAnswerList ?? subAnswer;

    answerList.forEach((e) => {
      if (e === "yes") {
        yesCount++;
      } else {
        noCount++;
      }
    });

    let condition: passConditionType | nextLayerConditionType | undefined;
    condition = conditionargs ?? currentLayer?.passCondition;

    // Switch statement for different validation conditions
    switch (condition) {
      case "all-yes":
        if (yesCount === answerList.length) {
          return true;
        } else if (
          currentLayer?.nextLayer &&
          currentLayer?.nextLayerCondition &&
          handlePassFailCheck(answerList, currentLayer.nextLayerCondition)
        ) {
          return "next-layer";
        } else {
          return false;
        }
      case "all-no":
        return noCount === answerList.length;
      case "any-yes":
        if (yesCount > 0) {
          if (currentLayer?.nextLayer) {
            return "next-layer";
          }
          return true;
        } else {
          return false;
        }
      case "any-no":
        return noCount > 0;
      case "max-yes":
        return yesCount >= noCount;
      case "max-no":
        return yesCount <= noCount;
      case "pass-direct":
        return true;
      case "fail-direct":
        return false;
      case "yes-to-only-pass-fail":
        let answer = checkForYesToOnlyPassFail();
        if (answer === "pass" || answer === "fail") {
          return answer;
        } else {
          return "both";
        }
      case "yes-to-one-or-less":
        if (yesCount <= 1) {
          return true;
        } else if (
          currentLayer?.nextLayerCondition === "yes-to-two-or-more" &&
          yesCount > 1
        ) {
          return "next-layer";
        } else {
          return false;
        }
      case "yes-to-two-or-more":
        if (yesCount >= 2) {
          return true;
        } else if (
          currentLayer?.nextLayerCondition === "yes-to-only-one" &&
          yesCount === 1
        ) {
          return "next-layer";
        } else {
          return false;
        }
      case "next-layer":
        if(currentLayer?.nextLayerCondition === "all-yes" && yesCount === answerList.length){
          return "next-layer";
        } else {
          return false
        }
    }
  };

  /**
   * Handles the final validation of answers
   * @param subAnswerList - List of sub-answers
   * @param condition - Condition to validate against
   */
  const handleValidation = (subAnswerList: ("yes" | "no")[], condition: passConditionType | nextLayerConditionType ) => {
    const passCheck = handlePassFailCheck(subAnswerList, condition);

    if (passCheck === "both") {
      setIsSelectionOn(true);
      return;
    }

    // Universal multi-layer logic: always proceed to nextLayer if it exists
    if (currentLayer?.nextLayer) {
      setIsThirdLayerRequired(true);
      setCurrentSubQuestionIndex(0);
      setCurrentLayer(currentLayer.nextLayer);
      setSubAnswerProgress(0);
      setSubAnswer([]);
      setIsPassCheckDone(false);
      setpassCheck(undefined);
      return;
    }

    // If no nextLayer, determine pass/fail
    setIsThirdLayerRequired(false);
    const result = passCheck === true ? "pass" : passCheck === false ? "fail" : undefined;
    setpassCheck(result);
    setIsPassCheckDone(true);
  };

  // Add these new functions after the existing handlers
  const handlePrevSubQuestion = () => {
    if (currentSubQuestionIndex > 0) {
      setCurrentSubQuestionIndex(currentSubQuestionIndex - 1);
    }
  };

  const handleNextSubQuestion = () => {
    if (currentLayer?.questions && currentSubQuestionIndex < currentLayer.questions.length - 1) {
      setCurrentSubQuestionIndex(currentSubQuestionIndex + 1);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-4 sm:mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
        {/* Question Header */}
        <div className="mb-4 flex items-center gap-4">
          <span className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-lg font-display font-bold shadow-lg">
            {questionNo + 1}
          </span>
          <h2 className="text-lg text-justify sm:text-xl font-display font-bold text-gray-900">{question.title}</h2>
        </div>
        {/* Question Description */}
        {question.description && (
          <p className="text-gray-600 mb-4 text-center italic text-sm">
            (For example: {question.description})
          </p>
        )}
        {/* Main Answer Buttons */}
        <div className="flex flex-col gap-3 w-full max-w-xl mx-auto mt-2">
          <button
            onClick={() => onMainAnswerChange("yes")}
            className={cn(
              "flex items-center w-full py-2.5 px-6 rounded-full text-base font-display font-semibold border-2 transition-all duration-200",
              mainAnswer === "yes"
                ? "border-transparent bg-gradient-to-r from-indigo-200 via-purple-200 to-indigo-100 text-indigo-800 scale-105 shadow-lg"
                : "border-indigo-200 bg-gradient-to-r from-indigo-100/60 via-purple-100/60 to-white text-indigo-700 hover:scale-105 hover:border-indigo-400",
              "focus:outline-none"
            )}
          >
            {mainAnswer === "yes" && (
              <span className="mr-3 text-2xl">✔️</span>
            )}
            Yes
          </button>
          <button
            onClick={() => onMainAnswerChange("no")}
            className={cn(
              "flex items-center w-full py-2.5 px-6 rounded-full text-base font-display font-semibold border-2 transition-all duration-200",
              mainAnswer === "no"
                ? "border-transparent bg-gradient-to-r from-purple-200 via-indigo-200 to-purple-100 text-indigo-800 scale-105 shadow-lg"
                : "border-indigo-200 bg-gradient-to-r from-purple-100/60 via-indigo-100/60 to-white text-indigo-700 hover:scale-105 hover:border-indigo-400",
              "focus:outline-none"
            )}
          >
            {mainAnswer === "no" && (
              <span className="mr-3 text-2xl">✔️</span>
            )}
            No
          </button>
        </div>

        {/* Sub-Questions Section (Second Layer) */}
        {mainAnswer && currentLayer && currentLayer.questions.length > 0 && !isThirdLayerRequired && (
          <div className="mt-8 mx-0 sm:mx-8">
            {!currentLayer.title ? (
              <h3 className="text-lg text-justify font-semibold text-gray-800 mb-4">
                {mainAnswer === "yes"
                  ? `"If yes then..." ${question.yesDescription}`
                  : `"If no then..." ${question.noDescription}`}
              </h3>
            ) : (
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                {currentLayer.title}
              </h3>
            )}

            {/* Sub-question Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-center items-center mb-2">
                <span className="text-sm font-medium text-gray-600">
                  {subAnswer.filter(ans => ans === 'yes' || ans === 'no').length} of {currentLayer.questions.length} questions answered
                </span>
              </div>
              <ProgressBar progress={subAnswerProgress} barWidth="w-full" bgColor="bg-indigo-500" />
            </div>

            <div className="space-y-4 max-w-xl mx-auto relative">
              {/* Navigation Arrows - Updated for better mobile responsiveness */}
              <div className="absolute -left-4 sm:-left-12 top-1/2 transform -translate-y-1/2 flex flex-col gap-2 z-10">
                <button
                  onClick={handlePrevSubQuestion}
                  disabled={currentSubQuestionIndex === 0}
                  className={cn(
                    "p-1.5 sm:p-2 rounded-full transition-all duration-200 shadow-md",
                    currentSubQuestionIndex === 0
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white text-indigo-600 hover:bg-indigo-50 border border-indigo-200"
                  )}
                  aria-label="Previous sub-question"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              </div>
              <div className="absolute -right-4 sm:-right-12 top-1/2 transform -translate-y-1/2 flex flex-col gap-2 z-10">
                <button
                  onClick={handleNextSubQuestion}
                  disabled={currentSubQuestionIndex === (currentLayer?.questions.length || 0) - 1}
                  className={cn(
                    "p-1.5 sm:p-2 rounded-full transition-all duration-200 shadow-md",
                    currentSubQuestionIndex === (currentLayer?.questions.length || 0) - 1
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white text-indigo-600 hover:bg-indigo-50 border border-indigo-200"
                  )}
                  aria-label="Next sub-question"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* Add padding to prevent content overlap with arrows on mobile */}
              <div className="px-6 sm:px-0">
                {/* Existing sub-question content */}
                {(() => {
                  const subQuestion = currentLayer.questions[currentSubQuestionIndex];
                  if (!subQuestion) return null;
                  return (
                    <div
                      key={currentSubQuestionIndex}
                      ref={(el) => {
                        if (questionRefs.current) {
                          questionRefs.current[currentSubQuestionIndex] = el;
                        }
                      }}
                      className={cn(
                        "p-4 rounded-lg border-2 transition-all duration-300 transform hover:scale-[1.02]",
                        "border-indigo-500 bg-indigo-50"
                      )}
                    >
                      <div className="flex items-start">
                        <span className="text-indigo-600 font-semibold mr-3">{currentSubQuestionIndex + 1}.</span>
                        <p className="text-gray-700">{subQuestion.title}</p>
                      </div>
                      <div className="flex flex-col gap-4 mt-3 ml-0">
                        <button
                          onClick={() => onSubAnswerChange("yes", currentSubQuestionIndex)}
                          className={cn(
                            "flex items-center w-full py-2 px-6 rounded-full text-lg font-semibold border-2 transition-all duration-200",
                            subAnswer[currentSubQuestionIndex] === "yes"
                              ? "border-transparent bg-gradient-to-r from-indigo-200 via-purple-200 to-indigo-100 text-indigo-800 scale-105 shadow-lg"
                              : "border-indigo-200 bg-gradient-to-r from-indigo-100/60 via-purple-100/60 to-white text-indigo-700 hover:scale-105 hover:border-indigo-400",
                            "focus:outline-none"
                          )}
                        >
                          {subAnswer[currentSubQuestionIndex] === "yes" && (
                            <span className="mr-3 text-2xl">✔️</span>
                          )}
                          Yes
                        </button>
                        <button
                          onClick={() => onSubAnswerChange("no", currentSubQuestionIndex)}
                          className={cn(
                            "flex items-center w-full py-2 px-6 rounded-full text-lg font-semibold border-2 transition-all duration-200",
                            subAnswer[currentSubQuestionIndex] === "no"
                              ? "border-transparent bg-gradient-to-r from-purple-200 via-indigo-200 to-purple-100 text-indigo-800 scale-105 shadow-lg"
                              : "border-indigo-200 bg-gradient-to-r from-purple-100/60 via-indigo-100/60 to-white text-indigo-700 hover:scale-105 hover:border-indigo-400",
                            "focus:outline-none"
                          )}
                        >
                          {subAnswer[currentSubQuestionIndex] === "no" && (
                            <span className="mr-3 text-2xl">✔️</span>
                          )}
                          No
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        )}

        {/* Third Layer Card (Show only if required) */}
        {mainAnswer && isThirdLayerRequired && currentLayer && currentLayer.questions.length > 0 && (
          <div className="mt-8 mx-0 sm:mx-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {currentLayer.title || "Additional Question"}
            </h3>
            <div className="mb-4">
              <div className="flex justify-center items-center mb-2">
                <span className="text-sm font-medium text-gray-600">
                  {thirdLayerSubAnswer.filter(ans => ans === 'yes' || ans === 'no').length} of {currentLayer.questions.length} questions answered
                </span>
              </div>
              <ProgressBar progress={thirdLayerProgress} barWidth="w-full" bgColor="bg-indigo-500" />
            </div>
            <div className="space-y-4 max-w-xl mx-auto relative">
              <div className="px-6 sm:px-0">
                {currentLayer.questions.map((subQuestion, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "p-4 rounded-lg border-2 transition-all duration-300 transform hover:scale-[1.02]",
                      "border-indigo-500 bg-indigo-50"
                    )}
                  >
                    <div className="flex items-start">
                      <span className="text-indigo-600 font-semibold mr-3">{idx + 1}.</span>
                      <p className="text-gray-700">{subQuestion.title}</p>
                    </div>
                    <div className="flex flex-col gap-4 mt-3 ml-0">
                      <button
                        onClick={() => {
                          let arr = [...thirdLayerSubAnswer];
                          arr[idx] = "yes";
                          setThirdLayerSubAnswer(arr);
                          setThirdLayerProgress(((arr.filter(ans => ans === 'yes' || ans === 'no').length) * 100) / currentLayer.questions.length);
                          if (arr.length === currentLayer.questions.length && arr.every(ans => ans === 'yes' || ans === 'no')) {
                            const pass = arr.every(ans => ans === 'yes');
                            setThirdLayerPassCheck(pass ? "pass" : "fail");
                            setThirdLayerIsDone(true);
                          }
                        }}
                        className={cn(
                          "flex items-center w-full py-2 px-6 rounded-full text-lg font-semibold border-2 transition-all duration-200",
                          thirdLayerSubAnswer[idx] === "yes"
                            ? "border-transparent bg-gradient-to-r from-indigo-200 via-purple-200 to-indigo-100 text-indigo-800 scale-105 shadow-lg"
                            : "border-indigo-200 bg-gradient-to-r from-indigo-100/60 via-purple-100/60 to-white text-indigo-700 hover:scale-105 hover:border-indigo-400",
                          "focus:outline-none"
                        )}
                      >
                        {thirdLayerSubAnswer[idx] === "yes" && (
                          <span className="mr-3 text-2xl">✔️</span>
                        )}
                        Yes
                      </button>
                      <button
                        onClick={() => {
                          let arr = [...thirdLayerSubAnswer];
                          arr[idx] = "no";
                          setThirdLayerSubAnswer(arr);
                          setThirdLayerProgress(((arr.filter(ans => ans === 'yes' || ans === 'no').length) * 100) / currentLayer.questions.length);
                          if (arr.length === currentLayer.questions.length && arr.every(ans => ans === 'yes' || ans === 'no')) {
                            const pass = arr.every(ans => ans === 'yes');
                            setThirdLayerPassCheck(pass ? "pass" : "fail");
                            setThirdLayerIsDone(true);
                          }
                        }}
                        className={cn(
                          "flex items-center w-full py-2 px-6 rounded-full text-lg font-semibold border-2 transition-all duration-200",
                          thirdLayerSubAnswer[idx] === "no"
                            ? "border-transparent bg-gradient-to-r from-purple-200 via-indigo-200 to-purple-100 text-indigo-800 scale-105 shadow-lg"
                            : "border-indigo-200 bg-gradient-to-r from-purple-100/60 via-indigo-100/60 to-white text-indigo-700 hover:scale-105 hover:border-indigo-400",
                          "focus:outline-none"
                        )}
                      >
                        {thirdLayerSubAnswer[idx] === "no" && (
                          <span className="mr-3 text-2xl">✔️</span>
                        )}
                        No
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={() => handlePrevClick(questionNo)}
            disabled={questionNo === 0}
            className={cn(
              "px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105",
              questionNo === 0
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-indigo-200 via-purple-200 to-indigo-100 text-indigo-800 border-0 shadow-md"
            )}
          >
            Previous
          </button>
          <button
            onClick={() => handleNextQuestion(questionNo, {  mainAnswer,
              subAnswer,
              currentSubQuestionIndex,
              currentLayer,
              isPassCheckDone,
              isSelectionOn,
              selectionAnswer,
              passCheck,
              subAnswerProgress,
            })}
            disabled={
              !mainAnswer ||
              (
                (!isThirdLayerRequired && currentLayer && currentLayer.questions.length > 0 && subAnswerProgress < 100 && !isPassCheckDone) ||
                (isThirdLayerRequired && (!thirdLayerIsDone || !thirdLayerPassCheck))
              )
            }
            className={cn(
              "px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105",
              (!mainAnswer ||
                (
                  (!isThirdLayerRequired && currentLayer && currentLayer.questions.length > 0 && subAnswerProgress < 100 && !isPassCheckDone) ||
                  (isThirdLayerRequired && (!thirdLayerIsDone || !thirdLayerPassCheck))
                )
              )
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-indigo-200 via-purple-200 to-indigo-100 text-indigo-800 border-0 shadow-md"
            )}
          >
            {questionNo === totalQuestions - 1 ? "Finish" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Question;

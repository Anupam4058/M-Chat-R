/**
 * Question Component
 * Handles the display and interaction logic for individual questions in the questionnaire.
 * Features:
 * - Main question display with Yes/No options
 * - Simple pass/fail logic based on Yes/No answers
 * - Progress tracking
 * - Navigation between questions
 */
import React, { useEffect, useState } from "react";
import { questionType } from "../types";
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
  // State management for question answers
  const [mainAnswer, setMainAnswer] = useState<"yes" | "no" | "">("");
  const [passCheck, setPassCheck] = useState<"pass" | "fail">();

  // Reset state when question changes
  useEffect(() => {
    if (answer) {
      setMainAnswer(answer.mainAnswer || "");
      setPassCheck(answer.passCheck || undefined);
    } else {
      setMainAnswer("");
      setPassCheck(undefined);
    }
  }, [question]);

  /**
   * Handles the main question answer selection
   * @param data - The selected answer ("yes" or "no")
   */
  const onMainAnswerChange = (data: "yes" | "no") => {
    setMainAnswer(data);
    
    // Determine pass/fail based on the answer
    if (data === "yes") {
      const result = question.yesSelected.passCondition === "pass-direct" ? "pass" : "fail";
      setPassCheck(result);
    } else {
      const result = question.noSelected.passCondition === "pass-direct" ? "pass" : "fail";
      setPassCheck(result);
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
            {question.description}
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
            onClick={() => handleNextQuestion(questionNo, { 
              mainAnswer,
              passCheck,
            })}
            disabled={!mainAnswer}
            className={cn(
              "px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105",
              !mainAnswer
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

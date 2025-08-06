import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { saveQuestionResult, clearQuestionResult } from "../redux/Action";
import { RootState } from "../redux/Store";

const Question2: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Get child info and question results from Redux store
  const childInfo = useSelector((state: RootState) => (state as any).childInfo);
  const questionResults = useSelector((state: RootState) => (state as any).questionResults);
  const childName = childInfo?.childName || "your child";

  // Find existing result for this question
  const existingResult = questionResults?.find((result: any) => result.questionId === 2);

  // State for Initial Assessment Section (main questions for pass/fail)
  const [ignoreSounds, setIgnoreSounds] = useState<"yes" | "no" | null>(null);
  const [ignorePeople, setIgnorePeople] = useState<"yes" | "no" | null>(null);
  const [initialScore, setInitialScore] = useState<0 | 1 | null>(null);

  // State for Universal Hearing Test Section (separate, doesn't affect pass/fail)
  const [hearingTested, setHearingTested] = useState<"yes" | "no" | null>(null);
  const [hearingResults, setHearingResults] = useState<"normal" | "below-normal" | "inconclusive" | null>(null);

  // State for step-by-step display
  const [currentStep, setCurrentStep] = useState(0); // 0: Q1, 1: Q2, 2: Hearing Test

  // State for reset functionality
  const [showResetModal, setShowResetModal] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  const hearingResultOptions = [
    "Hearing in normal range",
    "Hearing below normal",
    "Results inconclusive or not definitive"
  ];

  // Effect to restore state from existing result
  useEffect(() => {
    // Skip restoration if we're in the middle of a reset
    if (isResetting) {
      return;
    }
    
    if (existingResult?.completed) {
      // Set restoring flag to prevent save effect from running
      setIsRestoring(true);
      
      // Restore the main answers from subAnswers array
      const subAnswers = existingResult.subAnswers || [];
      if (subAnswers[0]) setIgnoreSounds(subAnswers[0] as "yes" | "no");
      if (subAnswers[1]) setIgnorePeople(subAnswers[1] as "yes" | "no");
      if (subAnswers[2]) setHearingTested(subAnswers[2] as "yes" | "no");
      if (subAnswers[3]) {
        const hearingResult = subAnswers[3] as string;
        if (hearingResult === "normal") setHearingResults("normal");
        else if (hearingResult === "below-normal") setHearingResults("below-normal");
        else if (hearingResult === "inconclusive") setHearingResults("inconclusive");
      }
      
      // Restore the result score
      const finalScore = existingResult.result === "pass" ? 0 : 1;
      setInitialScore(finalScore);
      
      // Determine current step based on answers
      if (ignoreSounds !== null && ignorePeople !== null) {
        if (hearingTested !== null) {
          setCurrentStep(2);
        } else {
          setCurrentStep(1);
        }
      }
      
      // Reset restoring flag after a short delay to allow all state updates to complete
      setTimeout(() => {
        setIsRestoring(false);
      }, 100);
    }
  }, [existingResult, isResetting]);

  // Calculate initial score based on flowchart logic (only main questions)
  useEffect(() => {
    if (ignoreSounds !== null && ignorePeople !== null) {
      // "No to both" = Score 0, "Yes to either" = Score 1
      if (ignoreSounds === "no" && ignorePeople === "no") {
        setInitialScore(0);
      } else {
        setInitialScore(1);
      }
    }
  }, [ignoreSounds, ignorePeople]);

  // Save result when main assessment is complete (hearing test doesn't affect result)
  useEffect(() => {
    // Skip saving if we're restoring state
    if (isRestoring) {
      return;
    }
    
    if (initialScore !== null) {
      const result = initialScore === 0 ? "pass" : "fail";
      
      // Create answers array with proper typing (only main questions)
      const answers: ("yes" | "no")[] = [];
      if (ignoreSounds !== null) answers.push(ignoreSounds);
      if (ignorePeople !== null) answers.push(ignorePeople);
      
      dispatch(
        saveQuestionResult(
          2,
          result,
          "yes", // Main answer is always "yes" since we're asking the questions
          answers
        )
      );
    }
  }, [initialScore, ignoreSounds, ignorePeople, dispatch, isRestoring]);

  const handleNext = () => {
    navigate("/question/3");
  };

  const handlePrev = () => {
    navigate("/question/1");
  };

  const handleInitialAnswer = (answer: "yes" | "no", questionType: "sounds" | "people") => {
    if (questionType === "sounds") {
      setIgnoreSounds(answer);
      setCurrentStep(1); // Move to question 2
    } else if (questionType === "people") {
      setIgnorePeople(answer);
      setCurrentStep(2); // Move to hearing test
    }
  };

  const handleHearingTestAnswer = (answer: "yes" | "no") => {
    setHearingTested(answer);
  };

  const handleHearingResultAnswer = (result: "normal" | "below-normal" | "inconclusive") => {
    setHearingResults(result);
  };

  const handleResetQuestion = () => {
    setShowResetModal(true);
  };

  const handleConfirmReset = () => {
    // Set resetting flag to prevent state restoration
    setIsResetting(true);
    
    // Clear the result from Redux store first
    dispatch(clearQuestionResult(2));
    
    // Clear all state for this question
    setIgnoreSounds(null);
    setIgnorePeople(null);
    setInitialScore(null);
    setHearingTested(null);
    setHearingResults(null);
    setCurrentStep(0);
    
    // Close the modal
    setShowResetModal(false);
    
    // Reset the flag after a short delay to allow state updates to complete
    setTimeout(() => {
      setIsResetting(false);
    }, 100);
  };

  const handleCancelReset = () => {
    setShowResetModal(false);
  };

  const isMainAssessmentComplete = () => {
    return ignoreSounds !== null && ignorePeople !== null;
  };

  const isHearingTestComplete = () => {
    if (hearingTested === "no") return true;
    if (hearingTested === "yes") return hearingResults !== null;
    return false;
  };

  const isAssessmentComplete = () => {
    return isMainAssessmentComplete() && isHearingTestComplete();
  };

  const renderCurrentStep = () => {
    return (
      <div className="mb-8">
        {/* Initial Assessment Questions - Both questions in same container */}
        {(currentStep >= 0 || ignoreSounds !== null) && (
          <div className="mb-8">
            {/* <div className="text-center mb-4">
              <h3 className="text-lg font-semibold text-gray-700">
                Initial Assessment
              </h3>
            </div> */}

            <div className="bg-purple-100 border border-purple-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center">
                Does he/she...
              </h3>
              
                             {/* Question 1 */}
               <div className="flex items-center justify-between bg-white rounded-lg p-4 border border-purple-200 mb-3">
                 <span className="text-gray-700 font-medium text-md">1. often ignore sounds</span>
                 {ignoreSounds === null ? (
                   <div className="flex gap-2">
                     <button
                       onClick={() => handleInitialAnswer("yes", "sounds")}
                       className="px-4 py-2 rounded-lg text-md font-semibold transition-all border-2 bg-white text-gray-700 border-purple-200 hover:border-purple-300 hover:bg-purple-50"
                     >
                       YES
                     </button>
                     <button
                       onClick={() => handleInitialAnswer("no", "sounds")}
                       className="px-4 py-2 rounded-lg text-md font-semibold transition-all border-2 bg-white text-gray-700 border-purple-200 hover:border-purple-300 hover:bg-purple-50"
                     >
                       NO
                     </button>
                   </div>
                 ) : (
                   <div className="px-4 py-2 rounded-lg text-md font-semibold bg-gradient-to-r from-purple-500 to-indigo-500 text-white border-purple-500 shadow-lg">
                     {ignoreSounds === "yes" ? "YES" : "NO"}
                   </div>
                 )}
               </div>

                             {/* Question 2 - Show if answered or current step is 1 or higher */}
               {(currentStep >= 1 || ignorePeople !== null) && (
                 <div className="flex items-center justify-between bg-white rounded-lg p-4 border border-purple-200">
                   <span className="text-gray-700 font-medium text-md">2. often ignore people</span>
                   {ignorePeople === null ? (
                     <div className="flex gap-1">
                       <button
                         onClick={() => handleInitialAnswer("yes", "people")}
                         className="px-4 py-2 rounded-lg text-md font-semibold transition-all border-2 bg-white text-gray-700 border-purple-200 hover:border-purple-300 hover:bg-purple-50"
                       >
                         YES
                       </button>
                       <button
                         onClick={() => handleInitialAnswer("no", "people")}
                         className="px-4 py-2 rounded-lg text-md font-semibold transition-all border-2 bg-white text-gray-700 border-purple-200 hover:border-purple-300 hover:bg-purple-50"
                       >
                         NO
                       </button>
                     </div>
                   ) : (
                     <div className="px-4 py-2 rounded-lg text-md font-semibold bg-gradient-to-r from-purple-500 to-indigo-500 text-white border-purple-500 shadow-lg">
                       {ignorePeople === "yes" ? "YES" : "NO"}
                     </div>
                   )}
                 </div>
               )}
            </div>
          </div>
        )}

        {/* Universal Hearing Test - Show if both initial questions are answered */}
        {isMainAssessmentComplete() && (
          <div className="mb-8">
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold text-gray-700">
                Universal Hearing Test
              </h3>
              <p className="text-sm text-gray-600 italic">
                (This is a universal test for all children and does not affect the assessment result)
              </p>
            </div>
            
              <div className="bg-blue-100 border border-blue-200 rounded-lg p-4">
               <div className="flex items-center justify-between bg-white rounded-lg p-4 border border-blue-200 mb-4">
                 <span className="text-gray-700 font-medium text-md">Has {childName}'s hearing been tested?</span>
                 {hearingTested === null ? (
                   <div className="flex gap-2">
                     <button
                       onClick={() => handleHearingTestAnswer("yes")}
                       className="px-4 py-2 rounded-lg text-md font-semibold transition-all border-2 bg-white text-gray-700 border-blue-200 hover:border-blue-300 hover:bg-blue-50"
                     >
                       YES
                     </button>
                     <button
                       onClick={() => handleHearingTestAnswer("no")}
                       className="px-4 py-2 rounded-lg text-md font-semibold transition-all border-2 bg-white text-gray-700 border-blue-200 hover:border-blue-300 hover:bg-blue-50"
                     >
                       NO
                     </button>
                   </div>
                 ) : (
                   <div className="px-4 py-2 rounded-lg text-md font-semibold bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-blue-500 shadow-lg">
                     {hearingTested === "yes" ? "YES" : "NO"}
                   </div>
                 )}
               </div>

              {/* Hearing Test Results (only if Yes) */}
              {hearingTested === "yes" && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">
                    What were the results of the hearing test? (choose one):
                  </h3>
                  
                  <div className="flex flex-col gap-4">
                    {hearingResultOptions.map((option, index) => {
                      const resultValue = index === 0 ? "normal" : index === 1 ? "below-normal" : "inconclusive";
                      return (
                        <button
                          key={index}
                          onClick={() => handleHearingResultAnswer(resultValue as "normal" | "below-normal" | "inconclusive")}
                          disabled={hearingResults !== null}
                          className={`px-6 py-3 rounded-lg font-semibold transition-all border-2 flex items-center justify-start ${
                            hearingResults === resultValue
                              ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-blue-500 shadow-lg"
                              : hearingResults === null
                              ? "bg-white text-gray-700 border-blue-200 hover:border-blue-300 hover:bg-blue-50"
                              : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                          }`}
                        >
                          {hearingResults === resultValue && <span className="mr-2">✓</span>}
                          {option}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-indigo-200">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto bg-white/80 rounded-2xl shadow-2xl p-6 md:p-8">
          
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-600">Question 2 of 20</span>
              <span className="text-sm font-medium text-gray-600">10%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full" style={{ width: '10%' }}></div>
            </div>
          </div>

          {/* Main Question */}
          <div className="mb-8">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full flex items-center justify-center font-bold text-xl mr-4">
                2
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                You reported that you have wondered if {childName} might be deaf. What led you to wonder that?
              </h1>
            </div>
          </div>

          {/* Step-by-step content */}
          {renderCurrentStep()}

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <button
              onClick={handlePrev}
              className="px-6 py-3 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 transition-all"
            >
              Previous
            </button>
            
            {/* Reset Question Button - Only show if question is completed */}
            {existingResult?.completed && (
              <button
                onClick={handleResetQuestion}
                className="px-4 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-all flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Retry Question
              </button>
            )}
            
            <button
              onClick={handleNext}
              disabled={!isAssessmentComplete()}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                isAssessmentComplete()
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-lg"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Reset Question 2
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to reset this question? This will clear all your answers and you'll need to answer the question again.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={handleCancelReset}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-400 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmReset}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-all"
                >
                  Reset Question
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Question2; 
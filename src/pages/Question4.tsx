import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { saveQuestionResult, saveComplexQuestionResult, clearQuestionResult } from "../redux/Action";
import { RootState } from "../redux/Store";

const Question4: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Get child info and question results from Redux store
  const childInfo = useSelector((state: RootState) => (state as any).childInfo);
  const questionResults = useSelector((state: RootState) => (state as any).questionResults);
  const childName = childInfo?.childName || "your child";

  // Find existing result for this question
  const existingResult = questionResults?.find((result: any) => result.questionId === 4);

  // State for main answer and sub-questions
  const [mainAnswer, setMainAnswer] = useState<"yes" | "no" | null>(null);
  const [subAnswers, setSubAnswers] = useState<("yes" | "no")[]>([]);
  const [score, setScore] = useState<0 | 1 | null>(null);

  // State for one-by-one display
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Reset state variables
  const [showResetModal, setShowResetModal] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  // State for no examples
  const [noExamplesChecked, setNoExamplesChecked] = useState<boolean>(false);
  const [examplesSaved, setExamplesSaved] = useState<boolean>(false);
  const [userExample, setUserExample] = useState<string>("");

  const subQuestions = [
    "Stairs?",
    "Chairs?",
    "Furniture?",
    "Playground equipment?"
  ];

  // Effect to restore state from existing result
  useEffect(() => {
    if (existingResult?.completed && !isResetting) {
      setIsRestoring(true);
      setMainAnswer(existingResult.mainAnswer);
      setSubAnswers(existingResult.subAnswers || []);
      const finalScore = existingResult.result === "pass" ? 0 : 1;
      setScore(finalScore);
      setUserExample(existingResult.userExample || "");
      setNoExamplesChecked(!!existingResult.noExamplesChecked);
      setExamplesSaved(!!existingResult.examplesSaved);
      setTimeout(() => setIsRestoring(false), 100);
    }
  }, [existingResult, isResetting]);

  // Calculate score based on flowchart logic
  useEffect(() => {
    if (mainAnswer !== null && subAnswers.length === subQuestions.length) {
      // Check if all questions are actually answered (no undefined values)
      const allAnswered = subAnswers.every(answer => answer !== undefined && answer !== null);
      
      if (allAnswered) {
        const yesCount = subAnswers.filter(answer => answer === "yes").length;
        
        // "Yes to any" = Score 0 (PASS), "No to all" = Score 1 (FAIL)
        if (yesCount > 0) {
          setScore(0); // PASS
        } else {
          setScore(1); // FAIL
        }
      }
    }
  }, [mainAnswer, subAnswers, subQuestions.length]);

  // Save result when score is calculated
  useEffect(() => {
    if (isRestoring) {
      return;
    }
    
    if (score !== null) {
      const result = score === 0 ? "pass" : "fail";
      const complexData = {
        subAnswers,
        userExample,
        noExamplesChecked,
        examplesSaved
      };
      dispatch(
        saveComplexQuestionResult(
          4,
          result,
          mainAnswer || "no",
          complexData
        )
      );
    }
  }, [score, mainAnswer, subAnswers, dispatch, isRestoring, userExample, noExamplesChecked, examplesSaved]);

  const handleMainAnswer = (answer: "yes" | "no") => {
    setMainAnswer(answer);
    // Initialize subAnswers array with undefined values for all questions
    setSubAnswers(new Array(subQuestions.length).fill(undefined));
    setScore(null);
    setCurrentQuestionIndex(0);
  };

  const handleSubAnswer = (answer: "yes" | "no") => {
    const newSubAnswers = [...subAnswers];
    newSubAnswers[currentQuestionIndex] = answer;
    setSubAnswers(newSubAnswers);
    
    // Auto-advance to next question
    if (currentQuestionIndex < subQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < subQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleNext = () => {
    navigate("/question/5");
  };

  const handlePrev = () => {
    navigate("/question/3");
  };

  // Reset handlers
  const handleResetQuestion = () => {
    setShowResetModal(true);
  };

  const handleConfirmReset = () => {
    setIsResetting(true);
    
    // Clear all state
    setMainAnswer(null);
    setSubAnswers([]);
    setScore(null);
    setCurrentQuestionIndex(0);
    setUserExample("");
    setNoExamplesChecked(false);
    setExamplesSaved(false);
    
    // Clear from Redux store
    dispatch(clearQuestionResult(4));
    
    // Close modal
    setShowResetModal(false);
    
    // Reset the resetting flag after a short delay
    setTimeout(() => setIsResetting(false), 100);
  };

  const handleCancelReset = () => {
    setShowResetModal(false);
  };

  const getCurrentQuestion = () => {
    return subQuestions[currentQuestionIndex];
  };

  const getCurrentAnswer = () => {
    return subAnswers[currentQuestionIndex];
  };

  const getAnsweredCount = () => {
    return subAnswers.filter(answer => answer !== undefined).length;
  };

  const getTotalQuestions = () => {
    return subQuestions.length;
  };

  const canGoPrev = () => {
    return currentQuestionIndex > 0;
  };

  const canGoNext = () => {
    return currentQuestionIndex < subQuestions.length - 1;
  };

  // Update the gating function
  const isExampleRequirementMet = () => {
    if (mainAnswer === "no") return true;
    return examplesSaved || noExamplesChecked;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-indigo-200">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto bg-white/80 rounded-2xl shadow-2xl p-6 md:p-8">
          
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-600">Question 4 of 20</span>
              <span className="text-sm font-medium text-gray-600">20%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full" style={{ width: '20%' }}></div>
            </div>
          </div>

          {/* Main Question */}
          <div className="mb-8">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full flex items-center justify-center font-bold text-xl mr-4">
                4
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                Does {childName} like climbing on things?
              </h1>
            </div>
            <p className="text-gray-600 mb-6 italic">
              (furniture, playground equipment, or stairs)
            </p>
            
            {/* Main Answer Buttons - Horizontal Layout */}
            <div className="flex gap-4 mb-6 justify-center">
              <button
                onClick={() => handleMainAnswer("yes")}
                className={`px-6 py-3 rounded-full font-semibold transition-all border-2 flex items-center justify-center min-w-[120px] ${mainAnswer === "yes"
                    ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white border-purple-500 shadow-lg"
                    : "bg-white text-gray-700 border-purple-200 hover:border-purple-300 hover:bg-purple-50"
                }`}
              >
                {mainAnswer === "yes" && <span className="mr-2">✓</span>}
                Yes
              </button>
              <button
                onClick={() => handleMainAnswer("no")}
                className={`px-6 py-3 rounded-full font-semibold transition-all border-2 flex items-center justify-center min-w-[120px] ${mainAnswer === "no"
                    ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white border-purple-500 shadow-lg"
                    : "bg-white text-gray-700 border-purple-200 hover:border-purple-300 hover:bg-purple-50"
                }`}
              >
                {mainAnswer === "no" && <span className="mr-2">✓</span>}
                No
              </button>
            </div>
          </div>

          {/* Instructions based on main answer */}
          {mainAnswer === "yes" && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800 font-semibold mb-4">
                Please give me an example of something {childName} enjoys climbing on.
              </p>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left side - Description */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-blue-800 mb-2">
                    Description:
                  </h4>
                  <p className="text-sm text-gray-700">
                    Describe {childName}'s behavior when he/she climbs on things:
                  </p>
                  
                  {/* Info button below description */}
                  <div className="inline-flex items-center gap-3 bg-blue-50 text-blue-800 px-4 py-2 rounded-lg border border-blue-200 shadow-sm">
                    <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold">i</span>
                    </div>
                    <span className="text-xs text-blue-700">
                      This helps us understand {childName}'s specific climbing behaviors.
                    </span>
                  </div>
                </div>

                {/* Right side - Input field */}
                <div className="space-y-3">
                  <textarea
                    id="userExample"
                    value={userExample}
                    onChange={(e) => setUserExample(e.target.value)}
                    placeholder="For example: Climbing on furniture, playground equipment, or stairs?"
                    className={`w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                      score !== null ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                    rows={6}
                    disabled={score !== null}
                  />
                  
                  {/* Save button and checkbox row */}
                  <div className="flex items-center justify-between">
                    {/* Checkbox for no examples */}
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="noExamples"
                        checked={noExamplesChecked}
                        onChange={(e) => {
                          setNoExamplesChecked(e.target.checked);
                          // Reset saved state when checkbox is unchecked
                          if (!e.target.checked) {
                            setExamplesSaved(false);
                          }
                        }}
                        disabled={score !== null}
                        className={`w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 ${
                          score !== null ? 'cursor-not-allowed opacity-50' : ''
                        }`}
                      />
                      <label htmlFor="noExamples" className="text-sm text-gray-700">
                        I don't have any examples
                      </label>
                    </div>
                    
                    {/* Save button */}
                    <button
                      onClick={() => {
                        // Save the example and set saved state
                        if (userExample.trim() !== "") {
                          setExamplesSaved(true);
                          console.log('Saving example:', userExample);
                        }
                      }}
                      disabled={userExample.trim() === "" || score !== null}
                      className={`px-4 py-2 text-sm rounded-md transition-colors shadow-sm ${
                        userExample.trim() === "" || score !== null
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed" 
                          : "bg-blue-500 text-white hover:bg-blue-600"
                      }`}
                    >
                      {examplesSaved ? "Saved ✓" : "Save"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sub-Questions Progress Bar */}
          {mainAnswer !== null && score === null && (
            <div className="mb-4">
              <div className="w-full bg-gray-200 rounded-full h-1 mb-2">
                <div 
                  className="bg-gray-400 h-1 rounded-full" 
                  style={{ width: `${(getAnsweredCount() / getTotalQuestions()) * 100}%` }}
                ></div>
              </div>
              <div className="text-center text-sm text-gray-600">
                {getAnsweredCount()} of {getTotalQuestions()} questions answered
              </div>
            </div>
          )}

          {/* Sub-Questions - Box Structure */}
          {mainAnswer !== null && isExampleRequirementMet() && (
            <div className="mb-8">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-gray-700">
                  Does {childName} enjoy climbing on...
                </h3>
              </div>
              {/* Box Container for Sub-Questions */}
              <div className="bg-purple-100 border border-purple-200 rounded-lg p-6">
                {/* All Answered Questions - Always show all answered questions */}
                {subQuestions.map((question, index) => {
                  if (subAnswers[index] !== null && subAnswers[index] !== undefined) {
                    return (
                      <div key={index} className="flex items-center justify-between bg-white rounded-lg p-4 border border-purple-200 mb-3">
                        <span className="text-gray-700 font-medium text-md">
                          {index + 1}. {question}
                        </span>
                        <div className="px-4 py-2 rounded-lg text-md font-semibold bg-gradient-to-r from-purple-500 to-indigo-500 text-white border-purple-500 shadow-lg">
                          {subAnswers[index] === "yes" ? "YES" : "NO"}
                        </div>
                      </div>
                    );
                  }
                  return null;
                })}
                {/* Current Question - Show only if not all questions are answered and score is null */}
                {getAnsweredCount() < subQuestions.length && score === null && (
                  <div className="flex items-center justify-between bg-white rounded-lg p-4 border border-purple-200 mb-3">
                    <span className="text-gray-700 font-medium text-md">
                      {getAnsweredCount() + 1}. {subQuestions[getAnsweredCount()]}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          const newSubAnswers = [...subAnswers];
                          newSubAnswers[getAnsweredCount()] = "yes";
                          setSubAnswers(newSubAnswers);
                        }}
                        className="px-4 py-2 rounded-lg text-md font-semibold transition-all border-2 bg-white text-gray-700 border-purple-200 hover:border-purple-300 hover:bg-purple-50"
                      >
                        YES
                      </button>
                      <button
                        onClick={() => {
                          const newSubAnswers = [...subAnswers];
                          newSubAnswers[getAnsweredCount()] = "no";
                          setSubAnswers(newSubAnswers);
                        }}
                        className="px-4 py-2 rounded-lg text-md font-semibold transition-all border-2 bg-white text-gray-700 border-purple-200 hover:border-purple-300 hover:bg-purple-50"
                      >
                        NO
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

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
              disabled={score === null || (mainAnswer === "yes" && !examplesSaved && !noExamplesChecked)}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                score !== null && (mainAnswer !== "yes" || examplesSaved || noExamplesChecked)
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
                Reset Question 4
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

export default Question4; 
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { saveQuestionResult, clearQuestionResult } from "../redux/Action";
import { RootState } from "../redux/Store";

const Question19: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Get child info and question results from Redux store
  const childInfo = useSelector((state: RootState) => (state as any).childInfo);
  const questionResults = useSelector((state: RootState) => (state as any).questionResults);
  const childName = childInfo?.childName || "your child";

  // Find existing result for this question
  const existingResult = questionResults?.find((result: any) => result.questionId === 19);
  const childGender = childInfo?.gender || "unknown";
  
  // Get gender-specific pronouns
  const getPronoun = (type: "subject" | "object" | "possessive") => {
    if (childGender === "male") {
      return type === "subject" ? "he" : type === "object" ? "him" : "his";
    } else if (childGender === "female") {
      return type === "subject" ? "she" : type === "object" ? "her" : "her";
    } else {
      return type === "subject" ? "he/she" : type === "object" ? "him/her" : "his/her";
    }
  };

  // State for main answer and sub-questions
  const [mainAnswer, setMainAnswer] = useState<"yes" | "no" | null>(null);
  const [subAnswers, setSubAnswers] = useState<("yes" | "no")[]>([]);
  const [score, setScore] = useState<0 | 1 | null>(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  // State for one-by-one display
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const subQuestions = [
    `If ${childName} hears a strange or scary noise, will ${getPronoun("subject")} look at you before responding?`,
    `Does ${childName} look at you when someone new approaches?`,
    `Does ${childName} look at you when ${getPronoun("subject")} is faced with something unfamiliar or a little scary?`
  ];

  // Restore any existing answer from Redux store
  useEffect(() => {
    if (isResetting) return;
    if (existingResult?.completed) {
      setIsRestoring(true);
      // Restore main answer
      setMainAnswer(existingResult.mainAnswer);
      
      // Restore sub-answers
      if (existingResult.subAnswers && Array.isArray(existingResult.subAnswers)) {
        setSubAnswers(existingResult.subAnswers);
      }
      
      // Restore the result score
      const finalScore = existingResult.result === "pass" ? 0 : 1;
      setScore(finalScore);
      
      // Set current question index to the next unanswered question
      if (subAnswers.some(answer => answer !== null)) {
        const nextUnansweredIndex = subAnswers.findIndex(answer => answer === null);
        setCurrentQuestionIndex(nextUnansweredIndex >= 0 ? nextUnansweredIndex : subQuestions.length);
      }
      
      setTimeout(() => setIsRestoring(false), 100);
    } else if (existingResult === null || existingResult === undefined) {
      setMainAnswer(null);
      setSubAnswers([]);
      setScore(null);
      setCurrentQuestionIndex(0);
    }
  }, [existingResult, isResetting, subQuestions.length]);

  // Calculate score based on flowchart logic
  useEffect(() => {
    if (isRestoring) return;
    if (mainAnswer === "yes") {
      // "Yes" to main question → PASS (score 0)
      setScore(0);
    } else if (mainAnswer === "no") {
      // "No" to main question → Check sub-questions
      if (subAnswers.length > 0) {
        // Check if any answered sub-question is "Yes" → PASS (score 0)
        const hasYes = subAnswers.some(answer => answer === "yes");
        if (hasYes) {
          setScore(0);
        } else if (subAnswers.every(answer => answer !== undefined && answer !== null)) {
          // All sub-questions are "No" → FAIL (score 1)
          setScore(1);
        } else {
          setScore(null);
        }
      } else {
        setScore(null);
      }
    } else {
      setScore(null);
    }
  }, [mainAnswer, subAnswers, isRestoring]);

  // Save result when score is calculated
  useEffect(() => {
    if (isRestoring) return;
    if (score !== null) {
      const result = score === 0 ? "pass" : "fail";
      dispatch(
        saveQuestionResult(
          19,
          result,
          mainAnswer || "no",
          subAnswers
        )
      );
    }
  }, [score, mainAnswer, subAnswers, dispatch, isRestoring]);

  const handleMainAnswer = (answer: "yes" | "no") => {
    setMainAnswer(answer);
    setScore(null);
    if (answer === "yes") {
      // "Yes" leads to immediate PASS
    } else {
      // "No" leads to sub-questions
      setSubAnswers(new Array(subQuestions.length).fill(null));
      setCurrentQuestionIndex(0);
    }
  };

  const handleSubAnswer = (answer: "yes" | "no") => {
    // Determine which question is being answered based on the current state
    let questionIndex = 0;
    if (subAnswers[0] === "no") {
      if (subAnswers[1] === "no") {
        questionIndex = 2; // Third question
      } else if (subAnswers[1] === null) {
        questionIndex = 1; // Second question
      }
    } else if (subAnswers[0] === null) {
      questionIndex = 0; // First question
    }
    
    const newSubAnswers = [...subAnswers];
    newSubAnswers[questionIndex] = answer;
    setSubAnswers(newSubAnswers);
    
    // If "Yes" is answered, result is immediately PASS (no need to continue)
    if (answer === "yes") {
      // Stay on current question, result will be calculated by useEffect
    } else {
      // If "No", advance to next question
      if (questionIndex < subQuestions.length - 1) {
        setCurrentQuestionIndex(questionIndex + 1);
      }
    }
  };

  const handleResetQuestion = () => {
    setShowResetModal(true);
  };

  const handleConfirmReset = () => {
    setIsResetting(true);
    dispatch(clearQuestionResult(19));
    setMainAnswer(null);
    setSubAnswers([]);
    setScore(null);
    setCurrentQuestionIndex(0);
    setShowResetModal(false);
    setTimeout(() => setIsResetting(false), 100);
  };

  const handleCancelReset = () => {
    setShowResetModal(false);
  };

  const handleNext = () => {
    navigate("/question/20");
  };

  const handlePrev = () => {
    navigate("/question/18");
  };

  const getCurrentQuestion = () => {
    return subQuestions[currentQuestionIndex];
  };

  const getCurrentAnswer = () => {
    return subAnswers[currentQuestionIndex];
  };

  const getAnsweredCount = () => {
    return subAnswers.filter(answer => answer !== null).length;
  };

  const getTotalQuestions = () => {
    return subQuestions.length;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-indigo-200">
      <style>
        {`
          @keyframes fadeInBounce {
            0% { opacity: 0; transform: translateY(-20px); }
            50% { opacity: 1; transform: translateY(5px); }
            100% { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto bg-white/80 rounded-2xl shadow-2xl p-6 md:p-8">
          
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-600">Question 19 of 20</span>
              <span className="text-sm font-medium text-gray-600">95%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full" style={{ width: '95%' }}></div>
            </div>
          </div>

          {/* Main Question */}
          <div className="mb-8">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full flex items-center justify-center font-bold text-xl mr-4">
                19
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 text-left">
                If something new happens, does {childName} look at your face to see how you feel about it?
              </h1>
            </div>
            
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

          {/* Sub-Questions Section - Layered Display */}
          {mainAnswer === "no" && (
            <div className="mb-6">
              {/* Show answered questions as completed boxes first */}
              {subAnswers.map((answer, idx) => {
                if (answer !== null && answer !== undefined) {
                  let boxColor = "bg-blue-50 border-blue-200";
                  let borderColor = "border-blue-200";
                  let badgeColor = "from-blue-500 to-indigo-500";
                  
                  if (idx === 1) {
                    boxColor = "bg-purple-50 border-purple-200";
                    borderColor = "border-purple-200";
                    badgeColor = "from-purple-500 to-indigo-500";
                  } else if (idx === 2) {
                    boxColor = "bg-green-50 border-green-200";
                    borderColor = "border-green-200";
                    badgeColor = "from-green-500 to-indigo-500";
                  }
                  
                  return (
                    <div key={idx} className={`${boxColor} border-2 rounded-lg p-6 mb-4`}>
                      <div className="flex items-center justify-between bg-white rounded-lg p-4 border ${borderColor} mb-3">
                        <span className="text-gray-700 font-medium text-md text-left">
                          {idx + 1}. {subQuestions[idx]}
                        </span>
                        <div className={`px-4 py-2 rounded-lg text-md font-semibold bg-gradient-to-r ${badgeColor} text-white border shadow-lg`}>
                          {answer === "yes" ? "YES" : "NO"}
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              })}

              {/* Layer 1: First Sub Question */}
              {subAnswers[0] === null && (
                <div className="mb-6">
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-700">
                      First Follow-up Question
                    </h3>
                  </div>
                  
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
                    <div className="flex items-center justify-between bg-white rounded-lg p-4 border border-blue-200 mb-3">
                      <span className="text-gray-700 font-medium text-md text-left">
                        1. {subQuestions[0]}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSubAnswer("yes")}
                          className="px-4 py-2 rounded-lg text-md font-semibold transition-all border-2 bg-white text-gray-700 border-blue-200 hover:border-blue-300 hover:bg-blue-50"
                        >
                          YES
                        </button>
                        <button
                          onClick={() => handleSubAnswer("no")}
                          className="px-4 py-2 rounded-lg text-md font-semibold transition-all border-2 bg-white text-gray-700 border-blue-200 hover:border-blue-300 hover:bg-blue-50"
                        >
                          NO
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Layer 2: Second Sub Question */}
              {subAnswers[0] === "no" && subAnswers[1] === null && (
                <div className="mb-6">
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-700">
                      Second Follow-up Question
                    </h3>
                  </div>
                  
                  <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-6">
                    <div className="flex items-center justify-between bg-white rounded-lg p-4 border border-purple-200 mb-3">
                      <span className="text-gray-700 font-medium text-md text-left">
                        2. {subQuestions[1]}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSubAnswer("yes")}
                          className="px-4 py-2 rounded-lg text-md font-semibold transition-all border-2 bg-white text-gray-700 border-purple-200 hover:border-purple-300 hover:bg-purple-50"
                        >
                          YES
                        </button>
                        <button
                          onClick={() => handleSubAnswer("no")}
                          className="px-4 py-2 rounded-lg text-md font-semibold transition-all border-2 bg-white text-gray-700 border-purple-200 hover:border-purple-300 hover:bg-purple-50"
                        >
                          NO
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Layer 3: Third Sub Question */}
              {subAnswers[0] === "no" && subAnswers[1] === "no" && subAnswers[2] === null && (
                <div className="mb-6">
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-700">
                      Third Follow-up Question
                    </h3>
                  </div>
                  
                  <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
                    <div className="flex items-center justify-between bg-white rounded-lg p-4 border border-green-200 mb-3">
                      <span className="text-gray-700 font-medium text-md text-left">
                        3. {subQuestions[2]}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSubAnswer("yes")}
                          className="px-4 py-2 rounded-lg text-md font-semibold transition-all border-2 bg-white text-gray-700 border-green-200 hover:border-green-300 hover:bg-green-50"
                        >
                          YES
                        </button>
                        <button
                          onClick={() => handleSubAnswer("no")}
                          className="px-4 py-2 rounded-lg text-md font-semibold transition-all border-2 bg-white text-gray-700 border-green-200 hover:border-green-300 hover:bg-green-50"
                        >
                          NO
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
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
              disabled={score === null}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${score !== null
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
                Reset Question 19
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

export default Question19; 
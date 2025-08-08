import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { saveComplexQuestionResult, clearQuestionResult } from "../redux/Action";
import { RootState } from "../redux/Store";

const Question20: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Get child info and question results from Redux store
  const childInfo = useSelector((state: RootState) => (state as any).childInfo);
  const questionResults = useSelector((state: RootState) => (state as any).questionResults);
  const childName = childInfo?.childName || "your child";

  // Find existing result for this question
  const existingResult = questionResults?.find((result: any) => result.questionId === 20);
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
  const [enjoyBouncedSwung, setEnjoyBouncedSwung] = useState<"yes" | "no" | null>(null);
  const [reactionAnswers, setReactionAnswers] = useState<("yes" | "no")[]>([]);
  const [score, setScore] = useState<0 | 1 | null>(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  // State for one-by-one display
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const reactionQuestions = [
    "Laugh or smile?",
    "Talk or babble?",
    "Request more by holding out his/her arms?"
  ];

  // Restore any existing answer from Redux store
  useEffect(() => {
    if (isResetting) return;
    if (existingResult?.completed) {
      setIsRestoring(true);
      // Restore main answer
      setMainAnswer(existingResult.mainAnswer);
      
      // Restore enjoy bounced/swung answer
      if (existingResult.enjoyBouncedSwung !== undefined) {
        setEnjoyBouncedSwung(existingResult.enjoyBouncedSwung);
      }
      
      // Restore reaction answers
      if (existingResult.reactionAnswers && Array.isArray(existingResult.reactionAnswers)) {
        setReactionAnswers(existingResult.reactionAnswers);
      }
      
      // Restore the result score
      const finalScore = existingResult.result === "pass" ? 0 : 1;
      setScore(finalScore);
      
      setTimeout(() => setIsRestoring(false), 100);
    } else if (existingResult === null || existingResult === undefined) {
      setMainAnswer(null);
      setEnjoyBouncedSwung(null);
      setReactionAnswers([]);
      setScore(null);
      setCurrentQuestionIndex(0);
    }
  }, [existingResult, isResetting]);

  // Calculate score based on flowchart logic
  useEffect(() => {
    if (isRestoring) return;
    if (mainAnswer === "yes") {
      if (enjoyBouncedSwung === "yes") {
        // "Yes" to main question AND "Yes" to enjoy being bounced/swung → PASS (score 0)
        setScore(0);
      } else if (enjoyBouncedSwung === "no") {
        // "Yes" to main question BUT "No" to enjoy being bounced/swung → Check reactions
        if (reactionAnswers.length > 0 && reactionAnswers.every(answer => answer !== undefined && answer !== null)) {
          const hasPositiveReaction = reactionAnswers.some(answer => answer === "yes");
          if (hasPositiveReaction) {
            setScore(0); // PASS
          } else {
            setScore(1); // FAIL
          }
        } else {
          setScore(null);
        }
      } else {
        setScore(null);
      }
    } else if (mainAnswer === "no") {
      // "No" to main question → Check reactions directly
      if (reactionAnswers.length > 0 && reactionAnswers.every(answer => answer !== undefined && answer !== null)) {
        const hasPositiveReaction = reactionAnswers.some(answer => answer === "yes");
        if (hasPositiveReaction) {
          setScore(0); // PASS
        } else {
          setScore(1); // FAIL
        }
      } else {
        setScore(null);
      }
    } else {
      setScore(null);
    }
  }, [mainAnswer, enjoyBouncedSwung, reactionAnswers, isRestoring]);

  // Save result when score is calculated
  useEffect(() => {
    if (isRestoring) return;
    if (score !== null) {
      const result = score === 0 ? "pass" : "fail";
      const complexData = {
        enjoyBouncedSwung,
        reactionAnswers,
      };
      
      dispatch(
        saveComplexQuestionResult(
          20,
          result,
          mainAnswer || "no",
          complexData
        )
      );
    }
  }, [score, mainAnswer, enjoyBouncedSwung, reactionAnswers, dispatch, isRestoring]);

  const handleMainAnswer = (answer: "yes" | "no") => {
    setMainAnswer(answer);
    setScore(null);
    setEnjoyBouncedSwung(null);
    
    if (answer === "no") {
      // If "No" to main question, initialize reaction questions immediately
      setReactionAnswers(new Array(reactionQuestions.length).fill(null));
      setCurrentQuestionIndex(0);
    } else {
      // If "Yes" to main question, clear reaction answers
      setReactionAnswers([]);
      setCurrentQuestionIndex(0);
    }
  };

  const handleEnjoyBouncedSwung = (answer: "yes" | "no") => {
    setEnjoyBouncedSwung(answer);
    if (answer === "yes") {
      // "Yes" to enjoy being bounced/swung → PASS (no need for reaction questions)
    } else {
      // "No" to enjoy being bounced/swung → Need reaction questions
      setReactionAnswers(new Array(reactionQuestions.length).fill(null));
      setCurrentQuestionIndex(0);
    }
  };

  const handleReactionAnswer = (answer: "yes" | "no") => {
    const newReactionAnswers = [...reactionAnswers];
    newReactionAnswers[currentQuestionIndex] = answer;
    setReactionAnswers(newReactionAnswers);
    
    // Auto-advance to next question
    if (currentQuestionIndex < reactionQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
    // Don't calculate result immediately - wait for all questions to be answered
  };

  const handleResetQuestion = () => {
    setShowResetModal(true);
  };

  const handleConfirmReset = () => {
    setIsResetting(true);
    dispatch(clearQuestionResult(20));
    setMainAnswer(null);
    setEnjoyBouncedSwung(null);
    setReactionAnswers([]);
    setScore(null);
    setCurrentQuestionIndex(0);
    setShowResetModal(false);
    setTimeout(() => setIsResetting(false), 100);
  };

  const handleCancelReset = () => {
    setShowResetModal(false);
  };

  const handleNext = () => {
    navigate("/result");
  };

  const handlePrev = () => {
    navigate("/question/19");
  };

  const getCurrentQuestion = () => {
    return reactionQuestions[currentQuestionIndex];
  };

  const getCurrentAnswer = () => {
    return reactionAnswers[currentQuestionIndex];
  };

  const getAnsweredCount = () => {
    return reactionAnswers.filter(answer => answer !== null).length;
  };

  const getTotalQuestions = () => {
    return reactionQuestions.length;
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
              <span className="text-sm font-medium text-gray-600">Question 20 of 20</span>
              <span className="text-sm font-medium text-gray-600">100%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full" 
                style={{ width: "100%" }}
              ></div>
            </div>
          </div>

          {/* Main Question */}
          <div className="mb-8">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full flex items-center justify-center font-bold text-xl mr-4">
                20
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 text-left">
                Does {childName} like movement activities?
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

          {/* Enjoy Being Bounced/Swung Question (for "Yes" path) */}
          {mainAnswer === "yes" && (
            <div className="mb-6">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-gray-700">
                  Follow-up Question
                </h3>
              </div>
              
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
                <div className="flex items-center justify-between bg-white rounded-lg p-4 border border-blue-200 mb-3">
                  <span className="text-gray-700 font-medium text-md text-left">
                    Does {getPronoun("subject")} enjoy being bounced or swung?
                  </span>
                  {enjoyBouncedSwung !== null ? (
                    <div className="px-4 py-2 rounded-lg text-md font-semibold bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-blue-500 shadow-lg">
                      {enjoyBouncedSwung === "yes" ? "YES" : "NO"}
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEnjoyBouncedSwung("yes")}
                        className="px-4 py-2 rounded-lg text-md font-semibold transition-all border-2 bg-white text-gray-700 border-blue-200 hover:border-blue-300 hover:bg-blue-50"
                      >
                        YES
                      </button>
                      <button
                        onClick={() => handleEnjoyBouncedSwung("no")}
                        className="px-4 py-2 rounded-lg text-md font-semibold transition-all border-2 bg-white text-gray-700 border-blue-200 hover:border-blue-300 hover:bg-blue-50"
                      >
                        NO
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Reaction Questions Section */}
          {((mainAnswer === "yes" && enjoyBouncedSwung === "no") || mainAnswer === "no") && (
            <div className="mb-6">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-gray-700">
                  When you swing or bounce {getPronoun("object")}, how does {getPronoun("subject")} react?
                </h3>
              </div>
              
              {/* Questions Box */}
              <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-6">
                {/* All Answered Questions - Always show all answered questions */}
                {reactionQuestions.map((question, index) => {
                  if (reactionAnswers[index] !== null && reactionAnswers[index] !== undefined) {
                    return (
                      <div key={index} className="flex items-center justify-between bg-white rounded-lg p-4 border border-purple-200 mb-3">
                        <span className="text-gray-700 font-medium text-md text-left">
                          {index + 1}. {question}
                        </span>
                        <div className="px-4 py-2 rounded-lg text-md font-semibold bg-gradient-to-r from-purple-500 to-indigo-500 text-white border-purple-500 shadow-lg">
                          {reactionAnswers[index] === "yes" ? "YES" : "NO"}
                        </div>
                      </div>
                    );
                  }
                  return null;
                })}
                
                {/* Current Question - Show only if not all questions are answered */}
                {getAnsweredCount() < reactionQuestions.length && (
                  <div className="flex items-center justify-between bg-white rounded-lg p-4 border border-purple-200 mb-3">
                    <span className="text-gray-700 font-medium text-md text-left">
                      {getAnsweredCount() + 1}. {reactionQuestions[getAnsweredCount()]}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleReactionAnswer("yes")}
                        className="px-4 py-2 rounded-lg text-md font-semibold transition-all border-2 bg-white text-gray-700 border-purple-200 hover:border-purple-300 hover:bg-purple-50"
                      >
                        YES
                      </button>
                      <button
                        onClick={() => handleReactionAnswer("no")}
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
              disabled={score === null}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${score !== null
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-lg"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              View Results
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
                Reset Question 20
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

export default Question20; 
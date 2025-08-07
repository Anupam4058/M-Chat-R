import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { saveQuestionResult, clearQuestionResult } from "../redux/Action";
import { RootState } from "../redux/Store";

const Question8: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Get child info and question results from Redux store
  const childInfo = useSelector((state: RootState) => (state as any).childInfo);
  const questionResults = useSelector((state: RootState) => (state as any).questionResults);
  const childName = childInfo?.childName || "your child";

  // Find existing result for this question
  const existingResult = questionResults?.find((result: any) => result.questionId === 8);
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

  // State for one-by-one display
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // State for follow-up questions
  const [followUpAnswer, setFollowUpAnswer] = useState<"yes" | "no" | null>(null);
  const [frequencyAnswer, setFrequencyAnswer] = useState<"yes" | "no" | null>(null);

  // State for current section
  const [currentSection, setCurrentSection] = useState<"main" | "followup" | "sub" | "frequency">("main");

  // Reset state variables
  const [showResetModal, setShowResetModal] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  
  // Ref to prevent unnecessary re-renders
  const hasSavedRef = useRef(false);

  const subQuestions = [
    "Play with another child?",
    "Talk to another child?",
    "Babble or make vocal noises?",
    "Watch another child?",
    "Smile at another child?",
    "Act shy at first but then smile?",
    "Get excited about another child?"
  ];

  // Effect to restore state from existing result
  useEffect(() => {
    if (existingResult?.completed && !isResetting) {
      // Restore main answer
      setMainAnswer(existingResult.mainAnswer);
      
      // Restore all answers from subAnswers array
      const savedSubAnswers = existingResult.subAnswers || [];
      const subAnswersCount = subQuestions.length;
      
      // Structure: [followUpAnswer, subQuestions..., frequencyAnswer]
      const followUp = savedSubAnswers[0] as "yes" | "no" | null;
      const subAns = savedSubAnswers.slice(1, 1 + subAnswersCount) as ("yes" | "no")[];
      const frequency = savedSubAnswers[1 + subAnswersCount] as "yes" | "no" | null;
      
      if (followUp) setFollowUpAnswer(followUp);
      setSubAnswers(subAns);
      if (frequency) setFrequencyAnswer(frequency);
      
      // Restore the result score
      const finalScore = existingResult.result === "pass" ? 0 : 1;
      setScore(finalScore);
      
      // Set appropriate current section based on restored state
      if (existingResult.mainAnswer === "yes") {
        setCurrentSection("main");
      } else if (followUp) {
        if (followUp === "no") {
          setCurrentSection("followup");
        } else {
          // Check if any sub-questions were answered
          const hasSubAnswers = subAns.some(answer => answer !== null && answer !== undefined);
          if (hasSubAnswers) {
            if (frequency !== null) {
              setCurrentSection("frequency");
            } else {
              setCurrentSection("sub");
            }
          } else {
            setCurrentSection("sub");
          }
        }
      } else {
        setCurrentSection("followup");
      }
    }
  }, [existingResult, subQuestions.length, isResetting]);

  // Calculate score based on flowchart logic
  useEffect(() => {
    // Don't calculate if we're resetting or if score is already set
    if (isResetting || score !== null) {
      return;
    }

    if (mainAnswer === "yes") {
      setScore(0); // PASS
      return;
    }

    if (mainAnswer === "no") {
      if (followUpAnswer === "no") {
        setScore(1); // FAIL
        return;
      }

      if (followUpAnswer === "yes") {
        // Check if we have all necessary answers for sub-questions
        const subComplete = subAnswers.length === subQuestions.length && 
                           subAnswers.every(answer => answer !== undefined && answer !== null);
        
        if (subComplete) {
          const yesCount = subAnswers.filter(answer => answer === "yes").length;
          
          if (yesCount === 0) {
            // "No to all" - immediate FAIL
            setScore(1); // FAIL
          } else if (yesCount > 0 && frequencyAnswer !== null) {
            // "Yes to any" - check frequency answer
            if (frequencyAnswer === "yes") {
              setScore(0); // PASS
            } else {
              setScore(1); // FAIL
            }
          }
        }
      }
    }
  }, [mainAnswer, followUpAnswer, subAnswers, frequencyAnswer, subQuestions.length, score, isResetting]);

  // Save result when score is calculated
  useEffect(() => {
    if (score !== null && !isResetting && !hasSavedRef.current) {
      hasSavedRef.current = true;
      const result = score === 0 ? "pass" : "fail";
      
      // Create the correct data structure: [followUpAnswer, subQuestions..., frequencyAnswer]
      const allSubAnswers: ("yes" | "no")[] = [];
      
      // Add follow-up answer first
      if (followUpAnswer !== null) {
        allSubAnswers.push(followUpAnswer);
      }
      
      // Add sub-answers
      allSubAnswers.push(...subAnswers);
      
      // Add frequency answer last
      if (frequencyAnswer !== null) {
        allSubAnswers.push(frequencyAnswer);
      }
      
      dispatch(
        saveQuestionResult(
          8,
          result,
          mainAnswer || "no",
          allSubAnswers
        )
      );
    }
  }, [score, mainAnswer, subAnswers, followUpAnswer, frequencyAnswer, dispatch, isResetting]);

  const handleMainAnswer = (answer: "yes" | "no") => {
    setMainAnswer(answer);
    setScore(null);
    setFollowUpAnswer(null);
    setFrequencyAnswer(null);
    
    if (answer === "yes") {
      // If "Yes", we can calculate score immediately
      // The useEffect will handle the scoring
    } else {
      // If "No", proceed to follow-up question
      setCurrentSection("followup");
    }
  };

  const handleFollowUpAnswer = (answer: "yes" | "no") => {
    setFollowUpAnswer(answer);
    
    if (answer === "no") {
      // If "No", we can calculate score immediately
      // The useEffect will handle the scoring
    } else {
      // If "Yes", proceed to sub-questions
      setCurrentSection("sub");
      setSubAnswers(new Array(subQuestions.length).fill(undefined));
      setCurrentQuestionIndex(0);
    }
  };

  const handleSubAnswer = (answer: "yes" | "no") => {
    const newSubAnswers = [...subAnswers];
    newSubAnswers[currentQuestionIndex] = answer;
    setSubAnswers(newSubAnswers);
    
    // Auto-advance to next question or check if we need frequency question
    if (currentQuestionIndex < subQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Check if all questions have been answered before proceeding
      const allAnswered = newSubAnswers.every(answer => answer !== undefined && answer !== null);
      
      if (allAnswered) {
        // Check if any sub-questions were answered "Yes"
        const yesCount = newSubAnswers.filter(answer => answer === "yes").length;
        
        if (yesCount > 0) {
          // If any sub-question is "Yes", proceed to frequency question
          setCurrentSection("frequency");
        } else {
          // If all sub-questions are "No", we can calculate score immediately
          // The useEffect will handle the scoring
        }
      }
    }
  };

  const handleFrequencyAnswer = (answer: "yes" | "no") => {
    setFrequencyAnswer(answer);
  };

  const handleNextQuestion = () => {
    if (currentSection === "sub" && currentQuestionIndex < subQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentSection === "sub" && currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    } else if (currentSection === "frequency") {
      setCurrentSection("sub");
      setCurrentQuestionIndex(subQuestions.length - 1);
    }
  };

  const handleNext = () => {
    navigate("/question/9");
  };

  const handlePrev = () => {
    navigate("/question/7");
  };

  const handleResetQuestion = () => {
    setShowResetModal(true);
  };

  const handleConfirmReset = () => {
    setIsResetting(true);
    setShowResetModal(false);
    
    // Clear the question result from Redux
    dispatch(clearQuestionResult(8));
    
    // Reset all state
    setMainAnswer(null);
    setSubAnswers([]);
    setScore(null);
    setCurrentQuestionIndex(0);
    setFollowUpAnswer(null);
    setFrequencyAnswer(null);
    setCurrentSection("main");
    hasSavedRef.current = false;
    
    // Reset the resetting flag after a short delay
    setTimeout(() => {
      setIsResetting(false);
    }, 100);
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
    if (currentSection === "sub") {
      return currentQuestionIndex > 0;
    }
    return false;
  };

  const canGoNext = () => {
    if (currentSection === "sub") {
      return currentQuestionIndex < subQuestions.length - 1;
    }
    return false;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-indigo-200">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto bg-white/80 rounded-2xl shadow-2xl p-6 md:p-8">
          
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-600">Question 8 of 20</span>
              <span className="text-sm font-medium text-gray-600">40%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full" style={{ width: '40%' }}></div>
            </div>
          </div>

          {/* Main Question */}
          <div className="mb-8">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full flex items-center justify-center font-bold text-xl mr-4">
                8
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                Is {childName} interested in children who are not {getPronoun("possessive")} brother or sister?
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

          {/* Instructions for No path */}
          {mainAnswer === "no" && currentSection !== "main" && score === null && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800">
                When you are at the playground or supermarket, does {childName} usually respond to other children?
              </p>
            </div>
          )}

          {/* Follow-up Question Box */}
          {(currentSection === "followup" || (followUpAnswer !== null && mainAnswer === "no")) && (
            <div className="mb-6">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-gray-700">
                  Follow-up Question
                </h3>
              </div>
              
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
                {/* Show the follow-up question */}
                <div className="flex items-center justify-between bg-white rounded-lg p-4 border border-blue-200 mb-3">
                  <span className="text-gray-700 font-medium text-md">
                    When you are at the playground or supermarket, does {childName} usually respond to other children?
                  </span>
                  {followUpAnswer !== null ? (
                    <div className="px-4 py-2 rounded-lg text-md font-semibold bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-blue-500 shadow-lg">
                      {followUpAnswer === "yes" ? "YES" : "NO"}
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleFollowUpAnswer("yes")}
                        className="px-4 py-2 rounded-lg text-md font-semibold transition-all border-2 bg-white text-gray-700 border-blue-200 hover:border-blue-300 hover:bg-blue-50"
                      >
                        YES
                      </button>
                      <button
                        onClick={() => handleFollowUpAnswer("no")}
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

          {/* Instructions for sub-questions */}
          {currentSection === "sub" && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800">
                How does {childName} respond? (If parent does not give a 0 example below, ask each individually.)
              </p>
            </div>
          )}

          {/* Sub-Questions Section */}
          {(currentSection === "sub" || (score !== null && mainAnswer === "no" && followUpAnswer === "yes")) && (
            <div className="mb-6">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-gray-700">
                  Does {childName}...
                </h3>
              </div>
              
              {/* Questions Box */}
              <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-6">
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
                
                {/* Current Question - Show only if not all questions are answered and not in frequency */}
                {getAnsweredCount() < subQuestions.length && currentSection === "sub" && (
                  <div className="flex items-center justify-between bg-white rounded-lg p-4 border border-purple-200 mb-3">
                    <span className="text-gray-700 font-medium text-md">
                      {getAnsweredCount() + 1}. {subQuestions[getAnsweredCount()]}
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
                )}
              </div>
            </div>
          )}

          {/* Frequency Question Box */}
          {(currentSection === "frequency" || (frequencyAnswer !== null && mainAnswer === "no" && followUpAnswer === "yes")) && (
            <div className="mb-6">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-gray-700">
                  Frequency Question
                </h3>
              </div>
              
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
                {/* Show the frequency question */}
                <div className="flex items-center justify-between bg-white rounded-lg p-4 border border-green-200 mb-3">
                  <span className="text-gray-700 font-medium text-md">
                    Does {childName} respond to other children more than half of the time?
                  </span>
                  {frequencyAnswer !== null ? (
                    <div className="px-4 py-2 rounded-lg text-md font-semibold bg-gradient-to-r from-green-500 to-indigo-500 text-white border-green-500 shadow-lg">
                      {frequencyAnswer === "yes" ? "YES" : "NO"}
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleFrequencyAnswer("yes")}
                        className="px-4 py-2 rounded-lg text-md font-semibold transition-all border-2 bg-white text-gray-700 border-green-200 hover:border-green-300 hover:bg-green-50"
                      >
                        YES
                      </button>
                      <button
                        onClick={() => handleFrequencyAnswer("no")}
                        className="px-4 py-2 rounded-lg text-md font-semibold transition-all border-2 bg-white text-gray-700 border-green-200 hover:border-green-300 hover:bg-green-50"
                      >
                        NO
                      </button>
                    </div>
                  )}
                </div>
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
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                score !== null
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
                Reset Question 8
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

export default Question8; 
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { saveComplexQuestionResult } from "../redux/Action";
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

  // State for one-by-one display
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const reactionQuestions = [
    "Laugh or smile?",
    "Talk or babble?",
    "Request more by holding out his/her arms?"
  ];

  // Restore any existing answer from Redux store
  useEffect(() => {
    if (existingResult?.completed) {
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
    }
  }, [existingResult]);

  // Calculate score based on flowchart logic
  useEffect(() => {
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
  }, [mainAnswer, enjoyBouncedSwung, reactionAnswers]);

  // Save result when score is calculated
  useEffect(() => {
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
  }, [score, mainAnswer, enjoyBouncedSwung, reactionAnswers, dispatch]);

  const handleMainAnswer = (answer: "yes" | "no") => {
    setMainAnswer(answer);
    setScore(null);
    setEnjoyBouncedSwung(null);
    setReactionAnswers([]);
    setCurrentQuestionIndex(0);
  };

  const handleEnjoyBouncedSwung = (answer: "yes" | "no") => {
    setEnjoyBouncedSwung(answer);
    if (answer === "yes") {
      // "Yes" to enjoy being bounced/swung → PASS (no need for reaction questions)
    } else {
      // "No" to enjoy being bounced/swung → Need reaction questions
      setReactionAnswers(new Array(reactionQuestions.length).fill(undefined));
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



  const handleNextQuestion = () => {
    if (currentQuestionIndex < reactionQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
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
    return reactionAnswers.filter(answer => answer !== undefined).length;
  };

  const getTotalQuestions = () => {
    return reactionQuestions.length;
  };

  const canGoPrev = () => {
    return currentQuestionIndex > 0;
  };

  const canGoNext = () => {
    // Allow next if there are more questions to go to
    return currentQuestionIndex < reactionQuestions.length - 1;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-indigo-200">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto bg-white/80 rounded-2xl shadow-2xl p-6 md:p-8">
          
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

          {/* Main Question - Always Visible */}
          <div className="mb-8">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full flex items-center justify-center font-bold text-xl mr-4">
                20
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                Does {childName} like movement activities?
              </h1>
            </div>
            
            {/* Main Answer Buttons - Vertical Layout */}
            <div className="flex flex-col gap-4 mb-6">
              <button
                onClick={() => handleMainAnswer("yes")}
                className={`px-8 py-4 rounded-lg font-semibold transition-all border-2 flex items-center justify-start ${
                  mainAnswer === "yes"
                    ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white border-purple-500 shadow-lg"
                    : "bg-white text-gray-700 border-purple-200 hover:border-purple-300 hover:bg-purple-50"
                }`}
              >
                {mainAnswer === "yes" && <span className="mr-2">✓</span>}
                Yes
              </button>
              <button
                onClick={() => handleMainAnswer("no")}
                className={`px-8 py-4 rounded-lg font-semibold transition-all border-2 flex items-center justify-start ${
                  mainAnswer === "no"
                    ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white border-purple-500 shadow-lg"
                    : "bg-white text-gray-700 border-purple-200 hover:border-purple-300 hover:bg-purple-50"
                }`}
              >
                No
              </button>
            </div>
          </div>

          {/* Enjoy Being Bounced/Swung Question (for "Yes" path) */}
                    {/* Follow-up question for "Yes" main answer */}
          {mainAnswer === "yes" && enjoyBouncedSwung === null && score === null && (
            <div className="mb-6">
              <div className="bg-purple-100 border border-purple-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">
                  Does {getPronoun("subject")} enjoy being bounced or swung?
                </h3>
                
                {/* Answer Buttons */}
                <div className="flex flex-col gap-4">
                  <button
                    onClick={() => handleEnjoyBouncedSwung("yes")}
                    className="px-6 py-3 rounded-lg font-semibold transition-all border-2 flex items-center justify-start bg-white text-gray-700 border-purple-200 hover:border-purple-300 hover:bg-purple-50"
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => handleEnjoyBouncedSwung("no")}
                    className="px-6 py-3 rounded-lg font-semibold transition-all border-2 flex items-center justify-start bg-white text-gray-700 border-purple-200 hover:border-purple-300 hover:bg-purple-50"
                  >
                    No
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Reaction Questions Section */}
          {((mainAnswer === "yes" && enjoyBouncedSwung === "no") || mainAnswer === "no") && score === null && (
            <div className="mb-6">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-gray-700">
                  When you swing or bounce {getPronoun("object")}, how does {getPronoun("subject")} react?
                </h3>
                <p className="text-sm text-gray-600 mt-2">
                  (If parent does not give an example below, ask each individually.)
                </p>
              </div>
              
              {/* Progress Bar */}
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
              
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={handlePrevQuestion}
                  disabled={!canGoPrev()}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    !canGoPrev()
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  ‹
                </button>
                
                <div className="bg-purple-100 border border-purple-200 rounded-lg p-4 flex-1 mx-4">
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">
                    {currentQuestionIndex + 1}. {getCurrentQuestion()}
                  </h3>
                  
                                     {/* Current Question Content */}
                   <div className="flex flex-col gap-4">
                     <button
                       onClick={() => handleReactionAnswer("yes")}
                       className={`px-6 py-3 rounded-lg font-semibold transition-all border-2 flex items-center justify-start ${
                         getCurrentAnswer() === "yes"
                           ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white border-purple-500 shadow-lg"
                           : "bg-white text-gray-700 border-purple-200 hover:border-purple-300 hover:bg-purple-50"
                       }`}
                     >
                       {getCurrentAnswer() === "yes" && <span className="mr-2">✓</span>}
                       Yes
                     </button>
                     <button
                       onClick={() => handleReactionAnswer("no")}
                       className={`px-6 py-3 rounded-lg font-semibold transition-all border-2 flex items-center justify-start ${
                         getCurrentAnswer() === "no"
                           ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white border-purple-500 shadow-lg"
                           : "bg-white text-gray-700 border-purple-200 hover:border-purple-300 hover:bg-purple-50"
                       }`}
                     >
                       No
                     </button>
                   </div>
                </div>

                <button
                  onClick={handleNextQuestion}
                  disabled={!canGoNext()}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    !canGoNext()
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  ›
                </button>
              </div>
            </div>
          )}

          {/* Result Display */}
          {score !== null && (
            <div className="mb-6 p-4 border rounded-lg">
              <h3 className="text-lg font-semibold mb-2">
                {score === 0 ? (
                  <span className="text-green-800">✅ PASS</span>
                ) : (
                  <span className="text-red-800">❌ FAIL</span>
                )}
              </h3>
              <p className={`text-sm ${
                score === 0 
                  ? "text-green-700" 
                  : "text-red-700"
              }`}>
                {score === 0 
                  ? `${childName} shows appropriate enjoyment of movement activities.` 
                  : `${childName} may need further evaluation for movement activity responses.`
                }
              </p>
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
            <button
              onClick={handleNext}
              disabled={score === null}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                score !== null
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-lg"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              View Results
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Question20; 
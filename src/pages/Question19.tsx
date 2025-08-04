import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { saveQuestionResult } from "../redux/Action";
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

  // State for one-by-one display
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const subQuestions = [
    `If ${childName} hears a strange or scary noise, will ${getPronoun("subject")} look at you before responding?`,
    `Does ${childName} look at you when someone new approaches?`,
    `Does ${childName} look at you when ${getPronoun("subject")} is faced with something unfamiliar or a little scary?`
  ];

  // Restore any existing answer from Redux store
  useEffect(() => {
    if (existingResult?.completed) {
      // Restore main answer
      setMainAnswer(existingResult.mainAnswer);
      
      // Restore sub-answers
      if (existingResult.subAnswers && Array.isArray(existingResult.subAnswers)) {
        setSubAnswers(existingResult.subAnswers);
      }
      
      // Restore the result score
      const finalScore = existingResult.result === "pass" ? 0 : 1;
      setScore(finalScore);
    }
  }, [existingResult]);

  // Calculate score based on flowchart logic
  useEffect(() => {
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
  }, [mainAnswer, subAnswers]);

  // Save result when score is calculated
  useEffect(() => {
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
  }, [score, mainAnswer, subAnswers, dispatch]);

  const handleMainAnswer = (answer: "yes" | "no") => {
    setMainAnswer(answer);
    setScore(null);
    if (answer === "yes") {
      // "Yes" leads to immediate PASS
    } else {
      // "No" leads to sub-questions
      setSubAnswers(new Array(subQuestions.length).fill(undefined));
      setCurrentQuestionIndex(0);
    }
  };

  const handleSubAnswer = (answer: "yes" | "no") => {
    const newSubAnswers = [...subAnswers];
    newSubAnswers[currentQuestionIndex] = answer;
    setSubAnswers(newSubAnswers);
    
    // If "Yes" is answered, result is immediately PASS (no need to continue)
    if (answer === "yes") {
      // Stay on current question, result will be calculated by useEffect
    } else {
      // If "No", auto-advance to next question only if current is answered
      if (currentQuestionIndex < subQuestions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      }
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
    return subAnswers.filter(answer => answer !== undefined).length;
  };

  const getTotalQuestions = () => {
    return subQuestions.length;
  };

  const canGoPrev = () => {
    return currentQuestionIndex > 0;
  };

  const canGoNext = () => {
    // Only allow next if current question is answered
    return getCurrentAnswer() !== undefined && getCurrentAnswer() !== null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-indigo-200">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto bg-white/80 rounded-2xl shadow-2xl p-6 md:p-8">
          
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-600">Question 19 of 20</span>
              <span className="text-sm font-medium text-gray-600">95%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full" 
                style={{ width: `${(getAnsweredCount() / getTotalQuestions()) * 100}%` }}
              ></div>
            </div>
            <div className="text-center text-sm text-gray-600">
              {getAnsweredCount()} of {getTotalQuestions()} questions answered
            </div>
          </div>

          {/* Main Question - Always Visible */}
          <div className="mb-8">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full flex items-center justify-center font-bold text-xl mr-4">
                19
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                If something new happens, does {childName} look at your face to see how you feel about it?
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

          {/* Sub-Questions Section */}
          {mainAnswer === "no" && score === null && (
            <div className="mb-6">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-gray-700">
                  Please answer the following questions about {childName}'s behavior:
                </h3>
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
                  
                  {/* Sub-Question Answer Buttons - Vertical Layout */}
                  <div className="flex flex-col gap-4">
                    <button
                      onClick={() => handleSubAnswer("yes")}
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
                      onClick={() => handleSubAnswer("no")}
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
                  ? `${childName} shows appropriate social referencing behavior.` 
                  : `${childName} may need further evaluation for social referencing.`
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
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Question19; 
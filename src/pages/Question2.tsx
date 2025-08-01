import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { saveQuestionResult } from "../redux/Action";
import { RootState } from "../redux/Store";

const Question2: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Get child info from Redux store
  const childInfo = useSelector((state: RootState) => (state.answers as any).childInfo);
  const childName = childInfo?.childName || "your child";

  // State for Initial Assessment Section (main questions for pass/fail)
  const [ignoreSounds, setIgnoreSounds] = useState<"yes" | "no" | null>(null);
  const [ignorePeople, setIgnorePeople] = useState<"yes" | "no" | null>(null);
  const [initialScore, setInitialScore] = useState<0 | 1 | null>(null);

  // State for Universal Hearing Test Section (separate, doesn't affect pass/fail)
  const [hearingTested, setHearingTested] = useState<"yes" | "no" | null>(null);
  const [hearingResults, setHearingResults] = useState<"normal" | "below-normal" | "inconclusive" | null>(null);

  // State for one-by-one display (only for main assessment)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const initialQuestions = [
    "Often ignore sounds?",
    "Often ignore people?"
  ];

  const hearingResultOptions = [
    "Hearing in normal range",
    "Hearing below normal",
    "Results inconclusive or not definitive"
  ];

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
  }, [initialScore, ignoreSounds, ignorePeople, dispatch]);

  const handleNext = () => {
    navigate("/question/3");
  };

  const handlePrev = () => {
    navigate("/question/1");
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < initialQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleInitialAnswer = (answer: "yes" | "no") => {
    if (currentQuestionIndex === 0) {
      setIgnoreSounds(answer);
    } else if (currentQuestionIndex === 1) {
      setIgnorePeople(answer);
    }
    
    // Auto-advance to next question
    if (currentQuestionIndex < initialQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleHearingTestAnswer = (answer: "yes" | "no") => {
    setHearingTested(answer);
  };

  const handleHearingResultAnswer = (result: "normal" | "below-normal" | "inconclusive") => {
    setHearingResults(result);
  };

  const getCurrentQuestion = () => {
    return initialQuestions[currentQuestionIndex];
  };

  const getCurrentAnswer = () => {
    if (currentQuestionIndex === 0) return ignoreSounds;
    if (currentQuestionIndex === 1) return ignorePeople;
    return null;
  };

  // Progress tracking only for main questions (initial assessment)
  const getMainQuestionsAnsweredCount = () => {
    let count = 0;
    if (ignoreSounds !== null) count++;
    if (ignorePeople !== null) count++;
    return count;
  };

  const getMainQuestionsTotal = () => {
    return initialQuestions.length; // 2 questions
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

  const canGoPrev = () => {
    return currentQuestionIndex > 0;
  };

  const canGoNext = () => {
    return currentQuestionIndex < initialQuestions.length - 1;
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

          {/* Main Assessment Section - One by One */}
          <div className="mb-8">
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold text-gray-700">
                Initial Assessment
              </h3>
            </div>

            {/* Progress Bar for Main Questions Only */}
            <div className="mb-4">
              <div className="w-full bg-gray-200 rounded-full h-1 mb-2">
                <div 
                  className="bg-gray-400 h-1 rounded-full" 
                  style={{ width: `${(getMainQuestionsAnsweredCount() / getMainQuestionsTotal()) * 100}%` }}
                ></div>
              </div>
              <div className="text-center text-sm text-gray-600">
                {getMainQuestionsAnsweredCount()} of {getMainQuestionsTotal()} main questions answered
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
                
                {/* Question Answer Buttons - Vertical Layout */}
                <div className="flex flex-col gap-4">
                  <button
                    onClick={() => handleInitialAnswer("yes")}
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
                    onClick={() => handleInitialAnswer("no")}
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

          {/* Final Result Display - Only based on main assessment */}
          {isMainAssessmentComplete() && (
            <div className="mb-8 p-4 border rounded-lg">
              <h3 className="text-lg font-semibold mb-2">
                {initialScore === 0 ? (
                  <span className="text-green-800">✅ PASS</span>
                ) : (
                  <span className="text-red-800">❌ FAIL</span>
                )}
              </h3>
              <p className={`text-sm ${
                initialScore === 0 
                  ? "text-green-700" 
                  : "text-red-700"
              }`}>
                {initialScore === 0 
                  ? "No concerns about ignoring sounds or people." 
                  : "Some concerns about ignoring sounds or people."
                }
              </p>
            </div>
          )}

          {/* Universal Hearing Test Section - Separate Card Below */}
          <div className="mb-8">
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold text-gray-700">
                Universal Hearing Test
              </h3>
              <p className="text-sm text-gray-600 italic">
                (This is a universal test for all children and does not affect the assessment result)
              </p>
            </div>
            
            <div className="bg-blue-100 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">
                Has {childName}'s hearing been tested?
              </h3>
              
              {/* Question Answer Buttons - Vertical Layout */}
              <div className="flex flex-col gap-4 mb-6">
                <button
                  onClick={() => handleHearingTestAnswer("yes")}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all border-2 flex items-center justify-start ${
                    hearingTested === "yes"
                      ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-blue-500 shadow-lg"
                      : "bg-white text-gray-700 border-blue-200 hover:border-blue-300 hover:bg-blue-50"
                  }`}
                >
                  {hearingTested === "yes" && <span className="mr-2">✓</span>}
                  Yes
                </button>
                <button
                  onClick={() => handleHearingTestAnswer("no")}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all border-2 flex items-center justify-start ${
                    hearingTested === "no"
                      ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-blue-500 shadow-lg"
                      : "bg-white text-gray-700 border-blue-200 hover:border-blue-300 hover:bg-blue-50"
                  }`}
                >
                  No
                </button>
              </div>

              {/* Hearing Test Results (only if Yes) */}
              {hearingTested === "yes" && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">
                    What were the results of the hearing test? (choose one):
                  </h3>
                  
                  {/* Result Options - Vertical Layout */}
                  <div className="flex flex-col gap-4">
                    {hearingResultOptions.map((option, index) => {
                      const resultValue = index === 0 ? "normal" : index === 1 ? "below-normal" : "inconclusive";
                      return (
                        <button
                          key={index}
                          onClick={() => handleHearingResultAnswer(resultValue as "normal" | "below-normal" | "inconclusive")}
                          className={`px-6 py-3 rounded-lg font-semibold transition-all border-2 flex items-center justify-start ${
                            hearingResults === resultValue
                              ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-blue-500 shadow-lg"
                              : "bg-white text-gray-700 border-blue-200 hover:border-blue-300 hover:bg-blue-50"
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
    </div>
  );
};

export default Question2; 
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { saveQuestionResult } from "../redux/Action";
import { RootState } from "../redux/Store";

const Question9: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Get child info from Redux store
  const childInfo = useSelector((state: RootState) => (state.answers as any).childInfo);
  const childName = childInfo?.childName || "your child";

  // State for main answer and sub-questions
  const [mainAnswer, setMainAnswer] = useState<"yes" | "no" | null>(null);
  const [subAnswers, setSubAnswers] = useState<("yes" | "no")[]>([]);
  const [score, setScore] = useState<0 | 1 | null>(null);

  // State for one-by-one display
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // State for follow-up question
  const [followUpAnswer, setFollowUpAnswer] = useState<"yes" | "no" | null>(null);

  // State for current section
  const [currentSection, setCurrentSection] = useState<"main" | "sub" | "followup">("main");

  const subQuestions = [
    "A picture or toy just to show you?",
    "A drawing he/she has done?",
    "A flower he/she has picked?",
    "A bug he/she has found in the grass?",
    "A few blocks he/she has put together?"
  ];

  // Calculate score based on flowchart logic
  useEffect(() => {
    // Check if we have all necessary answers
    const subComplete = subAnswers.length === subQuestions.length && 
                       subAnswers.every(answer => answer !== undefined && answer !== null);
    
    if (subComplete) {
      const yesCount = subAnswers.filter(answer => answer === "yes").length;
      
      if (yesCount === 0) {
        // "No to all of the above" - immediate FAIL
        setScore(1); // FAIL
      } else if (yesCount > 0 && followUpAnswer !== null) {
        // "Yes to any of the above" - check follow-up answer
        if (followUpAnswer === "yes") {
          setScore(0); // PASS
        } else {
          setScore(1); // FAIL
        }
      }
    }
  }, [mainAnswer, subAnswers, followUpAnswer]);

  // Save result when score is calculated
  useEffect(() => {
    if (score !== null) {
      const result = score === 0 ? "pass" : "fail";
      const allSubAnswers = [...subAnswers];
      if (followUpAnswer !== null) {
        allSubAnswers.push(followUpAnswer);
      }
      
      dispatch(
        saveQuestionResult(
          9,
          result,
          mainAnswer || "no",
          allSubAnswers
        )
      );
    }
  }, [score, mainAnswer, subAnswers, followUpAnswer, dispatch]);

  const handleMainAnswer = (answer: "yes" | "no") => {
    setMainAnswer(answer);
    setScore(null);
    // Initialize subAnswers array with undefined values for all questions
    setSubAnswers(new Array(subQuestions.length).fill(undefined));
    setFollowUpAnswer(null);
    setCurrentQuestionIndex(0);
    setCurrentSection("sub");
  };

  const handleSubAnswer = (answer: "yes" | "no") => {
    const newSubAnswers = [...subAnswers];
    newSubAnswers[currentQuestionIndex] = answer;
    setSubAnswers(newSubAnswers);
    
    // Auto-advance to next question or check if we need follow-up
    if (currentQuestionIndex < subQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Check if all questions have been answered before proceeding
      const allAnswered = newSubAnswers.every(answer => answer !== undefined && answer !== null);
      
      if (allAnswered) {
        // Check if any sub-questions were answered "Yes"
        const yesCount = newSubAnswers.filter(answer => answer === "yes").length;
        
        if (yesCount > 0) {
          // If any sub-question is "Yes", proceed to follow-up question
          setCurrentSection("followup");
        } else {
          // If all sub-questions are "No", we can calculate score immediately
          // The useEffect will handle the scoring
        }
      }
    }
  };

  const handleFollowUpAnswer = (answer: "yes" | "no") => {
    setFollowUpAnswer(answer);
  };

  const handleNextQuestion = () => {
    if (currentSection === "sub" && currentQuestionIndex < subQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentSection === "sub" && currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    } else if (currentSection === "followup") {
      setCurrentSection("sub");
      setCurrentQuestionIndex(subQuestions.length - 1);
    }
  };

  const handleNext = () => {
    navigate("/question/10");
  };

  const handlePrev = () => {
    navigate("/question/8");
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
        <div className="max-w-4xl mx-auto bg-white/80 rounded-2xl shadow-2xl p-6 md:p-8">
          
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-600">Question 9 of 20</span>
              <span className="text-sm font-medium text-gray-600">45%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full" style={{ width: '45%' }}></div>
            </div>
          </div>

          {/* Main Question */}
          <div className="mb-8">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full flex items-center justify-center font-bold text-xl mr-4">
                9
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                Does {childName} show you things by bringing them to you or holding them up for you to see? Not just to get help, but to share?
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

          {/* Instructions for Yes path */}
          {mainAnswer === "yes" && currentSection !== "main" && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800">
                Please give me an example of something he/she might bring to show you or hold up for you to see. (If parent does not give one of the following 0 examples, ask each individually.)
              </p>
            </div>
          )}

          {/* Sub-Questions Section */}
          {currentSection === "sub" && (
            <div className="mb-6">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-gray-700">
                  Does {childName} sometimes bring you...
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

          {/* Follow-up Question */}
          {currentSection === "followup" && (
            <div className="mb-6">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-gray-700">
                  Is this sometimes just to show you, not to get help?
                </h3>
              </div>
              
              <div className="flex flex-col gap-4">
                <button
                  onClick={() => handleFollowUpAnswer("yes")}
                  className={`px-8 py-4 rounded-lg font-semibold transition-all border-2 flex items-center justify-start ${
                    followUpAnswer === "yes"
                      ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white border-purple-500 shadow-lg"
                      : "bg-white text-gray-700 border-purple-200 hover:border-purple-300 hover:bg-purple-50"
                  }`}
                >
                  {followUpAnswer === "yes" && <span className="mr-2">✓</span>}
                  Yes
                </button>
                <button
                  onClick={() => handleFollowUpAnswer("no")}
                  className={`px-8 py-4 rounded-lg font-semibold transition-all border-2 flex items-center justify-start ${
                    followUpAnswer === "no"
                      ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white border-purple-500 shadow-lg"
                      : "bg-white text-gray-700 border-purple-200 hover:border-purple-300 hover:bg-purple-50"
                  }`}
                >
                  No
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
                  ? "Your child shows appropriate sharing behaviors." 
                  : "Your child may need further evaluation for sharing behaviors."
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

export default Question9; 
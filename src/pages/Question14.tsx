import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { saveQuestionResult } from "../redux/Action";
import { RootState } from "../redux/Store";

const Question14: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Get child info from Redux store
  const childInfo = useSelector((state: RootState) => (state.answers as any).childInfo);
  const childName = childInfo?.childName || "your child";
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
  const [scenarioAnswers, setScenarioAnswers] = useState<("yes" | "no")[]>([]);
  const [followUp1Answer, setFollowUp1Answer] = useState<"yes" | "no" | null>(null);
  const [followUp2Answer, setFollowUp2Answer] = useState<"yes" | "no" | null>(null);
  const [score, setScore] = useState<0 | 1 | null>(null);

  // State for one-by-one display
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentSection, setCurrentSection] = useState<"main" | "scenarios" | "followUp1" | "followUp2">("main");

  const scenarios = [
    `When ${getPronoun("subject")} needs something?`,
    `When you are playing with ${getPronoun("object")}?`,
    "During feeding?",
    "During diaper changes?",
    `When you are reading ${getPronoun("object")} a story?`,
    `When you are talking to ${getPronoun("object")}?`
  ];

  // Calculate score based on flowchart logic
  useEffect(() => {
    if (mainAnswer !== null) {
      // Check if we have all necessary answers for scenarios
      const scenariosComplete = scenarioAnswers.length === scenarios.length && 
                               scenarioAnswers.every(answer => answer !== undefined && answer !== null);
      
      if (scenariosComplete) {
        const yesCount = scenarioAnswers.filter(answer => answer === "yes").length;
        
        if (yesCount >= 2) {
          // "Yes to two or more" → PASS
          setScore(0);
        } else if (yesCount === 1) {
          // "Yes only to one" → Need follow-up questions
          if (followUp1Answer === "no") {
            // "No" to "Does your child look you in the eye every day?" → FAIL
            setScore(1);
          } else if (followUp1Answer === "yes") {
            // "Yes" to first follow-up, check second follow-up
            if (followUp2Answer === "yes") {
              // "Yes" to "On a day when you are together all day, does he/she look you in the eye at least 5 times?" → PASS
              setScore(0);
            } else if (followUp2Answer === "no") {
              // "No" to second follow-up → FAIL
              setScore(1);
            } else {
              // Second follow-up not answered yet
              setScore(null);
            }
          } else {
            // First follow-up not answered yet
            setScore(null);
          }
        } else {
          // "No to all" → FAIL
          setScore(1);
        }
      } else {
        // Reset score if not all scenarios are answered
        setScore(null);
      }
    }
  }, [mainAnswer, scenarioAnswers, followUp1Answer, followUp2Answer]);

  // Save result when score is calculated
  useEffect(() => {
    if (score !== null) {
      const result = score === 0 ? "pass" : "fail";
      const allSubAnswers: ("yes" | "no")[] = [...scenarioAnswers];
      if (followUp1Answer !== null) {
        allSubAnswers.push(followUp1Answer);
      }
      if (followUp2Answer !== null) {
        allSubAnswers.push(followUp2Answer);
      }
      
      dispatch(
        saveQuestionResult(
          14,
          result,
          mainAnswer || "no",
          allSubAnswers
        )
      );
    }
  }, [score, mainAnswer, scenarioAnswers, followUp1Answer, followUp2Answer, dispatch]);

  const handleMainAnswer = (answer: "yes" | "no") => {
    setMainAnswer(answer);
    setScore(null);
    // Initialize arrays with undefined values for all questions
    setScenarioAnswers(new Array(scenarios.length).fill(undefined));
    setFollowUp1Answer(null);
    setFollowUp2Answer(null);
    setCurrentQuestionIndex(0);
    setCurrentSection("scenarios");
  };

  const handleScenarioAnswer = (answer: "yes" | "no") => {
    const newScenarioAnswers = [...scenarioAnswers];
    newScenarioAnswers[currentQuestionIndex] = answer;
    setScenarioAnswers(newScenarioAnswers);
    
    // Auto-advance to next question or check if we need follow-up questions
    if (currentQuestionIndex < scenarios.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Check if ALL scenarios are answered before proceeding
      const allScenariosAnswered = newScenarioAnswers.every(answer => answer !== undefined && answer !== null);
      if (allScenariosAnswered) {
        const yesCount = newScenarioAnswers.filter(answer => answer === "yes").length;
        
        if (yesCount === 1) {
          // "Yes only to one" → Need follow-up questions
          setCurrentSection("followUp1");
        }
        // If yesCount >= 2 or yesCount === 0, the useEffect will handle the scoring
      }
      // If not all answered, stay on the last question
    }
  };

  const handleFollowUp1Answer = (answer: "yes" | "no") => {
    setFollowUp1Answer(answer);
    if (answer === "yes") {
      setCurrentSection("followUp2");
    }
    // If answer is "no", the useEffect will handle the scoring
  };

  const handleFollowUp2Answer = (answer: "yes" | "no") => {
    setFollowUp2Answer(answer);
  };

  const handleNextQuestion = () => {
    if (currentSection === "scenarios" && currentQuestionIndex < scenarios.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentSection === "scenarios" && currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    } else if (currentSection === "followUp1") {
      setCurrentSection("scenarios");
      setCurrentQuestionIndex(scenarios.length - 1);
    } else if (currentSection === "followUp2") {
      setCurrentSection("followUp1");
    }
  };

  const handleNext = () => {
    navigate("/question/15");
  };

  const handlePrev = () => {
    navigate("/question/13");
  };

  const getCurrentQuestion = () => {
    if (currentSection === "scenarios") {
      return scenarios[currentQuestionIndex];
    }
    return "";
  };

  const getCurrentAnswer = () => {
    if (currentSection === "scenarios") {
      return scenarioAnswers[currentQuestionIndex];
    }
    return undefined;
  };

  const getAnsweredCount = () => {
    if (currentSection === "scenarios") {
      return scenarioAnswers.filter(answer => answer !== undefined).length;
    }
    return 0;
  };

  const getTotalQuestions = () => {
    if (currentSection === "scenarios") {
      return scenarios.length;
    }
    return 0;
  };

  const canGoPrev = () => {
    if (currentSection === "scenarios") {
      return currentQuestionIndex > 0;
    }
    return false;
  };

  const canGoNext = () => {
    if (currentSection === "scenarios") {
      if (currentQuestionIndex < scenarios.length - 1) {
        return true;
      } else if (currentQuestionIndex === scenarios.length - 1) {
        // Only allow next if ALL scenarios are answered
        return scenarioAnswers.every(answer => answer !== undefined && answer !== null);
      }
      return false;
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
              <span className="text-sm font-medium text-gray-600">Question 14 of 20</span>
              <span className="text-sm font-medium text-gray-600">70%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full" style={{ width: '70%' }}></div>
            </div>
          </div>

          {/* Main Question */}
          <div className="mb-8">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full flex items-center justify-center font-bold text-xl mr-4">
                14
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                Does {childName} look you in the eye when you are talking to {getPronoun("object")}, playing with {getPronoun("object")}, or changing {getPronoun("object")}?
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
          {mainAnswer === "yes" && currentSection === "scenarios" && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800">
                Please give me an example of when {getPronoun("subject")} looks you in the eye. (If parent does not give one of the following 0 examples, ask each individually.)
              </p>
            </div>
          )}

          {/* Scenarios Section */}
          {currentSection === "scenarios" && (
            <div className="mb-6">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-gray-700">
                  Does {getPronoun("subject")} look you in the eye...
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
                      onClick={() => handleScenarioAnswer("yes")}
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
                      onClick={() => handleScenarioAnswer("no")}
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

          {/* Follow-up Question 1 */}
          {currentSection === "followUp1" && (
            <div className="mb-8">
              <div className="bg-purple-100 border border-purple-200 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Does your child look you in the eye every day?
                </h2>
                
                {/* Follow-up Answer Buttons - Vertical Layout */}
                <div className="flex flex-col gap-4">
                  <button
                    onClick={() => handleFollowUp1Answer("yes")}
                    className={`px-8 py-4 rounded-lg font-semibold transition-all border-2 flex items-center justify-start ${
                      followUp1Answer === "yes"
                        ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white border-purple-500 shadow-lg"
                        : "bg-white text-gray-700 border-purple-200 hover:border-purple-300 hover:bg-purple-50"
                    }`}
                  >
                    {followUp1Answer === "yes" && <span className="mr-2">✓</span>}
                    Yes
                  </button>
                  <button
                    onClick={() => handleFollowUp1Answer("no")}
                    className={`px-8 py-4 rounded-lg font-semibold transition-all border-2 flex items-center justify-start ${
                      followUp1Answer === "no"
                        ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white border-purple-500 shadow-lg"
                        : "bg-white text-gray-700 border-purple-200 hover:border-purple-300 hover:bg-purple-50"
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Follow-up Question 2 */}
          {currentSection === "followUp2" && (
            <div className="mb-8">
              <div className="bg-purple-100 border border-purple-200 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  On a day when you are together all day, does {getPronoun("subject")} look you in the eye at least 5 times?
                </h2>
                
                {/* Follow-up Answer Buttons - Vertical Layout */}
                <div className="flex flex-col gap-4">
                  <button
                    onClick={() => handleFollowUp2Answer("yes")}
                    className={`px-8 py-4 rounded-lg font-semibold transition-all border-2 flex items-center justify-start ${
                      followUp2Answer === "yes"
                        ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white border-purple-500 shadow-lg"
                        : "bg-white text-gray-700 border-purple-200 hover:border-purple-300 hover:bg-purple-50"
                    }`}
                  >
                    {followUp2Answer === "yes" && <span className="mr-2">✓</span>}
                    Yes
                  </button>
                  <button
                    onClick={() => handleFollowUp2Answer("no")}
                    className={`px-8 py-4 rounded-lg font-semibold transition-all border-2 flex items-center justify-start ${
                      followUp2Answer === "no"
                        ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white border-purple-500 shadow-lg"
                        : "bg-white text-gray-700 border-purple-200 hover:border-purple-300 hover:bg-purple-50"
                    }`}
                  >
                    No
                  </button>
                </div>
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
                  ? `${childName} shows appropriate eye contact behaviors.` 
                  : `${childName} may need further evaluation for eye contact development.`
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

export default Question14; 
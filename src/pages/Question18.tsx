import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { saveQuestionResult } from "../redux/Action";
import { RootState } from "../redux/Store";

const Question18: React.FC = () => {
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

  // State for main answer and different sections
  const [mainAnswer, setMainAnswer] = useState<"yes" | "no" | null>(null);
  const [exampleIndicatesUnderstanding, setExampleIndicatesUnderstanding] = useState<"yes" | "no" | null>(null);
  const [situationalClueAnswer, setSituationalClueAnswer] = useState<"yes" | "no" | null>(null);
  const [dinnertimeAnswer, setDinnertimeAnswer] = useState<"yes" | "no" | null>(null);
  const [commandAnswers, setCommandAnswers] = useState<("yes" | "no")[]>([]);
  const [score, setScore] = useState<0 | 1 | null>(null);

  // State for one-by-one display
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentSection, setCurrentSection] = useState<"main" | "example" | "situational" | "dinnertime" | "commands">("main");

  const commandQuestions = [
    `If you say, "Show me your shoe" without pointing, making gestures, or giving hints (when you are not going out or getting dressed), does ${childName} show you ${getPronoun("possessive")} shoe?`,
    `If you say, "Bring me the blanket" or ask for another object without pointing, making gestures, or giving hints, does ${childName} bring it to you?`,
    `If you say, "Put the book on the chair" without pointing, making gestures, or giving any other hints, does ${childName} put the book on the chair?`
  ];

  // Calculate score based on flowchart logic
  useEffect(() => {
    if (mainAnswer === "yes" && exampleIndicatesUnderstanding === "yes") {
      // "Yes" to main question AND example indicates understanding without nonverbal cues → PASS (score 0)
      setScore(0);
    } else if (mainAnswer === "yes" && exampleIndicatesUnderstanding === "no") {
      // "Yes" to main question BUT example does NOT indicate understanding → Continue to situational questions
      if (situationalClueAnswer !== null) {
        if (situationalClueAnswer === "yes") {
          // Situational clue "Yes" → Check dinnertime
          if (dinnertimeAnswer !== null) {
            if (dinnertimeAnswer === "yes") {
              // Dinnertime "Yes" → Check commands
              if (commandAnswers.length === commandQuestions.length && 
                  commandAnswers.every(answer => answer !== undefined && answer !== null)) {
                const yesCount = commandAnswers.filter(answer => answer === "yes").length;
                if (yesCount > 0) {
                  // "Yes to any" commands → PASS (score 0)
                  setScore(0);
                } else {
                  // "No to all" commands → FAIL (score 1)
                  setScore(1);
                }
              } else {
                setScore(null);
              }
            } else if (dinnertimeAnswer === "no") {
              // Dinnertime "No" → FAIL (score 1)
              setScore(1);
            } else {
              setScore(null);
            }
          } else {
            setScore(null);
          }
        } else if (situationalClueAnswer === "no") {
          // Situational clue "No" → Check dinnertime
          if (dinnertimeAnswer !== null) {
            if (dinnertimeAnswer === "yes") {
              // Dinnertime "Yes" → Check commands
              if (commandAnswers.length === commandQuestions.length && 
                  commandAnswers.every(answer => answer !== undefined && answer !== null)) {
                const yesCount = commandAnswers.filter(answer => answer === "yes").length;
                if (yesCount > 0) {
                  // "Yes to any" commands → PASS (score 0)
                  setScore(0);
                } else {
                  // "No to all" commands → FAIL (score 1)
                  setScore(1);
                }
              } else {
                setScore(null);
              }
            } else if (dinnertimeAnswer === "no") {
              // Dinnertime "No" → FAIL (score 1)
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
      } else {
        setScore(null);
      }
    } else if (mainAnswer === "no") {
      // "No" to main question → Continue to situational questions
      if (situationalClueAnswer !== null) {
        if (situationalClueAnswer === "yes") {
          // Situational clue "Yes" → Check dinnertime
          if (dinnertimeAnswer !== null) {
            if (dinnertimeAnswer === "yes") {
              // Dinnertime "Yes" → Check commands
              if (commandAnswers.length === commandQuestions.length && 
                  commandAnswers.every(answer => answer !== undefined && answer !== null)) {
                const yesCount = commandAnswers.filter(answer => answer === "yes").length;
                if (yesCount > 0) {
                  // "Yes to any" commands → PASS (score 0)
                  setScore(0);
                } else {
                  // "No to all" commands → FAIL (score 1)
                  setScore(1);
                }
              } else {
                setScore(null);
              }
            } else if (dinnertimeAnswer === "no") {
              // Dinnertime "No" → FAIL (score 1)
              setScore(1);
            } else {
              setScore(null);
            }
          } else {
            setScore(null);
          }
        } else if (situationalClueAnswer === "no") {
          // Situational clue "No" → Check dinnertime
          if (dinnertimeAnswer !== null) {
            if (dinnertimeAnswer === "yes") {
              // Dinnertime "Yes" → Check commands
              if (commandAnswers.length === commandQuestions.length && 
                  commandAnswers.every(answer => answer !== undefined && answer !== null)) {
                const yesCount = commandAnswers.filter(answer => answer === "yes").length;
                if (yesCount > 0) {
                  // "Yes to any" commands → PASS (score 0)
                  setScore(0);
                } else {
                  // "No to all" commands → FAIL (score 1)
                  setScore(1);
                }
              } else {
                setScore(null);
              }
            } else if (dinnertimeAnswer === "no") {
              // Dinnertime "No" → FAIL (score 1)
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
      } else {
        setScore(null);
      }
    } else {
      setScore(null);
    }
  }, [mainAnswer, exampleIndicatesUnderstanding, situationalClueAnswer, dinnertimeAnswer, commandAnswers]);

  // Save result when score is calculated
  useEffect(() => {
    if (score !== null) {
      const result = score === 0 ? "pass" : "fail";
      const allSubAnswers: ("yes" | "no")[] = [
        ...(exampleIndicatesUnderstanding ? [exampleIndicatesUnderstanding] : []),
        ...(situationalClueAnswer ? [situationalClueAnswer] : []),
        ...(dinnertimeAnswer ? [dinnertimeAnswer] : []),
        ...commandAnswers
      ];
      
      dispatch(
        saveQuestionResult(
          18,
          result,
          mainAnswer || "no",
          allSubAnswers
        )
      );
    }
  }, [score, mainAnswer, exampleIndicatesUnderstanding, situationalClueAnswer, dinnertimeAnswer, commandAnswers, dispatch]);

  const handleMainAnswer = (answer: "yes" | "no") => {
    setMainAnswer(answer);
    setScore(null);
    
    // Reset all sub-question responses when main answer changes
    setExampleIndicatesUnderstanding(null);
    setSituationalClueAnswer(null);
    setDinnertimeAnswer(null);
    setCommandAnswers([]);
    setCurrentQuestionIndex(0);
    
    if (answer === "yes") {
      // "Yes" leads to example evaluation
      setCurrentSection("example");
    } else {
      // "No" leads to situational questions
      setCurrentSection("situational");
    }
  };

  const handleExampleAnswer = (answer: "yes" | "no") => {
    setExampleIndicatesUnderstanding(answer);
    if (answer === "yes") {
      // Example indicates understanding → PASS (handled by useEffect)
    } else {
      // Example does not indicate understanding → Continue to situational questions
      setCurrentSection("situational");
    }
  };

  const handleSituationalAnswer = (answer: "yes" | "no") => {
    setSituationalClueAnswer(answer);
    if (answer === "yes") {
      // Situational clue "Yes" → Go directly to command questions
      setCommandAnswers(new Array(commandQuestions.length).fill(undefined));
      setCurrentQuestionIndex(0);
      setCurrentSection("commands");
    } else {
      // Situational clue "No" → Go to dinnertime question
      setCurrentSection("dinnertime");
    }
  };

  const handleDinnertimeAnswer = (answer: "yes" | "no") => {
    setDinnertimeAnswer(answer);
    if (answer === "no") {
      // Dinnertime "No" → FAIL (handled by useEffect)
    } else {
      // Dinnertime "Yes" → Continue to command questions
      setCommandAnswers(new Array(commandQuestions.length).fill(undefined));
      setCurrentQuestionIndex(0);
      setCurrentSection("commands");
    }
  };

  const handleCommandAnswer = (answer: "yes" | "no") => {
    const newCommandAnswers = [...commandAnswers];
    newCommandAnswers[currentQuestionIndex] = answer;
    setCommandAnswers(newCommandAnswers);
    
    // Auto-advance to next question
    if (currentQuestionIndex < commandQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
    // If not all answered, stay on the current question
  };

  const handleNextQuestion = () => {
    if (currentSection === "commands" && currentQuestionIndex < commandQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentSection === "commands" && currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleNext = () => {
    navigate("/question/19");
  };

  const handlePrev = () => {
    navigate("/question/17");
  };

  const getCurrentQuestion = () => {
    if (currentSection === "commands") {
      return commandQuestions[currentQuestionIndex];
    }
    return "";
  };

  const getCurrentAnswer = () => {
    if (currentSection === "commands") {
      return commandAnswers[currentQuestionIndex];
    }
    return undefined;
  };

  const getAnsweredCount = () => {
    if (currentSection === "commands") {
      return commandAnswers.filter(answer => answer !== undefined).length;
    }
    return 0;
  };

  const getTotalQuestions = () => {
    if (currentSection === "commands") {
      return commandQuestions.length;
    }
    return 0;
  };

  const canGoPrev = () => {
    if (currentSection === "commands") {
      return currentQuestionIndex > 0;
    }
    return false;
  };

  const canGoNext = () => {
    if (currentSection === "commands") {
      if (currentQuestionIndex < commandQuestions.length - 1) {
        return true;
      } else if (currentQuestionIndex === commandQuestions.length - 1) {
        // Only allow next if ALL command questions are answered
        return commandAnswers.every(answer => answer !== undefined && answer !== null);
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
              <span className="text-sm font-medium text-gray-600">Question 18 of 20</span>
              <span className="text-sm font-medium text-gray-600">90%</span>
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
                18
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                Does {childName} understand when you tell {getPronoun("object")} to do something?
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

          {/* Example Evaluation Section (for "Yes" path) */}
          {currentSection === "example" && mainAnswer === "yes" && (
            <div className="mb-8">
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-800">
                  Please give me an example of how you know {getPronoun("subject")} understands you.
                </p>
              </div>
              
              <div className="bg-purple-100 border border-purple-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">
                  Does this example indicate that {childName} can understand a simple command without nonverbal cues?
                </h3>
                
                <div className="flex flex-col gap-4">
                  <button
                    onClick={() => handleExampleAnswer("yes")}
                    className={`px-6 py-3 rounded-lg font-semibold transition-all border-2 flex items-center justify-start ${
                      exampleIndicatesUnderstanding === "yes"
                        ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white border-purple-500 shadow-lg"
                        : "bg-white text-gray-700 border-purple-200 hover:border-purple-300 hover:bg-purple-50"
                    }`}
                  >
                    {exampleIndicatesUnderstanding === "yes" && <span className="mr-2">✓</span>}
                    Yes
                  </button>
                  <button
                    onClick={() => handleExampleAnswer("no")}
                    className={`px-6 py-3 rounded-lg font-semibold transition-all border-2 flex items-center justify-start ${
                      exampleIndicatesUnderstanding === "no"
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

          {/* Situational Clue Question */}
          {currentSection === "situational" && (
            <div className="mb-8">
              <div className="bg-purple-100 border border-purple-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">
                  When the situation gives {getPronoun("object")} a clue, can {getPronoun("subject")} follow a command? For example when you are dressed to go out and you tell {getPronoun("object")} to get {getPronoun("possessive")} shoes, does {getPronoun("subject")} understand?
                </h3>
                
                <div className="flex flex-col gap-4">
                  <button
                    onClick={() => handleSituationalAnswer("yes")}
                    className={`px-6 py-3 rounded-lg font-semibold transition-all border-2 flex items-center justify-start ${
                      situationalClueAnswer === "yes"
                        ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white border-purple-500 shadow-lg"
                        : "bg-white text-gray-700 border-purple-200 hover:border-purple-300 hover:bg-purple-50"
                    }`}
                  >
                    {situationalClueAnswer === "yes" && <span className="mr-2">✓</span>}
                    Yes
                  </button>
                  <button
                    onClick={() => handleSituationalAnswer("no")}
                    className={`px-6 py-3 rounded-lg font-semibold transition-all border-2 flex items-center justify-start ${
                      situationalClueAnswer === "no"
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

          {/* Dinnertime Question */}
          {currentSection === "dinnertime" && (
            <div className="mb-8">
              <div className="bg-purple-100 border border-purple-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">
                  If it is dinnertime and food is on the table, and you tell the child to sit down, will {getPronoun("subject")} come sit at the table?
                </h3>
                
                <div className="flex flex-col gap-4">
                  <button
                    onClick={() => handleDinnertimeAnswer("yes")}
                    className={`px-6 py-3 rounded-lg font-semibold transition-all border-2 flex items-center justify-start ${
                      dinnertimeAnswer === "yes"
                        ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white border-purple-500 shadow-lg"
                        : "bg-white text-gray-700 border-purple-200 hover:border-purple-300 hover:bg-purple-50"
                    }`}
                  >
                    {dinnertimeAnswer === "yes" && <span className="mr-2">✓</span>}
                    Yes
                  </button>
                  <button
                    onClick={() => handleDinnertimeAnswer("no")}
                    className={`px-6 py-3 rounded-lg font-semibold transition-all border-2 flex items-center justify-start ${
                      dinnertimeAnswer === "no"
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

          {/* Command Questions Section */}
          {currentSection === "commands" && (
            <div className="mb-6">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-gray-700">
                  When the situation does not give any clues, can {getPronoun("subject")} follow a command? For example... (ask until you get a yes or use all examples)
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
                      onClick={() => handleCommandAnswer("yes")}
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
                      onClick={() => handleCommandAnswer("no")}
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
                  ? `${childName} shows appropriate command understanding.` 
                  : `${childName} may need further evaluation for command understanding.`
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

export default Question18; 
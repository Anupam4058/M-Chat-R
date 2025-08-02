import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { saveQuestionResult } from "../redux/Action";
import { RootState } from "../redux/Store";

const Question15: React.FC = () => {
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
  const [copyingAnswers, setCopyingAnswers] = useState<("yes" | "no")[]>([]);
  const [otherDescription, setOtherDescription] = useState<string>("");
  const [score, setScore] = useState<0 | 1 | null>(null);

  // State for one-by-one display
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentSection, setCurrentSection] = useState<"main" | "copying">("main");

  const copyingScenarios = [
    "Stick out your tongue?",
    "Make a funny sound?",
    "Wave good bye?",
    "Clap your hands?",
    "Put your fingers to your lips to signal 'Shhh'?",
    "Blow a kiss?",
    "Other (describe):"
  ];

  // Calculate score based on flowchart logic
  useEffect(() => {
    if (mainAnswer !== null) {
      // Check if we have all necessary answers for copying scenarios (excluding "Other")
      const copyingComplete = copyingAnswers.length === copyingScenarios.length && 
                             copyingAnswers.every((answer, index) => {
                               if (index === 6) { // "Other" question
                                 return answer !== undefined && answer !== null;
                               }
                               return answer !== undefined && answer !== null;
                             });
      
      if (copyingComplete) {
        // Count "Yes" answers excluding the "Other" question (index 6)
        const yesCount = copyingAnswers.slice(0, 6).filter(answer => answer === "yes").length;
        
        if (yesCount >= 2) {
          // "Yes to two or more" → PASS
          setScore(0);
        } else {
          // "Yes to one or none" → FAIL
          setScore(1);
        }
      } else {
        // Reset score if not all copying questions are answered
        setScore(null);
      }
    }
  }, [mainAnswer, copyingAnswers]);

  // Save result when score is calculated
  useEffect(() => {
    if (score !== null) {
      const result = score === 0 ? "pass" : "fail";
      const allSubAnswers: ("yes" | "no")[] = [...copyingAnswers];
      
      dispatch(
        saveQuestionResult(
          15,
          result,
          mainAnswer || "no",
          allSubAnswers
        )
      );
    }
  }, [score, mainAnswer, copyingAnswers, dispatch]);

  const handleMainAnswer = (answer: "yes" | "no") => {
    setMainAnswer(answer);
    setScore(null);
    // Initialize arrays with undefined values for all questions
    setCopyingAnswers(new Array(copyingScenarios.length).fill(undefined));
    setOtherDescription("");
    setCurrentQuestionIndex(0);
    setCurrentSection("copying");
  };

  const handleCopyingAnswer = (answer: "yes" | "no") => {
    const newCopyingAnswers = [...copyingAnswers];
    newCopyingAnswers[currentQuestionIndex] = answer;
    setCopyingAnswers(newCopyingAnswers);
    
    // Auto-advance to next question
    if (currentQuestionIndex < copyingScenarios.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
    // If not all answered, stay on the current question
  };

  const handleNextQuestion = () => {
    if (currentSection === "copying" && currentQuestionIndex < copyingScenarios.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentSection === "copying" && currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleNext = () => {
    navigate("/question/16");
  };

  const handlePrev = () => {
    navigate("/question/14");
  };

  const getCurrentQuestion = () => {
    if (currentSection === "copying") {
      return copyingScenarios[currentQuestionIndex];
    }
    return "";
  };

  const getCurrentAnswer = () => {
    if (currentSection === "copying") {
      return copyingAnswers[currentQuestionIndex];
    }
    return undefined;
  };

  const getAnsweredCount = () => {
    if (currentSection === "copying") {
      return copyingAnswers.filter(answer => answer !== undefined).length;
    }
    return 0;
  };

  const getTotalQuestions = () => {
    if (currentSection === "copying") {
      return copyingScenarios.length;
    }
    return 0;
  };

  const canGoPrev = () => {
    if (currentSection === "copying") {
      return currentQuestionIndex > 0;
    }
    return false;
  };

  const canGoNext = () => {
    if (currentSection === "copying") {
      if (currentQuestionIndex < copyingScenarios.length - 1) {
        return true;
      } else if (currentQuestionIndex === copyingScenarios.length - 1) {
        // Only allow next if ALL copying questions are answered
        return copyingAnswers.every(answer => answer !== undefined && answer !== null);
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
              <span className="text-sm font-medium text-gray-600">Question 15 of 20</span>
              <span className="text-sm font-medium text-gray-600">75%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full" style={{ width: '75%' }}></div>
            </div>
          </div>

          {/* Main Question */}
          <div className="mb-8">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full flex items-center justify-center font-bold text-xl mr-4">
                15
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                Does {childName} try to copy what you do?
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
          {mainAnswer === "yes" && currentSection === "copying" && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800">
                Please give me an example of something {getPronoun("subject")} would try to copy. (If parent does not give one of the following 0 examples, ask each individually.)
              </p>
            </div>
          )}

          {/* Copying Scenarios Section */}
          {currentSection === "copying" && (
            <div className="mb-6">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-gray-700">
                  Does {childName} try to copy you if you...
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
                  
                  {/* Special handling for "Other (describe)" question */}
                  {currentQuestionIndex === 6 && (
                    <div className="mb-4">
                      <textarea
                        value={otherDescription}
                        onChange={(e) => setOtherDescription(e.target.value)}
                        placeholder="Please describe the other copying behavior..."
                        className="w-full p-3 border border-gray-300 rounded-lg resize-none"
                        rows={3}
                      />
                    </div>
                  )}
                  
                  {/* Sub-Question Answer Buttons - Vertical Layout */}
                  <div className="flex flex-col gap-4">
                    <button
                      onClick={() => handleCopyingAnswer("yes")}
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
                      onClick={() => handleCopyingAnswer("no")}
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
                  ? `${childName} shows appropriate copying behaviors.` 
                  : `${childName} may need further evaluation for copying development.`
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

export default Question15; 
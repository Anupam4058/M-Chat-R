import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { saveQuestionResult } from "../redux/Action";
import { RootState } from "../redux/Store";

const Question8: React.FC = () => {
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
  const [subAnswers, setSubAnswers] = useState<("yes" | "no")[]>([]);
  const [score, setScore] = useState<0 | 1 | null>(null);

  // State for one-by-one display
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // State for follow-up questions
  const [followUpAnswer, setFollowUpAnswer] = useState<"yes" | "no" | null>(null);
  const [frequencyAnswer, setFrequencyAnswer] = useState<"yes" | "no" | null>(null);

  // State for current section
  const [currentSection, setCurrentSection] = useState<"main" | "followup" | "sub" | "frequency">("main");

  const subQuestions = [
    "Play with another child?",
    "Talk to another child?",
    "Babble or make vocal noises?",
    "Watch another child?",
    "Smile at another child?",
    "Act shy at first but then smile?",
    "Get excited about another child?"
  ];

  // Calculate score based on flowchart logic
  useEffect(() => {
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
  }, [mainAnswer, followUpAnswer, subAnswers, frequencyAnswer]);

  // Save result when score is calculated
  useEffect(() => {
    if (score !== null) {
      const result = score === 0 ? "pass" : "fail";
      const allSubAnswers = [...subAnswers];
      if (followUpAnswer !== null) {
        allSubAnswers.push(followUpAnswer);
      }
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
  }, [score, mainAnswer, subAnswers, followUpAnswer, frequencyAnswer, dispatch]);

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

          {/* Follow-up Question */}
          {currentSection === "followup" && (
            <div className="mb-6">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-gray-700">
                  When you are at the playground or supermarket, does {childName} usually respond to other children?
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

          {/* Instructions for sub-questions */}
          {currentSection === "sub" && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800">
                How does {childName} respond? (If parent does not give a 0 example below, ask each individually.)
              </p>
            </div>
          )}

          {/* Sub-Questions Section */}
          {currentSection === "sub" && (
            <div className="mb-6">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-gray-700">
                  Does {childName}...
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

          {/* Frequency Question */}
          {currentSection === "frequency" && (
            <div className="mb-6">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-gray-700">
                  Does {childName} respond to other children more than half of the time?
                </h3>
              </div>
              
              <div className="flex flex-col gap-4">
                <button
                  onClick={() => handleFrequencyAnswer("yes")}
                  className={`px-8 py-4 rounded-lg font-semibold transition-all border-2 flex items-center justify-start ${
                    frequencyAnswer === "yes"
                      ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white border-purple-500 shadow-lg"
                      : "bg-white text-gray-700 border-purple-200 hover:border-purple-300 hover:bg-purple-50"
                  }`}
                >
                  {frequencyAnswer === "yes" && <span className="mr-2">✓</span>}
                  Yes
                </button>
                <button
                  onClick={() => handleFrequencyAnswer("no")}
                  className={`px-8 py-4 rounded-lg font-semibold transition-all border-2 flex items-center justify-start ${
                    frequencyAnswer === "no"
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
                  ? `${childName} shows appropriate interest in other children.` 
                  : `${childName} may need further evaluation for social interactions with other children.`
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

export default Question8; 
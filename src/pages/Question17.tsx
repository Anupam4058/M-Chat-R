import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { saveQuestionResult } from "../redux/Action";
import { RootState } from "../redux/Store";

const Question17: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Get child info and question results from Redux store
  const childInfo = useSelector((state: RootState) => (state as any).childInfo);
  const questionResults = useSelector((state: RootState) => (state as any).questionResults);
  const childName = childInfo?.childName || "your child";

  // Find existing result for this question
  const existingResult = questionResults?.find((result: any) => result.questionId === 17);
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
  const [attentionAnswers, setAttentionAnswers] = useState<("yes" | "no")[]>([]);
  const [otherDescription, setOtherDescription] = useState<string>("");
  const [score, setScore] = useState<0 | 1 | null>(null);

  // State for one-by-one display
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentSection, setCurrentSection] = useState<"main" | "attention">("main");

  const attentionQuestions = [
    'Say "Look!" or "Watch me!"?',
    "Babble or make a noise to get you to watch what he/she is doing?",
    "Look at you to get praise or comment?",
    "Keep looking to see if you are looking?",
    "Other (describe):"
  ];

  // Restore any existing answer from Redux store
  useEffect(() => {
    if (existingResult?.completed) {
      // Restore main answer
      setMainAnswer(existingResult.mainAnswer);
      
      // Restore attention answers
      if (existingResult.attentionAnswers && Array.isArray(existingResult.attentionAnswers)) {
        setAttentionAnswers(existingResult.attentionAnswers);
      }
      
      // Restore other description
      if (existingResult.otherDescription !== undefined) {
        setOtherDescription(existingResult.otherDescription);
      }
      
      // Restore the result score
      const finalScore = existingResult.result === "pass" ? 0 : 1;
      setScore(finalScore);
    }
  }, [existingResult]);

  // Calculate score based on flowchart logic
  useEffect(() => {
    if (mainAnswer !== null) {
      // Check if we have all necessary answers for attention questions
      const attentionComplete = attentionAnswers.length === attentionQuestions.length && 
                              attentionAnswers.every(answer => answer !== undefined && answer !== null);
      
      if (attentionComplete) {
        // Count "Yes" answers (excluding "Other" question)
        const yesCount = attentionAnswers.slice(0, 4).filter(answer => answer === "yes").length;
        
        if (yesCount > 0) {
          // "Yes to any" → PASS (score 0)
          setScore(0);
        } else {
          // "Yes to none" → FAIL (score 1)
          setScore(1);
        }
      } else {
        setScore(null);
      }
    }
  }, [mainAnswer, attentionAnswers, attentionQuestions.length]);

  // Save result when score is calculated
  useEffect(() => {
    if (score !== null) {
      const result = score === 0 ? "pass" : "fail";
      const allSubAnswers: ("yes" | "no")[] = [...attentionAnswers];
      
      dispatch(
        saveQuestionResult(
          17,
          result,
          mainAnswer || "no",
          allSubAnswers
        )
      );
    }
  }, [score, mainAnswer, attentionAnswers, dispatch]);

  const handleMainAnswer = (answer: "yes" | "no") => {
    setMainAnswer(answer);
    setScore(null);
    // Both "Yes" and "No" lead to follow-up questions
    setAttentionAnswers(new Array(attentionQuestions.length).fill(undefined));
    setOtherDescription("");
    setCurrentQuestionIndex(0);
    setCurrentSection("attention");
  };

  const handleAttentionAnswer = (answer: "yes" | "no") => {
    const newAttentionAnswers = [...attentionAnswers];
    newAttentionAnswers[currentQuestionIndex] = answer;
    setAttentionAnswers(newAttentionAnswers);
    
    // Auto-advance to next question
    if (currentQuestionIndex < attentionQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
    // If not all answered, stay on the current question
  };

  const handleNextQuestion = () => {
    if (currentSection === "attention" && currentQuestionIndex < attentionQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentSection === "attention" && currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleNext = () => {
    navigate("/question/18");
  };

  const handlePrev = () => {
    navigate("/question/16");
  };

  const getCurrentQuestion = () => {
    if (currentSection === "attention") {
      return attentionQuestions[currentQuestionIndex];
    }
    return "";
  };

  const getCurrentAnswer = () => {
    if (currentSection === "attention") {
      return attentionAnswers[currentQuestionIndex];
    }
    return undefined;
  };

  const getAnsweredCount = () => {
    if (currentSection === "attention") {
      return attentionAnswers.filter(answer => answer !== undefined).length;
    }
    return 0;
  };

  const getTotalQuestions = () => {
    if (currentSection === "attention") {
      return attentionQuestions.length;
    }
    return 0;
  };

  const canGoPrev = () => {
    if (currentSection === "attention") {
      return currentQuestionIndex > 0;
    }
    return false;
  };

  const canGoNext = () => {
    if (currentSection === "attention") {
      if (currentQuestionIndex < attentionQuestions.length - 1) {
        return true;
      } else if (currentQuestionIndex === attentionQuestions.length - 1) {
        // Only allow next if ALL attention questions are answered
        return attentionAnswers.every(answer => answer !== undefined && answer !== null);
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
              <span className="text-sm font-medium text-gray-600">Question 17 of 20</span>
              <span className="text-sm font-medium text-gray-600">85%</span>
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

          {/* Main Question */}
          <div className="mb-8">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full flex items-center justify-center font-bold text-xl mr-4">
                17
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                Does {childName} try to get you to watch {getPronoun("object")}?
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

          {/* Instructions for Yes path only */}
          {mainAnswer === "yes" && currentSection === "attention" && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800">
                Please give me an example of how {getPronoun("subject")} would try to get you to watch {getPronoun("object")}. (If parent does not give a 0 example below, ask each individually.)
              </p>
            </div>
          )}

          {/* Attention Seeking Scenarios Section */}
          {currentSection === "attention" && mainAnswer !== null && (
            <div className="mb-6">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-gray-700">
                  Does {getPronoun("subject")}...
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
                  {currentQuestionIndex === 4 && (
                    <div className="mb-4">
                      <textarea
                        value={otherDescription}
                        onChange={(e) => setOtherDescription(e.target.value)}
                        placeholder="Please describe the other attention-seeking behavior..."
                        className="w-full p-3 border border-gray-300 rounded-lg resize-none"
                        rows={3}
                      />
                    </div>
                  )}
                  
                  {/* Sub-Question Answer Buttons - Vertical Layout */}
                  <div className="flex flex-col gap-4">
                    <button
                      onClick={() => handleAttentionAnswer("yes")}
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
                      onClick={() => handleAttentionAnswer("no")}
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
                  ? `${childName} shows appropriate attention-seeking behaviors.` 
                  : `${childName} may need further evaluation for attention-seeking development.`
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

export default Question17; 
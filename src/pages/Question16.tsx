import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { saveQuestionResult } from "../redux/Action";
import { RootState } from "../redux/Store";

const Question16: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Get child info and question results from Redux store
  const childInfo = useSelector((state: RootState) => (state as any).childInfo);
  const questionResults = useSelector((state: RootState) => (state as any).questionResults);
  const childName = childInfo?.childName || "your child";

  // Find existing result for this question
  const existingResult = questionResults?.find((result: any) => result.questionId === 16);
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
  const [zeroAnswers, setZeroAnswers] = useState<("yes" | "no")[]>([]);
  const [oneAnswers, setOneAnswers] = useState<("yes" | "no")[]>([]);
  const [mostOftenAnswer, setMostOftenAnswer] = useState<"zero" | "one" | null>(null);
  const [score, setScore] = useState<0 | 1 | null>(null);

  // State for one-by-one display
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentSection, setCurrentSection] = useState<"main" | "zero" | "one" | "mostOften">("main");

  const zeroQuestions = [
    "Look toward the thing you are looking at?",
    "Point toward the thing you are looking at?",
    "Look around to see what you are looking at?"
  ];

  const oneQuestions = [
    "Ignore you?",
    "Look at your face?"
  ];

  // Restore any existing answer from Redux store
  useEffect(() => {
    if (existingResult?.completed) {
      // Restore main answer
      setMainAnswer(existingResult.mainAnswer);
      
      // Restore zero answers
      if (existingResult.zeroAnswers && Array.isArray(existingResult.zeroAnswers)) {
        setZeroAnswers(existingResult.zeroAnswers);
      }
      
      // Restore one answers
      if (existingResult.oneAnswers && Array.isArray(existingResult.oneAnswers)) {
        setOneAnswers(existingResult.oneAnswers);
      }
      
      // Restore most often answer
      if (existingResult.mostOftenAnswer !== undefined) {
        setMostOftenAnswer(existingResult.mostOftenAnswer);
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
      // Check if we have all necessary answers
      const zeroComplete = zeroAnswers.length === zeroQuestions.length && 
                          zeroAnswers.every(answer => answer !== undefined && answer !== null);
      const oneComplete = oneAnswers.length === oneQuestions.length && 
                         oneAnswers.every(answer => answer !== undefined && answer !== null);
      
      if (zeroComplete && oneComplete) {
        const zeroYesCount = zeroAnswers.filter(answer => answer === "yes").length;
        const oneYesCount = oneAnswers.filter(answer => answer === "yes").length;
        
        if (zeroYesCount > 0 && oneYesCount === 0) {
          // "Yes only to 0 example(s)" → PASS (score 0)
          setScore(0);
        } else if (zeroYesCount === 0 && oneYesCount > 0) {
          // "Yes only to 1 example(s)" → FAIL (score 1)
          setScore(1);
        } else if (zeroYesCount > 0 && oneYesCount > 0) {
          // "Yes to both 0 and 1 examples" → Need "most often" decision
          if (mostOftenAnswer === "zero") {
            setScore(0); // PASS
          } else if (mostOftenAnswer === "one") {
            setScore(1); // FAIL
          } else {
            setScore(null); // Still waiting for "most often" answer
          }
        } else {
          // No "Yes" answers in either section → Default to FAIL
          setScore(1);
        }
      } else {
        setScore(null);
      }
    }
  }, [mainAnswer, zeroAnswers, oneAnswers, mostOftenAnswer, zeroQuestions.length, oneQuestions.length]);

  // Save result when score is calculated
  useEffect(() => {
    if (score !== null) {
      const result = score === 0 ? "pass" : "fail";
      const allSubAnswers: ("yes" | "no" | "zero" | "one")[] = [
        ...zeroAnswers,
        ...oneAnswers,
        ...(mostOftenAnswer ? [mostOftenAnswer] : [])
      ];
      
      dispatch(
        saveQuestionResult(
          16,
          result,
          mainAnswer || "no",
          allSubAnswers
        )
      );
    }
  }, [score, mainAnswer, zeroAnswers, oneAnswers, mostOftenAnswer, dispatch]);

  const handleMainAnswer = (answer: "yes" | "no") => {
    setMainAnswer(answer);
    setScore(null);
    if (answer === "yes") {
      // "Yes" immediately results in PASS
    } else {
      // "No" leads to follow-up questions
      setZeroAnswers(new Array(zeroQuestions.length).fill(undefined));
      setOneAnswers(new Array(oneQuestions.length).fill(undefined));
      setMostOftenAnswer(null);
      setCurrentQuestionIndex(0);
      setCurrentSection("zero");
    }
  };

  const handleZeroAnswer = (answer: "yes" | "no") => {
    const newZeroAnswers = [...zeroAnswers];
    newZeroAnswers[currentQuestionIndex] = answer;
    setZeroAnswers(newZeroAnswers);
    
    // Auto-advance to next question
    if (currentQuestionIndex < zeroQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Check if ALL zero questions are answered before proceeding to "one" section
      const allZeroAnswered = newZeroAnswers.every(answer => answer !== undefined && answer !== null);
      if (allZeroAnswered) {
        setCurrentSection("one");
        setCurrentQuestionIndex(0);
      }
      // If not all answered, stay on the current question
    }
  };

  const handleOneAnswer = (answer: "yes" | "no") => {
    const newOneAnswers = [...oneAnswers];
    newOneAnswers[currentQuestionIndex] = answer;
    setOneAnswers(newOneAnswers);
    
    // Auto-advance to next question
    if (currentQuestionIndex < oneQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Check if we need "most often" decision
      const zeroYesCount = zeroAnswers.filter(answer => answer === "yes").length;
      const oneYesCount = newOneAnswers.filter(answer => answer === "yes").length;
      
      if (zeroYesCount > 0 && oneYesCount > 0) {
        setCurrentSection("mostOften");
      }
    }
  };

  const handleMostOftenAnswer = (answer: "zero" | "one") => {
    setMostOftenAnswer(answer);
  };

  const handleNextQuestion = () => {
    if (currentSection === "zero" && currentQuestionIndex < zeroQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else if (currentSection === "zero" && currentQuestionIndex === zeroQuestions.length - 1) {
      // Check if ALL zero questions are answered before allowing navigation to "one" section
      const allZeroAnswered = zeroAnswers.every(answer => answer !== undefined && answer !== null);
      if (allZeroAnswered) {
        setCurrentSection("one");
        setCurrentQuestionIndex(0);
      }
    } else if (currentSection === "one" && currentQuestionIndex < oneQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentSection === "zero" && currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    } else if (currentSection === "one" && currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    } else if (currentSection === "one" && currentQuestionIndex === 0) {
      setCurrentSection("zero");
      setCurrentQuestionIndex(zeroQuestions.length - 1);
    }
  };

  const handleNext = () => {
    navigate("/question/17");
  };

  const handlePrev = () => {
    navigate("/question/15");
  };

  const getCurrentQuestion = () => {
    if (currentSection === "zero") {
      return zeroQuestions[currentQuestionIndex];
    } else if (currentSection === "one") {
      return oneQuestions[currentQuestionIndex];
    }
    return "";
  };

  const getCurrentAnswer = () => {
    if (currentSection === "zero") {
      return zeroAnswers[currentQuestionIndex];
    } else if (currentSection === "one") {
      return oneAnswers[currentQuestionIndex];
    }
    return undefined;
  };

  const getAnsweredCount = () => {
    if (currentSection === "zero") {
      return zeroAnswers.filter(answer => answer !== undefined).length;
    } else if (currentSection === "one") {
      return oneAnswers.filter(answer => answer !== undefined).length;
    }
    return 0;
  };

  const getTotalQuestions = () => {
    if (currentSection === "zero") {
      return zeroQuestions.length;
    } else if (currentSection === "one") {
      return oneQuestions.length;
    }
    return 0;
  };

  const canGoPrev = () => {
    if (currentSection === "zero") {
      return currentQuestionIndex > 0;
    } else if (currentSection === "one") {
      return currentQuestionIndex > 0 || zeroAnswers.some(answer => answer !== undefined);
    }
    return false;
  };

  const canGoNext = () => {
    if (currentSection === "zero") {
      if (currentQuestionIndex < zeroQuestions.length - 1) {
        return true;
      } else if (currentQuestionIndex === zeroQuestions.length - 1) {
        // Only allow next if ALL zero questions are answered
        return zeroAnswers.every(answer => answer !== undefined && answer !== null);
      }
      return false;
    } else if (currentSection === "one") {
      return currentQuestionIndex < oneQuestions.length - 1;
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
              <span className="text-sm font-medium text-gray-600">Question 16 of 20</span>
              <span className="text-sm font-medium text-gray-600">80%</span>
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
                16
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                If you turn your head to look at something, does {childName} look around to see what you are looking at?
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

          {/* Instructions for No path */}
          {mainAnswer === "no" && currentSection === "zero" && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800">
                What does {getPronoun("subject")} do when you turn to look at something? (If parent does not give a 0 example below, ask each individually.)
              </p>
            </div>
          )}

          {/* Zero Responses Section */}
          {currentSection === "zero" && mainAnswer === "no" && (
            <div className="mb-6">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-gray-700">
                  Does {childName}... (Below are 0 responses)
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
                      onClick={() => handleZeroAnswer("yes")}
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
                      onClick={() => handleZeroAnswer("no")}
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

          {/* One Responses Section */}
          {currentSection === "one" && mainAnswer === "no" && (
            <div className="mb-6">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-gray-700">
                  Does {childName}... (Below are 1 responses)
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
                      onClick={() => handleOneAnswer("yes")}
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
                      onClick={() => handleOneAnswer("no")}
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

          {/* Most Often Decision */}
          {currentSection === "mostOften" && mainAnswer === "no" && (
            <div className="mb-6">
              <div className="bg-purple-100 border border-purple-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">
                  Which one does {getPronoun("subject")} do most often?
                </h3>
                
                <div className="flex flex-col gap-4">
                  <button
                    onClick={() => handleMostOftenAnswer("zero")}
                    className={`px-6 py-3 rounded-lg font-semibold transition-all border-2 flex items-center justify-start ${
                      mostOftenAnswer === "zero"
                        ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white border-purple-500 shadow-lg"
                        : "bg-white text-gray-700 border-purple-200 hover:border-purple-300 hover:bg-purple-50"
                    }`}
                  >
                    {mostOftenAnswer === "zero" && <span className="mr-2">✓</span>}
                    0 response
                  </button>
                  <button
                    onClick={() => handleMostOftenAnswer("one")}
                    className={`px-6 py-3 rounded-lg font-semibold transition-all border-2 flex items-center justify-start ${
                      mostOftenAnswer === "one"
                        ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white border-purple-500 shadow-lg"
                        : "bg-white text-gray-700 border-purple-200 hover:border-purple-300 hover:bg-purple-50"
                    }`}
                  >
                    {mostOftenAnswer === "one" && <span className="mr-2">✓</span>}
                    1 response
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
                  ? `${childName} shows appropriate joint attention behaviors.` 
                  : `${childName} may need further evaluation for joint attention development.`
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

export default Question16; 
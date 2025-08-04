import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { saveQuestionResult } from "../redux/Action";
import { RootState } from "../redux/Store";

const Question1: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Get child info and question results from Redux store
  const childInfo = useSelector((state: RootState) => (state as any).childInfo);
  const questionResults = useSelector((state: RootState) => (state as any).questionResults);
  const childName = childInfo?.childName || "your child";

  // Find existing result for this question
  const existingResult = questionResults?.find((result: any) => result.questionId === 1);

  // State for the flowchart logic
  const [mainAnswer, setMainAnswer] = useState<"yes" | "no" | null>(null);
  const [zeroExamples, setZeroExamples] = useState<("yes" | "no")[]>([]);
  const [oneExamples, setOneExamples] = useState<("yes" | "no")[]>([]);
  const [score, setScore] = useState<0 | 1 | null>(null);
  const [showMostOften, setShowMostOften] = useState(false);
  const [mostOften, setMostOften] = useState<"zero" | "one" | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState<"zero" | "one">("zero");

  const zeroExampleQuestions = [
    "Look at object?",
    "Point to object?", 
    "Look and comment on object?",
    "Look if you point and say 'look!'?"
  ];

  const oneExampleQuestions = [
    "Ignores you?",
    "Look around room randomly?",
    "Look at your finger?"
  ];

  // Effect to restore state from existing result
  useEffect(() => {
    if (existingResult?.completed) {
      // Restore main answer
      setMainAnswer(existingResult.mainAnswer);
      
      // Restore sub-answers
      const subAnswers = existingResult.subAnswers || [];
      const zeroAnswersCount = zeroExampleQuestions.length;
      
      // Split sub-answers into zero and one examples
      const zeroAnswers = subAnswers.slice(0, zeroAnswersCount) as ("yes" | "no")[];
      const oneAnswers = subAnswers.slice(zeroAnswersCount) as ("yes" | "no")[];
      
      setZeroExamples(zeroAnswers);
      setOneExamples(oneAnswers);
      
      // Restore the result score
      const finalScore = existingResult.result === "pass" ? 0 : 1;
      setScore(finalScore);
    }
  }, [existingResult, zeroExampleQuestions.length]);

  // Calculate score based on flowchart logic
  useEffect(() => {
    // Only calculate score when ALL questions are answered
    const zeroAnswered = zeroExamples.filter(ans => ans !== undefined).length;
    const oneAnswered = oneExamples.filter(ans => ans !== undefined).length;
    const totalQuestions = zeroExampleQuestions.length + oneExampleQuestions.length;
    
    if (mainAnswer !== null && zeroAnswered + oneAnswered === totalQuestions) {
      const zeroYesCount = zeroExamples.filter(ans => ans === "yes").length;
      const oneYesCount = oneExamples.filter(ans => ans === "yes").length;
      
      if (zeroYesCount > 0 && oneYesCount === 0) {
        setScore(0);
      } else if (zeroYesCount === 0 && oneYesCount > 0) {
        setScore(1);
      } else if (zeroYesCount > 0 && oneYesCount > 0) {
        setShowMostOften(true);
      } else if (zeroYesCount === 0 && oneYesCount === 0) {
        setScore(1);
      }
    }
  }, [zeroExamples, oneExamples, mainAnswer, zeroExampleQuestions.length, oneExampleQuestions.length]);

  // Handle most often selection
  useEffect(() => {
    if (mostOften !== null) {
      setScore(mostOften === "zero" ? 0 : 1);
    }
  }, [mostOften]);

  // Save result when score is calculated
  useEffect(() => {
    if (score !== null) {
      const result = score === 0 ? "pass" : "fail";
      dispatch(
        saveQuestionResult(
          1,
          result,
          mainAnswer || "no",
          [...zeroExamples, ...oneExamples]
        )
      );
    }
  }, [score, mainAnswer, zeroExamples, oneExamples, dispatch]);

  const handleMainAnswer = (answer: "yes" | "no") => {
    setMainAnswer(answer);
    setZeroExamples([]);
    setOneExamples([]);
    setScore(null);
    setShowMostOften(false);
    setMostOften(null);
    setCurrentQuestionIndex(0);
    setCurrentSet("zero");
  };

  const handleZeroExample = (index: number, answer: "yes" | "no") => {
    const newAnswers = [...zeroExamples];
    newAnswers[index] = answer;
    setZeroExamples(newAnswers);
  };

  const handleOneExample = (index: number, answer: "yes" | "no") => {
    const newAnswers = [...oneExamples];
    newAnswers[index] = answer;
    setOneExamples(newAnswers);
  };

  const handleMostOften = (choice: "zero" | "one") => {
    setMostOften(choice);
  };

  const handleNext = () => {
    navigate("/question/2");
  };

  const handlePrev = () => {
    navigate("/child-info");
  };

  const handleNextQuestion = () => {
    if (currentSet === "zero") {
      if (currentQuestionIndex < zeroExampleQuestions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        // Move to second set
        setCurrentSet("one");
        setCurrentQuestionIndex(0);
      }
    } else if (currentSet === "one") {
      if (currentQuestionIndex < oneExampleQuestions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      }
    }
  };

  const handlePrevQuestion = () => {
    if (currentSet === "zero") {
      if (currentQuestionIndex > 0) {
        setCurrentQuestionIndex(currentQuestionIndex - 1);
      }
    } else if (currentSet === "one") {
      if (currentQuestionIndex > 0) {
        setCurrentQuestionIndex(currentQuestionIndex - 1);
      } else {
        // Move back to first set
        setCurrentSet("zero");
        setCurrentQuestionIndex(zeroExampleQuestions.length - 1);
      }
    }
  };

  const getCurrentQuestion = () => {
    if (mainAnswer === null) return null;
    
    if (currentSet === "zero") {
      return zeroExampleQuestions[currentQuestionIndex];
    } else {
      return oneExampleQuestions[currentQuestionIndex];
    }
  };

  const getCurrentAnswer = () => {
    if (currentSet === "zero") {
      return zeroExamples[currentQuestionIndex];
    } else {
      return oneExamples[currentQuestionIndex];
    }
  };

  const handleCurrentAnswer = (answer: "yes" | "no") => {
    if (currentSet === "zero") {
      handleZeroExample(currentQuestionIndex, answer);
      // Auto-advance to next question
      if (currentQuestionIndex < zeroExampleQuestions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        // Move to second set
        setCurrentSet("one");
        setCurrentQuestionIndex(0);
      }
    } else {
      handleOneExample(currentQuestionIndex, answer);
      // Auto-advance to next question
      if (currentQuestionIndex < oneExampleQuestions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      }
      // If this is the last question, the score will be calculated automatically
    }
  };

  const getAnsweredCount = () => {
    const zeroAnswered = zeroExamples.filter(ans => ans !== undefined).length;
    const oneAnswered = oneExamples.filter(ans => ans !== undefined).length;
    return zeroAnswered + oneAnswered;
  };

  const getTotalQuestions = () => {
    return zeroExampleQuestions.length + oneExampleQuestions.length;
  };

  const getCurrentSetTitle = () => {
    if (currentSet === "zero") {
      return "First Set of Questions";
    } else {
      return "Second Set of Questions";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-indigo-200">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto bg-white/80 rounded-2xl shadow-2xl p-6 md:p-8">
          
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-600">Question 1 of 20</span>
              <span className="text-sm font-medium text-gray-600">5%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full" style={{ width: '5%' }}></div>
            </div>
          </div>

          {/* Main Question - Simple Layout */}
          <div className="mb-8">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full flex items-center justify-center font-bold text-xl mr-4">
                1
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                If you point at something across the room, does {childName} look at it?
              </h1>
            </div>
            <p className="text-gray-600 mb-6 italic">
              (For example: if you point at a toy or an animal, does {childName} look at the toy or animal?)
            </p>
            
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

          {/* Instructions based on main answer */}
          {mainAnswer === "yes" && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800">
                "If yes then..." Please give me an example of how {childName} will respond if you point at something If parent does not give a PASS example below, ask each individually.
              </p>
            </div>
          )}

          {mainAnswer === "no" && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800">
                If you point at something, what does {childName} typically do?
              </p>
            </div>
          )}

          {/* Sub-Questions Progress Bar */}
          {mainAnswer !== null && !showMostOften && score === null && (
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
          )}

          {/* Sub-Questions */}
          {mainAnswer !== null && !showMostOften && score === null && (
            <div className="mb-6">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-gray-700">
                  {getCurrentSetTitle()}
                </h3>
              </div>
              
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={handlePrevQuestion}
                  disabled={currentSet === "zero" && currentQuestionIndex === 0}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    currentSet === "zero" && currentQuestionIndex === 0
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  ‹
                </button>
                
                <div className="bg-purple-100 border border-purple-200 rounded-lg p-4 flex-1 mx-4">
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">
                    {currentSet === "zero" ? currentQuestionIndex + 1 : zeroExampleQuestions.length + currentQuestionIndex + 1}. {getCurrentQuestion()}
                  </h3>
                  
                  {/* Sub-Question Answer Buttons - Vertical Layout */}
                  <div className="flex flex-col gap-4">
                    <button
                      onClick={() => handleCurrentAnswer("yes")}
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
                      onClick={() => handleCurrentAnswer("no")}
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
                  disabled={currentSet === "one" && currentQuestionIndex === oneExampleQuestions.length - 1}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    currentSet === "one" && currentQuestionIndex === oneExampleQuestions.length - 1
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
          {showMostOften && (
            <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <h3 className="text-lg font-semibold text-orange-800 mb-4">
                Which type of behavior does {childName} show most often?
              </h3>
              <div className="flex gap-4">
                <button
                  onClick={() => handleMostOften("zero")}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                    mostOften === "zero"
                      ? "bg-green-500 text-white shadow-lg"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  First set of behaviors
                </button>
                <button
                  onClick={() => handleMostOften("one")}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                    mostOften === "one"
                      ? "bg-red-500 text-white shadow-lg"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Second set of behaviors
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
                  ? `${childName} shows appropriate responses to pointing.` 
                  : `${childName} may need further evaluation for this behavior.`
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

export default Question1; 
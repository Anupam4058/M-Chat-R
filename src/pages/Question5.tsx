import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { saveQuestionResult } from "../redux/Action";
import { RootState } from "../redux/Store";

const Question5: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Get child info and question results from Redux store
  const childInfo = useSelector((state: RootState) => (state as any).childInfo);
  const questionResults = useSelector((state: RootState) => (state as any).questionResults);
  const childName = childInfo?.childName || "your child";
  const childGender = childInfo?.gender || "unknown";
  
  // Find existing result for this question
  const existingResult = questionResults?.find((result: any) => result.questionId === 5);
  
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

  // State for main answer and complex sub-questions
  const [mainAnswer, setMainAnswer] = useState<"yes" | "no" | null>(null);
  const [score, setScore] = useState<0 | 1 | null>(null);

  // State for "0 examples" set
  const [zeroExamples, setZeroExamples] = useState<("yes" | "no")[]>([]);
  const [currentZeroIndex, setCurrentZeroIndex] = useState(0);

  // State for "1 examples" set
  const [oneExamples, setOneExamples] = useState<("yes" | "no")[]>([]);
  const [currentOneIndex, setCurrentOneIndex] = useState(0);

  // State for frequency question
  const [frequencyAnswer, setFrequencyAnswer] = useState<"yes" | "no" | null>(null);

  // State for current section and question display
  const [currentSection, setCurrentSection] = useState<"main" | "zero" | "one" | "frequency">("main");

  const zeroQuestions = [
    "Look at hands?",
    "Move fingers when playing peek-a-boo?"
  ];

  const oneQuestions = [
    `Wiggle ${getPronoun("possessive")} fingers near ${getPronoun("possessive")} eyes?`,
    `Hold ${getPronoun("possessive")} hands up close to ${getPronoun("possessive")} eyes?`,
    `Hold ${getPronoun("possessive")} hands off to the side of ${getPronoun("possessive")} eyes?`,
    `Flap ${getPronoun("possessive")} hands near ${getPronoun("possessive")} face?`
  ];

  // Effect to restore state from existing result
  useEffect(() => {
    if (existingResult?.completed) {
      // Restore main answer
      setMainAnswer(existingResult.mainAnswer);
      
      // Restore sub-answers
      const subAnswers = existingResult.subAnswers || [];
      const zeroAnswersCount = zeroQuestions.length;
      const oneAnswersCount = oneQuestions.length;
      
      // Split sub-answers into zero examples, one examples, and frequency
      const zeroAnswers = subAnswers.slice(0, zeroAnswersCount) as ("yes" | "no")[];
      const oneAnswers = subAnswers.slice(zeroAnswersCount, zeroAnswersCount + oneAnswersCount) as ("yes" | "no")[];
      const frequency = subAnswers[zeroAnswersCount + oneAnswersCount] as "yes" | "no" | null;
      
      setZeroExamples(zeroAnswers);
      setOneExamples(oneAnswers);
      if (frequency) setFrequencyAnswer(frequency);
      
      // Restore the result score
      const finalScore = existingResult.result === "pass" ? 0 : 1;
      setScore(finalScore);
    }
  }, [existingResult, zeroQuestions.length, oneQuestions.length]);

  // Calculate score based on complex flowchart logic
  useEffect(() => {
    if (mainAnswer === "no") {
      setScore(0); // PASS
      return;
    }

    if (mainAnswer === "yes") {
      // Check if we have all necessary answers
      const zeroComplete = zeroExamples.length === zeroQuestions.length && 
                          zeroExamples.every(answer => answer !== undefined);
      const oneComplete = oneExamples.length === oneQuestions.length && 
                         oneExamples.every(answer => answer !== undefined);
      
      if (zeroComplete && oneComplete) {
        const zeroYesCount = zeroExamples.filter(answer => answer === "yes").length;
        const oneYesCount = oneExamples.filter(answer => answer === "yes").length;
        
        // Complex scoring logic from flowchart
        if (zeroYesCount > 0 && oneYesCount === 0) {
          // "Yes to any of the above without any 1 items endorsed"
          setScore(0); // PASS
        } else if (oneYesCount === 0) {
          // "No to all of the above" in 1 examples - immediate PASS
          setScore(0); // PASS
        } else if (oneYesCount > 0 && frequencyAnswer === "no") {
          // "Yes to any of the above" but "No" to frequency
          setScore(0); // PASS
        } else if (oneYesCount > 0 && frequencyAnswer === "yes") {
          // "Yes to any of the above" AND "Yes" to frequency
          setScore(1); // FAIL
        }
      }
    }
  }, [mainAnswer, zeroExamples, oneExamples, frequencyAnswer, oneQuestions.length, zeroQuestions.length]);

  // Save result when score is calculated
  useEffect(() => {
    if (score !== null) {
      const result = score === 0 ? "pass" : "fail";
      const allSubAnswers = [...zeroExamples, ...oneExamples];
      if (frequencyAnswer !== null) {
        allSubAnswers.push(frequencyAnswer);
      }
      
      dispatch(
        saveQuestionResult(
          5,
          result,
          mainAnswer || "no",
          allSubAnswers
        )
      );
    }
  }, [score, mainAnswer, zeroExamples, oneExamples, frequencyAnswer, dispatch]);

  const handleMainAnswer = (answer: "yes" | "no") => {
    setMainAnswer(answer);
    setScore(null);
    setZeroExamples([]);
    setOneExamples([]);
    setFrequencyAnswer(null);
    setCurrentZeroIndex(0);
    setCurrentOneIndex(0);
    
    if (answer === "no") {
      setCurrentSection("main");
    } else {
      setCurrentSection("zero");
    }
  };

  const handleZeroAnswer = (answer: "yes" | "no") => {
    const newZeroExamples = [...zeroExamples];
    newZeroExamples[currentZeroIndex] = answer;
    setZeroExamples(newZeroExamples);
    
    // Auto-advance to next zero question or move to one examples
    if (currentZeroIndex < zeroQuestions.length - 1) {
      setCurrentZeroIndex(currentZeroIndex + 1);
    } else {
      setCurrentSection("one");
      setCurrentOneIndex(0);
    }
  };

  const handleOneAnswer = (answer: "yes" | "no") => {
    const newOneExamples = [...oneExamples];
    newOneExamples[currentOneIndex] = answer;
    setOneExamples(newOneExamples);
    
    // Auto-advance to next one question or check if we need frequency question
    if (currentOneIndex < oneQuestions.length - 1) {
      setCurrentOneIndex(currentOneIndex + 1);
    } else {
      // Check if any "1 examples" were answered "Yes"
      const updatedOneExamples = [...newOneExamples];
      const oneYesCount = updatedOneExamples.filter(answer => answer === "yes").length;
      
      if (oneYesCount > 0) {
        // If any "1 examples" is "Yes", proceed to frequency question
        setCurrentSection("frequency");
      } else {
        // If all "1 examples" are "No", we can calculate score immediately
        // The useEffect will handle the scoring
      }
    }
  };

  const handleFrequencyAnswer = (answer: "yes" | "no") => {
    setFrequencyAnswer(answer);
  };

  const handleNextQuestion = () => {
    if (currentSection === "zero" && currentZeroIndex < zeroQuestions.length - 1) {
      setCurrentZeroIndex(currentZeroIndex + 1);
    } else if (currentSection === "one" && currentOneIndex < oneQuestions.length - 1) {
      setCurrentOneIndex(currentOneIndex + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentSection === "zero" && currentZeroIndex > 0) {
      setCurrentZeroIndex(currentZeroIndex - 1);
    } else if (currentSection === "one" && currentOneIndex > 0) {
      setCurrentOneIndex(currentOneIndex - 1);
    } else if (currentSection === "one" && currentOneIndex === 0) {
      setCurrentSection("zero");
      setCurrentZeroIndex(zeroQuestions.length - 1);
    } else if (currentSection === "frequency") {
      setCurrentSection("one");
      setCurrentOneIndex(oneQuestions.length - 1);
    }
  };

  const handleNext = () => {
    navigate("/question/6");
  };

  const handlePrev = () => {
    navigate("/question/4");
  };

  const getCurrentQuestion = () => {
    if (currentSection === "zero") {
      return zeroQuestions[currentZeroIndex];
    } else if (currentSection === "one") {
      return oneQuestions[currentOneIndex];
    }
    return "";
  };

  const getCurrentAnswer = () => {
    if (currentSection === "zero") {
      return zeroExamples[currentZeroIndex];
    } else if (currentSection === "one") {
      return oneExamples[currentOneIndex];
    }
    return undefined;
  };

  const getAnsweredCount = () => {
    if (currentSection === "zero") {
      return zeroExamples.filter(answer => answer !== undefined).length;
    } else if (currentSection === "one") {
      return oneExamples.filter(answer => answer !== undefined).length;
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
      return currentZeroIndex > 0;
    } else if (currentSection === "one") {
      return currentOneIndex > 0;
    }
    return false;
  };

  const canGoNext = () => {
    if (currentSection === "zero") {
      return currentZeroIndex < zeroQuestions.length - 1;
    } else if (currentSection === "one") {
      return currentOneIndex < oneQuestions.length - 1;
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
              <span className="text-sm font-medium text-gray-600">Question 5 of 20</span>
              <span className="text-sm font-medium text-gray-600">25%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full" style={{ width: '25%' }}></div>
            </div>
          </div>

          {/* Main Question */}
          <div className="mb-8">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full flex items-center justify-center font-bold text-xl mr-4">
                5
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                Does {childName} make unusual finger movements near {getPronoun("possessive")} eyes?
              </h1>
            </div>
            <p className="text-gray-600 mb-6 italic">
              (does {childName} wiggle {getPronoun("possessive")} fingers close to {getPronoun("possessive")} eyes?)
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

          {/* Instructions for Yes path */}
          {mainAnswer === "yes" && currentSection !== "main" && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800">
                Please describe these movements (If parent does not give a 0 example below, ask each individually.)
              </p>
            </div>
          )}

          {/* Zero Examples Section */}
          {currentSection === "zero" && (
            <div className="mb-6">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-gray-700">
                  Does {getPronoun("subject")} ... (Below are 0 examples)
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
                    {currentZeroIndex + 1}. {getCurrentQuestion()}
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

          {/* One Examples Section */}
          {currentSection === "one" && (
            <div className="mb-6">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-gray-700">
                  Does {getPronoun("subject")}... (Below are 1 examples)
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
                    {currentOneIndex + 1}. {getCurrentQuestion()}
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

          {/* Frequency Question */}
          {currentSection === "frequency" && (
            <div className="mb-6">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-gray-700">
                  Does this happen more than twice a week?
                </h3>
              </div>
              
              <div className="flex flex-col gap-4">
                <button
                  onClick={() => handleFrequencyAnswer("yes")}
                  className={`px-8 py-4 rounded-lg font-semibold transition-all border-2 flex items-center justify-center ${
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
                  className={`px-8 py-4 rounded-lg font-semibold transition-all border-2 ${
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
                  ? `${childName} shows appropriate finger movement behaviors.` 
                  : `${childName} may need further evaluation for finger movement behaviors.`
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

export default Question5; 
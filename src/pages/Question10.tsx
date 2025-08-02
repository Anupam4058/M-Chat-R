import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { saveQuestionResult } from "../redux/Action";
import { RootState } from "../redux/Store";

const Question10: React.FC = () => {
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
  const [zeroExamples, setZeroExamples] = useState<("yes" | "no")[]>([]);
  const [oneExamples, setOneExamples] = useState<("yes" | "no")[]>([]);
  const [score, setScore] = useState<0 | 1 | null>(null);

  // State for one-by-one display
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState<"zero" | "one">("zero");

  // State for "Most Often" decision
  const [mostOften, setMostOften] = useState<"zero" | "one" | null>(null);

  // State for current section
  const [currentSection, setCurrentSection] = useState<"main" | "zero" | "one" | "mostOften">("main");

  const zeroQuestions = [
    "Look up?",
    "Talk or babble?",
    `Stop what ${getPronoun("subject")} is doing?`
  ];

  const oneQuestions = [
    "Make no response?",
    "Seem to hear but ignores parent?",
    `Respond only if parent is right in front of ${getPronoun("possessive")} face?`,
    "Respond only if touched?"
  ];

  // Calculate score based on flowchart logic
  useEffect(() => {
    // Check if we have all necessary answers for both sets
    const zeroComplete = zeroExamples.length === zeroQuestions.length && 
                        zeroExamples.every(answer => answer !== undefined && answer !== null);
    const oneComplete = oneExamples.length === oneQuestions.length && 
                       oneExamples.every(answer => answer !== undefined && answer !== null);
    
    if (zeroComplete && oneComplete) {
      const zeroYesCount = zeroExamples.filter(answer => answer === "yes").length;
      const oneYesCount = oneExamples.filter(answer => answer === "yes").length;
      
      // New logic: Check which types have "yes" answers
      const hasPassExamples = zeroYesCount > 0;
      const hasFailExamples = oneYesCount > 0;
      
      if (hasPassExamples && !hasFailExamples) {
        // Only pass examples marked "yes" → PASS
        setScore(0);
      } else if (!hasPassExamples && hasFailExamples) {
        // Only fail examples marked "yes" → FAIL
        setScore(1);
      } else if (hasPassExamples && hasFailExamples) {
        // Both pass and fail examples marked "yes" → Need "Most Often" decision
        if (mostOften !== null) {
          setScore(mostOften === "zero" ? 0 : 1);
        }
      } else {
        // No examples marked "yes" → Default to PASS (or you can decide based on main answer)
        setScore(0);
      }
    }
  }, [zeroExamples, oneExamples, mostOften]);

  // Save result when score is calculated
  useEffect(() => {
    if (score !== null) {
      const result = score === 0 ? "pass" : "fail";
      const allSubAnswers: ("yes" | "no" | "zero" | "one")[] = [...zeroExamples, ...oneExamples];
      if (mostOften !== null) {
        allSubAnswers.push(mostOften === "zero" ? "zero" : "one");
      }
      
      dispatch(
        saveQuestionResult(
          10,
          result,
          mainAnswer || "no",
          allSubAnswers
        )
      );
    }
  }, [score, mainAnswer, zeroExamples, oneExamples, mostOften, dispatch]);

  const handleMainAnswer = (answer: "yes" | "no") => {
    setMainAnswer(answer);
    setScore(null);
    setZeroExamples([]);
    setOneExamples([]);
    setMostOften(null);
    setCurrentQuestionIndex(0);
    setCurrentSet("zero");
    setCurrentSection("zero");
  };

  const handleZeroAnswer = (answer: "yes" | "no") => {
    const newZeroExamples = [...zeroExamples];
    newZeroExamples[currentQuestionIndex] = answer;
    setZeroExamples(newZeroExamples);
    
    // Auto-advance to next question or switch to one examples
    if (currentQuestionIndex < zeroQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Always move to one examples after completing zero examples
      setCurrentSet("one");
      setCurrentQuestionIndex(0);
      setCurrentSection("one");
    }
  };

  const handleOneAnswer = (answer: "yes" | "no") => {
    const newOneExamples = [...oneExamples];
    newOneExamples[currentQuestionIndex] = answer;
    setOneExamples(newOneExamples);
    
    // Auto-advance to next question or check if we need "Most Often" decision
    if (currentQuestionIndex < oneQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Check if we need "Most Often" decision
      const oneYesCount = newOneExamples.filter(answer => answer === "yes").length;
      const zeroYesCount = zeroExamples.filter(answer => answer === "yes").length;
      
      if (oneYesCount > 0 && zeroYesCount > 0) {
        setCurrentSection("mostOften");
      }
      // If not both, the useEffect will handle the scoring
    }
  };

  const handleMostOftenAnswer = (answer: "zero" | "one") => {
    setMostOften(answer);
  };

  const handleNextQuestion = () => {
    if (currentSection === "zero" && currentQuestionIndex < zeroQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
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
    } else if (currentSection === "mostOften") {
      setCurrentSection("one");
      setCurrentQuestionIndex(oneQuestions.length - 1);
    }
  };

  const handleNext = () => {
    navigate("/question/11");
  };

  const handlePrev = () => {
    navigate("/question/9");
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
      return zeroExamples[currentQuestionIndex];
    } else if (currentSection === "one") {
      return oneExamples[currentQuestionIndex];
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
      return currentQuestionIndex > 0;
    } else if (currentSection === "one") {
      return currentQuestionIndex > 0;
    }
    return false;
  };

  const canGoNext = () => {
    if (currentSection === "zero") {
      return currentQuestionIndex < zeroQuestions.length - 1;
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
              <span className="text-sm font-medium text-gray-600">Question 10 of 20</span>
              <span className="text-sm font-medium text-gray-600">50%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full" style={{ width: '50%' }}></div>
            </div>
          </div>

          {/* Main Question */}
          <div className="mb-8">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full flex items-center justify-center font-bold text-xl mr-4">
                10
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                Does {childName} respond when you call {getPronoun("possessive")} name?
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
                 Please give me an example of how {getPronoun("subject")} responds when you call {getPronoun("possessive")} name. (If parent does not give a 0 example below, ask each individually.)
               </p>
             </div>
           )}

           {/* Instructions for No path */}
           {mainAnswer === "no" && currentSection !== "main" && (
             <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
               <p className="text-blue-800">
                 If {getPronoun("subject")} is not involved in something fun or interesting, what does {getPronoun("subject")} do when you call {getPronoun("possessive")} name? (If parent does not give a 0 example below, ask each individually.)
               </p>
             </div>
           )}

          {/* Zero Examples Section */}
          {currentSection === "zero" && (
            <div className="mb-6">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-gray-700">
                  Does {getPronoun("subject")}... (below are 0 responses)
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

          {/* One Examples Section */}
          {currentSection === "one" && (
            <div className="mb-6">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-gray-700">
                  Does {getPronoun("subject")}... (below are 1 responses)
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
          {currentSection === "mostOften" && (
            <div className="mb-6">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-gray-700">
                  Which one does {getPronoun("subject")} do most often?
                </h3>
              </div>
              
              <div className="flex flex-col gap-4">
                <button
                  onClick={() => handleMostOftenAnswer("zero")}
                  className={`px-8 py-4 rounded-lg font-semibold transition-all border-2 flex items-center justify-start ${
                    mostOften === "zero"
                      ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white border-purple-500 shadow-lg"
                      : "bg-white text-gray-700 border-purple-200 hover:border-purple-300 hover:bg-purple-50"
                  }`}
                >
                  {mostOften === "zero" && <span className="mr-2">✓</span>}
                  0 response
                </button>
                <button
                  onClick={() => handleMostOftenAnswer("one")}
                  className={`px-8 py-4 rounded-lg font-semibold transition-all border-2 flex items-center justify-start ${
                    mostOften === "one"
                      ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white border-purple-500 shadow-lg"
                      : "bg-white text-gray-700 border-purple-200 hover:border-purple-300 hover:bg-purple-50"
                  }`}
                >
                  1 response
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
                  ? `${childName} shows appropriate responses to name calling.` 
                  : `${childName} may need further evaluation for name response behaviors.`
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

export default Question10; 
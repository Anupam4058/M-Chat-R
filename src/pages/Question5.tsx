import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { saveQuestionResult, saveComplexQuestionResult, clearQuestionResult } from "../redux/Action";
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

  // State for example box
  const [userExample, setUserExample] = useState<string>("");
  const [examplesSaved, setExamplesSaved] = useState<boolean>(false);
  const [noExamplesChecked, setNoExamplesChecked] = useState<boolean>(false);

  // Reset state variables
  const [showResetModal, setShowResetModal] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

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
    if (existingResult?.completed && !isResetting) {
      setIsRestoring(true);
      // Restore main answer
      setMainAnswer(existingResult.mainAnswer);
      
      // Restore complex data if available
      if (existingResult.zeroExamples && existingResult.oneExamples) {
        // Use complex data structure
        setZeroExamples(existingResult.zeroExamples);
        setOneExamples(existingResult.oneExamples);
        setFrequencyAnswer(existingResult.frequencyAnswer || null);
        setUserExample(existingResult.userExample || "");
        setExamplesSaved(!!existingResult.examplesSaved);
        setNoExamplesChecked(!!existingResult.noExamplesChecked);
        setCurrentZeroIndex(existingResult.currentZeroIndex || 0);
        setCurrentOneIndex(existingResult.currentOneIndex || 0);
        setCurrentSection(existingResult.currentSection || "main");
      } else {
        // Fallback to old subAnswers structure
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
        
        // Restore example data
        setUserExample(existingResult.userExample || "");
        setExamplesSaved(!!existingResult.examplesSaved);
        setNoExamplesChecked(!!existingResult.noExamplesChecked);
      }
      
      // Restore the result score
      const finalScore = existingResult.result === "pass" ? 0 : 1;
      setScore(finalScore);
      setTimeout(() => setIsRestoring(false), 100);
    }
  }, [existingResult, zeroQuestions.length, oneQuestions.length, isResetting]);

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
    if (isRestoring) {
      return;
    }
    
    if (score !== null) {
      const result = score === 0 ? "pass" : "fail";
      const allSubAnswers = [...zeroExamples, ...oneExamples];
      if (frequencyAnswer !== null) {
        allSubAnswers.push(frequencyAnswer);
      }
      
      // Create complex data object to save all state
      const complexData = {
        zeroExamples,
        oneExamples,
        frequencyAnswer,
        userExample,
        examplesSaved,
        noExamplesChecked,
        currentZeroIndex,
        currentOneIndex,
        currentSection
      };
      
      dispatch(
        saveComplexQuestionResult(
          5,
          result,
          mainAnswer || "no",
          complexData
        )
      );
    }
  }, [score, mainAnswer, zeroExamples, oneExamples, frequencyAnswer, dispatch, userExample, examplesSaved, noExamplesChecked, currentZeroIndex, currentOneIndex, currentSection, isRestoring]);

  const handleMainAnswer = (answer: "yes" | "no") => {
    setMainAnswer(answer);
    setScore(null);
    setZeroExamples([]);
    setOneExamples([]);
    setFrequencyAnswer(null);
    setCurrentZeroIndex(0);
    setCurrentOneIndex(0);
    
    if (answer === "no") {
      // Immediately set score to 0 (PASS) for "No" answer
      setScore(0);
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

  // Reset handlers
  const handleResetQuestion = () => {
    setShowResetModal(true);
  };

  const handleConfirmReset = () => {
    setIsResetting(true);
    
    // Clear all state
    setMainAnswer(null);
    setZeroExamples([]);
    setOneExamples([]);
    setScore(null);
    setCurrentZeroIndex(0);
    setCurrentOneIndex(0);
    setFrequencyAnswer(null);
    setCurrentSection("main");
    setUserExample("");
    setExamplesSaved(false);
    setNoExamplesChecked(false);
    
    // Clear from Redux store
    dispatch(clearQuestionResult(5));
    
    // Close modal
    setShowResetModal(false);
    
    // Reset the resetting flag after a short delay
    setTimeout(() => setIsResetting(false), 100);
  };

  const handleCancelReset = () => {
    setShowResetModal(false);
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

  // Check if example requirement is met
  const isExampleRequirementMet = () => {
    if (mainAnswer === "no") return true;
    return examplesSaved || noExamplesChecked;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-indigo-200">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto bg-white/80 rounded-2xl shadow-2xl p-6 md:p-8">
          
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
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 text-left">
                Does {childName} make unusual finger movements near {getPronoun("possessive")} eyes?
              </h1>
            </div>
            <p className="text-gray-600 mb-6 italic">
              (does {childName} wiggle {getPronoun("possessive")} fingers close to {getPronoun("possessive")} eyes?)
            </p>
            
            {/* Main Answer Buttons - Horizontal Layout */}
            <div className="flex gap-4 mb-6 justify-center">
              <button
                onClick={() => handleMainAnswer("yes")}
                className={`px-6 py-3 rounded-full font-semibold transition-all border-2 flex items-center justify-center min-w-[120px] ${mainAnswer === "yes"
                    ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white border-purple-500 shadow-lg"
                    : "bg-white text-gray-700 border-purple-200 hover:border-purple-300 hover:bg-purple-50"
                }`}
              >
                {mainAnswer === "yes" && <span className="mr-2">✓</span>}
                Yes
              </button>
              <button
                onClick={() => handleMainAnswer("no")}
                className={`px-6 py-3 rounded-full font-semibold transition-all border-2 flex items-center justify-center min-w-[120px] ${mainAnswer === "no"
                    ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white border-purple-500 shadow-lg"
                    : "bg-white text-gray-700 border-purple-200 hover:border-purple-300 hover:bg-purple-50"
                }`}
              >
                {mainAnswer === "no" && <span className="mr-2">✓</span>}
                No
              </button>
            </div>
          </div>

          {/* user example input */}
          {mainAnswer === "yes" && (score === null || userExample || noExamplesChecked) && (
            <div className="mb-6">
              <p className="text-gray-800 font-semibold mb-6 text-center text-lg">
                Please describe {childName}'s finger movements near {getPronoun("possessive")} eyes.
              </p>
              
              <div className="space-y-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                {/* Labels positioned above the textarea in separate boxes */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Left side - Description box */}
                  <div className="bg-blue-100 border border-blue-200 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-gray-800 mb-2">
                      Describe {childName}'s behavior
                    </h4>
                    <p className="text-sm text-gray-900">
                      When {getPronoun("subject")} makes unusual movements near {getPronoun("possessive")} eyes:
                    </p>
                  </div>
                  
                  {/* Right side - Info button box */}
                  <div className="bg-blue-100 border border-blue-200 rounded-lg p-4 flex items-center gap-2">
                    <div className="w-5 h-5 bg-gray-800 text-white rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold">i</span>
                    </div>
                    <span className="text-xs text-gray-900">
                      This helps us understand {childName}'s specific finger movement behaviors.
                    </span>
                  </div>
                </div>

                {/* Full width input field with mic button */}
                <div className="space-y-4">
                  <div className="relative">
                    <textarea
                      id="userExample"
                      value={userExample}
                      onChange={(e) => setUserExample(e.target.value)}
                      placeholder="Enter your example here..."
                      className={`w-full px-3 py-2 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none ${
                        score !== null ? 'bg-gray-100 cursor-not-allowed' : ''
                      }`}
                      rows={4}
                      disabled={score !== null}
                    />
                    
                    {/* Microphone button positioned at bottom right */}
                    <button
                      className="absolute right-3 bottom-3 w-6 h-6 text-gray-500 hover:text-gray-700 transition-colors"
                      disabled={score !== null}
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Checkbox and Save button row */}
              <div className="flex items-center justify-between mt-4">
                {/* Checkbox for no examples */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="noExamples"
                    checked={noExamplesChecked}
                    onChange={(e) => {
                      setNoExamplesChecked(e.target.checked);
                      // Reset saved state when checkbox is unchecked
                      if (!e.target.checked) {
                        setExamplesSaved(false);
                      }
                    }}
                    disabled={score !== null}
                    className={`w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 ${
                      score !== null ? 'cursor-not-allowed opacity-50' : ''
                    }`}
                  />
                  <label htmlFor="noExamples" className="text-sm text-gray-700">
                    I don't have any example for now
                  </label>
                </div>
                
                {/* Save & Next button */}
                <button
                  onClick={() => {
                    // Save the example and set saved state
                    if (userExample.trim() !== "") {
                      setExamplesSaved(true);
                      console.log('Saving example:', userExample);
                    }
                  }}
                  disabled={userExample.trim() === "" || score !== null}
                  className={`px-6 py-2 text-sm rounded-md transition-colors shadow-sm font-medium ${
                    userExample.trim() === "" || score !== null
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed" 
                      : examplesSaved
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  {examplesSaved ? "Saved ✓" : "Save & Next >"}
                </button>
              </div>
            </div>
          )}

          {/* Two Boxes Layout for Sub-Questions */}
          {mainAnswer === "yes" && isExampleRequirementMet() && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-6">

              {/* Left Box - 0 Examples (Green) */}
              {(currentSection === "zero" || currentSection === "one" || zeroExamples.some(answer => answer !== undefined) || score !== null) && (
                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
                    <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-2">0</span>
                    Does {getPronoun("subject")}...
                  </h3>
                  <div className="space-y-4">
                    {/* Show answered questions */}
                    {zeroQuestions.map((question, index) => (
                      zeroExamples[index] !== undefined && (
                        <div key={index} className="bg-white rounded-lg p-4 border border-green-200">
                          <div className="flex items-center justify-between text-left">
                            <p className="text-gray-700 font-medium flex-1 mr-4 text-left">{question}</p>
                            <div className={`px-4 py-2 rounded-lg font-medium ${zeroExamples[index] === "yes"
                                ? "bg-green-500 text-white"
                                : "bg-red-500 text-white"
                              }`}>
                              {zeroExamples[index] === "yes" ? "Yes" : "No"}
                            </div>
                          </div>
                        </div>
                      )
                    ))}

                    {/* Show current question if it's a zero question and score is null */}
                    {currentSection === "zero" && score === null && (
                      <div className="bg-white rounded-lg p-4 border border-green-200">
                        <div className="flex items-center justify-between text-left">
                          <p className="text-gray-700 font-medium flex-1 mr-4 text-left">
                            {zeroQuestions[currentZeroIndex]}
                          </p>
                          <div className="flex gap-2 flex-shrink-0">
                            <button
                              onClick={() => handleZeroAnswer("yes")}
                              className="px-4 py-2 rounded-lg font-medium transition-all bg-gray-100 text-gray-700 hover:bg-gray-200"
                            >
                              Yes
                            </button>
                            <button
                              onClick={() => handleZeroAnswer("no")}
                              className="px-4 py-2 rounded-lg font-medium transition-all bg-gray-100 text-gray-700 hover:bg-gray-200"
                            >
                              No
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Right Box - 1 Examples (Yellow) */}
              {(currentSection === "one" || currentSection === "frequency" || oneExamples.some(answer => answer !== undefined) || score !== null) && (
                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-yellow-800 mb-4 flex items-center">
                    <span className="w-6 h-6 bg-yellow-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-2">1</span>
                    Does {getPronoun("subject")}...
                  </h3>
                  <div className="space-y-4">
                    {/* Show answered questions */}
                    {oneQuestions.map((question, index) => (
                      oneExamples[index] !== undefined && (
                        <div key={index} className="bg-white rounded-lg p-4 border border-yellow-200">
                          <div className="flex items-center justify-between text-left">
                            <p className="text-gray-700 font-medium flex-1 mr-4 text-left">{question}</p>
                            <div className={`px-4 py-2 rounded-lg font-medium ${oneExamples[index] === "yes"
                                ? "bg-yellow-500 text-white"
                                : "bg-red-500 text-white"
                              }`}>
                              {oneExamples[index] === "yes" ? "Yes" : "No"}
                            </div>
                          </div>
                        </div>
                      )
                    ))}

                    {/* Show current question if it's a one question and score is null */}
                    {currentSection === "one" && score === null && (
                      <div className="bg-white rounded-lg p-4 border border-yellow-200">
                        <div className="flex items-center justify-between text-left">
                          <p className="text-gray-700 font-medium flex-1 mr-4 text-left">
                            {oneQuestions[currentOneIndex]}
                          </p>
                          <div className="flex gap-2 flex-shrink-0">
                            <button
                              onClick={() => handleOneAnswer("yes")}
                              className="px-4 py-2 rounded-lg font-medium transition-all bg-gray-100 text-gray-700 hover:bg-gray-200"
                            >
                              Yes
                            </button>
                            <button
                              onClick={() => handleOneAnswer("no")}
                              className="px-4 py-2 rounded-lg font-medium transition-all bg-gray-100 text-gray-700 hover:bg-gray-200"
                            >
                              No
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Show frequency question if needed */}
                    {currentSection === "frequency" && score === null && (
                      <div className="bg-white rounded-lg p-4 border border-yellow-200">
                        <div className="flex items-center justify-between text-left">
                          <p className="text-gray-700 font-medium flex-1 mr-4 text-left">
                            Does this happen more than twice a week?
                          </p>
                          <div className="flex gap-2 flex-shrink-0">
                            <button
                              onClick={() => handleFrequencyAnswer("yes")}
                              className="px-4 py-2 rounded-lg font-medium transition-all bg-gray-100 text-gray-700 hover:bg-gray-200"
                            >
                              Yes
                            </button>
                            <button
                              onClick={() => handleFrequencyAnswer("no")}
                              className="px-4 py-2 rounded-lg font-medium transition-all bg-gray-100 text-gray-700 hover:bg-gray-200"
                            >
                              No
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Show frequency answer if completed */}
                    {frequencyAnswer !== null && score !== null && (
                      <div className="bg-white rounded-lg p-4 border border-yellow-200">
                        <div className="flex items-center justify-between text-left">
                          <p className="text-gray-700 font-medium flex-1 mr-4 text-left">
                            Does this happen more than twice a week?
                          </p>
                          <div className={`px-4 py-2 rounded-lg font-medium ${frequencyAnswer === "yes"
                              ? "bg-yellow-500 text-white"
                              : "bg-red-500 text-white"
                            }`}>
                            {frequencyAnswer === "yes" ? "Yes" : "No"}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
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
            
            {/* Reset Question Button - Only show if question is completed */}
            {existingResult?.completed && (
              <button
                onClick={handleResetQuestion}
                className="px-4 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-all flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Retry Question
              </button>
            )}
            
            <button
              onClick={handleNext}
              disabled={score === null || (mainAnswer === "yes" && !examplesSaved && !noExamplesChecked)}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                score !== null && (mainAnswer !== "yes" || examplesSaved || noExamplesChecked)
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-lg"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Reset Question 5
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to reset this question? This will clear all your answers and you'll need to answer the question again.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={handleCancelReset}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-400 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmReset}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-all"
                >
                  Reset Question
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Question5; 
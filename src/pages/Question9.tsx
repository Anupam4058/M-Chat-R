import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { saveQuestionResult, clearQuestionResult } from "../redux/Action";
import { RootState } from "../redux/Store";

const Question9: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Get child info and question results from Redux store
  const childInfo = useSelector((state: RootState) => (state as any).childInfo);
  const questionResults = useSelector((state: RootState) => (state as any).questionResults);
  const childName = childInfo?.childName || "your child";

  // Find existing result for this question
  const existingResult = questionResults?.find((result: any) => result.questionId === 9);
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

  // State for follow-up question
  const [followUpAnswer, setFollowUpAnswer] = useState<"yes" | "no" | null>(null);

  // State for current section
  const [currentSection, setCurrentSection] = useState<"main" | "example" | "sub" | "followup">("main");

  // State for example box
  const [userExample, setUserExample] = useState<string>("");
  const [examplesSaved, setExamplesSaved] = useState<boolean>(false);
  const [noExamplesChecked, setNoExamplesChecked] = useState<boolean>(false);

  // Reset state variables
  const [showResetModal, setShowResetModal] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const subQuestions = [
    "A picture or toy just to show you?",
    `A drawing ${getPronoun("subject")} has done?`,
    `A flower ${getPronoun("subject")} has picked?`,
    `A bug ${getPronoun("subject")} has found in the grass?`,
    `A few blocks ${getPronoun("subject")} has put together?`
  ];

  // Effect to restore state from existing result
  useEffect(() => {
    if (existingResult?.completed && !isResetting) {
      // Restore main answer
      setMainAnswer(existingResult.mainAnswer);
      
      // Restore user example if it exists
      if (existingResult.userExample) {
        if (existingResult.userExample === "No examples provided") {
          setNoExamplesChecked(true);
          setExamplesSaved(true);
        } else {
          setUserExample(existingResult.userExample);
          setExamplesSaved(true);
        }
      }
      
      // Restore sub-answers and follow-up
      const savedSubAnswers = existingResult.subAnswers || [];
      const subAnswersCount = subQuestions.length;
      
      const subAns = savedSubAnswers.slice(0, subAnswersCount) as ("yes" | "no")[];
      const followUp = savedSubAnswers[subAnswersCount] as "yes" | "no" | null;
      
      setSubAnswers(subAns);
      if (followUp) setFollowUpAnswer(followUp);
      
      // Restore the result score
      const finalScore = existingResult.result === "pass" ? 0 : 1;
      setScore(finalScore);
    }
  }, [existingResult, subQuestions.length]);

  // Auto-proceed to questions when example is saved or checkbox is checked
  useEffect(() => {
    if (mainAnswer === "yes" && (examplesSaved || noExamplesChecked) && currentSection === "example") {
      setCurrentSection("sub");
    }
  }, [examplesSaved, noExamplesChecked, mainAnswer, currentSection]);

  // Calculate score based on flowchart logic
  useEffect(() => {
    // Check if we have all necessary answers
    const subComplete = subAnswers.length === subQuestions.length && 
                       subAnswers.every(answer => answer !== undefined && answer !== null);
    
    if (subComplete) {
      const yesCount = subAnswers.filter(answer => answer === "yes").length;
      
      if (yesCount === 0) {
        // "No to all of the above" - immediate FAIL
        setScore(1); // FAIL
      } else if (yesCount > 0 && followUpAnswer !== null) {
        // "Yes to any of the above" - check follow-up answer
        if (followUpAnswer === "yes") {
          setScore(0); // PASS
        } else {
          setScore(1); // FAIL
        }
      }
    }
  }, [mainAnswer, subAnswers, followUpAnswer, subQuestions.length]);

  // Save result when score is calculated
  useEffect(() => {
    if (score !== null) {
      const result = score === 0 ? "pass" : "fail";
      const allSubAnswers = [...subAnswers];
      if (followUpAnswer !== null) {
        allSubAnswers.push(followUpAnswer);
      }
      
      // Determine what user example to save
      let exampleToSave: string | undefined;
      if (userExample.trim() !== "") {
        exampleToSave = userExample;
      } else if (noExamplesChecked) {
        exampleToSave = "No examples provided";
      }
      
      dispatch(
        saveQuestionResult(
          9,
          result,
          mainAnswer || "no",
          allSubAnswers,
          undefined, // mostOften parameter
          exampleToSave // Save user example or "No examples provided"
        )
      );
    }
  }, [score, mainAnswer, subAnswers, followUpAnswer, userExample, noExamplesChecked, dispatch]);

  const handleMainAnswer = (answer: "yes" | "no") => {
    setMainAnswer(answer);
    setScore(null);
    // Initialize subAnswers array with undefined values for all questions
    setSubAnswers(new Array(subQuestions.length).fill(undefined));
    setFollowUpAnswer(null);
    setCurrentQuestionIndex(0);
    
    if (answer === "yes") {
      setCurrentSection("example");
    } else {
      setCurrentSection("sub");
    }
  };

  const handleSubAnswer = (answer: "yes" | "no") => {
    const newSubAnswers = [...subAnswers];
    newSubAnswers[getAnsweredCount()] = answer;
    setSubAnswers(newSubAnswers);
    
    // Auto-advance to next question or check if we need follow-up
    if (getAnsweredCount() < subQuestions.length - 1) {
      // Continue to next question automatically
    } else {
      // All questions answered, check if we need follow-up
      const allAnswered = newSubAnswers.every(answer => answer !== undefined && answer !== null);
      if (allAnswered) {
        // Check if any sub-questions were answered "Yes"
        const yesCount = newSubAnswers.filter(answer => answer === "yes").length;
        
        if (yesCount > 0) {
          // If any sub-question is "Yes", proceed to follow-up question
          setCurrentSection("followup");
        } else {
          // If all sub-questions are "No", we can calculate score immediately
          // The useEffect will handle the scoring
        }
      }
    }
  };

  const handleFollowUpAnswer = (answer: "yes" | "no") => {
    setFollowUpAnswer(answer);
  };

  const handleNextQuestion = () => {
    if (currentSection === "sub" && currentQuestionIndex < subQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentSection === "sub" && currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    } else if (currentSection === "followup") {
      setCurrentSection("sub");
      setCurrentQuestionIndex(subQuestions.length - 1);
    }
  };

  const handleNext = () => {
    navigate("/question/10");
  };

  const handlePrev = () => {
    navigate("/question/8");
  };

  // Reset handlers
  const handleResetQuestion = () => {
    setShowResetModal(true);
  };

  const handleConfirmReset = () => {
    setIsResetting(true);
    
    // Clear all state
    setMainAnswer(null);
    setSubAnswers([]);
    setScore(null);
    setCurrentQuestionIndex(0);
    setFollowUpAnswer(null);
    setCurrentSection("main");
    setUserExample("");
    setExamplesSaved(false);
    setNoExamplesChecked(false);
    
    // Clear from Redux store
    dispatch(clearQuestionResult(9));
    
    // Close modal
    setShowResetModal(false);
    
    // Reset the resetting flag after a short delay
    setTimeout(() => setIsResetting(false), 100);
  };

  const handleCancelReset = () => {
    setShowResetModal(false);
  };

  // Function to save user example immediately
  const saveUserExample = () => {
    if (userExample.trim() !== "") {
      setExamplesSaved(true);
      console.log('Saving example:', userExample);
      
      // Only save to Redux if we have a complete result
      if (score !== null) {
        const result = score === 0 ? "pass" : "fail";
        const allSubAnswers = [...subAnswers];
        if (followUpAnswer !== null) {
          allSubAnswers.push(followUpAnswer);
        }
        
        dispatch(
          saveQuestionResult(
            9,
            result,
            mainAnswer || "no",
            allSubAnswers,
            undefined,
            userExample
          )
        );
      }
    }
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
        <div className="max-w-5xl mx-auto bg-white/80 rounded-2xl shadow-2xl p-6 md:p-8">
          
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-600">Question 9 of 20</span>
              <span className="text-sm font-medium text-gray-600">45%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full" style={{ width: '45%' }}></div>
            </div>
          </div>

          {/* Main Question */}
          <div className="mb-8">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full flex items-center justify-center font-bold text-xl mr-4">
                9
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                Does {childName} show you things by bringing them to you or holding them up for you to see? Not just to get help, but to share?
              </h1>
            </div>
            
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

          {/* Example Box for Yes path */}
          {mainAnswer === "yes" && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800 font-semibold mb-4">
                Please give me an example of something {childName} might bring to show you or hold up for you to see.
              </p>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left side - Description */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-blue-800 mb-2">
                    Description:
                  </h4>
                  <p className="text-sm text-gray-700">
                    Describe something {childName} might bring to show you:
                  </p>
                  
                  {/* Info button below description */}
                  <div className="inline-flex items-center gap-3 bg-blue-50 text-blue-800 px-4 py-2 rounded-lg border border-blue-200 shadow-sm">
                    <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold">i</span>
                    </div>
                    <span className="text-xs text-blue-700">
                      This helps us understand {childName}'s sharing behaviors.
                    </span>
                  </div>
                </div>

                {/* Right side - Input field */}
                <div className="space-y-3">
                  <textarea
                    id="userExample"
                    value={userExample}
                    onChange={(e) => setUserExample(e.target.value)}
                    placeholder="For example: Brings toys, drawings, flowers, or other items to show you?"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                      score !== null 
                        ? "border-gray-300 bg-gray-50 text-gray-600 cursor-not-allowed" 
                        : "border-blue-300"
                    }`}
                    rows={6}
                    disabled={score !== null}
                  />
                  
                  {/* Save button and checkbox row */}
                  <div className="flex items-center justify-between">
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
                          } else {
                            // When checked, mark as saved and save to Redux
                            setExamplesSaved(true);
                            // Save empty example to indicate "no examples"
                            const allSubAnswers = [...subAnswers];
                            if (followUpAnswer !== null) {
                              allSubAnswers.push(followUpAnswer);
                            }
                            // Only save to Redux if we have a complete result
                            if (score !== null) {
                              const result = score === 0 ? "pass" : "fail";
                              dispatch(
                                saveQuestionResult(
                                  9,
                                  result,
                                  mainAnswer || "no",
                                  allSubAnswers,
                                  undefined,
                                  "No examples provided"
                                )
                              );
                            }
                          }
                        }}
                        disabled={score !== null}
                        className={`w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 ${
                          score !== null ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                      />
                      <label htmlFor="noExamples" className="text-sm text-gray-700">
                        I don't have any examples
                      </label>
                    </div>
                    
                    {/* Save button */}
                    <button
                      onClick={saveUserExample}
                      disabled={userExample.trim() === "" || score !== null}
                      className={`px-4 py-2 text-sm rounded-md transition-colors shadow-sm ${
                        userExample.trim() === "" || score !== null
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed" 
                          : "bg-blue-500 text-white hover:bg-blue-600"
                      }`}
                    >
                      {examplesSaved ? "Saved ✓" : "Save"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sub-Questions Section */}
          {(currentSection === "sub" || currentSection === "followup" || score !== null) && (
            <div className="mb-6">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-gray-700">
                  Does {childName} sometimes bring you...
                </h3>
              </div>
              
              {/* Questions Box */}
              <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-6">
                {/* All Answered Questions - Always show all answered questions */}
                {subQuestions.map((question, index) => {
                  if (subAnswers[index] !== null && subAnswers[index] !== undefined) {
                    return (
                      <div key={index} className="flex items-center justify-between bg-white rounded-lg p-4 border border-purple-200 mb-3">
                        <span className="text-gray-700 font-medium text-md">
                          {index + 1}. {question}
                        </span>
                        <div className="px-4 py-2 rounded-lg text-md font-semibold bg-gradient-to-r from-purple-500 to-indigo-500 text-white border-purple-500 shadow-lg">
                          {subAnswers[index] === "yes" ? "YES" : "NO"}
                        </div>
                      </div>
                    );
                  }
                  return null;
                })}
                
                {/* Current Question - Show only if not all questions are answered */}
                {getAnsweredCount() < subQuestions.length && (
                  <div className="flex items-center justify-between bg-white rounded-lg p-4 border border-purple-200 mb-3">
                    <span className="text-gray-700 font-medium text-md">
                      {getAnsweredCount() + 1}. {subQuestions[getAnsweredCount()]}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSubAnswer("yes")}
                        className="px-4 py-2 rounded-lg text-md font-semibold transition-all border-2 bg-white text-gray-700 border-purple-200 hover:border-purple-300 hover:bg-purple-50"
                      >
                        YES
                      </button>
                      <button
                        onClick={() => handleSubAnswer("no")}
                        className="px-4 py-2 rounded-lg text-md font-semibold transition-all border-2 bg-white text-gray-700 border-purple-200 hover:border-purple-300 hover:bg-purple-50"
                      >
                        NO
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Follow-up Question Box */}
          {(currentSection === "followup" || followUpAnswer !== null) && (
            <div className="mb-6">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-gray-700">
                  Follow-up Question
                </h3>
              </div>
              
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
                {/* Show the follow-up question */}
                <div className="flex items-center justify-between bg-white rounded-lg p-4 border border-blue-200 mb-3">
                  <span className="text-gray-700 font-medium text-md">
                    Is this sometimes just to show you, not to get help?
                  </span>
                  {followUpAnswer !== null ? (
                    <div className="px-4 py-2 rounded-lg text-md font-semibold bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-blue-500 shadow-lg">
                      {followUpAnswer === "yes" ? "YES" : "NO"}
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleFollowUpAnswer("yes")}
                        className="px-4 py-2 rounded-lg text-md font-semibold transition-all border-2 bg-white text-gray-700 border-blue-200 hover:border-blue-300 hover:bg-blue-50"
                      >
                        YES
                      </button>
                      <button
                        onClick={() => handleFollowUpAnswer("no")}
                        className="px-4 py-2 rounded-lg text-md font-semibold transition-all border-2 bg-white text-gray-700 border-blue-200 hover:border-blue-300 hover:bg-blue-50"
                      >
                        NO
                      </button>
                    </div>
                  )}
                </div>
              </div>
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
            
            {/* Reset Question Button - Only show if all questions are answered */}
            {score !== null && (
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
                Reset Question 9
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

export default Question9; 
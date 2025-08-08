import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { saveComplexQuestionResult, clearQuestionResult } from "../redux/Action";
import { RootState } from "../redux/Store";

const Question18: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Get child info and question results from Redux store
  const childInfo = useSelector((state: RootState) => (state as any).childInfo);
  const questionResults = useSelector((state: RootState) => (state as any).questionResults);
  const childName = childInfo?.childName || "your child";

  // Find existing result for this question
  const existingResult = questionResults?.find((result: any) => result.questionId === 18);
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
  const [situationalClueAnswer, setSituationalClueAnswer] = useState<"yes" | "no" | null>(null);
  const [dinnertimeAnswer, setDinnertimeAnswer] = useState<"yes" | "no" | null>(null);
  const [commandAnswers, setCommandAnswers] = useState<("yes" | "no")[]>([]);
  const [score, setScore] = useState<0 | 1 | null>(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  // State for one-by-one display
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentSection, setCurrentSection] = useState<"main" | "example" | "situational" | "dinnertime" | "commands">("main");
  const [userExample, setUserExample] = useState<string>("");
  const [examplesSaved, setExamplesSaved] = useState<boolean>(false);
  const [noExamplesChecked, setNoExamplesChecked] = useState<boolean>(false);

  const commandQuestions = [
    `If you say, "Show me your shoe" without pointing, making gestures, or giving hints (when you are not going out or getting dressed), does ${childName} show you ${getPronoun("possessive")} shoe?`,
    `If you say, "Bring me the blanket" or ask for another object without pointing, making gestures, or giving hints, does ${childName} bring it to you?`,
    `If you say, "Put the book on the chair" without pointing, making gestures, or giving any other hints, does ${childName} put the book on the chair?`
  ];

  // Restore any existing answer from Redux store
  useEffect(() => {
    if (isResetting) return;
    if (existingResult?.completed) {
      setIsRestoring(true);
      // Restore main answer
      setMainAnswer(existingResult.mainAnswer);
      

      
      // Restore situational clue answer
      if (existingResult.situationalClueAnswer !== undefined) {
        setSituationalClueAnswer(existingResult.situationalClueAnswer);
      }
      
      // Restore dinnertime answer
      if (existingResult.dinnertimeAnswer !== undefined) {
        setDinnertimeAnswer(existingResult.dinnertimeAnswer);
      }
      
      // Restore command answers
      if (existingResult.commandAnswers && Array.isArray(existingResult.commandAnswers)) {
        setCommandAnswers(existingResult.commandAnswers);
      }
      
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
      
      // Restore the result score
      const finalScore = existingResult.result === "pass" ? 0 : 1;
      setScore(finalScore);
      
      // Set current section based on what's been answered
      if (commandAnswers.some(answer => answer !== null)) {
        setCurrentSection("commands");
        const nextUnansweredIndex = commandAnswers.findIndex(answer => answer === null);
        setCurrentQuestionIndex(nextUnansweredIndex >= 0 ? nextUnansweredIndex : commandQuestions.length);
      } else if (dinnertimeAnswer !== null) {
        setCurrentSection("dinnertime");
      } else if (situationalClueAnswer !== null) {
        setCurrentSection("situational");
      }
      
      setTimeout(() => setIsRestoring(false), 100);
    } else if (existingResult === null || existingResult === undefined) {
      setMainAnswer(null);
      setSituationalClueAnswer(null);
      setDinnertimeAnswer(null);
      setCommandAnswers([]);
      setScore(null);
      setCurrentQuestionIndex(0);
      setCurrentSection("main");
      setUserExample("");
      setExamplesSaved(false);
      setNoExamplesChecked(false);
    }
  }, [existingResult, isResetting, commandQuestions.length]);

  // Auto-proceed from example to situational when requirement is met
  useEffect(() => {
    if (mainAnswer === "yes" && currentSection === "example" && (examplesSaved || noExamplesChecked)) {
      setCurrentSection("situational");
    }
  }, [mainAnswer, currentSection, examplesSaved, noExamplesChecked]);

  // Calculate score based on flowchart logic
  useEffect(() => {
    if (isRestoring) return;
    if (mainAnswer === "yes") {
      // "Yes" to main question → Continue to situational questions
      if (situationalClueAnswer !== null) {
        if (situationalClueAnswer === "yes") {
          // Situational clue "Yes" → Check commands directly (skip dinnertime)
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
          // Situational clue "Yes" → Check commands directly (skip dinnertime)
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
  }, [mainAnswer, situationalClueAnswer, dinnertimeAnswer, commandAnswers, commandQuestions.length, isRestoring]);

  // Save result when score is calculated
  useEffect(() => {
    if (isRestoring) return;
    if (score !== null) {
      const result = score === 0 ? "pass" : "fail";
      const complexData = {
        situationalClueAnswer,
        dinnertimeAnswer,
        commandAnswers,
        userExample: noExamplesChecked ? "No examples provided" : (userExample || undefined)
      };
      
      dispatch(
        saveComplexQuestionResult(
          18,
          result,
          mainAnswer || "no",
          complexData
        )
      );
    }
  }, [score, mainAnswer, situationalClueAnswer, dinnertimeAnswer, commandAnswers, userExample, noExamplesChecked, dispatch, isRestoring]);

  const handleMainAnswer = (answer: "yes" | "no") => {
    setMainAnswer(answer);
    setScore(null);
    
    // Reset all sub-question responses when main answer changes
    setSituationalClueAnswer(null);
    setDinnertimeAnswer(null);
    setCommandAnswers([]);
    setCurrentQuestionIndex(0);
    setUserExample("");
    setExamplesSaved(false);
    setNoExamplesChecked(false);
    
    if (answer === "yes") {
      // "Yes" leads to example evaluation
      setCurrentSection("example");
    } else {
      // "No" leads to situational questions
      setCurrentSection("situational");
    }
  };



  const handleSituationalAnswer = (answer: "yes" | "no") => {
    setSituationalClueAnswer(answer);
    if (answer === "yes") {
      // Situational clue "Yes" → Go directly to command questions
      setCommandAnswers(new Array(commandQuestions.length).fill(null));
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
      setCommandAnswers(new Array(commandQuestions.length).fill(null));
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

  const handleResetQuestion = () => {
    setShowResetModal(true);
  };

  const handleConfirmReset = () => {
    setIsResetting(true);
    dispatch(clearQuestionResult(18));
    setMainAnswer(null);
    setSituationalClueAnswer(null);
    setDinnertimeAnswer(null);
    setCommandAnswers([]);
    setScore(null);
    setCurrentQuestionIndex(0);
    setCurrentSection("main");
    setUserExample("");
    setExamplesSaved(false);
    setNoExamplesChecked(false);
    setShowResetModal(false);
    setTimeout(() => setIsResetting(false), 100);
  };

  const handleCancelReset = () => {
    setShowResetModal(false);
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
      return commandAnswers.filter(answer => answer !== null).length;
    }
    return 0;
  };

  const getTotalQuestions = () => {
    if (currentSection === "commands") {
      return commandQuestions.length;
    }
    return 0;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-indigo-200">
      <style>
        {`
          @keyframes fadeInBounce {
            0% { opacity: 0; transform: translateY(-20px); }
            50% { opacity: 1; transform: translateY(5px); }
            100% { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto bg-white/80 rounded-2xl shadow-2xl p-6 md:p-8">
          
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-600">Question 18 of 20</span>
              <span className="text-sm font-medium text-gray-600">90%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full" style={{ width: '90%' }}></div>
            </div>
          </div>

          {/* Main Question */}
          <div className="mb-8">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full flex items-center justify-center font-bold text-xl mr-4">
                18
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                Does {childName} understand when you tell {getPronoun("object")} to do something?
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

          {/* Example Box for Yes answers */}
          {mainAnswer === "yes" && (currentSection === "example" || (examplesSaved || noExamplesChecked)) && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800 font-semibold mb-4">
                Please give me an example of how you know {getPronoun("subject")} understands you.
              </p>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left side - Description */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-blue-800 mb-2">
                    Description:
                  </h4>
                  <p className="text-sm text-gray-700">
                    Describe {childName}'s behavior when following commands:
                  </p>
                  
                  {/* Info button below description */}
                  <div className="inline-flex items-center gap-3 bg-blue-50 text-blue-800 px-4 py-2 rounded-lg border border-blue-200 shadow-sm">
                    <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold">i</span>
                    </div>
                    <span className="text-xs text-blue-700">
                      This helps us understand {childName}'s specific command understanding behaviors.
                    </span>
                  </div>
                </div>

                {/* Right side - Input field */}
                <div className="space-y-3">
                  <textarea
                    id="userExample"
                    value={userExample}
                    onChange={(e) => setUserExample(e.target.value)}
                    placeholder="For example: 'When I ask him to bring his shoes, he goes and gets them'"
                    className={`w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                      score !== null ? 'bg-gray-100 cursor-not-allowed' : ''
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
                          }
                        }}
                        className={`w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 ${
                          score !== null ? 'cursor-not-allowed opacity-50' : ''
                        }`}
                        disabled={score !== null}
                      />
                      <label htmlFor="noExamples" className="text-sm text-gray-700">
                        I don't have any examples
                      </label>
                    </div>
                    
                    {/* Save button */}
                    <button
                      onClick={() => {
                        // Save the example and set saved state
                        if (userExample.trim() !== "") {
                          setExamplesSaved(true);
                          console.log('Saving example:', userExample);
                        }
                      }}
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

            {/* Instructions situational-questions */}
          {(currentSection === "situational" || situationalClueAnswer !== null) && (
            <div className="text-center mb-4">
               <h3 className="text-lg font-semibold text-gray-700">
                 When the situation gives {getPronoun("object")} a clue, can {getPronoun("subject")} follow a command?
               </h3>
             </div>
          )}

          {/* Layered Questions Section */}
          {(currentSection === "situational" || currentSection === "dinnertime" || situationalClueAnswer !== null || dinnertimeAnswer !== null) && (
            <div className="mb-6">
              {/* Show answered questions as completed boxes first */}
              {situationalClueAnswer !== null && (
                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-4">
                  {/* <div className="flex items-center justify-between bg-white rounded-lg p-4 border border-blue-200 mb-3">
                    <span className="text-gray-700 font-medium text-md">
                      When the situation gives {getPronoun("object")} a clue, can {getPronoun("subject")} follow a command?
                    </span>
                    <div className="px-4 py-2 rounded-lg text-md font-semibold bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-blue-500 shadow-lg">
                      {situationalClueAnswer === "yes" ? "YES" : "NO"}
                    </div>
                  </div> */}
                  <div className="flex items-center justify-between bg-white rounded-lg p-4 border border-blue-200 mb-3">
                    <span className="text-gray-700 font-medium text-md">
                      For example when you are dressed to go out and you tell {getPronoun("object")} to get {getPronoun("possessive")} shoes, does {getPronoun("subject")} understand?
                    </span>
                    <div className="px-4 py-2 rounded-lg text-md font-semibold bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-blue-500 shadow-lg">
                      {situationalClueAnswer === "yes" ? "YES" : "NO"}
                    </div>
                  </div>
                </div>
              )}

              {dinnertimeAnswer !== null && (
                <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-6 mb-4">
                  <div className="flex items-center justify-between bg-white rounded-lg p-4 border border-purple-200 mb-3">
                    <span className="text-gray-700 font-medium text-md">
                      If it is dinnertime and food is on the table, and you tell the child to sit down, will {getPronoun("subject")} come sit at the table?
                    </span>
                    <div className="px-4 py-2 rounded-lg text-md font-semibold bg-gradient-to-r from-purple-500 to-indigo-500 text-white border-purple-500 shadow-lg">
                      {dinnertimeAnswer === "yes" ? "YES" : "NO"}
                    </div>
                  </div>
                </div>
              )}

              {/* Layer 1: Situational Clue Question */}
              {situationalClueAnswer === null && (currentSection === "situational" || (mainAnswer === "yes" && (examplesSaved || noExamplesChecked))) && (
                <div className="mb-6">
                  {/* <div className="text-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-700">
                      First Follow-up Question
                    </h3>
                  </div> */}
                  
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
                    {/* <div className="flex items-center justify-between bg-white rounded-lg p-4 border border-blue-200 mb-3">
                      <span className="text-gray-700 font-medium text-md">
                        When the situation gives {getPronoun("object")} a clue, can {getPronoun("subject")} follow a command?
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSituationalAnswer("yes")}
                          className="px-4 py-2 rounded-lg text-md font-semibold transition-all border-2 bg-white text-gray-700 border-blue-200 hover:border-blue-300 hover:bg-blue-50"
                        >
                          YES
                        </button>
                        <button
                          onClick={() => handleSituationalAnswer("no")}
                          className="px-4 py-2 rounded-lg text-md font-semibold transition-all border-2 bg-white text-gray-700 border-blue-200 hover:border-blue-300 hover:bg-blue-50"
                        >
                          NO
                        </button>
                      </div>
                    </div> */}
                    <div className="flex items-center justify-between bg-white rounded-lg p-4 border border-blue-200 mb-3">
                      <span className="text-gray-700 font-medium text-md">
                        For example when you are dressed to go out and you tell {getPronoun("object")} to get {getPronoun("possessive")} shoes, does {getPronoun("subject")} understand?
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSituationalAnswer("yes")}
                          className="px-4 py-2 rounded-lg text-md font-semibold transition-all border-2 bg-white text-gray-700 border-blue-200 hover:border-blue-300 hover:bg-blue-50"
                        >
                          YES
                        </button>
                        <button
                          onClick={() => handleSituationalAnswer("no")}
                          className="px-4 py-2 rounded-lg text-md font-semibold transition-all border-2 bg-white text-gray-700 border-blue-200 hover:border-blue-300 hover:bg-blue-50"
                        >
                          NO
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Layer 2: Dinnertime Question */}
              {situationalClueAnswer === "no" && dinnertimeAnswer === null && (currentSection === "dinnertime" || (mainAnswer === "yes" && (examplesSaved || noExamplesChecked))) && (
                <div className="mb-6">
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-700">
                      First Follow-up Question
                    </h3>
                  </div>
                  
                  <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-6">
                    <div className="flex items-center justify-between bg-white rounded-lg p-4 border border-purple-200 mb-3">
                      <span className="text-gray-700 font-medium text-md">
                        If it is dinnertime and food is on the table, and you tell the child to sit down, will {getPronoun("subject")} come sit at the table?
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDinnertimeAnswer("yes")}
                          className="px-4 py-2 rounded-lg text-md font-semibold transition-all border-2 bg-white text-gray-700 border-purple-200 hover:border-purple-300 hover:bg-purple-50"
                        >
                          YES
                        </button>
                        <button
                          onClick={() => handleDinnertimeAnswer("no")}
                          className="px-4 py-2 rounded-lg text-md font-semibold transition-all border-2 bg-white text-gray-700 border-purple-200 hover:border-purple-300 hover:bg-purple-50"
                        >
                          NO
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Command Questions Section */}
          {(currentSection === "commands" || commandAnswers.some(answer => answer !== null)) && (
            <div className="mb-6">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-gray-700">
                  When the situation does not give any clues, can {getPronoun("subject")} follow a command?
                </h3>
              </div>
              
              {/* Box Container for Command Questions */}
              <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-6">
                {/* All Answered Command Questions */}
                {commandQuestions.map((question, idx) => {
                  if (commandAnswers[idx] !== null && commandAnswers[idx] !== undefined) {
                    return (
                      <div key={idx} className="flex items-center justify-between bg-white rounded-lg p-4 border border-purple-200 mb-3">
                        <span className="text-gray-700 font-medium text-md">
                          {idx + 1}. {question}
                        </span>
                        <div className={`px-4 py-2 rounded-lg text-md font-semibold ${commandAnswers[idx] === "yes" ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white" : "bg-gradient-to-r from-purple-500 to-indigo-500 text-white"}`}>
                          {commandAnswers[idx] === "yes" ? "YES" : "NO"}
                        </div>
                      </div>
                    );
                  }
                  return null;
                })}

                {/* Current Command Question - Show only if current question is not answered */}
                {commandAnswers[currentQuestionIndex] === null && (
                  <div className="flex items-center justify-between bg-white rounded-lg p-4 border border-purple-200 mb-3">
                    <span className="text-gray-700 font-medium text-md">
                      {currentQuestionIndex + 1}. {getCurrentQuestion()}
                    </span>
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleCommandAnswer("yes")}
                        className="px-4 py-2 rounded-lg text-md font-semibold transition-all border-2 bg-white text-gray-700 border-purple-400 hover:border-purple-500 hover:bg-purple-50"
                      >
                        YES
                      </button>
                      <button
                        onClick={() => handleCommandAnswer("no")}
                        className="px-4 py-2 rounded-lg text-md font-semibold transition-all border-2 bg-white text-gray-700 border-purple-400 hover:border-purple-500 hover:bg-purple-50"
                      >
                        NO
                      </button>
                    </div>
                  </div>
                )}
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
              disabled={score === null}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${score !== null
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
                Reset Question 18
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

export default Question18; 
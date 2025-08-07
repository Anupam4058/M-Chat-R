import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { saveQuestionResult, clearQuestionResult } from "../redux/Action";
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
  const [score, setScore] = useState<0 | 1 | null>(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  // State for one-by-one display
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentSection, setCurrentSection] = useState<"main" | "example" | "attention">("main");
  const [userExample, setUserExample] = useState<string>("");
  const [examplesSaved, setExamplesSaved] = useState<boolean>(false);
  const [noExamplesChecked, setNoExamplesChecked] = useState<boolean>(false);

  const attentionQuestions = [
    'Say "Look!" or "Watch me!"?',
    "Babble or make a noise to get you to watch what he/she is doing?",
    "Look at you to get praise or comment?",
    "Keep looking to see if you are looking?"
  ];

  // Effect to restore state from existing result
  useEffect(() => {
    if (isResetting) return;
    if (existingResult?.completed) {
      setIsRestoring(true);
      setMainAnswer(existingResult.mainAnswer);
      
      // Restore attention answers from subAnswers array
      const subAnswers = existingResult.subAnswers || [];
      const attentionAnswers = subAnswers.slice(0, attentionQuestions.length) as ("yes" | "no")[];
      setAttentionAnswers(attentionAnswers);
      
      // Restore the result score
      const finalScore = existingResult.result === "pass" ? 0 : 1;
      setScore(finalScore);
      
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
      
      // Set current section based on what's been answered
      if (attentionAnswers.some(answer => answer !== null)) {
        setCurrentSection("attention");
        // Set current question index to the next unanswered question
        const nextUnansweredIndex = attentionAnswers.findIndex(answer => answer === null);
        setCurrentQuestionIndex(nextUnansweredIndex >= 0 ? nextUnansweredIndex : attentionQuestions.length);
      }
      
      setTimeout(() => setIsRestoring(false), 100);
    } else if (existingResult === null || existingResult === undefined) {
      setMainAnswer(null);
      setAttentionAnswers([]);
      setScore(null);
      setCurrentQuestionIndex(0);
      setCurrentSection("main");
      setUserExample("");
      setExamplesSaved(false);
      setNoExamplesChecked(false);
    }
  }, [existingResult, isResetting, attentionQuestions.length]);

  // Auto-proceed from example to attention when requirement is met
  useEffect(() => {
    if (mainAnswer === "yes" && currentSection === "example" && (examplesSaved || noExamplesChecked)) {
      setCurrentSection("attention");
    }
  }, [mainAnswer, currentSection, examplesSaved, noExamplesChecked]);

  // Calculate score based on flowchart logic
  useEffect(() => {
    if (isRestoring) return;
    if (mainAnswer !== null) {
      // Check if we have all necessary answers for attention questions
      const attentionComplete = attentionAnswers.length === attentionQuestions.length && 
                             attentionAnswers.every(answer => answer !== null);
      
      if (attentionComplete) {
        // Count "Yes" answers
        const yesCount = attentionAnswers.filter(answer => answer === "yes").length;
        
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
  }, [mainAnswer, attentionAnswers, attentionQuestions.length, isRestoring]);

  // Save result when score is calculated
  useEffect(() => {
    if (isRestoring) return;
    if (score !== null) {
      const result = score === 0 ? "pass" : "fail";
      const allSubAnswers: ("yes" | "no")[] = [...attentionAnswers];
      
      dispatch(
        saveQuestionResult(
          17,
          result,
          mainAnswer || "no",
          allSubAnswers,
          undefined,
          noExamplesChecked ? "No examples provided" : (userExample || undefined)
        )
      );
    }
  }, [score, mainAnswer, attentionAnswers, userExample, noExamplesChecked, dispatch, isRestoring]);

  const handleMainAnswer = (answer: "yes" | "no") => {
    setMainAnswer(answer);
    setScore(null);
    setCurrentQuestionIndex(0);
    
    if (answer === "yes") {
      // For "yes" answers, show example box first
      setCurrentSection("example");
      setUserExample("");
      setExamplesSaved(false);
      setNoExamplesChecked(false);
      setAttentionAnswers(new Array(attentionQuestions.length).fill(null));
    } else {
      // For "no" answers, go directly to attention scenarios
      setCurrentSection("attention");
      setAttentionAnswers(new Array(attentionQuestions.length).fill(null));
    }
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

  const handleResetQuestion = () => {
    setShowResetModal(true);
  };

  const handleConfirmReset = () => {
    setIsResetting(true);
    dispatch(clearQuestionResult(17));
    setMainAnswer(null);
    setAttentionAnswers([]);
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
      return attentionAnswers.filter(answer => answer !== null).length;
    }
    return 0;
  };

  const getTotalQuestions = () => {
    if (currentSection === "attention") {
      return attentionQuestions.length;
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
              <span className="text-sm font-medium text-gray-600">Question 17 of 20</span>
              <span className="text-sm font-medium text-gray-600">85%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full" style={{ width: '85%' }}></div>
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
                Please give me an example of when {childName} tries to get you to watch {getPronoun("object")}.
              </p>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left side - Description */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-blue-800 mb-2">
                    Description:
                  </h4>
                  <p className="text-sm text-gray-700">
                    Describe {childName}'s attention-seeking behavior:
                  </p>
                  
                  {/* Info button below description */}
                  <div className="inline-flex items-center gap-3 bg-blue-50 text-blue-800 px-4 py-2 rounded-lg border border-blue-200 shadow-sm">
                    <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold">i</span>
                    </div>
                    <span className="text-xs text-blue-700">
                      This helps us understand {childName}'s specific attention-seeking behaviors.
                    </span>
                  </div>
                </div>

                {/* Right side - Input field */}
                <div className="space-y-3">
                  <textarea
                    id="userExample"
                    value={userExample}
                    onChange={(e) => setUserExample(e.target.value)}
                    placeholder="For example: 'He says Look! and points to his drawing'"
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

          {/* Attention Seeking Scenarios Section */}
          {(currentSection === "attention" || attentionAnswers.some(answer => answer !== null)) && (
            <div className="mb-6">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-gray-700">
                  Does {getPronoun("subject")}...
                </h3>
              </div>
              
              {/* Box Container for Attention Questions */}
              <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-6">
                {/* Show all answered attention questions */}
                {attentionQuestions.map((question, idx) => {
                  if (attentionAnswers[idx] !== null && attentionAnswers[idx] !== undefined) {
                    return (
                      <div key={idx} className="flex items-center justify-between bg-white rounded-lg p-4 border border-purple-200 mb-3">
                        <span className="text-gray-700 font-medium text-md">
                          {idx + 1}. {question}
                        </span>
                        <div className={`px-4 py-2 rounded-lg text-md font-semibold ${attentionAnswers[idx] === "yes" ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white" : "bg-gradient-to-r from-purple-500 to-indigo-500 text-white"}`}>
                          {attentionAnswers[idx] === "yes" ? "YES" : "NO"}
                        </div>
                      </div>
                    );
                  }
                  return null;
                })}

                {/* Current Attention Question - Show only if current question is not answered */}
                {attentionAnswers[currentQuestionIndex] === null && (
                  <div className="flex items-center justify-between bg-white rounded-lg p-4 border border-purple-200 mb-3">
                    <span className="text-gray-700 font-medium text-md">
                      {currentQuestionIndex + 1}. {getCurrentQuestion()}
                    </span>
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleAttentionAnswer("yes")}
                        className="px-4 py-2 rounded-lg text-md font-semibold transition-all border-2 bg-white text-gray-700 border-purple-400 hover:border-purple-500 hover:bg-purple-50"
                      >
                        YES
                      </button>
                      <button
                        onClick={() => handleAttentionAnswer("no")}
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
                Reset Question 17
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

export default Question17; 
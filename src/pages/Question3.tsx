import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { saveQuestionResult, clearQuestionResult, saveComplexQuestionResult, UserExampleAudio } from "../redux/Action";
import { RootState } from "../redux/Store";
import { useReactMediaRecorder } from "react-media-recorder";

const Question3: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Get child info and question results from Redux store
  const childInfo = useSelector((state: RootState) => (state as any).childInfo);
  const questionResults = useSelector((state: RootState) => (state as any).questionResults);
  const childName = childInfo?.childName || "your child";

  // Find existing result for this question
  const existingResult = questionResults?.find((result: any) => result.questionId === 3);

  // State for main answer and sub-questions
  const [mainAnswer, setMainAnswer] = useState<"yes" | "no" | null>(null);
  const [subAnswers, setSubAnswers] = useState<("yes" | "no")[]>([]);
  const [score, setScore] = useState<0 | 1 | null>(null);

  // State for one-by-one display
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Reset state variables
  const [showResetModal, setShowResetModal] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  // State for no examples
  const [noExamplesChecked, setNoExamplesChecked] = useState<boolean>(false);
  const [examplesSaved, setExamplesSaved] = useState<boolean>(false);
  const [userExample, setUserExample] = useState<string>("");
  const [userExampleAudio, setUserExampleAudio] = useState<UserExampleAudio | null>(null);
  const [recordError, setRecordError] = useState<string | null>(null);
  const [recordStartTs, setRecordStartTs] = useState<number | null>(null);
  const [elapsedMs, setElapsedMs] = useState<number>(0);

  const { status, startRecording, stopRecording, mediaBlobUrl } = useReactMediaRecorder({ audio: true, video: false });
  const isRecording = status === "recording";

  useEffect(() => {
    let timer: any;
    if (isRecording && recordStartTs) {
      timer = setInterval(() => setElapsedMs(Date.now() - recordStartTs), 200);
    }
    return () => timer && clearInterval(timer);
  }, [isRecording, recordStartTs]);

  useEffect(() => {
    if (!isRecording) {
      setRecordStartTs(null);
    }
  }, [isRecording]);

  const blobToDataUrl = (blob: Blob): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

  useEffect(() => {
    const process = async () => {
      try {
        if (!mediaBlobUrl) return;
        const resp = await fetch(mediaBlobUrl);
        const blob = await resp.blob();
        const dataUrl = await blobToDataUrl(blob);
        const audio: UserExampleAudio = {
          dataUrl,
          mimeType: blob.type || "audio/webm",
          durationMs: elapsedMs,
          createdAt: new Date().toISOString(),
        };
        setUserExampleAudio(audio);
        setNoExamplesChecked(false);
      } catch (e) {
        setRecordError("Failed to prepare audio preview.");
      }
    };
    process();
  }, [mediaBlobUrl]);

  const handleMicClick = async () => {
    if (score !== null || examplesSaved || noExamplesChecked) return;
    setRecordError(null);
    try {
      if (!isRecording) {
        setRecordStartTs(Date.now());
        await startRecording();
      } else {
        await stopRecording();
      }
    } catch (e) {
      setRecordError("Microphone not available or permission denied.");
    }
  };
  

  const subQuestions = [
    "Pretend to drink from a toy cup?",
    "Pretend to eat from a toy spoon or fork?",
    "Pretend to talk on the telephone?",
    "Pretend to feed a doll or stuffed animal with real or imaginary food?",
    "Push a car as if it is going along a pretend road?",
    "Pretend to be a robot, an airplane, a ballerina, or any other favorite character?",
    "Put a toy pot on a pretend stove?",
    "Stir imaginary food?",
    "Put an action figure or doll into a car or truck as if it is the driver or passenger?",
    "Pretend to vacuum the rug, sweep the floor, or mow the lawn?"
  ];

  // Effect to restore state from existing result
  useEffect(() => {
    if (existingResult?.completed && !isResetting) {
      setIsRestoring(true);
      setMainAnswer(existingResult.mainAnswer);
      setSubAnswers(existingResult.subAnswers || []);
      const finalScore = existingResult.result === "pass" ? 0 : 1;
      setScore(finalScore);
      setUserExample(existingResult.userExample || "");
      setNoExamplesChecked(!!existingResult.noExamplesChecked);
      setExamplesSaved(!!existingResult.examplesSaved);
      if ((existingResult as any).userExampleAudio) {
        setUserExampleAudio((existingResult as any).userExampleAudio);
        setExamplesSaved(true);
      }
      setTimeout(() => setIsRestoring(false), 100);
    }
  }, [existingResult, isResetting]);

  // Calculate score based on flowchart logic
  useEffect(() => {
    if (mainAnswer !== null && subAnswers.length === subQuestions.length) {
      // Check if all questions are actually answered (no undefined values)
      const allAnswered = subAnswers.every(answer => answer !== undefined && answer !== null);
      
      if (allAnswered) {
        const yesCount = subAnswers.filter(answer => answer === "yes").length;
        
        // "Yes to any" = Score 0 (PASS), "No to all" = Score 1 (FAIL)
        if (yesCount > 0) {
          setScore(0); // PASS
        } else {
          setScore(1); // FAIL
        }
      }
    }
  }, [mainAnswer, subAnswers, subQuestions.length]);

  // Save result when score is calculated
  useEffect(() => {
    // Skip saving if we're restoring state
    if (isRestoring) {
      return;
    }
    
    if (score !== null) {
      const result = score === 0 ? "pass" : "fail";
      const complexData = {
        subAnswers,
        userExample,
        noExamplesChecked,
        examplesSaved,
        userExampleAudio: userExampleAudio || undefined
      };
      dispatch(
        saveComplexQuestionResult(
          3,
          result,
          mainAnswer || "no",
          complexData
        )
      );
    }
  }, [score, mainAnswer, subAnswers, dispatch, isRestoring, userExample, noExamplesChecked, examplesSaved]);

  const handleMainAnswer = (answer: "yes" | "no") => {
    setMainAnswer(answer);
    // Initialize subAnswers array with undefined values for all questions
    setSubAnswers(new Array(subQuestions.length).fill(undefined));
    setScore(null);
    setCurrentQuestionIndex(0);
  };

  const handleSubAnswer = (answer: "yes" | "no") => {
    const newSubAnswers = [...subAnswers];
    newSubAnswers[currentQuestionIndex] = answer;
    setSubAnswers(newSubAnswers);
    
    // Auto-advance to next question
    if (currentQuestionIndex < subQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < subQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleNext = () => {
    navigate("/question/4");
  };

  const handlePrev = () => {
    navigate("/question/2");
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
    setUserExample("");
    setUserExampleAudio(null);
    setNoExamplesChecked(false);
    setExamplesSaved(false);
    
    // Clear from Redux store
    dispatch(clearQuestionResult(3));
    
    // Close modal
    setShowResetModal(false);
    
    // Reset the resetting flag after a short delay
    setTimeout(() => setIsResetting(false), 100);
  };

  const handleCancelReset = () => {
    setShowResetModal(false);
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
    return currentQuestionIndex > 0;
  };

  const canGoNext = () => {
    return currentQuestionIndex < subQuestions.length - 1;
  };

  // Update the gating function
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
              <span className="text-sm font-medium text-gray-600">Question 3 of 20</span>
              <span className="text-sm font-medium text-gray-600">15%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full" style={{ width: '15%' }}></div>
            </div>
          </div>

          {/* Main Question */}
          <div className="mb-8">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full flex items-center justify-center font-bold text-xl mr-4">
                3
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 text-left">
                Does {childName} play pretend or make-believe?
              </h1>
            </div>
            <p className="text-gray-600 mb-6 italic">
              (pretend to drink from an empty cup, pretend to talk on a phone, or pretend to feed a doll or stuffed animal?)
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
          {mainAnswer === "yes" && (
            <div className="mb-6">
              <p className="text-gray-800 font-semibold mb-6 text-center text-lg">
                Please give me an example of how {childName} pretends to play.
              </p>
              
              <div className="space-y-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                {/* Labels positioned above the textarea in separate boxes */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Left side - Description box */}
                  <div className="bg-blue-100 border border-blue-200 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-gray-800 mb-2 text-left">
                      Describe {childName}'s behavior
                    </h4>
                    <p className="text-sm text-gray-900 text-left">
                      When he/she pretends to play:
                    </p>
                  </div>
                  
                  {/* Right side - Info button box */}
                  <div className="bg-blue-100 border border-blue-200 rounded-lg p-4 flex items-center gap-2">
                    <div className="w-5 h-5 bg-gray-800 text-white rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold">i</span>
                    </div>
                    <span className="text-xs text-gray-900 text-left">
                      This helps us understand {childName}'s specific responses to pretend play.
                    </span>
                  </div>
                </div>

                {/* Full width input field with mic/recorder */}
                <div className="space-y-4">
                  {(() => { const isExampleLocked = examplesSaved || noExamplesChecked; return !userExampleAudio ? (
                    <div className="relative">
                      <textarea
                        id="userExample"
                        value={userExample}
                        onChange={(e) => setUserExample(e.target.value)}
                        placeholder="Enter your example here..."
                        className={`w-full px-3 py-2 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none ${
                          (score !== null || isExampleLocked) ? 'bg-gray-100 cursor-not-allowed' : ''
                        }`}
                        rows={2}
                        disabled={score !== null || isExampleLocked}
                      />
                      {/* Mic / Stop inside textarea */}
                      <button
                        type="button"
                        onClick={handleMicClick}
                        disabled={score !== null || isExampleLocked}
                        className={`absolute right-3 bottom-3 w-7 h-7 rounded-full flex items-center justify-center ${(score !== null || isExampleLocked) ? 'text-gray-300' : isRecording ? 'bg-red-600 text-white animate-pulse' : 'text-gray-600 hover:text-gray-800'}`}
                        title={isRecording ? 'Stop recording' : 'Start recording'}
                      >
                        {isRecording ? (
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                            <rect x="6" y="6" width="12" height="12" rx="2" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                      {isRecording && (
                        <div className="absolute left-3 bottom-3 text-xs text-red-700 font-medium">
                          Rec {Math.floor(elapsedMs / 1000)}s
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-purple-700 font-medium">Audio example:</p>
                        <button
                          type="button"
                          onClick={() => { setUserExampleAudio(null); setElapsedMs(0); setExamplesSaved(false); }}
                          className="inline-flex items-center gap-1 px-2 py-1 border border-purple-300 rounded-md text-xs text-purple-700 hover:bg-purple-100"
                          disabled={score !== null || isExampleLocked}
                        >
                          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M3 6h18v2H3V6zm2 4h14l-1.5 10.5A2 2 0 0115.52 22H8.48a2 2 0 01-1.98-1.5L5 10z"/></svg>
                          Discard
                        </button>
                      </div>
                      <audio controls src={userExampleAudio.dataUrl} className="w-full mt-2" />
                      <div className="text-xs text-gray-600 mt-1">{Math.round((userExampleAudio.durationMs || 0) / 1000)}s</div>
                    </div>
                  ); })()}
                  {recordError && (
                    <div className="text-xs text-red-600">{recordError}</div>
                  )}
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
                      if (e.target.checked) {
                        // Auto-set as saved when user selects no examples
                        setExamplesSaved(true);
                        setUserExample("");
                        setUserExampleAudio(null);
                      } else {
                        setExamplesSaved(false);
                      }
                    }}
                    disabled={score !== null || examplesSaved}
                    className={`w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 ${
                      (score !== null || examplesSaved) ? 'cursor-not-allowed opacity-50' : ''
                    }`}
                  />
                  <label htmlFor="noExamples" className="text-sm text-gray-700">
                    I don't have any example for now
                  </label>
                </div>
                
                {/* Save & Next button */}
                <button
                  onClick={() => {
                    // Save the example and set saved state (text OR audio OR no-examples)
                    if (userExample.trim() !== "" || userExampleAudio || noExamplesChecked) {
                      setExamplesSaved(true);
                    }
                  }}
                  disabled={(userExample.trim() === "" && !userExampleAudio && !noExamplesChecked) || score !== null || examplesSaved}
                  className={`px-6 py-2 text-sm rounded-md transition-colors shadow-sm font-medium ${
                    (userExample.trim() === "" && !userExampleAudio && !noExamplesChecked) || score !== null || examplesSaved
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

          {/* Sub-Questions Progress Bar */}
          {mainAnswer !== null && score === null && (
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

          {/* Sub-Questions - Box Structure */}
          {mainAnswer !== null && isExampleRequirementMet() && (
            <div className="mb-8">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-gray-700">
                  Does {childName} usually...
                </h3>
              </div>
              {/* Box Container for Sub-Questions */}
              <div className="bg-purple-100 border border-purple-200 rounded-lg p-6">
                {/* All Answered Questions - Always show all answered questions */}
                {subQuestions.map((question, index) => {
                  if (subAnswers[index] !== null && subAnswers[index] !== undefined) {
                    return (
                      <div key={index} className="flex items-center justify-between bg-white rounded-lg p-4 border border-purple-200 mb-3">
                        <span className="text-gray-700 font-medium text-md text-left">
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
                {/* Current Question - Show only if not all questions are answered and score is null */}
                {getAnsweredCount() < subQuestions.length && score === null && (
                  <div className="flex items-center justify-between bg-white rounded-lg p-4 border border-purple-200 mb-3">
                    <span className="text-gray-700 font-medium text-md text-left">
                      {getAnsweredCount() + 1}. {subQuestions[getAnsweredCount()]}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          const newSubAnswers = [...subAnswers];
                          newSubAnswers[getAnsweredCount()] = "yes";
                          setSubAnswers(newSubAnswers);
                        }}
                        className="px-4 py-2 rounded-lg text-md font-semibold transition-all border-2 bg-white text-gray-700 border-purple-200 hover:border-purple-300 hover:bg-purple-50"
                      >
                        YES
                      </button>
                      <button
                        onClick={() => {
                          const newSubAnswers = [...subAnswers];
                          newSubAnswers[getAnsweredCount()] = "no";
                          setSubAnswers(newSubAnswers);
                        }}
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
                Reset Question 3
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

export default Question3; 
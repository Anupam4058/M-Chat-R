import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { saveQuestionResult, clearQuestionResult, UserExampleAudio } from "../redux/Action";
import { RootState } from "../redux/Store";
import { useReactMediaRecorder } from "react-media-recorder";

const Question10: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Get child info and question results from Redux store
  const childInfo = useSelector((state: RootState) => (state as any).childInfo);
  const questionResults = useSelector((state: RootState) => (state as any).questionResults);
  const childName = childInfo?.childName || "your child";

  // Find existing result for this question
  const existingResult = questionResults?.find((result: any) => result.questionId === 10);
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

  // State for the flowchart logic
  const [mainAnswer, setMainAnswer] = useState<"yes" | "no" | null>(null);
  const [zeroExamples, setZeroExamples] = useState<("yes" | "no")[]>([]);
  const [oneExamples, setOneExamples] = useState<("yes" | "no")[]>([]);
  const [score, setScore] = useState<0 | 1 | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [mostOften, setMostOften] = useState<"zero" | "one" | null>(null);
  const [userExample, setUserExample] = useState<string>("");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentQuestionType, setCurrentQuestionType] = useState<"zero" | "one" | null>(null);
  const [noExamplesChecked, setNoExamplesChecked] = useState<boolean>(false);
  const [examplesSaved, setExamplesSaved] = useState<boolean>(false);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const zeroExampleQuestions = [
    "Look up?",
    "Talk or babble?",
    `Stop what ${getPronoun("subject")} is doing?`
  ];

  const oneExampleQuestions = [
    "Make no response?",
    "Seem to hear but ignores parent?",
    `Respond only if parent is right in front of ${getPronoun("possessive")} face?`,
    "Respond only if touched?"
  ];

  // Effect to restore state from existing result
  useEffect(() => {
    // Skip restoration if we're in the middle of a reset
    if (isResetting) {
      return;
    }
    
    if (existingResult?.completed) {
      // Set restoring flag to prevent save effect from running
      setIsRestoring(true);
      
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
      
      // Set currentQuestionType based on the main answer to show the appropriate follow-up questions
      if (existingResult.mainAnswer === "yes") {
        setCurrentQuestionType("zero");
      } else if (existingResult.mainAnswer === "no") {
        setCurrentQuestionType("one");
      }
      
      // Set currentQuestionIndex to show all questions (since they're already answered)
      setCurrentQuestionIndex(0);
      
      // Restore mostOften if it was set (for cases where user had to choose between behaviors)
      if (existingResult.mostOften) {
        setMostOften(existingResult.mostOften);
      }
      
      // Restore userExample, but keep textarea empty if no-examples was checked
      setUserExample(existingResult.noExamplesChecked ? "" : (existingResult.userExample || ""));
      if (existingResult.userExampleAudio) {
        setUserExampleAudio(existingResult.userExampleAudio);
        setExamplesSaved(true);
      }
      
      // Restore checkbox and saved states
      if (existingResult.noExamplesChecked !== undefined) {
        setNoExamplesChecked(existingResult.noExamplesChecked);
      }
      if (existingResult.examplesSaved !== undefined) {
        setExamplesSaved(existingResult.examplesSaved);
      }
      
      // Reset restoring flag after a short delay to allow all state updates to complete
      setTimeout(() => {
        setIsRestoring(false);
      }, 100);
    } else if (existingResult === null || existingResult === undefined) {
      // If no existing result, ensure all state is cleared
      setMainAnswer(null);
      setZeroExamples([]);
      setOneExamples([]);
      setScore(null);
      setShowModal(false);
      setMostOften(null);
      setUserExample("");
      setCurrentQuestionIndex(0);
      setCurrentQuestionType(null);
      setNoExamplesChecked(false);
      setExamplesSaved(false);
      setUserExampleAudio(null);
    }
  }, [existingResult, isResetting]);

  // Calculate score based on flowchart logic
  useEffect(() => {
    // Only calculate score when ALL questions are answered
    const zeroAnswered = zeroExamples.filter(ans => ans !== undefined).length;
    const oneAnswered = oneExamples.filter(ans => ans !== undefined).length;
    const totalQuestions = zeroExampleQuestions.length + oneExampleQuestions.length;
    
    if (mainAnswer !== null && zeroAnswered + oneAnswered === totalQuestions) {
      const zeroYesCount = zeroExamples.filter(ans => ans === "yes").length;
      const oneYesCount = oneExamples.filter(ans => ans === "yes").length;

      // Flowchart logic:
      // If YES only to 0 examples → PASS (0)
      // If YES only to 1 examples → FAIL (1)
      // If YES to both 0 and 1 examples → Show modal to ask which is most often
      // If NO to both → FAIL (1)
      
      if (zeroYesCount > 0 && oneYesCount === 0) {
        setScore(0); // PASS
      } else if (zeroYesCount === 0 && oneYesCount > 0) {
        setScore(1); // FAIL
      } else if (zeroYesCount > 0 && oneYesCount > 0) {
        setShowModal(true);
      } else if (zeroYesCount === 0 && oneYesCount === 0) {
        setScore(1); // FAIL
      }
    }
  }, [zeroExamples, oneExamples, mainAnswer]);

  // Handle most often selection
  useEffect(() => {
    if (mostOften !== null) {
      // Immediately set the score and close modal
      setScore(mostOften === "zero" ? 0 : 1);
      setShowModal(false);
    }
  }, [mostOften]);

  // Save result when score is calculated
  useEffect(() => {
    // Skip saving if we're in the middle of restoring state
    if (isRestoring) {
      return;
    }
    
    if (score !== null) {
      const result = score === 0 ? "pass" : "fail";
      dispatch(
        saveQuestionResult(
          10,
          result,
          mainAnswer || "no",
          [...zeroExamples, ...oneExamples],
          mostOften || undefined,
          userExample || undefined,
          noExamplesChecked,
          examplesSaved,
          userExampleAudio || undefined
        )
      );
    }
  }, [score, mainAnswer, zeroExamples, oneExamples, mostOften, userExample, noExamplesChecked, examplesSaved, dispatch, isRestoring]);

  const handleMainAnswer = (answer: "yes" | "no") => {
    setMainAnswer(answer);
    setZeroExamples([]);
    setOneExamples([]);
    setScore(null);
    setShowModal(false);
    setMostOften(null);
    setUserExample("");
    setUserExampleAudio(null);
    setCurrentQuestionIndex(0);
    setCurrentQuestionType(answer === "yes" ? "zero" : "one");
    setNoExamplesChecked(false);
    setExamplesSaved(false);
  };

  const handleZeroExample = (index: number, answer: "yes" | "no") => {
    const newAnswers = [...zeroExamples];
    newAnswers[index] = answer;
    setZeroExamples(newAnswers);

    // Move to next question
    if (index < zeroExampleQuestions.length - 1) {
      setCurrentQuestionIndex(index + 1);
    } else {
      // All zero questions answered, move to one questions if user selected "Yes" initially
      if (mainAnswer === "yes") {
        setCurrentQuestionType("one");
      setCurrentQuestionIndex(0);
      }
      // If this is the last question and user selected "No" initially, the score will be calculated automatically
    }
  };

  const handleOneExample = (index: number, answer: "yes" | "no") => {
    const newAnswers = [...oneExamples];
    newAnswers[index] = answer;
    setOneExamples(newAnswers);

    // Move to next question
    if (index < oneExampleQuestions.length - 1) {
      setCurrentQuestionIndex(index + 1);
    } else {
      // All one questions answered, move to zero questions if user selected "No" initially
      if (mainAnswer === "no") {
        setCurrentQuestionType("zero");
        setCurrentQuestionIndex(0);
      }
      // If this is the last question and user selected "Yes" initially, the score will be calculated automatically
    }
  };

  const handleMostOften = (choice: "zero" | "one") => {
    setMostOften(choice);
  };

  const handleResetQuestion = () => {
    setShowResetModal(true);
  };

  const handleConfirmReset = () => {
    // Set resetting flag to prevent state restoration
    setIsResetting(true);
    
    // Clear the result from Redux store first
    dispatch(clearQuestionResult(10));
    
    // Clear all state for this question
    setMainAnswer(null);
    setZeroExamples([]);
    setOneExamples([]);
    setScore(null);
    setShowModal(false);
    setMostOften(null);
    setUserExample("");
    setCurrentQuestionIndex(0);
    setCurrentQuestionType(null);
    setNoExamplesChecked(false);
    setExamplesSaved(false);
    
    // Close the modal
    setShowResetModal(false);
    
    // Reset the flag after a short delay to allow state updates to complete
    setTimeout(() => {
      setIsResetting(false);
    }, 100);
  };

  const handleCancelReset = () => {
    setShowResetModal(false);
  };

  const handleNext = () => {
    navigate("/question/11");
  };

  const handlePrev = () => {
    navigate("/question/9");
  };

  const getAnsweredCount = () => {
    const zeroAnswered = zeroExamples.filter(ans => ans !== undefined).length;
    const oneAnswered = oneExamples.filter(ans => ans !== undefined).length;
    return zeroAnswered + oneAnswered;
  };

  const getTotalQuestions = () => {
    return zeroExampleQuestions.length + oneExampleQuestions.length;
  };

  // Check if textarea requirement is met (either example saved/recorded or checkbox checked)
  const isTextareaRequirementMet = () => {
    // If main answer is "no", no textarea requirement needed
    if (mainAnswer === "no") {
      return true;
    }
    // If main answer is "yes", require either saved examples or checkbox
    return examplesSaved || noExamplesChecked;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-indigo-200">
      <style>
        {`
          @keyframes pop {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
          @keyframes pop-red {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
          @keyframes fadeInBounce {
            0% { opacity: 0; transform: translateY(-20px); }
            50% { opacity: 1; transform: translateY(5px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
            20%, 40%, 60%, 80% { transform: translateX(2px); }
          }
        `}
      </style>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto bg-white/80 rounded-2xl shadow-2xl p-6 md:p-8">
          
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
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 text-left">
                Does {childName} respond when you call {getPronoun("possessive")} name?
              </h1>
            </div>
            
            {/* Main Answer Buttons */}
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
                Please give me an example of how {childName} responds when you call {getPronoun("possessive")} name.
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
                      When you call {childName}'s name:
                    </p>
                  </div>
                  
                  {/* Right side - Info button box */}
                  <div className="bg-blue-100 border border-blue-200 rounded-lg p-4 flex items-center gap-2">
                    <div className="w-5 h-5 bg-gray-800 text-white rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold">i</span>
                    </div>
                    <span className="text-xs text-gray-900 text-left">
                      This helps us understand {childName}'s specific responses to name calling.
                    </span>
                  </div>
                </div>

                {/* Full width input field with mic/recorder */}
                <div className="space-y-4">
                  {!userExampleAudio ? (
                    <div className="relative">
                      <textarea
                        id="userExample"
                        value={userExample}
                        onChange={(e) => setUserExample(e.target.value)}
                        placeholder="Enter your example here..."
                        className={`w-full px-3 py-2 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none ${
                          (score !== null || examplesSaved || noExamplesChecked) ? 'bg-gray-100 cursor-not-allowed' : ''
                        }`}
                        rows={2}
                        disabled={score !== null || examplesSaved || noExamplesChecked}
                      />
                      {/* Mic / Stop inside textarea */}
                      <button
                        type="button"
                        onClick={handleMicClick}
                        disabled={score !== null || examplesSaved || noExamplesChecked}
                        className={`absolute right-3 bottom-3 w-7 h-7 rounded-full flex items-center justify-center ${(score !== null || examplesSaved || noExamplesChecked) ? 'text-gray-300' : isRecording ? 'bg-red-600 text-white animate-pulse' : 'text-gray-600 hover:text-gray-800'}`}
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
                          disabled={score !== null || examplesSaved || noExamplesChecked}
                        >
                          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M3 6h18v2H3V6zm2 4h14l-1.5 10.5A2 2 0 0115.52 22H8.48a2 2 0 01-1.98-1.5L5 10z"/></svg>
                          Discard
                        </button>
                      </div>
                      <audio controls src={userExampleAudio.dataUrl} className="w-full mt-2" />
                      <div className="text-xs text-gray-600 mt-1">{Math.round((userExampleAudio.durationMs || 0) / 1000)}s</div>
                    </div>
                  )}
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
                      // Reset saved state when checkbox is unchecked
                      if (!e.target.checked) {
                        setExamplesSaved(false);
                        setUserExampleAudio(null);
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
                    // Save the example and set saved state
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

          {mainAnswer === "no" && (
             <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
               <p className="text-blue-800">
                If {childName} is not involved in something fun or interesting, what does {getPronoun("subject")} do when you call {getPronoun("possessive")} name?
               </p>
             </div>
           )}

          {/* Two Boxes Layout for Sub-Questions */}
          {mainAnswer !== null && !showModal && isTextareaRequirementMet() && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-6">

              {/* Left Box - 0 Examples (Pass Behaviors) - Show when mainAnswer is "yes", currentQuestionType is "zero", or when there are zero answers */}
              {(mainAnswer === "yes" || currentQuestionType === "zero" || zeroExamples.some(answer => answer !== undefined)) && (
                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
                    <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-2"></span>
                    Does he/she...
                  </h3>
                  <div className="space-y-4">
                    {/* Show answered questions in their own divs */}
                    {zeroExampleQuestions.map((question, index) => (
                      zeroExamples[index] !== undefined && (
                        <div key={index} className="bg-white rounded-lg p-4 border border-green-200">
                          <div className="flex items-center justify-between">
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
                    {currentQuestionType === "zero" && score === null && (
                      <div className="bg-white rounded-lg p-4 border border-green-200">
                        <div className="flex items-center justify-between">
                          <p className="text-gray-700 font-medium flex-1 mr-4 text-left">
                            {zeroExampleQuestions[currentQuestionIndex]}
                          </p>
                          <div className="flex gap-2 flex-shrink-0">
                    <button
                              onClick={() => handleZeroExample(currentQuestionIndex, "yes")}
                              className="px-4 py-2 rounded-lg font-medium transition-all bg-gray-100 text-gray-700 hover:bg-gray-200"
                            >
                      Yes
                    </button>
                    <button
                              onClick={() => handleZeroExample(currentQuestionIndex, "no")}
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

              {/* Right Box - 1 Examples (Fail Behaviors) - Show when mainAnswer is "no", currentQuestionType is "one", or when there are one answers */}
              {(mainAnswer === "no" || currentQuestionType === "one" || oneExamples.some(answer => answer !== undefined)) && (
                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-red-800 mb-4 flex items-center">
                    <span className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-2"></span>
                    Does he/she...
                </h3>
                  <div className="space-y-4">
                    {/* Show answered questions in their own divs */}
                    {oneExampleQuestions.map((question, index) => (
                      oneExamples[index] !== undefined && (
                        <div key={index} className="bg-white rounded-lg p-4 border border-red-200">
                          <div className="flex items-center justify-between">
                            <p className="text-gray-700 font-medium flex-1 mr-4 text-left">{question}</p>
                            <div className={`px-4 py-2 rounded-lg font-medium ${oneExamples[index] === "yes"
                                ? "bg-red-500 text-white"
                                : "bg-green-500 text-white"
                              }`}>
                              {oneExamples[index] === "yes" ? "Yes" : "No"}
                </div>
                </div>
              </div>
                      )
                    ))}

                    {/* Show current question if it's a one question and score is null */}
                    {currentQuestionType === "one" && score === null && (
                      <div className="bg-white rounded-lg p-4 border border-red-200">
                        <div className="flex items-center justify-between">
                          <p className="text-gray-700 font-medium flex-1 mr-4 text-left">
                            {oneExampleQuestions[currentQuestionIndex]}
                          </p>
                          <div className="flex gap-2 flex-shrink-0">
                <button
                              onClick={() => handleOneExample(currentQuestionIndex, "yes")}
                              className="px-4 py-2 rounded-lg font-medium transition-all bg-gray-100 text-gray-700 hover:bg-gray-200"
                            >
                      Yes
                    </button>
                    <button
                              onClick={() => handleOneExample(currentQuestionIndex, "no")}
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
            </div>
          )}

          {/* Most Often Decision - Both Boxes Selectable */}
          {showModal && score === null && (
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center" style={{ animation: 'shake 1.5s ease-in-out infinite' }}>
                Tell me which type of behaviours does {childName} show most often?
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-12 relative">
                {/* 0 Examples Box - Selectable */}
                <div
                  onClick={() => handleMostOften("zero")}
                  className={`border-2 rounded-lg p-6 cursor-pointer transition-all shadow-lg hover:shadow-xl ${mostOften === "zero"
                      ? "border-green-500 bg-green-50 shadow-green-200"
                      : "border-green-200 bg-white hover:border-green-300 hover:bg-green-50"
                    }`}
                  style={{
                    animation: 'pop 1.5s infinite'
                  }}
                >
                  <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
                    <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-2"></span>
                    Does he/she...
                  </h3>

                  {/* Show all answered 0 example questions */}
                  <div className="space-y-3">
                    {zeroExampleQuestions.map((question, index) => (
                      zeroExamples[index] !== undefined && (
                        <div key={index} className="bg-white rounded-lg p-3 border border-green-200">
                          <div className="flex items-center justify-between">
                            <p className="text-gray-700 font-medium flex-1 mr-4 text-left">{question}</p>
                            <div className={`px-3 py-1 rounded-lg font-medium ${zeroExamples[index] === "yes"
                                ? "bg-green-500 text-white"
                                : "bg-red-500 text-white"
                              }`}>
                              {zeroExamples[index] === "yes" ? "Yes" : "No"}
                            </div>
                          </div>
                        </div>
                      )
                    ))}
                  </div>
                </div>

                {/* 1 Examples Box - Selectable */}
                <div
                  onClick={() => handleMostOften("one")}
                  className={`border-2 rounded-lg p-6 cursor-pointer transition-all shadow-lg hover:shadow-xl ${mostOften === "one"
                      ? "border-red-500 bg-red-50 shadow-red-200"
                      : "border-red-200 bg-white hover:border-red-300 hover:bg-red-50"
                    }`}
                  style={{
                    animation: 'pop-red 1.5s infinite'
                  }}
                >
                  <h3 className="text-lg font-semibold text-red-800 mb-4 flex items-center">
                    <span className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-2"></span>
                    Does he/she...
                  </h3>

                  {/* Show all answered 1 example questions */}
                  <div className="space-y-3">
                    {oneExampleQuestions.map((question, index) => (
                      oneExamples[index] !== undefined && (
                        <div key={index} className="bg-white rounded-lg p-3 border border-red-200">
                          <div className="flex items-center justify-between">
                            <p className="text-gray-700 font-medium flex-1 mr-4 text-left">{question}</p>
                            <div className={`px-3 py-1 rounded-lg font-medium ${oneExamples[index] === "yes"
                                ? "bg-red-500 text-white"
                                : "bg-green-500 text-white"
                              }`}>
                              {oneExamples[index] === "yes" ? "Yes" : "No"}
                            </div>
                          </div>
                        </div>
                      )
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 text-center">
                {mostOften === null ? (
                  <p className="text-sm text-gray-600">
                    Click on the box that represents the behavior type {childName} shows most often
                  </p>
                ) : (
                  <p className="text-sm text-green-600 font-medium">
                    ✓ Selection registered! Calculating result...
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Most Often Decision - Show Selected Boxes After Decision */}
          {score !== null && mostOften !== null && (
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center" style={{ animation: 'fadeInBounce 1s ease-out' }}>
                Tell me which type of behaviours does {childName} show most often?
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-16 relative">
                {/* 0 Examples Box - Show if selected or if both were answered */}
                {(mostOften === "zero" || (zeroExamples.some(answer => answer !== undefined) && oneExamples.some(answer => answer !== undefined))) && (
                  <div className={`border-2 rounded-lg p-6 ${mostOften === "zero"
                      ? "border-green-500 bg-green-50 shadow-green-200"
                      : "border-green-200 bg-white"
                    }`}>
                    <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
                      <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-2"></span>
                      Does he/she...
                </h3>

                    {/* Show all answered 0 example questions */}
                    <div className="space-y-3">
                      {zeroExampleQuestions.map((question, index) => (
                        zeroExamples[index] !== undefined && (
                          <div key={index} className="bg-white rounded-lg p-3 border border-green-200">
                            <div className="flex items-center justify-between">
                              <p className="text-gray-700 font-medium flex-1 mr-4 text-left">{question}</p>
                              <div className={`px-3 py-1 rounded-lg font-medium ${zeroExamples[index] === "yes"
                                  ? "bg-green-500 text-white"
                                  : "bg-red-500 text-white"
                                }`}>
                                {zeroExamples[index] === "yes" ? "Yes" : "No"}
                              </div>
                            </div>
              </div>
                        )
                      ))}
              </div>
            </div>
          )}

                {/* OR Text Box - Show only if both boxes are visible */}
                {mostOften === null && zeroExamples.some(answer => answer !== undefined) && oneExamples.some(answer => answer !== undefined) && (
                  <>
                    <div className="absolute left-1/2 transform -translate-x-1/2 top-1/2 -translate-y-1/2 z-3 lg:block hidden">
                      <div className="bg-white border-2 border-gray-300 rounded-lg px-2 py-1 shadow-lg">
                        <span className="text-sm font-bold text-gray-700">OR</span>
                      </div>
                    </div>

                    <div className="flex justify-center my-2 lg:hidden">
                      <div className="bg-white border-2 border-gray-300 rounded-lg px-2 py-1 shadow-lg">
                        <span className="text-sm font-bold text-gray-700">OR</span>
                      </div>
                    </div>
                  </>
                )}

                {/* 1 Examples Box - Show if selected or if both were answered */}
                {(mostOften === "one" || (zeroExamples.some(answer => answer !== undefined) && oneExamples.some(answer => answer !== undefined))) && (
                  <div className={`border-2 rounded-lg p-6 ${mostOften === "one"
                      ? "border-red-500 bg-red-50 shadow-red-200"
                      : "border-red-200 bg-white"
                    }`}>
                    <h3 className="text-lg font-semibold text-red-800 mb-4 flex items-center">
                      <span className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-2"></span>
                      Does he/she...
              </h3>

                    {/* Show all answered 1 example questions */}
                    <div className="space-y-3">
                      {oneExampleQuestions.map((question, index) => (
                        oneExamples[index] !== undefined && (
                          <div key={index} className="bg-white rounded-lg p-3 border border-red-200">
                            <div className="flex items-center justify-between">
                              <p className="text-gray-700 font-medium flex-1 mr-4 ">{question}</p>
                              <div className={`px-3 py-1 rounded-lg font-medium ${oneExamples[index] === "yes"
                                  ? "bg-red-500 text-white"
                                  : "bg-green-500 text-white"
                                }`}>
                                {oneExamples[index] === "yes" ? "Yes" : "No"}
                              </div>
                            </div>
                          </div>
                        )
                      ))}
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
                Reset Question 10
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

export default Question10; 
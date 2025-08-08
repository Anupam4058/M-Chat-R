import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { saveQuestionResult, clearQuestionResult } from "../redux/Action";
import { RootState } from "../redux/Store";

const Question12: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Get child info and question results from Redux store
  const childInfo = useSelector((state: RootState) => (state as any).childInfo);
  const questionResults = useSelector((state: RootState) => (state as any).questionResults);
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

  // Noise questions from flowchart
  const noiseQuestions = [
    "A washing machine?",
    "Babies crying?",
    "Vacuum cleaner?",
    "Hairdryer?",
    "Traffic?",
    "Babies squealing or screeching?",
    "Loud music?",
    "Telephone/doorbell ringing?",
    "Noisy places such as a supermarket or restaurant?"
  ];

  const zeroExampleQuestions = [
    `Calmly cover ${getPronoun("possessive")} ears?`,
    `Tell you that ${getPronoun("subject")} does not like the noise?`
  ];

  const oneExampleQuestions = [
    "Scream?",
    "Cry?",
    `Cover ${getPronoun("possessive")} ears while upset?`
  ];

  // State
  const [mainAnswer, setMainAnswer] = useState<"yes" | "no" | null>(null);
  const [noiseAnswers, setNoiseAnswers] = useState<("yes" | "no")[]>([]);
  const [noiseIndex, setNoiseIndex] = useState(0);
  const [noiseComplete, setNoiseComplete] = useState(false);
  const [zeroExamples, setZeroExamples] = useState<("yes" | "no")[]>([]);
  const [oneExamples, setOneExamples] = useState<("yes" | "no")[]>([]);
  const [currentQuestionType, setCurrentQuestionType] = useState<"zero" | "one" | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [mostOften, setMostOften] = useState<"zero" | "one" | null>(null);
  const [score, setScore] = useState<0 | 1 | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  // Find existing result for this question
  const existingResult = questionResults?.find((result: any) => result.questionId === 12);

  // Restore state from Redux
  useEffect(() => {
    if (isResetting) return;
    if (existingResult?.completed) {
      setIsRestoring(true);
      setMainAnswer(existingResult.mainAnswer);
      const subAnswers = existingResult.subAnswers || [];
      // First N are noise, then zero, then one, then mostOften
      const noiseCount = noiseQuestions.length;
      const zeroCount = zeroExampleQuestions.length;
      const oneCount = oneExampleQuestions.length;
      const noiseAns = subAnswers.slice(0, noiseCount) as ("yes" | "no")[];
      const zeroAns = subAnswers.slice(noiseCount, noiseCount + zeroCount) as ("yes" | "no")[];
      const oneAns = subAnswers.slice(noiseCount + zeroCount, noiseCount + zeroCount + oneCount) as ("yes" | "no")[];
      const mostOftenValue = subAnswers[noiseCount + zeroCount + oneCount] as "zero" | "one" | null;
      setNoiseAnswers(noiseAns);
      setZeroExamples(zeroAns);
      setOneExamples(oneAns);
      if (mostOftenValue) setMostOften(mostOftenValue);
      setNoiseIndex(noiseAns.length < noiseCount ? noiseAns.length : 0);
      setNoiseComplete(noiseAns.length === noiseCount);
      setCurrentQuestionType(null);
      setCurrentQuestionIndex(0);
      setScore(existingResult.result === "pass" ? 0 : 1);
      setTimeout(() => setIsRestoring(false), 100);
    } else if (existingResult === null || existingResult === undefined) {
      setMainAnswer(null);
      setNoiseAnswers([]);
      setNoiseIndex(0);
      setNoiseComplete(false);
      setZeroExamples([]);
      setOneExamples([]);
      setCurrentQuestionType(null);
      setCurrentQuestionIndex(0);
      setMostOften(null);
      setScore(null);
      setShowModal(false);
    }
  }, [existingResult, isResetting]);

  // Handle main answer
  const handleMainAnswer = (answer: "yes" | "no") => {
    setMainAnswer(answer);
    setNoiseAnswers([]);
    setNoiseIndex(0);
    setNoiseComplete(false);
    setZeroExamples([]);
    setOneExamples([]);
    setCurrentQuestionType(null);
    setCurrentQuestionIndex(0);
    setMostOften(null);
    setScore(null);
    setShowModal(false);
  };

  // Handle noise answer
  const handleNoiseAnswer = (answer: "yes" | "no") => {
    const updated = [...noiseAnswers];
    updated[noiseIndex] = answer;
    setNoiseAnswers(updated);
    if (noiseIndex < noiseQuestions.length - 1) {
      setNoiseIndex(noiseIndex + 1);
        } else {
      setNoiseComplete(true);
      setNoiseIndex(0);
    }
  };

  // After noise section, decide next step
  useEffect(() => {
    if (mainAnswer === "yes" && noiseComplete) {
      const yesCount = noiseAnswers.filter(ans => ans === "yes").length;
      if (yesCount <= 1) {
        setScore(0); // PASS
      } else if (yesCount >= 2) {
        setCurrentQuestionType("zero");
        setCurrentQuestionIndex(0);
      }
    }
    // If mainAnswer is no, score is set below
  }, [mainAnswer, noiseComplete, noiseAnswers]);

  // Handle zero/one sub-questions
  const handleZeroExample = (index: number, answer: "yes" | "no") => {
    const newAnswers = [...zeroExamples];
    newAnswers[index] = answer;
    setZeroExamples(newAnswers);
    if (index < zeroExampleQuestions.length - 1) {
      setCurrentQuestionIndex(index + 1);
    } else {
      setCurrentQuestionType("one");
      setCurrentQuestionIndex(0);
    }
  };
  const handleOneExample = (index: number, answer: "yes" | "no") => {
    const newAnswers = [...oneExamples];
    newAnswers[index] = answer;
    setOneExamples(newAnswers);
    if (index < oneExampleQuestions.length - 1) {
      setCurrentQuestionIndex(index + 1);
    }
  };

  // Calculate score after sub-questions
  useEffect(() => {
    if (mainAnswer === "no") {
      setScore(0); // PASS
      return;
    }
    if (mainAnswer === "yes" && noiseComplete && currentQuestionType === "one") {
      // Only after all sub-questions
      const zeroComplete = zeroExamples.length === zeroExampleQuestions.length && zeroExamples.every(a => a !== undefined);
      const oneComplete = oneExamples.length === oneExampleQuestions.length && oneExamples.every(a => a !== undefined);
      if (zeroComplete && oneComplete) {
        const zeroYes = zeroExamples.filter(a => a === "yes").length;
        const oneYes = oneExamples.filter(a => a === "yes").length;
        if (zeroYes > 0 && oneYes === 0) {
              setScore(0);
        } else if (zeroYes === 0 && oneYes > 0) {
              setScore(1);
        } else if (zeroYes > 0 && oneYes > 0) {
          setShowModal(true);
        } else if (zeroYes === 0 && oneYes === 0) {
          setScore(0); // Default to PASS if no examples marked yes
        }
      }
    }
  }, [mainAnswer, noiseComplete, currentQuestionType, zeroExamples, oneExamples]);

  // Handle most often
  useEffect(() => {
    if (mostOften !== null) {
      setScore(mostOften === "zero" ? 0 : 1);
      setShowModal(false);
    }
  }, [mostOften]);

  // Save result when score is calculated
  useEffect(() => {
    if (isRestoring) return;
    if (score !== null) {
      const result = score === 0 ? "pass" : "fail";
      const allSubAnswers: ("yes" | "no" | "zero" | "one")[] = [
        ...noiseAnswers,
        ...zeroExamples,
        ...oneExamples
      ];
      if (mostOften !== null) allSubAnswers.push(mostOften === "zero" ? "zero" : "one");
      dispatch(
        saveQuestionResult(
          12,
          result,
          mainAnswer || "no",
          allSubAnswers,
          mostOften || undefined
        )
      );
    }
  }, [score, mainAnswer, noiseAnswers, zeroExamples, oneExamples, mostOften, dispatch, isRestoring]);

  // Reset logic
  const handleResetQuestion = () => setShowResetModal(true);
  const handleConfirmReset = () => {
    setIsResetting(true);
    dispatch(clearQuestionResult(12));
    setMainAnswer(null);
    setNoiseAnswers([]);
    setNoiseIndex(0);
    setNoiseComplete(false);
    setZeroExamples([]);
    setOneExamples([]);
    setCurrentQuestionType(null);
    setCurrentQuestionIndex(0);
    setMostOften(null);
    setScore(null);
    setShowModal(false);
    setShowResetModal(false);
    setTimeout(() => setIsResetting(false), 100);
  };
  const handleCancelReset = () => setShowResetModal(false);

  // Navigation
  const handleNext = () => navigate("/question/13");
  const handlePrev = () => navigate("/question/11");

  // Progress helpers
  const getNoiseProgress = () => noiseAnswers.filter(a => a !== undefined).length;
  const getNoiseTotal = () => noiseQuestions.length;
  const getAnsweredCount = () => {
    const zeroAnswered = zeroExamples.filter(ans => ans !== undefined).length;
    const oneAnswered = oneExamples.filter(ans => ans !== undefined).length;
    return zeroAnswered + oneAnswered;
  };
  const getTotalQuestions = () => zeroExampleQuestions.length + oneExampleQuestions.length;

  // UI
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-indigo-200">
      <style>{`
        @keyframes pop { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
        @keyframes pop-red { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
        @keyframes fadeInBounce { 0% { opacity: 0; transform: translateY(-20px); } 50% { opacity: 1; transform: translateY(5px); } 100% { opacity: 1; transform: translateY(0); } }
        @keyframes shake { 0%, 100% { transform: translateX(0); } 10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); } 20%, 40%, 60%, 80% { transform: translateX(2px); } }
      `}</style>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto bg-white/80 rounded-2xl shadow-2xl p-6 md:p-8">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-600">Question 12 of 20</span>
              <span className="text-sm font-medium text-gray-600">60%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full" style={{ width: '60%' }}></div>
            </div>
          </div>

          {/* Main Question */}
          <div className="mb-8">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full flex items-center justify-center font-bold text-xl mr-4">12</div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 text-left">
                Does {childName} get upset by everyday noises?</h1>
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
                {mainAnswer === "yes" && <span className="mr-2">✓</span>}Yes
              </button>
              <button
                onClick={() => handleMainAnswer("no")}
                className={`px-6 py-3 rounded-full font-semibold transition-all border-2 flex items-center justify-center min-w-[120px] ${mainAnswer === "no"
                    ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white border-purple-500 shadow-lg"
                    : "bg-white text-gray-700 border-purple-200 hover:border-purple-300 hover:bg-purple-50"
                }`}
              >
                {mainAnswer === "no" && <span className="mr-2">✓</span>}No
              </button>
            </div>
          </div>

          {/* Noise Questions Section */}
          {mainAnswer === "yes" && (
            <div className="mb-8">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-gray-700">
                  Does {childName} have a negative reaction to the sound of...
                  </h3>
              </div>
              {/* Box Container for Noise Questions */}
              <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-6">
                {/* All Answered Noise Questions */}
                {noiseQuestions.map((question, idx) => {
                  if (noiseAnswers[idx] !== null && noiseAnswers[idx] !== undefined) {
                    return (
                      <div key={idx} className="flex items-center justify-between bg-white rounded-lg p-4 border border-purple-200 mb-3">
                        <span className="text-gray-700 font-medium text-md">
                          {idx + 1}. {question}
                        </span>
                        <div className={`px-4 py-2 rounded-lg text-md font-semibold ${noiseAnswers[idx] === "yes" ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white" : "bg-gradient-to-r from-purple-500 to-indigo-500 text-white border-purple-200 hover:border-purple-300"}`}>
                          {noiseAnswers[idx] === "yes" ? "YES" : "NO"}
                        </div>
                      </div>
                    );
                  }
                  return null;
                })}
                {/* Current Noise Question - Show only if not all are answered */}
                {getNoiseProgress() < noiseQuestions.length && (
                  <div className="flex items-center justify-between bg-white rounded-lg p-4 border border-purple-200 mb-3">
                    <span className="text-gray-700 font-medium text-md">
                      {getNoiseProgress() + 1}. {noiseQuestions[noiseIndex]}
                    </span>
                    <div className="flex gap-2">
                    <button
                      onClick={() => handleNoiseAnswer("yes")}
                        className="px-4 py-2 rounded-lg text-md font-semibold transition-all border-2 bg-white text-gray-700 border-purple-400 hover:border-purple-500 hover:bg-purple-50"
                      >
                        YES
                    </button>
                    <button
                      onClick={() => handleNoiseAnswer("no")}
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

          {/* Sub-Questions Section (after noise) */}
          {mainAnswer === "yes" && noiseComplete && !showModal && mostOften === null && (
            <>
              {/* Description Box before sub-questions, as in the flowchart */}
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-800 font-semibold">
                  How does your child react to those noises?
              </p>
            </div>
              {/* Two Boxes Layout for Sub-Questions */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-6">
                {/* Left Box - 0 Examples (Pass Behaviors) */}
                {(currentQuestionType === "zero" || zeroExamples.some(answer => answer !== undefined)) && (
                  <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
                      <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-2"></span>
                      Does he/she...
                </h3>
                    <div className="space-y-4">
                      {zeroExampleQuestions.map((question, index) => (
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
                      {currentQuestionType === "zero" && score === null && zeroExamples[currentQuestionIndex] === undefined && (
                        <div className="bg-white rounded-lg p-4 border border-green-200">
                          <div className="flex items-center justify-between text-left">
                            <p className="text-gray-700 font-medium flex-1 mr-4 text-left">{zeroExampleQuestions[currentQuestionIndex]}</p>
                            <div className="flex gap-2 flex-shrink-0">
                              <button
                                onClick={() => handleZeroExample(currentQuestionIndex, "yes")}
                                className="px-4 py-2 rounded-lg font-medium transition-all bg-gray-100 text-gray-700 hover:bg-gray-200"
                              >Yes</button>
                              <button
                                onClick={() => handleZeroExample(currentQuestionIndex, "no")}
                                className="px-4 py-2 rounded-lg font-medium transition-all bg-gray-100 text-gray-700 hover:bg-gray-200"
                              >No</button>
                            </div>
              </div>
                </div>
                      )}
                </div>
              </div>
                )}
                {/* Right Box - 1 Examples (Fail Behaviors) */}
                {(currentQuestionType === "one" || oneExamples.some(answer => answer !== undefined)) && (
                  <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-red-800 mb-4 flex items-center">
                      <span className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-2"></span>
                      Does he/she...
                  </h3>
                    <div className="space-y-4">
                      {oneExampleQuestions.map((question, index) => (
                        oneExamples[index] !== undefined && (
                          <div key={index} className="bg-white rounded-lg p-4 border border-red-200">
                            <div className="flex items-center justify-between text-left">
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
                      {currentQuestionType === "one" && score === null && oneExamples[currentQuestionIndex] === undefined && (
                        <div className="bg-white rounded-lg p-4 border border-red-200">
                          <div className="flex items-center justify-between text-left">
                            <p className="text-gray-700 font-medium flex-1 mr-4 text-left">{oneExampleQuestions[currentQuestionIndex]}</p>
                            <div className="flex gap-2 flex-shrink-0">
                    <button
                                onClick={() => handleOneExample(currentQuestionIndex, "yes")}
                                className="px-4 py-2 rounded-lg font-medium transition-all bg-gray-100 text-gray-700 hover:bg-gray-200"
                              >Yes</button>
                    <button
                                onClick={() => handleOneExample(currentQuestionIndex, "no")}
                                className="px-4 py-2 rounded-lg font-medium transition-all bg-gray-100 text-gray-700 hover:bg-gray-200"
                              >No</button>
                            </div>
                  </div>
                </div>
                      )}
              </div>
            </div>
                )}
              </div>
            </>
          )}

          {/* Most Often Modal */}
          {showModal && score === null && (
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center" style={{ animation: 'shake 1.5s ease-in-out infinite' }}>
                Tell me which type of behaviours does {childName} show most often?
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-12 relative">
                {/* 0 Examples Box - Selectable */}
                <div
                  onClick={() => setMostOften("zero")}
                  className={`border-2 rounded-lg p-6 cursor-pointer transition-all shadow-lg hover:shadow-xl ${mostOften === "zero"
                    ? "border-green-500 bg-green-50 shadow-green-200"
                    : "border-green-200 bg-white hover:border-green-300 hover:bg-green-50"
                  }`}
                  style={{ animation: 'pop 1.5s infinite' }}
                >
                  <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
                    <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-2"></span>
                    Does he/she...
                </h3>
                  <div className="space-y-3">
                    {zeroExampleQuestions.map((question, index) => (
                      zeroExamples[index] !== undefined && (
                        <div key={index} className="bg-white rounded-lg p-3 border border-green-200">
                          <div className="flex items-center justify-between text-left">
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
                  onClick={() => setMostOften("one")}
                  className={`border-2 rounded-lg p-6 cursor-pointer transition-all shadow-lg hover:shadow-xl ${mostOften === "one"
                    ? "border-red-500 bg-red-50 shadow-red-200"
                    : "border-red-200 bg-white hover:border-red-300 hover:bg-red-50"
                  }`}
                  style={{ animation: 'pop-red 1.5s infinite' }}
                >
                  <h3 className="text-lg font-semibold text-red-800 mb-4 flex items-center">
                    <span className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-2"></span>
                    Does he/she...
                  </h3>
                  <div className="space-y-3">
                    {oneExampleQuestions.map((question, index) => (
                      oneExamples[index] !== undefined && (
                        <div key={index} className="bg-white rounded-lg p-3 border border-red-200">
                          <div className="flex items-center justify-between text-left">
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
                {(mostOften === "zero" || (zeroExamples.some(answer => answer !== undefined) && oneExamples.some(answer => answer !== undefined))) && (
                  <div className={`border-2 rounded-lg p-6 ${mostOften === "zero"
                    ? "border-green-500 bg-green-50 shadow-green-200"
                    : "border-green-200 bg-white"
                  }`}>
                    <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
                      <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-2"></span>
                      Does he/she...
                </h3>
                    <div className="space-y-3">
                      {zeroExampleQuestions.map((question, index) => (
                        zeroExamples[index] !== undefined && (
                          <div key={index} className="bg-white rounded-lg p-3 border border-green-200">
                            <div className="flex items-center justify-between text-left">
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
                {(mostOften === "one" || (zeroExamples.some(answer => answer !== undefined) && oneExamples.some(answer => answer !== undefined))) && (
                  <div className={`border-2 rounded-lg p-6 ${mostOften === "one"
                    ? "border-red-500 bg-red-50 shadow-red-200"
                    : "border-red-200 bg-white"
                  }`}>
                    <h3 className="text-lg font-semibold text-red-800 mb-4 flex items-center">
                      <span className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-2"></span>
                      Does he/she...
              </h3>
                    <div className="space-y-3">
                      {oneExampleQuestions.map((question, index) => (
                        oneExamples[index] !== undefined && (
                          <div key={index} className="bg-white rounded-lg p-3 border border-red-200">
                            <div className="flex items-center justify-between text-left">
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
                )}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <button
              onClick={handlePrev}
              className="px-6 py-3 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 transition-all"
            >Previous</button>
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
            >Next</button>
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
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Reset Question 12</h3>
              <p className="text-gray-600 mb-6">Are you sure you want to reset this question? This will clear all your answers and you'll need to answer the question again.</p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={handleCancelReset}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-400 transition-all"
                >Cancel</button>
                <button
                  onClick={handleConfirmReset}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-all"
                >Reset Question</button>
          </div>
        </div>
      </div>
        </div>
      )}
    </div>
  );
};

export default Question12; 
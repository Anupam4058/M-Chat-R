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
  const [showModal, setShowModal] = useState(false);
  const [mostOften, setMostOften] = useState<"zero" | "one" | null>(null);
  const [userExample, setUserExample] = useState<string>("");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentQuestionType, setCurrentQuestionType] = useState<"zero" | "one" | null>(null);

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
  }, [zeroExamples, oneExamples, mainAnswer, zeroExampleQuestions.length, oneExampleQuestions.length]);

  // Handle most often selection
  useEffect(() => {
    console.log("mostOften changed:", mostOften);
    if (mostOften !== null) {
      console.log("Setting score and closing modal");
      // Immediately set the score and close modal
      setScore(mostOften === "zero" ? 0 : 1);
      setShowModal(false);
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
          [...zeroExamples, ...oneExamples],
          mostOften || undefined
        )
      );
    }
  }, [score, mainAnswer, zeroExamples, oneExamples, mostOften, dispatch]);

  const handleMainAnswer = (answer: "yes" | "no") => {
    setMainAnswer(answer);
    setZeroExamples([]);
    setOneExamples([]);
    setScore(null);
    setShowModal(false);
    setMostOften(null);
    setUserExample("");
    setCurrentQuestionIndex(0);
    setCurrentQuestionType(answer === "yes" ? "zero" : "one");
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
    console.log("Modal selection:", choice);
    setMostOften(choice);
  };

  const handleNext = () => {
    navigate("/question/2");
  };

  const handlePrev = () => {
    navigate("/child-info");
  };

  const getAnsweredCount = () => {
    const zeroAnswered = zeroExamples.filter(ans => ans !== undefined).length;
    const oneAnswered = oneExamples.filter(ans => ans !== undefined).length;
    return zeroAnswered + oneAnswered;
  };

  const getTotalQuestions = () => {
    return zeroExampleQuestions.length + oneExampleQuestions.length;
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
        `}
      </style>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto bg-white/80 rounded-2xl shadow-2xl p-6 md:p-8">
          
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

          {/* Main Question */}
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

          {/* Instructions based on main answer */}
          {mainAnswer === "yes" && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800 mb-4">
                Please give me an example of how {childName} will respond if you point at something?
              </p>
              <div className="space-y-3">
                <label htmlFor="userExample" className="block text-sm font-medium text-blue-800">
                  Describe {childName}'s behavior when you point at something:
                </label>
                <textarea
                  id="userExample"
                  value={userExample}
                  onChange={(e) => setUserExample(e.target.value)}
                  placeholder="For example: 'When I point at a toy, he looks at the toy and sometimes reaches for it'"
                  className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={3}
                />
                <p className="text-xs text-blue-600">
                  This helps us understand {childName}'s specific responses to pointing gestures.
                </p>
              </div>
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
          {mainAnswer !== null && !showModal && score === null && (
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

          {/* Two Boxes Layout for Sub-Questions */}
          {mainAnswer !== null && !showModal && (
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
                            <p className="text-gray-700 font-medium flex-1 mr-4">{question}</p>
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
                          <p className="text-gray-700 font-medium flex-1 mr-4">
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
                            <p className="text-gray-700 font-medium flex-1 mr-4">{question}</p>
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
                          <p className="text-gray-700 font-medium flex-1 mr-4">
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
              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center" style={{ animation: 'fadeInBounce 1s ease-out' }}>
                Tell me which type of behaviours does {childName} show most often?
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-16 relative">
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
                  <h4 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
                    <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-2"></span>
                    Does he/she...
                  </h4>

                  {/* Show all answered 0 example questions */}
                  <div className="space-y-3">
                    {zeroExampleQuestions.map((question, index) => (
                      zeroExamples[index] !== undefined && (
                        <div key={index} className="bg-white rounded-lg p-3 border border-green-200">
                          <div className="flex items-center justify-between">
                            <p className="text-gray-700 font-medium flex-1 mr-4 text-sm">{question}</p>
                            <div className={`px-3 py-1 rounded-lg text-xs font-medium ${zeroExamples[index] === "yes"
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

                {/* OR Text Box */}
                <div className="absolute left-1/2 transform -translate-x-1/2 top-1/2 -translate-y-1/2 z-3 lg:block hidden">
                  <div className="bg-white border-2 border-gray-300 rounded-lg px-2 py-1 shadow-lg">
                    <span className="text-sm font-bold text-gray-700">OR</span>
                  </div>
                </div>

                {/* OR Text Box for Mobile */}
                <div className="flex justify-center my-2 lg:hidden">
                  <div className="bg-white border-2 border-gray-300 rounded-lg px-2 py-1 shadow-lg">
                    <span className="text-sm font-bold text-gray-700">OR</span>
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
                  <h4 className="text-lg font-semibold text-red-800 mb-4 flex items-center">
                    <span className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-2"></span>
                    Does he/she...
                  </h4>

                  {/* Show all answered 1 example questions */}
                  <div className="space-y-3">
                    {oneExampleQuestions.map((question, index) => (
                      oneExamples[index] !== undefined && (
                        <div key={index} className="bg-white rounded-lg p-3 border border-red-200">
                          <div className="flex items-center justify-between">
                            <p className="text-gray-700 font-medium flex-1 mr-4 text-sm">{question}</p>
                            <div className={`px-3 py-1 rounded-lg text-xs font-medium ${oneExamples[index] === "yes"
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
                    <h4 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
                      <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-2"></span>
                      Does he/she...
                    </h4>

                    {/* Show all answered 0 example questions */}
                    <div className="space-y-3">
                      {zeroExampleQuestions.map((question, index) => (
                        zeroExamples[index] !== undefined && (
                          <div key={index} className="bg-white rounded-lg p-3 border border-green-200">
                            <div className="flex items-center justify-between">
                              <p className="text-gray-700 font-medium flex-1 mr-4 text-sm">{question}</p>
                              <div className={`px-3 py-1 rounded-lg text-xs font-medium ${zeroExamples[index] === "yes"
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
                    <h4 className="text-lg font-semibold text-red-800 mb-4 flex items-center">
                      <span className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-2"></span>
                      Does he/she...
                    </h4>

                    {/* Show all answered 1 example questions */}
                    <div className="space-y-3">
                      {oneExampleQuestions.map((question, index) => (
                        oneExamples[index] !== undefined && (
                          <div key={index} className="bg-white rounded-lg p-3 border border-red-200">
                            <div className="flex items-center justify-between">
                              <p className="text-gray-700 font-medium flex-1 mr-4 text-sm">{question}</p>
                              <div className={`px-3 py-1 rounded-lg text-xs font-medium ${oneExamples[index] === "yes"
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
              <p className={`text-sm ${score === 0
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
    </div>
  );
};

export default Question1; 
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { saveQuestionResult, clearQuestionResult } from "../redux/Action";
import { RootState } from "../redux/Store";

const Question13: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Get child info and question results from Redux store
  const childInfo = useSelector((state: RootState) => (state as any).childInfo);
  const questionResults = useSelector((state: RootState) => (state as any).questionResults);
  const childName = childInfo?.childName || "your child";

  // Find existing result for this question
  const existingResult = questionResults?.find((result: any) => result.questionId === 13);
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

  // State for main answer and follow-up question
  const [mainAnswer, setMainAnswer] = useState<"yes" | "no" | null>(null);
  const [followUpAnswer, setFollowUpAnswer] = useState<"yes" | "no" | null>(null);
  const [score, setScore] = useState<0 | 1 | null>(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  // Effect to restore state from existing result
  useEffect(() => {
    if (isResetting) return;
    if (existingResult?.completed) {
      setIsRestoring(true);
      setMainAnswer(existingResult.mainAnswer);
      const subAnswers = existingResult.subAnswers || [];
      if (subAnswers[0]) setFollowUpAnswer(subAnswers[0] as "yes" | "no");
      const finalScore = existingResult.result === "pass" ? 0 : 1;
      setScore(finalScore);
      setTimeout(() => setIsRestoring(false), 100);
    } else if (existingResult === null || existingResult === undefined) {
      setMainAnswer(null);
      setFollowUpAnswer(null);
      setScore(null);
    }
  }, [existingResult, isResetting]);

  // Calculate score based on flowchart logic
  useEffect(() => {
    if (isRestoring) return;
    if (mainAnswer === "no") {
      setScore(1); // FAIL
    } else if (mainAnswer === "yes") {
      if (followUpAnswer === "yes") {
        setScore(0); // PASS
      } else if (followUpAnswer === "no") {
        setScore(1); // FAIL
      } else {
        setScore(null);
      }
    }
  }, [mainAnswer, followUpAnswer, isRestoring]);

  // Save result when score is calculated
  useEffect(() => {
    if (isRestoring) return;
    if (score !== null) {
      const result = score === 0 ? "pass" : "fail";
      const allSubAnswers: ("yes" | "no")[] = [];
      if (followUpAnswer !== null) {
        allSubAnswers.push(followUpAnswer);
      }
      
      dispatch(
        saveQuestionResult(
          13,
          result,
          mainAnswer || "no",
          allSubAnswers
        )
      );
    }
  }, [score, mainAnswer, followUpAnswer, dispatch, isRestoring]);

  const handleMainAnswer = (answer: "yes" | "no") => {
    setMainAnswer(answer);
    setFollowUpAnswer(null);
    setScore(null);
  };

  const handleFollowUpAnswer = (answer: "yes" | "no") => {
    setFollowUpAnswer(answer);
  };

  const handleResetQuestion = () => {
    setShowResetModal(true);
  };

  const handleConfirmReset = () => {
    setIsResetting(true);
    dispatch(clearQuestionResult(13));
    setMainAnswer(null);
    setFollowUpAnswer(null);
    setScore(null);
    setShowResetModal(false);
    setTimeout(() => setIsResetting(false), 100);
  };

  const handleCancelReset = () => {
    setShowResetModal(false);
  };

  const handleNext = () => {
    navigate("/question/14");
  };

  const handlePrev = () => {
    navigate("/question/12");
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
              <span className="text-sm font-medium text-gray-600">Question 13 of 20</span>
              <span className="text-sm font-medium text-gray-600">65%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full" style={{ width: '65%' }}></div>
            </div>
          </div>

          {/* Main Question */}
          <div className="mb-8">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full flex items-center justify-center font-bold text-xl mr-4">
                13
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                Does {childName} walk?
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

          {/* Follow-up Question */}
          {mainAnswer === "yes" && (
            <div className="mb-8">
              <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-6">
                {/* Follow-up Question Display */}
                <div className="flex items-center justify-between bg-white rounded-lg p-4 border border-purple-200 mb-3">
                  <span className="text-gray-700 font-medium text-md">
                    Does {getPronoun("subject")} walk without holding on to anything?
                  </span>
                  {followUpAnswer === null ? (
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleFollowUpAnswer("yes")}
                        className="px-4 py-2 rounded-lg text-md font-semibold transition-all border-2 bg-white text-gray-700 border-purple-400 hover:border-purple-500 hover:bg-purple-50"
                      >
                        YES
                      </button>
                      <button
                        onClick={() => handleFollowUpAnswer("no")}
                        className="px-4 py-2 rounded-lg text-md font-semibold transition-all border-2 bg-white text-gray-700 border-purple-400 hover:border-purple-500 hover:bg-purple-50"
                      >
                        NO
                      </button>
                    </div>
                  ) : (
                    <div className={`px-4 py-2 rounded-lg text-md font-semibold ${followUpAnswer === "yes" ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white" : "bg-gradient-to-r from-purple-500 to-indigo-500 text-white"}`}>
                      {followUpAnswer === "yes" ? "YES" : "NO"}
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
                Reset Question 13
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

export default Question13; 
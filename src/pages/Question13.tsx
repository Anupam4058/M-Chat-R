import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { saveQuestionResult } from "../redux/Action";
import { RootState } from "../redux/Store";

const Question13: React.FC = () => {
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

  // State for main answer and follow-up question
  const [mainAnswer, setMainAnswer] = useState<"yes" | "no" | null>(null);
  const [followUpAnswer, setFollowUpAnswer] = useState<"yes" | "no" | null>(null);
  const [score, setScore] = useState<0 | 1 | null>(null);

  // Calculate score based on flowchart logic
  useEffect(() => {
    if (mainAnswer === "no") {
      // No answer immediately results in FAIL (score 1)
      setScore(1);
    } else if (mainAnswer === "yes") {
      // Yes answer leads to follow-up question
      if (followUpAnswer === "yes") {
        // "Does he/she walk without holding on to anything?" = Yes → PASS
        setScore(0);
      } else if (followUpAnswer === "no") {
        // "Does he/she walk without holding on to anything?" = No → FAIL
        setScore(1);
      } else {
        // Follow-up question not answered yet
        setScore(null);
      }
    }
  }, [mainAnswer, followUpAnswer]);

  // Save result when score is calculated
  useEffect(() => {
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
  }, [score, mainAnswer, followUpAnswer, dispatch]);

  const handleMainAnswer = (answer: "yes" | "no") => {
    setMainAnswer(answer);
    setFollowUpAnswer(null);
    setScore(null);
  };

  const handleFollowUpAnswer = (answer: "yes" | "no") => {
    setFollowUpAnswer(answer);
  };

  const handleNext = () => {
    navigate("/question/14");
  };

  const handlePrev = () => {
    navigate("/question/12");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-indigo-200">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto bg-white/80 rounded-2xl shadow-2xl p-6 md:p-8">
          
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

          {/* Follow-up Question */}
          {mainAnswer === "yes" && (
            <div className="mb-8">
              <div className="bg-purple-100 border border-purple-200 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Does {getPronoun("subject")} walk without holding on to anything?
                </h2>
                
                {/* Follow-up Answer Buttons - Vertical Layout */}
                <div className="flex flex-col gap-4">
                  <button
                    onClick={() => handleFollowUpAnswer("yes")}
                    className={`px-8 py-4 rounded-lg font-semibold transition-all border-2 flex items-center justify-start ${
                      followUpAnswer === "yes"
                        ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white border-purple-500 shadow-lg"
                        : "bg-white text-gray-700 border-purple-200 hover:border-purple-300 hover:bg-purple-50"
                    }`}
                  >
                    {followUpAnswer === "yes" && <span className="mr-2">✓</span>}
                    Yes
                  </button>
                  <button
                    onClick={() => handleFollowUpAnswer("no")}
                    className={`px-8 py-4 rounded-lg font-semibold transition-all border-2 flex items-center justify-start ${
                      followUpAnswer === "no"
                        ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white border-purple-500 shadow-lg"
                        : "bg-white text-gray-700 border-purple-200 hover:border-purple-300 hover:bg-purple-50"
                    }`}
                  >
                    No
                  </button>
                </div>
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
                  ? `${childName} shows appropriate walking abilities.` 
                  : `${childName} may need further evaluation for walking development.`
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

export default Question13; 
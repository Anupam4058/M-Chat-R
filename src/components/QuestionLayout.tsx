import React from "react";

interface QuestionLayoutProps {
  questionNumber: number;
  title: string;
  description: string;
  mainAnswer: "yes" | "no" | null;
  onMainAnswer: (answer: "yes" | "no") => void;
  subQuestions: Array<{ title: string; example: string }>;
  subAnswers: ("yes" | "no")[];
  onSubAnswer: (index: number, answer: "yes" | "no") => void;
  result: "pass" | "fail" | null;
  onNext: () => void;
  onPrev: () => void;
  yesDescription: string;
  noDescription: string;
}

const QuestionLayout: React.FC<QuestionLayoutProps> = ({
  questionNumber,
  title,
  description,
  mainAnswer,
  onMainAnswer,
  subQuestions,
  subAnswers,
  onSubAnswer,
  result,
  onNext,
  onPrev,
  yesDescription,
  noDescription,
}) => {
  const totalQuestions = 20;
  const progressPercentage = (questionNumber / totalQuestions) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Progress */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">
                Question {questionNumber} of {totalQuestions}
              </span>
              <span className="text-sm text-gray-500">
                {Math.round(progressPercentage)}% Complete
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="space-y-6">
            {/* Main Question */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {title}
              </h2>
              <p className="text-gray-600 mb-6">
                {description}
              </p>
            </div>

            {/* Main Yes/No Selection */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Please select your answer:
              </h3>
              <div className="flex space-x-4">
                <button
                  onClick={() => onMainAnswer("yes")}
                  className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                    mainAnswer === "yes"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Yes
                </button>
                <button
                  onClick={() => onMainAnswer("no")}
                  className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                    mainAnswer === "no"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  No
                </button>
              </div>
            </div>

            {/* Sub-questions */}
            {mainAnswer && subQuestions.length > 0 && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-800">
                  {mainAnswer === "yes" ? yesDescription : noDescription}
                </h3>
                
                <div className="space-y-4">
                  {subQuestions.map((subQuestion, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <p className="text-gray-700 mb-3 font-medium">
                        {subQuestion.title}
                      </p>
                      <div className="flex space-x-3">
                        <button
                          onClick={() => onSubAnswer(index, "yes")}
                          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                            subAnswers[index] === "yes"
                              ? "bg-green-600 text-white"
                              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                          }`}
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => onSubAnswer(index, "no")}
                          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                            subAnswers[index] === "no"
                              ? "bg-red-600 text-white"
                              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                          }`}
                        >
                          No
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Result Display */}
            {result && (
              <div className={`mt-6 p-4 rounded-lg ${
                result === "pass" 
                  ? "bg-green-100 border border-green-300" 
                  : "bg-red-100 border border-red-300"
              }`}>
                <h4 className={`font-semibold ${
                  result === "pass" ? "text-green-800" : "text-red-800"
                }`}>
                  Result: {result === "pass" ? "PASS" : "FAIL"}
                </h4>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <button
              onClick={onPrev}
              className="px-6 py-2 rounded-md font-medium transition-colors bg-gray-600 text-white hover:bg-gray-700"
            >
              Previous
            </button>

            <button
              onClick={onNext}
              disabled={result === null}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                result !== null
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {questionNumber === totalQuestions ? "Finish" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionLayout; 
/**
 * Results Page Component
 * Displays the final results of the questionnaire including:
 * - Question-by-question results
 * - Pass/Fail status for each question
 * - Overall assessment
 * - PDF download option
 */

import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../redux/Store";
import PDFDownload from "../component/PDFDownload";

interface QuestionResult {
  questionId: number;
  result: "pass" | "fail";
  mainAnswer: "yes" | "no";
  subAnswers: ("yes" | "no")[];
  completed: boolean;
}

const Result = () => {
  // Get results from Redux store
  const questionResults = useSelector((state: RootState) => (state.answers as any).questionResults || []);

  // Prepare data for PDF
  const pdfData = questionResults.map((result: QuestionResult) => ({
    title: `Question ${result.questionId}`,
    description: `Main Answer: ${result.mainAnswer}`,
    answer: result.result,
    subAnswers: result.subAnswers.map((answer, index) => ({
      title: `Sub-question ${index + 1}`,
      answer: answer
    }))
  }));

  const totalQuestions = 20;
  const completedQuestions = questionResults.length;
  const passCount = questionResults.filter((r: QuestionResult) => r.result === "pass").length;
  const failCount = questionResults.filter((r: QuestionResult) => r.result === "fail").length;

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-100 via-purple-50 to-indigo-200 flex flex-col items-center justify-center py-8 px-2">
      <div className="w-full max-w-4xl bg-white/80 rounded-2xl shadow-2xl p-6 md:p-10">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-600 bg-clip-text text-transparent">
            M-CHAT Results
          </h1>
          <PDFDownload results={pdfData} />
        </div>

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-600">{completedQuestions}</div>
            <div className="text-sm text-blue-700">Questions Completed</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-600">{passCount}</div>
            <div className="text-sm text-green-700">Passed</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-red-600">{failCount}</div>
            <div className="text-sm text-red-700">Failed</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-gray-600">{totalQuestions - completedQuestions}</div>
            <div className="text-sm text-gray-700">Remaining</div>
          </div>
        </div>

        {questionResults.length > 0 ? (
          <div className="relative overflow-x-auto rounded-xl shadow-md">
            <table className="w-full text-sm text-left text-gray-700">
              <thead className="text-xs uppercase bg-gradient-to-r from-indigo-100 via-purple-100 to-indigo-200 text-indigo-700">
                <tr>
                  <th scope="col" className="px-6 py-3 rounded-tl-xl">Q. No.</th>
                  <th scope="col" className="px-6 py-3">Main Answer</th>
                  <th scope="col" className="px-6 py-3">Sub-Answers</th>
                  <th scope="col" className="px-6 py-3 rounded-tr-xl">Result</th>
                </tr>
              </thead>
              <tbody>
                {questionResults.map((result: QuestionResult, idx: number) => (
                  <tr key={idx} className="bg-white even:bg-indigo-50 border-b border-indigo-100 last:border-0">
                    <th scope="row" className="px-6 py-4 font-bold text-indigo-700 whitespace-nowrap">
                      {result.questionId}
                    </th>
                    <td className="px-6 py-4 font-medium text-gray-900 capitalize">
                      {result.mainAnswer}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {result.subAnswers.length > 0 
                        ? result.subAnswers.map((answer, index) => (
                            <span key={index} className={`inline-block px-2 py-1 rounded mr-1 text-xs ${
                              answer === "yes" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                            }`}>
                              {answer}
                            </span>
                          ))
                        : "None"
                      }
                    </td>
                    <td className="px-6 py-4 font-bold text-center">
                      <span className={result.result === "pass" ? "text-green-600" : "text-red-500"}>
                        {result.result === "pass" ? "Pass" : "Fail"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Results Available</h3>
            <p className="text-gray-500">Complete the questionnaire to see results here.</p>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-8 flex justify-center space-x-4">
          <button
            onClick={() => window.history.back()}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
          >
            Go Back
          </button>
          <button
            onClick={() => window.location.href = "/home"}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Start New Assessment
          </button>
        </div>
      </div>
    </div>
  );
};

export default Result;
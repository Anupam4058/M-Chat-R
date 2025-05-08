import React from "react";
import { useSelector } from "react-redux";
import { questionType } from "../types";

interface State extends questionType {
  index: number;
}
interface RootState {
  answers: State[];
}

const Result = () => {
  const answers = useSelector((state: RootState) => state.answers);
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-100 via-purple-50 to-indigo-200 flex flex-col items-center justify-center py-8 px-2">
      <div className="w-full max-w-4xl bg-white/80 rounded-2xl shadow-2xl p-6 md:p-10">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-8 bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-600 bg-clip-text text-transparent">Results</h1>
        <div className="relative overflow-x-auto rounded-xl shadow-md">
          <table className="w-full text-sm text-left text-gray-700">
            <thead className="text-xs uppercase bg-gradient-to-r from-indigo-100 via-purple-100 to-indigo-200 text-indigo-700">
              <tr>
                <th scope="col" className="px-6 py-3 rounded-tl-xl">Q. No.</th>
                <th scope="col" className="px-6 py-3">Question</th>
                <th scope="col" className="px-6 py-3 rounded-tr-xl">Result</th>
              </tr>
            </thead>
            <tbody>
              {answers && answers.map((data, idx) => (
                <tr key={idx} className="bg-white even:bg-indigo-50 border-b border-indigo-100 last:border-0">
                  <th
                    scope="row"
                    className="px-6 py-4 font-bold text-indigo-700 whitespace-nowrap"
                  >
                    {data.index + 1}
                  </th>
                  <td className="px-6 py-4 font-medium text-gray-900">{data.title}</td>
                  {data.answer === "pass" ? (
                    <td className="px-6 py-4 text-green-600 font-bold text-center">Pass</td>
                  ) : (
                    <td className="px-6 py-4 text-red-500 font-bold text-center">Fail</td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Result;

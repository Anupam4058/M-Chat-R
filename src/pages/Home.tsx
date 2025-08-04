/**
 * Home Page Component
 * Main landing page for the M-CHAT questionnaire
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { clearAllData } from "../redux/Action";

const Home = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const handleStartNewAssessment = () => {
    // Clear any existing data before starting new assessment
    dispatch(clearAllData());
    navigate("/child-info");
  };
  
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-100 via-purple-50 to-indigo-200 flex flex-col items-center justify-center py-8 px-2">
      <div className="w-full max-w-4xl bg-white/80 rounded-2xl shadow-2xl p-6 md:p-10">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-600 bg-clip-text text-transparent mb-4">
            M-CHAT Assessment
          </h1>
          <p className="text-xl text-gray-600 font-medium">
            Modified Checklist for Autism in Toddlers
          </p>
        </div>
        
        <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-indigo-100 rounded-xl p-8 mb-8 border border-indigo-200">
          <h2 className="text-2xl font-semibold text-indigo-800 mb-6 text-center">
            Welcome to the M-CHAT Assessment
          </h2>
          
          <div className="space-y-6 text-gray-700">
            <p className="text-lg leading-relaxed text-gray-700">
              The M-CHAT (Modified Checklist for Autism in Toddlers) is a screening tool designed to identify early signs of autism spectrum disorder in children between 16 and 30 months of age.
            </p>

            <div className="mt-8 space-y-4">
              <button
                onClick={handleStartNewAssessment}
                className="w-full py-4 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold text-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Start New Assessment
              </button>
              
              <button
                onClick={() => navigate("/result")}
                className="w-full py-4 px-6 bg-gray-600 text-white rounded-lg font-semibold text-lg hover:bg-gray-700 transition-all shadow-lg hover:shadow-xl"
              >
                View Previous Results
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-100 rounded-xl p-6 border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
              <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3">📋</span>
              What to Expect:
            </h3>
            <ul className="space-y-3 text-blue-700">
              <li className="flex items-start">
                <span className="text-blue-500 mr-3 text-lg">•</span>
                <span>20 questions about your child's behavior</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-3 text-lg">•</span>
                <span>Takes approximately 10-15 minutes to complete</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-3 text-lg">•</span>
                <span>Answer based on your child's typical behavior</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-3 text-lg">•</span>
                <span>You can save your progress and return later</span>
              </li>
            </ul>
          </div>
          
          <div className="bg-gradient-to-r from-amber-50 to-orange-100 rounded-xl p-6 border border-amber-200">
            <h3 className="text-lg font-semibold text-amber-800 mb-4 flex items-center">
              <span className="w-6 h-6 bg-amber-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3">⚠️</span>
              Important Note:
            </h3>
            <p className="text-amber-700 leading-relaxed">
              This assessment is a screening tool and should not be used as a diagnostic tool. 
              If you have concerns about your child's development, please consult with a healthcare professional.
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-indigo-100 rounded-xl p-6 border border-purple-200">
          <h3 className="text-lg font-semibold text-purple-800 mb-4 flex items-center">
            <span className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3">ℹ️</span>
            About M-CHAT
          </h3>
          <p className="text-purple-700 leading-relaxed">
            The M-CHAT was developed by Dr. Diana Robins, Dr. Deborah Fein, and Dr. Marianne Barton 
            to help identify children who may need further evaluation for autism spectrum disorder. 
            It is widely used by healthcare professionals and researchers worldwide.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;
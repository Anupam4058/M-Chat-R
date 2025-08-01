import React from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import ResultPDF from './ResultPDF';
import { useSelector } from 'react-redux';
import { questionType, AnswerState } from '../types';

interface PDFDownloadProps {
  results: Array<{
    title: string;
    description?: string;
    answer?: "pass" | "fail";
    subAnswers?: Array<{
      title: string;
      answer: "yes" | "no";
    }>;
  }>;
}

interface ReduxState {
  answers: {
    answers: Array<{
      index: number;
      answer: AnswerState;
    }>;
    currentQuestionIndex: number;
  };
}

const PDFDownload: React.FC<PDFDownloadProps> = ({ results }) => {
  const reduxAnswers = useSelector((state: ReduxState) => state.answers.answers);

  // Prepare complete data for PDF including all answers
  const pdfData = results.map((result, index) => {
    const reduxAnswer = reduxAnswers.find(a => a.index === index)?.answer;
    
    return {
      ...result,
      mainAnswer: reduxAnswer?.mainAnswer || '',
      subAnswers: reduxAnswer?.subAnswer?.map((answer, idx) => ({
        title: reduxAnswer?.currentLayer?.questions[idx]?.title || `Sub-question ${idx + 1}`,
        answer: answer
      })) || []
    };
  });

  return (
    <PDFDownloadLink
      document={<ResultPDF results={pdfData} />}
      fileName={`mchat-results-${new Date().toISOString().split('T')[0]}.pdf`}
      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
    >
      {({ blob, url, loading, error }) => (
        <span>
          {loading ? 'Generating PDF...' : 'Download Results PDF'}
        </span>
      )}
    </PDFDownloadLink>
  );
};

export default PDFDownload; 
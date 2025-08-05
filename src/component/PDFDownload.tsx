import React from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import ResultPDF from './ResultPDF';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/Store';
import QuestionsData from '../data/questionsData';

interface PDFDownloadProps {
  results: Array<{
    questionId: number;
    result: "pass" | "fail";
    mainAnswer: "yes" | "no";
    completed: boolean;
  }>;
}

const PDFDownload: React.FC<PDFDownloadProps> = ({ results }) => {
  const questionResults = useSelector((state: RootState) => (state as any).questionResults || []);

  // Prepare complete data for PDF in the format expected by ResultPDF
  const pdfData = questionResults
    .filter((result: any) => result.completed)
    .map((result: any) => {
      // Find the question data for this result
      const questionData = QuestionsData.find((q: any) => q.id === result.questionId);
      const questionTitle = questionData ? questionData.title : `Question ${result.questionId}`;
      
      return {
        title: `Question ${result.questionId}`,
        description: questionTitle,
        answer: result.result,
        userExample: result.userExample,
        subAnswers: [] // Could be populated with sub-answers if needed
      };
    });

  return (
    <PDFDownloadLink
      document={<ResultPDF results={pdfData} />}
      fileName={`mchat-results-${new Date().toISOString().split('T')[0]}.pdf`}
      className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
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
import React from 'react';
import { Document, Page, Text, View, StyleSheet, PDFViewer } from '@react-pdf/renderer';
import { questionType } from '../types';

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    color: '#4f46e5',
    fontWeight: 'bold',
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
  },
  questionContainer: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#f3f4f6',
    borderRadius: 5,
  },
  mainQuestion: {
    fontSize: 14,
    marginBottom: 5,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  mainAnswer: {
    fontSize: 12,
    marginLeft: 20,
    marginBottom: 5,
    color: '#4b5563',
  },
  subQuestion: {
    fontSize: 12,
    marginLeft: 20,
    marginBottom: 3,
    color: '#4b5563',
  },
  subAnswer: {
    fontSize: 12,
    marginLeft: 40,
    marginBottom: 3,
    color: '#059669',
  },
  result: {
    fontSize: 12,
    marginLeft: 20,
    marginTop: 5,
    color: '#dc2626',
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    color: '#6b7280',
    fontSize: 10,
  },
});

interface ResultPDFProps {
  results: Array<{
    title: string;
    description?: string;
    mainAnswer?: string;
    answer?: "pass" | "fail";
    subAnswers?: Array<{
      title: string;
      answer: "yes" | "no";
    }>;
  }>;
}

const ResultPDF: React.FC<ResultPDFProps> = ({ results }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.header}>M-CHAT-R Questionnaire Results</Text>
      
      <View style={styles.section}>
        {results.map((question, index) => (
          <View key={index} style={styles.questionContainer}>
            <Text style={styles.mainQuestion}>
              {index + 1}. {question.title}
            </Text>
            {question.description && (
              <Text style={styles.subQuestion}>
                Description: {question.description}
              </Text>
            )}
            {question.mainAnswer && (
              <Text style={styles.mainAnswer}>
                Main Answer: {question.mainAnswer.toUpperCase()}
              </Text>
            )}
            {question.subAnswers && question.subAnswers.length > 0 && (
              <View>
                <Text style={styles.subQuestion}>Sub-questions:</Text>
                {question.subAnswers.map((subAnswer, subIndex) => (
                  <View key={subIndex}>
                    <Text style={styles.subQuestion}>
                      • {subAnswer.title}
                    </Text>
                    <Text style={styles.subAnswer}>
                      Answer: {subAnswer.answer.toUpperCase()}
                    </Text>
                  </View>
                ))}
              </View>
            )}
            <Text style={styles.result}>
              Final Result: {question.answer?.toUpperCase() || 'Not Answered'}
            </Text>
          </View>
        ))}
      </View>

      <Text style={styles.footer}>
        Generated on {new Date().toLocaleDateString()}
      </Text>
    </Page>
  </Document>
);

export default ResultPDF; 
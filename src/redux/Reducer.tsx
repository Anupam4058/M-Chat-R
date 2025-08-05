/**
 * Redux Reducer
 * Handles state updates for the questionnaire application
 */

import { AnswerState } from "../types";
import { ActionTypes, ChildInfoData } from "./Action";

// Answer entry interface for storing question answers
interface AnswerEntry {
  index: number;
  answer: AnswerState;
}

// Individual question result interface
interface QuestionResult {
  questionId: number;
  result: "pass" | "fail";
  mainAnswer: "yes" | "no";
  subAnswers: ("yes" | "no" | "zero" | "one")[];
  mostOften?: "zero" | "one";
  userExample?: string;
  completed: boolean;
}

// State interface for the answers slice
interface AnswersState {
  answers: AnswerEntry[];
  currentQuestionIndex: number;
  questionResults: QuestionResult[];
  childInfo: ChildInfoData | null;
}

// Initial state
const initialState: AnswersState = {
  answers: [],
  currentQuestionIndex: 0,
  questionResults: [],
  childInfo: null,
};

/**
 * Main reducer function for handling answer-related actions
 * @param state - Current state
 * @param action - Action to process
 * @returns Updated state
 */
const handleAnswers = (state: AnswersState = initialState, action: ActionTypes): AnswersState => {
  switch (action.type) {
    case "update_answer":
      const newAnswers = [...state.answers];
      const existingIndex = newAnswers.findIndex(a => a.index === action.payload.index);
      
      if (existingIndex >= 0) {
        // Update existing answer
        newAnswers[existingIndex] = action.payload;
      } else {
        // Add new answer
        newAnswers.push(action.payload);
      }
      
      return { 
        ...state, 
        answers: newAnswers 
      };
      
    case "SET_CURRENT_QUESTION":
      return { 
        ...state, 
        currentQuestionIndex: action.payload 
      };
      
    case "SAVE_QUESTION_RESULT":
      const newQuestionResults = [...state.questionResults];
      const existingResultIndex = newQuestionResults.findIndex(r => r.questionId === action.payload.questionId);
      
      const questionResult: QuestionResult = {
        questionId: action.payload.questionId,
        result: action.payload.result,
        mainAnswer: action.payload.mainAnswer,
        subAnswers: action.payload.subAnswers,
        mostOften: action.payload.mostOften,
        userExample: action.payload.userExample,
        completed: true,
      };
      
      if (existingResultIndex >= 0) {
        // Update existing result
        newQuestionResults[existingResultIndex] = questionResult;
      } else {
        // Add new result
        newQuestionResults.push(questionResult);
      }
      
      return {
        ...state,
        questionResults: newQuestionResults,
      };
      
    case "SAVE_COMPLEX_QUESTION_RESULT":
      const newComplexResults = [...state.questionResults];
      const existingComplexIndex = newComplexResults.findIndex(r => r.questionId === action.payload.questionId);
      
      const complexQuestionResult: any = {
        questionId: action.payload.questionId,
        result: action.payload.result,
        mainAnswer: action.payload.mainAnswer,
        completed: true,
        ...action.payload.complexData, // Spread the complex data
      };
      
      if (existingComplexIndex >= 0) {
        // Update existing result
        newComplexResults[existingComplexIndex] = complexQuestionResult;
      } else {
        // Add new result
        newComplexResults.push(complexQuestionResult);
      }
      
      return {
        ...state,
        questionResults: newComplexResults,
      };
      
    case "CLEAR_QUESTION_RESULT":
      return {
        ...state,
        questionResults: state.questionResults.filter(r => r.questionId !== action.payload.questionId),
      };
      
    case "SET_QUESTION_COMPLETED":
      const updatedQuestionResults = [...state.questionResults];
      const resultIndex = updatedQuestionResults.findIndex(r => r.questionId === action.payload.questionId);
      
      if (resultIndex >= 0) {
        updatedQuestionResults[resultIndex] = {
          ...updatedQuestionResults[resultIndex],
          completed: action.payload.completed,
        };
      }
      
      return {
        ...state,
        questionResults: updatedQuestionResults,
      };
      
    case "SAVE_CHILD_INFO":
      return {
        ...state,
        childInfo: action.payload,
      };
      
    case "CLEAR_CHILD_INFO":
      return {
        ...state,
        childInfo: null,
      };
      
    case "CLEAR_ALL_DATA":
      // Clear localStorage when clearing all data
      try {
        localStorage.removeItem('mchat-assessment-state');
      } catch (err) {
        // Ignore errors
      }
      return {
        ...initialState,
      };
      
    default:
      return state;
  }
};

export default handleAnswers;
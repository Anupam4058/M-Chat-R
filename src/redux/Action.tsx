/**
 * Redux Action Types and Creators
 * Defines the action types and creators for the questionnaire state management
 */

import { questionType, AnswerState } from "../types";

// Child information interface
export interface ChildInfoData {
  guardianName: string;
  guardianPhone: string;
  childName: string;
  gender: "male" | "female";
  dateOfBirth: string;
  city: string;
}

// Base state interface extending question type
interface State extends questionType {
  index: number;
}

// Action type definitions
export type ActionTypes = 
  | { type: "update_answer"; payload: { index: number; answer: AnswerState } }
  | { type: "SET_CURRENT_QUESTION"; payload: number }
  | { type: "SAVE_QUESTION_RESULT"; payload: { questionId: number; result: "pass" | "fail"; mainAnswer: "yes" | "no"; subAnswers: ("yes" | "no" | "zero" | "one")[] } }
  | { type: "SAVE_COMPLEX_QUESTION_RESULT"; payload: { questionId: number; result: "pass" | "fail"; mainAnswer: "yes" | "no"; complexData: any } }
  | { type: "CLEAR_QUESTION_RESULT"; payload: { questionId: number } }
  | { type: "SET_QUESTION_COMPLETED"; payload: { questionId: number; completed: boolean } }
  | { type: "SAVE_CHILD_INFO"; payload: ChildInfoData }
  | { type: "CLEAR_CHILD_INFO"; payload: void }
  | { type: "CLEAR_ALL_DATA"; payload: void };

/**
 * Action creator for updating an answer
 * @param index - Question index
 * @param answer - Answer state to update
 */
export const updateAnswer = (index: number, answer: AnswerState): ActionTypes => ({
  type: "update_answer",
  payload: { index, answer }
});

/**
 * Action creator for setting the current question
 * @param index - Question index to set as current
 */
export const setCurrentQuestion = (index: number): ActionTypes => ({
  type: "SET_CURRENT_QUESTION",
  payload: index
});

/**
 * Action creator for saving individual question results
 * @param questionId - Question ID (1-20)
 * @param result - Pass or fail result
 * @param mainAnswer - Main yes/no answer
 * @param subAnswers - Array of sub-question answers
 */
export const saveQuestionResult = (
  questionId: number, 
  result: "pass" | "fail", 
  mainAnswer: "yes" | "no", 
  subAnswers: ("yes" | "no" | "zero" | "one")[]
): ActionTypes => ({
  type: "SAVE_QUESTION_RESULT",
  payload: { questionId, result, mainAnswer, subAnswers }
});

/**
 * Action creator for saving complex question results (like Question18)
 * @param questionId - Question ID (1-20)
 * @param result - Pass or fail result
 * @param mainAnswer - Main yes/no answer
 * @param complexData - Complex data object with specific question properties
 */
export const saveComplexQuestionResult = (
  questionId: number, 
  result: "pass" | "fail", 
  mainAnswer: "yes" | "no", 
  complexData: any
): ActionTypes => ({
  type: "SAVE_COMPLEX_QUESTION_RESULT",
  payload: { questionId, result, mainAnswer, complexData }
});

/**
 * Action creator for clearing a question result
 * @param questionId - Question ID to clear
 */
export const clearQuestionResult = (questionId: number): ActionTypes => ({
  type: "CLEAR_QUESTION_RESULT",
  payload: { questionId }
});

/**
 * Action creator for marking a question as completed
 * @param questionId - Question ID
 * @param completed - Whether the question is completed
 */
export const setQuestionCompleted = (questionId: number, completed: boolean): ActionTypes => ({
  type: "SET_QUESTION_COMPLETED",
  payload: { questionId, completed }
});

/**
 * Action creator for saving child information
 * @param childInfo - Child and guardian information
 */
export const saveChildInfo = (childInfo: ChildInfoData): ActionTypes => ({
  type: "SAVE_CHILD_INFO",
  payload: childInfo
});

/**
 * Action creator for clearing child information
 */
export const clearChildInfo = (): ActionTypes => ({
  type: "CLEAR_CHILD_INFO",
  payload: undefined
});

/**
 * Action creator for clearing all assessment data (child info and question results)
 */
export const clearAllData = (): ActionTypes => ({
  type: "CLEAR_ALL_DATA",
  payload: undefined
});
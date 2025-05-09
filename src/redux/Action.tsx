/**
 * Redux Action Types and Creators
 * Defines the action types and creators for the questionnaire state management
 */

import { questionType, AnswerState } from "../types";

// Base state interface extending question type
interface State extends questionType {
  index: number;
}

// Action type definitions
export type ActionTypes = 
  | { type: "update_answer"; payload: { index: number; answer: AnswerState } }
  | { type: "SET_CURRENT_QUESTION"; payload: number };

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
/**
 * Redux Reducer
 * Handles state updates for the questionnaire application
 */

import { AnswerState } from "../types";
import { ActionTypes } from "./Action";

// Answer entry interface for storing question answers
interface AnswerEntry {
  index: number;
  answer: AnswerState;
}

// State interface for the answers slice
interface AnswersState {
  answers: AnswerEntry[];
  currentQuestionIndex: number;
}

// Initial state
const initialState: AnswersState = {
  answers: [],
  currentQuestionIndex: 0,
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
      
    default:
      return state;
  }
};

export default handleAnswers;
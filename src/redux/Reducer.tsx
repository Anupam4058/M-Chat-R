import { questionType } from "../types";
import { ActionTypes } from "./Action";

interface State extends questionType {
  index: number;
}

interface AnswersState {
  answers: State[];
  currentQuestionIndex: number;
}

const initialState: AnswersState = {
  answers: [],
  currentQuestionIndex: 0,
};

const handleAnswers = (state: AnswersState = initialState, action: ActionTypes): AnswersState => {
  switch (action.type) {
    case "update_answer":
      const arr = [...state.answers];
      arr[action.payload.index] = action.payload;
      return { ...state, answers: arr };
    case "SET_CURRENT_QUESTION":
      return { ...state, currentQuestionIndex: action.payload };
    default:
      return state;
  }
};

export default handleAnswers;
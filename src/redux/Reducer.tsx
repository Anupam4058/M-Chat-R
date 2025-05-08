import { questionType } from "../types";

interface State extends questionType {
  index: number;
}

const initialState: State[] | [] = [];

const handleAnswers = (state: State[] | [] = initialState, action: any) => {
    console.log("==>", action)
  switch (action.type) {
    case "update_answer":
      let arr = [...state];
      arr[action.payload.index] = action.payload;
      return arr;

    default:
      return initialState
  }
};

export default handleAnswers
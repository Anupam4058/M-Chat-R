import { questionType } from "../types"

interface State extends questionType {
    index: number;
  }

export const updateAnswer = (data: State) => {
    return({
        type: "update_answer",
        payload: data
    })
}
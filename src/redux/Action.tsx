import { questionType } from "../types"

interface State extends questionType {
    index: number;
}

export type ActionTypes = 
    | { type: "update_answer"; payload: State }
    | { type: "SET_CURRENT_QUESTION"; payload: number };

export const updateAnswer = (data: State): ActionTypes => ({
    type: "update_answer",
    payload: data
});

export const setCurrentQuestion = (index: number): ActionTypes => ({
    type: "SET_CURRENT_QUESTION",
    payload: index
});
import { configureStore } from '@reduxjs/toolkit'
import handleAnswers from './Reducer'
import { ActionTypes } from './Action'

// Define the root state type
export type RootState = {
  answers: {
    answers: any[]
    currentQuestionIndex: number
  }
}

// Create the store with proper typing
const store = configureStore({
  reducer: {
    answers: handleAnswers as any, // Type assertion to handle Redux's action types
  },
})

export default store
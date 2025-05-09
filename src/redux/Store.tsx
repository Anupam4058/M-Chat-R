import { configureStore } from '@reduxjs/toolkit'
import handleAnswers from './Reducer'
import { ActionTypes } from './Action'


// Create the store with proper typing
const store = configureStore({
  reducer: {
    answers: handleAnswers as any, // Type assertion to handle Redux's action types
  },
});
// Infer the RootState type
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store
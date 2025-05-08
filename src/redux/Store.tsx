import { configureStore } from '@reduxjs/toolkit'
import handleAnswers from './Reducer'

export default configureStore({
  reducer: {
    answers: handleAnswers
  },
})
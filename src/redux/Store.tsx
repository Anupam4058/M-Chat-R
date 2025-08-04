import { configureStore } from '@reduxjs/toolkit'
import handleAnswers from './Reducer'

// Storage key for localStorage
const STORAGE_KEY = 'mchat-assessment-data';

// Load state from localStorage
const loadState = () => {
  try {
    const serializedState = localStorage.getItem(STORAGE_KEY);
    if (serializedState === null) {
      return undefined;
    }
    const parsed = JSON.parse(serializedState);
    console.log('Loaded state from localStorage:', parsed);
    return parsed;
  } catch (err) {
    console.warn('Failed to load state from localStorage:', err);
    return undefined;
  }
};

// Save state to localStorage
const saveState = (state: any) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem(STORAGE_KEY, serializedState);
    console.log('Saved state to localStorage:', state);
  } catch (err) {
    console.warn('Failed to save state to localStorage:', err);
  }
};

// Get persisted state
const persistedState = loadState();

// Create the store
const store = configureStore({
  reducer: handleAnswers as any,
  preloadedState: persistedState,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

// Subscribe to store updates to save to localStorage
store.subscribe(() => {
  const state = store.getState();
  saveState(state);
});

// Define RootState type to match the actual state structure
export type RootState = ReturnType<typeof handleAnswers>;
export type AppDispatch = typeof store.dispatch;

export default store
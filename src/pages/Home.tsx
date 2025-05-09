/**
 * Home Page Component
 * Main questionnaire page that handles:
 * - Question navigation
 * - Answer state management
 * - Progress tracking
 * - Results collection
 */

import React, { useEffect, useRef } from "react";
import Question from "../component/Question";

import QuestionsData from "../data/questionsData";
import { AnswerState, questionType } from "../types";
import { useDispatch, useSelector } from "react-redux";
import { updateAnswer, setCurrentQuestion } from "../redux/Action";
import { useNavigate } from "react-router-dom";
import Layout from "../component/Layout";
import { RootState } from "../redux/Store";

// Type definitions for answer entries and Redux state
interface AnswerEntry {
  index: number;
  answer: AnswerState;
}

interface ReduxState {
  answers: {
    answers: AnswerEntry[];
    currentQuestionIndex: number;
  };
}

const Home = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Get current state from Redux store
  const answers = useSelector((state: ReduxState) => state.answers.answers);
  const currentQuestionIndex = useSelector((state: ReduxState) => state.answers.currentQuestionIndex);

  // Find current answer and question
  const currentAnswer = answers.find((a: AnswerEntry) => a.index === currentQuestionIndex)?.answer;
  const currentQuestion = React.useMemo(() => {
    const base = QuestionsData[currentQuestionIndex];
    return currentAnswer ? { ...base, ...currentAnswer } : base;
  }, [currentQuestionIndex, currentAnswer]);

  // Track answered questions
  const answeredQuestions = React.useMemo(() =>
    answers
      ? answers
          .map((a: AnswerEntry) => a?.index)
          .filter((i: number | undefined): i is number => i !== undefined)
      : [],
    [answers]
  );

  /**
   * Handles moving to the next question
   * @param index - Current question index
   * @param answerState - Current answer state
   */
  const handleNextQuestion = (index: number, answerState: AnswerState) => {
    // Create a complete answer object including the pass/fail result
    const completeAnswer = {
      ...answerState,
      answer: answerState.passCheck
    };

    dispatch(updateAnswer(index, answerState));
    
    if (index + 1 === QuestionsData.length) {
      // Prepare final data before navigating to results
      const finalResults = QuestionsData.map((q, i) => ({
        ...q,
        index: i,
        answer: answers[i]?.answer?.passCheck || "fail"
      }));
      
      navigate("/result", { state: { results: finalResults } });
    } else {
      dispatch(setCurrentQuestion(index + 1));
    }
  };

  /**
   * Handles moving to the previous question
   * @param index - Current question index
   */
  const handlePrevClick = (index: number) => {
    if (index === 0) return;
    dispatch(setCurrentQuestion(index - 1));
  };

  /**
   * Handles direct question navigation
   * @param index - Target question index
   */
  const handleQuestionClick = (index: number) => {
    dispatch(setCurrentQuestion(index));
  };

  // Animation handling
  const questionContentRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (questionContentRef.current) {
      questionContentRef.current.classList.add("slide-in");
      const timer = setTimeout(() => {
        questionContentRef.current?.classList.remove("slide-in");
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [currentQuestion]);

  return (
    <Layout
      currentQuestionIndex={currentQuestionIndex}
      totalQuestions={QuestionsData.length}
      onQuestionClick={handleQuestionClick}
      answeredQuestions={answeredQuestions}
    >
      <Question
        question={currentQuestion}
        questionNo={currentQuestionIndex}
        handleNextQuestion={handleNextQuestion}
        handlePrevClick={handlePrevClick}
        totalQuestions={QuestionsData.length}
        answer={currentAnswer}
      />
    </Layout>
  );
};

export default Home;
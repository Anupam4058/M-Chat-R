import React, { useEffect, useRef } from "react";
import Question from "../component/Question";
import QuestionsData from "../data/questionsData";
import { questionType } from "../types";
import { useDispatch, useSelector } from "react-redux";
import { updateAnswer, setCurrentQuestion } from "../redux/Action";
import { useNavigate } from "react-router-dom";
import Layout from "../component/Layout";
import { RootState } from "../redux/Store";

const Home = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const answers = useSelector((state: RootState) => state.answers.answers);
  const currentQuestionIndex = useSelector((state: RootState) => state.answers.currentQuestionIndex);

  // Get the current question, merging with answer from Redux if available
  const currentQuestion = React.useMemo(() => {
    const base = QuestionsData[currentQuestionIndex];
    const answer = answers?.[currentQuestionIndex];
    return answer ? { ...base, ...answer } : base;
  }, [currentQuestionIndex, answers]);

  // List of answered question indices
  const answeredQuestions = React.useMemo(() =>
    answers ? answers.map((a) => a && a.index).filter((i) => i !== undefined) : [],
    [answers]
  );

  const handleNextQuestion = (index: number, answer: questionType) => {
    dispatch(updateAnswer({ ...answer, index }));
    dispatch(setCurrentQuestion(index + 1));
    if (index + 1 === QuestionsData.length) {
      navigate("/result");
      return;
    }
  };

  const handlePrevClick = (index: number) => {
    if (index === 0) return;
    dispatch(setCurrentQuestion(index - 1));
  };

  // Allow navigation to any answered question
  const handleQuestionClick = (index: number) => {
    dispatch(setCurrentQuestion(index));
  };

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
        answer={answers?.[currentQuestionIndex]}
      />
    </Layout>
  );
};

export default Home;

import React, { useEffect, useRef, useState } from "react";
import Question from "../component/Question";
import QuestionsData from "../data/questionsData";
import { questionType } from "../types";
import { useDispatch } from "react-redux";
import { updateAnswer } from "../redux/Action";
import { useNavigate } from "react-router-dom";
import Layout from "../component/Layout";

const Home = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState<questionType>(QuestionsData[0]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [answeredQuestions, setAnsweredQuestions] = useState<number[]>([]);

  const handleNextQuestion = (index: number, answer: questionType) => {
    dispatch(
      updateAnswer({
        ...answer,
        index: index,
      })
    );
    
    setAnsweredQuestions(prev => Array.from(new Set([...prev, index])));
    
    if (index + 1 === QuestionsData.length) {
      navigate("/result");
      return;
    }
    setCurrentQuestionIndex(index + 1);
    setCurrentQuestion(QuestionsData[index + 1]);
  };

  const handlePrevClick = (index: number) => {
    if (index === 0) {
      return;
    }
    setCurrentQuestionIndex(index - 1);
    setCurrentQuestion(QuestionsData[index - 1]);
  };

  const handleQuestionClick = (index: number) => {
    setCurrentQuestionIndex(index);
    setCurrentQuestion(QuestionsData[index]);
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
      />
    </Layout>
  );
};

export default Home;

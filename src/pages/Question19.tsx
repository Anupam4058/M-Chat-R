import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { saveQuestionResult } from "../redux/Action";
import QuestionLayout from "../components/QuestionLayout";
import { calculateQuestionResult } from "../utils/passFailLogic";
import { PassConditionType } from "../utils/passFailLogic";

const Question19: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const questionData = {
    id: 19,
    title: "If something new happens, does your child look at your face to see how you feel about it?",
    description: "if he or she hears a strange or funny noise, or sees a new toy, will he or she look at your face?",
    yesDescription: "",
    noDescription: "",
    yesSelected: {
      questions: [],
      passCondition: "pass-direct" as PassConditionType,
    },
    noSelected: {
      questions: [
        {title: "If your child hears a strange or scary noise, will he/she look at you before responding?",  example: ""},
      ],
      passCondition: "all-yes" as PassConditionType,
    },
  };

  const [mainAnswer, setMainAnswer] = useState<"yes" | "no" | null>(null);
  const [subAnswers, setSubAnswers] = useState<("yes" | "no")[]>([]);
  const [result, setResult] = useState<"pass" | "fail" | null>(null);

  useEffect(() => {
    if (mainAnswer !== null) {
      const calculatedResult = calculateQuestionResult(
        mainAnswer,
        subAnswers,
        questionData.yesSelected.passCondition,
        questionData.noSelected.passCondition
      );
      setResult(calculatedResult);

      if (calculatedResult !== null) {
        dispatch(
          saveQuestionResult(
            questionData.id,
            calculatedResult,
            mainAnswer,
            subAnswers
          )
        );
      }
    }
  }, [mainAnswer, subAnswers, dispatch]);

  const handleMainAnswer = (answer: "yes" | "no") => {
    setMainAnswer(answer);
    setSubAnswers([]);
  };

  const handleSubAnswer = (index: number, answer: "yes" | "no") => {
    const newSubAnswers = [...subAnswers];
    newSubAnswers[index] = answer;
    setSubAnswers(newSubAnswers);
  };

  const handleNext = () => {
    navigate("/question/20");
  };

  const handlePrev = () => {
    navigate("/question/18");
  };

  const getCurrentQuestions = () => {
    if (mainAnswer === "yes") {
      return questionData.yesSelected.questions;
    } else if (mainAnswer === "no") {
      return questionData.noSelected.questions;
    }
    return [];
  };

  return (
    <QuestionLayout
      questionNumber={questionData.id}
      title={questionData.title}
      description={questionData.description}
      mainAnswer={mainAnswer}
      onMainAnswer={handleMainAnswer}
      subQuestions={getCurrentQuestions()}
      subAnswers={subAnswers}
      onSubAnswer={handleSubAnswer}
      result={result}
      onNext={handleNext}
      onPrev={handlePrev}
      yesDescription={questionData.yesDescription}
      noDescription={questionData.noDescription}
    />
  );
};

export default Question19; 
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { saveQuestionResult } from "../redux/Action";
import QuestionLayout from "../components/QuestionLayout";
import { calculateQuestionResult } from "../utils/passFailLogic";
import { PassConditionType } from "../utils/passFailLogic";

const Question17: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const questionData = {
    id: 17,
    title: "Does your child try to get you to watch him or her?",
    description: 'does your child look at you for praise, or say "Look" or "Watch me"?',
    yesDescription: "",
    noDescription: "",
    yesSelected: {
      questions: [
        { title: 'Say "Look" or "Watch me"?', example: "pass" },
        { title: "Babble or make a noise to get you to watch", example: "pass" },
        { title: "what he/ she is doing?", example: "pass" },
        { title: "Look at you to get praise or comment?", example: "pass" },
        { title: "Keep looking to see if you are looking?", example: "pass" },
      ],
      passCondition: "any-yes" as PassConditionType,
    },
    noSelected: {
      questions: [
        { title: 'Say "Look" or "Watch me"?', example: "pass" },
        { title: "Babble or make a noise to get you to watch", example: "pass" },
        { title: "what he/ she is doing?", example: "pass" },
        { title: "Look at you to get praise or comment?", example: "pass" },
        { title: "Keep looking to see if you are looking?", example: "pass" },
      ],
      passCondition: "any-yes" as PassConditionType,
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
    navigate("/question/18");
  };

  const handlePrev = () => {
    navigate("/question/16");
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

export default Question17; 
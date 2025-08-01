import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { saveQuestionResult } from "../redux/Action";
import QuestionLayout from "../components/QuestionLayout";
import { calculateQuestionResult } from "../utils/passFailLogic";
import { PassConditionType } from "../utils/passFailLogic";

const Question16: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const questionData = {
    id: 16,
    title: "If you turn your head to look at something, does your child look around to see what you are looking at?",
    description: "wave bye-bye, clap, or make a funny noise when you do)",
    yesDescription: "",
    noDescription: "",
    yesSelected: {
      questions: [],
      passCondition: "pass-direct" as PassConditionType,
    },
    noSelected: {
      questions: [
        { title: "Look toward the thing you are looking at?", example: "pass" },
        { title: "Point toward the thing you are looking at? ", example: "pass" },
        { title: "Look around to see what you are looking at?", example: "pass" },
        { title: "Ignore you?", example: "fail" },
        { title: "Look at your face?", example: "fail" },
      ],
      passCondition: "yes-to-only-pass-fail" as PassConditionType,
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
    navigate("/question/17");
  };

  const handlePrev = () => {
    navigate("/question/15");
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

export default Question16; 
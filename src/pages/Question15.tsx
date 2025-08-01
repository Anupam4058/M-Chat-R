import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { saveQuestionResult } from "../redux/Action";
import QuestionLayout from "../components/QuestionLayout";
import { calculateQuestionResult } from "../utils/passFailLogic";
import { PassConditionType } from "../utils/passFailLogic";

const Question15: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const questionData = {
    id: 15,
    title: "Does your child look you in the eye when you are talking to him or her, playing with him or her, or dressing him or her?",
    description: "",
    yesDescription: "Please give me an example of when he/she looks you in the eye. (If parent does not give one of the following PASS examples, ask each individually.)",
    noDescription: "Does he/she look you in the eye…",
    yesSelected: {
      questions: [
        { title: "When he/she needs something?", example: "" },
        { title: "When you are playing with him/her?", example: "" },
        { title: "During feeding?", example: "" },
        { title: "During diaper changes?", example: "" },
        { title: "When you are reading him/her a story?", example: "" },
        { title: "When you are talking to him/her?", example: "" },
      ],
      passCondition: "yes-to-two-or-more" as PassConditionType,
    },
    noSelected: {
      questions: [
        { title: "When he/she needs something?", example: "" },
        { title: "When you are playing with him/her?", example: "" },
        { title: "During feeding?", example: "" },
        { title: "During diaper changes?", example: "" },
        { title: "When you are reading him/her a story?", example: "" },
        { title: "When you are talking to him/her?", example: "" },
      ],
      passCondition: "yes-to-two-or-more" as PassConditionType,
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
    navigate("/question/16");
  };

  const handlePrev = () => {
    navigate("/question/14");
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

export default Question15; 
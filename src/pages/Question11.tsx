import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { saveQuestionResult } from "../redux/Action";
import QuestionLayout from "../components/QuestionLayout";
import { calculateQuestionResult } from "../utils/passFailLogic";
import { PassConditionType } from "../utils/passFailLogic";

const Question11: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const questionData = {
    id: 11,
    title: "Does your child respond when you call his or her name?",
    description: "does he or she look up, talk or babble, or stop what he or she is doing when you call his or her name?)",
    yesDescription: "Please give me an example of how he/she responds when you call his/her name. (If parent does not give a PASS example below, ask each individually.)",
    noDescription: "If he/she is not involved in something fun or interesting, what does he/she do when you call his/her name? (If parent does not give a PASS example below, ask each individually.)",
    yesSelected: {
      questions: [
        { title: "Look up?", example: "pass" },
        { title: "Talk or babble?", example: "pass" },
        { title: "Stop what he/she is doing?", example: "pass" },
      ],
      passCondition: "all-yes" as PassConditionType,
    },
    noSelected: {
      questions: [
        { title: "Make no response?", example: "pass" },
        { title: "Seem to hear but ignores parent?", example: "pass" },
        { title: "Respond only if parent is right in front of the child's face?", example: "pass" },
        { title: "Respond only if touched?", example: "pass" },
      ],
      passCondition: "all-no" as PassConditionType,
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
    navigate("/question/12");
  };

  const handlePrev = () => {
    navigate("/question/10");
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

export default Question11; 
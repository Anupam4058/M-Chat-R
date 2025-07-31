import { questionType } from "../types";

const QuestionsData: questionType[] = [
  {
    id: 1,
    title: "If you point at something across the room, does your child look at it?",
    description: "For example, if you point at a toy or an animal, does your child look at the toy or animal?",
    yesDescription: "",
    noDescription: "",
    yesSelected: {
      questions: [],
      passCondition: "pass-direct",
    },
    noSelected: {
      questions: [],
      passCondition: "fail-direct",
    },
  },
  {
    id: 2,
    title: "Have you ever wondered if your child might be deaf?",
    description: "You reported that you have wondered if your child is deaf. What led you to wonder that?",
    yesDescription: "",
    noDescription: "",
    yesSelected: {
      questions: [],
      passCondition: "fail-direct",
    },
    noSelected: {
      questions: [],
      passCondition: "pass-direct",
    },
  },
  {
    id: 3,
    title: "Does your child play pretend or make-believe?",
    description: "For example, pretend to drink from an empty cup, pretend to talk on a phone, or pretend to feed a doll or stuffed animal?",
    yesDescription: "",
    noDescription: "",
    yesSelected: {
      questions: [],
      passCondition: "pass-direct",
    },
    noSelected: {
      questions: [],
      passCondition: "fail-direct",
    },
  },
  {
    id: 4,
    title: "Does your child like climbing on things?",
    description: "For example, furniture, playground equipment, or stairs",
    yesDescription: "",
    noDescription: "",
    yesSelected: {
      questions: [],
      passCondition: "pass-direct",
    },
    noSelected: {
      questions: [],
      passCondition: "fail-direct",
    },
  },
  {
    id: 5,
    title: "Does your child make unusual finger movements near his or her eyes?",
    description: "For example, does your child wiggle his or her fingers close to his or her eyes?",
    yesDescription: "",
    noDescription: "",
    yesSelected: {
      questions: [],
      passCondition: "fail-direct",
    },
    noSelected: {
      questions: [],
      passCondition: "pass-direct",
    },
  },
  {
    id: 6,
    title: "Does your child point with one finger to ask for something or to get help?",
    description: "For example, pointing to a snack or toy that is out of reach",
    yesDescription: "",
    noDescription: "",
    yesSelected: {
      questions: [],
      passCondition: "pass-direct",
    },
    noSelected: {
      questions: [],
      passCondition: "fail-direct",
    },
  },
  {
    id: 7,
    title: "Does your child point with one finger to show you something interesting?",
    description: "For example, pointing to an airplane in the sky or a big truck in the road",
    yesDescription: "",
    noDescription: "",
    yesSelected: {
      questions: [],
      passCondition: "pass-direct",
    },
    noSelected: {
      questions: [],
      passCondition: "fail-direct",
    },
  },
  {
    id: 8,
    title: "Is your child interested in other children?",
    description: "Does your child watch other children, smile at them, or go to them?",
    yesDescription: "",
    noDescription: "",
    yesSelected: {
      questions: [],
      passCondition: "pass-direct",
    },
    noSelected: {
      questions: [],
      passCondition: "fail-direct",
    },
  },
  {
    id: 9,
    title: "Does your child show you things by bringing them to you or holding them up for you to see – not to get help, but just to share?",
    description: "For example, showing you a flower, a stuffed animal, or a toy truck",
    yesDescription: "",
    noDescription: "",
    yesSelected: {
      questions: [],
      passCondition: "pass-direct",
    },
    noSelected: {
      questions: [],
      passCondition: "fail-direct",
    },
  },
  {
    id: 10,
    title: "Does your child respond when you call his or her name?",
    description: "Does he or she look up, talk or babble, or stop what he or she is doing when you call his or her name?",
    yesDescription: "",
    noDescription: "",
    yesSelected: {
      questions: [],
      passCondition: "pass-direct",
    },
    noSelected: {
      questions: [],
      passCondition: "fail-direct",
    },
  },
  {
    id: 11,
    title: "When you smile at your child, does he or she smile back at you?",
    description: "",
    yesDescription: "",
    noDescription: "",
    yesSelected: {
      questions: [],
      passCondition: "pass-direct",
    },
    noSelected: {
      questions: [],
      passCondition: "fail-direct",
    },
  },
  {
    id: 12,
    title: "Does your child get upset by everyday noises?",
    description: "Does your child scream or cry to noise such as a vacuum cleaner or loud music?",
    yesDescription: "",
    noDescription: "",
    yesSelected: {
      questions: [],
      passCondition: "fail-direct",
    },
    noSelected: {
      questions: [],
      passCondition: "pass-direct",
    },
  },
  {
    id: 13,
    title: "Does your child walk?",
    description: "",
    yesDescription: "",
    noDescription: "",
    yesSelected: {
      questions: [],
      passCondition: "pass-direct",
    },
    noSelected: {
      questions: [],
      passCondition: "fail-direct",
    },
  },
  {
    id: 14,
    title: "Does your child look you in the eye when you are talking to him or her, playing with him or her, or dressing him or her?",
    description: "",
    yesDescription: "",
    noDescription: "",
    yesSelected: {
      questions: [],
      passCondition: "pass-direct",
    },
    noSelected: {
      questions: [],
      passCondition: "fail-direct",
    },
  },
  {
    id: 15,
    title: "Does your child try to copy what you do?",
    description: "For example, wave bye-bye, clap, or make a funny noise when you do",
    yesDescription: "",
    noDescription: "",
    yesSelected: {
      questions: [],
      passCondition: "pass-direct",
    },
    noSelected: {
      questions: [],
      passCondition: "fail-direct",
    },
  },
  {
    id: 16,
    title: "If you turn your head to look at something, does your child look around to see what you are looking at?",
    description: "",
    yesDescription: "",
    noDescription: "",
    yesSelected: {
      questions: [],
      passCondition: "pass-direct",
    },
    noSelected: {
      questions: [],
      passCondition: "fail-direct",
    },
  },
  {
    id: 17,
    title: "Does your child try to get you to watch him or her?",
    description: "Does your child look at you for praise, or say 'Look' or 'Watch me'?",
    yesDescription: "",
    noDescription: "",
    yesSelected: {
      questions: [],
      passCondition: "pass-direct",
    },
    noSelected: {
      questions: [],
      passCondition: "fail-direct",
    },
  },
  {
    id: 18,
    title: "Does your child understand when you tell him or her to do something?",
    description: "If you don't point, can your child understand 'put the book on the chair' or 'bring me the blanket'?",
    yesDescription: "",
    noDescription: "",
    yesSelected: {
      questions: [],
      passCondition: "pass-direct",
    },
    noSelected: {
      questions: [],
      passCondition: "fail-direct",
    },
  },
  {
    id: 19,
    title: "If something new happens, does your child look at your face to see how you feel about it?",
    description: "If he or she hears a strange or funny noise, or sees a new toy, will he or she look at your face?",
    yesDescription: "",
    noDescription: "",
    yesSelected: {
      questions: [],
      passCondition: "pass-direct",
    },
    noSelected: {
      questions: [],
      passCondition: "fail-direct",
    },
  },
  {
    id: 20,
    title: "Does your child like movement activities?",
    description: "For example, being swung or bounced on your knee?",
    yesDescription: "",
    noDescription: "",
    yesSelected: {
      questions: [],
      passCondition: "pass-direct",
    },
    noSelected: {
      questions: [],
      passCondition: "fail-direct",
    },
  },
];

export default QuestionsData;

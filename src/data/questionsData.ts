import { questionType } from "../types";

const QuestionsData: questionType[] = [
  {
    id: 1,
    title:
      "If you point at something across the room, does your child look at it?",
    description:
      "if you point at a toy or an animal, does your child look at the toy or animal?",
    yesDescription:
      "Please give me an example of how he/she will respond if you point at something If parent does not give a PASS example below, ask each individually.",
    noDescription:
      "If you point at something, what does your child typically do?",
    yesSelected: {
      questions: [
        { title: "Look at object?", example: "pass" },
        { title: "Point to object?", example: "pass" },
        { title: "Look and comment on object?", example: "pass" },
        { title: "Look if you point and say “look!”?", example: "pass" },
      ],
      passCondition: "max-yes",
    },
    noSelected: {
      questions: [
        { title: "Ignores you?", example: "pass" },
        { title: "Look around room randomly?", example: "pass" },
        { title: "Look at your finger?", example: "pass" },
      ],
      passCondition: "max-yes",
    },
  },
  {
    id: 2,
    title: "Have you ever wondered if your child might be deaf?",
    description:
      "You reported that you have wondered if you child is deaf. What led you to wonder that?",
    yesDescription: "Does he/she…",
    noDescription: "",
    yesSelected: {
      questions: [
        { title: "often ignore sounds?", example: "pass" },
        { title: "often ignore people?", example: "pass" },
      ],
      passCondition: "all-no",
    },
    noSelected: {
      questions: [],
      passCondition: "pass-direct",
    },
  },
  {
    id: 3,
    title: "Does your child play pretend or make-believe?",
    description:
      "pretend to drink from an empty cup, pretend to talk on a phone, or pretend to feed a doll or stuffed animal?)",
    yesDescription:
      "Please give me an example of his/her pretend play. (If parent does not give a PASS example below, ask each individually.)",
    yesSelected: {
      questions: [
        { title: "Pretend to drink from a toy cup?", example: "pass" },
        { title: "Pretend to eat from a toy spoon or fork?", example: "pass" },
        { title: "Pretend to talk on the telephone?", example: "pass" },
        {
          title:
            "Pretend to feed a doll or stuffed animal with real or imaginary food?",
          example: "pass",
        },
        {
          title: "Push a car as if it is going along a pretend road?",
          example: "pass",
        },
        {
          title:
            "Pretend to be a robot, an airplane, a ballerina, or any other favorite character?",
          example: "pass",
        },
        { title: "Put a toy pot on a pretend stove?", example: "pass" },
        { title: "Stir imaginary food?", example: "pass" },
        {
          title:
            "Put an action figure or doll into a car or truck as if it is the driver or passenger?",
          example: "pass",
        },
        {
          title: "Pretend to vacuum the rug, sweep the floor, or mow the lawn?",
          example: "pass",
        },
      ],
      passCondition: "any-yes",
    },
    noSelected: {
      questions: [
        { title: "Pretend to drink from a toy cup?", example: "pass" },
        { title: "Pretend to eat from a toy spoon or fork?", example: "pass" },
        { title: "Pretend to talk on the telephone?", example: "pass" },
        {
          title:
            "Pretend to feed a doll or stuffed animal with real or imaginary food?",
          example: "pass",
        },
        {
          title: "Push a car as if it is going along a pretend road?",
          example: "pass",
        },
        {
          title:
            "Pretend to be a robot, an airplane, a ballerina, or any other favorite character?",
          example: "pass",
        },
        { title: "Put a toy pot on a pretend stove?", example: "pass" },
        { title: "Stir imaginary food?", example: "pass" },
        {
          title:
            "Put an action figure or doll into a car or truck as if it is the driver or passenger?",
          example: "pass",
        },
        {
          title: "Pretend to vacuum the rug, sweep the floor, or mow the lawn?",
          example: "pass",
        },
      ],
      passCondition: "all-yes",
    },
  },
  {
    id: 4,
    title: "Does your child like climbing on things?",
    description: "furniture, playground equipment, or stairs",
    yesDescription:
      "Please give me an example of something he/she enjoys climbing on. (If parent does not give a PASS example below, ask each individually.)",
    noDescription: "",
    yesSelected: {
      questions: [
        { title: "Stairs?", example: "pass" },
        { title: "Chairs?", example: "pass" },
        { title: "Furniture?", example: "pass" },
        { title: "Playground equipment?", example: "pass" },
      ],
      passCondition: "any-yes",
    },
    noSelected: {
      questions: [
        { title: "Stairs?", example: "pass" },
        { title: "Chairs?", example: "pass" },
        { title: "Furniture?", example: "pass" },
        { title: "Playground equipment?", example: "pass" },
      ],
      passCondition: "all-yes",
    },
  },
  {
    id: 5,
    title:
      "Does your child make unusual finger movements near his or her eyes?",
    description:
      "(FOR EXAMPLE, does your child wiggle his or her fingers close to his or her eyes?)",
    yesDescription:
      "Please describe these movements (If parent does not give a PASS example below, ask each individually.)",
    noDescription: "",
    yesSelected: {
      questions: [
        { title: "Wiggle his/her fingers near his/her eyes?", example: "pass" },
        {
          title: "Hold his/her hands up close to his/her eyes?",
          example: "pass",
        },
        {
          title: "Hold his/her hands off to the side of his/her eyes?",
          example: "pass",
        },
        { title: "Flap his/her hands near his/her face?", example: "pass" },
      ],
      passCondition: "all-no",
    },
    noSelected: {
      questions: [],
      passCondition: "pass-direct",
    },
  },
  {
    id: 6,
    title:
      "Does your child point with one finger to ask for something or to get help?",
    description: "pointing to a snack or toy that is out of reach",
    yesDescription: "",
    noDescription:
      "If there is something your child wants that is out of reach, such as a snack or toy that is out of reach, how does he/she get it? (If parent does not give a PASS example below, ask each individually.)",
    yesSelected: {
      questions: [],
      passCondition: "pass-direct",
    },
    noSelected: {
      questions: [
        {
          title: "Reach for the object with his/her whole hand?",
          example: "pass",
        },
        { title: "Lead you to the object?", example: "pass" },
        { title: "Try to get the object for him/herself?", example: "pass" },
        { title: "Ask for it using words or sounds?", example: "pass" },
      ],
      passCondition: "any-yes",
    },
  },
  {
    id: 7,
    title:
      "Does your child point with one finger to show you something interesting?",
    description:
      "pointing to an airplane in the sky or a big truck in the road",
    yesDescription:
      "Please give me an example something he/she might point at to show you. (If parent does not give a PASS example below, ask each individually.)",
    noDescription:
      "Does your child sometimes want you to see something interesting such as….",
    yesSelected: {
      questions: [
        { title: "An airplane in the sky?", example: "pass" },
        { title: "A truck on the road?", example: "pass" },
        { title: "A bug on the ground?", example: "pass" },
        { title: "An animal in the yard?", example: "pass" },
      ],
      passCondition: "any-yes",
    },
    noSelected: {
      questions: [
        {
          title: "An airplane in the sky?",
          example: "pass",
        },
        {
          title: "A truck on the road?",
          example: "pass",
        },
        {
          title: "A bug on the ground?",
          example: "pass",
        },
        {
          title: "An animal in the yard?",
          example: "pass",
        },
      ],
      passCondition: "any-yes",
    },
  },
  {
    id: 8,
    title: "Is your child interested in other children?",
    description:
      "does your child watch other children, smile at them, or go to them?)",
    yesDescription: "",
    noDescription: "",
    yesSelected: {
      questions: [
        {
          title:
            "Is he/she interested in children who are not his/her brother or sister?",
          example: "pass",
        },
      ],
      passCondition: "all-yes",
    },
    noSelected: {
      questions: [
        {
          title:
            "When you are at the playground or supermarket, does your child usually respond to other children?",
          example: "pass",
        },
      ],
      passCondition: "all-yes",
    },
  },
  {
    id: 9,
    title:
      "Does your child show you things by bringing them to you or holding them up for you to see – not to get help, but just to share?",
    description: "showing you a flower, a stuffed animal, or a toy truck)",
    yesDescription:
      "Please give me an example of something he/she might bring to show you or hold up for you to see. (If parent does not give one of the following PASS examples, ask each individually.)",
    noDescription: "",
    yesSelected: {
      questions: [
        { title: "A picture or toy just to show you?", example: "pass" },
        { title: "A drawing he/she has done?", example: "pass" },
        { title: "A flower he/she has picked?", example: "pass" },
        { title: "A bug he/she has found in the grass?", example: "pass" },
        { title: "A few blocks he/she has put together?", example: "pass" },
        { title: "Other (describe):", example: "pass" },
      ],
      passCondition: "any-yes",
    },
    noSelected: {
      questions: [
        { title: "A picture or toy just to show you?", example: "pass" },
        { title: "A drawing he/she has done?", example: "pass" },
        { title: "A flower he/she has picked?", example: "pass" },
        { title: "A bug he/she has found in the grass?", example: "pass" },
        { title: "A few blocks he/she has put together?", example: "pass" },
        { title: "Other (describe):", example: "pass" },
      ],
      passCondition: "any-yes",
    },
  },
  {
    id: 10,
    title: "Does your child respond when you call his or her name?",
    description:
      "does he or she look up, talk or babble, or stop what he or she is doing when you call his or her name?)",
    yesDescription:
      "Please give me an example of how he/she responds when you call his/her name. (If parent does not give a PASS example below, ask each individually.)",
    noDescription:
      "If he/she is not involved in something fun or interesting, what does he/she do when you call his/her name? (If parent does not give a PASS example below, ask each individually.)",
    yesSelected: {
      questions: [
        { title: "Look up?", example: "pass" },
        { title: "Talk or babble?", example: "pass" },
        { title: "Stop what he/she is doing?", example: "pass" },
      ],
      passCondition: "all-yes",
    },
    noSelected: {
      questions: [
        { title: "Make no response?", example: "pass" },
        { title: "Seem to hear but ignores parent?", example: "pass" },
        {
          title:
            "Respond only if parent is right in front of the child's face?",
          example: "pass",
        },
        { title: "Respond only if touched?", example: "pass" },
      ],
      passCondition: "all-no",
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
      questions: [
        { title: "Smile when you smile?", example: "pass" },
        { title: "Smile when you enter the room?", example: "pass" },
        { title: "Smile when you return from being away?", example: "pass" },
        { title: "Always smile?", example: "fail" },
        { title: "Smile at a favorite toy or activity?", example: "fail" },
        {
          title: "Smile randomly or at nothing in particular?",
          example: "fail",
        },
      ],
      passCondition: "yes-to-only-pass-fail",

    },
  },
  {
    id: 12,
    title: "Does your child get upset by everyday noises?",
    description:
      "does your child scream or cry to noise such as a vacuum cleaner or loud music?",
    yesDescription: "Does your child have a negative reaction to the sound of…",
    noDescription: "",
    yesSelected: {
      questions: [
        { title: "A washing machine?", example: "pass" },
        { title: "Babies crying?", example: "pass" },
        { title: "Vacuum cleaner?", example: "pass" },
        { title: "Hairdryer?", example: "pass" },
        { title: "Traffic?", example: "pass" },
        { title: "Babies squealing or screeching?", example: "pass" },
        { title: "Loud music?", example: "pass" },
        { title: "Telephone/doorbell ringing?", example: "pass" },
        { title: "Noisy places such as a supermarket or restaurant?",example: "pass",},
      ],
      passCondition: "yes-to-one-or-less",
      nextLayerCondition: 'yes-to-two-or-more',
      nextLayer: {
        title: "How does your child react to those noises? (If parent does not give a PASS example below, ask each individually.)",
        questions: [
          {title: "Calmly cover his/her ears?", example: "pass"},
          {title: "Tell you that he/she does not ", example: "pass"},
          {title: "like the noise?", example: "pass"},
          {title: "Scream?", example: "fail"},
          {title: "Cry?", example: "fail"},
          {title: "Cover his/her ears while upset?", example: "fail"},
        ],
        passCondition: 'yes-to-only-pass-fail'
      }
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
      questions: [
        { title: "Does he/she walk without holding on to anything?", example: "pass" },
      ],
      passCondition: "all-yes",
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
      title: "Please give me an example of when he/she looks you in the eye. (If parent does not give one of the following PASS examples, ask each individually.)",
      questions: [
        { title: "When he/she needs something?", example: "" },
        { title: "When you are playing with him/her?", example: "" },
        { title: "During feeding?", example: "" },
        { title: "During diaper changes?", example: "" },
        { title: "When you are reading him/her a story?", example: "" },
        { title: "When you are talking to him/her?", example: "" },
      ],
      passCondition: "yes-to-two-or-more",
      nextLayerCondition: "yes-to-only-one",
      nextLayer: {
        questions: [
          {title: "Does your child look you in the eye every day?", example: ""},
          {title: "On a day when you are together all day, does he/she look you in the eye at least 5 times?", example: ""}
        ],
        passCondition: "all-yes"
      }
    },
    noSelected: {
      title: "Does he/she look you in the eye…",
      questions: [
        { title: "When he/she needs something?", example: "" },
        { title: "When you are playing with him/her?", example: "" },
        { title: "During feeding?", example: "" },
        { title: "During diaper changes?", example: "" },
        { title: "When you are reading him/her a story?", example: "" },
        { title: "When you are talking to him/her?", example: "" },
      ],
      passCondition: "yes-to-two-or-more",
      nextLayerCondition: "yes-to-only-one",
      nextLayer: {
        questions: [
          {title: "Does your child look you in the eye every day?", example: ""},
          {title: "On a day when you are together all day, does he/she look you in the eye at least 5 times?", example: ""}
        ],
        passCondition: "all-yes"
      }
    },
  },
  {
    id: 15,
    title: "Does your child try to copy what you do?",
    description: "wave bye-bye, clap, or make a funny noise when you do)",
    yesDescription: "",
    noDescription: "",
    yesSelected: {
      title: "Please give me an example of something he/she would try to copy. (If parent does not give one of the following pass examples, ask each individually.)",
      questions: [
        { title: "Stick out your tongue?", example: "" },
        { title: "Make a funny sound? ", example: "" },
        { title: "Wave good bye?", example: "" },
        { title: "Clap your hands?", example: "" },
        { title: "Put your fingers to your lips", example: "" },
        { title: "to signal “Shhh”?", example: "" },
        { title: "Blow a kiss?", example: "" },
      ],
      passCondition: "yes-to-two-or-more",
    },
    noSelected: {
      title: "Does your child try to copy you if you…",
      questions: [
        { title: "Stick out your tongue?", example: "" },
        { title: "Make a funny sound? ", example: "" },
        { title: "Wave good bye?", example: "" },
        { title: "Clap your hands?", example: "" },
        { title: "Put your fingers to your lips", example: "" },
        { title: "to signal “Shhh”?", example: "" },
        { title: "Blow a kiss?", example: "" },
      ],
      passCondition: "yes-to-two-or-more",
    },
  },
  {
    id: 16,
    title: "If you turn your head to look at something, does your child look around to see what you are looking at?",
    description: "wave bye-bye, clap, or make a funny noise when you do)",
    yesDescription: "",
    noDescription: "",
    yesSelected: {
      questions: [],
      passCondition: "pass-direct",
    },
    noSelected: {
      title: "What does he/she do when you turn to look at something? (If parent does not give a PASS example below, ask each individually.)",
      questions: [
        { title: "Look toward the thing you are looking at?", example: "pass" },
        { title: "Point toward the thing you are looking at? ", example: "pass" },
        { title: "Look around to see what you are looking at?", example: "pass" },
        { title: "Ignore you?", example: "fail" },
        { title: "Look at your face?", example: "fail" },
      ],
      passCondition: "yes-to-only-pass-fail",
    },
  },
  {
    id: 17,
    title: "Does your child try to get you to watch him or her?",
    description: "does your child look at you for praise, or say “look” or “watch me”?",
    yesDescription: "",
    noDescription: "",
    yesSelected: {
      title: "Please give me an example of how he/she would try to get you to watch him/her. (If parent does not give a PASS example below, ask each individually.)",
      questions: [
        { title: "Say “Look!” or “Watch me!”?", example: "pass" },
        { title: "Babble or make a noise to get you to watch", example: "pass" },
        { title: "what he/ she is doing?", example: "pass" },
        { title: "Look at you to get praise or comment?", example: "pass" },
        { title: "Keep looking to see if you are looking?", example: "pass" },
      ],
      passCondition: "any-yes",
    },
    noSelected: {
      title: "Does he/she…",
      questions: [
        { title: "Say “Look!” or “Watch me!”?", example: "pass" },
        { title: "Babble or make a noise to get you to watch", example: "pass" },
        { title: "what he/ she is doing?", example: "pass" },
        { title: "Look at you to get praise or comment?", example: "pass" },
        { title: "Keep looking to see if you are looking?", example: "pass" },
      ],
      passCondition: "any-yes",
    },
  },
  {
    id: 18,
    title: "Does your child understand when you tell him or her to do something?",
    description: "if you don’t point, can your child understand “put the book on the chair” or “bring me the blanket”?)",
    yesDescription: "",
    noDescription: "",
    yesSelected: {
      title: "Please give me an example of how you know he/she understands you.",
      questions: [
        { title: "If example indicates that child can understand a simple command without nonverbal cues", example: "" },
      ],
      passCondition: "all-yes",
      nextLayerCondition: 'all-no',
      nextLayer: {
        questions: [
          {title: "When the situation gives him/her a clue, can he/she follow a command? For example when you are dressed to go out and you tell him/her to get his/her shoes, does he/she understand?",  example: ""},
          {title: "If it is dinnertime and food is on the table, and you tell the child to sit down, will he/she come sit at the table?",  example: ""}
        ],
        passCondition: 'next-layer',
        nextLayerCondition: 'all-yes',
        nextLayer: {
          title: 'When the situation does not give any clues, can he/she follow a command? For example… (ask until you get a yes or use all examples)',
          questions: [
            {title: 'If you say, “Show me your shoe” without pointing, making gestures, or giving hints (when you are not going out or getting dressed), does your child show you his/her shoe? ', example: ''},
            {title: 'If you say, “Bring me the blanket” or ask for another object without pointing, making gestures, or giving hints, does your child bring it to you?', example: ''},
            {title: ' If you say, “Put the book on the chair” without pointing, making gestures, or giving any other hints , does your child put the book on the chair?', example: ''}
          ],
          passCondition: 'any-yes'
        }
      }
    },
    noSelected: {
        questions: [
          {title: "When the situation gives him/her a clue, can he/she follow a command? For example when you are dressed to go out and you tell him/her to get his/her shoes, does he/she understand?",  example: ""},
          {title: "If it is dinnertime and food is on the table, and you tell the child to sit down, will he/she come sit at the table?",  example: ""}
        ],
        passCondition: 'next-layer',
        nextLayerCondition: 'all-yes',
        nextLayer: {
          title: 'When the situation does not give any clues, can he/she follow a command? For example… (ask until you get a yes or use all examples)',
          questions: [
            {title: 'If you say, “Show me your shoe” without pointing, making gestures, or giving hints (when you are not going out or getting dressed), does your child show you his/her shoe? ', example: ''},
            {title: 'If you say, “Bring me the blanket” or ask for another object without pointing, making gestures, or giving hints, does your child bring it to you?', example: ''},
            {title: ' If you say, “Put the book on the chair” without pointing, making gestures, or giving any other hints , does your child put the book on the chair?', example: ''}
          ],
          passCondition: 'any-yes'
        }
    },
  },
  {
    id: 19,
    title: "If something new happens, does your child look at your face to see how you feel about it?",
    description: "if he or she hears a strange or funny noise, or sees a new toy, will he or she look at your face?",
    yesDescription: "",
    noDescription: "",
    yesSelected: {
      questions: [],
      passCondition: "pass-direct",
    },
    noSelected: {
        questions: [
          {title: "If your child hears a strange or scary noise, will he/she look at you before responding?",  example: ""},
        ],
        passCondition: 'all-yes',
        nextLayerCondition: 'all-no',
        nextLayer: {
          questions: [
            {title: 'Does your child look at you when someone new approaches?', example: ''},
          ],
          passCondition: 'all-yes',
          nextLayerCondition: "all-no",
          nextLayer: {
            questions: [
              {title: 'Does your child look at you when he/she is faced with something unfamiliar or a little scary?', example: ''},
            ],
            passCondition: 'all-yes',
          }
        }
    },
  },
  {
    id: 20,
    title: "Does your child like movement activities?",
    description: "being swung or bounced on your knee?",
    yesDescription: "",
    noDescription: "",
    yesSelected: {
      questions: [{title: "Does he/she enjoy being bounced or swung?", example: ""}],
      passCondition: "pass-direct",
      nextLayerCondition: 'all-no',
      nextLayer: {
        title: "When you swing or bounce him/her, how does he/she react? (If parent does not give an example below, ask each individually.)",
        questions: [
          {title: "Laugh or smile?", example: ""},
          {title: "Talk or babble?", example: ""},
          {title: "Request more by holding out his/her arms?", example: ""}
        ],
        passCondition: "any-yes",
      }
    },
    noSelected: {
      title: "When you swing or bounce him/her, how does he/she react? (If parent does not give an example below, ask each individually.)",
      questions: [
        {title: "Laugh or smile?", example: ""},
        {title: "Talk or babble?", example: ""},
        {title: "Request more by holding out his/her arms?", example: ""}
      ],
      passCondition: "any-yes",
    },
  },
];

export default QuestionsData;

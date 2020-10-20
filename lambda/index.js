// Copyright 2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// Licensed under the Amazon Software License
// http://aws.amazon.com/asl/

/* eslint-disable  func-names */
/* eslint-disable  no-console */
/* eslint-disable  no-restricted-syntax */
const Alexa = require("ask-sdk");
const i18n = require("i18next");
const sprintf = require("i18next-sprintf-postprocessor");
const languageStrings = {
  en: require("./languageStrings"),
};
const AWS = require("aws-sdk");
const {
  randomId,
  getMachine,
  MACHINES,
  getProfit,
  getHint,
} = require("./constants");

const LaunchRequest = {
  canHandle(handlerInput) {
    // launch requests as well as any new session, as games are not saved in progress, which makes
    // no one shots a reasonable idea except for help, and the welcome message provides some help.
    return (
      Alexa.isNewSession(handlerInput.requestEnvelope) ||
      Alexa.getRequestType(handlerInput.requestEnvelope) === "LaunchRequest"
    );
  },
  async handle(handlerInput) {
    const { attributesManager } = handlerInput;
    const requestAttributes = attributesManager.getRequestAttributes();
    let attributes = {};
    try {
      attributes = (await attributesManager.getPersistentAttributes()) || {};
    } catch (e) {
      attributes = {
        debug: true,
      };
    }

    let letMeStartOver = true;

    attributes = {
      // Initialize attributes for first open
      gamesPlayed: 420,
      debug: false,
      week: 1,
      id: randomId(),
      ...attributes,
    };

    if (attributes.gamesPlayed > 0 && !letMeStartOver) {
      // User has played before, get them right into the game
      attributes.gameState = "PLAYING";
      attributes.gamesPlayed++;
    } else {
      // User has never played before, initialize a game for them
      attributes.gameState = "PLAYING";
      attributes.gamesPlayed = 0;
      attributes.wealth = 50;
      attributes.popularity = 50;
      attributes.week = 1;
      attributes.machine = 0;
      attributes.level = 1;
    }

    attributesManager.setSessionAttributes(attributes);

    // Initialisation message if you haven't played yet
    // Shorten the output if debugging
    let speechOutput = requestAttributes.t(
      (attributes.gamesPlayed === 0 ? "START_EMPLOYEE" : "LAUNCH_MESSAGE") +
        (attributes ? "_DEV" : "")
    );

    return handlerInput.responseBuilder
      .speak(speechOutput)
      .reprompt(speechOutput)
      .getResponse();
  },
};

const ExitHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      (Alexa.getIntentName(handlerInput.requestEnvelope) ===
        "AMAZON.CancelIntent" ||
        Alexa.getIntentName(handlerInput.requestEnvelope) ===
          "AMAZON.StopIntent")
    );
  },
  handle(handlerInput) {
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();

    return handlerInput.responseBuilder
      .speak(requestAttributes.t("EXIT_MESSAGE"))
      .getResponse();
  },
};

const SessionEndedRequest = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) ===
      "SessionEndedRequest"
    );
  },
  handle(handlerInput) {
    console.log(
      `Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`
    );
    return handlerInput.responseBuilder.getResponse();
  },
};

const HelpIntent = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === "AMAZON.HelpIntent"
    );
  },
  handle(handlerInput) {
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();

    return handlerInput.responseBuilder
      .speak(requestAttributes.t("HELP_MESSAGE"))
      .reprompt(requestAttributes.t("HELP_MESSAGE"))
      .getResponse();
  },
};

const YesIntent = {
  canHandle(handlerInput) {
    // only start a new game if yes is said when not playing a game.
    let isCurrentlyPlaying = false;
    const { attributesManager } = handlerInput;
    const sessionAttributes = attributesManager.getSessionAttributes();

    if (
      sessionAttributes.gameState &&
      sessionAttributes.gameState === "PLAYING"
    ) {
      isCurrentlyPlaying = true;
    }

    return (
      !isCurrentlyPlaying &&
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === "AMAZON.YesIntent"
    );
  },
  handle(handlerInput) {
    const { attributesManager } = handlerInput;
    const requestAttributes = attributesManager.getRequestAttributes();
    const sessionAttributes = attributesManager.getSessionAttributes();

    sessionAttributes.gameState = "PLAYING";
    sessionAttributes.guessNumber = Math.floor(Math.random() * 101);

    return handlerInput.responseBuilder
      .speak(requestAttributes.t("YES_MESSAGE"))
      .reprompt(requestAttributes.t("YES_MESSAGE"))
      .getResponse();
  },
};

const NoIntent = {
  canHandle(handlerInput) {
    // only treat no as an exit when outside a game
    let isCurrentlyPlaying = false;
    const { attributesManager } = handlerInput;
    const sessionAttributes = attributesManager.getSessionAttributes();

    if (
      sessionAttributes.gameState &&
      sessionAttributes.gameState === "PLAYING"
    ) {
      isCurrentlyPlaying = true;
    }

    return (
      !isCurrentlyPlaying &&
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === "AMAZON.NoIntent"
    );
  },
  async handle(handlerInput) {
    const { attributesManager } = handlerInput;
    const requestAttributes = attributesManager.getRequestAttributes();
    const sessionAttributes = attributesManager.getSessionAttributes();

    sessionAttributes.endedSessionCount += 1;
    sessionAttributes.gameState = "ENDED";

    try {
      attributesManager.setPersistentAttributes(sessionAttributes);
      await attributesManager.savePersistentAttributes();
    } catch (e) {}

    return handlerInput.responseBuilder
      .speak(requestAttributes.t("EXIT_MESSAGE"))
      .getResponse();
  },
};

const UnhandledIntent = {
  canHandle() {
    return true;
  },
  handle(handlerInput) {
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();

    return handlerInput.responseBuilder
      .speak(requestAttributes.t("CONTINUE_MESSAGE"))
      .reprompt(requestAttributes.t("CONTINUE_MESSAGE"))
      .getResponse();
  },
};

// const BuyMachineIntent = {
//   canHandle(handlerInput) {
//     // handle buying machines only during a game, or when starting one
//     let isCurrentlyPlaying = false;
//     const { attributesManager } = handlerInput;
//     const sessionAttributes = attributesManager.getSessionAttributes();

//     if (
//       sessionAttributes.gameState &&
//       (sessionAttributes.gameState === "PLAYING" ||
//         sessionAttributes.gameState === "INIT")
//     ) {
//       isCurrentlyPlaying = true;
//     }

//     return (
//       isCurrentlyPlaying &&
//       Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
//       Alexa.getIntentName(handlerInput.requestEnvelope) === "BuyMachineIntent"
//     );
//   },
//   async handle(handlerInput) {
//     const { attributesManager } = handlerInput;
//     const requestAttributes = attributesManager.getRequestAttributes();
//     const sessionAttributes = attributesManager.getSessionAttributes();

//     const machine = Alexa.getSlotValue(handlerInput.requestEnvelope, "machine");
//     console.log("machine:", machine);
//     const chosenMachine = getMachine(machine);
//     console.log("chosenMachine:", chosenMachine);

//     if (!chosenMachine) {
//       // Chosen machine is not recognized

//       // Next machine purchasable
//       const nextMachine = MACHINES[sessionAttributes.machine];

//       const speechOutput = requestAttributes.t(
//         "BUY_MACHINE_UNKNOWN",
//         nextMachine.name,
//         nextMachine.cost
//       );

//       return handlerInput.responseBuilder
//         .speak(speechOutput)
//         .reprompt(speechOutput)
//         .getResponse();
//     } else if (chosenMachine.cost > sessionAttributes.money) {
//       // Chosen machine is too expensive

//       const speechOutput = requestAttributes.t(
//         "BUY_MACHINE_CANT_AFFORD",
//         chosenMachine.name,
//         chosenMachine.cost,
//         sessionAttributes.money
//       );

//       return handlerInput.responseBuilder
//         .speak(speechOutput)
//         .reprompt(speechOutput)
//         .getResponse();
//     } else if (sessionAttributes.machine > MACHINES.indexOf(chosenMachine)) {
//       // User already has this machine

//       // Next machine purchasable
//       const nextMachine = MACHINES[sessionAttributes.machine];

//       const speechOutput = requestAttributes.t(
//         "BUY_MACHINE_ALREADY_PURCHASED",
//         chosenMachine.name,
//         nextMachine.name,
//         nextMachine.cost
//       );

//       return handlerInput.responseBuilder
//         .speak(speechOutput)
//         .reprompt(speechOutput)
//         .getResponse();
//     }

//     sessionAttributes.money -= chosenMachine.cost;

//     try {
//       attributesManager.setPersistentAttributes(sessionAttributes);
//       await attributesManager.savePersistentAttributes();
//     } catch (e) {}

//     if (sessionAttributes.week === 1 && sessionAttributes.machine === 0) {
//       // You bought the first machine, let's start the game!
//       sessionAttributes.gameState = "PLAYING";
//       sessionAttributes.machine++;

//       const speechOutput = requestAttributes.t(
//         "START_MACHINE_CONFIRM",
//         sessionAttributes.money
//       );

//       return handlerInput.responseBuilder
//         .speak(speechOutput)
//         .reprompt(speechOutput)
//         .getResponse();
//     }

//     // Buy specific machine (not the first one)
//     sessionAttributes.machine++;

//     const speechOutput = requestAttributes.t(
//       "BUY_MACHINE_CONFIRM",
//       chosenMachine.name,
//       sessionAttributes.money
//     );

//     console.log(sessionAttributes.machine, MACHINES.indexOf(chosenMachine));

//     return handlerInput.responseBuilder
//       .speak(speechOutput)
//       .reprompt(speechOutput)
//       .getResponse();
//   },
// };

// const NextWeekIntent = {
//   canHandle(handlerInput) {
//     // handle next week intent only during a game
//     let isCurrentlyPlaying = false;
//     const { attributesManager } = handlerInput;
//     const sessionAttributes = attributesManager.getSessionAttributes();

//     if (
//       sessionAttributes.gameState &&
//       sessionAttributes.gameState === "PLAYING"
//     ) {
//       isCurrentlyPlaying = true;
//     }

//     return (
//       isCurrentlyPlaying &&
//       Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
//       Alexa.getIntentName(handlerInput.requestEnvelope) === "NextWeekIntent"
//     );
//   },
//   async handle(handlerInput) {
//     const { attributesManager } = handlerInput;
//     const requestAttributes = attributesManager.getRequestAttributes();
//     const sessionAttributes = attributesManager.getSessionAttributes();

//     sessionAttributes.week++;

//     try {
//       attributesManager.setPersistentAttributes(sessionAttributes);
//       await attributesManager.savePersistentAttributes();
//     } catch (e) {}

//     const profit = getProfit(
//       sessionAttributes.level,
//       sessionAttributes.machine
//     );
//     console.log("profit:", profit);
//     sessionAttributes.money += profit;

//     const speechOutput = requestAttributes.t(
//       "WEEK_TURN",
//       sessionAttributes.week,
//       profit,
//       sessionAttributes.money,
//       "Some event",
//       "Some hint"
//     );

//     return handlerInput.responseBuilder
//       .speak(speechOutput)
//       .reprompt(speechOutput)
//       .getResponse();
//   },
// };

const IncreasePricesIntent = {
  canHandle(handlerInput) {
    // handle next week intent only during a game
    let isCurrentlyPlaying = false;
    const { attributesManager } = handlerInput;
    const sessionAttributes = attributesManager.getSessionAttributes();

    if (
      sessionAttributes.gameState &&
      sessionAttributes.gameState === "PLAYING"
    ) {
      isCurrentlyPlaying = true;
    }

    return (
      isCurrentlyPlaying &&
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === "NextWeekIntent"
    );
  },
  async handle(handlerInput) {
    const { attributesManager } = handlerInput;
    const requestAttributes = attributesManager.getRequestAttributes();
    const sessionAttributes = attributesManager.getSessionAttributes();

    // Take turn
    sessionAttributes.week++;
    sessionAttributes.wealth += 10;
    sessionAttributes.popularity -= 10;
    let w = "increased";
    let p = "decreased;";

    let hint;

    if (sessionAttributes.popularity < 0) {
      // User is game over:
      sessionAttributes.gameState = "GAME_OVER";

      try {
        attributesManager.setPersistentAttributes(sessionAttributes);
        await attributesManager.savePersistentAttributes();
      } catch (e) {}

      const speechOutput = requestAttributes.t(
        "GAME_OVER_POPULARITY",
        sessionAttributes.week
      );

      return handlerInput.responseBuilder
        .speak(speechOutput)
        .reprompt(speechOutput)
        .getResponse();
    } else if (sessionAttributes.wealth > 100) {
      // User will have to pay taxes now
      hint =
        "Your wealth has exceeded 100. This is no problem, but you will have to start paying taxes now.";
    } else {
      hint = getHint();
    }

    try {
      attributesManager.setPersistentAttributes(sessionAttributes);
      await attributesManager.savePersistentAttributes();
    } catch (e) {}

    const speechOutput = requestAttributes.t(
      "WEEK_TURN",
      "You increased your prices for this week, which increased your wealth by 10 but decreased your popularity by 10.",
      w,
      10,
      sessionAttributes.wealth,
      p,
      10,
      sessionAttributes.popularity,
      "Some event",
      "Some event explanation",
      hint
    );

    return handlerInput.responseBuilder
      .speak(speechOutput)
      .reprompt(speechOutput)
      .getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);
    console.log(`Error stack: ${error.stack}`);
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();

    return handlerInput.responseBuilder
      .speak(requestAttributes.t("ERROR_MESSAGE"))
      .reprompt(requestAttributes.t("ERROR_MESSAGE"))
      .getResponse();
  },
};

const FallbackHandler = {
  canHandle(handlerInput) {
    // handle fallback intent, yes and no when playing a game
    // for yes and no, will only get here if and not caught by the normal intent handler
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      (Alexa.getIntentName(handlerInput.requestEnvelope) ===
        "AMAZON.FallbackIntent" ||
        Alexa.getIntentName(handlerInput.requestEnvelope) ===
          "AMAZON.YesIntent" ||
        Alexa.getIntentName(handlerInput.requestEnvelope) === "AMAZON.NoIntent")
    );
  },
  handle(handlerInput) {
    const { attributesManager } = handlerInput;
    const requestAttributes = attributesManager.getRequestAttributes();
    const sessionAttributes = attributesManager.getSessionAttributes();

    if (
      sessionAttributes.gameState &&
      sessionAttributes.gameState === "PLAYING"
    ) {
      // currently playing
      return handlerInput.responseBuilder
        .speak(requestAttributes.t("FALLBACK_MESSAGE_DURING_GAME"))
        .reprompt(requestAttributes.t("FALLBACK_MESSAGE_DURING_GAME"))
        .getResponse();
    }

    // not playing
    return handlerInput.responseBuilder
      .speak(requestAttributes.t("FALLBACK_MESSAGE_OUTSIDE_GAME"))
      .reprompt(requestAttributes.t("FALLBACK_MESSAGE_OUTSIDE_GAME"))
      .getResponse();
  },
};

const LocalizationInterceptor = {
  process(handlerInput) {
    const localizationClient = i18n.use(sprintf).init({
      lng: Alexa.getLocale(handlerInput.requestEnvelope),
      resources: languageStrings,
    });
    localizationClient.localize = function localize() {
      const args = arguments;
      const values = [];
      for (let i = 1; i < args.length; i += 1) {
        values.push(args[i]);
      }
      const value = i18n.t(args[0], {
        returnObjects: true,
        postProcess: "sprintf",
        sprintf: values,
      });
      if (Array.isArray(value)) {
        return value[Math.floor(Math.random() * value.length)];
      }
      return value;
    };
    const attributes = handlerInput.attributesManager.getRequestAttributes();
    attributes.t = function translate(...args) {
      return localizationClient.localize(...args);
    };
  },
};

function getPersistenceAdapter() {
  // Determines persistence adapter to be used based on environment
  const s3Adapter = require("ask-sdk-s3-persistence-adapter");
  return new s3Adapter.S3PersistenceAdapter({
    bucketName: process.env.S3_PERSISTENCE_BUCKET,
    s3Client: new AWS.S3({
      apiVersion: "latest",
      region: process.env.S3_PERSISTENCE_REGION,
    }),
  });
}

const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
  .withPersistenceAdapter(getPersistenceAdapter())
  .addRequestHandlers(
    LaunchRequest,
    ExitHandler,
    SessionEndedRequest,
    HelpIntent,
    YesIntent,
    NoIntent,
    // BuyMachineIntent,
    NextWeekIntent,
    FallbackHandler,
    UnhandledIntent
  )
  .addRequestInterceptors(LocalizationInterceptor)
  .addErrorHandlers(ErrorHandler)
  .lambda();

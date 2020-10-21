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
  PRICE_INFLUENCE,
  getEvent,
  getResults,
  getActionExplanation,
  NUMBER_OF_EVENTS,
  getCTA,
  createAttributes,
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

    let letMeStartOver = false;

    attributes = {
      // Initialize attributes for first open
      gamesPlayed: 0,
      debug: false,
      week: 1,
      id: randomId(),
      ...attributes,
    };

    // Shorten the output if debugging
    let speechOutput;
    if (attributes.week > 1) {
      // Ask user to continue if they still have an open game
      attributes.gameState = "CONTINUE_OR_NEW";
      speechOutput = requestAttributes.t(
        "LAUNCH_MESSAGE_CONTINUE_OR_NEW",
        attributes.highScore
      );
    } else if (attributes.gamesPlayed === 0) {
      // Initialisation message if you haven't played yet
      speechOutput = requestAttributes.t("LAUNCH_MESSAGE_FIRST_OPEN");
      attributes.gameState = "PLAYING";
      attributes = {
        ...attributes,
        ...createAttributes(),
      };
    } else {
      // Create a new game for an existing user
      speechOutput = requestAttributes.t(
        "LAUNCH_MESSAGE_NEW_GAME",
        attributes.highScore
      );
      attributes.gameState = "PLAYING";
      attributes = {
        ...attributes,
        ...createAttributes(),
      };
    }

    attributesManager.setSessionAttributes(attributes);

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
    // Accept yes if:
    // - user answers yes to continuing the previous game
    let continueOrNew = false;
    const { attributesManager } = handlerInput;
    const sessionAttributes = attributesManager.getSessionAttributes();

    if (
      sessionAttributes.gameState &&
      sessionAttributes.gameState === "CONTINUE_OR_NEW"
    ) {
      continueOrNew = true;
    }

    return (
      !continueOrNew &&
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
    // Accept no if:
    // - user answers no to continuing the previous game
    let continueOrNew = false;
    const { attributesManager } = handlerInput;
    const sessionAttributes = attributesManager.getSessionAttributes();

    if (
      sessionAttributes.gameState &&
      sessionAttributes.gameState === "CONTINUE_OR_NEW"
    ) {
      continueOrNew = true;
    }

    return (
      !continueOrNew &&
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

const PromoteHelpIntent = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) ===
        "PromoteHelpRequest" &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === "AMAZON.NoIntent"
    );
  },
  async handle(handlerInput) {
    const { attributesManager } = handlerInput;
    const requestAttributes = attributesManager.getRequestAttributes();

    const speechOutput = requestAttributes.t("PROMOTE_ITEM_EXPLANATION");

    return handlerInput.responseBuilder
      .speak(speechOutput)
      .reprompt(speechOutput)
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

const canHandleInGame = (handlerInput, intentName) => {
  // handle action intent only during a game
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
    Alexa.getIntentName(handlerInput.requestEnvelope) === intentName
  );
};

const handleAction = async (handlerInput, action) => {
  const { attributesManager } = handlerInput;
  const requestAttributes = attributesManager.getRequestAttributes();
  const sessionAttributes = attributesManager.getSessionAttributes();

  if (action === "promote-unknown") {
    // User wanted to promote item, but the item is not recognized
    const speechOutput = requestAttributes.t("PROMOTE_ITEM_NOT_RECOGNIZED");

    return handlerInput.responseBuilder
      .speak(speechOutput)
      .reprompt(speechOutput)
      .getResponse();
  }

  let event = getEvent(sessionAttributes.week);
  let hint = sessionAttributes.week <= NUMBER_OF_EVENTS ? event.hint || "" : ""; // Only give event in first few weeks
  let warning = "";
  let isRepeat = false;
  if (sessionAttributes.action === action) {
    isRepeat = true;
    hint = "Warning: repeating the same actions reduces it's effects.";
  }
  let CTA = getCTA(sessionAttributes.week);

  // Reward is based on event from past week
  console.log("action:", action);
  let reward = getResults(action, sessionAttributes.week - 1, isRepeat);
  console.log("reward:", reward);

  sessionAttributes.action = action;

  // Take turn
  sessionAttributes.week++;
  sessionAttributes.wealth += reward.wealth;
  sessionAttributes.popularity += reward.popularity;
  let w = reward.wealth < 0 ? "decreased" : "increased";
  let p = reward.popularity < 0 ? "decreased" : "increased";

  if (sessionAttributes.popularity < 0 || sessionAttributes.wealth < 0) {
    // User is game over:
    sessionAttributes.gamesPlayed++;
    sessionAttributes.highScore = sessionAttributes.week;
    sessionAttributes.gameState = "GAME_OVER";

    try {
      attributesManager.setPersistentAttributes(sessionAttributes);
      await attributesManager.savePersistentAttributes();
    } catch (e) {}

    const speechOutput = requestAttributes.t(
      "GAME_OVER_" + (sessionAttributes.popularity < 0)
        ? "POPULARITY"
        : "WEALTH",
      sessionAttributes.week
    );

    return handlerInput.responseBuilder
      .speak(speechOutput)
      .reprompt(speechOutput)
      .getResponse();
  } else if (
    sessionAttributes.wealth > 100 &&
    sessionAttributes.wealth - reward.wealth < 100
  ) {
    // User will have to pay taxes now
    warning =
      "Your wealth has exceeded 100. This is no problem, but you will have to start paying taxes now.";
  } else if (
    sessionAttributes.popularity > 100 &&
    sessionAttributes.popularity - reward.popularity < 100
  ) {
    // User will have to pay taxes now
    warning = "Your popularity is at it's maximum: 100.";
  }

  try {
    attributesManager.setPersistentAttributes(sessionAttributes);
    await attributesManager.savePersistentAttributes();
  } catch (e) {}

  const speechOutput = requestAttributes.t(
    "WEEK_TURN",
    getActionExplanation(action),
    w,
    Math.abs(reward.wealth),
    sessionAttributes.wealth,
    p,
    Math.abs(reward.popularity),
    sessionAttributes.popularity,
    warning,
    event.description,
    hint,
    CTA
  );

  return handlerInput.responseBuilder
    .speak(speechOutput)
    .reprompt(speechOutput)
    .getResponse();
};

const IncreasePricesIntent = {
  canHandle(handlerInput) {
    return canHandleInGame(handlerInput, "IncreasePricesIntent");
  },
  async handle(handlerInput) {
    return handleAction(handlerInput, "increase");
  },
};

const DecreasePricesIntent = {
  canHandle(handlerInput) {
    return canHandleInGame(handlerInput, "DecreasePricesIntent");
  },
  async handle(handlerInput) {
    return handleAction(handlerInput, "decrease");
  },
};

const AdvertizeIntent = {
  canHandle(handlerInput) {
    return canHandleInGame(handlerInput, "AdvertizeIntent");
  },
  async handle(handlerInput) {
    return handleAction(handlerInput, "advertize");
  },
};

const PromoteIntent = {
  canHandle(handlerInput) {
    return canHandleInGame(handlerInput, "PromoteIntent");
  },
  async handle(handlerInput) {
    // Get chosen promoted drink
    const item = Alexa.getSlotValue(handlerInput.requestEnvelope, "item");
    let action = "promote-";
    switch (item) {
      case "cold drinks":
        action += "cold";
        break;
      case "hot drinks":
        action += "hot";
        break;
      default:
        // This item does not exist
        action += "unknown";
    }
    return handleAction(handlerInput, action);
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
    PromoteHelpIntent,
    IncreasePricesIntent,
    DecreasePricesIntent,
    AdvertizeIntent,
    PromoteIntent,
    FallbackHandler,
    UnhandledIntent
  )
  .addRequestInterceptors(LocalizationInterceptor)
  .addErrorHandlers(ErrorHandler)
  .lambda();

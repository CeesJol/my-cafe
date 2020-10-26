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
  getEvent,
  getResults,
  NUMBER_OF_EVENTS,
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
      let event = getEvent(attributes.week);
      console.log("event:", event);
      attributes.event = event;
      speechOutput = requestAttributes.t(
        "LAUNCH_MESSAGE_FIRST_OPEN",
        event.description
      );
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
    return canHandleInGame(handlerInput, "AMAZON.YesIntent");
  },
  handle(handlerInput) {
    const { attributesManager } = handlerInput;
    const requestAttributes = attributesManager.getRequestAttributes();
    const sessionAttributes = attributesManager.getSessionAttributes();

    if ((sessionAttributes.gameState = "PLAYING")) {
      return handleAction(handlerInput, "yes");
    }
    // User wants to continue where they left off
    sessionAttributes.gameState = "PLAYING";

    // Exploit SUB_EVENT to repeat the last event
    const speechOutput = requestAttributes.t(
      "SUB_EVENT",
      sessionAttributes.event[action].description
    );

    return handlerInput.responseBuilder
      .speak(speechOutput)
      .reprompt(speechOutput)
      .getResponse();
  },
};

const NoIntent = {
  canHandle(handlerInput) {
    return canHandleInGame(handlerInput, "AMAZON.NoIntent");
  },
  async handle(handlerInput) {
    const { attributesManager } = handlerInput;
    const requestAttributes = attributesManager.getRequestAttributes();
    const sessionAttributes = attributesManager.getSessionAttributes();

    if ((sessionAttributes.gameState = "PLAYING")) {
      return handleAction(handlerInput, "no");
    } else {
      let speechOutput;
      sessionAttributes.gameState = "PLAYING";
      sessionAttributes = {
        ...sessionAttributes,
        ...createAttributes(),
      };

      if (sessionAttributes.gamesPlayed === 0) {
        // Initialisation message if you haven't played yet
        speechOutput = requestAttributes.t("LAUNCH_MESSAGE_FIRST_OPEN");
      } else {
        // Create a new game for an existing user
        speechOutput = requestAttributes.t(
          "LAUNCH_MESSAGE_NEW_GAME",
          sessionAttributes.highScore
        );
      }
    }

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
  // handle action intent only during a game, or answering question from Alexa
  let canHandle = false;
  const { attributesManager } = handlerInput;
  const sessionAttributes = attributesManager.getSessionAttributes();

  if (
    sessionAttributes.gameState &&
    (sessionAttributes.gameState === "PLAYING" ||
      sessionAttributes.gameState === "CONTINUE_OR_NEW")
  ) {
    canHandle = true;
  }

  return (
    canHandle &&
    Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
    Alexa.getIntentName(handlerInput.requestEnvelope) === intentName
  );
};

const handleAction = async (handlerInput, action) => {
  const { attributesManager } = handlerInput;
  const requestAttributes = attributesManager.getRequestAttributes();
  const sessionAttributes = attributesManager.getSessionAttributes();

  let wealthStatement = "";
  let popularityStatement = "";
  let event = sessionAttributes.event[action];
  let oldEventDescription = event.description;
  let speechOutput;
  let warning = "";
  let gameOver = false;
  if (event.wealth || event.popularity) {
    // This is a final event
    if (event.wealth) {
      sessionAttributes.wealth += event.wealth;
      wealthStatement = `Your wealth ${
        sessionAttributes.wealth > 0 ? "increased" : "decreased"
      } to ${sessionAttributes.wealth}.`;

      if (sessionAttributes.wealth <= 0) {
        gameOver = "WEALTH_LOW";
      } else if (sessionAttributes.wealth >= 100) {
        gameOver = "WEALTH_HIGH";
      }
    }
    if (event.popularity) {
      sessionAttributes.popularity += event.popularity;
      popularityStatement = `Your popularity ${
        sessionAttributes.popularity > 0 ? "increased" : "decreased"
      } to ${sessionAttributes.popularity}.`;

      if (sessionAttributes.popularity <= 0) {
        gameOver = "POPULARITY_LOW";
      } else if (sessionAttributes.popularity >= 100) {
        gameOver = "POPULARITY_HIGH";
      }
    }

    if (gameOver) {
      let highScoreString;
      if (!sessionAttributes.highScore) highScoreString = "";
      else if (sessionAttributes.week > sessionAttributes.highScore)
        highScoreString = `Congratulations! You beat your previous high score of ${sessionAttributes.highScore}.`;
      else
        highScoreString = `Your high score is ${sessionAttributes.highScore}.`;

      let speechOutput = requestAttributes.t(
        `GAME_OVER_${gameOver}`,
        oldEventDescription,
        wealthStatement,
        popularityStatement,
        sessionAttributes.week,
        highScoreString
      );

      sessionAttributes.highScore = Math.max(
        sessionAttrributes.week,
        sessionAttributes.highScore
      );

      // Store persistent on game over
      try {
        attributesManager.setPersistentAttributes(sessionAttributes);
        await attributesManager.savePersistentAttributes();
      } catch (e) {}

      return handlerInput.responseBuilder
        .speak(speechOutput)
        .reprompt(speechOutput)
        .getResponse();
    }

    // Update event and week
    event = getEvent(++sessionAttributes.week);

    // Give results, go to next week.
    speechOutput = requestAttributes.t(
      "WEEK_TURN",
      oldEventDescription,
      wealthStatement,
      popularityStatement,
      warning,
      event.description
    );

    sessionAttributes.event = event;

    // Store persistent on final event
    try {
      attributesManager.setPersistentAttributes(sessionAttributes);
      await attributesManager.savePersistentAttributes();
    } catch (e) {}
  } else {
    // This is not a final event
    // event = event[action];

    speechOutput = requestAttributes.t("SUB_EVENT", event.description);

    sessionAttributes.event = event;
  }

  return handlerInput.responseBuilder
    .speak(speechOutput)
    .reprompt(speechOutput)
    .getResponse();
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
      console.log("sessionAttributes.event:", sessionAttributes.event);
      return handlerInput.responseBuilder
        .speak(
          requestAttributes.t(
            "FALLBACK_MESSAGE_DURING_GAME",
            sessionAttributes.event.description
          )
        )
        .reprompt(
          requestAttributes.t(
            "FALLBACK_MESSAGE_DURING_GAME",
            sessionAttributes.event.description
          )
        )
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
    FallbackHandler,
    UnhandledIntent
  )
  .addRequestInterceptors(LocalizationInterceptor)
  .addErrorHandlers(ErrorHandler)
  .lambda();

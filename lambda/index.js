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
const { randomId, getEvent, createAttributes } = require("./lib");

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
      day: 0,
      highScore: 0,
      id: randomId(),
      ...attributes,
    };

    let speechOutput;
    if (attributes.day >= 1) {
      // Ask user to continue if they still have an open game
      attributes.gameState = "CONTINUE_OR_NEW";
      speechOutput = requestAttributes.t(
        "LAUNCH_MESSAGE_CONTINUE_OR_NEW",
        attributes.highScore > 0
          ? `Your highscore is ${attributes.highScore}.`
          : ""
      );
    } else if (attributes.gamesPlayed === 0) {
      // Initialisation message if you haven't played yet
      attributes = {
        ...attributes,
        ...createAttributes(),
      };
      let event = getEvent(attributes.day, attributes.eventsOrder);
      console.log("event:", event);
      attributes.event = event;
      speechOutput = requestAttributes.t(
        "LAUNCH_MESSAGE_FIRST_OPEN",
        event.description
      );
      attributes.gameState = "PLAYING";
    } else {
      // Create a new game for an existing user
      speechOutput = requestAttributes.t(
        "LAUNCH_MESSAGE_NEW_GAME",
        attributes.highScore > 0
          ? `Your highscore is ${attributes.highScore}.`
          : "",
        attributes.event.description
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

    if (sessionAttributes.gameState === "PLAYING") {
      return handleAction(handlerInput, "yes");
    } else if (sessionAttributes.gameState === "CONTINUE_OR_NEW") {
      // User wants to continue where they left off
      sessionAttributes.gameState = "PLAYING";

      // Exploit SUB_EVENT to repeat the last event
      const speechOutput = requestAttributes.t(
        "SUB_EVENT",
        sessionAttributes.event.description
      );

      return handlerInput.responseBuilder
        .speak(speechOutput)
        .reprompt(speechOutput)
        .getResponse();
    } else {
      // NEW_GAME_OR_QUIT
      // User wants to start a new game
      let attributes = sessionAttributes;
      attributes.gameState = "PLAYING";
      attributes = {
        ...sessionAttributes,
        ...createAttributes(),
      };

      let event = getEvent(attributes.day, attributes.eventsOrder);
      attributes.event = event;

      attributesManager.setSessionAttributes(attributes);

      let speechOutput = requestAttributes.t("SUB_EVENT", event.description);

      return handlerInput.responseBuilder
        .speak(speechOutput)
        .reprompt(speechOutput)
        .getResponse();
    }
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
    let speechOutput;

    if (sessionAttributes.gameState === "PLAYING") {
      return handleAction(handlerInput, "no");
    } else if (sessionAttributes.gameState === "CONTINUE_OR_NEW") {
      // CONTINUE_OR_NEW: Create new game
      let attributes = sessionAttributes;
      attributes.gameState = "PLAYING";
      attributes = {
        ...sessionAttributes,
        ...createAttributes(),
      };

      // Create event
      let event = getEvent(attributes.day, attributes.eventsOrder);
      attributes.event = event;

      attributesManager.setSessionAttributes(attributes);

      speechOutput = requestAttributes.t("SUB_EVENT", event.description);

      return handlerInput.responseBuilder
        .speak(speechOutput)
        .reprompt(speechOutput)
        .getResponse();
    } else {
      // NEW_GAME_OR_QUIT: Stop the game
      return handlerInput.responseBuilder
        .speak(requestAttributes.t("EXIT_MESSAGE"))
        .getResponse();
    }
  },
};

const ResetIntent = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === "ResetIntent"
    );
  },
  async handle(handlerInput) {
    const { attributesManager } = handlerInput;
    const requestAttributes = attributesManager.getRequestAttributes();
    const sessionAttributes = attributesManager.getSessionAttributes();
    let speechOutput;

    // Reset player
    let attributes = {
      ...sessionAttributes,
      ...createAttributes("NEW_GAME_OR_QUIT"),
    };

    // Create event
    let event = getEvent(sessionAttributes.day, sessionAttributes.eventsOrder);
    sessionAttributes.event = event;

    attributesManager.setSessionAttributes(attributes);

    speechOutput = requestAttributes.t("RESET_SUCCESS");

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
      sessionAttributes.gameState === "CONTINUE_OR_NEW" ||
      sessionAttributes.gameState === "NEW_GAME_OR_QUIT")
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
  let wealthWarning = "";
  let popularityWarning = "";
  let gameOver = false;
  if (!event.yes) {
    // This is a final event
    if (event.wealth) {
      sessionAttributes.wealth += event.wealth;
      wealthStatement = `Your wealth ${
        event.wealth > 0 ? "increased" : "decreased"
      } to ${sessionAttributes.wealth}.`;

      if (sessionAttributes.wealth <= 0) {
        gameOver = "WEALTH_LOW";
      } else if (sessionAttributes.wealth >= 100) {
        gameOver = "WEALTH_HIGH";
      }

      if (
        sessionAttributes.wealth <= 20 &&
        sessionAttributes.wealth - event.wealth > 20
      ) {
        wealthWarning =
          "Be careful: if your wealth drops below 0, you will go bankrupt.";
      }
    }
    if (event.popularity) {
      sessionAttributes.popularity += event.popularity;
      popularityStatement = `Your popularity ${
        event.popularity > 0 ? "increased" : "decreased"
      } to ${sessionAttributes.popularity}.`;

      if (sessionAttributes.popularity <= 0) {
        gameOver = "POPULARITY_LOW";
      } else if (sessionAttributes.popularity >= 100) {
        gameOver = "POPULARITY_HIGH";
      }

      if (
        sessionAttributes.popularity <= 20 &&
        sessionAttributes.popularity - event.popularity > 20
      ) {
        popularityWarning =
          "Be careful: if your popularity drops below 0, you landlord will throw you out.";
      }
    }

    if (gameOver) {
      const previousHighScore = sessionAttributes.highScore;

      // Update high score

      let highScoreString;
      if (
        sessionAttributes.highScore &&
        sessionAttributes.day > sessionAttributes.highScore
      ) {
        // Highscore improved
        sessionAttributes.highScore = sessionAttributes.day;
        highScoreString = `Congratulations! You beat your previous high score of ${previousHighScore}.`;
      } else {
        // First score, or highscore not improved
        highScoreString = `Your high score is ${previousHighScore}.`;
      }

      let speechOutput = requestAttributes.t(
        `GAME_OVER_${gameOver}`,
        oldEventDescription,
        wealthStatement,
        popularityStatement,
        sessionAttributes.day,
        highScoreString
      );

      // Reset game
      let attributes = {
        ...sessionAttributes,
        ...createAttributes("NEW_GAME_OR_QUIT"),
        gamesPlayed: sessionAttributes.gamesPlayed + 1,
      };

      attributesManager.setSessionAttributes(attributes);

      // Store persistent on game over
      try {
        attributesManager.setPersistentAttributes(attributes);
        await attributesManager.savePersistentAttributes();
      } catch (e) {}

      return handlerInput.responseBuilder
        .speak(speechOutput)
        .reprompt(speechOutput)
        .getResponse();
    }

    // Update event and day
    event = getEvent(++sessionAttributes.day, sessionAttributes.eventsOrder);
    console.log("event2:", event);

    // Give results, go to next day.
    speechOutput = requestAttributes.t(
      "DAY_TURN",
      oldEventDescription,
      wealthStatement,
      wealthWarning,
      popularityStatement,
      popularityWarning,
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
    ResetIntent,
    FallbackHandler,
    UnhandledIntent
  )
  .addRequestInterceptors(LocalizationInterceptor)
  .addErrorHandlers(ErrorHandler)
  .lambda();

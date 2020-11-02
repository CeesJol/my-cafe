const { getEvent, createAttributes, initAttributes } = require("../lib");

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
      } else if (
        sessionAttributes.wealth >= 80 &&
        sessionAttributes.wealth - event.wealth < 80
      ) {
        wealthWarning =
          "Be careful: if your wealth increases above 100, you will get robbed and lose everything.";
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
      } else if (
        sessionAttributes.popularity >= 80 &&
        sessionAttributes.popularity - event.popularity < 80
      ) {
        popularityWarning =
          "Be careful: if your popularity increases above 100, your competition will start taking measures against you.";
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
        highScoreString = `Your high score is ${
          previousHighScore || sessionAttributes.day
        }.`;
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
    speechOutput = requestAttributes.t("SUB_EVENT", event.description);

    sessionAttributes.event = event;
  }

  return handlerInput.responseBuilder
    .speak(speechOutput)
    .reprompt(speechOutput)
    .getResponse();
};

const handleLaunch = async (handlerInput) => {
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
    ...initAttributes(),
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
  } else {
    // Create a new game for an existing user
    speechOutput = requestAttributes.t(
      "LAUNCH_MESSAGE_NEW_GAME",
      attributes.highScore > 0
        ? `Your highscore is ${attributes.highScore}.`
        : "",
      attributes.event.description
    );
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
};

const handleYes = (handlerInput) => {
  const { attributesManager } = handlerInput;
  const requestAttributes = attributesManager.getRequestAttributes();
  const sessionAttributes = attributesManager.getSessionAttributes();

  if (sessionAttributes.gameState === "PLAYING") {
    return handleAction(handlerInput, "yes");
  } else if (sessionAttributes.gameState === "CONTINUE_OR_NEW") {
    // User wants to continue where they left off
    sessionAttributes.gameState = "PLAYING";

    // Repeat the last event
    const speechOutput = requestAttributes.t(
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
    attributes = {
      ...sessionAttributes,
      ...createAttributes(),
    };

    let event = getEvent(attributes.day, attributes.eventsOrder);
    attributes.event = event;

    attributesManager.setSessionAttributes(attributes);

    let speechOutput = requestAttributes.t(event.description);

    return handlerInput.responseBuilder
      .speak(speechOutput)
      .reprompt(speechOutput)
      .getResponse();
  }
};

const handleNo = (handlerInput) => {
  const { attributesManager } = handlerInput;
  const requestAttributes = attributesManager.getRequestAttributes();
  const sessionAttributes = attributesManager.getSessionAttributes();
  let speechOutput;

  if (sessionAttributes.gameState === "PLAYING") {
    return handleAction(handlerInput, "no");
  } else if (sessionAttributes.gameState === "CONTINUE_OR_NEW") {
    // CONTINUE_OR_NEW: Create new game
    let attributes = sessionAttributes;
    attributes = {
      ...sessionAttributes,
      ...createAttributes(),
    };

    // Create event
    let event = getEvent(attributes.day, attributes.eventsOrder);
    attributes.event = event;

    attributesManager.setSessionAttributes(attributes);

    speechOutput = requestAttributes.t(event.description);

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
};

const handleReset = (handlerInput) => {
  const { attributesManager } = handlerInput;
  const requestAttributes = attributesManager.getRequestAttributes();
  const sessionAttributes = attributesManager.getSessionAttributes();
  let speechOutput;

  // Reset player
  let attributes = {
    ...initAttributes(),
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
};

module.exports = {
  handleLaunch,
  handleYes,
  handleNo,
  handleReset,
};

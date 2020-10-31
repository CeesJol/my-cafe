const Alexa = require("ask-sdk");

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

module.exports = {
  canHandleInGame,
};

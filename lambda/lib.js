const EVENTS = require("./events");

/**
 * GENERAL
 */
const randomIntFromInterval = (min, max) =>
  Math.floor(Math.random() * (max - min + 1) + min);

const randomId = () => Math.floor(Math.random() * 1e16);

const getRandomEvent = () => {
  return EVENTS[Math.floor(Math.random() * EVENTS.length)];
};

const getEvent = (day, events) => {
  if (day >= EVENTS.length || events[day] >= EVENTS.length)
    return getRandomEvent();
  return EVENTS[events[day]];
};

const getEventIndexes = (events) => {
  let array = [];
  for (var i = 0; i < events.length; i++) {
    array.push(i);
  }
  return array;
};

const shuffleArray = (arr) => {
  // Remove items from this array (deep copy)
  let tempArray = [...arr];
  // Add items to this array
  var shuffledArray = [];
  for (var i = 0; i < arr.length; i++) {
    var index = Math.floor(Math.random() * (arr.length - i));
    shuffledArray.push(tempArray[index]);
    tempArray.splice(index, 1);
  }
  return shuffledArray;
};

/**
 * SESSION ATTRIBUTES
 */
const createAttributes = (gameState) => {
  const eventsOrder = shuffleArray(getEventIndexes(EVENTS));
  console.log("eventsOrder:", eventsOrder);
  return {
    gameState: gameState || "PLAYING",
    wealth: 50,
    popularity: 50,
    day: 0,
    eventsOrder,
  };
};

const initAttributes = () => {
  return {
    gamesPlayed: 0,
    debug: false,
    day: 0,
    highScore: 0,
    id: randomId(),
  };
};

module.exports = {
  randomId,
  getEvent,
  getRandomEvent,
  createAttributes,
  initAttributes,
};

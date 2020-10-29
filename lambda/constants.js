/**
 * GENERAL
 */
const randomIntFromInterval = (min, max) =>
  Math.floor(Math.random() * (max - min + 1) + min);

const randomId = () => Math.floor(Math.random() * 1e16);

/**
 * EVENTS AND ACTIONS
 */
const EVENTS = [
  {
    description:
      "A festival will be in town this week. Festivals bring many thirsty people from far away to town. Do you want to increase your prices?",
    yes: {
      description: "Your cafe did well this week with the increased prices.",
      wealth: 20,
    },
    no: {
      description:
        "Your cafe thrived this week and people talked about it a lot on social media. ",
      wealth: 20,
    },
  },
  {
    description:
      "There are holidays this week. Sales will always be worse during holidays. Would you like to add sales?",
    yes: {
      description: "The sales drove new customers to your cafe.",
      popularity: 20,
    },
    no: {
      description:
        "Your regulars customers are out of town, which means you missed out on income.",
      wealth: -20,
    },
  },
  {
    description:
      "Bad news: Miss Blackburn has opened a cafe in your town. She is offering lower prices than you to try to get your customers to visit her instead. Would you like to add sales to compete with her?",
    yes: {
      description:
        "Miss Blackburn is not happy with your sales. The sales kept your regular customers in your cafe. In anger, she has destroyed your advertisements and replaced them with hers. Would you like to destroy hers?",
      yes: {
        description:
          "The police caught you destroying Miss Blackburn's advertisements. ",
        wealth: -20,
        popularity: -20,
      },
      no: {
        description:
          "The police is informed, but find no evidence that she removed your advertisements. The police leave, and you find yourself alone with Miss Blackburn's advertisements. Would you like to destroy them and replace them with yours?",
        yes: {
          description:
            "Miss Blackburn's is shocked by your swift response and apologizes to you.",
          popularity: 10,
        },
        no: {
          description:
            "The lack of advertisements has driven back your income.",
          wealth: -10,
        },
      },
    },
    no: {
      description: "The competition has driven your sales down dramatically.",
      wealth: -30,
    },
  },
  {
    description:
      "Cold and rainy weather is predicted for this week. Would you like to promote your hot drinks for this week?",
    yes: {
      description: "The promotion drove new customers to your cafe.",
      wealth: 10,
    },
    no: {
      description: "Rain and thunder kept your customers away from your cafe.",
      wealth: -10,
    },
  },
  {
    description:
      "Sunny weather is predicted for this week. Would you like to promote your ice cold drinks for this week?",
    yes: {
      description: "The promotion drove new customers to your cafe.",
      wealth: 10,
    },
    no: {
      description: "Rain and thunder kept your customers away from your cafe.",
      wealth: -10,
    },
  },
];

const getRandomEvent = () => {
  return EVENTS[Math.floor(Math.random() * EVENTS.length)];
};

const getEvent = (week, events) => {
  if (week >= EVENTS.length || events[week] >= EVENTS.length)
    return getRandomEvent();
  return EVENTS[events[week]];
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
    week: 0,
    eventsOrder,
  };
};

module.exports = {
  randomId,
  getEvent,
  getRandomEvent,
  createAttributes,
};

/**
 * GENERAL
 */
const randomIntFromInterval = (min, max) =>
  Math.floor(Math.random() * (max - min + 1) + min);

const randomId = () => Math.floor(Math.random() * 1e16);

const PRICE_INFLUENCE = 10; // Amount wealth/popularity fluctuates by increasing and decreasing price

/**
 * EVENTS AND ACTIONS
 */
const EVENTS_ACTIONS_MATRIX = [
  {
    description: "A festival will be in town this week.",
    hint: "Festivals bring many thirsty people from far away to town.",
    actions: {
      // Good
      increase: {
        wealth: 20,
        popularity: -5,
      },
      // Good
      advertize: {
        wealth: -5,
        popularity: 20,
      },
    },
  },
  {
    description: "There are holidays this week.",
    hint: "Sales will always be worse during holidays.",
    actions: {
      // Good
      decrease: {
        wealth: 20,
        popularity: -5,
      },
      // Bad
      advertize: {
        wealth: -10,
        popularity: 2,
      },
    },
  },
  {
    description: "Bad news: new competition has arrived to the town.",
    hint: "New cafes often compete by offering lower prices.",
    actions: {
      // Good
      decrease: {
        wealth: -10,
        popularity: 10,
      },
    },
    // Bad. This overwrites the default rewards
    any: {
      wealth: -20,
      popularity: -5,
    },
  },
  {
    description: "Cold, rainy weather is predicted for this week.",
    actions: {
      // Good
      "promote-hot": {
        wealth: 20,
        popularity: 5,
      },
    },
  },
  {
    description: "Sunny weather is predicted for this week.",
    hint:
      "Promoting the right drinks at the right weather conditions leads to more sales.",
    actions: {
      // Good
      "promote-cold": {
        wealth: 20,
        popularity: 5,
      },
    },
  },
  {
    description:
      "Locals are calling it cucumber time. There is nothing happening this week.",
    actions: {},
  },
];

const NUMBER_OF_EVENTS = EVENTS_ACTIONS_MATRIX.length;

const ACTIONS = {
  increase: {
    wealth: PRICE_INFLUENCE,
    popularity: -PRICE_INFLUENCE,
  },
  decrease: {
    wealth: -PRICE_INFLUENCE,
    popularity: PRICE_INFLUENCE,
  },
  advertize: {
    wealth: -PRICE_INFLUENCE,
    popularity: 0,
  },
  "promote-hot": {
    wealth: PRICE_INFLUENCE / 2,
    popularity: -PRICE_INFLUENCE / 2,
  },
  "promote-cold": {
    wealth: PRICE_INFLUENCE / 2,
    popularity: -PRICE_INFLUENCE / 2,
  },
};

const getActionExplanation = (action) => {
  switch (action) {
    case "increase":
      return "You increased your prices for this week, which increased your wealth but decreased your popularity.";
    case "decrease":
      return "You decreased your prices for this week, which decreased your wealth but increased your popularity.";
    case "advertize":
      return "You advertized this week, which decreased your wealth.";
    case "promote-cold":
      return "You promoted cold drinks this week, which increased your wealth but decreased your popularity.";
    case "promote-hot":
      return "You promoted hot drinks this week, which increased your wealth but decreased your popularity.";
    default:
      return "";
  }
};

const getEvent = (week) => {
  return EVENTS_ACTIONS_MATRIX[(week - 1) % EVENTS_ACTIONS_MATRIX.length];
};

const getResults = (action, week, isRepeat) => {
  console.log("week:", week);
  console.log("getEvent(week):", getEvent(week));
  if (week === 0) {
    // The first week has no event yet
    if (action === "decrease") {
      // You should start with this action, so reward it
      return {
        wealth: 20,
        popularity: -10,
      };
    } else {
      return ACTIONS[action];
    }
  }
  const event = getEvent(week).actions;
  let reward;

  if (event[action]) {
    // Special result for this action is available
    // This is usually a reward for a suitable action
    reward = event[action];
  } else if (event["any"]) {
    // Special result for this event, but no specific action above, is available
    // This is usually a punishment for an unsuitable action
    reward = event["any"];
  } else {
    reward = ACTIONS[action];
  }

  // Halven the positive rewards if it is a repeat action
  if (isRepeat) {
    if (reward.wealth > 0) reward.wealth = Math.floor(reward.wealth / 2);
    if (reward.popularity > 0)
      reward.popularity = Math.floor(reward.popularity / 2);
  }

  return reward;
};

module.exports = {
  randomId,
  PRICE_INFLUENCE,
  getEvent,
  getResults,
  getActionExplanation,
  NUMBER_OF_EVENTS,
};

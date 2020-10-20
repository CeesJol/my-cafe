/**
 * GENERAL
 */
const randomIntFromInterval = (min, max) =>
  Math.floor(Math.random() * (max - min + 1) + min);

const randomId = () => Math.floor(Math.random() * 1e16);

const PRICE_INFLUENCE = 10; // Amount wealth/popularity fluctuates by increasing and decreasing price

/**
 * HINTS
 */
const HINTS = [
  "Promoting the right drinks at the right weather conditions leads to more sales.",
  "Festivals bring many thirsty people from far away to town.",
  "Sales will always be worse during holidays.",
  "New cafes often compete by offering lower prices.",
  "",
];

const getHint = (week) => {
  // Only give hint every other week
  if (week % 2 == 0) return "";
  return HINTS[Math.floor(Math.random() * HINTS.length)];
};

/**
 * EVENTS
 */
const EVENTS_ACTIONS_MATRIX = [
  {
    description: "A festival will be in town this week.",
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
    actions: {
      // Good
      decrease: {
        wealth: -10,
        popularity: 10,
      },
    },
    // Bad. This overwrites the default rewards
    overwrite: {
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

const getEvent = (week) => {
  return EVENTS_ACTIONS_MATRIX[(week - 2) % EVENTS_ACTIONS_MATRIX.length];
};

module.exports = {
  randomId,
  getHint,
  PRICE_INFLUENCE,
  getEvent,
};

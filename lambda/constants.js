/**
 * GENERAL
 */
const randomIntFromInterval = (min, max) =>
  Math.floor(Math.random() * (max - min + 1) + min);

/**
 * MACHINES
 */
const MACHINES = [
  {
    name: "Coffee machine",
    cost: 100,
  },
  {
    name: "Tea machine",
    cost: 200,
  },
  {
    name: "Latte machine",
    cost: 9001,
  },
];

const getMachine = (machine) => {
  const result = MACHINES.find(
    (m) => m.name.toLowerCase() === machine.toLowerCase()
  );
  return result;
};

/**
 * PROFITS
 */
const PROFIT_MIN = 100;
const PROFIT_MAX = 200;
const getProfit = (level, machine) => {
  return level * machine * randomIntFromInterval(PROFIT_MIN, PROFIT_MAX);
};

module.exports = {
  getMachine,
  MACHINES,
  getProfit,
};

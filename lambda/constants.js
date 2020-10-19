const machines = [
  {
    name: "Coffee machine",
    cost: 100,
  },
  {
    name: "Tea machine",
    cost: 200,
  },
];

const getMachine = (machine) => {
  const result = machines.find(
    (m) => m.name.toLowerCase() === machine.toLowerCase()
  );
  return result;
};

module.exports = {
  getMachine,
};

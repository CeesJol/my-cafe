const BARISTA1 = "Your barista, Joe, ";
const BARISTA2 = "Your barista, Mocha, ";
const VILLAIN1 = "Miss Blackburns";
const VITAL1 = "The mayor";

const EVENTS = [
  // Single events
  {
    description:
      "A festival will be in town today. Festivals bring many thirsty people from far away to town. Do you want to increase your prices?",
    yes: {
      description: "Your cafe did well today with the increased prices.",
      wealth: 20,
    },
    no: {
      description:
        "Your cafe thrived today and people talked about it a lot on social media. ",
    },
  },
  {
    description:
      "There are holidays today. Sales will always be worse during holidays. Would you like to add sales?",
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
      "Cold and rainy weather is predicted for today. Would you like to promote your hot drinks for today?",
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
      "Sunny weather is predicted for today. Would you like to promote your ice cold drinks for today?",
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
      "Your customers seem to be getting bored of your menu. Do you want to update it?",
    yes: {
      description:
        "Your customers appreciate your cafe and have started visiting more.",
      wealth: 10,
    },
    no: {
      description: "Your customers are disappointed in the lack of change.",
      popularity: -10,
    },
  },
  {
    description: `${BARISTA2} offers to peek at competitors cafes to get information from them. Do you accept the offer?`,
    yes: {
      description:
        "The new information has allowed you to create a better menu.",
      wealth: -10,
      popularity: 20,
    },
    no: {
      description: "Makes sense, let's focus on our own business.",
    },
  },
  {
    description: `${BARISTA1} has painted a great painting for your cafe. Do you want to purchase it and place it in your cafe?`,
    yes: {
      description:
        "The cafe looks even better with the painting and customers seem to like it.",
      wealth: -10,
      popularity: 20,
    },
    no: {
      description: `${BARISTA1} is disappointed but understands your decision.`,
    },
  },
  {
    description: `Your competitor, ${VILLAIN1}, offers to work together to increase income for the both of you. She set up a contract. Do you sign it?`,
    yes: {
      description: `The contract contained some small letters you overlooked. It turns out you provided ${VILLAIN1} with a massive loan.`,
      wealth: -50,
    },
    no: {
      description: `${VILLAIN1} laughs at your decision. I'm not sure she can be trusted.`,
    },
  },
  {
    description: `${BARISTA2} has found a new blend that creates a unique and amazing taste. Do you want to add it to your menu?`,
    yes: {
      description: "Your customers love the new blend!",
      wealth: 10,
      popularity: 10,
    },
    no: {
      description: `${BARISTA2} is disappointed about your decision.`,
      popularity: -10,
    },
  },
  {
    description:
      "One of your customers spills a drink on themselves. Do you give them a new one?",
    yes: {
      description: "The customer is grateful for the new drink.",
      popularity: 10,
    },
    no: {
      description:
        "The customer is disappointed in your poor customer service.",
      popularity: -10,
    },
  },
  {
    description:
      "A family has a a kid that is screaming from the top of his lungs in your cafe. Do you want to remove the family?",
    yes: {
      description:
        "The family is offended and writes a negative review about your cafe.",
      popularity: -20,
    },
    no: {
      description: "Your regular customers are annoyed but accept it.",
    },
  },
  {
    description:
      "It is your birthday today! Do you want to give all the customers a treat on you?",
    yes: {
      description: "Your customers love you for your kindness.",
      wealth: -10,
      popularity: 10,
    },
    no: {
      description:
        "That's okay, you can celebrate your birthday with your family instead.",
    },
  },
  {
    description:
      "A new band called 'The three muggers' ask to perform at your cafe tonight. Do you accept them?",
    yes: {
      description:
        "The band turns out to be thieves and stole some of your money.",
      wealth: -20,
    },
    no: {
      description:
        "The band is furious and threatens you. Before they can damage your cafe the police arrive and threaten them. The band turns out to be thieves. The police is thankful for standing your ground.",
      popularity: 20,
    },
  },
  // Stories
  {
    description: `Bad news: ${VILLAIN1} has opened a cafe in your town. She is offering lower prices than you to try to get your customers to visit her instead. Would you like to add sales to compete with her?`,
    yes: {
      description: `${VILLAIN1} is not happy with your sales. The sales kept your regular customers in your cafe. In anger, she has destroyed your advertisements and replaced them with hers. Would you like to destroy hers?`,
      yes: {
        description: `The police caught you destroying ${VILLAIN1}'s advertisements.`,
        wealth: -20,
        popularity: -20,
      },
      no: {
        description: `The police is informed, but find no evidence that she removed your advertisements. The police leave, and you find yourself alone with ${VILLAIN1}'s advertisements. Would you like to destroy them and replace them with yours?`,
        yes: {
          description: `${VILLAIN1}'s is shocked by your swift response and apologizes to you.`,
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
    description: `${VITAL1} is looking for a place to celebrate his birthday with friends and knocks on your place. Do you let him in?`,
    yes: {
      description: `Oops: ${BARISTA1} spoiled a cup of ice cream over ${VITAL1}. ${VITAL1} seems very upset. Do you want to charge no price to make up for it?`,
      yes: {
        description: `${VITAL1} appreciates your kindness.`,
        wealth: -10,
      },
      no: {
        description: `${VITAL1} is not happy with the situation and mocks your cafe.`,
        popularity: -20,
      },
    },
    no: {
      description: `${VITAL1} is disappointed he couldn't celebrate his birthday at your place.`,
      popularity: -20,
    },
  },
];

module.exports = EVENTS;

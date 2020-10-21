const ANTONIO = "Giorgio";
const NEXT_WEEK = "Say 'next week' to jump to the next week.";

module.exports = {
  translation: {
    SKILL_NAME: "My Cafe",
    EXIT_MESSAGE: "Thanks for playing!",
    // Game start
    LAUNCH_MESSAGE: `Welcome back to My Cafe. ${NEXT_WEEK}`,
    LAUNCH_MESSAGE_DEV: `Welcome back to My Cafe, dev.`,
    START_EMPLOYEE: `Welcome to My Cafe. 
		In My Cafe, you build your cafe to a respected and warm place for your customers to get drinks and foods.
		You start with 50 wealth and 50 popularity. 
		Keep your wealth and popularity above 0 to survive!
		If you fall below 0 health, you go bankrupt.
		If you fall below 0 popularity, your landlord will throw you out.
		Each week, you can take one action: increase prices, decrease prices, advertize, or promote an item. You can promote either hot or cold drinks.
		Since this is your first week, it is recommended to decrease your prices this week to get more customers.`,
    START_EMPLOYEE_DEV: `Welcome to My Cafe, dev.`,
    START_MACHINE_CONFIRM: `Great! You bought your first machine. You have %s dollars left. Your cafe has officially opened! ${NEXT_WEEK}`,
    // Game over
    GAME_OVER_POPULARITY:
      "Your popularity went below zero. Your landlord is not happy with you anymore and has decided to kick you out. Your final score is: %s. Would you like to play again?",
    GAME_OVER_WEALTH:
      "Your wealth went below zero, which means you went bankrupt. Your final score is: %s. Would you like to play again?",
    // Week turn
    // - action and result
    // - increase/decrease
    // - amount change
    // - new value
    // - increase/decrease
    // - amount change
    // - new value
    // - event
    // - hint
    WEEK_TURN: `%s 
		Your wealth %s by %s, to %s.
		Your popularity %s by %s, to %s.
		%s
		%s
		Which action would you like to take?`,
    BIG_OOF: "Big oof!",
    // Buying a machine
    BUY_MACHINE_CONFIRM: `Great! You bought %s. You have %s dollars left. ${NEXT_WEEK}`,
    BUY_MACHINE_UNKNOWN: `I did not recognize that machine. The next available in the store is the %s for %s dollars. ${NEXT_WEEK}`,
    BUY_MACHINE_CANT_AFFORD: `You cannot afford the %s. It costs %s dollars, but you have only %s dollars. ${NEXT_WEEK}`,
    BUY_MACHINE_ALREADY_PURCHASED: `You already own the %s. The next available in the store is the %s for %s dollars. ${NEXT_WEEK}`,
    // Basic stuff
    FALLBACK_MESSAGE_DURING_GAME: `I can't help you with that. Try guessing a number between 0 and 100. `,
    FALLBACK_MESSAGE_OUTSIDE_GAME: `I can't help you with that. I will come up with a number between 0 and 100 and you try to guess it by saying a number in that range. Would you like to play?`,
    GUESS_CORRECT_MESSAGE: "%s is correct! Would you like to play again?",
    TOO_HIGH_MESSAGE: "%s is too high.",
    TOO_LOW_MESSAGE: "%s is too low.",
    CONTINUE_MESSAGE: "Say yes to play or no to quit.",
    HELP_MESSAGE:
      "I am thinking of a number between zero and one hundred, try to guess it and I will tell you if it is higher or lower.",
    ERROR_MESSAGE: "Sorry, an error occurred.",
    YES_MESSAGE: "Great! Try saying a number to start the game.",
  },
};

// Week turn
// - week number
// - profit (dollars)
// - upcoming event
// - hint
// WEEK_TURN: `A week has passed. It is now week %s. You made a profit of %s dollars, which brings you at a total of %s dollars.
// %s
// %s
// `,
// Your Italian friend, Antonio, is here to help you out as a barista.
// 		Antonio said he could meet up to set up the cafe.
// 		<audio src="soundbank://soundlibrary/footsteps/wood/wood_09"/>
// 		<voice name="${ANTONIO}">Hi there, I'm excited to get started.</voice>
// Antonio will work in your restaurant for free for the first 4 weeks, after which you need to pay him 500 dollars per month.
// 		Now, we need to buy a machine to produce drinks. Say 'Buy coffee machine' to buy your first machine!`,

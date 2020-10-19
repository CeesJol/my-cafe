const ANTONIO = "Giorgio";
const NEXT_WEEK = "Say 'next week' to jump to the next week.";

module.exports = {
  translation: {
    SKILL_NAME: "My Cafe",
    EXIT_MESSAGE: "Thanks for playing!",
    // Game start
    LAUNCH_MESSAGE: `Welcome back to My Cafe. ${NEXT_WEEK}`,
    START_EMPLOYEE: `Welcome to My Cafe. 
		In My Cafe, you build your cafe to a respected and warm place for your customers to get drinks and foods.
		Your Italian friend, Antonio, is here to help you out as a barista.
		Antonio said he could meet up to set up the cafe. 
		<audio src="soundbank://soundlibrary/footsteps/wood/wood_09"/>
		<voice name="${ANTONIO}">Hi there, I'm excited to get started.</voice>
		He will work in your restaurant for free for the first 4 weeks, after which you need to pay him 500 dollars per month.
		Now, we need to buy a machine to produce drinks. Say 'Buy coffee machine' to buy your first machine!`,
    START_MACHINE: `Do you want to buy 'Coffee machine' for 100 dollars? You have %s dollars.`,
    START_MACHINE_CONFIRM: `Great! You bought your first machine. Your cafe has officially opened. ${NEXT_WEEK}`,
    // Week turn
    // - week number
    // - profit (dollars)
    // - upcoming event
    // - hint
    WEEK_TURN: `A week has passed. It is now week %s. You made a profit of %s dollars.
		%s
		%s
		`,
    BIG_OOF: "Big oof!",
    // Basic stuff
    FALLBACK_MESSAGE_DURING_GAME: `I can't help you with that.  Try guessing a number between 0 and 100. `,
    FALLBACK_MESSAGE_OUTSIDE_GAME: `I can't help you with that.  I will come up with a number between 0 and 100 and you try to guess it by saying a number in that range. Would you like to play?`,
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

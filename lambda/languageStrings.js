const ANTONIO = "Giorgio";
const NEXT_WEEK = "Say 'next week' to jump to the next week.";

module.exports = {
  translation: {
    SKILL_NAME: "My Cafe",
    EXIT_MESSAGE: "Thanks for playing!",
    // Game start
    LAUNCH_MESSAGE_CONTINUE_OR_NEW: `Welcome back to My Cafe. 
		Your highscore is %S.
		You still have an open game. 
		Do you want to continue this game?`,
    LAUNCH_MESSAGE_NEW_GAME: `Welcome back to My Cafe. 
		Your highscore is %s. 
		You start with 50 wealth and 50 popularity. 
		Remember: don't let your wealth or popularity drop below 0, or above 100!
		%s`,
    LAUNCH_MESSAGE_DEV: `Welcome back to My Cafe, dev.`,
    LAUNCH_MESSAGE_FIRST_OPEN: `Welcome to My Cafe. 
		In My Cafe, you build your cafe to a respected and warm place for your customers to get drinks and foods.
		You start with 50 wealth and 50 popularity. 
		Don't let your wealth or popularity drop below 0, or above 100!
		%s`,
    START_EMPLOYEE_DEV: `Welcome to My Cafe, dev.`,
    // Game over
    // - result of action
    // - wealth statement
    // - popularity statement
    // - your score
    // - statement regarding your score and highscore
    GAME_OVER_POPULARITY_LOW:
      "%s %s %s Your popularity went below zero. Your landlord is not happy with you anymore and has decided to kick you out. Your final score is: %s. %s Would you like to play again?",
    GAME_OVER_WEALTH_LOW:
      "%s %s %s Your wealth went below zero, which means you went bankrupt. Your final score is: %s. %s Would you like to play again?",
    GAME_OVER_POPULARITY_HIGH:
      "%s %s %s Your popularity went above 100. Your competition got anxious and set your place on fire. Your final score is: %s. %s Would you like to play again?",
    GAME_OVER_WEALTH_HIGH:
      "%s %s %s Your wealth went above 100. Your place got robbed and you lost everything. Your final score is: %s. %s Would you like to play again?",
    // Week turn
    // - result of action
    // - wealth statement
    // - popularity statement
    // - warning
    // - event
    WEEK_TURN: `%s 
		%s
		%s
		%s
		%s`,
    SUB_EVENT: `%s`,
    // Basic stuff
    FALLBACK_MESSAGE_DURING_GAME: `I didn't understand that. Please answer with yes or no. %s`,
    FALLBACK_MESSAGE_OUTSIDE_GAME: `I can't help you with that. I will come up with a number between 0 and 100 and you try to guess it by saying a number in that range. Would you like to play?`,
    CONTINUE_MESSAGE: "Say yes to play or no to quit.",
    HELP_MESSAGE:
      "I am thinking of a number between zero and one hundred, try to guess it and I will tell you if it is higher or lower.",
    ERROR_MESSAGE: "Sorry, an error occurred.",
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

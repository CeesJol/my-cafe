const BEAT_HIGHSCORE_CTA = "Would you like to attempt to beat that score?";

module.exports = {
  translation: {
    SKILL_NAME: "My Cafe",
    EXIT_MESSAGE: "Thanks for playing!",
    // Game start: existing game avaiable
    // - High score (optional)
    LAUNCH_MESSAGE_CONTINUE_OR_NEW: `Welcome back to My Cafe. 
		%s
		You still have an open game. 
		Do you want to continue this game?`,
    // Game start: existing user starts new game
    // - High score (optional)
    // - Event
    LAUNCH_MESSAGE_NEW_GAME: `Welcome back to My Cafe. 
		%s
		You start with 50 wealth and 50 popularity.
		Remember: stay between 0 and 100 to keep your cafe alive! 
		%s`,
    // Game start: user's first game
    // - Event
    LAUNCH_MESSAGE_FIRST_OPEN: `Welcome to My Cafe. 
		You recently opened your cafe and your customers seem to be loving your blends.
		For each day in your cafe, I will ask you a difficult question and you need to answer yes or no to each question.
		You start with 50 wealth and 50 popularity. 
		Stay between 0 and 100 to keep your cafe alive! 
		%s`,
    // Game over
    // - result of action
    // - wealth statement
    // - popularity statement
    // - your score
    // - statement regarding your score and highscore
    GAME_OVER_POPULARITY_LOW: `%s %s %s Your popularity went below zero. Your landlord is not happy with you anymore and has decided to kick you out. Your popularity must stay above 0. Your final score is: %s days. %s ${BEAT_HIGHSCORE_CTA}`,
    GAME_OVER_WEALTH_LOW: `%s %s %s Your wealth went below zero, which means you went bankrupt. Your wealth must stay above 0. Your final score is: %s days. %s ${BEAT_HIGHSCORE_CTA}`,
    GAME_OVER_POPULARITY_HIGH: `%s %s %s Your popularity went above 100. Your competition got anxious and set your place on fire. Your popularity must stay below 100. Your final score is: %s days. %s ${BEAT_HIGHSCORE_CTA}`,
    GAME_OVER_WEALTH_HIGH: `%s %s %s Your wealth went above 100. Your place got robbed and you lost everything. Your wealth must stay below 100. Your final score is: %s days. %s ${BEAT_HIGHSCORE_CTA}`,
    // Day turn
    // - result of action
    // - wealth statement
    // - wealth warning (optional)
    // - popularity statement
    // - popularity warning (optional)
    // - event
    DAY_TURN: `%s 
		%s
		%s
		%s
		%s
		%s`,
    SUB_EVENT: `%s`,
    // Basic stuff
    FALLBACK_MESSAGE_DURING_GAME: `I didn't understand that. Please answer with yes or no. %s`,
    FALLBACK_MESSAGE_OUTSIDE_GAME: `I can't help you with that. I will come up with a number between 0 and 100 and you try to guess it by saying a number in that range. Would you like to play?`,
    CONTINUE_MESSAGE: "Say yes to play or no to quit.",
    HELP_MESSAGE: `I will ask you questions and you should answer them with either yes or no. 
			When you answer, your wealth and popularity may go up or down. 
			Keep both your wealth and popularity between 0 and 100 to survive. %s`,
    ERROR_MESSAGE: "Sorry, an error occurred.",
    RESET_SUCCESS:
      "I resetted you successfully. Would you like to play a new game?",
  },
};

// Day turn
// - day number
// - profit (dollars)
// - upcoming event
// - hint
// DAY_TURN: `A day has passed. It is now day %s. You made a profit of %s dollars, which brings you at a total of %s dollars.
// %s
// %s
// `,
// Your Italian friend, Antonio, is here to help you out as a barista.
// 		Antonio said he could meet up to set up the cafe.
// 		<audio src="soundbank://soundlibrary/footsteps/wood/wood_09"/>
// 		<voice name="${ANTONIO}">Hi there, I'm excited to get started.</voice>
// Antonio will work in your restaurant for free for the first 4 days, after which you need to pay him 500 dollars per month.
// 		Now, we need to buy a machine to produce drinks. Say 'Buy coffee machine' to buy your first machine!`,

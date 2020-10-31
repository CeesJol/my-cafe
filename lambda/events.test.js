var test = () => {
  var score = 0;
  for (var i = 0; i < EVENTS.length; i++) {
    var event = EVENTS[i];
    for (var j = 0; j < 10; j++) {
      if (event.yes && event.no) {
        if (event.yes.yes || event.yes.no) {
          // Event has a subevent for yes, continue
          event = event.yes;
        } else if (event.no.yes || event.no.no) {
          // Event has a subevent for no, continue
          event = event.no;
        } else {
          // Event has no subevents, go to next event
          score++;
          break;
        }
      } else {
        console.log(`OOPS at ${i}`);
        break;
      }
    }
  }
  console.log(`scored ${score} out of ${EVENTS.length}`);
};
test();

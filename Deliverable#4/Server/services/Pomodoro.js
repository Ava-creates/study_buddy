
module.exports.Pomodoro = class Pomodoro {
  // params:
  // callback: fn called when theres a event in the pomodoro, e.g timer finished
  constructor(callback) { 
      this.timeLeft = 25 * 60; // 25 mins in seconds 
      this.isPaused = true; // true: paused, false: counting down
      this.status = "running"; // running/break
      this.breakType = "short"; // long/short
      this.callbackUpdate = callback; 

      this.timeStarted = Date.now() / 1000; // time in seconds
      this.timer = setTimeout(() => this.timerFinished(), this.timeLeft * 1000);
  }

  startTimer(type) {
    if (type === "work") {
      this.status = "running";
    } else if (type === "shortBreak") {
      this.status = "break";
      this.breakType = "short";
    } else if (type === "longBreak") {
      this.status = "break";
      this.breakType = "long";
    }

    this.resetTimer();
  }

  resetTimer() {// timer finished, starting again
    if (this.status === "running") {
      this.timeLeft = 25 * 60
    } else if (this.status === "break") {
      if (this.breakType === "short") {
        this.timeLeft = 5 * 60;
      } else if (this.breakType === "long") {
        this.timeLeft = 15 * 60;
      }
    }
  
    this.timeStarted = Date.now() / 1000;
    this.timer = setTimeout(() => this.timerFinished(), this.timeLeft * 1000);
    this.updateRoom();
  }

  unPauseTimer() {
    if (!this.isPaused) return;

    this.isPaused = false;
    this.timeStarted = Date.now() / 1000;
    this.timer = setTimeout(() => this.timerFinished(), this.timeLeft * 1000);
    this.updateRoom();
  }

  pauseTimer() {
    if (this.isPaused) return;

    this.isPaused = true;
    this.timeLeft = (Date.now() / 1000) - this.timeStarted;
    if (this.timeLeft < 0) { // should not be possible, as this.timer() should've triggered before this. but just in case.
      this.timeLeft = 0;
    }

    clearTimeout(this.timer);
    this.timer = null;
    this.updateRoom();
  }

  timerFinished() {
    this.timeLeft = 0;
    this.isPaused = true;
    this.updateRoom();
  }

  updateRoom() {
    this.callbackUpdate(this.getStatus());
  }

  userPressPauseButton(action = "play") { // "play"/"pause"
    if (action === "play") {
      this.isPaused = false;
    } else if ( action === "pause") {
      this.isPaused = true;
    }
  }

  getStatus() {
    if (this.status == "break") {
      return {
        timeLeft: this.timeLeft,
        isPaused: this.isPaused,
        status: "break",
        breakType: this.breakType,
      }
    } // not break, return obj without a 'breakType' attribute
    return {
      timeLeft: this.timeLeft,
      isPaused: this.isPaused,
      status: "running",
    }
  }



};

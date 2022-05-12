
const breakText = document.getElementById('breakText');

var pomodoro = {
    started: false,
    minutes: 0,
    seconds: 0,
    interval: null,
    minutesDom: null,
    secondsDom: null,
    fillerDom: null,
    init: function () {
        var self = this;
        // access the below parameters to update them based on the clicked button
        this.minutesDom = document.querySelector('#minutes');
        this.secondsDom = document.querySelector('#seconds');
        this.container = document.querySelector('#container');
        this.buttons = document.querySelector('#buttons')
        this.interval = setInterval(function () {
            self.intervalCallback.apply(self);
        }, 1000);
        // Work button click
        document.querySelector('#work').onclick = function () {
            self.startWork.apply(self);
            socket.emit('pomodoro', 'work');
        };
        // Short Break button click
        document.querySelector('#shortBreak').onclick = function () {
            self.startShortBreak.apply(self);
            socket.emit('pomodoro', 'shortBreak');
        };
        // Long Break button click
        document.querySelector('#longBreak').onclick = function () {
            self.startLongBreak.apply(self);
            socket.emit('pomodoro', 'longBreak');
        };
        // Pause button click
        document.querySelector('#pause').onclick = function () {
            self.stopTimer.apply(self);
            if (self.started) {
              socket.emit('pomodoro', 'unpause');
            } else {
              socket.emit('pomodoro', 'pause');
            }
        };

    },

    // Resetting variables based on the clicked button
    resetVariables: function (mins, secs, started) {
        this.minutes = mins;
        this.seconds = secs;
        this.started = started;
        this.updateDom();
    },
    startWork: function () {
        this.resetVariables(25, 0, true);
        breakText.style.display = 'none';
    },
    startShortBreak: function () {
        this.resetVariables(5, 0, true);
        breakText.style.display = 'block';
    },
    startLongBreak: function () {
        this.resetVariables(15, 0, true);
        breakText.style.display = 'block';
    },

    // Pause Timer
    stopTimer: function () {
        if (this.started == false) {
            this.started = true;
        }
        else {
            this.started = false;
        }
    },

    // Make numbers < 10 appear in double digits
    toDoubleDigit: function (num) {
        if (num < 10) {
            return "0" + parseInt(num, 10);
        }
        return num;
    },

    // update timer values
    updateDom: function () {
        this.minutesDom.innerHTML = this.toDoubleDigit(this.minutes);
        this.secondsDom.innerHTML = this.toDoubleDigit(this.seconds);
    },

    // run timer
    intervalCallback: function () {
        if (!this.started) return false;
        if (this.seconds == 0) {
            if (this.minutes == 0) {
                this.timerComplete();
                return;
            }
            this.seconds = 59;
            this.minutes--;
        } else {
            this.seconds--;
        }
        this.updateDom();
    },
    timerComplete: function () {
        this.started = false;
    }
};
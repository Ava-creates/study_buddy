var pomodoro = {
    started: false,
    minutes: 0,
    seconds: 0,
    fillerHeight: 0,
    fillerIncrement: 0,
    interval: null,
    minutesDom: null,
    secondsDom: null,
    fillerDom: null,
    init: function () {
        var self = this;
        this.minutesDom = document.querySelector('#minutes');
        this.secondsDom = document.querySelector('#seconds');
        this.container = document.querySelector('#container');
        this.buttons = document.querySelector('#buttons')
        this.interval = setInterval(function () {
            self.intervalCallback.apply(self);
        }, 1000);
        document.querySelector('#work').onclick = function () {
            self.startWork.apply(self);
        };
        document.querySelector('#shortBreak').onclick = function () {
            self.startShortBreak.apply(self);
        };
        document.querySelector('#longBreak').onclick = function () {
            self.startLongBreak.apply(self);
        };
        document.querySelector('#stop').onclick = function () {
            self.stopTimer.apply(self);
        };

    },
    resetVariables: function (mins, secs, started) {
        this.minutes = mins;
        this.seconds = secs;
        this.started = started;
    },
    startWork: function () {
        this.resetVariables(25, 0, true);
        this.container.style.background = '#d95550';
        this.buttons.style.background = '#dd6662';
    },
    startShortBreak: function () {
        this.resetVariables(5, 0, true);
        this.container.style.background = '#4b9195';
        this.buttons.style.background = '#609ca0';
    },
    startLongBreak: function () {
        this.resetVariables(15, 0, true);
        this.container.style.background = '#457ca2';
        this.buttons.style.background = '#5a88ac';
    },
    stopTimer: function () {
        this.resetVariables(25, 0, false);
        this.updateDom();
        this.container.style.background = '#d95550';
        this.buttons.style.background = '#dd6662';
    },
    toDoubleDigit: function (num) {
        if (num < 10) {
            return "0" + parseInt(num, 10);
        }
        return num;
    },
    updateDom: function () {
        this.minutesDom.innerHTML = this.toDoubleDigit(this.minutes);
        this.secondsDom.innerHTML = this.toDoubleDigit(this.seconds);
    },
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
window.onload = function () {
    pomodoro.init();
};
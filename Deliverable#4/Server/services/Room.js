
// users are matched and put into Rooms

const { v4: uuidv4 } = require('uuid');
const { Pomodoro } = require('./Pomodoro.js');
const { io } = require('../server');

class MessageClass {
  constructor(message, author) {
    this.message = message;
    this.author = author;
    this.time = Date.now();
  }
}

class Member {
  constructor(clientID, name) {
    this.clientID = clientID;
    this.name = name;
  }
}

module.exports.Room = class Room {
  constructor() { // gameID: int
      this.roomID = uuidv4();
      this.roomMembers = [];
      this.roomCapacity = 4;
      this.messages = [];
      this.Pomodoro = new Pomodoro((e) => this.pomodoroCallbackHandler(e));
  }

  // when an evnet happens to pomodoro, update the clients
  pomodoroCallbackHandler(status) {
    io.in(this.roomID).emit('pomodoro', status);
  }

  updatePomodoro(update) {
    switch(update) {
      case "work": case "shortBreak": case "longBreak":
        this.Pomodoro.startTimer(update);
        break;
      case "pause":
        this.Pomodoro.pauseTimer();
        break;
      case "unpause":
        this.Pomodoro.unPauseTimer();
        break;
      default:
        break;
    }
  }

  getRoomDetails() {
    let users = [];
    this.roomMembers.forEach((member) => {
      users.push(member.name);
    })
    
    return {
      users,
      messages: this.messages
    };
    // database.memoryStore.all((_, sessions) => {
    //   for (let [session, sessionData] of Object.entries(sessions)) {
    //     const currentID = sessionData.passport?.user?.id;
    //     if (this.roomMembers.find((member) => member.clientID === currentID)) {
    //       console.log(sessionData.passport?.user?.displayName);
    //       console.log(sessionData);
    //       const username = sessionData.passport?.user?.displayName;
    //       users.push(username);
    //     }
    //   }
    
    //   res.send({
    //     users,
    //     messages: this.messages
    //   });
    // });
  }

  getRoomID() {
    return this.roomID;
  }

  getRoomSize() {
    return this.roomMembers.length;
  }

  isRoomFull() {
    return this.getRoomSize >= this.roomCapacity;
  }

  sendMessage(message, author) {
    const userName = author
    const Message = new MessageClass(message, userName);

    this.messages.push(Message);

    io.in(this.roomID).emit('message', {
      'sent_by': Message.author,
      'time': Message.time,
      'message': Message.message,
    })
  }

  // remove clientID from the room
  removeUserFromRoom(clientID) {
    const clientIndex = this.roomMembers.findIndex((x) => x.clientID === clientID);
    const userName = this.roomMembers[clientIndex].name;
    this.roomMembers.splice(clientIndex, 1); // remove from array

    io.in(this.roomID).emit('userExit', {
      user: userName,
    })
  }

  addUserToRoom(clientID, name) {
    if (this.getRoomSize() >= this.roomCapacity) throw new Error("Can't add user to a full room!");

    const userObj = new Member(clientID, name)
    this.roomMembers.push(userObj);
    
    io.in(this.roomID).emit('userEnter', {
      user: name,
    })
    return true;
  }

  getPomodoroStatus() {
    return this.Pomodoro.getStatus();
  }

  isRoomFull() {
    if (this.roomMembers.length >= 4) {
      return true;
    } else {
      return false;
    }
  }
};

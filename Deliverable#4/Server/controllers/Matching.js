
const { Room } = require('../services/Room.js')
const database = require('../services/Database');

class User {
  constructor(clientID, name) {
    this.clientID = clientID;
    this.name = name;
  }
}

module.exports.Matching = class Matching {
  constructor(roomID) { // gameID: int
    this.rooms = [];
    this.usersInQueue = [];
    this.currentRoomIDToFill = null;

    this.timer = setInterval(() => this.attemptToMatch(), 1000);
  }

  async match(req, res) {
    const session = req.session;
    const clientID = session.passport?.user?.id;
    const clientName = session.passport?.user?.displayName;

    if (session.data.matching === true) { // user has started matching
      this.getMatchingStatus(req, res);
      return;
    }

    this.usersInQueue.push(new User(clientID, clientName));
    session.data.matching = true;
    const returnObj = { message: "Matching started!" }
    res.statusCode = 202;
    res.send(returnObj);
  }

  // given a clientID, if the user is already in a room it returns the roomID otherwise returns null
  getUserRoomID(clientID) {
    let returnVal = null;
    this.rooms.find((room) => room.roomMembers.find((member) => {
      if (member.clientID === clientID) {
        returnVal = room.roomID;
        return true;
      }
    }));
    return returnVal;
  }

  getRoomFromID(roomID) {
    let returnRoom = null;
    this.rooms.find((room) => {
      if (room.roomID == roomID) {
        returnRoom = room;
        return true;
      }
    })
    return returnRoom;
  }

  // check if user belongs to a certain room
  doesUserBelongToRoom(clientID, roomID) {
    const userRoom = this.getUserRoomID(clientID); // the room the user belongs to

    return userRoom === roomID;
  }

  getMatchingStatus(req, res) {
    const session = req.session;
    const clientID = session.passport?.user?.id;

    // user in queue
    if (this.usersInQueue.find((x) => x.clientID === clientID)) {
      const returnObj = { message: "waiting" }
      res.send(returnObj);
    } else { // not in queue, user is in a room
      const roomID = this.getUserRoomID(clientID);
      if (roomID === null) {
        res.send({ message: "error" });
      } else {
        res.send({ message: "success", room: roomID });
      }
    }
  }

  // called once a second

  // this algorithm is very inefficient. it is capable of only adding 1-2 users to a room every 1 second
  // but it works and im lazy to think of anything better.
  attemptToMatch() {
    // nobody in queue, break
    if (this.usersInQueue.length === 0) return;

    if (this.currentRoomIDToFill !== null) { // there is an existing room with space
      const curUser = this.usersInQueue.shift(); // remove first user from queue

      const room = this.getRoomFromID(this.currentRoomIDToFill)
      room.addUserToRoom(curUser.clientID, curUser.name);
      if (room.isRoomFull()) {
        this.currentRoomIDToFill = null;
      }
    } else { // no existing empty room
      if (this.usersInQueue.length >= 2) { // at least 2 people in the queue, we can make a new room for them
        
        const curUser1 = this.usersInQueue.shift();
        const curUser2 = this.usersInQueue.shift();

        const newRoom = new Room();
        const newRoomID = newRoom.getRoomID();

        this.rooms.push(newRoom);

        newRoom.addUserToRoom(curUser1.clientID, curUser1.name);
        newRoom.addUserToRoom(curUser2.clientID, curUser2.name);

        this.currentRoomIDToFill = newRoomID;
      }
    }
  }
};

const { Matching } = require('../controllers/Matching');
const database = require('../services/Database');
const { io, sessionMiddleware, MatchingController } = require('../server');

exports.setSocketRoutes = async (app) => {
  const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);

  io.use(wrap(sessionMiddleware));
  
  // only allow authenticated users
  io.use((socket, next) => {
    const session = socket.request.session;

    if (session.passport?.user?.id) { // check if user is authenticated
      next();
    } else {
      next(new Error("Unauthorized, please log in first."));
    }
  });

  // only allow websocket connection if user is in a room
  io.use((socket, next) => {
    const session = socket.request.session;
    const clientID = session.passport.user.id;
    const roomID = MatchingController.getUserRoomID(clientID);

    if (roomID !== null) {
      next();
    } else {
      next(new Error("Haven't connected to a room yet."));
    }
  });
  
  io.on("connection", (socket) => {
    const session = socket.request.session;
    const clientID = session.passport.user.id;

    // socket routes for ROOM

    const roomID = MatchingController.getUserRoomID(clientID);
    const room = MatchingController.getRoomFromID(roomID);
  
    socket.join(roomID);

    // chat message sent by user
    socket.on('send_message', (message) => {
      database.memoryStore.get(socket.request.sessionID, (_, session) => {
        const name = session.passport?.user?.displayName
        room.sendMessage(message, name);
      });
    })
    
    // pomodoro update by user
    socket.on('pomodoro', (message) => {
      room.updatePomodoro(message);
    })
  });

  return app;
}

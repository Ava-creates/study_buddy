
const { response } = require('express');
const { passport, MatchingController } = require('../server');

exports.setRestRoutes = async (app) => {
  app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

  app.get("/", (req, res) => {
    res.json({message: "You are not logged in"})
  })

  app.get("/match", (req, res) => {
    if (!req.user) {
      res.statusCode = 401;
      res.send('Please log in first.');
    } else {
      MatchingController.match(req, res);
    }
  })

  app.get("/failed", (req, res) => {
    res.send("Failed")
  })

  app.get('/room/:roomID', (req , res) => {
    const roomID = req.params.roomID;
    const clientID = req.session?.passport?.user?.id;
    if (MatchingController.doesUserBelongToRoom(clientID, roomID)) {
      const room = MatchingController.getRoomFromID(roomID);
      res.json(room.getRoomDetails());
    } else {
      res.statusCode = 401;
      res.send('Unauthorized room.');
    }
  });

  app.get('/leaveRoom', (req, res) => {
    if (!req.user) {
      res.statusCode = 401;
      res.send('Please log in first.');
      return;
    }
  
    const clientID = req.session?.passport?.user?.id;
    const clientRoomID = MatchingController.getUserRoomID(clientID);
    const clientRoom = MatchingController.getRoomFromID(clientRoomID);

    req.session.data.matching = false;
    if (clientRoom) { // if client has a room, exit the room
      clientRoom.removeUserFromRoom(clientID);
      res.json({ message: "success" })
    } else {
      res.json({ message: "User not in room" });
    }
  })

  app.get("/userdata", (req, res) => {
    if (!req.user) {
      res.statusCode = 401;
      res.send('Please log in first.');
    } else {
      const isNYUAccount = !req.session.data.invalid;
      if (!isNYUAccount) {
        req.session.destroy()
        res.statusCode = 403;
        res.json({ message: "Not NYU email!"})
      } else {
        res.write(JSON.stringify(req.user));
        res.send();
      }
    }
  })

  app.get('/google',
    passport.authenticate('google', {
      scope:
        ['email', 'profile']
      }
    ));

  app.get('/logout', (req, res) => {
    req.session.destroy()
    res.redirect('/');
  })

  app.get('/google/callback',
    passport.authenticate('google', {
        failureRedirect: '/failed',
    }),
    function (req, res) {
      if (req.session?.data === undefined) {
        req.session.data = {}; // initialize session data object
      }

      const email = req.user.emails[0].value;
      const emailHost = email.split('@')[1];

      if (emailHost === "nyu.edu") {
        req.session.data = { invalid: false }
      } else {
        req.session.data = { invalid: true }
      }

      res.redirect('/dashboard.html')
    }
  );

  return app;
}

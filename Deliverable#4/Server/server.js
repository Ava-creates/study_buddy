
const express = require('express');
const path = require('path')

const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const passport = require('passport');
const bodyParser = require('body-parser');

module.exports = { 
  io,
}

const port = process.env.PORT || 8080;

const { sessionMiddleware } = require("./services/Database.js");

const  { Matching } = require('./controllers/Matching.js');
const MatchingController = new Matching();;

module.exports = {
  io,
  passport,
  sessionMiddleware,
  MatchingController,
}

require('./utils/passport');
const { setRoutes } = require('./routes/setRoutes.js');


async function startServer() {
    app.use(sessionMiddleware);
    
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));

    app.use(passport.initialize());
    app.use(passport.session());

    app.use("/", express.static(path.join(__dirname, '/public')))
    await setRoutes(app);

    http.listen(port, () => console.log(`Server started at port ${port}`));
}

startServer();

// http://localhost:5000/google/callback


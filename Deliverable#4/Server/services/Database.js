
// well not really a full on database, its an in-memory store for the user data.

const session = require('express-session');
const MemoryStore = require('memorystore')(session)

const memoryStore = new MemoryStore({
  checkPeriod: 86400000 // prune expired entries every 24h
});

const sessionMiddleware = session({
  name: 'google-auth-session',
  store: memoryStore,
  resave: false,
  saveUninitialized: true,
  secret: 'keyboard cat'
});


module.exports = {
  memoryStore,
  sessionMiddleware,
  getStore: () => {
    return memoryStore;
  },
}
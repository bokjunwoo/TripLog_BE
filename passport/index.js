const passport = require('passport');
const local = require('./local');
const mongoClient = require('../routes/mongo');
const _client = mongoClient.connect();

module.exports = () => {
  passport.serializeUser((user, done) => {
    done(null, user.email);
  });

  passport.deserializeUser(async (email, done) => {
    try {
      const client = await _client;
      const userdb = client.db('TripLogV2').collection('user');
      const user = await userdb.findOne({ email });
      done(null, user); // req.user
    } catch (error) {
      console.error(error);
      done(error);
    }
  });

  local();
};

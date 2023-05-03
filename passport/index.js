const passport = require('passport');
const local = require('./local');
const mongoClient = require('../routes/mongo');

module.exports = () => {
  passport.serializeUser((user, done) => {
    console.log('serializeUser 실행');
    done(null, user.email);
  });

  passport.deserializeUser(async (email, done) => {
    console.log('deserializeUser 실행');
    try {
      const client = await mongoClient.connect();
      const userdb = client.db('TripLogV2').collection('user');
      const user = await userdb.findOne({ email });
      done(null, user); // req.user
    } catch (error) {
      console.error(error);
      done(error, null);
    }
  });

  local();
};

const passport = require('passport');
const { Strategy: LocalStrategy } = require('passport-local');
const mongoClient = require('../routes/mongo');
const userdb = mongoClient
  .connect()
  .then((client) => client.db('TripLogV2').collection('user'));
const crypto = require('crypto');

const verifyPassword = (password, salt, userPassword) => {
  const hashed = crypto
    .pbkdf2Sync(password, salt, 10, 64, 'sha512')
    .toString('base64');

  if (hashed === userPassword) return true;
  return false;
};

module.exports = () => {
  passport.use(
    new LocalStrategy(
      {
        usernameField: 'email',
        passwordField: 'password',
      },
      async (email, password, done) => {
        console.log('email', email);
        try {
          const user = await (await userdb).findOne({ email });

          if (!user) {
            return done(null, false, {
              type: 'login',
              success: false,
              message: '해당 아이디를 찾을 수 없습니다.',
            });
          }

          const passwordCheckResult = verifyPassword(
            password,
            user.salt,
            user.password
          );

          if (passwordCheckResult) {
            return done(null, user);
          }

          return done(null, false, {
            type: 'login',
            success: false,
            message: '비밀 번호가 틀립니다.',
          });
        } catch (error) {
          console.error(error);
          return done(error);
        }
      }
    )
  );
};

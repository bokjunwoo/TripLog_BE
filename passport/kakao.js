const passport = require('passport');
const { Strategy: KakaoStrategy } = require('passport-kakao');
const mongoClient = require('../routes/mongo');

module.exports = () => {
  passport.use(
    new KakaoStrategy(
      {
        clientID: process.env.KAKAO_APP_CLIENT_ID,
        callbackURL:'/user/auth/kakao/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        const client = await mongoClient.connect();
        const userdb = client.db('TripLogV2').collection('user');
        const user = await userdb.findOne({ id: profile.id });

        if (!user) {
          return done(null, false, {
            type: 'signup',
            success: true,
            message: '닉네임 정보가 필요합니다.',
          });
        }

        return done(null, user);
      }
    )
  );
};

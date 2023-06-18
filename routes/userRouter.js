const express = require('express');

const router = express.Router();

const mongoDB = require('../controllers/user');

const { isLoggedIn } = require('../passport/middleware');

const mongoClient = require('../routes/mongo');
const _client = mongoClient.connect();

const checklist = require('../data/checklist');

const multer = require('multer');

const fs = require('fs');
const passport = require('passport');

const dir = './uploads';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '_' + Date.now());
  },
});

const limits = {
  fileSize: 1024 * 1024 * 2,
};

const upload = multer({ storage, limits });

// 유저정보 반환
router.get('/', async (req, res) => {
  const userInfo = req.user;
  try {
    if (userInfo) {
      res.send(JSON.stringify(userInfo.nickname));
    } else {
      res.send(JSON.stringify(null));
    }
  } catch (error) {
    console.error(error);
  }
});

// 유저이미지 반환
router.get('/image', async (req, res) => {
  const userInfo = req.user;
  try {
    if (userInfo) {
      res.send(JSON.stringify(userInfo.image));
    } else {
      res.send(JSON.stringify(null));
    }
  } catch (error) {
    console.error(error);
  }
});

// 회원가입 아이디 중복확인(POST)
router.post('/register/idcheck', async (req, res) => {
  const registerId = req.body;
  const result = await mongoDB.idCheck(registerId);
  res.send(JSON.stringify(result));
});

// 회원가입 닉네임 중복확인(POST)
router.post('/register/namecheck', async (req, res) => {
  const registerId = req.body;
  const result = await mongoDB.nameCheck(registerId);
  res.send(JSON.stringify(result));
});

// 로컬 회원 가입 모듈(POST)
router.post('/localregister', async (req, res) => {
  const localregister = req.body;
  const result = await mongoDB.localRegister(localregister);
  res.send(JSON.stringify(result));
});

// 카카오 회원 가입 모듈(POST)
router.post('/kakaoregister', async (req, res, next) => {
  const kakaoRegister = req.body;

  const client = await _client;
  const userdb = client.db('TripLogV2').collection('user');
  const chargedb = client.db('TripLogV2').collection('charge');
  const checkdb = client.db('TripLogV2').collection('checklist');

  const kakaoRegisterType = kakaoRegister.type;
  const kakaoRegisterData = kakaoRegister.data;

  const duplicatedNickname = await userdb.findOne({
    nickname: kakaoRegisterData.nickname,
  });

  if (duplicatedNickname) {
    return {
      type: 'signup',
      success: false,
      message: '중복된 닉네임이 존재해 실패하였습니다.',
    };
  }

  const registerUser = {
    type: kakaoRegisterType,
    id: kakaoRegisterData.id,
    nickname: kakaoRegisterData.nickname,
    image: '',
  };

  const result = await userdb.insertOne(registerUser);

  const chargeInsert = await chargedb.insertOne({
    nickname: kakaoRegisterData.nickname,
    chargeList: [],
  });

  const checkInsert = await checkdb.insertOne({
    nickname: kakaoRegisterData.nickname,
    checklist,
  });

  if (
    result.acknowledged &&
    chargeInsert.acknowledged &&
    checkInsert.acknowledged
  ) {
    return req.login(registerUser, async (error) => {
      if (error) {
        console.error(error);
        return next(error);
      }

      return res.send({
        type: 'login',
        success: true,
        message: '로그인이 완료되었습니다.',
        nickname: kakaoRegisterData.nickname,
      });
    });
  } else {
    throw new Error('통신 이상');
  }
});

// 로컬 로그인(POST)
router.post('/local', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      console.error(err);
      return next(err);
    }

    if (info) {
      return res.send(info);
    }

    return req.login(user, async (error) => {
      if (error) {
        console.error(error);
        return next(error);
      }

      return res.send({
        type: 'login',
        success: true,
        message: '로그인 되었습니다.',
        nickname: user.nickname,
      });
    });
  })(req, res, next);
});

// 카카오로그인(POST)
router.post('/kakao', async (req, res, next) => {
  const kakaoLogin = req.body;

  const client = await _client;
  const userdb = client.db('TripLogV2').collection('user');
  const user = await userdb.findOne({ id: kakaoLogin.id });

  if (!user) {
    return res.send({
      type: 'signup',
      success: true,
      message: '닉네임 정보가 필요합니다.',
    });
  }

  return req.login(user, async (error) => {
    if (error) {
      console.error(error);
      return next(error);
    }

    return res.send({
      type: 'login',
      success: true,
      message: '카카오 로그인이 성공했습니다.',
      nickname: user.nickname,
    });
  });
});

// 패스포트 로그아웃
router.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      // 에러 처리
      console.error(err);
      return res.status(500).send({
        type: 'logout',
        success: false,
        message: '로그아웃 중 에러가 발생했습니다.',
      });
    }

    req.session.destroy((err) => {
      if (err) {
        // 에러 처리
        console.error(err);
        return res.status(500).send({
          type: 'logout',
          success: false,
          message: '세션 제거 중 에러가 발생했습니다.',
        });
      }

      res.send({
        type: 'logout',
        success: true,
        message: '로그아웃 되었습니다.',
      });
    });
  });
});

// 유저 IMG(POST)
// router.post('/image', upload.single('image'), async (req, res) => {
//   if (!fs.existsSync(dir)) fs.mkdirSync(dir);
//   res.send(JSON.stringify(req.file.filename));
// });

// 유저 이미지 업로드(POST)
router.post('/upload', async (req, res) => {
  const data = await mongoDB.updateImage(req.body);
  res.send(JSON.stringify(data));
});

module.exports = router;

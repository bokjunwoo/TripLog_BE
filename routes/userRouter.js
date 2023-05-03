const express = require('express');

const router = express.Router();

const mongoDB = require('../controllers/user');

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
router.post('/kakaoregister', async (req, res) => {
  const kakaoRegister = req.body;
  const result = await mongoDB.kakaoRegister(kakaoRegister);
  res.send(JSON.stringify(result));
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

    return req.login(user, async (loginErr) => {
      console.log('login 실행');
      if (loginErr) {
        console.error(loginErr);
        return next(loginErr);
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
router.post('/kakao', async (req, res) => {
  const kakaoLogin = req.body.data;
  const result = await mongoDB.kakaoLogin(kakaoLogin);
  res.send(JSON.stringify(result));
});

// 유저 IMG(POST)
router.post('/image', upload.single('image'), async (req, res) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);
  res.send(JSON.stringify(req.file.filename));
});

// 유저 이미지 업로드(POST)
router.post('/upload', async (req, res) => {
  const data = await mongoDB.updateImage(req.body);
  res.send(JSON.stringify(data));
});

module.exports = router;

const express = require('express');
const path = require('path');

const router = express.Router();

const mongoDB = require('../controllers/review');

const { isLoggedIn } = require('../passport/middleware');

const multer = require('multer');

const fs = require('fs');

const dir = './uploads';

const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, done) {
      done(null, 'uploads');
    },
    filename(req, file, done) {
      const ext = path.extname(file.originalname); // 확장자 추출
      const basename = path.basename(file.originalname, ext);
      done(null, basename + '_' + new Date().getTime() + ext);
    },
  }),
  limits: { fieldSize: 20 * 1024 * 1024 },
});

// 디테일페이지 리뷰 요청(GET)
router.get('/:contentId', async (req, res) => {
  const data = await mongoDB.getReview(req.params.contentId);
  res.send(JSON.stringify(data));
});

// 리뷰 작성 IMG(POST)
router.post('/image', upload.single('image'), async (req, res) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);
  res.send(JSON.stringify(req.file.filename));
});

// 리뷰 작성(POST)
router.post('/add', isLoggedIn, async (req, res) => {
  const data = await mongoDB.addReview(req.body);
  res.send(JSON.stringify(data));
});

// 리뷰 수정(POST)
router.post('/edit', isLoggedIn, async (req, res) => {
  const data = await mongoDB.editReview(req.body);
  res.send(JSON.stringify(data));
});

// 리뷰 삭제(DELETE)
router.delete('/delete', isLoggedIn, async (req, res) => {
  const data = await mongoDB.deleteReview(req.body);
  res.send(JSON.stringify(data));
});

// 유저 전체 리뷰 (POST)
router.post('/all', isLoggedIn, async (req, res) => {
  const data = await mongoDB.allReview(req.user);
  res.send(JSON.stringify(data));
});

// 리뷰 IMG(POST)
router.post('/images', isLoggedIn, upload.array('image'), async (req, res) => {
  res.json(req.files.map((v) => v.filename));
});

module.exports = router;

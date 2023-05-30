const express = require('express');

const router = express.Router();

const mongoDB = require('../controllers/review');

const multer = require('multer');

const fs = require('fs');

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
router.post('/add', async (req, res) => {
  const data = await mongoDB.addReview(req.body);
  res.send(JSON.stringify(data));
});

// 리뷰 수정(POST)
router.post('/emend', async (req, res) => {
  const data = await mongoDB.postEmendReview(req.body);
  res.send(JSON.stringify(data));
});

// 리뷰 삭제(DELETE)
router.delete('/delete', async (req, res) => {
  const data = await mongoDB.deleteReview(req.body);
  res.send(JSON.stringify(data));
});

module.exports = router;

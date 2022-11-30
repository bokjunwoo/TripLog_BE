const express = require('express');

const router = express.Router();

const mongoDB = require('../controllers/like');

/* like update */
// plus
router.post('/plus', async (req, res) => {
  const data = await mongoDB.likeIncPlus(req.body);
  res.send(JSON.stringify(data))
})
// minus
router.post('/minus', async (req, res) => {
  const data = await mongoDB.likeIncMinus(req.body);
  res.send(JSON.stringify(data))
})

// setData
router.post('/setData', async (req, res) => {
  const msg = await mongoDB.setData();
  res.send(JSON.stringify(msg));
});

// item 불러오기
router.post('/getlikes', async (req, res) => {
  const data = await mongoDB.getLikes(req.body);
  // console.log(req.body);
  res.send(data);
});

// item 추가
router.post('/arrlike', async (req, res) => {
  const data = await mongoDB.arrLike(req.body);
  // console.log('????', req.body);
  res.send(JSON.stringify(data));
});

module.exports = router;

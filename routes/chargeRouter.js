const express = require('express');

const router = express.Router();

const mongoDB = require('../controllers/charge');

// 금액 요청(POST)
router.post('/', async (req, res) => {
  const data = await mongoDB.postCharge(req.user);
  res.send(JSON.stringify(data));
});

// 금액 만들기(POST)
router.post('/add', async (req, res) => {
  const data = await mongoDB.addCharge(req.body);
  res.send(JSON.stringify(data));
});

// 금액 삭제(POST)
router.delete('/delete', async (req, res) => {
  const data = await mongoDB.deleteCharge(req.body);
  res.send(JSON.stringify(data));
});

// 금액 전체삭제(POST)
router.delete('/deleteall', async (req, res) => {
  const data = await mongoDB.deleteAllCharge(req.body);
  res.send(JSON.stringify(data));
});

module.exports = router;

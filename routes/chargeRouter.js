const express = require('express');

const router = express.Router();

const mongoDB = require('../controllers/charge');

// 금액 요청(POST)
router.post('/', async (req, res) => {
  const data = await mongoDB.postCharge(req.body);
  res.send(JSON.stringify(data));
});

// 금액 만들기(POST)
router.post('/write', async (req, res) => {
  const data = await mongoDB.saveCharge(req.body);
  res.send(JSON.stringify(data));
});

// 금액 삭제(POST)
router.post('/delete', async (req, res) => {
  const data = await mongoDB.deleteCharge(req.body);
  res.send(JSON.stringify(data));
});

// 금액 전체삭제(POST)
router.post('/alldelete', async (req, res) => {
  const data = await mongoDB.deleteAll(req.body);
  res.send(JSON.stringify(data));
});

module.exports = router;

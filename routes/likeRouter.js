const express = require('express');

const router = express.Router();

const mongoDB = require('../controllers/like');

// plus 요청(POST)
router.post('/plus', async (req, res) => {
  const data = await mongoDB.likeIncPlus(req.body);
  res.send(JSON.stringify(data));
});

// minus 요청(POST)
router.post('/minus', async (req, res) => {
  const data = await mongoDB.likeIncMinus(req.body);
  res.send(JSON.stringify(data));
});

module.exports = router;

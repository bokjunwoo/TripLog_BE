const express = require('express');

const router = express.Router();

const mongoDB = require('../controllers/like');

const { isLoggedIn } = require('../passport/middleware');

// plus 요청(POST)
router.post('/plus', isLoggedIn, async (req, res) => {
  const data = await mongoDB.likeIncPlus(req.body);
  res.send(JSON.stringify(data));
});

// minus 요청(POST)
router.post('/minus', isLoggedIn, async (req, res) => {
  const data = await mongoDB.likeIncMinus(req.body);
  res.send(JSON.stringify(data));
});

module.exports = router;

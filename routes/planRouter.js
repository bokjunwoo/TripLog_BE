const express = require('express');

const router = express.Router();

const mongoDB = require('../controllers/plan');

const { isLoggedIn } = require('../passport/middleware');

// 내 여행 저장
router.post('/add', isLoggedIn, async (req, res) => {
  const data = await mongoDB.addPlan(req.body);
  res.send(JSON.stringify(data));
});

router.post('/search', isLoggedIn, async (req, res) => {
  const data = await mongoDB.searchPlan(req.body);
  res.send(JSON.stringify(data));
});

// 유저 전체 플랜 (POST)
router.post('/all', isLoggedIn, async (req, res) => {
  const data = await mongoDB.allPlan(req.user);
  res.send(JSON.stringify(data));
});

// 플랜 삭제(DELETE)
router.delete('/delete', isLoggedIn, async (req, res) => {
  const data = await mongoDB.deletePlan(req.body);
  res.send(JSON.stringify(data));
});

module.exports = router;

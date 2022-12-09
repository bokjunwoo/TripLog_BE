const express = require('express');

const router = express.Router();

const mongoDB = require('../controllers/plan');

// 내 여행 저장
router.post('/', async (req, res) => {
  const data = await mongoDB.savePlan(req.body);
  res.send(JSON.stringify(data));
});

module.exports = router;

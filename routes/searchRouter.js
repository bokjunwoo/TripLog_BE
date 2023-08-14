const express = require('express');

const router = express.Router();

const mongoDB = require('../controllers/search');

// params의 데이터 가져오기(GET)
router.get('/', async (req, res) => {
  const data = await mongoDB.getList(req.query);
  res.send(JSON.stringify(data));
});

module.exports = router;

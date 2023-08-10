const express = require('express');

const router = express.Router();

const mongoDB = require('../controllers/list');

// params의 데이터 가져오기(GET)
router.get('/:title', async (req, res) => {
  const data = await mongoDB.getList(req.query);
  res.send(JSON.stringify(data));
});

module.exports = router;

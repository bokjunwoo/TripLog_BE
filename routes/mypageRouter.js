const express = require('express');

const router = express.Router();

const mongoDB = require('../controllers/mypage');

// params의 데이터 가져오기(GET)
router.get('/:nickName/:option', async (req, res) => {
  const data = await mongoDB.getMypage(req.params);
  res.send(JSON.stringify(data));
});

module.exports = router;

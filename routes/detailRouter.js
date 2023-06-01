const express = require('express');

const router = express.Router();

const mongoDB = require('../controllers/detail');

// 디테일 데이터(GET)
router.get('/:region/:id', async (req, res) => {
  console.log(req.params)
  const data = await mongoDB.getAlldetail(req.params);
  res.send(JSON.stringify(data));
});

// 해당 디테일 정보의 리뷰, 별점 데이터(GET)
router.get('/:id', async (req, res) => {
  const data = await mongoDB.getEtcdetail(req.params.id);
  res.send(JSON.stringify(data));
});

module.exports = router;

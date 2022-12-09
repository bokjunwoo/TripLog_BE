const express = require('express');

const router = express.Router();

const mongoDB = require('../controllers/checklist');

// item 요청(POST)
router.post('/', async (req, res) => {
  const data = await mongoDB.getItem(req.body);
  // console.log(req.body);
  res.send(data);
});

// item 추가(POST)
router.post('/addItem', async (req, res) => {
  const data = await mongoDB.addItem(req.body);
  res.send(JSON.stringify(data));
});

// checked 변경(POST)
router.post('/checked', async (req, res) => {
  const msg = await mongoDB.checkedItem(req.body);
  res.send(msg);
});

// checked 삭제(DELETE)
router.delete('/deleteItem', async (req, res) => {
  const data = await mongoDB.deleteItem(req.body);
  // console.log(req.body);
  res.send(data);
});

module.exports = router;

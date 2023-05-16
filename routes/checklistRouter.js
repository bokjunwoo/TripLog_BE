const express = require('express');

const router = express.Router();

const mongoDB = require('../controllers/checklist');

// item 요청(POST)
router.post('/', async (req, res) => {
  const data = await mongoDB.postItem(req.user);
  res.send(data);
});

// item 추가(POST)
router.post('/add', async (req, res) => {
  const data = await mongoDB.addItem(req.body);
  res.send(JSON.stringify(data));
});

// checked 변경(POST)
router.patch('/checked', async (req, res) => {
  const data = await mongoDB.checkedItem(req.body);
  res.send(data);
});

// checked 삭제(DELETE)
router.delete('/delete', async (req, res) => {
  const data = await mongoDB.deleteItem(req.body);
  res.send(data);
});

module.exports = router;

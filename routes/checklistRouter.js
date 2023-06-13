const express = require('express');

const router = express.Router();

const mongoDB = require('../controllers/checklist');

const { isLoggedIn } = require('../passport/middleware');

// item 요청(POST)
router.post('/', isLoggedIn, async (req, res) => {
  const data = await mongoDB.postItem(req.user);
  res.send(data);
});

// item 추가(POST)
router.post('/add', isLoggedIn, async (req, res) => {
  const data = await mongoDB.addItem(req.body);
  res.send(JSON.stringify(data));
});

// checked 변경(POST)
router.patch('/checked', isLoggedIn, async (req, res) => {
  const data = await mongoDB.checkedItem(req.body);
  res.send(data);
});

// checked 삭제(DELETE)
router.delete('/delete', isLoggedIn, async (req, res) => {
  const data = await mongoDB.deleteItem(req.body);
  res.send(data);
});

module.exports = router;

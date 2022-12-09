const mongoClient = require('../routes/mongo');

const _client = mongoClient.connect();

const checkDB = {
  // item 요청(POST)
  postItem: async ({ nickName }) => {
    const client = await _client;
    const db = client.db('triplog').collection('checklist');
    const data = await db.findOne({ nickName: nickName });
    return data
  },

  // item 추가(POST)
  addItem: async (item) => {
    const client = await _client;
    const db = client.db('triplog').collection('checklist');
    const result = await db.updateOne(
      { nickName: item.nickName, 'items.title': item.title },
      {
        $addToSet: {
          'items.$.content': item.item,
        },
      }
    );
    if (result.acknowledged) {
      return item;
    } else {
      throw new Error('통신 이상');
    }
  },

  // checked 변경(POST)
  checkedItem: async (el) => {
    const client = await _client;
    const db = client.db('triplog').collection('checklist');
    const result = await db.updateOne(
      { nickName: el.nickName },
      { $set: { checked: el.checked } }
    );
    if (result.acknowledged) {
      return '업데이트 성공';
    } else {
      throw new Error('통신 이상');
    }
  },

  // checked 삭제(DELETE)
  deleteItem: async (el) => {
    const client = await _client;
    const db = client.db('triplog').collection('checklist');
    const result = await db.updateOne(
      { nickName: el.nickName, 'items.title': el.title },
      { $pull: { 'items.$.content': el.item } }
    );
    if (result.acknowledged) {
      return '삭제 되었습니다.';
    } else {
      throw new Error('통신 이상');
    }
  },
};

module.exports = checkDB;
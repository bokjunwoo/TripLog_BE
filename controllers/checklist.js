const mongoClient = require('../routes/mongo');

const _client = mongoClient.connect();

const checkDB = {
  // item 요청(POST)
  postItem: async (user) => {
    try {
      if (!user) {
        return null;
      }
      const client = await _client;
      const db = client.db('TripLogV2').collection('checklist');
      const data = await db.findOne({ nickname: user.nickname });
      return data;
    } catch (error) {
      console.error(error);
    }
  },

  // item 추가(POST)
  addItem: async (data) => {
    try {
      const client = await _client;
      const checklistdb = client.db('TripLogV2').collection('checklist');
      const { user, title, item } = data;

      const result = await checklistdb.updateOne(
        { nickname: user, 'checklist.content.title': title },
        { $push: { 'checklist.content.$.items': { item, checked: false } } }
      );

      if (result.acknowledged) {
        return '업데이트 성공';
      }
    } catch (error) {
      console.error(error);
    }
  },

  // checked 변경(POST)
  checkedItem: async (data) => {
    try {
      const client = await _client;
      const checklistdb = client.db('TripLogV2').collection('checklist');
      const { user, title, item, checked } = data;

      const result = await checklistdb.updateOne(
        {
          nickname: user,
          'checklist.content.title': title,
          'checklist.content.items.item': item,
        },
        { $set: { 'checklist.content.$.items.$[elem].checked': checked } },
        { arrayFilters: [{ 'elem.item': item }] }
      );

      if (result.acknowledged) {
        return '업데이트 성공';
      } else {
        throw new Error('통신 이상');
      }
    } catch (error) {
      console.error(error);
    }
  },

  // checked 삭제(DELETE)
  deleteItem: async (data) => {
    try {
      const client = await _client;
      const checklistdb = client.db('TripLogV2').collection('checklist');
      const { user, title, item } = data;

      const result = await checklistdb.updateOne(
        { nickname: user, 'checklist.content.title': title },
        { $pull: { 'checklist.content.$.items': { item } } }
      );

      if (result.acknowledged) {
        return '업데이트 성공';
      } else {
        throw new Error('통신 이상');
      }
    } catch (error) {
      console.error(error);
    }
  },
};

module.exports = checkDB;

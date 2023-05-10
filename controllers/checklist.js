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
      const userdata = await checklistdb.findOne({ nickname: data.user });

      if (userdata) {
        // userdata가 존재할 경우에만 처리
        const { title, item } = data;

        const matchingItem = userdata.items.content.find(
          (itemContent) => itemContent.title === title
        );

        if (matchingItem) {
          // title이 일치하는 경우
          if (!matchingItem.items) {
            matchingItem.items = [];
          }
          matchingItem.items.push({ item, checked: false });
        }

        // userdata 업데이트
        await checklistdb.updateOne({ _id: userdata._id }, { $set: userdata });
      }
    } catch (error) {
      console.error(error);
    }
  },

  // checked 변경(POST)
  checkedItem: async (el) => {
    const client = await _client;
    const db = client.db('TripLogV2').collection('checklist');
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
    const db = client.db('TripLogV2').collection('checklist');
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

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

        const matchingItem = userdata.checklist.content.find(
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
        const result = await checklistdb.updateOne(
          { _id: userdata._id },
          { $set: userdata }
        );
        if (result.acknowledged) {
          return userdata;
        }
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
        { nickname: user, 'checklist.content.title': title, 'checklist.content.items.item': item },
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
      const userdata = await checklistdb.findOne({ nickname: data.user });

      if (userdata) {
        // userdata가 존재할 경우에만 처리
        const { title, item } = data;

        const deleteData = userdata.checklist.content.map((itemContent) => {
          if (itemContent.title === title) {
            const deleteItems = itemContent.items.filter(
              (checklistItem) => checklistItem.item !== item
            );
            return {
              ...itemContent,
              items: deleteItems,
            };
          }
          return itemContent;
        });

        const result = await checklistdb.updateOne(
          { nickname: data.user },
          { $set: { 'checklist.content': deleteData } }
        );

        if (result.acknowledged) {
          return '업데이트 성공';
        } else {
          throw new Error('통신 이상');
        }
      }
    } catch (error) {
      console.error(error);
    }
  },
};

module.exports = checkDB;

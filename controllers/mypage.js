const mongoClient = require('../routes/mongo');

const _client = mongoClient.connect();

const mypageDB = {
  // params의 데이터 가져오기
  getMypage: async (params) => {
    const client = await _client;
    const db = client.db('triplog').collection(`${params.option}`);
    const data = await db.find({ nickName: `${params.nickName}` }).toArray();
    return data;
  },
};

module.exports = mypageDB;

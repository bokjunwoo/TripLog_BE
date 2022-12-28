const mongoClient = require('../routes/mongo');

const _client = mongoClient.connect();

const mypageDB = {
  // 유저이미지(POST)
  postUserImage: async (nickName) => {
    const client = await _client;
    const db = client.db('triplog').collection('users');
    const data = await db.findOne({ nickName: nickName });
    return data;
  },

  // params의 데이터 가져오기(GET)
  getMypage: async (params) => {
    const client = await _client;
    const db = client.db('triplog').collection(`${params.option}`);
    const data = await db.find({ nickName: `${params.nickName}` }).toArray();
    return data;
  },
};

module.exports = mypageDB;

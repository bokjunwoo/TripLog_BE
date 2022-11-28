const mongoClient = require('../routes/mongo');

const _client = mongoClient.connect();

const listDB = {
  // params의 데이터 가져오기
  getList: async (params) => {
    const client = await _client;
    const db = client.db('triplog').collection(`${params.region}`);
    const data = await db.find({ type: `${params.type}` }).toArray()
    return data;
  },
};

module.exports = listDB;

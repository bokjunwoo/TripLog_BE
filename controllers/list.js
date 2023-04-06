const mongoClient = require('../routes/mongo');

const _client = mongoClient.connect();

const listDB = {
  // params의 데이터 가져오기(GET)
  getList: async (query) => {
    const client = await _client;
    const db = client.db('TripLogV2').collection(`${query.region}`);
    const page = query.page[0] || 1; // 기본 페이지는 1
    const limit = 12; // 페이지당 리스트 개수
    const skipIndex = (page - 1) * limit;
    const data = await db
      .find({ type: `${query.type}` })
      .skip(skipIndex)
      .limit(limit)
      .toArray();
    const total = await db.find({ type: `${query.type}` }).count();
    return {data, total};
  },
};

module.exports = listDB;

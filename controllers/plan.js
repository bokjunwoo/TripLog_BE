const mongoClient = require('../routes/mongo');

// _여러번 실행되는 걸 막음
const _client = mongoClient.connect();

const planDB = {
  // 여행 저장(POST)
  savePlan: async (list) => {
    const client = await _client;
    const db = client.db('TripLogV2').collection('plan');
    const plan = await db.insertOne(list);
    if (plan.acknowledged) {
      return true;
    } else {
      throw new Error('통신이상');
    }
  },
};

module.exports = planDB;

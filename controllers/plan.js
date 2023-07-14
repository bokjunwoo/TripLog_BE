const { ObjectId } = require('mongodb');
const mongoClient = require('../routes/mongo');

// _여러번 실행되는 걸 막음
const _client = mongoClient.connect();

const planDB = {
  // 여행 저장(POST)
  addPlan: async (data) => {
    const client = await _client;
    const db = client.db('TripLogV2').collection('plan');
    const plan = await db.insertOne(data);
    if (plan.acknowledged) {
      return true;
    } else {
      throw new Error('통신이상');
    }
  },

  searchPlan: async (search) => {
    const client = await _client;
    const db = client.db('TripLogV2').collection(`${search.region}`);
    const data = await db.findOne({ title: `${search.search}` });

    if (data) {
      return data;
    } else {
      return null;
    }
  },
};

module.exports = planDB;

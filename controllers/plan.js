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

    const searchRequirements = [
      {
        $search: {
          index: `${search.region}Title`,
          text: {
            query: search.search,
            path: 'title',
          },
        },
      },
      { $sort: { _id: -1 } },
    ];

    const data = await db.aggregate(searchRequirements).toArray();

    if (data.length !== 0) {
      return data;
    } else {
      return null;
    }
  },

  allPlan: async (user) => {
    try {
      if (!user) {
        return null;
      }
      const client = await _client;
      const db = client.db('TripLogV2').collection('plan');
      const data = await db
        .find({ nickname: user.nickname })
        .sort({ _id: -1 }) // _id 필드를 기준으로 역순으로 정렬
        .toArray();
      return data;
    } catch (error) {
      console.error(error);
    }
  },

  deletePlan: async (data) => {
    console.log(data);
    const client = await _client;
    const plandb = client.db('TripLogV2').collection('plan');

    const planData = await plandb.deleteOne({
      _id: ObjectId(data._id),
      nickname: data.user,
    });

    if (planData.acknowledged) {
      return true;
    } else {
      throw new Error('통신이상');
    }
  },
};

module.exports = planDB;

const mongoClient = require('../routes/mongo');

const _client = mongoClient.connect();

const chargeDB = {
  // 금액 요청(POST)
  postCharge: async (user) => {
    try {
      if (!user) {
        return null;
      }
      const client = await _client;
      const db = client.db('TripLogV2').collection('charge');
      const data = await db.findOne({ nickname: user.nickname });
      return data;
    } catch (error) {
      console.error(error);
    }
  },

  // 금액 추가(POST)
  addCharge: async (data) => {
    console.log(data)
    try {
      const client = await _client;
      const chargedb = client.db('TripLogV2').collection('charge');
      const { user, date, title, price } = data;

      const result = await chargedb.updateOne(
        {
          nickname: user,
        },
        { $addToSet: { chargeList: { id: Date(), date, title, price } } }
      );

      if (result.acknowledged) {
        return '데이터 추가 완료';
      } else {
        throw new Error('통신 이상');
      }
    } catch (error) {
      console.error(error)
    }
  },

  // 금액 삭제(POST)
  deleteCharge: async (data) => {
    const client = await _client;
    const db = client.db('TripLogV2').collection('charge');
    const charge = await db.updateOne(
      { nickName: data.nickName },
      {
        $pull: { chargeList: { title: data.a.title } },
      }
    );

    if (charge.acknowledged) {
      return true;
    } else {
      throw new Error('통신이상');
    }
  },

  // 금액 초기화(POST)
  deleteAll: async (data) => {
    const client = await _client;
    const db = client.db('TripLogV2').collection('charge');
    const charge = await db.updateOne(
      { nickName: data.nickName },
      {
        $set: { chargeList: [] },
      }
    );

    if (charge.acknowledged) {
      return true;
    } else {
      throw new Error('통신이상');
    }
  },
};

module.exports = chargeDB;

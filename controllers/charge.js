const mongoClient = require('../routes/mongo');

// _여러번 실행되는 걸 막음
const _client = mongoClient.connect();

const chargeDB = {
  // 금액 요청(POST)
  postCharge: async ({ nickName }) => {
    const client = await _client;
    const db = client.db('triplog').collection('charge');
    const find = await db.findOne({ nickName: nickName });

    if (find === null) {
      const insertRes = await db.insertOne({
        nickName: nickName,
        chargeList: [],
      });
      if (insertRes.acknowledged) {
        return insertRes;
      } else {
        throw new Error('통신 이상');
      }
    } else {
      return find;
    }
  },

  // 금액 추가(POST)
  saveCharge: async (data) => {
    const client = await _client;
    const db = client.db('triplog').collection('charge');
    const charge = await db.updateOne(
      { nickName: data.nickName },
      {
        $addToSet: {
          chargeList: data.chargeList,
        },
      }
    );

    if (charge.acknowledged) {
      return charge;
    } else {
      throw new Error('통신 이상');
    }
  },

  // 금액 삭제(POST)
  deleteCharge: async (data) => {
    const client = await _client;
    const db = client.db('triplog').collection('charge');
    console.log(data);
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
    const db = client.db('triplog').collection('charge');
    console.log(data);
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

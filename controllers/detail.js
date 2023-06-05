const { query } = require('express');
const mongoClient = require('../routes/mongo');

const _client = mongoClient.connect();

const checkDB = {
  // 디테일 데이터(GET)
  getAlldetail: async (params) => {
    if (params.region === 'undefined' && params.id === 'undefined') {
      return null;
    }
    const client = await _client;
    const db = client.db('TripLogV2').collection(`${params.region}`);
    const data = await db.findOne({ contentid: `${params.id}` });

    // 조회수 +1
    if (data) {
      await db.updateOne({ contentid: `${params.id}` }, { $inc: { view: +1 } });
    } else {
      throw new Error('에러');
    }

    return data;
  },

  // 해당 디테일 정보의 리뷰, 별점 데이터(GET)
  getEtcdetail: async (params) => {
    if (params.id === 'undefined') {
      return null;
    }
    const client = await _client;
    const db = client.db('TripLogV2').collection('like');
    const data = await db.findOne({ contentid: params.id });
    return data.likeuser;
  },
};

module.exports = checkDB;

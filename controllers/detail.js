const mongoClient = require('../routes/mongo');

const _client = mongoClient.connect();

const checkDB = {
  // 디테일 데이터
  getAlldetail: async (params) => {
    const client = await _client;
    const db = client.db('triplog').collection(`${params.region}`);
    const data = await db.findOne({ contentid: `${params.contentid}` });

    // 조회수 +1
    if (data) {
      await db.updateOne(
        { contentid: `${params.contentid}` },
        { $inc: { view: +1 } }
      );
    } else {
      throw new Error('에러');
    }

    return data;
  },

  // 해당 디테일 정보의 리뷰, 별점 데이터
  getEtcdetail: async (contentid) => {
    const client = await _client;
    const db = client.db('triplog').collection('contentid');
    const data = await db.findOne({ contentid: contentid });
    return data;
  },
};

module.exports = checkDB;

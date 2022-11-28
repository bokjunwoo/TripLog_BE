const mongoClient = require('../routes/mongo');

const _client = mongoClient.connect();

const checkDB = {
  // 전체 데이터
  getAlldetail: async (params) => {
    const client = await _client;
    const db = client.db('triplog').collection(`${params.region}`);
    const data = await db.findOne({ contentid: `${params.contentId}` });
    return data;
  },

  // 리뷰, 별점 데이터
  getEtcdetail: async (contentId) => {
    const client = await _client;
    const db = client.db('triplog').collection('contentid');
    const data = await db.findOne({ contentid: contentId });
    return data;
  },

  // 사용자의 좋아요 항목 가져오기
  postLikeClick: async (likeData) => {
    const client = await _client;
    const db = client.db('triplog').collection('likes');
    const data = await db.findOne({ nickName: likeData.nickName });
    return data;
  },

  // 조회수 +1
  getData: async ({ data }) => {
    // console.log('@@@@@@@@@@@', data);
    const client = await _client;
    const db = client.db('triplog').collection('detail');
    const findResult = await db.findOne({
      'data.contentid': contentId,
    });
    // console.log(findResult);
    if (findResult) {
      const result = await db.updateOne(
        { 'data.contentid': contentId },
        { $inc: { view: +1 } }
      );
      if (result.acknowledged) {
        return findResult;
      } else {
        throw new Error('통신 이상');
      }
    } else {
      const insertRes = await db.insertOne({
        data,
        view: 1,
        like: 0,
      });
      // console.log('@', insertRes);
      if (insertRes.acknowledged) {
        return insertRes;
      } else {
        throw new Error('통신 이상');
      }
    }
  },

  // starAvg
  incStar: async (starAge, contentId) => {
    // console.log('@@@@@@@@@', starAge, contentId);
    console.log(starAge);
    const client = await _client;
    const db = client.db('triplog').collection('detail');
    const result = await db.updateOne(
      { 'data.contentid': contentId },
      { $set: starAge }
    );
    if (result.acknowledged) {
      return '별점 업데이트 성공';
    } else {
      throw new Error('통신 이상');
    }
  },

  // 좋아요 +1
  incLike: async (contentId) => {
    const client = await _client;
    const db = client.db('triplog').collection('detail');
    const result = await db.updateOne(
      { 'data.contentid': contentId },
      { $inc: { like: +1 } }
    );
    if (result.acknowledged) {
      return '좋아요 + 1 업데이트 성공';
    } else {
      throw new Error('통신 이상');
    }
  },
  // 좋아요 -1
  deleteLike: async (contentId) => {
    const client = await _client;
    const db = client.db('triplog').collection('detail');
    const result = await db.updateOne(
      { 'data.contentid': contentId },
      { $inc: { like: -1 } }
    );
    if (result.acknowledged) {
      return '좋아요 -1';
    } else {
      throw new Error('통신 이상');
    }
  },
};

module.exports = checkDB;

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

  // 사용자의 좋아요 항목 가져오기
  postLikeClick: async (likeData) => {
    const client = await _client;
    const db = client.db('triplog').collection('likes');
    const data = await db.findOne({ nickName: likeData.nickName });
    return data;
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

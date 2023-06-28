const { ObjectId } = require('mongodb');
const mongoClient = require('../routes/mongo');

// _여러번 실행되는 걸 막음
const _client = mongoClient.connect();

const reviewDB = {
  // 디테일페이지 리뷰 요청(GET)
  getReview: async (contentid) => {
    const client = await _client;
    const db = client.db('TripLogV2').collection('review');

    const data = await db
      .find({ contentid: contentid })
      .sort({ _id: -1 })
      .toArray();
    return data;
  },

  // 리뷰 작성(POST)
  addReview: async (review) => {
    const client = await _client;
    const userdb = client.db('TripLogV2').collection('user');
    const reviewdb = client.db('TripLogV2').collection('review');
    const regiondb = client.db('TripLogV2').collection(`${review.region}`);

    const user = await userdb.findOne({ nickname: review.user });
    const detail = await regiondb.findOne({ contentid: review.id });

    const contentid = review.id;
    const region = review.region;
    const title = detail.title;
    const nickname = review.user;
    const userImage = user.image;
    const content = review.text;
    const star = review.star;
    const time = new Date();

    const addReview = {
      contentid,
      region,
      title,
      nickname,
      userImage,
      content,
      star,
      time,
    };

    const reviewData = await reviewdb.insertOne(addReview);

    const starData = await regiondb.updateOne(
      { contentid },
      { $push: { star: { star, time, nickname } } }
    );

    if (reviewData.acknowledged && starData.acknowledged) {
      return true;
    } else {
      throw new Error('통신이상');
    }
  },

  // 리뷰 수정(POST)
  editReview: async (review) => {
    const client = await _client;
    const reviewdb = client.db('TripLogV2').collection('review');

    const objectId = review._id;
    const nickname = review.user;
    const content = review.text;

    const data = await reviewdb.updateOne(
      { _id: ObjectId(objectId), nickname },
      {
        $set: {
          content: content,
        },
      }
    );

    if (data.acknowledged) {
      return true;
    } else {
      throw new Error('통신이상');
    }
  },

  // 리뷰 삭제(DELETE)
  deleteReview: async (review) => {
    const client = await _client;
    const reviewdb = client.db('TripLogV2').collection('review');
    const regiondb = client.db('TripLogV2').collection(`${review.region}`);

    const objectId = review._id;
    const nickname = review.user;

    const findReview = await reviewdb.findOne({
      _id: ObjectId(objectId),
      nickname: review.user,
    });

    const reviewData = await reviewdb.deleteOne({
      _id: ObjectId(objectId),
      nickname: nickname,
    });

    const regionData = await regiondb.updateOne(
      { contentid: findReview.contentid },
      {
        $pull: {
          star: { nickname, time: findReview.time },
        },
      }
    );

    if (reviewData.acknowledged && regionData.acknowledged) {
      return true;
    } else {
      throw new Error('통신이상');
    }
  },

  allReview: async (user) => {
    try {
      if (!user) {
        return null;
      }
      const client = await _client;
      const db = client.db('TripLogV2').collection('review');
      const data = await db.find({ nickname: user.nickname }).toArray();
      return data;
    } catch (error) {
      console.error(error);
    }
  },
};

module.exports = reviewDB;

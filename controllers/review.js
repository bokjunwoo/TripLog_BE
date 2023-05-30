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
    const region = await regiondb.findOne({ contentid: review.id });

    const contentid = review.id;
    const title = region.title;
    const nickname = review.user;
    const userImage = user.image;
    const content = review.text;
    const star = review.star;
    const time = new Date();

    const addReview = {
      contentid,
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
  postEmendReview: async (emendData) => {
    const contentId = emendData[0].emendId;
    const content = emendData[0].emendContent;
    const nickName = emendData[0].nickName;

    const client = await _client;
    const db = client.db('TripLogV2').collection('review');
    const data = await db.updateOne(
      { _id: ObjectId(contentId), nickName: nickName },
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
    const regiondb = client.db('TripLogV2').collection(`${review[0].region}`);

    const reviewData = await reviewdb.deleteOne({
      _id: ObjectId(review[0]._id),
    });

    const regionData = await regiondb.updateOne(
      { contentid: review[0].contentid },
      {
        $pull: {
          star: { star: review[0].star, writeTime: review[0].writeTime },
        },
      }
    );

    if (reviewData.acknowledged && regionData.acknowledged) {
      return true;
    } else {
      throw new Error('통신이상');
    }
  },
};

module.exports = reviewDB;

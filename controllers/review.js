const { ObjectId } = require('mongodb');
const mongoClient = require('../routes/mongo');

// _여러번 실행되는 걸 막음
const _client = mongoClient.connect();

const reviewDB = {
  getUserReview: async ({ nickName }) => {
    const client = await _client;
    const db = client.db('triplog').collection('reviews');
    const data = await db.find({ nickName: nickName }).toArray();
    return data;
  },

  // 리뷰 요청(GET)
  getReview: async (contentid) => {
    const client = await _client;
    const db = client.db('triplog').collection('review');

    const data = await db
      .find({ contentid: contentid })
      .sort({ _id: -1 })
      .toArray();
    return data;
  },

  // 리뷰 작성(POST)
  postSaveReview: async (review) => {
    const client = await _client;
    const reviewdb = client.db('triplog').collection('review');
    const stardb = client.db('triplog').collection(`${review[0].region}`);

    const contentid = review[0].contentid;
    const title = review[0].title;
    const nickName = review[0].nickName;
    const userImage = review[0].userImage;
    const content = review[0].contentData;
    const star = parseInt(review[0].starData);
    const image = review[0].image;
    const today = new Date();
    const year = today.getFullYear();
    const month = ('0' + (today.getMonth() + 1)).slice(-2);
    const day = ('0' + today.getDate()).slice(-2);
    const hours = ('0' + today.getHours()).slice(-2);
    const minutes = ('0' + today.getMinutes()).slice(-2);
    const dateFull =
      year + '.' + month + '.' + day + ' ' + hours + ':' + minutes;

    const saveReview = {
      contentid,
      title,
      nickName,
      userImage,
      content,
      star,
      dateFull,
      image,
    };

    const reviewData = await reviewdb.insertOne(saveReview);

    const starData = await stardb.updateOne(
      { contentid: contentid },
      { $push: { star: star } }
    );

    if (reviewData.acknowledged && starData.acknowledged) {
      return true;
    } else {
      throw new Error('통신이상');
    }
  },

  // 리뷰 수정(GET)
  getEmendReview: async (_id) => {
    const client = await _client;
    const db = client.db('triplog').collection('review');
    const data = await db.findOne({ _id: ObjectId(_id) });
    return data;
  },

  // 리뷰 수정(POST)
  postEmendReview: async (emendData) => {
    const contentId = emendData[0].emendId;
    const content = emendData[0].emendContent;
    const nickName = emendData[0].nickName;

    const client = await _client;
    const db = client.db('triplog').collection('review');
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
  deleteReview: async (_id) => {
    const client = await _client;
    const db = client.db('triplog').collection('review');
    const review = await db.deleteOne({ _id: ObjectId(_id) });

    if (review.acknowledged) {
      return true;
    } else {
      throw new Error('통신이상');
    }
  },
};

module.exports = reviewDB;

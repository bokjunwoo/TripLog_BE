const mongoClient = require('../routes/mongo');

const _client = mongoClient.connect();

const likeDB = {
  likeIncPlus: async (data) => {
    const client = await _client;
    
    const reviewData = client.db('triplog').collection(`${data.region}`);
    const likePlus = await reviewData.updateOne(
      { contentid: data.contentid },
      { $inc: { like: +1 } }
    );

    const likeData = client.db('triplog').collection('contentid');
    const likeInc =  await likeData.updateOne(
      { contentid: data.contentid },
      { $inc: { like: +1 } }
    )
    const likeUserUpdata = await likeData.updateOne(
      { contentid: data.contentid },
      { $push: { likeuser: data.nickName } }
    );

    if (likePlus.acknowledged && likeUserUpdata.acknowledged && likeInc.acknowledged) {
      return likePlus;
    } else {
      throw new Error('통신 이상');
    }
  },

  likeIncMinus: async (data) => {
    const client = await _client;
    
    const reviewData = client.db('triplog').collection(`${data.region}`);
    const likePlus = await reviewData.updateOne(
      { contentid: data.contentid },
      { $inc: { like: -1 } }
    );

    const likeData = client.db('triplog').collection('contentid');
    const likeInc =  await likeData.updateOne(
      { contentid: data.contentid },
      { $inc: { like: -1 } }
    )
    const likeUserUpdata = await likeData.updateOne(
      { contentid: data.contentid },
      { $pull: { likeuser: data.nickName } }
    );

    if (likePlus.acknowledged && likeUserUpdata.acknowledged && likeInc.acknowledged) {
      return likePlus;
    } else {
      throw new Error('통신 이상');
    }
  },
};

module.exports = likeDB;

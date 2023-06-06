const mongoClient = require('../routes/mongo');

const _client = mongoClient.connect();

const likeDB = {
  // plus 요청(POST)
  likeIncPlus: async (data) => {
    const client = await _client;
    const reviewData = client.db('TripLogV2').collection(`${data.region}`);
    const likeData = client.db('TripLogV2').collection('like');

    const likePlus = await reviewData.updateOne(
      { contentid: data.id },
      { $inc: { like: +1 } }
    );

    const likeUpdate = await likeData.updateOne(
      { contentid: data.id },
      {
        $inc: { like: +1 },
        $push: { likeuser: data.user },
      }
    );

    if (likePlus.acknowledged && likeUpdate.acknowledged) {
      return true;
    } else {
      throw new Error('통신 이상');
    }
  },

  // minus 요청(POST)
  likeIncMinus: async (data) => {
    const client = await _client;
    const reviewData = client.db('TripLogV2').collection(`${data.region}`);
    const likeData = client.db('TripLogV2').collection('like');

    const likePlus = await reviewData.updateOne(
      { contentid: data.id },
      { $inc: { like: -1 } }
    );

    const likeUpdate = await likeData.updateOne(
      { contentid: data.id },
      {
        $inc: { like: -1 },
        $pull: { likeuser: data.user },
      }
    );

    if (likePlus.acknowledged && likeUpdate.acknowledged) {
      return true;
    } else {
      throw new Error('통신 이상');
    }
  },
};

module.exports = likeDB;

const mongoClient = require('../routes/mongo');

const _client = mongoClient.connect();

const apiDB = {
  // 전체 데이터 저장
  postAlldata: async (data) => {
    const client = await _client;
    const db = client.db('triplog').collection('jeju');

    for (let i = 0; i < data.length; i++) {
      const contentid = data[i].contentid;
      const addr1 = data[i].addr1;
      const addr2 = data[i].addr2;
      const mapx = data[i].mapx;
      const mapy = data[i].mapy;
      const title = data[i].title;
      const firstimage1 = data[i].firstimage;
      const firstimage2 = data[i].firstimage2;
      const tel = data[i].tel;

      const saveData = {
        contentid,
        // type: 'sightseeing',
        // type: 'culture',
        // type: 'lodgment',
        // type: 'shopping',
        type: 'food',
        title,
        addr1,
        addr2,
        mapx,
        mapy,
        firstimage1,
        firstimage2,
        tel,
        view: 0,
        star: 0,
        like: 0,
      };

      db.insertOne(saveData);
    }
  },

  // 리뷰, 별점 저장
  postEtcdata: async (data) => {
    const client = await _client;
    const db = client.db('triplog').collection('contentid');

    for (let i = 0; i < data.length; i++) {
      const contentid = data[i].contentid;

      const saveData = {
        contentid,
        star: 0,
        like: 0,
      };

      db.insertOne(saveData);
    }
  },
};

module.exports = apiDB;
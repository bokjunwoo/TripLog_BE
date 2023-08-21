const mongoClient = require('../routes/mongo');

const _client = mongoClient.connect();

const searchDB = {
  // params의 데이터 가져오기(GET)
  getList: async (query) => {
    console.log(query);
    if (query.region === '' || query.title === '') {
      return {
        data: null,
        currentPage: null,
        totalPage: null,
      };
    }

    const client = await _client;

    const db = client.db('TripLogV2').collection(`${query.region}`);

    const page = parseInt(query.page) || 1; // 기본 페이지는 1
    const limit = 12; // 페이지당 리스트 개수

    // 데이터 검색 쿼리
    const searchQuery = {
      title: {
        $regex: query.title,
        $options: 'i',
      },
    };

    // 전체 아이템 개수 가져오기
    const totalItems = await db.countDocuments(searchQuery);

    // 전체 페이지 수 계산
    const totalPage = Math.ceil(totalItems / limit);

    // 스킵할 아이템 수를 계산하여 페이지 설정
    const skipItems = (page - 1) * limit;

    const searchRequirements = [
      { $match: searchQuery }, // $match 연산자를 사용하여 검색
      { $skip: skipItems }, // 스킵할 아이템 수 설정
      { $limit: limit }, // 페이지당 아이템 수 설정
    ];

    const data = await db.aggregate(searchRequirements).toArray();

    return {
      data,
      currentPage: page,
      totalPage,
    };
  },

  bestList: async (data) => {
    const client = await _client;

    const collections = {
      seoul: client.db('TripLogV2').collection('seoul'),
      busan: client.db('TripLogV2').collection('busan'),
      gangneung: client.db('TripLogV2').collection('gangneung'),
      gyeongju: client.db('TripLogV2').collection('gyeongju'),
      jeonju: client.db('TripLogV2').collection('jeonju'),
      jeju: client.db('TripLogV2').collection('jeju'),
    };

    if (data.region && collections[data.region]) {
      const result = await collections[data.region]
        .find()
        .sort({ view: -1 })
        .limit(8)
        .toArray();

      return {
        data: result,
      };
    } else {
      const result = [];
      const regionNames = [
        'seoul',
        'busan',
        'gangneung',
        'gyeongju',
        'jeonju',
        'jeju',
      ];

      for (const regionName of regionNames) {
        const regionData = await collections[regionName]
          .find()
          .sort({ view: -1 })
          .limit(3)
          .toArray();

        const dataWithRegion = regionData.map((data) => ({
          ...data,
          region: regionName, // 컬렉션 이름을 region 속성에 추가
        }));

        result.push(...dataWithRegion);
      }

      result.sort((a, b) => b.view - a.view);

      return {
        data: result,
      };
    }
  },
};

module.exports = searchDB;

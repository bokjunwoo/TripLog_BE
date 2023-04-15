const mongoClient = require('../routes/mongo');

const _client = mongoClient.connect();

// 체크리스트 기본 설정 값
const initCheckState = {
  checked: [],
  items: [
    {
      title: '기본 짐싸기',
      content: [
        '의류',
        '전자기기 챙기기',
        '세안용품',
        '상비약',
        '신분증/면허증',
        '필기구',
        '마스크/손 소독제',
      ],
    },
    {
      title: '필수 준비물',
      content: ['숙소'],
    },
    {
      title: '트립로그에서 챙기기',
      content: ['여행 일정짜기', '가계부 짜기'],
    },
    {
      title: '통신/교통 준비',
      content: ['여행지 교통편'],
    },
    {
      title: '즐길거리 준비',
      content: ['관광 정보 확인하기', '맛집 정보 확인하기'],
    },
  ],
};

const crypto = require('crypto');

// 비밀 번호 생성용 함수
const createHashedPassword = (password) => {
  const salt = crypto.randomBytes(64).toString('base64');
  const hashedPassword = crypto
    .pbkdf2Sync(password, salt, 10, 64, 'sha512')
    .toString('base64');
  return { hashedPassword, salt };
  // 해싱할 값, salt, 해시 함수 반복 횟수, 해시 값 길이, 해시 알고리즘
};

// 사용자가 로그인 시 입력하는 비밀 번호 값과 DB에 저장 된 비밀 번호 값을 비교하여
// 로그인 성공 여부를 판단해주는 함수
const verifyPassword = (password, salt, userPassword) => {
  const hashed = crypto
    .pbkdf2Sync(password, salt, 10, 64, 'sha512')
    .toString('base64');

  if (hashed === userPassword) return true;
  return false;
};

const userDB = {
  // 회원가입 아이디 중복확인(POST)
  idCheck: async (registerId) => {
    const client = await _client;
    const userdb = client.db('TripLogV2').collection('user');
    const idCheck = await userdb.findOne({ email: registerId.email });

    if (idCheck === null) {
      return {
        idCheck: false,
      };
    } else {
      return {
        idCheck: true,
      };
    }
  },

  // 회원가입 닉네임 중복확인(POST)
  nameCheck: async (registerName) => {
    const client = await _client;
    const userdb = client.db('TripLogV2').collection('user');
    const nameCheck = await userdb.findOne({ nickname: registerName.nickname });

    if (nameCheck === null) {
      return {
        nameCheck: false,
      };
    } else {
      return {
        nameCheck: true,
      };
    }
  },

  // 회원 가입 모듈(POST)
  register: async (registerInfo) => {
    const client = await _client;
    const userdb = client.db('TripLogV2').collection('user');
    const chargedb = client.db('TripLogV2').collection('charge');
    const checkdb = client.db('TripLogV2').collection('checklist');

    const duplicatedEmail = await userdb.findOne({ email: registerInfo.email });

    if (duplicatedEmail) {
      return {
        duplicated: true,
        message: '중복된 이메일이 존재해 실패하였습니다.',
        status: 404,
      };
    }

    const duplicatedNickname = await userdb.findOne({
      email: registerInfo.nickname,
    });

    if (duplicatedNickname) {
      return {
        duplicated: true,
        message: '중복된 닉네임이 존재해 실패하였습니다.',
        status: 404,
      };
    }

    let registerUser = {};

    if (registerInfo.type === 'local') {
      const hash = createHashedPassword(registerInfo.password);

      registerUser = {
        type: registerInfo.type,
        email: registerInfo.email,
        nickname: registerInfo.nickname,
        password: hash.hashedPassword,
        salt: hash.salt,
        image: '',
      };
    } else {
      registerUser = {
        type: registerInfo.type,
        email: registerInfo.email,
        nickname: registerInfo.nickname,
        image: registerInfo.image,
      };
    }

    const result = await userdb.insertOne(registerUser);

    const chargeInsert = await chargedb.insertOne({
      nickname: registerInfo.nickname,
      chargeList: [],
    });

    const checkInsert = await checkdb.insertOne({
      nickname: registerInfo.nickname,
      checked: initCheckState.checked,
      items: initCheckState.items,
    });

    if (
      result.acknowledged &&
      chargeInsert.acknowledged &&
      checkInsert.acknowledged
    ) {
      return {
        duplicated: false,
        message: '회원 가입이 완료되었습니다.',
        status: 201,
      };
    } else {
      throw new Error('통신 이상');
    }
  },

  // 로그인(POST)
  login: async (loginInfo) => {
    const client = await _client;
    const userdb = client.db('TripLogV2').collection('user');
    // 로그인 시 입력한 email 정보가 db 에 있는지 체크
    const findID = await userdb.findOne({ email: loginInfo.email });
    // db에 email 이 있으면, 비밀 번호 확인 후 로그인 처리
    if (findID) {
      const passwordCheckResult = verifyPassword(
        loginInfo.password,
        findID.salt,
        findID.password
      );

      // 비밀 번호 일치 여부를 토대로 로그인 처리
      if (passwordCheckResult) {
        return {
          result: true,
          email: findID.email,
          nickname: findID.nickname,
          image: findID.image,
          msg: '로그인 성공! 메인 페이지로 이동 합니다.',
        };
      } else {
        return {
          result: false,
          msg: '비밀 번호가 틀립니다',
        };
      }
    } else {
      // db에 email 이 없으면 없다고 안내, 로그인 실패
      return {
        result: false,
        msg: '해당 E-Mail 을 찾을 수 없습니다!',
      };
    }
  },

  // 유저 이미지 업로드(POST)
  updateImage: async (user) => {
    const client = await _client;
    const userdb = client.db('TripLogV2').collection('user');

    const nickname = user[0].nickname;
    const image = user[0].image;

    const updataRes = await userdb.updateOne(
      { nickname: nickname },
      { $set: { image: image } }
    );

    if (updataRes.acknowledged) {
      return true;
    } else {
      throw new Error('통신이상');
    }
  },
};

module.exports = userDB;

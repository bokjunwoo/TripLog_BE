const mongoClient = require('../routes/mongo');

const _client = mongoClient.connect();

// 체크리스트 기본 설정 값
const initCheckState = {
  content: [
    {
      title: '기본 준비물',
      items: [
        { item: '의류', checked: false },
        { item: '세안용품', checked: false },
        { item: '상비약', checked: false },
        { item: '마스크', checked: false },
      ],
    },
    {
      title: '필수 준비물',
      items: [{ item: '숙소', checked: false }],
    },
    {
      title: '트립로그에서 챙기기',
      items: [
        { item: '여행 계획짜기', checked: false },
        { item: '가계부 작성', checked: false },
      ],
    },
    {
      title: '통신/교통 준비',
      items: [{ item: '여행지 교통편', checked: false }],
    },
    {
      title: '즐길거리 준비',
      items: [
        { item: '관광 정보 확인하기', checked: false },
        { item: '맛집 정보 확인하기', checked: false },
      ],
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
        type: 'register',
        message: '중복된 이메일이 존재해 실패하였습니다.',
        success: false,
      };
    }

    const duplicatedNickname = await userdb.findOne({
      email: registerInfo.nickname,
    });

    if (duplicatedNickname) {
      return {
        type: 'register',
        message: '중복된 닉네임이 존재해 실패하였습니다.',
        success: false,
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
        type: 'register',
        message: '회원 가입이 완료되었습니다.',
        success: true,
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
    const user = await userdb.findOne({ email: loginInfo.email });

    if (!user) {
      return {
        type: 'login',
        success: false,
        message: '해당 아이디를 찾을 수 없습니다.',
      };
    }

    const passwordCheckResult = verifyPassword(
      loginInfo.password,
      user.salt,
      user.password
    );

    if (passwordCheckResult) {
      // const { email, nickname, image } = user;
      return { type: 'login', success: true, message: '로그인 되었습니다.' };
    } else {
      return {
        type: 'login',
        success: false,
        message: '비밀 번호가 틀립니다.',
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

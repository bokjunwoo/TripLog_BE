const mongoClient = require('../routes/mongo');

const _client = mongoClient.connect();

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

  // 로컬 회원 가입 모듈(POST)
  localRegister: async (localRegister) => {
    const client = await _client;
    const userdb = client.db('TripLogV2').collection('user');
    const chargedb = client.db('TripLogV2').collection('charge');
    const checkdb = client.db('TripLogV2').collection('checklist');

    const localregisterType = localRegister.type;
    const localregisterData = localRegister.data;

    const duplicatedEmail = await userdb.findOne({
      email: localregisterData.email,
    });

    if (duplicatedEmail) {
      return {
        type: 'signup',
        message: '중복된 이메일이 존재해 실패하였습니다.',
        success: false,
      };
    }

    const duplicatedNickname = await userdb.findOne({
      nickname: localregisterData.nickname,
    });

    if (duplicatedNickname) {
      return {
        type: 'signup',
        message: '중복된 닉네임이 존재해 실패하였습니다.',
        success: false,
      };
    }

    const hash = createHashedPassword(localregisterData.password);

    const registerUser = {
      type: localregisterType,
      email: localregisterData.email,
      nickname: localregisterData.nickname,
      password: hash.hashedPassword,
      salt: hash.salt,
      image: '',
    };

    const result = await userdb.insertOne(registerUser);

    const chargeInsert = await chargedb.insertOne({
      nickname: localregisterData.nickname,
      chargeList: [],
    });

    const checkInsert = await checkdb.insertOne({
      nickname: localregisterData.nickname,
      items: checklist,
    });

    if (
      result.acknowledged &&
      chargeInsert.acknowledged &&
      checkInsert.acknowledged
    ) {
      return {
        type: 'signup',
        message: '회원 가입이 완료되었습니다.',
        success: true,
      };
    } else {
      throw new Error('통신 이상');
    }
  },

  // 카카오 회원 가입 모듈
  kakaoRegister: async (kakaoRegister) => {
    const client = await _client;
    const userdb = client.db('TripLogV2').collection('user');
    const chargedb = client.db('TripLogV2').collection('charge');
    const checkdb = client.db('TripLogV2').collection('checklist');

    const kakaoRegisterType = kakaoRegister.type;
    const kakaoRegisterData = kakaoRegister.data;

    const duplicatedNickname = await userdb.findOne({
      nickname: kakaoRegisterData.nickname,
    });

    if (duplicatedNickname) {
      return {
        type: 'signup',
        success: false,
        message: '중복된 닉네임이 존재해 실패하였습니다.',
      };
    }

    const registerUser = {
      type: kakaoRegisterType,
      id: kakaoRegisterData.id,
      nickname: kakaoRegisterData.nickname,
      image: '',
    };

    const result = await userdb.insertOne(registerUser);

    const chargeInsert = await chargedb.insertOne({
      nickname: kakaoRegisterData.nickname,
      chargeList: [],
    });

    const checkInsert = await checkdb.insertOne({
      nickname: kakaoRegisterData.nickname,
      items: checklist,
    });

    if (
      result.acknowledged &&
      chargeInsert.acknowledged &&
      checkInsert.acknowledged
    ) {
      return {
        type: 'login',
        success: true,
        message: '로그인이 완료되었습니다.',
        nickname: kakaoRegisterData.nickname,
      };
    } else {
      throw new Error('통신 이상');
    }
  },

  // 로그인(POST)
  kakaoLogin: async (kakaoLogin) => {
    const client = await _client;
    const userdb = client.db('TripLogV2').collection('user');
    // 로그인 시 입력한 email 정보가 db 에 있는지 체크
    const user = await userdb.findOne({ id: kakaoLogin.id });

    if (user) {
      return {
        type: 'login',
        success: true,
        message: '카카오 로그인이 성공했습니다.',
        nickname: user.nickname,
      };
    }

    if (!user) {
      return {
        type: 'signup',
        success: true,
        message: '닉네임 정보가 필요합니다.',
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

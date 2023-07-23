const mongoClient = require('../routes/mongo');

const _client = mongoClient.connect();

const crypto = require('crypto');

const checklist = require('../data/checklist');

// 비밀 번호 생성용 함수
const createHashedPassword = (password) => {
  const salt = crypto.randomBytes(64).toString('base64');
  const hashedPassword = crypto
    .pbkdf2Sync(password, salt, 10, 64, 'sha512')
    .toString('base64');
  return { hashedPassword, salt };
  // 해싱할 값, salt, 해시 함수 반복 횟수, 해시 값 길이, 해시 알고리즘
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
    const localregisterEmail = localRegister.email;
    const localregisterPassword = localRegister.password;
    const localregisterNickname = localRegister.nickname;

    const duplicatedEmail = await userdb.findOne({
      email: localregisterEmail,
    });

    if (duplicatedEmail) {
      return {
        type: 'signup',
        message: '중복된 이메일이 존재해 실패하였습니다.',
        success: false,
      };
    }

    const duplicatedNickname = await userdb.findOne({
      nickname: localregisterNickname,
    });

    if (duplicatedNickname) {
      return {
        type: 'signup',
        message: '중복된 닉네임이 존재해 실패하였습니다.',
        success: false,
      };
    }

    const hash = createHashedPassword(localregisterPassword);

    const registerUser = {
      type: localregisterType,
      email: localregisterEmail,
      nickname: localregisterNickname,
      password: hash.hashedPassword,
      salt: hash.salt,
      image: '',
    };

    const result = await userdb.insertOne(registerUser);

    const chargeInsert = await chargedb.insertOne({
      nickname: localregisterNickname,
      chargeList: [],
    });

    const checkInsert = await checkdb.insertOne({
      nickname: localregisterNickname,
      checklist,
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

  // 유저 이미지 업로드(POST)
  updateImage: async (data) => {
    const client = await _client;
    const userdb = client.db('TripLogV2').collection('user');

    const nickname = data.user;
    const image = data.image;

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

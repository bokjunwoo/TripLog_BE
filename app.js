const express = require('express');
const cors = require('cors');
const passport = require('passport');
const session = require('express-session');
const passportConfig = require('./passport/index');

require('dotenv').config();

const app = express();

passportConfig();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

/* passport */
app.use(
  session({
    secret: 'your-secret-key',
    resave: true,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

/* cors */
const corsOptionsDev = {
  origin: 'http://localhost:3000',
  credentials: true,
};

const corsOptionsProd = {
  origin: 'https://triplog.shop',
  credentials: true,
};

if (process.env.NODE_ENV === 'development') {
  app.use(cors(corsOptionsDev));
} else {
  app.use(cors(corsOptionsProd));
}

const PORT = 4000;

/*
// 데이터 저장하기 위해 전송 데이터 제한해제
app.use(express.json({
  limit : "50mb"
}));
app.use(express.urlencoded({
  limit:"50mb",
  extended: false
}));

// api
const apiRouter = require('./routes/apiRouter');
app.use('/api', apiRouter);
*/

app.get('/', (req, res) => {
  res.status(200).send('Hello, world!');
});

/* image 저장 위치 */
app.use('/uploads', express.static('uploads'));

/* routes */
// plan
const planRouter = require('./routes/planRouter');
app.use('/plan', planRouter);

// review
const reviewRouter = require('./routes/reviewRouter');
app.use('/review', reviewRouter);

// charge
const chargeRouter = require('./routes/chargeRouter');
app.use('/charge', chargeRouter);

// checklist
const checklist = require('./routes/checklistRouter');
app.use('/checklist', checklist);

// detail
const detail = require('./routes/detailRouter');
app.use('/detail', detail);

// user
const user = require('./routes/userRouter');
app.use('/user', user);

// like
const like = require('./routes/likeRouter');
app.use('/like', like);

// list
const list = require('./routes/listRouter');
app.use('/list', list);

// mypage
const mypage = require('./routes/mypageRouter');
app.use('/mypage', mypage);

/* 오류발생 */
app.use((err, req, res, next) => {
  console.log(err.stack);
  res.status(err.statusCode || 500);
  res.send(err.message);
});

/* start */
app.listen(PORT, () => {
  console.log(`해당 포트는 ${PORT}에서 작동중 입니다.`);
});

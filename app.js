const express = require('express');

const app = express();

/* dotenv */
require('dotenv').config();

const PORT = 4000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// 이미지 저장 위치
app.use('/uploads', express.static('uploads'));

/*
데이터 저장하기 위해 전송 데이터 제한해제
app.use(express.json({
  limit : "50mb"
}));
app.use(express.urlencoded({
  limit:"50mb",
  extended: false
}));
*/

/* 사용안함
// express-session
const session = require('express-session');

// passport
const passport = require('passport');

app.use(
  session({
    secret: 'triplog',
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 1000 * 60 * 60,
    },
  })
);

// passport session 
app.use(passport.initialize());
app.use(passport.session());
/*

/* cors */
const cors = require('cors');
app.use(cors());

/* img */
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

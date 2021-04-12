const express = require('express');
const path = require('path');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const dotenv = require('dotenv');

const indexRouter = require('./routes');
const userRouter = require('./routes/user');

dotenv.config();
const app = express();
app.set('port', process.env.PORT || 3000);

// app.use(morgan('dev')); // 개발 환경에서는 dev, 운영 환경에서는 combined
app.use((req, res, next) => {
    if (process.env.NODE_ENV === 'production') morgan('combined')(req, res, next);
    else morgan('dev')(req, res, next);
});
app.use('/', express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRET,
    cookie: {
        httpOnly: true,
        secure: false
    },
    name: 'session-cookie'
}));

// app.use((req, res, next) => {
//     console.log('모든 요청에 실행');
//     next();
// });

// app.get('/', (req, res, next) => {
//     console.log('GET / 요청에만 실행');
//     next();
// }, (req, res) => {
//     throw new Error('에러는 처리 미들웨어 입니다.');
// });

// app.use((err, req, res, next) => {
//     console.error(err);
//     res.status(500).send(err.message);
// });

// app.get('/', (req, res) => {
//     //res.send('Hello, Express');
//     res.sendFile( path.join(__dirname, '/views/index.html') );
// });

app.use('/', indexRouter);
app.use('/user', userRouter);

app.use((req, res, next) => {
    const error = new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
    error.status = 404;
    next(error);
})

app.use((err, req, res, next) => {
    res.locals.message = err.message;
    res.locals.error = process.env.NODE_ENV !== 'production' ? err : {};
    res.status(err.status || 500);
    // res.render('error');
});

app.listen(app.get('port'), () => {
    console.log(`${app.get('port')} 번 포트에서 대기중`);
});
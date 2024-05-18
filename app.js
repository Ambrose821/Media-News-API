var dotenv = require('dotenv');

var fs = require('fs')
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var axios = require('axios')

//Routes
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

//Models
const Media = require('./models/Media')


//Load config file
dotenv.config({path: './config/config.env'})

var mongoose = require('mongoose')
var MongoStore = require('connect-mongo')
var connectDB = require('./config/db')
connectDB()


var app = express();

var {source, reddit_funny_videos,get_reddit_videos,get_espn_news } = require('./utils/sourcer')
//Source when server starts

//Only for Task Scheduluer version of the API
async function main(){
  await source();

  process.exit(1)
}


main()



//Source again 24Hours later

//setInterval(source,1000*60*60*24);






// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({mongoUrl: process.env.MONGO_URI})
}));


app.use('/', indexRouter);
app.use('/users', usersRouter);





// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

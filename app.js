var dotenv = require('dotenv');

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');

//Routes
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

//Models
const Media = require('./models/Media')


//Load config file
dotenv.config({path: './config/config.env'})
console.log(process.env.AWSS3_BUCKET_NAME)

var mongoose = require('mongoose')
var MongoStore = require('connect-mongo')
var connectDB = require('./config/db')
connectDB()


var app = express();

//Sourcing capabilities
var {source, reddit_funny_videos,get_reddit_videos,get_espn_news, get_feed_file_test ,ttSource, fullTTSource } = require('./utils/sourcer')
//fullTTSource()
//Source when server starts
//source();
//Source again 24Hours later
setInterval(source,1000*60*60*24);


//Mediaprocess testing
var {photoAddGradientAndText}= require('./utils/mediaProcessor')
//const photoAddGradientAndText = async (imageURL,text, identifier, watermarkType, waterMarkUrlOrText) =>{

photoAddGradientAndText('http://www.yardbarker.com/media/e/1/e157a33aef78f1d2f9d8108d13d5d24d59cac348/thumb_16x9/USATSI_23326796_168404824_lowres-1024x683.jpg',"Horschel shines in rain to lead Open after brutal third round",'1','text','Breaking')

var{downloadTikTokByTag,downloadVideo} = require('./utils/ttScaper');
var{ytdlpDownload,ytdlpDownloadToS3} = require('./utils/ytdlp')



//ytdlpDownloadToS3('https://www.tiktok.com/@_funny.official/video/7339934958099680544','/videos/video.mp4')
//ytdlpDownload('https://www.tiktok.com/@_funny.official/video/7339934958099680544','video.mp4')


var{uploadFilesToS3} = require('./utils/awsDB');


// Corrected path to the `video.mp4` file inside the `funny_videos` folder
const videoFilePath = path.join(__dirname, 'funny_videos', 'video.mp4');
//uploadFilesToS3(videoFilePath)

//downloadVideo('https://img-9gag-fun.9cache.com/photo/aQEwK8e_460sv.mp4','./')


//
get_feed_file_test("https://rss.app/feeds/t69AwBE6btGFUAM1.xml","ttTest2.json")


//ttSource("https://rss.app/feeds/5fdisHCWLdpg5QLf.xml",'funny')

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

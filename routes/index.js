var express = require('express');
var router = express.Router();
var axios = require('axios')
var {top_goo_feed, BBC, get_prlog_feed, get_9gag, get_buzz, get_news_io} = require('../utils/sourcer')



//News IO API without client. 2000 Articles per day
router.get('/newsio', async (req,res,next)=>{
  get_news_io();
  res.render('index',{title: 'NewsIO Collected'})
})

/* GET home page. */
router.get('/goo', function(req, res, next) {

  top_goo_feed()
  res.render('index', { title: 'Express' });

});

router.get('/BBC', function(req,res,next){
  BBC()
  res.render('index', {title: 'BBC News collected'})
})

router.get('/prlog', function(req,res,next){
get_prlog_feed()
  res.render('index', {title: 'Prlog'})
})

router.get('/nine', function(req,res,next){
  get_9gag()
    res.render('index', {title: 'nine'})
  })

  router.get('/buzz', function(req,res,next){
    get_buzz()
    res.render('index', {title: 'buzz'})
    
  })
module.exports = router;

var express = require('express');
var router = express.Router();

var {top_goo_feed, BBC, get_prlog_feed, get_9gag, get_buzz} = require('../utils/sourcer')

/* GET home page. */
router.get('/', function(req, res, next) {

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
    res.render('index', {title: 'Prlog'})
  })

  router.get('/buzz', function(req,res,next){
    get_buzz()
    res.render('index', {title: 'buzz'})
    
  })
module.exports = router;

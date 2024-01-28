var express = require('express');
var router = express.Router();

var {top_goo_feed, BBC} = require('../utils/sourcer')

/* GET home page. */
router.get('/', function(req, res, next) {

  top_goo_feed()
  res.render('index', { title: 'Express' });

});

router.get('/BBC', function(req,res,next){
  BBC()
  res.render('index', {title: 'BBC News collected'})
})
module.exports = router;

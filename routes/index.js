var express = require('express');
var router = express.Router();
var axios = require('axios')
var Medi = require('../models/Media')
var {top_goo_feed, BBC, get_prlog_feed, get_9gag, get_buzz, get_news_io} = require('../utils/sourcer');
const Media = require('../models/Media');
const mongoose = require('mongoose')



//News IO API without client. 2000 Articles per day
router.post('/content_get', async (req,res,next)=>{

  try{
  var {genre ="",quantity} = req.query
  quantity = quantity ? parseInt(quantity) : 10;

    console.log(JSON.stringify(req.body) + "Req body") 
  
  let excludeIds = req.body.excludeIds || [];
  console.log("88888888888888888888888888888 Exclude Ids: \n" +excludeIds +"\n 888888888888888")
  excludeIds = excludeIds.map(id => new mongoose.Types.ObjectId(id));


  let query = {_id: {$nin: excludeIds} };
  if(genre){
    query.genre = genre;
  }

  const media = await Media.find(query).sort({date:-1}).limit(quantity).lean().exec();
  res.status(200).json({media: media, success: true})
  //console.log(media)
}catch(err){
    console.log("Errror at /content_get" + err)
  res.status(500).json({success:false, message: `Error at /content_get: ${err}`})
};


  
})

module.exports = router;

var express = require('express');
var router = express.Router();
var axios = require('axios')
var Medi = require('../models/Media')
var {top_goo_feed, BBC, get_prlog_feed, get_9gag, get_buzz, get_news_io} = require('../utils/sourcer');
const Media = require('../models/Media');



//News IO API without client. 2000 Articles per day
router.get('/content_get', async (req,res,next)=>{

  try{
  var {genre ="",quantity} = req.query
  quantity = quantity ? parseInt(quantity) : 10;
  
  let excludeIds = req.body.excludeIds || [];

  excludeIds = excludeIds.map(id => mongoose.Types.ObjectId(id));


  let query = {_id: {$nin: excludeIds} };
  if(genre){
    query.genre = genre;
  }

  const media = await Media.find(query).sort({date:-1}).limit(quantity).lean().exec();
  res.status(200).json({media: media, success: true})
  console.log(media)
}catch(err){
  res.status(500)({success:false, message: `Error at /content_get: ${err}`})
};


  
})

module.exports = router;


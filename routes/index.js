var express = require('express');
var router = express.Router();
var axios = require('axios')
var Medi = require('../models/Media')
var {top_goo_feed, BBC, get_prlog_feed, get_9gag, get_buzz, get_news_io} = require('../utils/sourcer');
const Media = require('../models/Media');



//News IO API without client. 2000 Articles per day
router.get('/content_get', async (req,res,next)=>{
  var {genre ="",quantity} = req.query
  if(!quantity){
    console.log('none default = 10')
    quantity=10;
  }
  var  media;
  if (!genre){
    media = await Media.find({}).sort({date: -1}).limit(quantity).lean().exec()
    console.log("no genre")
    
  }
  else{
     media = await Media.find({genre: genre}).sort({date: -1}).limit(quantity).lean().exec()
  }
  console.log(media)
  res.status(200).json({media:media})


  /*
  How to access this endpoint in JAVASCRIPT
  // Example JavaScript to request media documents
const baseUrl = "http://yourapi.com/content_get"; // Replace with your actual API URL

// Parameters
const genre = "action"; // Example genre
const quantity = 5; // Example quantity

// Constructing the URL with query parameters
const url = `${baseUrl}?genre=${encodeURIComponent(genre)}&quantity=${encodeURIComponent(quantity)}`;

// Making the GET request
fetch(url)
    .then(response => response.json())
    .then(data => {
        console.log("Media documents:", data.media);
    })
    .catch(error => {
        console.error("Error fetching media documents:", error);
    });


    PYTHON
    import requests

# Example Python to request media documents
base_url = "http://yourapi.com/content_get" # Replace with your actual API URL

# Parameters
params = {
    "genre": "action", # Example genre
    "quantity": 5 # Example quantity
}

# Making the GET request
response = requests.get(base_url, params=params)

if response.status_code == 200:
    data = response.json()
    print("Media documents:", data['media'])
else:
    print("Error fetching media documents:", response.status_code)
    
    ********EXAMPLE Route would look like : /content_get?genre=action&quantity=5**********

  */
  
})

module.exports = router;



/*
Free to use RSS Feeds
Google News RSS - instructions, requires attribution
BBC News RSS - instructions, requires attribution



Google feeds
There are multiple categories of google rss feeds. This will help with genre and diversification
https://www.aakashweb.com/articles/google-news-rss-feed-url/

Top stories: https://news.google.com/rss

another https://www.prlog.org/news/rss.xml
***For PRLOG https://www.prlog.org/free-news-feeds.html USE this for other types of feeds in the future**

9gag rss options 
https://9gagrss.xyz/

Possible 9gag rss https://9gagrss.com/feed/
*/

var express = require('express');
var fs = require("fs");
const { stringify } = require("querystring");

const RssParser = require('rss-parser')
const axios = require('axios')
const parser = new RssParser();
const Media = require('../models/Media');
//const { get } = require('../app');

function parseMediaLinks(htmlString) {
    const videoPattern = /<video.*poster="([^"]+)".*><source src="([^"]+)" type="video\/mp4"><\/video>/;
    const imagePattern = /<img src="([^"]+)"/;

    // Check for video pattern first
    if (htmlString.trim().startsWith('<video')) {
        const match = htmlString.match(videoPattern);
        if (match) {
            // Return an array with poster image and video link
            return [match[1], match[2]];
        }
    } else if (htmlString.trim().startsWith('<img')) {
        const match = htmlString.match(imagePattern);
        if (match) {
            // Return an array with just the image link
            return [match[1]];
        }
    }

    // Return an empty array if no patterns matched
    return [];
}

//NewsIO endpoint use
const get_news_io = async (req,res,next) =>{
    try{
    const response = await axios.get(`https://newsdata.io/api/1/news?apikey=${process.env.NEWS_IO_API_Key}&language=en&category=politics`)
    //console.log(response.data.results)
    //console.log(response.data.results.length);
    const articles = response.data.results;
    for(let i =0; i < articles.length; i++ ){
        source_string = articles[i].source
        let article = new Media({
            title: articles[i].title,
            snippet: articles[i].description,
            URL: articles[i].link,
            img_url: articles[i].image_url,
            genre: "news",
            date: articles[i].pubDate,
            source: articles[i].source_url + articles[i].creator
        })
        await article.save()
    }
   /* feedString = JSON.stringify(response.data,null,2)
    fs.appendFile('news_io.json',feedString, function(err){
        if(err) throw err;
        console.log("Feed written to file " + "news_io.json")
    })*/}catch(err){
       // console.log("NewsI0:" +err)
    }
    
}

//9gag db parse to db
const nine_parse_db = async(feed)=>{
    try {
        const content = feed
        console.log(content.length)
        
        for(var i=0; i< content.length; i++){
           // console.log("Iteration: " +i)
            let stuff = content[i];
            let media_arr = parseMediaLinks(stuff.content);
            if(media_arr.length>1){
               var video = media_arr[1];
               var image= media_arr[0];

            }else if(media_arr.length ===1){
                var image = media_arr[0]
               var  video =null
            }else{
                var video = null
               var image= null
            }
            
            const media = new Media({
                title: stuff.title,
                URL: stuff.link,
                date: stuff.isoDate,
                img_url: image,
                video_url: video,
                source: stuff.guid,
                genre: "culture"

            })
            await media.save();
            continue;
        }
        return

    }catch(err){
        console.log("9parse error " + err)
    }

}
//Base method for collecting feed from any given url. C
const get_feed = async(urlString,filename = "default.json") =>{
    try{
        const feed = await parser.parseURL(urlString)
       
       /* feedString = JSON.stringify(feed,null,2)
        fs.appendFile(filename,feedString, function(err){
            if(err) throw err;
         //   console.log("Feed written to file " + filename)
        })
        return feed.items
        console.log(feed.title)
  
        console.log(feed.items[0].title)
  
        console.log(feed.items.length)*/
        return feed.items;
    }catch(err){
        console.log("Error at Base get_feed: " + err)
    }
}

const news_rss_dbParse = async(feed) => {
    const content = feed;
    for(var i=0; i< content.length; i++){
        // console.log("Iteration: " +i)
         let stuff = content[i];
       

         const media = new Media({
             title: stuff.title,
             URL: stuff.link,
             snippet:stuff.contentSnippet,
             date: stuff.isoDate,
             source: stuff.link,
             genre: "news"

         })
         await media.save();
         continue;
     }
     return
    
}
const top_goo_feed = () =>{
    const feed = get_feed('https://news.google.com/rss', 'top_goo_feed.json')
    news_rss_dbParse(feed)
    
  
}
const BBC = async() =>{
    const feed = get_feed('https://feeds.bbci.co.uk/news/rss.xml?edition=us', 'top_BBC.json')
    news_rss_dbParse(feed)
}

const get_prlog_feed = async () =>{
    const feed = get_feed("https://www.prlog.org/news/rss.xml", 'prlog.json') 
    news_rss_dbParse(feed)
}


const get_9gag = async () =>{
    const feed = await get_feed("https://9gagrss.com/feed/",
    '9gag.json')
    
    nine_parse_db(feed);
}
// May need to use this to grab news photos if the rss
const get_photo_url = async () =>{

}

//Buzz Feed main feed
const get_buzz= async () =>{
    const feed = get_feed("https://www.buzzfeed.com/ca/index.xml",
    'buzz.json')
    
}
// May need to use this to grab news photos if the rss
/*
const get_photo_url = async () =>{

}
*/

const parse_NewsIo = async (feed)=>{

    console.log("onesec")

}
const source = async()=>{
    try{
        const today = new Date()
    get_news_io();
    top_goo_feed();
    BBC();
    get_prlog_feed();
    get_9gag(); 
    console.log("Sourced at " + today.toDateString())
    }catch(err){
        console.log("Not Sourcing properly due to: " +err)

    }

}


module.exports = {top_goo_feed, BBC, get_prlog_feed, get_9gag,get_buzz, get_news_io,source}

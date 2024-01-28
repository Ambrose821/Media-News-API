
/*
Free to use RSS Feeds
Google News RSS - instructions, requires attribution
BBC News RSS - instructions, requires attribution



Google feeds
There are multiple categories of google rss feeds. This will help with genre and diversification
https://www.aakashweb.com/articles/google-news-rss-feed-url/

Top stories: https://news.google.com/rss
*/
var fs = require("fs");
const { stringify } = require("querystring");

const RssParser = require('rss-parser')

const parser = new RssParser();

//Base method for collecting feed from any given url. C
const get_feed = async(urlString,filename = "default.json") =>{
    try{
        const feed = await parser.parseURL(urlString)
        feedString = JSON.stringify(feed,null,2)
        fs.appendFile(filename,feedString, function(err){
            if(err) throw err;
            console.log("Feed written to file " + filename)
        })
        return feed
        console.log(feed.title)
  
        console.log(feed.items[0].title)
  
        console.log(feed.items.length)

    }catch(err){
        console.log("Error at Base get_feed: " + err)
    }
}

const top_goo_feed = () =>{
    const feed = get_feed('https://news.google.com/rss', 'top_goo_feed.json')
  
}
const BBC = async() =>{
    const feed = get_feed('https://feeds.bbci.co.uk/news/rss.xml?edition=us', 'top_BBC.json')
}
module.exports = {top_goo_feed, BBC}
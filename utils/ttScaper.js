const TikTokScraper = require('tiktok-scraper')
const fs = require ('fs');
const axios = require('axios')
const path = require('path')

const downloadVideo = async (url, downloadPath) =>{
    console.log("starting download")
    const writer = fs.createWriteStream(downloadPath);

    const response = await axios({
        url,
        method: 'GET',
        responseType: 'stream'    })

    response.data.pipe(writer);

    return  new Promise((resolve,reject) =>{
        writer.on('finish',resolve);
        writer.on('error',reject)
    })

}


const downloadTikTokByTag = async (hashTag,quantity = "5") =>{


    try{
        const posts = await TikTokScraper.hashtag(hashTag,{number:quantity});
        console.log(posts)
        const dir = `./${hashTag}_videos`;
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }

         // Download each video
         for (let i = 0; i < posts.collector.length; i++) {
            try{
            const post = posts.collector[i];
            const videoUrl = post.videoUrl;
            const filePath = path.join(dir, `video_${i + 1}.mp4`);
            await downloadVideo(videoUrl, filePath);
            console.log(`Downloaded: ${filePath}`);
            }catch(err){
                console.error("error in tik tok download loop: " + err)
            }
        }
        console.log('All videos downloaded successfully!');
    }
    catch(error){
        console.error(`Error downloading TikTok videos on ${Date.now()}: `,error)
    }
}

module.exports = {downloadTikTokByTag, downloadVideo};
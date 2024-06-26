const ytdlp = require('node-ytdlp')
const { exec } = require('child_process');


const ytdlpPath = path.resolve(__dirname, 'yt-dlp');

const ytdlpDownload = async (url, output) => {
  return new Promise((resolve, reject) => {
    exec(`${ytdlpPath} -o ${output} -f best ${url}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`YTDLP Error: ${stderr}`);
        return reject(error);
      }
      console.log(`Download completed: ${stdout}`);
      resolve();
    });
  });
};


module.exports= {ytdlpDownload}
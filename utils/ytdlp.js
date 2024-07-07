const { exec } = require('child_process');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { spawn } = require('child_process');
const { PassThrough } = require('stream');
const { pipeline } = require('stream');
const { promisify } = require('util');
const { Upload } = require('@aws-sdk/lib-storage');

const s3 = new S3Client({
  region:process.env.AWS_REGION,
  credentials:{
      secretAccessKey: process.env.AWSS3_SECRET,
      accessKeyId : process.env.AWSS3_ACCESS,
      
  }
})

const bucketName = process.env.AWSS3_BUCKET_NAME;


const ytdlpDownloadToS3 = async (url, key) => {
  return new Promise((resolve, reject) => {
    const ytdlp = spawn('yt-dlp', ['-o', '-', url]);

    const passThrough = new PassThrough();

    // Create an Upload instance with the readable stream
    const upload = new Upload({
      client: s3,
      params: {
        Bucket: bucketName,
        Key: key,
        Body: passThrough,
       // ACL: 'public-read',
        ContentType: 'video/mp4',
      },
    });

    upload.done().then(() => {
      console.log(`File uploaded successfully. URL: https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`);
      resolve();
    }).catch((err) => {
      console.error('S3 upload failed.', err);
      reject(err);
    });

    pipeline(ytdlp.stdout, passThrough, (err) => {
      if (err) {
        console.error('Pipeline failed.', err);
        reject(err);
      }
    });

    ytdlp.stderr.on('data', (data) => {
      console.error(`YTDLP Error: ${data}`);
    });

    ytdlp.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`yt-dlp exited with code ${code}`));
      }
    });
  });
};

const ytdlpDownload = async (url, output) => {
  return new Promise((resolve, reject) => {
    exec(`yt-dlp -o ${output} -f best ${url}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`YTDLP Error: ${stderr}`);
        return reject(error);
      }
      console.log(`Download completed: ${stdout}`);
      resolve();
    });
  });
};

module.exports = { ytdlpDownload,ytdlpDownloadToS3 };

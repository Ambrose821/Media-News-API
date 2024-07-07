const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { Readable } = require('stream');
const path = require('path')
const fs = require('fs')

const s3 = new S3Client({
    region:process.env.AWS_REGION,
    credentials:{
        secretAccessKey: process.env.AWSS3_SECRET,
        accessKeyId : process.env.AWSS3_ACCESS,
        
    }
})

const bucketName = process.env.AWSS3_BUCKET_NAME


const uploadFilesToS3 = async(filePath) =>{
    try{
        const fileContent = fs.readFileSync(filePath)
        const fileName = path.basename(filePath);
        const fileMimeType = 'video/mp4'

        const params = {
            Bucket: bucketName,
            Key: fileName,
            Body: fileContent,
            //ACL: 'public-read', //Access control list
            ContentType: fileMimeType,
        }

        const command = new PutObjectCommand(params);
        const data = await s3.send(command)

        const url = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
        console.log(`File uploaded successfully. URL: ${url}`);
        return url;
    

    }catch(err){
        console.error("Error uploading file to S3: " +err)
    }
}

module.exports = {uploadFilesToS3};
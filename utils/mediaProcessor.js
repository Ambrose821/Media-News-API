


const Media = require('../models/Media')
const axios = require('axios')
const fs = require('fs');
const { Readable, PassThrough,pipeline } = require('stream');
const Jimp = require('jimp');

const ffmpeg = require('fluent-ffmpeg')
var videoshow = require('videoshow')

var {uploadReadableBufferToS3} = require('./awsDB')

const pLimit = require('p-limit')


const photoAddGradientAndText = async (imageURL,text, identifier, watermarkType, waterMarkUrlOrText) =>{
    try{
    const image = await Jimp.read(imageURL);

    await image.scale(0.75);
    await image.resize(1080,1080)
//image.mirror(true,false)
    const height = image.bitmap.height;
    const width = image.bitmap.width;


    //Semi Transparent lower black section
    const gradient = new Jimp(width, height/3 + 100,'#000000',(err, gradient) =>{
        if(err){
            console.log("Error Creating gradient in photoAddGradientAndText(): " + err)
        }

      
    })
    gradient.opacity(0.775)


    await image.composite(gradient,0, height *2/3)

    //Text Custom 
    const font_path = 'fonts/customFont.fnt'

    const font = await Jimp.loadFont(font_path);

    await image.print(font,10,height * 2/3 + 150,{text:text,  alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER ,
        alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE}, width-20 )


    //Water Mark
    var watermark;
    var watermarkExtraMargin = 0;
    if(watermarkType != "url"){
        const small_font_path = 'fonts/smallChunk.fnt';
    
        watermarkExtraMargin = 20

         watermark = new Jimp(200, 50, 0xFFFFFFFF);    
         const watermarkFont =  await Jimp.loadFont(small_font_path)


         const textWidth = Jimp.measureText(watermarkFont, waterMarkUrlOrText);
         const textHeight = Jimp.measureTextHeight(watermarkFont, waterMarkUrlOrText,200)

         let x = (watermark.bitmap.width-textWidth)/2
         let y = (watermark.bitmap.height - textHeight)/2
         watermark.print(watermarkFont,x,y,waterMarkUrlOrText)
        
    
    }
    else{
    watermark = await Jimp.read(waterMarkUrlOrText);

    
    watermark = await watermark.resize(100,100)
    watermark.circle()
    }
    await image.composite(watermark,(width - watermark.bitmap.width)/2,height *2/3+10 +watermarkExtraMargin,{
    
        mode: Jimp.BLEND_SOURCE_OVER,
        opacityDest:1,
        opacitySource:0.85
    })


    const dividerHeight = 3;
    const divider = new Jimp(width-50, dividerHeight, '#FFFFFF');
    await image.composite(divider, (width- divider.bitmap.width)/2, height * 2 / 3 + 130,{opacityDest:1, opacitySource:0.5});

   

  
    await image.writeAsync('output.png')
    const imageBuffer = await image.getBufferAsync(Jimp.MIME_PNG)
    console.log("Done Jimp image processing")

    

    //console.log('newpath' + newpath)
    
    return imageBuffer;

    }catch(err){
        console.error("Error in photoAddGradientAndText(): " + err + "\n returning null")
    }
}

const bufferToStream = (imageOrVidBuffer) =>{
    const readable = new Readable();

    readable._read = () => {}; //Readable objects need to have the _read method defined. We wont use it.
    
    readable.push(imageOrVidBuffer); // Add the image or buffer to a stream
   readable.push(null)//dictates that the stream is finished similar to EOF for file IO.

    return readable; //
}
const photoToVideo = async (imageBuffer, addCCMusicBool,identifier) =>{
    
    /* ***************************   */
    // TODO                        //
    // - CODE FOR AUDIO HANDLEING AUDIO Bool  //
    //                           //
   const imageStream = bufferToStream(imageBuffer)
   const videoOutputPath = `temp_pic2vid_${identifier}.mp4`;

   return new Promise(async(resolve,reject) =>{
    const command = new ffmpeg()

    command
    .input(imageStream)
    .inputFormat('image2pipe')
    
    .inputOptions('-framerate 1/' + 10)
    .output(videoOutputPath)
    .outputOptions('-pix_fmt yuv420p')
   

    if(addCCMusicBool){
        console.log("Audio True")
        var musicArr;
        var audioOptions; 
        
        
       audioOptions =
         fs.readdirSync('royaltyFreeMusic/');


     
        //console.log(typeof audioOptions)
        const audioTrackIndex = Math.floor(Math.random()* audioOptions.length)
       // console.log(audioOptions[audioTrackIndex])
        command.input(`royaltyFreeMusic/${audioOptions[audioTrackIndex]}`).outputOptions('-shortest')
    }
    
    command.on('start',(command) =>{
        console.log('FFMPEG started photo to video: ' +command)
    })
    .on('end', async () =>{
        console.log(`ffmpeg photo To video finished for output_${identifier}.mp4`)
        const videoBuffer = await fs.promises.readFile(videoOutputPath);
    
        
        resolve(videoBuffer)
        await fs.promises.unlink(videoOutputPath)
    })
    .on('error',(err)=>{
        console.error("Photo To Video Error:" + err)
        reject(err)

    })
    .run()})
    

//     const videoBuffer = await fs.promises.readFile(videoOutputPath)
//    // await fs.promises.unlink(videoOutputPath);
//      return videoBuffer
};


const photoToVideoPostToS3 = async (imageURL,text, identifier, watermarkType, waterMarkUrlOrText,audioBool) =>{
    const imageBuffer = await photoAddGradientAndText(imageURL,text,identifier,watermarkType,waterMarkUrlOrText);
    const videoBuffer = await photoToVideo(imageBuffer,audioBool,identifier)
    const readableBuffer = await bufferToStream(videoBuffer) 
   const uploadS3Url = await uploadReadableBufferToS3(readableBuffer,identifier,'video/mp4')
    return uploadS3Url;


}

//TODO. FFMPEG SCALING FOR BACKGROUND IS CURRENTLY HARDCODED TO 1080X1920. WILL NEED THIS TO BE VARIABLE BASED WHENEVER WE ADD
//CUSTOM BACKGROUND DIMENSIONS
const videoToVideoPost = async(videoURL, text, identifier, watemarkType, waterMarkUrlOrText) =>{

   //TODO Add if(videoURL.includes('http') in order to account for if a user version of this program allows file upload)
    const background = new Jimp(1080,1920,0x000000FF)
    const bgHeight = background.bitmap.height;
    const bgWidth = background.bitmap.width;


    const font = await Jimp.loadFont('fonts/customFont.fnt');

    const textWidth = Jimp.measureText(font,text);

    const textX = (bgWidth - textWidth)/2;
    const textY = bgHeight *1/5
    
    await background.print(font,10 ,textY,{text:text, alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,alignmentY:Jimp.VERTICAL_ALIGN_MIDDLE},bgWidth-20)


    let watermark;

    if(watemarkType != 'url'){
        const small_font_path = 'fonts/smallChunk.fnt';
    
        watermarkExtraMargin = 20

         watermark = new Jimp(200, 50, 0xFFFFFFFF);    
         const watermarkFont =  await Jimp.loadFont(small_font_path)


         const textWidth = Jimp.measureText(watermarkFont, waterMarkUrlOrText);
         const textHeight = Jimp.measureTextHeight(watermarkFont, waterMarkUrlOrText,200)

         let x = (watermark.bitmap.width-textWidth)/2
         let y = (watermark.bitmap.height - textHeight)/2
         watermark.print(watermarkFont,x,y,waterMarkUrlOrText)

    }
    else{
        watermark = await Jimp.read(waterMarkUrlOrText);

    
        watermark = await watermark.resize(200,200)
        watermark.circle()
        

    }
    await background.composite(watermark,bgWidth *1/12,bgHeight*1/16,{
    
        mode: Jimp.BLEND_SOURCE_OVER,
        opacityDest:1,
        opacitySource:0.85
    })

    const tempImageFile = `tempfile_${identifier}.png`
    const backgroundImage = await background.writeAsync(tempImageFile);
//     const backgroundBuffer =  await background.getBufferAsync(Jimp.MIME_PNG)
//    const backgroundStream = bufferToStream(backgroundBuffer)
   
  
    const videoBuffer = new PassThrough()

    const response = await axios({
        url: videoURL,
        method: 'GET',
        responseType: 'stream'    })
    response.data.pipe(videoBuffer);

    const outputPath =`outVid_${identifier}.mp4`

    //Overlay Video On background
   const newVideoBuffer =  await overlayVidBufferOnPhoto(videoBuffer,tempImageFile,outputPath)
   console.log('done overlay')
   const readableBuffer = bufferToStream(newVideoBuffer) 
   const uploadS3Url = await uploadReadableBufferToS3(readableBuffer,identifier,'video/mp4')
    return uploadS3Url;




   
}

// const backgroundPhotoToVidStream = (photoBuffer) =>{
//     const photoBufferStream = bufferToStream(photoBuffer);

//     return new Promise((resolve, reject) => {
//         const outputStream = new PassThrough();
//         const ffmpegProcess = ffmpeg(photoBufferStream)
//           .inputFormat('image2pipe')
//           .loop(1)
//           .duration(5)
//           .outputOptions('-pix_fmt yuv420p')
//           .format('mp4') // Correctly format the output as mp4
//           .on('error', (err) => {
//             console.error('Error in backgroundPhotoToVidStream(): ' + err);
//             reject(err);
//           })
//           .on('end', () => {
//             console.log('Background image converted to video Buffer');
//             resolve(outputStream);
//           });
    
//         ffmpegProcess.pipe(outputStream, { end: true });
//       });
// }




const overlayVidBufferOnPhoto = (videoBuffer,tempImageFile,outputPath) =>{
    return new Promise(async (resolve,reject) =>{
     
        ffmpeg()
        .input(videoBuffer)//this is
        .inputFormat('mp4')
        .input(tempImageFile)
       
        
        .complexFilter([
            '[1:v]scale=1080:1920,setsar=1[bg]', // Scale background and set SAR
            '[0:v]scale=920:-1,setsar=1[v0]', // Scale main video while preserving aspect ratio
            '[bg][v0]overlay=(main_w-overlay_w)/2 :(main_h-overlay_h)/2+100[v1]' // Overlay the video on the background
           
        ])
        .map('[v1]')
        .outputOptions('-pix_fmt yuv420p')
        .output(outputPath)
        .on('end',async()=>{
            console.log('Video with background created successfully: '+outputPath)
            await fs.promises.unlink(tempImageFile)
            console.log('temporary image background file deleted '+ tempImageFile)
            const outputBuffer = await fs.promises.readFile(outputPath);
         
            resolve(outputBuffer)
            await fs.promises.unlink(outputPath)
            
        })
        .on('error',(err)=>{
            console.error("Error in videoToVideoPost() ffmpeg: "+err )
            reject()
        })
     
       .run()
       

        // const buffers = []; //will contain all chunks from a stream
        // bufferStream.on('data', (buf) =>{
        //     buffers.push(buf)
        // })
        // .on('end',()=>{
        //     const outputBuffer = Buffer.concat(buffers)//merge all the chunks
        //     resolve(outputBuffer)
        // })
    
    
    
    })
}


const downloadFile = async (url, downloadPath) =>{
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


module.exports = {photoAddGradientAndText,photoToVideoPostToS3,videoToVideoPost,downloadFile}

//https://www.nyasatimes.com/wp-content/uploads//436799839_1027172572102940_8958354155021222021_n.jpg
//https://media-api.twic.picsy

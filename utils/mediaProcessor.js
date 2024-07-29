

const Media = require('../models/Media')
const axios = require('axios')
const fs = require('fs');
const ImageKit = require('imagekit')

const Jimp = require('jimp');

const ffmpeg = require('fluent-ffmpeg')
var videoshow = require('videoshow')
var {Readable} = require ('stream');
var {uploadReadableBufferToS3} = require('./awsDB')
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

    const newpath = await photoToVideo(imageBuffer,true,'1')

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


module.exports = {photoAddGradientAndText,photoToVideoPostToS3}

//https://www.nyasatimes.com/wp-content/uploads//436799839_1027172572102940_8958354155021222021_n.jpg
//https://media-api.twic.picsy

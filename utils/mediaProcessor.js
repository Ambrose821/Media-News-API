

const Media = require('../models/Media')
const axios = require('axios')
const fs = require('fs');
const ImageKit = require('imagekit')

const Jimp = require('jimp');

const ffmpeg = require('fluent-ffmpeg')
var videoshow = require('videoshow')

const photoAddGradientAndText = async (imageURL,text, waterMarkUrl) =>{
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

    let watermark = await Jimp.read(waterMarkUrl);

    
    watermark = await watermark.resize(100,100)
    watermark.circle()

    await image.composite(watermark,(width - watermark.bitmap.width)/2,height *2/3+10,{
    
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

    
    return imageBuffer;

    }catch(err){
        console.error("Error in photoAddGradientAndText(): " + err + "\n returning null")
    }
}

const photoToVideo = async (imageBuffer, addCCMusicBool) =>{


};



module.exports = {photoAddGradientAndText}

//https://www.nyasatimes.com/wp-content/uploads//436799839_1027172572102940_8958354155021222021_n.jpg
//https://media-api.twic.pics
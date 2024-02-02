const mongoose = require('mongoose');

const MediaSchema = new mongoose.Schema({
        title: {
            type: String,
            required: true
        },
        snippet:{
            type: String,
            required: false
        },
        URL:{
            type:String,
            required: true
        },
        img_url:{
            type: String,
            required: false
        },
        video_url:{
            type: String,
            required: false
        },
        genre: {
            type: String,
            default: 'general',
            enum:['news','memes','culture','tech','finance','sports'],
            required: true
        },
        source:{
           type: String,
           default:"Source below",
           required: true
        },
        date:{
            type:Date,
            default: Date.now
        }
        
})

module.exports = mongoose.model('Media',MediaSchema);
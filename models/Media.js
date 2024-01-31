const mongoose = require('mongoose');

const MediaSchema = new mongoose.Schema({
        title: {
            type: String,
            required: true
        },
        snippet:{
            type: String,
            required: true
        },
        URL:{
            type:String,
            required: true
        },
        media_link:{
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
           required: true
        },
        date:{
            type:Date,
            default: Date.now
        }
        
})

module.exports = mongoose.model('Media',MediaSchema);
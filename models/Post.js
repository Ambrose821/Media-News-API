const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
    caption: {
        type: String,
        required: true,
        unique: true
    },

    media_type: {
        type: String,
        default: null,
        enum: ['photo','video']
    },
    media_url:{
        type: String,
        default:null
    },
    date_created: {
        type: Date,
        default: Date.now
    },
    genre:{
        type: String,
        enum: ['news','politics','usa','celebrity', 'sports','cool','funny','scitech','fitness','crypto']
    }

})
module.exports= mongoose.model('Post',PostSchema)
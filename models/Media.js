const mongoose = require('mongoose');

const MediaSchema = new mongoose.Schema({
        title: {
            type: String,
            required: true,
            unique : true
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
            default:null
        },
        video_url:{
            type: String,
            default: null
        },
        genre: {
            type: String,
            default: 'general',                                                                           //'funny' is currently tiktok                                 // science is currently tik tok
            enum:['news','memes','culture','tech','finance','sportsBigCompany','sportsIO','cringe','ufc','funny','gambling','fitness','cooking','pga','mlb','nfl','nba','science'/* science is currently tik tok only*/,'trynottolaugh','travel','crypto'], //Temporary, soon genre will have its own model with sub genres
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
        },
        sourced_at:{
            type:Date,
            default: Date.now
        },
        source_name:{
            type: String,
            default: null
        },
        is_short_form_processed: {
            type: Boolean,
            default: false
        },
        credit_to:{
            type: String,
            default: null
        }
        
        
})

module.exports = mongoose.model('Media',MediaSchema);
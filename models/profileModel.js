
const mongoose = require('mongoose')

const profileSchema = mongoose.Schema({
    status:{
        type: String
    },
    location:{
        type: String
    },
    birthDate: {
        type: Date
    },
    following:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    followers:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ], 
    pinnedTweet:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post"
    },
    website:{
        type: String
    }
})

const profileModel = mongoose.model('Profile', profileSchema)
module.exports = profileModel
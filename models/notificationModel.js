const mongoose = require('mongoose')

const notificationSchema = mongoose.Schema({
    message:{
        type: String,
        enum: ["like", "comment", "retweet", 'follow', 'mention' ],
        required: [true]
    },
    post:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: [true]
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true]
    }
}, {
    timestamps: true
})

const NotificationModel = mongoose.model( 'Notification', notificationSchema)

module.exports = NotificationModel
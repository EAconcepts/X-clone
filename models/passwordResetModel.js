
const mongoose = require('mongoose')

const passwordResetSchema = mongoose.Schema({
    uniqueString:{
        type: String,
        unique: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
    }, 
    createdAt:{
        type: Date,
    },
    expiresAt:{
        type: Date,
    }
}, {timestamp: true})

const passwordResetModel = mongoose.model('PasswordReset', passwordResetSchema)

module.exports = passwordResetModel
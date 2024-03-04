const asyncHandler = require('express-async-handler')
const User = require('../models/userModel')

const uploadAvatar = asyncHandler(async(req, res)=>{
    const {avatar} = req.body
    User.findByIdAndUpdate(req.user._id, {avatar}, {new: true})
    .then((result)=>{
        console.log(result)
        res.status(201).json({message: 'Profile Image updated successfully!', data:result})
    })
    .catch((error)=>{
        console.log(error)
        res.status(400).json({message:'An error occured while updating profile image'})
    })
})

module.exports ={uploadAvatar}
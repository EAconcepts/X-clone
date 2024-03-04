const asyncHandler = require('express-async-handler')
const User = require('../models/userModel')

const uploadAvatar = asyncHandler(async(req, res)=>{
    const {avatar} = req.body
    console.log(avatar)
    if(!avatar)res.status(400).json({message: 'Avatar field is required'})
    else{
    User.findByIdAndUpdate(req.user._id, {avatar}, {new: true}, {password: 0})
    .then((result)=>{
        console.log(result)
        res.status(201).json({message: 'Profile Image updated successfully!', data:result})
    })
    .catch((error)=>{
        console.log(error)
        res.status(400).json({message:'An error occured while updating profile image'})
    })}
})


const getAvatar = asyncHandler(async(req, res)=>{
    User.findById(req.user._id)
    .then((result)=>{
        console.log(result)
        res.status(200).json({status: 'Success', data:result.avatar})
    })
    .catch((error)=>{
        console.log(error)
        res.status(400).json({
            message: error
        })
    })
})
module.exports ={uploadAvatar, getAvatar}
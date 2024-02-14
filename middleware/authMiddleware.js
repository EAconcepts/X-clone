const jwt = require('jsonwebtoken')
const User = require('../models/userModel')
const asyncHandler = require('express-async-handler')

const protect = asyncHandler(async(req, res, next)=>{
    let token
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        try{
        // get token 
        token = req.headers.authorization.split(' ')[1]

        // verify token 
        let decoded = jwt.verify(token, process.env.JWT_SECRET)

        // get user from token
        req.user = await User.findById(decoded.id).select('-password')
        next()
        }
        catch(error){
            res.status(400)
            throw new Error('Not authorized')
        }
    }
    if(!token){
        res.status(400)
        throw new Error('No token, not authorized')
    }
})

module.exports = {protect}
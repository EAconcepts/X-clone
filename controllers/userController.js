const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken')
 
// Register User
// /api/auth/signup
// Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, username, password } = req.body;
  if (!name || !email || !username || !password) {
    return res.status(400).json("Please fill all fields");
  }
  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ message: "User with email already exist!" });
  }
  const usernameExists = await User.findOne({username})
  if(usernameExists){
    return res.status(401).json({message: "User with username already exist. Please try a different username."})
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const user = await User.create({
    name,
    email,
    username,
    password: hashedPassword,
  });
  if (user) {
    res.status(201).json({
      message: "Signup successful!",
      data: user,
    });
  }
});

// Login User
// /api/auth/signin
// Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if ((!email, !password)) {
    res.status(400).json({message: 'Please fill all fields'})
  }
  const user = await User.findOne({ email });
  
  if (user && (await bcrypt.compare(password, user.password))) {
    res.status(200).json({ message: "success", data: user, token: generateToken(user.id) });
  }else{
    res.status(400).json({message: 'Invalid credentials'})
  }
});

// Get all users
// /api/auth/users
//public
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('-password');
  if (users) {
    res.status(200).json({
      message: "success",
      data: users,
    });
  } else {
    res.status(400).json("Something happened");
  }
});

// Get a users
// /api/auth/user
//public
const getUser = asyncHandler(async (req, res) => {
  // console.log(req.user.id)
  const user = await User.findOne( {_id: req.user.id}).select('-password');
  if (user) {
    res.status(200).json({
      message: "success",
      data: user,
    });
  } else {
    res.status(400).json("Unable to fetch user");
  }
});

// Get a users
// /api/auth/user
//public
const getUsers = asyncHandler(async (req, res) => {
  // console.log(req.user.id)
  const user = await User.findOne( {_id: req.params.id}).select('-password');
  if (user) {
    res.status(200).json({
      message: "success",
      data: user,
    });
  } else {
    res.status(400).json("User does not exist");
  }
});
module.exports = { registerUser, loginUser, getAllUsers, getUser, getUsers };

const generateToken=(id)=>{
  return jwt.sign({id}, process.env.JWT_SECRET, {expiresIn: '30d'})
}
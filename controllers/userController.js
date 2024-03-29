const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const UserVerification = require("../models/verificationModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const { v4: uuid, v4 } = require("uuid");
const PasswordReset = require("../models/passwordResetModel");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.AUTH_EMAIL,
    pass: process.env.AUTH_PASSWORD,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.log(error);
  } else {
    console.log("ready for message");
    console.log(success);
  }
});

// Email verification fn
const verifyUser = asyncHandler(async (req, res) => {
  const { userId, uniqueString } = req.params;
  // check if user exists
  const userExists = await User.findById(userId);
  if (userExists) {
    // check if user is already verified
    const alreadyVerified = await User.findOne({
      _id: userId,
      isVerified: true,
    });
    if (alreadyVerified) {
      res.status(200).json({
        message: `User already verified! Please login to continue `,
      });
    } else {
      UserVerification.findOne({ userId })
        .then((result) => {
          // console.log('line 30', result);

          // check if links have expired
          const { expiresAt } = result;
          const hashedUniqueString = result.uniqueId;
          console.log(uniqueString);
          if (expiresAt < Date.now()) {
            // when link has expired
            UserVerification.findOneAndDelete({ userId })
              .then((result) => {
                res.status(400).json({
                  message: "Link expired! Request for a new verification link",
                });
              })
              .catch((error) => {
                console.log("line 39", error);
                res.status(400).json({
                  message: "An error occured when deleting expired user record",
                  error,
                });
              });
          }
          // If link is still valid
          else {
            // compare unique strings
            bcrypt
              .compare(uniqueString, hashedUniqueString)
              .then(async (result) => {
                console.log(
                  "line 59",
                  result + " " + uniqueString + " " + hashedUniqueString
                );
                // if Unique string corresponds,  update the verification status
                if (result) {
                  const updateUser = await User.findOneAndUpdate(
                    { _id: userId },
                    { isVerified: true },
                    { new: true }
                  );
                  if (updateUser) {
                    console.log("line 63", updateUser);
                    res
                      .status(200)
                      .json({ message: "User verification successful" });
                  } else {
                    console.log("line 66");
                    res.status(400).json({
                      message: "Could not update user verification status",
                    });
                  }
                }
                // When unique string is invalid
                else {
                  res
                    .status(400)
                    .json({ message: "Invalid verification details" });
                }
              })
              .catch((error) => {
                console.log(error);
                res.status(500).json({
                  message: "An error occured while comparing unique strings",
                  error,
                });
              });
          }
        })
        .catch((error) => {
          console.log(error);
          res.status(400).json({
            message:
              "An error occured while checking for existing user verification status",
          });
        });
    }
  } else {
    res.status(400).json({
      message: "User do not exist!",
    });
  }
});

// Send Verification mail
const sendVerificationEmail = async (user, res) => {
  const { _id, email } = user;
  // console.log(_id, email);
  const url = "https://x-clone-fe.vercel.app/auth/";
  const uniqueString = uuid() + _id;

  const mailOptions = {
    from: process.env.AUTH_EMAIL,
    to: email,
    subject: "Verify your Email",
    html: `<p>
    Verify your email address to complete the signup and login into your account</p>
    <p>This link <b>expires in 6 hours</b>. <p>Click  <a href=${
      url + "/verification/" + _id + "/" + uniqueString
    } style='text-decoration: underline;'> here<a/> to proceed. </p>`,
  };

  // hash the uniqueString
  const salt = 10;
  bcrypt
    .hash(uniqueString, salt)
    .then(async (hashedUniqueString) => {
      console.log(hashedUniqueString);
      const newVerification = await UserVerification.create({
        userId: _id,
        uniqueId: hashedUniqueString,
        createdAt: Date.now(),
        expiresAt: Date.now() + 21600000,
      });
      if (newVerification) {
        transporter
          .sendMail(mailOptions)
          .then((success) => {
            console.log(success);
            res.status(300).json({
              status: "PENDING",
              message: `Please verify your account. Verification email sent`,
            });
          })
          .catch((error) => {
            console.log(error);
            res.status(400).json({
              status: "FAILED",
              message: "Verification email failed",
            });
          });
      } else {
        res.status(400).json({
          status: "failed",
          message: "Couldn't send verification mail",
        });
      }
    })
    .catch((error) => {
      console.log(error);
      res.status(400).json({
        status: "failed",
        message: "An error occured while hashing email data",
      });
    });
};

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
  const usernameExists = await User.findOne({ username });
  if (usernameExists) {
    return res.status(401).json({
      message:
        "User with username already exist. Please try a different username.",
    });
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const user = await User.create({
    name,
    email,
    username,
    password: hashedPassword,
    isVerified: false,
  });
  if (user) {
    // Send Verification mail
    sendVerificationEmail(user, res);
    // res.status(201).json({
    //   message: "Signup successful!",
    //   data: user,
    // });
  }
});

// Login User
// /api/auth/signin
// Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if ((!email, !password)) {
    res.status(400).json({ message: "Please fill all fields" });
  }
  const user = await User.findOne({ $or: [{ email }, { username: email }] });
  console.log(user)

  if (user && (await bcrypt.compare(password, user.password))) {
    const hasVerified = await User.findOne({
      $or: [
        { email, isVerified: true },
        { username: email, isVerified: true },
      ],
    }, {password: 0});
    console.log("hasVerified ", hasVerified);
    if (hasVerified) {
      res.status(200).json({
        message: "success",
        data: user,
        token: generateToken(user.id),
      });
    } else {
      sendVerificationEmail(user, res);
      // res.status(300).json({
      //   message: "Account not verified. Please verify you account to login",
      // });
    }
  } else {
    res.status(400).json({ message: "Invalid credentials" });
  }
});

// Get all users
// /api/auth/users
//public
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password");
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
  const user = await User.findOne({ _id: req.user.id }).select("-password");
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
  const user = await User.findOne({ _id: req.params.id }).select("-password");
  if (user) {
    res.status(200).json({
      message: "success",
      data: user,
    });
  } else {
    res.status(400).json("User does not exist");
  }
});

// Forgot Password
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (email.trim() == "") {
    res.status(400).json({ message: "Email or Username cannot be empty" });
  }
  const user = await User.findOne({
    $or: [{ email: email }, { username: email }],
  });
  // const user = await User.findOne({ email });
  if (user) {
    console.log("USER - ", user);
    sendResetLink(user, res);
  } else {
    res.status(400).json({ message: "User not found!" });
  }
});

const sendResetLink = async ({ email, _id }, res) => {
  const uniqueString = uuid() + _id;
  const url = "https://x-clone-fe.vercel.app/auth/";

  const mailOptions = {
    from: process.env.AUTH_EMAIL,
    to: email,
    subject: "X - Password Reset",
    html: `<div>
    <p>
    You have requested to reset your password. Please follow the link attached to reset your password
    </p>
    <p>
    This link <b>expires in 5 mins</b>. Click  <a href=${
      url + "/forgot-password/" + _id + "/" + uniqueString
    } style='text-decoration: underline; color:red;'> here<a/> to proceed. 
    </p>
    <br>
    <p>If you have not requested for password reset, please ignore.</p>
    </div>`,
  };

  // hash uniqueString
  const salt = 10;
  console.log(uniqueString);
  const hashedUniqueString = await bcrypt.hash(uniqueString, salt);
  if (hashedUniqueString) {
    const currentTime = Date.now();
    const createdAt = new Date(currentTime);

    const willExpire = Date.now() + 300000;
    const expiresAt = new Date(willExpire);

    console.log(`createdAt - ${createdAt}. Expire at - ${expiresAt}`);
    const resetData = await PasswordReset.create({
      userId: _id,
      uniqueString: hashedUniqueString,
      createdAt: createdAt,
      expiresAt: expiresAt,
    });
    if (resetData) {
      transporter.sendMail(mailOptions).then((success) => {
        console.log(success);

        res.status(200).json({
          message:
            "Password reset instruction has been sent to your registered email.",
        });
      });
    } else {
      res.status(500).json({
        message: "An error occured while creating password reset data",
      });
    }
  } else {
    res
      .status(500)
      .json({ message: "An error occured while hashing unique string." });
  }
};

const resetPassword = asyncHandler(async (req, res) => {
  const { uniqueString, id } = req.params;
  const { password } = req.body;
  console.log(password);
  if (!password || password.trim() === "") {
    res.status(400).json({ message: "Password cannot be empty" });
  }
  // check for reset data from db
  const existingData = await PasswordReset.find({ userId: id });
  const dataExists = existingData[existingData.length - 1];
  if (dataExists) {
    // check if link has not expired
    if (dataExists.expiresAt < Date.now()) {
      console.log(
        "expires at - " +
          dataExists.expiresAt +
          " " +
          "current time" +
          " " +
          Date.now()
      );
      res.status(400).json({ message: "Link expired. Please try again." });
    } else {
      // compare the uniqueStrings
      bcrypt
        .compare(dataExists.uniqueString, uniqueString)
        .then(async (success) => {
          console.log(success);
          // hash new password
          const salt = 10;
          console.log(password);
          bcrypt
            .hash(password, salt)
            .then(async (hashedPassword) => {
              console.log(hashedPassword);

              // Update password
              const updateUserPassword = await User.findByIdAndUpdate(
                id,
                { password: hashedPassword },
                { new: true }
              );
              if (updateUserPassword) {
                console.log("updated user password ", updateUserPassword);
                res.status(201).json({ message: "Password reset successful" });
                console.log("after response");
              } else {
                res
                  .status(400)
                  .json(
                    "An error occured while reseting password! Please try again"
                  );
              }
            })
            .catch((error) => {
              console.log("hash error", error);
              res
                .status(500)
                .json({ message: "An error occured while hashing password" });
            });
        })
        .catch((error) => {
          console.log(error);
        });
    }
  } else {
    res
      .status(400)
      .json({ message: "Could not find password reset information" });
  }
});

module.exports = {
  registerUser,
  loginUser,
  getAllUsers,
  getUser,
  getUsers,
  verifyUser,
  forgotPassword,
  resetPassword,
};

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

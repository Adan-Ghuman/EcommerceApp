const User = require("../models/User");
const VerificationToken = require("../models/verificationToken");
const express = require("express");
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const {
  generateOTP,
  mailTransport,
  generateEmailTemplate,
  plainEmailTemplate,
} = require("../utils/mail");
const { isValidObjectId } = require("mongoose");
const bcrypt = require("bcrypt");

module.exports = {
  createUser: async (req, res) => {
    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      location: req.body.location,
      password: CryptoJS.AES.encrypt(
        req.body.password,
        process.env.SECRET
      ).toString(),
    });

    const OTP = generateOTP();
    console.log(OTP);

    const verificationToken = new VerificationToken({
      owner: newUser._id,
      token: OTP,
    });
    await verificationToken.save();
    await newUser.save();

    mailTransport().sendMail({
      from: "dreamspace.pk5@gmail.com",
      to: newUser.email,
      subject: "Email Verification",
      html: generateEmailTemplate(OTP),
    });

    res.status(201).json({
      message: "OTP sent to email. Please verify to complete registration.",
      userId: newUser._id,
    });
  },

  verifyUser: async (req, res) => {
    const { userid, otp } = req.body;
    if (!userid || !otp.trim()) {
      console.log("request", req.body);

      console.log("failed at 1st");

      return res
        .status(400)
        .json({ message: "Invalid request, missing parameters" });
    }

    if (!isValidObjectId(userid)) {
      console.log("failed at 2");

      return res.status(400).json({ message: "Invalid user id" });
    }
    const user = await User.findById(userid);
    if (!user) {
      console.log("failed at 3");

      return res.status(404).json({ message: "Sorry, User not found" });
    }

    if (user.verified) {
      console.log("failed at 4");

      return res.status(400).json({ message: "User already verified" });
    }

    const token = await VerificationToken.findOne({ owner: user._id });

    if (!token) {
      console.log("failed at 5");

      return res.status(404).json({ message: "Sorry, User not found" });
    }
    console.log(token);
    if (new Date() > token.expiresAt) {
      await User.findByIdAndDelete(userid); // Delete user data
      await VerificationToken.findByIdAndDelete(token._id); // Delete the verification token
      return res
        .status(400)
        .json({ message: "Verification token expired, user data deleted" });
    }
    const isMatched = await token.compareToken(otp);

    console.log(isMatched);

    if (!isMatched) {
      console.log("failed at 6");

      return res.status(400).json({ message: "Invalid OTP" });
    }

    user.verified = true;

    await VerificationToken.findByIdAndDelete(token._id);
    await user.save();

    mailTransport().sendMail({
      from: "dreamspace.pk5@gmail.com",
      to: user.email,
      subject: "Email Verification",
      html: plainEmailTemplate(
        "Email Verified",
        "Thanks for connecting with us"
      ),
    });
    console.log("success");

    res.status(200).json({
      success: true,
      message: "User verified successfully",
      user: { name: user.username, email: user.email },
    });
  },

  loginUser: async (req, res) => {
    try {
      const user = await User.findOne({ email: req.body.email });

      if (!user) {
        return res.status(401).json("Wrong credentials provide a valid email");
      }

      const decryptedPassword = CryptoJS.AES.decrypt(
        user.password,
        process.env.SECRET
      );
      const decryptedpass = decryptedPassword.toString(CryptoJS.enc.Utf8);

      if (decryptedpass !== req.body.password) {
        return res.status(401).json("Wrong password");
      }

      const userToken = jwt.sign(
        {
          id: user.id,
        },
        process.env.JWT_SEC,
        { expiresIn: "7d" }
      );

      const { password, __v, createdAt, updatedAt, ...userData } = user._doc;

      res.status(200).json({ ...userData, token: userToken });
    } catch (error) {
      res.status(500).json({ message: error });
    }
  },
  forgotPassword: async (req, res) => {
    const { email } = req.body;
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json("User not found");
      }

      const OTP = generateOTP();
      const verificationToken = new VerificationToken({
        owner: user._id,
        token: OTP,
      });
      await verificationToken.save();
      mailTransport().sendMail({
        from: "dreamspace.pk5@gmail.com",
        to: user.email,
        subject: "Password Reset",
        html: generateEmailTemplate(OTP),
      });
      console.log("success");

      res
        .status(200)
        .json({ message: "OTP sent to your email", userId: user._id });
    } catch (error) {
      res.status(500).json({ message: error });
    }
  },
  resetPassword: async (req, res) => {
    const { password, token } = req.body;
    console.log(password, token);
    try {
      const verificationToken = await VerificationToken.findOne({ token });
      console.log(verificationToken);
      if (!verificationToken) {
        console.log("Invalid or expired token");
        return res.status(400).json("Invalid or expired token");
      }

      const user = await User.findById(verificationToken.owner);
      if (!user) {
        console.log("User not found");
        return res.status(404).json("User not found");
      }
      const encryptedPassword = CryptoJS.AES.encrypt(
        password,
        process.env.SECRET
      );
      user.password = encryptedPassword.toString();
      await user.save();
      console.log("success");

      res.status(200).json("Password reset successfully");
    } catch (error) {
      res.status(500).json({ message: error });
    }
  },
  verifyOTP: async (req, res) => {
    const { email, otp } = req.body;
    try {
      const user = await User.findOne({ email });
      console.log(user);

      if (!user) {
        console.log("User not found");
        return res.status(404).json("User not found");
      }
      const token = await VerificationToken.findOne({ owner: user._id });
      if (!token) {
        console.log("Token not found");
        return res.status(404).json("Token not found");
      }
      console.log(otp);

      console.log(token);

      const isMatched = await token.compareToken(otp.toString().trim());
      console.log(isMatched);
      if (!isMatched) {
        console.log("Invalid OTP");
        return res.status(400).json("Invalid OTP");
      }

      res.status(200).json({ token: token.token });
    } catch (error) {
      res.status(500).json({ message: error });
    }
  },
};

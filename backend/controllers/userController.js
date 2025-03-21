const User = require("../models/User");
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");
module.exports = {
  deleteUser: async (req, res) => {
    try {
      // console.log("====================================");
      // console.log(`deleter ${req.params.id}`);
      // console.log("====================================");
      await User.findByIdAndDelete(req.params.id);

      res.status(200).json("Successfully Deleted");
    } catch (error) {
      res.status(500).json(error);
    }
  },

  getUser: async (req, res) => {
    try {
      const user = await User.findById(req.params.id);

      if (!user) {
        return res.status(401).json("User does not exist");
      }

      const { password, __v, createdAt, updatedAt, ...userData } = user._doc;

      res.status(200).json(userData);
    } catch (error) {
      res.status(500).json(error);
    }
  },

  verifyPassword: async (req, res) => {
    // console.log("====================================");
    // console.log("verifying password");
    // console.log("====================================");

    const { userId, password } = req.body;

    try {
      const user = await User.findById(userId);

      if (!user) {
        return res
          .status(404)
          .json({ isValid: false, message: "User not found" });
      }

      const decryptedPassword = CryptoJS.AES.decrypt(
        user.password,
        process.env.SECRET
      );
      const decryptedPass = decryptedPassword.toString(CryptoJS.enc.Utf8);

      if (decryptedPass !== password) {
        return res
          .status(401)
          .json({ isValid: false, message: "Incorrect password" });
      }

      const userToken = jwt.sign({ id: user.id }, process.env.JWT_SEC, {
        expiresIn: "7d",
      });

      res.status(200).json({ isValid: true, token: userToken });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ isValid: false, message: "Server error" });
    }
  },
};

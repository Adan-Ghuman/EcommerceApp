const router = require("express").Router();
const authController = require("../controllers/authController");

router.post("/register", authController.createUser);
router.post("/login", authController.loginUser);
router.post("/verify", authController.verifyUser);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);
router.post("/verify-otp", authController.verifyOTP);

module.exports = router;

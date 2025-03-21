const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

router.delete("/deleteUser/:id", userController.deleteUser);
router.get("/:id", userController.getUser);
router.post("/verifyPassword/", userController.verifyPassword);

module.exports = router;

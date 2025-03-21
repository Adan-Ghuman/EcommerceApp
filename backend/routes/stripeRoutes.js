const router = require("express").Router();
const stripeController = require("../controllers/stripeController");
const express = require("express");

// Add express.raw middleware for the Stripe webhook route
router.post("/payment", stripeController.stripe, express.raw({ type: "*/*" }));

module.exports = router;

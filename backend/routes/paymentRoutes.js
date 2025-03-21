const router = require("express").Router();
const paymentController = require("../controllers/paymentController");

router.post("/pay", paymentController.payprice);
// router.post("/stripe", paymentController.stripe);

module.exports = router;

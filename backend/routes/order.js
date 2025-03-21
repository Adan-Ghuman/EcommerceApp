const router = require("express").Router();
const ordersController = require("../controllers/ordersControllers");

router.get("/:id", ordersController.getUserOrders);

module.exports = router;

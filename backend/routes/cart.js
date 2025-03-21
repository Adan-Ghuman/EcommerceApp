const router = require("express").Router();
const cartController = require("../controllers/cartController");

router.get("/find/:id", cartController.getcart);
router.get("/count/:id", cartController.countcart);
router.post("/", cartController.addTocart);
router.post("/increment/", cartController.addTocart);
router.post("/decrement", cartController.decrementCartItem);
router.delete("/:cartItemId", cartController.deleteCartItem);
router.post("/clearCheckout", cartController.clearCheckout);
module.exports = router;

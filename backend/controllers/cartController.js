const Product = require("../models/Products");
const Cart = require("../models/Cart");
const User = require("../models/User");
const Order = require("../models/Order");
const e = require("cors");

module.exports = {
  addTocart: async (req, res) => {
    const { userId, cartItem, quantity } = req.body;

    try {
      const cart = await Cart.findOne({ userId });

      if (cart) {
        const existingProduct = cart.products.find(
          (product) => product.cartItem.toString() === cartItem
        );
        if (existingProduct) {
          existingProduct.quantity += 1;
        } else {
          cart.products.push({ cartItem, quantity });
        }

        await cart.save();
        res.status(200).json("Product added to cart");
      } else {
        const newCart = new Cart({
          userId,
          products: [
            {
              cartItem,
              quantity: quantity,
            },
          ],
        });

        await newCart.save();
        res.status(200).json("Product added to cart");
      }
    } catch (error) {
      res.status(500).json(error);
    }
  },
  // countcart: async (req, res) => {
  //   const userId = req.params.id;

  //   try {
  //     // Retrieve the cart and populate product details
  //     const cart = await Cart.findOne({ userId }).populate(
  //       "products.cartItem",
  //       "_id title imageUrl price supplier"
  //     );

  //     if (!cart) {
  //       return res.status(200).json({ count: 0 }); // Return 0 instead of crashing
  //     }

  //     // Calculate total number of items
  //     const totalItems = cart.products.reduce(
  //       (acc, item) => acc + item.quantity,
  //       0
  //     );

  //     res.status(200).json({ count: totalItems });
  //   } catch (error) {
  //     console.error("Error fetching cart count:", error);
  //     res.status(500).json({ error: "Internal Server Error" });
  //   }
  // },
  countcart: async (req, res) => {
    const userId = req.params.id;
    try {
      // Retrieve the cart and populate product details
      const cart = await Cart.findOne({ userId }).populate(
        "products.cartItem",
        "_id title imageUrl price supplier"
      );

      if (!cart) {
        return res.status(404).json({ message: "Cart not found" });
      }

      // Calculate the total number of items by summing each product's quantity
      const totalItems = cart.products.reduce(
        (acc, item) => acc + item.quantity,
        0
      );

      res.status(200).json(totalItems);
    } catch (error) {
      res.status(500).json(error);
    }
  },

  getcart: async (req, res) => {
    const userId = req.params.id;
    try {
      const cart = await Cart.find({ userId }).populate(
        "products.cartItem",
        "_id title imageUrl price supplier "
      );
      res.status(200).json(cart);
    } catch (error) {
      res.status(500).json(error);
    }
  },

  deleteCartItem: async (req, res) => {
    const { cartItemId } = req.params;
    // console.log("====================================");
    // console.log("front delete cartitem: ", cartItemId);
    // console.log("====================================");

    // Validate cartItemId
    // if (!mongoose.Types.ObjectId.isValid(cartItemId)) {
    //   return res.status(400).json("Invalid cart item ID");
    // }

    try {
      const updatedCart = await Cart.findOneAndUpdate(
        { "products._id": cartItemId },
        { $pull: { products: { _id: cartItemId } } },
        { new: true } // Return the updated document
      );

      if (!updatedCart) {
        return res.status(404).json("Cart item not found");
      }

      res.status(200).json(updatedCart);
    } catch (error) {
      console.error("Error deleting cart item:", error);
      res.status(500).json("An error occurred while deleting the cart item");
    }
  },

  decrementCartItem: async (req, res) => {
    const { userId, cartItem } = req.body;
    // console.log("backend decrement", userId, "  ...........  ", cartItem);

    try {
      const cart = await Cart.findOne({ userId });

      if (!cart) {
        return res.status(404).json("Cart not found");
      }

      const existingProduct = cart.products.find(
        (product) => product.cartItem._id.toString() === cartItem
      );

      if (!existingProduct) {
        return res.status(404).json("Product not found in cart");
      }

      if (existingProduct.quantity === 1) {
        // Remove product if quantity is 1
        cart.products = cart.products.filter(
          (product) => product.cartItem.toString() !== cartItem
        );
      } else {
        // Decrement quantity if greater than 1
        existingProduct.quantity -= 1;
      }

      await cart.save();
      res.status(200).json("Product decremented successfully");
    } catch (error) {
      console.error("Error decrementing cart item:", error);
      res
        .status(500)
        .json("An error occurred while decrementing the cart item");
    }
  },
  clearCheckout: async (req, res) => {
    const { userId, phone, paymentDetails, shippingAddress } = req.body;

    try {
      // Validate required fields
      if (!userId || !phone || !paymentDetails || !shippingAddress) {
        return res
          .status(400)
          .json({ success: false, message: "Missing required fields." });
      }

      const { address, city, postalCode, country } = shippingAddress;

      if (!address || !city || !postalCode || !country) {
        return res.status(400).json({
          success: false,
          message: "Incomplete shipping address details.",
        });
      }

      // Fetch user details (email)

      const user = await User.findById(userId);
      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found." });
      }
      console.log("====================================");
      console.log("user id at order", userId);
      console.log("====================================");
      // Find the cart by userId and populate product details
      const cart = await Cart.findOne({ userId }).populate("products.cartItem");

      if (!cart || cart.products.length === 0) {
        return res
          .status(400)
          .json({ success: false, message: "Cart is empty or not found." });
      }

      // Calculate subtotal
      let subtotal = 0;
      cart.products.forEach((item) => {
        const itemPrice = parseFloat(item.cartItem.price); // Ensure price is a valid number
        if (isNaN(itemPrice)) {
          throw new Error(`Invalid price for product: ${item.cartItem.title}`);
        }
        subtotal += itemPrice * item.quantity;
      });

      // Define tax rate (example: 10%)
      const taxRate = 0.1;
      const tax = subtotal * taxRate;
      const total = subtotal + tax;

      console.log("====================================");
      console.log("Subtotal:", subtotal);
      console.log("Tax:", tax);
      console.log("Total:", total);
      console.log("====================================");

      // Create a new order
      const order = new Order({
        userId,
        userEmail: user.email, // Fetch user's email
        customerId: userId, // Can be replaced with actual customer ID if available
        phone, // Use phone from request body
        items: cart.products.map((item) => ({
          productId: item.cartItem._id, // Use product ID instead of the full object
          quantity: item.quantity,
          price: parseFloat(item.cartItem.price),
        })),
        shippingAddress: { address, city, postalCode, country },
        subtotal,
        tax,
        total,
        paymentStatus: "Paid", // Assuming payment was successful
        paymentDetails: {
          id: paymentDetails?.id || "N/A",
          receiptUrl: paymentDetails?.receiptUrl || "",
        },
      });

      await order.save(); // Save order to database
      console.log("Order Created");

      // Clear the cart after successful order creation
      await Cart.findOneAndDelete({ userId });
      res.status(201).json({
        success: true,
        message: "Checkout completed, order saved successfully.",
        order,
      });
    } catch (error) {
      console.error("Error during checkout:", error.message);
      res.status(500).json({
        success: false,
        message: "An error occurred while processing checkout.",
        error: error.message,
      });
    }
  },
};
// // clearCheckout: async (req, res) => {
// //   const { userId, paymentDetails, shippingAddress } = req.body;

// //   try {
// //     // Validate required fields
// //     if (!userId || !paymentDetails || !shippingAddress) {
// //       return res.status(400).json({ message: "Missing required fields." });
// //     }

// //     const { address, city, postalCode, country } = shippingAddress;

// //     if (!address || !city || !postalCode || !country) {
// //       return res
// //         .status(400)
// //         .json({ message: "Incomplete shipping address details." });
// //     }

// //     // Find the cart by userId
// //     const cart = await Cart.findOne({ userId });

// //     if (!cart) {
// //       return res.status(404).json({ message: "Cart not found." });
// //     }

// //     if (cart.products.length === 0) {
// //       return res.status(400).json({ message: "Cart is already empty." });
// //     }

// //     // Calculate subtotal (sum of all product prices)
// //     let subtotal = 0;
// //     cart.products.forEach((item) => {
// //       subtotal += item.cartItem.price * item.quantity;
// //     });

// //     // Define tax rate (example: 10%)
// //     const taxRate = 0.1;

// //     // Calculate tax based on subtotal
// //     const tax = subtotal * taxRate;

// //     // Calculate total (subtotal + tax)
// //     const total = subtotal + tax;
// //     console.log("====================================");
// //     console.log("subtotal", subtotal);

// //     console.log("hello orders");
// //     console.log("====================================");
// //     // Create a new order
// //     const order = new Order({
// //       userId,
// //       customerId: userId, // Optionally replace this with customer-specific info
// //       items: cart.products.map((item) => ({
// //         productId: item.cartItem,
// //         quantity: item.quantity,
// //         price: item.cartItem.price,
// //       })),
// //       shippingAddress: { address, city, postalCode, country },
// //       subtotal,
// //       tax,
// //       total,
// //       paymentStatus: "Paid", // Assuming payment was successful
// //       paymentDetails: {
// //         id: paymentDetails.id,
// //         receiptUrl: paymentDetails.receiptUrl,
// //       },
// //     });

// //     await order.save(); // Save the order to the database

// //     // Clear the cart
// //     cart.products = [];
// //     await cart.save();

// //     res.status(200).json({
// //       message: "Checkout cleared and order saved successfully.",
// //       order,
// //     });
// //   } catch (error) {
// //     console.error("Error clearing checkout:", error);
// //     res.status(500).json({
// //       message: "An error occurred while clearing checkout.",
// //     });
// //   }
// // },

// clearCheckout: async (req, res) => {
//   const { userId, paymentDetails, shippingAddress } = req.body;

//   try {
//     // Validate required fields
//     if (!userId || !paymentDetails || !shippingAddress) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Missing required fields." });
//     }

//     const { address, city, postalCode, country } = shippingAddress;

//     if (!address || !city || !postalCode || !country) {
//       return res.status(400).json({
//         success: false,
//         message: "Incomplete shipping address details.",
//       });
//     }

//     // Find the cart by userId and populate product details
//     const cart = await Cart.findOne({ userId }).populate("products.cartItem");

//     if (!cart || cart.products.length === 0) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Cart is empty or not found." });
//     }

//     // Calculate subtotal
//     let subtotal = 0;
//     cart.products.forEach((item) => {
//       const itemPrice = parseFloat(item.cartItem.price); // Ensure price is a valid number
//       if (isNaN(itemPrice)) {
//         throw new Error(`Invalid price for product: ${item.cartItem.title}`);
//       }
//       subtotal += itemPrice * item.quantity;
//     });

//     // Define tax rate (example: 10%)
//     const taxRate = 0.1;
//     const tax = subtotal * taxRate;
//     const total = subtotal + tax;

//     console.log("====================================");
//     console.log("Subtotal:", subtotal);
//     console.log("Tax:", tax);
//     console.log("Total:", total);
//     console.log("====================================");

//     // Create a new order
//     const order = new Order({
//       userId,
//       customerId: userId, // Can be replaced with actual customer ID
//       items: cart.products.map((item) => ({
//         productId: item.cartItem._id, // Use product ID instead of the full object
//         quantity: item.quantity,
//         price: parseFloat(item.cartItem.price),
//       })),
//       shippingAddress: { address, city, postalCode, country },
//       subtotal,
//       tax,
//       total,
//       paymentStatus: "Paid", // Assuming payment was successful
//       paymentDetails: {
//         id: paymentDetails?.id || "N/A",
//         receiptUrl: paymentDetails?.receiptUrl || "",
//       },
//     });

//     await order.save(); // Save order to database

//     // Clear the cart after successful order creation
//     await Cart.findOneAndDelete({ userId });

//     res.status(201).json({
//       success: true,
//       message: "Checkout completed, order saved successfully.",
//       order,
//     });
//   } catch (error) {
//     console.error("Error during checkout:", error.message);
//     res.status(500).json({
//       success: false,
//       message: "An error occurred while processing checkout.",
//       error: error.message,
//     });
//   }
// },

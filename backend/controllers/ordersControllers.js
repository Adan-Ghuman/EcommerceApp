const Order = require("../models/Order");

module.exports = {
  getUserOrders: async (req, res) => {
    const userId = req.params.id;

    try {
      const userOrders = await Order.find({ userId })
        .populate({
          path: "items.productId", // Populate product details inside items array
          select: "-description -product_location", // Select required fields
        })
        .exec();

      res.status(200).json(userOrders);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // getUserOrders: async (req, res) => {
  //   const userId = req.params.id;

  //   try {
  //     const userOrders = await Order.find({ userId })
  //       .populate({
  //         path: "productId",
  //         select: "-description -product_location",
  //       })
  //       .exec();

  //     res.status(200).json(userOrders);
  //   } catch (error) {
  //     res.status(200).json(error);
  //   }
  // },
};

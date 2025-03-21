const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userEmail: {
      type: String,
      required: true,
    }, // Store registered email directly to keep it even if the user is deleted
    customerId: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    }, // Direct phone field instead of nested contactDetails
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        }, // Store product price at the time of order to avoid price changes affecting past orders
      },
    ],
    shippingAddress: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
    },
    subtotal: {
      type: Number,
      required: true,
    }, // Total of all product prices before tax or discounts
    tax: {
      type: Number,
      required: true,
    }, // Tax amount
    total: {
      type: Number,
      required: true,
    }, // Final total after tax and any fees
    deliveryStatus: {
      type: String,
      enum: ["Pending", "Shipped", "Delivered", "Cancelled"],
      default: "Pending",
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed"],
      default: "Pending",
    },
    paymentDetails: {
      id: { type: String }, // Payment ID from the payment gateway
      receiptUrl: { type: String }, // Receipt URL from the payment gateway
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", OrderSchema);

const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
// const Stripe = require("stripe");
// const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const app = express();
const port = 3000;

const orderRouter = require("./routes/order");
const cartRouter = require("./routes/cart");
const userRouter = require("./routes/user");
const authRouter = require("./routes/auth");
const productRouter = require("./routes/products");
const paymentRouter = require("./routes/paymentRoutes");
const stripeRouter = require("./routes/stripeRoutes");

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("db connected"))
  .catch((err) => console.log(err));

app.use(cors());
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
// app.use("/api/stripe", stripeRouter, express.raw({ type: "*/*" }));

app.use("/api/stripe", express.raw({ type: "*/*" }), stripeRouter);
app.use("/api/products", productRouter);
app.use("/api/", authRouter);
app.use("/api/orders", orderRouter);
app.use("/api/cart", cartRouter);
app.use("/api/users", userRouter);
app.use("/api", paymentRouter);

app.listen(process.env.PORT || port, () =>
  console.log(`Example app listening on port ${process.env.PORT}!`)
);

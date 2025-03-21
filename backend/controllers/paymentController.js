const Order = require("../models/Order");
const dotenv = require("dotenv");
dotenv.config();
const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

module.exports = {
  payprice: async (req, res) => {
    console.log("Stripe Secret Key:", process.env.STRIPE_SECRET_KEY);

    try {
      const { name } = req.body;
      const { price } = req.body;
      const { contact } = req.body;
      // const { email } = req.body;
      const { address } = req.body;

      if (
        !name?.trim() ||
        !price ||
        // !email?.trim() ||
        !address?.trim() ||
        !contact?.trim()
      ) {
        // console.log("Validation failed: Missing or empty fields");
        return res.status(400).json({
          message:
            "All fields (name, price, email, address, contact) are required and cannot be empty.",
        });
      }

      console.log("Before Payment Intent created:");
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(price * 100),
        // amount: 2500,
        currency: "usd",
        payment_method_types: ["card"],
        metadata: { name, price, contact, address },
      });
      // console.log("Payment Intent created:");
      // console.log("Payment Intent created:", paymentIntent);
      const clientSecret = paymentIntent.client_secret;
      console.log("Payment Intenet Created.");
      res.json({ message: "Payment Initiated.", clientSecret: clientSecret });
    } catch (error) {
      console.error("Error in Stripe Paymen", error);
      res.status(500).json({ message: "Internel Server Error" });
    }
  },

  // stripe: async (req, res) => {
  //   const sig = req.headers["stripe-signature"];
  //   let event;
  //   try {
  //     event = await stripe.webhooks.constructEvent(
  //       req.body,
  //       sig,
  //       process.env.STRIPE_WEBHOOKS_SECRET
  //     );
  //   } catch (err) {
  //     console.error(err);
  //     res.status(400).json({ message: err.message });
  //   }

  //   // Event when a payment is initiated
  //   if (event.type === "payment_intent.created") {
  //     console.log(`${event.data.object.metadata.name} initiated payment!`);
  //   }

  //   // Event when a payment is succeeded
  //   if (event.type === "payment_intent.succeeded") {
  //     console.log(`${event.data.object.metadata.name} succeeded payment!`);
  //     // fulfilment
  //   }

  //   res.json({ ok: true });
  // },
};

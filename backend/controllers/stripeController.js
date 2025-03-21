const dotenv = require("dotenv");
dotenv.config();
const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOKS_SECRET;
module.exports = {
  stripe: async (req, res) => {
    const sig = req.headers["stripe-signature"];

    console.log("Webhook secret:", webhookSecret);
    // console.log("Request headers:", req.headers);

    let event;

    // Verify webhook signature
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
      console.log("helooo");
    } catch (err) {
      console.error("Webhook signature verification failed:", err.message);
      return res.status(400).json({
        message: "Webhook signature verification failed.",
        error: err.message,
      });
    }

    // Handle the event
    try {
      switch (event.type) {
        case "payment_intent.created":
          console.log(`${event.data.object.metadata.name} initiated payment.`);
          break;

        case "payment_intent.succeeded":
          console.log(`${event.data.object.metadata.name} succeeded payment.`);
          // Perform order fulfillment or additional logic here
          break;

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      res.status(200).json({ message: "Event processed successfully." });
    } catch (error) {
      console.error("Error handling event:", error.message);
      res
        .status(500)
        .json({ message: "Internal Server Error", error: error.message });
    }
  },
};

// const dotenv = require("dotenv");
// dotenv.config();
// const Stripe = require("stripe");
// const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// module.exports = {
//   stripe: async (req, res) => {
//     console.log("Webhook secret:", process.env.STRIPE_WEBHOOKS_SECRET);
//     console.log("Request headers:", req.headers);
//     const sig = req.headers["stripe-signature"];
//     let event;

//     try {
//       event = stripe.webhooks.constructEvent(
//         req.body,
//         sig,
//         process.env.STRIPE_WEBHOOKS_SECRET
//       );
//     } catch (err) {
//       console.error("Webhook signature verification failed:", err.message);
//       return res
//         .status(400)
//         .json({ message: "Webhook signature verification failed." });
//     }

//     try {
//       switch (event.type) {
//         case "payment_intent.created":
//           console.log(`${event.data.object.metadata.name} initiated payment.`);
//           break;
//         case "payment_intent.succeeded":
//           console.log(`${event.data.object.metadata.name} succeeded payment.`);
//           // Handle order fulfillment or other logic here
//           break;
//         default:
//           console.log(`Unhandled event type: ${event.type}`);
//       }

//       res.json({ message: "Event processed successfully." });
//     } catch (error) {
//       console.error("Error handling event:", error.message);
//       res.status(500).json({ message: "Internal Server Error" });
//     }
//   },
// };

// // stripe: async (req, res) => {
// //   const sig = req.headers["stripe-signature"];
// //   let event;
// //   try {
// //     event = await stripe.webhooks.constructEvent(
// //       req.body,
// //       sig,
// //       process.env.STRIPE_WEBHOOKS_SECRET
// //     );
// //   } catch (err) {
// //     console.error(err);
// //     res.status(400).json({ message: err.message });
// //   }

// //   // Event when a payment is initiated
// //   if (event.type === "payment_intent.created") {
// //     console.log(`${event.data.object.metadata.name} initiated payment!`);
// //   }

// //   // Event when a payment is succeeded
// //   if (event.type === "payment_intent.succeeded") {
// //     console.log(`${event.data.object.metadata.name} succeeded payment!`);
// //     // fulfilment
// //   }

// //   res.json({ ok: true });
// // },

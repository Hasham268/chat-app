// This is your test secret API key.
const stripe = require("stripe")(
  "sk_test_51OCebUIVmJDDzt9tIiN9LHGmOZOAXJOQzk1iR26GQlsQG3xsJMidvTJjBisEB465TxXpSRe6PJ1Lmj5CLdjD1BKp008NTYy4tv"
);
const express = require("express");
const router = express.Router();

router.post("/create-checkout-session", async (req, res) => {
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: 500,
          product_data: {
            name: "This feature is premium. Kindly pay to access.",
          },
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${process.env.YOUR_DOMAIN}/chats?success=true`,
    cancel_url: `${process.env.YOUR_DOMAIN}/chats?canceled=true`,
  });

  res.send({ url: session.url });
});

module.exports = router;

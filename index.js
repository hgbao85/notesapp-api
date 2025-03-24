// index.js
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { createPaymentLink } = require("./payos");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

app.post("/create-payment", async (req, res) => {
    const { amount, description } = req.body;

    if (!amount) {
        return res.status(400).json({ error: "Amount is required" });
    }

    try {
        const returnUrl = "https://localhost:3000/payment-success";
        const cancelUrl = "https://localhost:3000/payment-cancel";

        const result = await createPaymentLink({
            amount,
            description: description || "Thanh toán đơn hàng",
            returnUrl,
            cancelUrl,
        });

        res.json(result);
    } catch (err) {
        console.error(err.response?.data || err.message);
        res.status(500).json({ error: "Failed to create payment link" });
    }
});

app.listen(PORT, () => {
    console.log(`PayOS server is running at http://localhost:${PORT}`);
});

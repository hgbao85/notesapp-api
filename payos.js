const crypto = require("crypto");
const axios = require("axios");

const CLIENT_ID = process.env.PAYOS_CLIENT_ID;
const API_KEY = process.env.PAYOS_API_KEY;
const CHECKSUM_KEY = process.env.PAYOS_CHECKSUM_KEY;

function generateOrderCode() {
    return Math.floor(100000 + Math.random() * 900000);
}

function calculateChecksum(data, key) {
    const keysForSignature = ["amount", "cancelUrl", "description", "orderCode", "returnUrl"];
    const sortedKeys = keysForSignature.sort();
    const rawData = sortedKeys.map(k => `${k}=${data[k]}`).join("&");
    return crypto.createHmac("sha256", key).update(rawData).digest("hex");
}


async function createPaymentLink({ amount, description, buyerName, buyerEmail, buyerPhone, buyerAddress, items, returnUrl, cancelUrl }) {
    const orderCode = generateOrderCode();

    const body = {
        orderCode,
        amount,
        description,
        buyerName,
        buyerEmail,
        buyerPhone,
        buyerAddress,
        items,
        returnUrl,
        cancelUrl,
    };
    console.log("Request body:", body);
    const signature = calculateChecksum(body, CHECKSUM_KEY);
    console.log("Signature:", signature);
    const headers = {
        "x-client-id": CLIENT_ID,
        "x-api-key": API_KEY,
        "Content-Type": "application/json",
    };

    try {
        const response = await axios.post(
            "https://api-merchant.payos.vn/v2/payment-requests",
            { ...body, signature },
            { headers }
        );
        return response.data;
    } catch (err) {
        console.error(err.response?.data || err.message);
        throw err;
    }
}

module.exports = {
    createPaymentLink,
};
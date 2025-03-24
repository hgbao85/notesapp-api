// payos.js
const crypto = require("crypto");
const axios = require("axios");

const CLIENT_ID = process.env.PAYOS_CLIENT_ID;
const API_KEY = process.env.PAYOS_API_KEY;
const CHECKSUM_KEY = process.env.PAYOS_CHECKSUM_KEY;

function generateOrderCode() {
    return Math.floor(100000 + Math.random() * 900000); // random 6 số
}

function calculateChecksum(data, key) {
    const sortedKeys = Object.keys(data).sort();
    const sortedData = {};
    sortedKeys.forEach((k) => {
        sortedData[k] = data[k];
    });

    const jsonString = JSON.stringify(sortedData);
    return crypto.createHmac("sha256", key).update(jsonString).digest("hex");
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

    const checksum = calculateChecksum(body, CHECKSUM_KEY);

    const headers = {
        "x-client-id": CLIENT_ID,
        "x-api-key": API_KEY,
        "Content-Type": "application/json",
    };

    const response = await axios.post(
        "https://api-merchant.payos.vn/v2/payment-requests",
        { ...body, checksum },
        { headers }
    );
    return response.data;
}

module.exports = {
    createPaymentLink,
};
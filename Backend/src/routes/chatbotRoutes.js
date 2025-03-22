const express = require("express");
const fetch = require("node-fetch");
const router = express.Router();
require("dotenv").config();

const WIT_AI_TOKEN = process.env.WIT_AI_SERVER_ACCESS_TOKEN; 
const UNOMI_BASE_URL = "http://10.123.215.101:4000/unomi";

// Function to send query to Wit.ai
const getWitResponse = async (query) => {
    const url = `https://api.wit.ai/message?v=20230201&q=${encodeURIComponent(query)}`;
    try {
        const response = await fetch(url, {
            headers: { Authorization: `Bearer ${WIT_AI_TOKEN}` }
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching from Wit.ai:", error);
        return null;
    }
};

// Function to fetch data from Unomi
const fetchUnomiData = async (endpoint) => {
    try {
        const response = await fetch(`${UNOMI_BASE_URL}/${endpoint}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`Error fetching ${endpoint} from Unomi:`, error);
        return null;
    }
};

// Chatbot Route
router.post("/", async (req, res) => {
    const userQuery = req.body.query;
    if (!userQuery) {
        return res.status(400).json({ error: "Query is required" });
    }

    console.log("Query received at backend:", userQuery);

    // Get Wit.ai response
    const witData = await getWitResponse(userQuery);

    if (!witData || !witData.intents || witData.intents.length === 0) {
        return res.json({ response: "I'm not sure how to answer that. Can you rephrase?" });
    }

    // Extract intent and entities
    const detectedIntent = witData.intents[0].name;
    const confidence = witData.intents[0].confidence;
    const entities = witData.entities || {};

    console.log("Detected Intent:", detectedIntent);
    console.log("Confidence:", confidence);

    let responseMessage = "I couldn't find the information you're looking for.";

    // Confidence threshold (to avoid false triggers)
    if (confidence < 0.6) {
        return res.json({ response: "I'm not confident about the answer. Can you rephrase?" });
    }

    // Process different intents
    switch (detectedIntent) {
        case "getHighLowValueCustomers":
            if (entities.customer_value) {
                const value = entities.customer_value[0].value;
                responseMessage = `Fetching ${value}-value customers...`;
            } else {
                responseMessage = "Fetching high and low-value customers...";
            }
            break;

        case "getActiveCustomers":
            if (entities.time_range) {
                responseMessage = `Retrieving active customers in ${entities.time_range[0].value}...`;
            } else {
                responseMessage = "Retrieving customers active in the last 5 days...";
            }
            break;

        case "getMostClickedPolicy":
            const policyData = await fetchUnomiData("policy-count"); // Call Unomi API
            responseMessage = policyData?.mostClickedPolicy
                ? `The most clicked policy is ${policyData.mostClickedPolicy}.`
                : "I couldn't find the most clicked policy.";
            break;

        case "getAverageInteractionTime":
            responseMessage = "Calculating average interaction time of users...";
            break;

        case "suggestNewPolicies":
            if (entities.policy_type) {
                responseMessage = `Suggesting new ${entities.policy_type[0].value} policies based on trends...`;
            } else {
                responseMessage = "Suggesting new policies based on most clicked ones...";
            }
            break;

        case "getPolicyClicksVsPurchases":
            responseMessage = "Fetching policy click-to-purchase conversion rate...";
            break;

        case "getMostPurchasedPolicies":
            responseMessage = "Retrieving most purchased policies...";
            break;

        case "getHighRiskCustomers":
            if (entities.risk_level) {
                responseMessage = `Identifying ${entities.risk_level[0].value}-risk customers...`;
            } else {
                responseMessage = "Identifying high-risk customers...";
            }
            break;

        default:
            responseMessage = "I don't have an answer for that.";
            break;
    }

    return res.json({ response: responseMessage });
});

module.exports = router;

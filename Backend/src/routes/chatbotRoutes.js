const express = require("express");
const fetch = require("node-fetch");
const router = express.Router();
require("dotenv").config();
const axios = require('axios');

const baseURL = process.env.UNOMI_API_URL;

const WIT_AI_TOKEN = process.env.WIT_AI_SERVER_ACCESS_TOKEN;
const UNOMI_BASE_URL = "http://localhost:4000/unomi";

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
        if (!response.ok) {
            throw new Error(`Unomi API error: ${response.statusText}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`Error fetching ${endpoint} from Unomi:`, error);
        return null;
    }
};

// Get most clicked policy from data
const getMostClickedPolicy = (policyData) => {
    if (!policyData || Object.keys(policyData).length === 0) {
        return "No policy data available.";
    }
    const mostClickedPolicy = Object.entries(policyData).reduce((a, b) =>
        a[1] > b[1] ? a : b
    );
    return `The most clicked policy is ${mostClickedPolicy[0]} with ${mostClickedPolicy[1]} clicks.`;
};

const getLeastClickedPolicy = (policyData) => {
    if (!policyData || Object.keys(policyData).length === 0) {
        return "No policy data available.";
    }
    const mostClickedPolicy = Object.entries(policyData).reduce((a, b) =>
        a[1] < b[1] ? a : b
    );
    return `The least clicked policy is ${mostClickedPolicy[0]} with ${mostClickedPolicy[1]} clicks.`;
};

// Inline function to fetch policy data based on policyId
async function getPolicyData(policyId) {
    try {
        const policyResponse = await axios.post(
            `${baseURL}/cxs/profiles/search`,
            {
                condition: {
                    type: "profilePropertyCondition",
                    parameterValues: {
                        propertyName: "properties.startDate",
                        comparisonOperator: "exists", // Match policy using _id
                    }
                }
            },
            {
                headers: {
                    Authorization: `Basic ${Buffer.from('karaf:karaf').toString('base64')}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log(`Policy response received for policyId: ${policyId}`, policyResponse.data);

        // Return the matching policy if found
        const matchingPolicy = policyResponse.data.list.find(policy => policy.properties._id === policyId);
        if (matchingPolicy) {
            return matchingPolicy.properties;
        } else {
            console.warn(`No policy found for policyId: ${policyId}`);
            return null;
        }
    } catch (error) {
        console.error(`Error fetching policy data for policyId: ${policyId}`, error?.response?.data || error.message);
        return null;
    }
}

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
        console.log(witData);
        return res.json({ response: "I'm not sure how to answer that. Can you rephrase?" });
    }

    // Extract intent and entities
    const detectedIntent = witData.intents[0].name;
    const confidence = witData.intents[0].confidence;
    const entities = witData.entities || {};

    console.log("Detected Intent:", detectedIntent);
    console.log("Confidence:", confidence);

    let responseMessage = "I couldn't find the information you're looking for.";

    // Confidence threshold
    if (confidence < 0.6) {
        return res.json({ response: "I'm not confident about the answer. Can you rephrase?" });
    }

    // Process different intents
    switch (detectedIntent) {
        case "getHighLowValueCustomers":
            try {
                // Fetch customer data from the API
                const customerResponse = await fetch('http://localhost:4000/unomi/active-profile');
                if (!customerResponse.ok) {
                    throw new Error(`Error fetching data: ${customerResponse.statusText}`);
                }
                const customerData = await customerResponse.json();

                if (!Array.isArray(customerData) || customerData.length === 0) {
                    responseMessage = "No active customer data available.";
                    break;
                }

                // Sort and get the top 3 customers by count
                const topCustomers = customerData
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 3);

                if (entities.time_range) {
                    responseMessage = `Retrieving top 3 active customers in ${entities.time_range[0].value}...`;
                } else {
                    responseMessage = "Retrieving top 3 active customers...";
                }

                responseMessage += `\n${topCustomers.map(c => `${c.email} (Count: ${c.count})`).join(', ')}`;
            } catch (error) {
                console.error("Error fetching active customers:", error.message);
                responseMessage = "Failed to retrieve active customers.";
            }
            break;
        case "getMostClickedPolicy":
            const policyData = await fetchUnomiData("policy-count"); // Call Unomi API
            responseMessage = policyData
                ? getMostClickedPolicy(policyData)
                : "I couldn't find the most clicked policy.";
            break;

        case "getLeastClickedPolicy":
            const policyData2 = await fetchUnomiData("policy-count"); // Call Unomi API
            responseMessage = policyData2
                ? getLeastClickedPolicy(policyData2)
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


        case "getMostPurchasedPolicies":
            responseMessage = "Fetching policy click-to-purchase conversion rate...";
            try {
                // First, make the axios.post call to Unomi to get the required response
                const responseUnomi = await axios.post(
                    `${baseURL}/cxs/profiles/search`,
                    {
                        condition: {
                            type: "profilePropertyCondition",
                            parameterValues: {
                                propertyName: "properties.startDate",
                                comparisonOperator: "exists"
                            }
                        }
                    },
                    {
                        headers: {
                            Authorization: `Basic ${Buffer.from('karaf:karaf').toString('base64')}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );

                // Extract the list of policies from the Unomi response
                const policies = responseUnomi.data.list || []; // In case 'list' is not present
                //console.log(policies);
                // Check if policies are available, otherwise handle the case
                if (policies.length === 0) {
                    console.log("No policies found.");
                    responseMessage = "No policies found for the given condition.";
                    break;
                }

                // Count the occurrences of each policy number (i.e., number of purchases)
                const policyCountMap = policies.reduce((acc, policy) => {
                    const policyNumber = policy.properties.policyNumber;
                    if (policyNumber) {
                        acc[policyNumber] = (acc[policyNumber] || 0) + 1;
                    }
                    return acc;
                }, {});

                // Create an array of policy objects with the purchase count
                const policyWithCounts = Object.entries(policyCountMap).map(([policyNumber, count]) => ({
                    policyNumber,
                    count
                }));

                // Sort the policies by purchase count in descending order
                policyWithCounts.sort((a, b) => b.count - a.count);

                // Get the top 5 most purchased policies
                const topPolicies = policyWithCounts.slice(0, 5);

                // Send the response with the top 5 policies
                console.log('Top 5 Most Purchased Policies:', topPolicies);
                responseMessage = "Top 5 policies fetched successfully.";
                responseMessage += `\n${topPolicies.map(p => `\n- Policy Number: ${p.policyNumber}\n  Count: ${p.count}`).join('\n\n')}`;


            } catch (error) {
                console.error('Error fetching policies:', error);

                // Handle Axios specific error cases
                if (error.response) {
                    console.error(`Unomi API Error: ${error.response.status} - ${error.response.statusText}`);
                    responseMessage = `An error occurred while fetching policies: ${error.response.statusText}.`;
                } else if (error.request) {
                    console.error('No response received from Unomi API:', error.request);
                    responseMessage = "No response received from Unomi API.";
                } else {
                    console.error('Error setting up the request:', error.message);
                    responseMessage = "An error occurred while setting up the request.";
                }
            }
            break;

        case "getHighRiskCustomers":
            if (entities.risk_level) {
                responseMessage = `Identifying ${entities.risk_level[0].value}-risk customers...`;
            } else {
                responseMessage = "Identifying high-risk customers...";

                try {
                    // First, make the axios.post call to Unomi to get the claims-related data
                    console.log("Sending request to Unomi for claims data...");
                    const responseUnomi = await axios.post(
                        `${baseURL}/cxs/profiles/search`,
                        {
                            condition: {
                                type: "profilePropertyCondition",
                                parameterValues: {
                                    propertyName: "properties.status",
                                    comparisonOperator: "exists"
                                }
                            }
                        },
                        {
                            headers: {
                                Authorization: `Basic ${Buffer.from('karaf:karaf').toString('base64')}`,
                                'Content-Type': 'application/json'
                            }
                        }
                    );

                    console.log("Unomi response received:", responseUnomi.data);

                    // Extract the list of claims from the Unomi response
                    const claims = responseUnomi.data.list || [];
                    console.log(`Found ${claims.length} claims.`);

                    // Loop through each claim to identify high-risk customers
                    const highRiskCustomers = [];

                    for (const claim of claims) {
                        const { properties } = claim;
                        policyID = properties.policyId
                        console.log(`Fetching policy for startDate: ${policyID}`);

                        // Fetch all policies where startDate exists
                        const policyResponse = await axios.post(
                            `${baseURL}/cxs/profiles/search`,
                            {
                                condition: {
                                    type: "profilePropertyCondition",
                                    parameterValues: {
                                        propertyName: "properties.startDate", // Match policies with a startDate
                                        comparisonOperator: "exists", // Ensure that startDate exists
                                    }
                                }
                            },
                            {
                                headers: {
                                    Authorization: `Basic ${Buffer.from('karaf:karaf').toString('base64')}`,
                                    'Content-Type': 'application/json'
                                }
                            }
                        );

                        console.log(`Policy response received for policyID: ${policyID}`, policyResponse.data);

                        // Loop through the profiles to manually find the matching policy for the claim
                        const matchingPolicies = policyResponse.data.list.filter(policy => {
                            const policyStartDate = policy.properties._id;
                            return policyStartDate === policyID; // Match the policies by startDate
                        });

                        if (matchingPolicies.length > 0) {
                            matchingPolicies.forEach(matchingPolicy => {
                                const policyData = matchingPolicy.properties;
                                const coverageAmount = policyData.coverageAmount || 0;
                                console.log(`Coverage amount for policy with policyID${policyID}: ${coverageAmount}`);

                                // Calculate the claim percentage
                                const claimAmount = properties.amount;
                                const claimPercentage = (claimAmount / coverageAmount) * 100;
                                console.log(`Claim amount: ${claimAmount}, Claim percentage: ${claimPercentage}%`);

                                // Check if the claim percentage is 70% or higher
                                if (claimPercentage >= 70) {
                                    // // If claim percentage is 70% or higher, return the userId object
                                    // const userId = properties.userId;
                                    // console.log(`High-risk claim identified for userId: ${userId}`);
                                    // You can return or store the userId, claimAmount, and claimPercentage as needed
                                    responseMessage = `Coverage amount for policy with policyID${policyID}: ${coverageAmount} Claim amount: ${claimAmount}, Claim percentage: ${claimPercentage}%`;
                                    
                                }else{
                                    responseMessage = "No risk!"   
                                }
                            });
                        } else {
                            
                            console.warn(`No policies found with policyID: ${poicyID}`);
                        }
                    }
                } catch (error) {
                    console.error("Error identifying high-risk customers:", error?.response?.data || error.message);
                    responseMessage = "An error occurred while identifying high-risk customers.";
                }
            }
            break;


        default:
            responseMessage = "I don't have an answer for that.";
            break;
    }

    return res.json({ response: responseMessage });
});

module.exports = router;

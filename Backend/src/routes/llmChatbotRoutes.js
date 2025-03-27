const express = require("express");
const axios = require("axios");
const router = express.Router();
require("dotenv").config();

const baseURL = process.env.UNOMI_API_URL;
const UNOMI_BASE_URL = "http://localhost:4000/unomi";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

// Function to send query to Gemini API
const getGeminiResponse = async (query) => {
    try {
        const response = await axios.post(
            `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
            {
                contents: [{ parts: [{ text: `Analyze the user query and determine the intent based on the following categories: 
                - getHighLowValueCustomers
                - getMostClickedPolicy
                - getLeastClickedPolicy
                - getMostPurchasedPolicy
                - getHighRiskCustomer
                - getCustomerByName
                - getClaims
                - getAllCustomers

                Respond with a JSON object containing the detected intent and any relevant entities. 

                User query: "${query}"` }] }]
            },
            { headers: { "Content-Type": "application/json" } }
        );

        let geminiText = response.data.candidates[0].content.parts[0].text;

        // Remove Markdown formatting if present
        geminiText = geminiText.replace(/```json|```/g, "").trim();

        return geminiText;
    } catch (error) {
        console.error("Error fetching from Gemini API:", error);
        return null;
    }
};

// Function to fetch data from Unomi
const fetchUnomiData = async (endpoint) => {
    try {
        const response = await axios.get(`${UNOMI_BASE_URL}/${endpoint}`);
        return response.data;
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

// Get least clicked policy from data
const getLeastClickedPolicy = (policyData) => {
    if (!policyData || Object.keys(policyData).length === 0) {
        return "No policy data available.";
    }
    const leastClickedPolicy = Object.entries(policyData).reduce((a, b) =>
        a[1] < b[1] ? a : b
    );
    return `The least clicked policy is ${leastClickedPolicy[0]} with ${leastClickedPolicy[1]} clicks.`;
};


// Chatbot Route
router.post("/", async (req, res) => {
    const userQuery = req.body.query;
    if (!userQuery) {
        return res.status(400).json({ error: "Query is required" });
    }

    console.log("Query received at backend:", userQuery);

    // Get Gemini response
    const geminiResponse = await getGeminiResponse(userQuery);
    if (!geminiResponse) {
        return res.json({ response: "I'm not sure how to answer that. Can you rephrase?" });
    }

    let detectedIntent;
    try {
        const parsedResponse = JSON.parse(geminiResponse); // Expecting a structured JSON response
        detectedIntent = parsedResponse.intent;
    } catch (err) {
        console.error("Error parsing Gemini response:", err);
        return res.json({ response: "I couldn't process that request." });
    }

    console.log("Detected Intent:", detectedIntent);

    let responseMessage = "I couldn't find the information you're looking for.";

    switch (detectedIntent) {
        case "getHighLowValueCustomers":
            try {
                const customerData = await fetchUnomiData("active-profile");
                if (!Array.isArray(customerData) || customerData.length === 0) {
                    responseMessage = "No active customer data available.";
                    break;
                }
    
                const topCustomers = customerData.sort((a, b) => b.count - a.count).slice(0, 3);
                responseMessage = `Top 3 active customers (count of login):\n${topCustomers.map(c => `${c.email} (Count: ${c.count})`).join(', ')}`;
            } catch (error) {
                console.error("Error fetching active customers:", error.message);
                responseMessage = "Failed to retrieve active customers.";
            }
            break;
    
        case "getMostClickedPolicy":
            try {
                const policyData = await fetchUnomiData("policy-count"); // Call Unomi API
                responseMessage = policyData
                    ? getMostClickedPolicy(policyData)
                    : "I couldn't find the most clicked policy.";
            } catch (error) {
                console.error("Error fetching most clicked policy:", error.message);
                responseMessage = "Failed to retrieve the most clicked policy.";
            }
            break;
    
        case "getLeastClickedPolicy":
            try {
                const policyData2 = await fetchUnomiData("policy-count"); // Call Unomi API
                responseMessage = policyData2
                    ? getLeastClickedPolicy(policyData2)
                    : "I couldn't find the least clicked policy.";
            } catch (error) {
                console.error("Error fetching least clicked policy:", error.message);
                responseMessage = "Failed to retrieve the least clicked policy.";
            }
            break;
    
        case "getMostPurchasedPolicy":
            console.log("inside most purchased")
            responseMessage = "Fetching most purchased policies...";
            try {
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
    
                const policies = responseUnomi.data.list || [];
                if (policies.length === 0) {
                    responseMessage = "No policies found for the given condition.";
                    break;
                }
    
                const policyCountMap = policies.reduce((acc, policy) => {
                    const policyNumber = policy.properties.policyNumber;
                    if (policyNumber) {
                        acc[policyNumber] = (acc[policyNumber] || 0) + 1;
                    }
                    return acc;
                }, {});
    
                const policyWithCounts = Object.entries(policyCountMap).map(([policyNumber, count]) => ({
                    policyNumber,
                    count
                }));
    
                policyWithCounts.sort((a, b) => b.count - a.count);
                const topPolicies = policyWithCounts.slice(0, 5);
    
                responseMessage = "Top 5 most purchased policies:";
                responseMessage += `\n${topPolicies.map(p => `\n- Policy Number: ${p.policyNumber}\n  Count: ${p.count}`).join('\n\n')}`;
    
            } catch (error) {
                console.error('Error fetching policies:', error);
                responseMessage = error.response
                    ? `Unomi API Error: ${error.response.statusText}`
                    : "An error occurred while fetching policies.";
            }
            break;
    
            case "getHighRiskCustomer":
                try {
                    // Fetch all customers with existing claims
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
            
                    const claims = responseUnomi.data.list || [];
                    if (claims.length === 0) {
                        responseMessage = "No claims data available.";
                        break;
                    }
            
                    let highRiskCustomers = [];
            
                    for (const claim of claims) {
                        const { properties } = claim;
                        const policyID = properties.policyId;
                        
                        // Extract email from userInfo
                        let email = "Not Available";
                        if (properties.userInfo) {
                            const emailMatch = properties.userInfo.match(/email:\s*'([^']+)'/);
                            if (emailMatch) {
                                email = emailMatch[1];
                            }
                        }
            
                        // Fetch policy details
                        const policyResponse = await axios.post(
                            `${baseURL}/cxs/profiles/search`,
                            {
                                condition: {
                                    type: "profilePropertyCondition",
                                    parameterValues: {
                                        propertyName: "properties.startDate",
                                        comparisonOperator: "exists",
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
            
                        const matchingPolicies = policyResponse.data.list.filter(policy => policy.properties._id === policyID);
            
                        if (matchingPolicies.length > 0) {
                            matchingPolicies.forEach(matchingPolicy => {
                                const policyData = matchingPolicy.properties;
                                const coverageAmount = policyData.coverageAmount || 0;
                                const claimAmount = properties.amount || 0;
            
                                // Calculate claim percentage
                                const claimPercentage = coverageAmount > 0 ? (claimAmount / coverageAmount) * 100 : 0;
            
                                // Consider claims above 70% of coverage as high-risk
                                if (claimPercentage >= 70) {
                                    highRiskCustomers.push({
                                        policyID,
                                        email,  // Add email
                                        coverageAmount,
                                        claimAmount,
                                        claimPercentage
                                    });
                                }
                            });
                        }
                    }
            
                    // Format response message
                    if (highRiskCustomers.length > 0) {
                        responseMessage = "High-risk customers identified:\n" + 
                            highRiskCustomers.map(c =>
                                `\n- Email: ${c.email}\n  Policy ID: ${c.policyID}\n  Coverage: ₹${c.coverageAmount}\n  Claim: ₹${c.claimAmount}\n  Claim %: ${c.claimPercentage}%`
                            ).join('\n\n');
                    } else {
                        responseMessage = "No high-risk customers found.";
                    }
            
                } catch (error) {
                    console.error("Error identifying high-risk customers:", error.message);
                    responseMessage = "An error occurred while identifying high-risk customers.";
                }
                break;
            
    case "getAllCustomers":
    try {
        console.log("Fetching all customers...");

        // Step 1: Fetch all profiles that have an email (indicating a registered customer)
        let customerResponse = await axios.post(
            `${baseURL}/cxs/profiles/search`,
            {
                condition: {
                    type: "profilePropertyCondition",
                    parameterValues: {
                        propertyName: "properties.email",
                        comparisonOperator: "exists",
                    },
                },
            },
            {
                headers: {
                    Authorization: `Basic ${Buffer.from("karaf:karaf").toString("base64")}`,
                    "Content-Type": "application/json",
                },
            }
        );

        let customers = customerResponse.data.list || [];
        console.log("Total customers fetched:", customers.length);

        // Step 2: Remove duplicate profiles by comparing userId
        let uniqueCustomers = {};
        customers.forEach((customer) => {
            let userId = customer.properties.userId;
            if (!uniqueCustomers[userId]) {
                uniqueCustomers[userId] = customer.properties;
            }
        });

        let customerList = Object.values(uniqueCustomers);
        console.log("Unique customers count:", customerList.length);

        // Step 3: Format response
        if (customerList.length === 0) {
            responseMessage = "No customers found.";
            break;
        }

        responseMessage = "Customer Details:\n\n";
        customerList.forEach((customer, index) => {
            responseMessage += `\n Name: ${customer.firstName} ${customer.lastName || ""} \n Email: ${customer.email}\n Id: ${customer.userId}`;
        });

    } catch (error) {
        console.error("Error retrieving customers:", error.response?.data || error.message);
        responseMessage = "An error occurred while retrieving customer details.";
    }
    break;


        case "getCustomerByName":
            try {
                let firstName = null, lastName = null, email = null;

                // Extract name or email from query
                const words = userQuery.toLowerCase().split(" ");
                let extractedName = null;

                // Find "of customer" or just "of" in query
                const ofCustomerIndex = words.indexOf("customer") > 0 ? words.indexOf("customer") + 1 : -1;
                const ofIndex = words.indexOf("of") + 1;

                if (ofCustomerIndex > 0 && ofCustomerIndex < words.length) {
                    // If "customer" is present, extract after "customer"
                    extractedName = words.slice(ofCustomerIndex).join(" ");
                } else if (ofIndex > 0 && ofIndex < words.length) {
                    // Otherwise, extract after "of"
                    extractedName = words.slice(ofIndex).join(" ");
                }

                if (extractedName) {
                    extractedName = extractedName.trim();
                    // Check if it's an email
                    if (extractedName.includes("@")) {
                        email = extractedName;
                    } else {
                        const nameParts = extractedName.split(" ");
                        firstName = nameParts[0] || null;
                        lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : null;
                    }
                }

                console.log("Extracted Details - First Name:", firstName, "| Last Name:", lastName, "| Email:", email);

                let matchedProfiles = [];

                // Step 1: Search by Email if provided
                if (email) {
                    console.log("Searching by email:", email);
                    const emailSearchResponse = await axios.post(
                        `${baseURL}/cxs/profiles/search`,
                        {
                            condition: {
                                type: "profilePropertyCondition",
                                parameterValues: {
                                    propertyName: "properties.email",
                                    comparisonOperator: "equals",
                                    propertyValue: email
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

                    matchedProfiles = emailSearchResponse.data.list || [];
                } 
                // Step 2: Search by First Name & Last Name
                else if (firstName) {
                    console.log("Searching for first name:", firstName);
                    const firstNameSearchResponse = await axios.post(
                        `${baseURL}/cxs/profiles/search`,
                        {
                            condition: {
                                type: "profilePropertyCondition",
                                parameterValues: {
                                    propertyName: "properties.firstName",
                                    comparisonOperator: "equals",
                                    propertyValue: firstName
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

                    matchedProfiles = firstNameSearchResponse.data.list || [];

                    // If last name is provided, filter by last name
                    if (lastName) {
                        matchedProfiles = matchedProfiles.filter(profile => 
                            profile.properties.lastName &&
                            profile.properties.lastName.toLowerCase() === lastName.toLowerCase()
                        );
                    }
                } else {
                    responseMessage = "Please provide a first name or email to search for a customer.";
                    break;
                }

                if (matchedProfiles.length === 0) {
                    responseMessage = "No customers found with the given details.";
                    break;
                }

                // Step 3: Merge profiles with the same userId, keeping the latest one
                const userMap = new Map();
                matchedProfiles.forEach(profile => {
                    const userId = profile.properties.userId;
                    const lastUpdated = new Date(profile.systemProperties.lastUpdated);

                    if (!userMap.has(userId) || lastUpdated > userMap.get(userId).lastUpdated) {
                        userMap.set(userId, { 
                            ...profile.properties, 
                            lastUpdated 
                        });
                    }
                });

                const uniqueProfiles = Array.from(userMap.values());

                // Step 4: Display results
                if (uniqueProfiles.length === 1) {
                    const profile = uniqueProfiles[0];
                    responseMessage = `Customer found:\n\n- Name: ${profile.firstName} ${profile.lastName}\n- Email: ${profile.email}\n- User ID: ${profile.userId}`;
                } else {
                    responseMessage = `Multiple customers found:\n To get details of specific customer provide full name or email Id\n`;
                    uniqueProfiles.forEach(profile => {
                        responseMessage += `- Name: ${profile.firstName} ${profile.lastName}, Email: ${profile.email}\n`;
                    });
                }

            } catch (error) {
                console.error("Error searching customer:", error.response?.data || error.message);
                responseMessage = "An error occurred while searching for the customer.";
            }
            break;

        case "getClaims":
            try {
                let firstName = null, lastName = null, email = null;
                let extractedName = null;
                let responseMessage2 = "";
                const words = userQuery.toLowerCase().split(" ");

                // Find "of customer" or just "of" in query
                const ofCustomerIndex = words.indexOf("customer") > 0 ? words.indexOf("customer") + 1 : -1;
                const ofIndex = words.indexOf("of") + 1;

                if (ofCustomerIndex > 0 && ofCustomerIndex < words.length) {
                    // If "customer" is present, extract after "customer"
                    extractedName = words.slice(ofCustomerIndex).join(" ");
                } else if (ofIndex > 0 && ofIndex < words.length) {
                    // Otherwise, extract after "of"
                    extractedName = words.slice(ofIndex).join(" ");
                }

                if (extractedName) {
                    if (extractedName.includes("@")) {
                        email = extractedName;
                    } else {
                        const nameParts = extractedName.split(" ");
                        firstName = nameParts[0] || null;
                        lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : null;
                    }
                }

                console.log("Extracted Details - First Name:", firstName, "| Last Name:", lastName, "| Email:", email);

                let claims = [];
                let userId = null;
                let customerEmail = "Not Available"; 

                if (email || firstName) {
                    // Step 1: Fetch user profile to get userId
                    let userSearchCondition = email
                        ? {
                            type: "profilePropertyCondition",
                            parameterValues: {
                                propertyName: "properties.email",
                                comparisonOperator: "equals",
                                propertyValue: email,
                            },
                        }
                        : {
                            type: "profilePropertyCondition",
                            parameterValues: {
                                propertyName: "properties.firstName",
                                comparisonOperator: "equals",
                                propertyValue: firstName,
                            },
                        };

                    let userSearchResponse = await axios.post(
                        `${baseURL}/cxs/profiles/search`,
                        { condition: userSearchCondition },
                        {
                            headers: {
                                Authorization: `Basic ${Buffer.from("karaf:karaf").toString("base64")}`,
                                "Content-Type": "application/json",
                            },
                        }
                    );

                    let matchedProfiles = userSearchResponse.data.list || [];

                    if (lastName) {
                        matchedProfiles = matchedProfiles.filter(
                            (profile) => profile.properties.lastName?.toLowerCase() === lastName.toLowerCase()
                        );
                    }

                    if (matchedProfiles.length === 0) {
                        responseMessage = "No customer found with the given details.";
                        break;
                    }
                    if(matchedProfiles.length == 1){
                    // Extract user ID and email
                    userId = matchedProfiles[0].properties.userId;
                    customerEmail = matchedProfiles[0].properties.email || "Not Available";

                    console.log("User ID found:", userId, "Email:", customerEmail);

                    if (!userId) {
                        responseMessage = "User profile found but missing userId.";
                        break;
                    }

                    // Step 2: Fetch claims for this user ID, ensuring only claim profiles are returned
                    let claimsResponse = await axios.post(
                        `${baseURL}/cxs/profiles/search`,
                        {
                            condition: {
                                type: "booleanCondition",
                                parameterValues: {
                                    operator: "and",
                                    subConditions: [
                                        {
                                            type: "profilePropertyCondition",
                                            parameterValues: {
                                                propertyName: "properties.userId",
                                                comparisonOperator: "equals",
                                                propertyValue: userId,
                                            },
                                        },
                                        {
                                            type: "profilePropertyCondition",
                                            parameterValues: {
                                                propertyName: "properties.policyId",
                                                comparisonOperator: "exists",
                                            },
                                        }
                                    ]
                                }
                            }
                        },
                        {
                            headers: {
                                Authorization: `Basic ${Buffer.from("karaf:karaf").toString("base64")}`,
                                "Content-Type": "application/json",
                            },
                        }
                    );

                    claims = claimsResponse.data.list || [];
                    }else{
                        let allClaimsResponse = await axios.post(
                            `${baseURL}/cxs/profiles/search`,
                            {
                                condition: {
                                    type: "profilePropertyCondition",
                                    parameterValues: {
                                        propertyName: "properties.policyId",
                                        comparisonOperator: "exists",
                                    },
                                },
                            },
                            {
                                headers: {
                                    Authorization: `Basic ${Buffer.from("karaf:karaf").toString("base64")}`,
                                    "Content-Type": "application/json",
                                },
                            }
                        );
    
                        claims = allClaimsResponse.data.list || [];
                        responseMessage2 = "Getting all claims as name is not unique. To get for specific customer, provide email Id. \n"
                    }
                } else {
                    // Step 3: Fetch all claims only (not user profiles)
                    console.log("Fetching all claims...");
                    let allClaimsResponse = await axios.post(
                        `${baseURL}/cxs/profiles/search`,
                        {
                            condition: {
                                type: "profilePropertyCondition",
                                parameterValues: {
                                    propertyName: "properties.policyId",
                                    comparisonOperator: "exists",
                                },
                            },
                        },
                        {
                            headers: {
                                Authorization: `Basic ${Buffer.from("karaf:karaf").toString("base64")}`,
                                "Content-Type": "application/json",
                            },
                        }
                    );

                    claims = allClaimsResponse.data.list || [];
                }

                console.log("Claims found:", claims.length);

                if (claims.length === 0) {
                    responseMessage = email || firstName ? "No claims found for the user." : "No claims available.";
                    break;
                }

                // Step 4: Format the response
                responseMessage = email || firstName ? `Claims for user (${customerEmail}):\n\n ${responseMessage2}` : `All claims:\n\n`;

                claims.forEach((claim, index) => {

                    const claimDetails = claim.properties;
                    const email = (claimDetails.userInfo.match(/email:\s*'([^']+)'/))[1]
                    responseMessage += `${index + 1}. Email: ${email} \n Policy Id: ${claimDetails.policyId} \n Amount: ₹${claimDetails.amount} \n Status: ${claimDetails.status} \n Date: ${new Date(claimDetails.dateFiled).toDateString()}\n`;
                });

            } catch (error) {
                console.error("Error retrieving claims:", error.response?.data || error.message);
                responseMessage = "An error occurred while retrieving claims.";
            }
            break;

        default:
            responseMessage = "I don't have an answer for that.";
            break;
    }
    
    

    return res.json({ response: responseMessage });
});

module.exports = router;

require("newrelic");
const express = require("express");
const app = express();
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const setupSwagger = require("./swaggerConfig");
const connectDB = require("./config/database");
const unomiRoute = require('./routes/unomiRoutes');
const unomiController = require('./controllers/unomiController'); 

require("dotenv").config();
require("./reminderCron");


connectDB();


// const whitelist = process.env.CORS_ORIGIN
//   ? process.env.CORS_ORIGIN.split(",") 
//   : ["*"];

// app.use(
//   cors({
//     origin: whitelist,
//     credentials: true,
//     maxAge: 14400,
//   })
// );

const whitelist = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map(origin => origin.trim())
  : ["http://localhost:3000"];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || whitelist.includes(origin)) {
      callback(null, true); // Allow request
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true, // Allow cookies/session
};
app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // Handle preflight requests



app.use(express.json());
app.use(cookieParser());

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { error: "Too many requests, please try again later." },
    headers: true,
});

app.use(apiLimiter);
setupSwagger(app);

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Credentials", "true");
    next();
});

const userRoutes = require("./routes/userRoutes");
const policyRoutes = require("./routes/policyRoutes");
const claimRoutes = require("./routes/claimRoutes");
const adminRoutes = require("./routes/adminRoutes");
const chatbotRoutes = require("./routes/chatbotRoutes"); 


app.use("/users", userRoutes);
app.use("/policies", policyRoutes);
app.use("/claims", claimRoutes);
app.use("/admin", adminRoutes);
app.use("/chatbot", chatbotRoutes);
app.use('/unomi', unomiRoute);

app.get('/unomi/active-profile', unomiController.getActiveProfiles);

app.get("/", (req, res) => {
    res.send("Welcome to the StateFull Claims Management System!");
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

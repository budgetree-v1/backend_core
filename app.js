// Core Modules
const http = require("http");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const helmet = require("helmet");
require("dotenv").config();
const { failedResponse } = require("./Configs");

// Initialize Express App
const app = express();

// Middleware Setup
app.use(cors());
app.use(helmet()); // Secure headers
app.use(express.static("public"));
app.set("trust proxy", true); // For proxies/load balancers

// Body Parsers
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(express.json({ limit: "50mb" }));
app.use(express.text());
app.use(bodyParser.text());

// Disable Express Signature
app.disable("x-powered-by");

// Routes
const apiRoutes = require("./Routes/index");

app.use("/api/user", apiRoutes.userRoutes);
app.use("/api/txn", apiRoutes.transactionRoutes);
app.use("/api", apiRoutes.api);

app.use((req, res) => {
  res.status(404).json({
    ...failedResponse,
    statusCode: 404,
    message: "URL Not Found",
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack); // Log the error
  res.json({ ...failedResponse, statusCode: 500, message: "Internal server error" });
});

// MongoDB Connection
mongoose.Promise = global.Promise;

mongoose
  .connect(process.env.DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ Successfully connected to the database");
  })
  .catch((err) => {
    console.error("❌ Could not connect to the database", err);
    process.exit(1);
  });

// Start Server
const port = process.env.PORT || 7777;
http.createServer(app).listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});

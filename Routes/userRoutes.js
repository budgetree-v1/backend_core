const express = require("express");
const { authController } = require("../Controllers");
const jwt = require("../Services/jwt");
const Router = express.Router();

Router.post("/register", authController.register);
Router.post("/login", authController.login);
Router.post("/verifyOtp", jwt.verifyOtp, authController.verifyOtp);
Router.post("/panKyc", jwt.verify, authController.panKyc);

module.exports = Router;

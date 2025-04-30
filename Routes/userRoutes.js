const express = require("express");
const { authController } = require("../Controllers");
const Router = express.Router();

Router.post("/register", authController.register);
Router.post("/login", authController.login);
Router.post("/verifyOtp", authController.verifyOtp);

module.exports = Router;

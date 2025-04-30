const express = require("express");
const { authController } = require("../Controllers");
const Router = express.Router();

Router.post("/register", authController.register);

module.exports = Router;

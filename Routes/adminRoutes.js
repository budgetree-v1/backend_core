const express = require("express");
const { authController, adminController } = require("../Controllers");
const jwt = require("../Services/jwt");
const Router = express.Router();

Router.post("/login", adminController.Login);
Router.post("/listServers", jwt.verifyAdmin, adminController.listServers);
Router.post("/updateServers", jwt.verifyAdmin, adminController.updateServers);
Router.post("/fetchPayoutTransaction", jwt.verifyAdmin, adminController.fetchPayoutTransaction);
Router.post("/fetchDocTransaction", jwt.verifyAdmin, adminController.fetchDocTransaction);
Router.post("/fetchUserDetails", jwt.verifyAdmin, adminController.fetchUserDetails);

module.exports = Router;

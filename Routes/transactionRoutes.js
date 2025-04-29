const express = require("express");
const { transactionController } = require("../Controllers");
const jwt = require("../Services/jwt");
const Router = express.Router();

Router.post("/singlePayout", jwt.verify, transactionController.singlePayout);
Router.post("/listTransaction", jwt.verify, transactionController.listTransaction);

module.exports = Router;

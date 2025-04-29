const express = require("express");
const { transactionController } = require("../Controllers");
const Router = express.Router();

Router.post("/singlePayout", transactionController.singlePayout);
Router.post("/listTransaction", transactionController.listTransaction);

module.exports = Router;

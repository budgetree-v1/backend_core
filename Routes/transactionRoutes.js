const express = require("express");
const { transactionController } = require("../Controllers");
const { uploadController } = require("../Controllers");
const jwt = require("../Services/jwt");
const Router = express.Router();

Router.post("/singlePayout", jwt.verify, transactionController.singlePayout);
Router.post("/bulkPayout", jwt.verify, uploadController.upload.single("file"), transactionController.bulkPayout);
Router.post("/addBenificiary", jwt.verify, transactionController.addBenificiary);
// Router.get("/benificiary", jwt.verify, transactionController.getBenificiary);
Router.get("/getBenificiaryList", jwt.verify, transactionController.getBenificiaryList);

Router.get("/listTransaction", jwt.verify, transactionController.listTransaction);

//webhooks
Router.post("/webhook/easbuzz/payout", transactionController.easebuzzPayout);

module.exports = Router;

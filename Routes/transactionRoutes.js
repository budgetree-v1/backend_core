const express = require("express");
const { transactionController } = require("../Controllers");
const { uploadController } = require("../Controllers");
const jwt = require("../Services/jwt");
const Router = express.Router();

Router.post("/singlePayout", jwt.verify, transactionController.singlePayout);
Router.post("/bulkPayout", jwt.verify, uploadController.upload.single("file"), transactionController.bulkPayout);
Router.get("/getBenificiaryList", jwt.verifyMember, jwt.verify, transactionController.getBenificiaryList);
Router.post("/addBeneficiary", jwt.verify, transactionController.addBeneficiary);
Router.get("/listTransaction", jwt.verify, transactionController.listTransaction);

//test -temo
Router.post("/pennylesstest", jwt.verify, transactionController.pennylesstest);
Router.post("/pennydroptest", jwt.verify, transactionController.pennydroptest);
//webhooks
Router.post("/webhook/easbuzz/payout", transactionController.easebuzzPayout);

module.exports = Router;

const express = require("express");
const { transactionController, VerificationController } = require("../Controllers");
const jwt = require("../Services/jwt");
const Router = express.Router();
const { uploadController } = require("../Controllers");

Router.post("/verifyPanLite", jwt.verify, VerificationController.verifyPanLite);
Router.post("/verifyPanPremium", jwt.verify, VerificationController.verifyPanPremium);
Router.post("/verifyGstin", jwt.verify, VerificationController.verifyGstin);
Router.post("/verifyAadhaar", jwt.verify, VerificationController.verifyAadhaar);
Router.post("/verifyAadhaarOtp", jwt.verify, VerificationController.verifyAadhaarOtp);
Router.post("/verifyOcrDoument", jwt.verify, uploadController.upload.single("file"), VerificationController.verifyOcrDoument);
Router.post("/verifyFaceMatch", jwt.verify, VerificationController.verifyFaceMatch);
Router.post("/verifyUan", jwt.verify, VerificationController.verifyUan);

module.exports = Router;

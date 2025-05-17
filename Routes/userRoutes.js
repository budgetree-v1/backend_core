const express = require("express");
const { authController } = require("../Controllers");
const jwt = require("../Services/jwt");
const Router = express.Router();

Router.post("/register", authController.register);
Router.post("/login", authController.login);
Router.post("/verifyOtp", jwt.verifyOtp, authController.verifyOtp);
Router.post("/panKyc", jwt.verify, authController.panKyc);

Router.post("/createMember", jwt.verify, authController.createMember);
Router.post("/listMembers", jwt.verify, authController.listMembers);
Router.post("/updateMember", jwt.verify, authController.updateMember);

Router.post("/member/Login", authController.memberLogin);
Router.post("/member/VerifyOtp", jwt.verifyOtp, authController.memberOtpVerify);

module.exports = Router;

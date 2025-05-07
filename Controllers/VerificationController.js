const { successResponse, failedResponse, noAccess } = require("../Configs");
const db = require("../Models");
const { panLiteHandler, panPremiumHandler, gstinHandler, aadhaarSentOtpHandler, aadhaarOtpVerifyHandler, ocrHandler, uanHandler } = require("../Services/Handler/verification");
const jwt = require("../Services/jwt");
require("dotenv").config();

module.exports = {
  verifyPanLite: async (req, res) => {
    try {
      let { id } = req.token;

      let user = await db.User.findOne({ _id: id });
      if (!user) return res.send({ ...failedResponse, message: noAccess });

      let { pan } = req.body;

      let response = await panLiteHandler({ pan: pan, uId: id, name: "xxx", dob: "xx" });
      if (response.success) {
        return res.send({ ...successResponse, message: response.message || "Document verified", result: response.data });
      } else {
        return res.send({ ...failedResponse, message: response.message ? "Partner - " + response.message : "Document verification failed" });
      }
    } catch (error) {
      console.log(error);
      return res.send({ ...failedResponse, message: error.message || "Document verification failed" });
    }
  },
  verifyPanPremium: async (req, res) => {
    try {
      let { id } = req.token;

      let user = await db.User.findOne({ _id: id });
      if (!user) return res.send({ ...failedResponse, message: noAccess });

      let { pan } = req.body;

      let response = await panPremiumHandler({ pan: pan, uId: id, name: "xxx" });
      if (response.success) {
        return res.send({ ...successResponse, message: response.message || "Document verified", result: response.data });
      } else {
        return res.send({ ...failedResponse, message: response.message ? "Partner - " + response.message : "Document verification failed" });
      }
    } catch (error) {
      console.log(error);
      return res.send({ ...failedResponse, message: error.message || "Document verification failed" });
    }
  },
  verifyGstin: async (req, res) => {
    try {
      let { id } = req.token;

      let user = await db.User.findOne({ _id: id });
      if (!user) return res.send({ ...failedResponse, message: noAccess });

      let { gstin } = req.body;

      let response = await gstinHandler({ gstin: gstin, uId: id });

      if (response.success) {
        return res.send({ ...successResponse, message: response.message || "Document verified", result: response.data });
      } else {
        return res.send({ ...failedResponse, message: response.message ? "Partner - " + response.message : "Document verification failed" });
      }
    } catch (error) {
      console.log(error);
      return res.send({ ...failedResponse, message: error.message || "Document verification failed" });
    }
  },
  verifyAadhaar: async (req, res) => {
    try {
      let { id } = req.token;

      let user = await db.User.findOne({ _id: id });
      if (!user) return res.send({ ...failedResponse, message: noAccess });

      let { aadhaar } = req.body;

      let response = await aadhaarSentOtpHandler({ aadhaar: aadhaar, uId: id });

      if (response.success) {
        return res.send({ ...successResponse, message: response.message || "Document verified", result: response.data });
      } else {
        return res.send({ ...failedResponse, message: response.message ? "Partner - " + response.message : "Document verification failed" });
      }
    } catch (error) {
      console.log(error);
      return res.send({ ...failedResponse, message: error.message || "Document verification failed" });
    }
  },
  verifyAadhaarOtp: async (req, res) => {
    try {
      let { id } = req.token;

      let user = await db.User.findOne({ _id: id });
      if (!user) return res.send({ ...failedResponse, message: noAccess });

      let { otp, aadhaar } = req.body;

      let response = await aadhaarOtpVerifyHandler({ aadhaar: aadhaar, otp: otp, uId: id });

      if (response.success) {
        return res.send({ ...successResponse, message: response.message || "Document verified", result: response.data });
      } else {
        return res.send({ ...failedResponse, message: response.message ? "Partner - " + response.message : "Document verification failed" });
      }
    } catch (error) {
      console.log(error);
      return res.send({ ...failedResponse, message: error.message || "Document verification failed" });
    }
  },
  verifyOcrDoument: async (req, res) => {
    try {
      let { id } = req.token;

      let user = await db.User.findOne({ _id: id });
      if (!user) return res.send({ ...failedResponse, message: noAccess });

      const file = req.file;
      if (!file) return res.send({ ...failedResponse, message: "No file uploaded." });

      let { type } = req.body;
      // PAN, AADHAAR, DRIVING_LICENCE, VOTER_ID, PASSPORT, VEHICLE_RC, CANCELLED_CHEQUE, and INVOICE.
      console.log(file);

      let response = await ocrHandler({ path: file.path, type: type, uId: id });

      if (response.success) {
        return res.send({ ...successResponse, message: response.message || "Document verified", result: response.data });
      } else {
        return res.send({ ...failedResponse, message: response.message ? "Partner - " + response.message : "Document verification failed" });
      }
    } catch (error) {
      console.log(error);
      return res.send({ ...failedResponse, message: error.message || "Document verification failed" });
    }
  },
  verifyFaceMatch: async (req, res) => {
    try {
      let { id } = req.token;

      let user = await db.User.findOne({ _id: id });
      if (!user) return res.send({ ...failedResponse, message: noAccess });

      const file1 = req.files.file1;
      const file2 = req.files.file2;
      console.log(file1, file2);

      // if (!f) return res.send({ ...failedResponse, message: "No file uploaded." });

      let response = await ocrHandler({ path1: files.path, path2: "", uId: id });

      if (response.success) {
        return res.send({ ...successResponse, message: response.message || "Document verified", result: response.data });
      } else {
        return res.send({ ...failedResponse, message: response.message ? "Partner - " + response.message : "Document verification failed" });
      }
    } catch (error) {
      console.log(error);
      return res.send({ ...failedResponse, message: error.message || "Document verification failed" });
    }
  },
  verifyUan: async (req, res) => {
    try {
      let { id } = req.token;

      let user = await db.User.findOne({ _id: id });
      if (!user) return res.send({ ...failedResponse, message: noAccess });

      let { uan } = req.body;

      let response = await uanHandler({ uan: uan, uId: id });

      if (response.success) {
        return res.send({ ...successResponse, message: response.message || "Document verified", result: response.data });
      } else {
        return res.send({ ...failedResponse, message: response.message ? "Partner - " + response.message : "Document verification failed" });
      }
    } catch (error) {
      console.log(error);
      return res.send({ ...failedResponse, message: error.message || "Document verification failed" });
    }
  },
};

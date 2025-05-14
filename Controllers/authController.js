const { successResponse, failedResponse, noAccess } = require("../Configs");
const db = require("../Models");
const { panPremiumHandler } = require("../Services/Handler/verification");
const jwt = require("../Services/jwt");
require("dotenv").config();

module.exports = {
  register: async (req, res) => {
    try {
      let { phone } = req.body;
      console.log(phone);

      if (!phone) return res.send({ ...failedResponse, message: "Please enter valid phone" });
      const isValid = /^[6-9]\d{9}$/.test(phone);
      if (!isValid) return res.send({ ...failedResponse, message: "Invalid phone entered!" });

      let ck = await db.User.findOne({ phone: phone });
      console.log(ck);

      if (ck) return res.send({ ...failedResponse, message: "Phone already exist!" });

      let obj = {
        phone: phone,
      };

      obj = await jwt.generate(obj);
      console.log("obj", obj);

      //call otp service here rajat

      return res.send({ ...successResponse, message: "OTP sent", result: {}, token: obj });
    } catch (error) {
      console.log(error);
      return res.send({ ...failedResponse });
    }
  },

  login: async (req, res) => {
    try {
      let { phone } = req.body;
      if (!phone) return res.send({ ...failedResponse, message: "Please enter valid phone" });

      let ck = await db.User.findOne({ phone: phone });
      console.log(ck);
      if (!ck) return res.send({ ...failedResponse, message: noAccess });

      let obj = {
        phone: phone,
      };
      obj = await jwt.generate(obj);
      return res.send({ ...successResponse, message: "OTP sent", result: {}, token: obj });
    } catch (error) {
      console.log(error);
      return res.send({ ...failedResponse });
    }
  },
  verifyOtp: async (req, res) => {
    try {
      let { phone } = req.token;

      if (!phone) return res.send({ ...failedResponse, message: "Phone mandatory" });
      const isValid = /^[6-9]\d{9}$/.test(phone);
      if (!isValid) return res.send({ ...failedResponse, message: "Invalid phone entered!" });

      let { otp } = req.body;
      if (!otp) return res.send({ ...failedResponse, message: "OTP mandatory!" });
      const isValidOTP = /^\d{6}$/.test(otp);
      if (!isValidOTP) return res.send({ ...failedResponse, message: "Invalid OTP,Please check!" });
      if (process.env.ENVMODE == "dev") {
        if (otp !== "111111") return res.send({ ...failedResponse, message: "Invalid OTP,Please check!" });
      }

      //validate otp here rajat
      let ck = await db.User.findOne({ phone: phone });

      if (!ck) {
        let qry = {
          firstName: "",
          lastName: "",
          phone: phone,
          email: "",
          balance: 0,
          session: 0,
          isActive: true,

          btUpiMin: 0.1,
          btUpi24999: 0.1,
          btUpi49999: 0.1,
          btUpiMax: 0.1,

          btImpsMin: 0.1,
          btImps24999: 0.1,
          btImps49999: 0.1,
          btImpsMax: 0.1,

          btNeftMin: 0.1,
          btRtgsMin: 0.1,

          btPennyDrop: 0.1,
        };

        ck = await db.User.create(qry);
      }

      await db.User.updateOne({ _id: ck._id }, { session: ck.session + 1 });

      let obj = {
        id: ck._id,
        auth: true,
        user: 1,
        session: ck.session + 1,
      };
      obj = await jwt.generate(obj);
      return res.send({ ...successResponse, message: "OTP verified", result: ck, token: obj });
    } catch (error) {
      console.log(error);
      return res.send({ ...failedResponse });
    }
  },
  panKyc: async (req, res) => {
    try {
      let { id } = req.token;

      let user = await db.User.findOne({ _id: id });
      if (!user) return res.send({ ...failedResponse, message: noAccess });

      let { pan, name, email } = req.body;

      if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.send({ ...failedResponse, message: "If provided, email must be valid" });
      if (typeof pan !== "string" || !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan)) return res.send({ ...failedResponse, message: "If provided, pan must be valid" });
      if (!name) return res.send({ ...failedResponse, message: "Name value mandatory" });

      let ck = await db.User.findOne({ _id: id });

      //  panPremiumHandler: async ({ uId = "", pan = "", name = "", sendType = 1 }) => {

      let verifyPan = await panPremiumHandler({ uId: id, pan: pan, name: name, sendType: 3 });
      console.log(verifyPan);

      if (!verifyPan.success) {
        return res.send({ ...failedResponse, message: verifyPan.message || "Unable to verify your pan details!" });
      }

      let ckkyc = await db.UserKyc.create({
        User: id,
        pan: pan.toUpperCase() || "",
        address: verifyPan?.data?.address?.full_address || "",
        name: verifyPan?.data?.registered_name || "",
        dob: verifyPan?.data?.date_of_birth || "",
        gender: verifyPan?.data?.gender || "",
        panType: verifyPan?.data?.type || "",

        isKycVerified: 1, //1 yes 2 no
      });

      await db.User.updateOne({ _id: id }, { isKycVerified: 1, fullName: name });

      return res.send({ ...successResponse, message: "Kyc verified", result: ckkyc });
    } catch (error) {
      console.log(error);
      return res.send({ ...failedResponse });
    }
  },
};

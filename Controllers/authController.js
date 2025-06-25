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
        id: ck._id,
        session: ck.session ? 1 : 0, //if session is present then user is valid
        user: 1, //1 yes 0 no
      };
      obj = await jwt.generate(obj);
      return res.send({ ...successResponse, message: "OTP sent", result: {}, token: obj });
    } catch (error) {
      console.log(error);
      return res.send({ ...failedResponse });
    }
  },
  memberLogin: async (req, res) => {
    try {
      let { phone } = req.body;
      if (!phone) return res.send({ ...failedResponse, message: "Please enter valid phone" });

      let ck = await db.Member.findOne({ phone: phone, isActive: 1 });
      console.log(ck);
      if (!ck) return res.send({ ...failedResponse, message: noAccess });

      let obj = {
        phone: phone,
        isMember: 1,
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
  memberOtpVerify: async (req, res) => {
    try {
      let { phone, isMember } = req.token;
      if (isMember !== 1) return res.send({ ...failedResponse, message: noAccess });

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

      let ckMem = await db.Member.findOne({ phone: phone }).lean().select("-User -createdAt -updatedAt -__v");

      await db.Member.updateOne({ phone: phone }, { session: (ckMem.session ? ckMem.session : 0) + 1 }).lean();

      let obj = {
        id: ckMem._id,
        auth: true,
        isMember: 1,
        session: (ckMem.session ? ckMem.session : 0) + 1,
      };
      obj = await jwt.generate(obj);
      return res.send({ ...successResponse, message: "OTP verified", result: ckMem, token: obj });
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
  createMember: async (req, res) => {
    try {
      let { id } = req.token;

      let user = await db.User.findOne({ _id: id });
      if (!user) return res.send({ ...failedResponse, message: noAccess });

      let { phone, email, role } = req.body;

      if (!phone) return res.send({ ...failedResponse, message: "Please enter member phone number" });

      const isValid = /^[6-9]\d{9}$/.test(phone);
      if (!isValid) return res.send({ ...failedResponse, message: "Invalid phone entered!" });

      if (!role || (role !== 1 && role !== 2)) return res.send({ ...failedResponse, message: "Please enter member role" });

      let ckEx = await db.Member.countDocuments({ User: id, phone: phone });
      if (ckEx !== 0) return res.send({ ...failedResponse, message: "Member already exist" });

      let crt = await db.Member.create({
        User: id,
        role: role, //1 admin 2 viewer
        phone: phone,
        email: email || "",
        isActive: 1, //1 yes 2 no
      });

      return res.send({ ...successResponse, message: "Member created and activated", result: crt });
    } catch (error) {
      console.log(error);
      return res.send({ ...failedResponse });
    }
  },
  listMembers: async (req, res) => {
    try {
      let { id } = req.token;

      let user = await db.User.findOne({ _id: id });
      if (!user) return res.send({ ...failedResponse, message: noAccess });

      let { phone, role } = req.body;

      if (phone && phone !== "") {
        const isValid = /^[6-9]\d{9}$/.test(phone);
        if (!isValid) return res.send({ ...failedResponse, message: "Invalid phone entered!" });
      }
      if (role && role !== 1 && role !== 2) {
        return res.send({ ...failedResponse, message: "Invalid role entered" });
      }

      let ckEx = await db.Member.find({ User: id }).lean().select("-updatedAt -__v -User");

      return res.send({ ...successResponse, message: "Member list fetched", result: ckEx });
    } catch (error) {
      console.log(error);
      return res.send({ ...failedResponse });
    }
  },
  updateMember: async (req, res) => {
    try {
      let { id } = req.token;

      let user = await db.User.findOne({ _id: id });
      if (!user) return res.send({ ...failedResponse, message: noAccess });

      let { uId, isDeleteReq, role } = req.body;

      if (!uId) return res.send({ ...failedResponse, message: "Please select member!" });

      let ckEx = await db.Member.findOne({ User: id, _id: uId });
      if (!ckEx) return res.send({ ...failedResponse, message: "Member not exist" });
      if (isDeleteReq) {
        await db.Member.deleteOne({ User: id, _id: uId });
        return res.send({ ...successResponse, message: "Member deleted", result: ckEx });
      }

      if (role == 1 || role == 2) {
        await db.Member.updateOne({ User: id, _id: uId }, { role: role }).lean();
      }
      let ckMem = await db.Member.findOne({ User: id, _id: uId }).lean().select("-updatedAt -__v -User");
      return res.send({ ...successResponse, message: "Member access updated", result: ckMem });
    } catch (error) {
      console.log(error);
      return res.send({ ...failedResponse });
    }
  },
};

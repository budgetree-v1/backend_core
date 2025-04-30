const { successResponse, failedResponse, noAccess } = require("../Configs");
const db = require("../Models");
const jwt = require("../Services/jwt");
require("dotenv").config();

module.exports = {
  register: async (req, res) => {
    try {
      let { phone } = req.body;
      if (!phone) return res.send({ ...failedResponse, message: "Please enter valid phone" });

      let ck = await db.User.findOne({});
      console.log(ck);

      if (ck) return res.send({ ...failedResponse, message: "Phone already exist!" });

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
      };

      await db.User.create(qry);
      let obj = {
        phone: phone,
      };
      obj = jwt.generate(obj);

      //call otp service here rajat

      return res.send({ ...successResponse, message: "OTP sent", result: {}, token: obj });
    } catch (error) {}
  },
  login: async (req, res) => {
    try {
      let { phone } = req.body;
      if (!phone) return res.send({ ...failedResponse, message: "Please enter valid phone" });

      let ck = await db.User.findOne({ phone: phone, isActive: true });
      if (!ck) return res.send({ ...failedResponse, message: noAccess });

      let obj = {
        phone: phone,
      };
      obj = jwt.generate(obj);
      return res.send({ ...successResponse, message: "OTP sent", result: {}, token: obj });
    } catch (error) {}
  },
  verifyOtp: async (req, res) => {
    try {
      let { phone } = req.token;
      if (!phone) return res.send({ ...failedResponse, message: noAccess });

      let { otp } = req.body;
      if (!otp) return res.send({ ...failedResponse, message: "OTP mandatory!" });

      let ck = await db.User.findOne({ phone: phone, isActive: true });
      if (!ck) return res.send({ ...failedResponse, message: noAccess });

      //validate otp here rajat
      await db.User.updateOne({ _id: ck._id }, { session: ck.session + 1 });

      let obj = {
        id: ck._id,
        auth: true,
        user: 1,
        session: ck.session + 1,
      };
      obj = jwt.generate(obj);
      return res.send({ ...successResponse, message: "OTP sent", result: ck, token: obj });
    } catch (error) {}
  },
};

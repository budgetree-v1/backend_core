const jwt = require("jsonwebtoken");
const { failedResponse } = require("../Configs");
const { noAccess } = require("../Configs");
const db = require("../Models");
require("dotenv").config();
const Secrete = process.env.SEC || "test";

module.exports = {
  generateNonExpire: async obj => {
    try {
      const token = await jwt.sign(obj, Secrete);
      return token;
    } catch (error) {
      console.log(error);
      return false;
    }
  },
  generate: async obj => {
    try {
      const token = await jwt.sign(obj, Secrete, { expiresIn: "56h" });
      return token;
    } catch (error) {
      console.log(error);
      return false;
    }
  },
  verify: async (req, res, next) => {
    try {
      console.log("first verify here", req.headers);
      if (!req.headers || !req.headers.authorization) {
        return res.json({ ...failedResponse, statusCode: 401, message: noAccess });
      }
      let verify = null;
      if (req.token) {
        verify = req.token;
      } else {
        let token = req.headers.authorization;
        let n = token.split(" ")[1];

        if (!n) return res.json({ ...failedResponse, statusCode: 401, message: noAccess });
        token = token.replace("Bearer ", "");
        verify = jwt.verify(token, Secrete);
        console.log("verify", verify);

        if (!verify || !verify.id) {
          return res.json({ ...failedResponse, statusCode: 401, message: noAccess });
        }
        // if (!verify.user) {
        //   return res.json({ ...failedResponse, statusCode: 401, message: noAccess });
        // }

        if (verify.user == 1) {
          if (!verify.session) {
            return res.json({ ...failedResponse, statusCode: 401, message: noAccess });
          } else {
            let ck = await db.User.countDocuments({
              _id: verify.id,
              // session: verify.session,
            });
            console.log("verify user", ck);
            if (ck == 0) return res.json({ ...failedResponse, statusCode: 401, message: noAccess });
          }
        }
      }
      console.log("verify here", verify);
      req.token = verify;
      next();
    } catch (error) {
      console.log(error);
      return res.json({ ...failedResponse, statusCode: 401, message: noAccess });
    }
  },
  verifyMember: async (req, res, next) => {
    try {
      if (!req.headers || !req.headers.authorization) {
        return res.json({ ...failedResponse, statusCode: 401, message: noAccess });
      }
      let verify = null;

      var token = req.headers.authorization;

      var n = token.search("Bearer ");
      if (n < 0) return res.json({ ...failedResponse, statusCode: 401, message: noAccess });
      token = token.replace("Bearer ", "");
      verify = jwt.verify(token, Secrete);

      if (!verify || !verify.id) {
        return res.json({ ...failedResponse, statusCode: 401, message: noAccess });
      }
      if (verify.isMember !== 1) {
        return res.json({ ...failedResponse, statusCode: 401, message: noAccess });
      }
      let obj = {
        id: "",
        auth: true,
        user: 2,
      };

      if (!verify.session) {
        return res.json({ ...failedResponse, statusCode: 401, message: noAccess });
      } else {
        let ck = await db.Member.findOne({
          _id: verify.id,
          session: verify.session,
        });
        if (!ck) return res.json({ ...failedResponse, statusCode: 401, message: noAccess });

        let ckUser = await db.User.findOne({ _id: ck.User });
        if (!ckUser) return res.json({ ...failedResponse, statusCode: 401, message: noAccess });

        obj.id = ckUser._id;

        let ckAccess = await db.MemberAccess.findOne({ role: ck.role, endPoint: req.originalUrl, isActive: 1 });
        if (!ckAccess) return res.json({ ...failedResponse, statusCode: 401, message: "You are not permitted for this API" });
      }

      req.token = obj;
      next();
    } catch (error) {
      console.log(error);
      return res.json({ ...failedResponse, statusCode: 401, message: noAccess });
    }
  },
  verifyOtp: async (req, res, next) => {
    try {
      if (!req.headers || !req.headers.authorization) {
        return res.json({ ...failedResponse, statusCode: 401, message: noAccess });
      }
      let verify = null;
      if (req.token) {
        verify = req.token;
      } else {
        var token = req.headers.authorization;
        var n = token.search("Bearer ");
        if (n < 0) return res.json({ ...failedResponse, statusCode: 401, message: noAccess });
        token = token.replace("Bearer ", "");
        verify = jwt.verify(token, Secrete);
        console.log("verify", verify);
      }
      req.token = verify;
      next();
    } catch (error) {
      console.log(error);
      return res.json({ ...failedResponse, statusCode: 401, message: noAccess });
    }
  },
  verifyAdmin: async (req, res, next) => {
    try {
      if (!req.headers || !req.headers.authorization) {
        return res.json({ ...failedResponse, statusCode: 401, message: noAccess });
      }
      let verify = null;
      if (req.token) {
        verify = req.token;
      } else {
        var token = req.headers.authorization;
        var n = token.search("Bearer ");
        if (n < 0) return res.json({ ...failedResponse, statusCode: 401, message: noAccess });

        token = token.replace("Bearer ", "");
        verify = jwt.verify(token, Secrete);
        if (verify.isAdmin !== 1) return res.json({ ...failedResponse, statusCode: 401, message: noAccess });
        let ck = await db.Admin.findOne({ phone: verify.phone });
        if (!ck) return res.json({ ...failedResponse, statusCode: 401, message: "Invalid admin" });
        console.log("verify", verify);
      }
      req.token = verify;
      next();
    } catch (error) {
      console.log(error);
      return res.json({ ...failedResponse, statusCode: 401, message: noAccess });
    }
  },
};

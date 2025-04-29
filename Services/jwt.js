const jwt = require("jsonwebtoken");
const { failedResponse } = require("../Configs");
const { noAccess } = require("../Configs");
const db = require("../Models");
require("dotenv").config();
const Secrete = process.env.SEC || "test";

module.exports = {
  generateNonExpire: async (obj) => {
    try {
      const token = await jwt.sign(obj, Secrete);
      return token;
    } catch (error) {
      console.log(error);
      return false;
    }
  },
  generate: async (obj) => {
    try {
      const token = await jwt.sign(obj, Secrete, { expiresIn: "12h" });
      return token;
    } catch (error) {
      console.log(error);
      return false;
    }
  },
  verify: async (req, res, next) => {
    try {
      if (!req.headers || !req.headers.authorization) {
        return res.json({ ...failedResponse, statusCode: 401, message: noAccess });
      }
      let verify = null;
      if (req.token && req.token.isMember == true) {
        verify = req.token;
      } else {
        var token = req.headers.authorization;
        var n = token.search("Bearer ");
        if (n < 0) return res.json({ ...failedResponse, statusCode: 401, message: noAccess });
        token = token.replace("Bearer ", "");
        verify = jwt.verify(token, Secrete);

        if (!verify || !verify.id) {
          return res.json({ ...failedResponse, statusCode: 401, message: noAccess });
        }
        if (!verify.user) {
          return res.json({ ...failedResponse, statusCode: 401, message: noAccess });
        }

        if (verify.user == 1) {
          if (!verify.session) {
            return res.json({ ...failedResponse, statusCode: 401, message: noAccess });
          } else {
            let ck = await db.User.count({ _id: verify.id, session: verify.session });
            if (ck == 0) return res.json({ ...failedResponse, statusCode: 401, message: noAccess });
          }
        }
      }
      req.token = verify;
      next();
    } catch (error) {
      console.log(error);
      return res.json({ ...failedResponse, statusCode: 401, message: noAccess });
    }
  },
};

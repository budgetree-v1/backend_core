const { failedResponse, successResponse, noAccess } = require("../Configs");
const db = require("../Models");
const bcrypt = require("bcrypt");
const jwt = require("../Services/jwt");
const saltRounds = 10;

module.exports = {
  Login: async (req, res) => {
    try {
      let { phone, password } = req.body;
      if (!phone) return res.send({ ...failedResponse, message: "Admin phone number mandatory!" });
      if (!password) return res.send({ ...failedResponse, message: "Admin password mandatory!" });

      let ck = await db.Admin.findOne({ phone: phone });
      if (!ck) return res.send({ ...failedResponse, message: "Invalid admin phone!" });

      // let enc = await bcrypt.hash(password, saltRounds);
      let enc = bcrypt.compare(password, ck.password);
      console.log(enc, ck);

      let obj = {
        phone: phone,
        isAdmin: 1,
      };
      obj = await jwt.generate(obj);
      return res.send({ ...successResponse, message: "Logged in success!", result: { token: obj } });
    } catch (error) {
      console.log(error);
      return res.send({ ...failedResponse, message: error.message || "Failed to access this!" });
    }
  },
  updateServers: async (req, res) => {
    try {
      let { payoutServer, pennyDropServer, pennyLessServer, panLiteServer, panPremiumServer, gstinServer, aadhaarServer, ocrServer, uanServer } = req.body;

      let qry = {};
      if (payoutServer && payoutServer !== "") {
        payoutServer = payoutServer.toUpperCase();
        qry.payoutServer = payoutServer == "CASHFREE" ? 1 : payoutServer == "EASEBUZZ" ? 2 : 0;
      }

      if (pennyDropServer && pennyDropServer !== "") {
        pennyDropServer = pennyDropServer.toUpperCase();
        qry.pennyDropServer = pennyDropServer == "CASHFREE" ? 1 : pennyDropServer == "EASEBUZZ" ? 2 : 0;
      }

      if (pennyLessServer && pennyLessServer !== "") {
        pennyLessServer = pennyLessServer.toUpperCase();
        qry.pennyLessServer = pennyLessServer == "CASHFREE" ? 1 : pennyLessServer == "EASEBUZZ" ? 2 : 0;
      }

      if (panLiteServer && panLiteServer !== "") {
        panLiteServer = panLiteServer.toUpperCase();
        qry.panLiteServer = panLiteServer == "CASHFREE" ? 1 : panLiteServer == "EASEBUZZ" ? 2 : 0;
      }

      if (panPremiumServer && panPremiumServer !== "") {
        panPremiumServer = panPremiumServer.toUpperCase();
        qry.panPremiumServer = panPremiumServer == "CASHFREE" ? 1 : panPremiumServer == "EASEBUZZ" ? 2 : 0;
      }

      if (gstinServer && gstinServer !== "") {
        gstinServer = gstinServer.toUpperCase();
        qry.gstinServer = gstinServer == "CASHFREE" ? 1 : gstinServer == "EASEBUZZ" ? 2 : 0;
      }

      if (aadhaarServer && aadhaarServer !== "") {
        aadhaarServer = aadhaarServer.toUpperCase();
        qry.aadhaarServer = aadhaarServer == "CASHFREE" ? 1 : aadhaarServer == "EASEBUZZ" ? 2 : 0;
      }

      if (ocrServer && ocrServer !== "") {
        ocrServer = ocrServer.toUpperCase();
        qry.ocrServer = ocrServer == "CASHFREE" ? 1 : ocrServer == "EASEBUZZ" ? 2 : 0;
      }

      if (uanServer && uanServer !== "") {
        uanServer = uanServer.toUpperCase();
        qry.uanServer = uanServer == "CASHFREE" ? 1 : uanServer == "EASEBUZZ" ? 2 : 0;
      }
      await db.Server.updateOne({}, qry);
      let server = await db.Server.findOne().lean().select("-_id -__v -updatedAt");
      return res.send({ ...successResponse, message: "Fetch success!", result: server });
    } catch (error) {
      console.log(error);
      return res.send({ ...failedResponse, message: error.message || "Failed to access this!" });
    }
  },
  listServers: async (req, res) => {
    try {
      let server = await db.Server.findOne();
      let obj = {
        payoutServer: server && server.payoutServer == 1 ? "CASHFREE" : server.payoutServer == 2 ? "EASEBUZZ" : "NOT ADDED", //1 cashfree 2 easebuzz
        pennyDropServer: server && server.pennyDropServer == 1 ? "CASHFREE" : server.payoutServer == 2 ? "EASEBUZZ" : "NOT ADDED", //1 cashfree
        pennyLessServer: server && server.pennyLessServer == 1 ? "CASHFREE" : server.payoutServer == 2 ? "EASEBUZZ" : "NOT ADDED", //1 cashfree
        panLiteServer: server && server.panLiteServer == 1 ? "CASHFREE" : server.payoutServer == 2 ? "EASEBUZZ" : "NOT ADDED", //1 cashfree
        panPremiumServer: server && server.panPremiumServer == 1 ? "CASHFREE" : server.payoutServer == 2 ? "EASEBUZZ" : "NOT ADDED", //1 cashfree
        gstinServer: server && server.gstinServer == 1 ? "CASHFREE" : server.payoutServer == 2 ? "EASEBUZZ" : "NOT ADDED", //1 cashfree
        aadhaarServer: server && server.aadhaarServer == 1 ? "CASHFREE" : server.payoutServer == 2 ? "EASEBUZZ" : "NOT ADDED", //1 cashfree
        ocrServer: server && server.ocrServer == 1 ? "CASHFREE" : server.payoutServer == 2 ? "EASEBUZZ" : "NOT ADDED", //1 cashfree
        uanServer: server && server.uanServer == 1 ? "CASHFREE" : server.payoutServer == 2 ? "EASEBUZZ" : "NOT ADDED", //1 cashfree
      };
      return res.send({ ...successResponse, message: "Fetch success!", result: obj });
    } catch (error) {
      console.log(error);
      return res.send({ ...failedResponse, message: error.message || "Failed to access this!" });
    }
  },
  fetchPayoutTransaction: async (req, res) => {
    try {
      let { search } = req.body;
      if (!search) return res.send({ ...failedResponse, message: "search mandatory", result: [] });
      let ck = await db.Transaction.find({ txnId: { $regex: new RegExp(search, "i") } })
        .lean()
        .select("-_id -__v -updatedAt -createdAt")
        .sort({ createdAt: -1 });

      return res.send({ ...successResponse, message: "Fetch success!", result: ck });
    } catch (error) {
      console.log(error);
      return res.send({ ...failedResponse, message: error.message || "Failed to access this!" });
    }
  },
  fetchDocTransaction: async (req, res) => {
    try {
      let { search } = req.body;
      if (!search) return res.send({ ...failedResponse, message: "search mandatory", result: [] });
      let ck = await db.Verification.find({ txnId: { $regex: new RegExp(search, "i") } })
        .lean()
        .select("-_id -__v -updatedAt -createdAt")
        .sort({ createdAt: -1 });

      return res.send({ ...successResponse, message: "Fetch success!", result: ck });
    } catch (error) {
      console.log(error);
      return res.send({ ...failedResponse, message: error.message || "Failed to access this!" });
    }
  },
  fetchUserDetails: async (req, res) => {
    try {
      let { search } = req.body;
      if (!search) return res.send({ ...failedResponse, message: "search mandatory", result: [] });
      let ck = await db.User.find({ phone: { $regex: new RegExp(search, "i") } })
        .lean()
        .select("-_id -__v -updatedAt -createdAt")
        .sort({ createdAt: -1 });

      if (!ck) return res.send({ ...failedResponse, message: "User details not found!", result: [] });
      return res.send({ ...successResponse, message: "Fetch success!", result: ck });
    } catch (error) {
      console.log(error);
      return res.send({ ...failedResponse, message: error.message || "Failed to access this!", result: [] });
    }
  },
};

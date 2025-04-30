const { failedResponse, successResponse, noAccess } = require("../Configs");
const db = require("../Models");
const { processPayout } = require("../Services/Handler/payout");

module.exports = {
  singlePayout: async (req, res) => {
    try {
      let { id } = req.token;
      let ck = await db.User.findOne({ User: id });
      if (!ck) res.send({ ...failedResponse, message: noAccess });

      let { amount, mode, note, beneAcc, beneIfsc, vpa } = req.body;

      let data = {
        uId: id,
        mode: mode,
        amount: amount,
        beneAcc: beneAcc,
        beneIfsc: beneIfsc,
        vpa: vpa,
        note: note,
      };

      let callServe = await processPayout(data);
      if (callServe.success) {
        res.send({ ...successResponse, message: "Payment processing!", result: callServe.data });
      } else {
        res.send({ ...failedResponse, message: "Payment initiation failed", result: callServe.data });
      }
    } catch (error) {
      console.log(error);
      res.send({ ...failedResponse, message: error.message || "Failed to access this!" });
    }
  },
  listTransaction: async (req, res) => {
    try {
      let { id } = req.token;
      let ck = await db.User.findOne({ User: id });
      if (!ck) res.send({ ...failedResponse, message: noAccess });
      let fnd = await db.Transaction.find({ User: id });
      res.send({ ...successResponse, message: "Transaction list fetched!", result: fnd });
    } catch (error) {
      console.log(error);
      res.send({ ...failedResponse, message: error.message || "Failed to access this!" });
    }
  },
};

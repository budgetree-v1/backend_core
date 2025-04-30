const { failedResponse, successResponse, noAccess } = require("../Configs");
const db = require("../Models");

module.exports = {
  singlePayout: async (req, res) => {
    try {
      res.send({ ...successResponse, message: "", result: {} });
    } catch (error) {
      console.log(error);
      res.send({
        ...failedResponse,
        message: error.message || "Failed to access this!",
      });
    }
  },

  listTransaction: async (req, res) => {
    try {
      let { id } = req.token;
      let ck = await db.User.findOne({ User: id });
      if (!ck) res.send({ ...failedResponse, message: noAccess });
      let fnd = await db.Transaction.find();
      res.send({ ...successResponse, message: "", result: fnd });
    } catch (error) {
      console.log(error);
      res.send({
        ...failedResponse,
        message: error.message || "Failed to access this!",
      });
    }
  },
};

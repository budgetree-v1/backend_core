const { failedResponse, successResponse, noAccess } = require("../Configs");
const db = require("../Models");
const { processPayout } = require("../Services/Handler/payout");
const { createBeneficiary, getBeneficiary } = require("../Services/cashfree");
const { readFile } = require("fs/promises");
const { parse } = require("csv-parse/sync");
const { pennyDropHandler } = require("../Services/Handler/pennyDrop");

module.exports = {
  singlePayout: async (req, res) => {
    try {
      let { id } = req.token;

      let ck = await db.User.findOne({ _id: id });
      if (!ck) return res.send({ ...failedResponse, message: noAccess });

      let { amount, mode, note, beneAcc, beneIfsc, vpa } = req.body;

      if (!amount || typeof amount !== "number" || amount <= 0) {
        return res.send({ ...failedResponse, message: "Invalid amount. It must be a number." });
      }

      if (!mode || !["upi", "imps", "neft", "rtgs"].includes(mode)) {
        return res.send({ ...failedResponse, message: "Invalid mode. It must be 'upi', 'imps','rtgs' or 'neft'." });
      }

      if (!beneAcc || beneAcc.length < 10) {
        return res.send({ ...failedResponse, message: "Invalid beneficiary account number." });
      }

      if (!beneIfsc || beneIfsc.length !== 11) {
        return res.send({ ...failedResponse, message: "Invalid IFSC code." });
      }

      if (vpa && !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(vpa)) {
        return res.send({ ...failedResponse, message: "Invalid VPA format." });
      }

      let data = {
        uId: id,
        mode: mode,
        amount: amount,
        beneAcc: beneAcc,
        beneIfsc: beneIfsc,
        vpa: vpa,
        note: note
      };

      let callServe = await processPayout(data);
      if (callServe.success) {
        res.send({ ...successResponse, message: "Payment processing!", result: callServe.data });
      } else {
        res.send({ ...failedResponse, message: callServe.message || "Payment initiation failed", result: callServe.data || {} });
      }
    } catch (error) {
      console.log(error);
      res.send({ ...failedResponse, message: error.message || "Failed to access this!" });
    }
  },

  bulkPayout: async (req, res) => {
    try {
      const { id } = req.token;

      const user = await db.User.findById(id);
      if (!user) {
        return res.send({ ...failedResponse, message: noAccess });
      }

      const file = req.file;
      if (!file) {
        return res.send({ ...failedResponse, message: "No file uploaded." });
      }

      const fileContent = await fs.readFile(file.path, "utf-8");
      const records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true
      });

      const savedRecords = await db.TransactionInitiate.insertMany(records);

      const results = await Promise.all(
        savedRecords.map(async item => {
          const payoutData = {
            uId: item._id,
            mode: item.TRANSFER_MODE,
            amount: item.AMOUNT,
            beneAcc: item.PAYEE_ACCOUNT_NUMBER,
            beneIfsc: item.PAYEE_IFSC,
            vpa: item.VPA || "",
            note: item.REMARKS
          };

          try {
            const response = await processPayout(payoutData);
            await db.TransactionInitiate.updateOne(
              { _id: item._id },
              {
                $set: {
                  status: true,
                  payoutResponse: response.data
                }
              }
            );
            return { id: item._id, status: "success", response: response.data };
          } catch (err) {
            await db.TransactionInitiate.updateOne(
              { _id: item._id },
              {
                $set: {
                  status: false,
                  errorMessage: err.message
                }
              }
            );
            return { id: item._id, status: "failed", response: err.message };
          }
        })
      );

      return res.status(200).json({
        message: "CSV processed",
        data: results
      });
    } catch (error) {
      console.error(error);
      return res.send({
        ...failedResponse,
        message: error.message || "Failed to access this!"
      });
    }
  },

  addBenificiary: async (req, res) => {
    try {
      let { id } = req.token;

      let callServe = await pennyDropHandler({ uId: id, beneAcc: "67326232762882", beneIfsc: "IDIB000K202" });
      return res.send({ ...successResponse, message: callServe });
    } catch (error) {
      console.log(error);
      return res.send({ ...failedResponse, message: error.message || "Failed to access this!" });
    }
  },
  // getBenificiary: async (req, res) => {
  //   try {
  //     let { id } = req.token;

  //     const { beneficiary_id, bank_account_number, bank_ifsc } = req.query;

  //     let callServe = await getBeneficiary(beneficiary_id, bank_account_number, bank_ifsc);
  //     if (callServe.success) {
  //       res.send({
  //         ...successResponse,
  //         message: "Beneficiary Added Successfully!",
  //         result: callServe.data,
  //       });
  //     } else {
  //       res.send({
  //         ...failedResponse,
  //         message: "Benificiary process failed",
  //         result: callServe.data,
  //       });
  //     }
  //   } catch (error) {
  //     console.log(error);
  //     res.send({
  //       ...failedResponse,
  //       message: error.message || "Failed to access this!",
  //     });
  //   }
  // },

  getBenificiaryList: async (req, res) => {
    try {
      let { id } = req.token;

      let user = await db.User.findOne({
        _id: id
      });
      if (!user)
        return res.send({
          ...failedResponse,
          message: noAccess
        });

      let { page, limit } = req.query;

      page = parseInt(req.query.page) || 1;
      limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const total = await db.Beneficiary.countDocuments({
        User: id
      });
      const callServe = await db.Beneficiary.find({
        User: id
      })
        .sort({
          createdAt: -1
        })
        .skip(skip)
        .limit(limit);

      return res.send({
        ...successResponse,
        message: "Beneficiary List!",
        result: callServe,
        totalPages: Math.ceil(total / limit),
        totalItems: total
      });
    } catch (error) {
      console.log(error);
      return res.send({
        ...failedResponse,
        message: error.message || "Failed to access this!"
      });
    }
  },
  listTransaction: async (req, res) => {
    try {
      let { id } = req.token;
      let { page, limit } = req.query;
      page = parseInt(page) || 1;
      limit = parseInt(limit) || 10;
      const skip = (page - 1) * limit;

      let user = await db.User.findOne({
        _id: id
      });
      if (!user)
        return res.send({
          ...failedResponse,
          message: noAccess
        });

      let transactions = await db.Transaction.find({
        User: id
      })
        .sort({
          createdAt: -1
        })
        .skip(skip)
        .limit(limit);

      const total = await db.Transaction.countDocuments({
        User: id
      });

      return res.send({
        ...successResponse,
        message: "Transaction list fetched!",
        result: transactions,
        totalPages: Math.ceil(total / limit),
        totalItems: total
      });
    } catch (error) {
      console.log(error);
      return res.send({
        ...failedResponse,
        message: error.message || "Failed to access this!"
      });
    }
  }
};

const { failedResponse, successResponse, noAccess, beneficiaryRef } = require("../Configs");
const db = require("../Models");
const { processPayout } = require("../Services/Handler/payout");
const { createBeneficiary, getBeneficiary } = require("../Services/cashfree");
const { readFile } = require("fs/promises");
const { parse } = require("csv-parse/sync");
const { pennyDropHandler, pennyLessHandler } = require("../Services/Handler/pennyDrop");

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
        note: note,
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
        skip_empty_lines: true,
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
            note: item.REMARKS,
          };

          try {
            const response = await processPayout(payoutData);
            await db.TransactionInitiate.updateOne(
              { _id: item._id },
              {
                $set: {
                  status: true,
                  payoutResponse: response.data,
                },
              }
            );
            return { id: item._id, status: "success", response: response.data };
          } catch (err) {
            await db.TransactionInitiate.updateOne(
              { _id: item._id },
              {
                $set: {
                  status: false,
                  errorMessage: err.message,
                },
              }
            );
            return { id: item._id, status: "failed", response: err.message };
          }
        })
      );

      return res.status(200).json({
        message: "CSV processed",
        data: results,
      });
    } catch (error) {
      console.error(error);
      return res.send({
        ...failedResponse,
        message: error.message || "Failed to access this!",
      });
    }
  },

  pennylesstest: async (req, res) => {
    try {
      let { id } = req.token;

      let callServe = await pennyLessHandler({ uId: id, beneAcc: "923010067137038", beneIfsc: "UTIB0000006" });
      return res.send({ ...successResponse, message: callServe });
    } catch (error) {
      console.log(error);
      return res.send({ ...failedResponse, message: error.message || "Failed to access this!" });
    }
  },
  pennydroptest: async (req, res) => {
    try {
      let { id } = req.token;

      let callServe = await pennyDropHandler({ uId: id, beneAcc: "923010067137038", beneIfsc: "UTIB0000006" });
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

      let user = await db.User.findOne({ _id: id });
      if (!user) return res.send({ ...failedResponse, message: noAccess });

      let { page, limit } = req.query;

      page = parseInt(req.query.page) || 1;
      limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const total = await db.Beneficiary.countDocuments({
        User: id,
      });
      const callServe = await db.Beneficiary.find({
        User: id,
      })
        .sort({
          createdAt: -1,
        })
        .skip(skip)
        .limit(limit)
        .lean()
        .select("-_id -__v -createdAt -updatedAt -bId -User");
      let arr = [];
      for (let bene of callServe) {
        let obj = {
          ...bene,
          status: bene.status == 1 ? "SUCCESS" : bene.status == 2 ? "PENDING" : "FAILED",
          benetype: bene.benetype == 1 ? "ACCOUNT" : "VPA",
        };
        arr = [...arr, obj];
      }
      return res.send({ ...successResponse, message: "Beneficiary List!", result: arr, totalPages: Math.ceil(total / limit), totalItems: total });
    } catch (error) {
      console.log(error);
      return res.send({
        ...failedResponse,
        message: error.message || "Failed to access this!",
      });
    }
  },
  addBeneficiary: async (req, res) => {
    try {
      let { id } = req.token;
      let user = await db.User.findOne({ _id: id });
      if (!user) return res.send({ ...failedResponse, message: noAccess });

      let { beneType, beneAcc, beneIfsc, beneName, benePhone, beneEmail, beneVpa, needToVerify } = req.body;

      if (beneType == 1) {
        if (!beneAcc || typeof beneAcc !== "string" || beneAcc.trim() === "") return res.send({ ...failedResponse, message: "Beneficiary account is mandatory" });
        if (!beneIfsc || typeof beneIfsc !== "string" || !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(beneIfsc.toUpperCase())) return res.send({ ...failedResponse, message: "Valid IFSC code is mandatory" });
        if (!beneName || typeof beneName !== "string" || beneName.trim().length < 3) return res.send({ ...failedResponse, message: "Beneficiary name is mandatory and must be at least 3 characters" });
      } else if (beneType == 2) {
        if (!beneVpa || typeof beneVpa !== "string" || !/^[\w.-]+@[\w.-]+$/.test(beneVpa)) return res.send({ ...failedResponse, message: "VPA must be valid (e.g., name@bank)" });
      } else {
        return res.send({ ...failedResponse, message: "Beneficiary type invalid!" });
      }

      if (benePhone && (typeof benePhone !== "string" || !/^[6-9]\d{9}$/.test(benePhone))) return res.send({ ...failedResponse, message: "Valid 10-digit mobile number is required" });
      if (beneEmail && (typeof beneEmail !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(beneEmail))) return res.send({ ...failedResponse, message: "If provided, email must be valid" });

      let crt = await db.Beneficiary.create({
        User: id,
        beneficiaryId: "",
        benetype: beneType,
        beneName: beneName,
        beneAccount: beneAcc,
        beneIfsc: beneIfsc,
        beneVpa: beneVpa,
        benePhone: benePhone,
        beneEmail: beneEmail,
        status: 2,
      });
      await db.Beneficiary.updateOne({ _id: crt._id }, { beneficiaryId: `${beneficiaryRef}${crt.bId}` });
      if (needToVerify == true) {
        let pless = await pennyLessHandler({ uId: id, beneAcc: beneAcc, beneIfsc: beneIfsc });
        if (pless.data.status == "FAILED") {
          let pdrop = await pennyDropHandler({ uId: id, beneAcc: beneAcc, beneIfsc: beneIfsc });
          if (pdrop.data.status == "FAILED") {
            await db.Beneficiary.deleteOne({ _id: crt._id }).lean();
            return res.send({ ...failedResponse, message: "Beneficiary addition failed!" });
          }
        }
      } else {
        await db.Beneficiary.updateOne({ _id: crt._id }, { status: 1 }).lean();
      }
      let bene = await db.Beneficiary.findOne({ _id: crt._id }).lean().select("-_id -__v -createdAt -updatedAt -bId -User");
      return res.send({ ...successResponse, message: "Beneficiary added!", result: bene });
    } catch (error) {
      console.log(error);
      return res.send({ ...failedResponse, message: error.message || "Failed to access this!" });
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
        _id: id,
      });
      if (!user) return res.send({ ...failedResponse, message: noAccess });

      let transactions = await db.Transaction.find({ User: id }).sort({ createdAt: -1 }).skip(skip).limit(limit);

      const total = await db.Transaction.countDocuments({
        User: id,
      });

      return res.send({ ...successResponse, message: "Transaction list fetched!", result: transactions, totalPages: Math.ceil(total / limit), totalItems: total });
    } catch (error) {
      console.log(error);
      return res.send({
        ...failedResponse,
        message: error.message || "Failed to access this!",
      });
    }
  },
  easebuzzPayout: async (req, res) => {
    try {
      let crt = await db.Webhook.create({
        api: "easebuzz/payout",
        data: JSON.stringify(req.body),
        txnId: "",
        heeader: "",
      });
      return res.send({ ...successResponse, message: "Success", result: {} });
    } catch (error) {
      console.log(error);
      return res.send({ ...failedResponse, message: error.message || "Failed to access this!" });
    }
  },
};

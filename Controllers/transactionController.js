const { failedResponse, successResponse, noAccess } = require("../Configs");
const db = require("../Models");
const { processPayout } = require("../Services/Handler/payout");
const { createBeneficiary, getBeneficiary } = require("../Services/cashfree");
const { readFile } = require("fs/promises");
const { parse } = require("csv-parse/sync");

module.exports = {
  singlePayout: async (req, res) => {
    try {
      let { id } = req.token;
      let ck = await db.User.findOne({ _id: id });
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
        res.send({
          ...successResponse,
          message: "Payment processing!",
          result: callServe.data,
        });
      } else {
        res.send({
          ...failedResponse,
          message: "Payment initiation failed",
          result: callServe.data,
        });
      }
    } catch (error) {
      console.log(error);
      res.send({
        ...failedResponse,
        message: error.message || "Failed to access this!",
      });
    }
  },

  bulkPayout: async (req, res) => {
    try {
      const uploadedFile = req.file;

      if (!uploadedFile) {
        return res.status(400).json({ message: "No file uploaded." });
      }

      // Read file content from disk
      const fileContent = await readFile(uploadedFile.path, "utf-8");

      // Parse CSV content
      const records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
      });
      const savedData = await db.TransactionInitiate.insertMany(records);

      //SEND MONEY USING SINGLE PAY
      const payoutPromises = savedData.map((item) => {
        const payoutData = {
          uId: item._id,
          mode: item.TRANSFER_MODE,
          amount: item.AMOUNT,
          beneAcc: item.PAYEE_ACCOUNT_NUMBER,
          beneIfsc: item.PAYEE_IFSC,
          vpa: item.VPA || "",
          note: item.REMARKS,
        };

        return processPayout(payoutData)
          .then(async (response) => {
            console.log("succ", response);
            await db.TransactionInitiate.updateOne(
              { _id: item._id },
              {
                $set: {
                  status: true,
                  payoutResponse: response.data,
                },
              }
            );
            return {
              id: item._id,
              status: "success",
              response: response.data,
            };
          })
          .catch(async (err) => {
            console.log("err", err);
            await db.TransactionInitiate.updateOne(
              { _id: item._id },
              {
                $set: {
                  status: false,
                  errorMessage: err.message,
                },
              }
            );
            return {
              id: item._id,
              status: "failed",
              response: err.message,
            };
          });
      });

      const results = await Promise.all(payoutPromises);

      return res.status(200).json({ message: "CSV parsed", data: results });

      // let { id } = req.token;
      // let ck = await db.User.findOne({ _id: id });
      // if (!ck) res.send({ ...failedResponse, message: noAccess });

      // let { amount, mode, note, beneAcc, beneIfsc, vpa } = req.body;

      // let data = {
      //   uId: id,
      //   mode: mode,
      //   amount: amount,
      //   beneAcc: beneAcc,
      //   beneIfsc: beneIfsc,
      //   vpa: vpa,
      //   note: note,
      // };

      // let callServe = await processPayout(data);
      // if (callServe.success) {
      //   res.send({
      //     ...successResponse,
      //     message: "Payment processing!",
      //     result: callServe.data,
      //   });
      // } else {
      //   res.send({
      //     ...failedResponse,
      //     message: "Payment initiation failed",
      //     result: callServe.data,
      //   });
      // }
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
      let fnd = await db.Transaction.find({ User: id });
      res.send({
        ...successResponse,
        message: "Transaction list fetched!",
        result: fnd,
      });
    } catch (error) {
      console.log(error);
      res.send({
        ...failedResponse,
        message: error.message || "Failed to access this!",
      });
    }
  },

  addBenificiary: async (req, res) => {
    try {
      let { id } = req.token;

      const { beneficiary_name } = req.body;
      if (!beneficiary_name) {
        throw new Error("Beneficiary name are required.");
      }
      const data = req.body;

      let callServe = await createBeneficiary({ uid: id, ...data });
      console.log("callserver", callServe);

      if (callServe.success) {
        await db.Beneficiary.create({ User: id, ...callServe.data });
        res.send({
          ...successResponse,
          message: "Beneficiary Added Successfully!",
          result: callServe.data,
        });
      } else {
        res.send({
          ...failedResponse,
          message: "Benificiary process failed",
          result: callServe.data,
        });
      }
    } catch (error) {
      console.log(error);
      res.send({
        ...failedResponse,
        message: error.message || "Failed to access this!",
      });
    }
  },

  getBenificiary: async (req, res) => {
    try {
      let { id } = req.token;

      const { beneficiary_id, bank_account_number, bank_ifsc } = req.query;

      let callServe = await getBeneficiary(
        beneficiary_id,
        bank_account_number,
        bank_ifsc
      );
      if (callServe.success) {
        res.send({
          ...successResponse,
          message: "Beneficiary Added Successfully!",
          result: callServe.data,
        });
      } else {
        res.send({
          ...failedResponse,
          message: "Benificiary process failed",
          result: callServe.data,
        });
      }
    } catch (error) {
      console.log(error);
      res.send({
        ...failedResponse,
        message: error.message || "Failed to access this!",
      });
    }
  },

  getBenificiaryList: async (req, res) => {
    try {
      let { id } = req.token;

      let callServe = await db.Beneficiary.find();
      if (callServe) {
        res.send({
          ...successResponse,
          message: "Beneficiary List!",
          result: callServe,
        });
      } else {
        res.send({
          ...failedResponse,
          message: "Benificiary process failed",
          result: callServe.data,
        });
      }
    } catch (error) {
      console.log(error);
      res.send({
        ...failedResponse,
        message: error.message || "Failed to access this!",
      });
    }
  },
};

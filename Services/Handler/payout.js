const { noAccess, txnRef, currentGst } = require("../../Configs");
const db = require("../../Models");
const { singlePayout } = require("../cashfree");
const { singlePayoutEasebuzz } = require("../easebuzz");

module.exports = {
  processPayout: async ({ uId = "", mode = "", amount = 0, beneAcc = "", beneIfsc = "", vpa = "", note = "", sendType = 1 }) => {
    try {
      let ck = await db.User.findOne({ _id: uId });

      if (!ck) return { success: false, message: noAccess };

      amount = parseFloat(parseFloat(amount).toFixed(2));

      if (!mode) return { success: false, message: "Mode mandatory!" };
      if (!amount || amount < 0)
        return {
          success: false,
          message: "Amount should be greater than or equal to 1!",
        };

      if (mode == "imps" || mode == "neft" || mode == "rtgs") {
        if (!beneAcc) return { success: false, message: "Account number mandatory!" };
        if (!beneIfsc) return { success: false, message: "Ifsc mandatory!" };
        if (mode == "rtgs") {
          if (amount < 200000) {
            return {
              status: false,
              message: `RTGS payment should be more than Rs.200000!`,
            };
          }
        }
      } else if (mode == "upi") {
        if (!vpa) return { success: false, message: "vpa mandatory!" };
      } else {
        return { success: false, message: "Invalid mode,Please check!" };
      }

      let qry = {
        User: uId,
        cusRef: "",
        txnType: 2, //1 credit 2 debit
        status: 3, //1 success 2 pending 3 failed
        utr: "",
        ref: "",
        txnId: "",
        message: note || "Transaction initiated!",
        amount: amount,
        charge: 0,
        gst: 0,
        totalCharge: 0,
        beforeBalance: ck.balance || 0,
        afterBalance: 0,
        paymentType: mode == "imps" || mode == "neft" || mode == "rtgs" ? 1 : 2, //1 account 2 upi 3 wallet
        mode: mode == "imps" ? 1 : mode == "neft" ? 2 : mode == "rtgs" ? 3 : 4, //1 imps 2 neft 3 rtgs 4 others

        beneAccount: beneAcc || "",
        beneIfsc: beneIfsc || "",
        beneName: "",
        benePhone: "",
        beneEmail: "",
        beneVpa: vpa || "",
        sendType: 1, //1 app 2 api

        partnerStatus: "",
        partnerMessage: "",
      };

      let crt = await db.Transaction.create(qry);

      let ref = `${txnRef}${crt.tId}`;
      await db.Transaction.updateOne({ _id: crt._id }, { txnId: ref });

      let charge = 0;
      if (mode.toLowerCase() == "upi") {
        if (parseFloat(amount) < 1000) {
          charge = ck.btUpiMin;
        } else if (parseFloat(amount) < 25000) {
          charge = ck.btUpi24999;
        } else if (parseFloat(amount) < 50000) {
          charge = ck.btUpi49999;
        } else {
          charge = ck.btUpiMax || 0;
        }
      } else if (mode.toLowerCase() == "imps") {
        if (parseFloat(amount) < 1000) {
          charge = ck.btImpsMin;
        } else if (parseFloat(amount) < 25000) {
          charge = ck.btImps24999;
        } else if (parseFloat(amount) < 50000) {
          charge = ck.btImps49999;
        } else {
          charge = ck.btImpsMax || 0;
        }
      } else if (mode.toLowerCase() == "neft") {
        charge = usD.btNeftMin || 0;
      } else {
        charge = usD.btRtgsMin || 0;
      }

      let totalCharge = 0;
      let gst = 0;

      //calculate price
      if (charge > 0 && currentGst != 0) {
        gst = (currentGst / 100) * charge;
        gst = parseFloat(gst.toFixed(2));
      }
      gst = gst;
      totalCharge = charge + gst;
      let totalAmount = parseFloat(parseFloat(amount).toFixed(2)) + parseFloat(totalCharge.toFixed(2));

      let ckb = await db.User.countDocuments({
        balance: { $gte: totalAmount },
        _id: uId,
      });

      console.log("ckb", ckb);
      if (ckb !== 0) {
        await db.Transaction.updateOne({ _id: crt._id }, { $set: { message: "Insufficient balance!" } });
        return { success: false, message: "Insufficiant balance!" };
      } else {
        await db.Admin.updateOne({ income: 1 }, { $inc: { balance: parseFloat(totalCharge.toFixed(2)) } });
        await db.User.updateOne({ _id: uId }, { $inc: { balance: -parseFloat(totalAmount.toFixed(2)) } }, { new: true }).lean();

        let server = 1;
        let sr = await db.Server.findOne({});
        if (sr) server = sr.payoutServer;

        let qry = {
          status: 3,
          message: "Payment initiated!",
          ref: "",
        };

        if (server == 1) {
          let pay = await singlePayout({
            mode: mode,
            amount: amount,
            txnId: ref,
            beneAcc: beneAcc,
            beneIfsc: beneIfsc,
            vpa: vpa,
          });
          if (!pay.success) {
            qry.message = "Payment faield!";
            qry.status = 3;
          } else {
            if (pay.data.status == "FAILED") {
              qry.message = "Payment faield!";
              qry.status = 3;
              qry.partnerStatus = pay.data?.status || "";
              qry.partnerMessage = pay.data?.status_description || "";

              await db.Admin.updateOne({ income: 1 }, { $inc: { balance: -parseFloat(totalCharge.toFixed(2)) } });
              await db.User.updateOne({ _id: uId }, { $inc: { balance: parseFloat(totalAmount.toFixed(2)) } }, { new: true }).lean();
            } else {
              qry.message = "Payment process pending!";
              qry.status = 2;
              qry.partnerStatus = pay.data?.status || "";
              qry.partnerMessage = pay.data?.status_description || "";
              qry.ref = pay.data?.cf_transfer_id || "";
            }
          }
        }
        if (server == 2) {
          let pay = await singlePayoutEasebuzz({
            mode: mode,
            amount: amount,
            txnId: ref,
            beneAcc: beneAcc,
            beneIfsc: beneIfsc,
            vpa: vpa,
          });
          if (!pay.success) {
            qry.message = "Payment faield!";
            qry.status = 3;
          } else {
            if (pay.data.status == "accepted") {
              qry.message = "Payment process pending!";
              qry.status = 2;
              qry.partnerStatus = pay.data?.status || "";
              qry.partnerMessage = pay.data?.narration || "";
              qry.ref = pay.data?.id || "";
            } else {
              qry.message = "Payment faield!";
              qry.status = 3;
              qry.partnerStatus = pay.data?.status || "";
              qry.partnerMessage = pay.data?.narration || "";

              await db.Admin.updateOne({ income: 1 }, { $inc: { balance: -parseFloat(totalCharge.toFixed(2)) } });
              await db.User.updateOne({ _id: uId }, { $inc: { balance: parseFloat(totalAmount.toFixed(2)) } }, { new: true }).lean();
            }
          }
        }
        await db.Transaction.updateOne({ _id: crt._id }, qry);
      }

      let ckt = await db.Transaction.findOne({ _id: crt._id });

      let out = {
        status: ckt.status == 1 ? "SUCCESS" : ckt.status == 2 ? "PENDING" : "FAILED",
        message: ckt.message,
        amount: ckt.amount,
        charge: ckt.charge,
        gst: ckt.gst,
        totalCharge: ckt.totalCharge,
        txnId: ckt.txnId,
      };

      return { success: true, data: out };
    } catch (error) {
      console.log("error", error);
      return {
        success: false,
        message: error.message || "Failed to process the payment!",
      };
    }
  },
};

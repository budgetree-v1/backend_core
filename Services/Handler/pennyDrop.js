const { noAccess, txnRef, currentGst, pennyDropPrice, pennyLessPrice } = require("../../Configs");
const db = require("../../Models");
const { pennyDrop, pennyLess } = require("../cashfree");

module.exports = {
  pennyDropHandler: async ({ uId = "", beneAcc = "", beneIfsc = "", sendType = 1 }) => {
    try {
      let ck = await db.User.findOne({ _id: uId });
      if (!ck) return { success: false, message: noAccess };
      let amount = 1;
      let qry = {
        User: uId,
        cusRef: "",
        txnType: 3, //1 credit 2 debit 3pennydrop
        status: 3, //1 success 2 pending 3 failed
        utr: "",
        ref: "",
        txnId: "",
        message: "Pennydrop initiated!",
        amount: amount,
        charge: 0,
        gst: 0,
        totalCharge: 0,
        beforeBalance: ck.balance || 0,
        afterBalance: 0,
        paymentType: 1, //1 account 2 upi 3 wallet
        mode: 1, //1 imps 2 neft 3 rtgs 4 others

        beneAccount: beneAcc || "",
        beneIfsc: beneIfsc || "",
        beneName: "",
        beneBank: "",
        benePhone: "",
        beneEmail: "",
        beneVpa: "",
        sendType: 1, //1 app 2 api

        partnerStatus: "",
        partnerMessage: "",
      };

      let crt = await db.Transaction.create(qry);

      let ref = `${txnRef}${crt.tId}`;
      await db.Transaction.updateOne({ _id: crt._id }, { txnId: ref });

      let charge = ck.btPennyDrop || pennyDropPrice;

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

      let ckb = await db.User.countDocuments({ balance: { $gte: totalAmount }, _id: uId });

      console.log("ckb", ckb);
      if (ckb == 0) {
        await db.Transaction.updateOne({ _id: crt._id }, { $set: { message: "Insufficient balance!" } });
        return { success: false, message: "Insufficiant balance!" };
      } else {
        await db.Admin.updateOne({ income: 1 }, { $inc: { balance: parseFloat(totalCharge.toFixed(2)) } });
        await db.User.updateOne({ _id: uId }, { $inc: { balance: -parseFloat(totalAmount.toFixed(2)) } }, { new: true }).lean();

        let server = 1;

        let sr = await db.Server.findOne({});
        if (sr) server = sr.pennyDropServer;

        let qry = {
          status: 3,
          message: "Payment initiated!",
          ref: "",
        };

        if (server == 1) {
          //accNo = "", ifsc = "", name = "", ref = ""
          let pay = await pennyDrop({
            ref: ref,
            accNo: beneAcc,
            ifsc: beneIfsc,
            name: "penny",
          });
          console.log("here", pay);

          if (!pay.success) {
            qry.message = pay.message ? "partner - " + pay.message : "Payment faield!";
            qry.status = 3;
            qry.partnerStatus = pay.data?.type || "";
            qry.partnerMessage = pay.data?.message || "";

            await db.Admin.updateOne({ income: 1 }, { $inc: { balance: -parseFloat(totalCharge.toFixed(2)) } });
            await db.User.updateOne({ _id: uId }, { $inc: { balance: parseFloat(totalAmount.toFixed(2)) } }, { new: true }).lean();
          } else {
            qry.message = "Payment process pending!";
            qry.status = 2;
            qry.partnerStatus = pay.data?.account_status || "";
            qry.partnerMessage = pay.data?.account_status_code || "";
            qry.ref = pay.data?.reference_id || "";
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
      return { success: true, data: out, message: qry.message };
    } catch (error) {
      console.log("error", error);
      return {
        success: false,
        message: error.message || "Failed to process the payment!",
      };
    }
  },
  pennyLessHandler: async ({ uId = "", beneAcc = "", beneIfsc = "", sendType = 1 }) => {
    try {
      let ck = await db.User.findOne({ _id: uId });
      if (!ck) return { success: false, message: noAccess };

      if (!beneAcc) return { success: false, message: "Account number mandatory" };
      if (!beneIfsc) return { success: false, message: "Ifsc mandatory" };

      let amount = 1;
      let qry = {
        User: uId,
        cusRef: "",
        txnType: 4, //1 credit 2 debit 3pennydrop 4 pennyless
        status: 3, //1 success 2 pending 3 failed
        utr: "",
        ref: "",
        txnId: "",
        message: "Pennyless initiated!",
        amount: amount,
        charge: 0,
        gst: 0,
        totalCharge: 0,
        beforeBalance: ck.balance || 0,
        afterBalance: 0,
        paymentType: 1, //1 account 2 upi 3 wallet
        mode: 1, //1 imps 2 neft 3 rtgs 4 others

        beneAccount: beneAcc || "",
        beneIfsc: beneIfsc || "",
        beneName: "",
        beneBank: "",
        benePhone: "",
        beneEmail: "",
        beneVpa: "",
        sendType: 1, //1 app 2 api

        partnerStatus: "",
        partnerMessage: "",
      };

      let crt = await db.Transaction.create(qry);

      let ref = `${txnRef}${crt.tId}`;
      await db.Transaction.updateOne({ _id: crt._id }, { txnId: ref });

      let charge = ck.btPennyDrop || pennyLessPrice;

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

      let ckb = await db.User.countDocuments({ balance: { $gte: totalAmount }, _id: uId });

      console.log("ckb", ckb);
      if (ckb == 0) {
        await db.Transaction.updateOne({ _id: crt._id }, { $set: { message: "Insufficient balance!" } });
        return { success: false, message: "Insufficiant balance!" };
      } else {
        await db.Admin.updateOne({ income: 1 }, { $inc: { balance: parseFloat(totalCharge.toFixed(2)) } });
        await db.User.updateOne({ _id: uId }, { $inc: { balance: -parseFloat(totalAmount.toFixed(2)) } }, { new: true }).lean();

        let server = 1;

        let sr = await db.Server.findOne({});
        if (sr) server = sr.pennyDropServer;

        let qry = {
          status: 3,
          message: "Payment initiated!",
          ref: "",
        };

        if (server == 1) {
          //accNo = "", ifsc = "", name = "", ref = ""
          let pay = await pennyLess({
            accNo: beneAcc,
            ifsc: beneIfsc,
            name: "penny",
          });
          console.log("here", pay);

          if (!pay.success) {
            qry.message = pay.message ? "partner - " + pay.message : "Payment faield!";
            qry.status = 3;
            qry.partnerStatus = pay.data?.type || "";
            qry.partnerMessage = pay.data?.message || "";

            await db.Admin.updateOne({ income: 1 }, { $inc: { balance: -parseFloat(totalCharge.toFixed(2)) } });
            await db.User.updateOne({ _id: uId }, { $inc: { balance: parseFloat(totalAmount.toFixed(2)) } }, { new: true }).lean();
          } else {
            qry.message = "Payment process pending!";
            qry.status = 1;
            qry.partnerStatus = pay.data?.account_status || "";
            qry.partnerMessage = pay.data?.account_status_code || "";
            qry.beneName = pay.data.name_at_bank || "";
            qry.beneBank = pay.data.bank_name || "";
            qry.ref = pay.data?.reference_id || "";
            qry.utr = pay.data?.utr || "";
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
      return { success: true, data: out, message: qry.message };
    } catch (error) {
      console.log("error", error);
      return {
        success: false,
        message: error.message || "Failed to process the payment!",
      };
    }
  },
};

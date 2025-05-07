const { panLitePrice, currentGst, noAccess, txnRef, verificationRef, panPremiumPrice, gstinPrice, aadhaarPrice, ocrVerifyPrice, uanPrice } = require("../../Configs");
const db = require("../../Models");
const { panLite, panPremium, aadhaarSendOtp, aadhaarVerifyOtp, documentOcr, UAN, gstinVerify } = require("../cashfree");

module.exports = {
  panLiteHandler: async ({ uId = "", pan = "", name = "", dob = "", sendType = 1 }) => {
    try {
      let ck = await db.User.findOne({ _id: uId });
      if (!ck) return { success: false, message: noAccess };

      if (!pan) return { success: false, message: "Pan mandatory" };
      if (!name) return { success: false, message: "name mandatory" };
      if (!dob) return { success: false, message: "dob mandatory" };
      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
      if (!panRegex.test(pan.toUpperCase())) return { success: false, message: "Invalid pan format" };

      let charge = panLitePrice;
      let totalCharge = 0;
      let gst = 0;

      //calculate price
      if (charge > 0 && currentGst != 0) {
        gst = (currentGst / 100) * charge;
        gst = parseFloat(gst.toFixed(2));
      }
      gst = gst;
      totalCharge = charge + gst;

      let crt = await db.Verification.create({
        User: uId,
        cusRef: "",
        status: 3, //1 success 2 pending 3 failed
        txnId: "",
        message: "Initiated",
        charge: charge,
        gst: gst,
        totalCharge: totalCharge,

        sendType: sendType, //1 app 2 api

        partnerStatus: "",
        partnerMessage: "",
        response: "",
        server: 1, //cashfree
        document: 1, //1 pan
        docNumber: pan.toUpperCase(),
        partnerReference: "",
      });

      let ref = `${verificationRef}${crt.vId}`;
      await db.Verification.updateOne({ _id: crt._id }, { txnId: ref });

      let ckb = await db.User.countDocuments({ balance: { $gte: totalCharge }, _id: uId });
      console.log("ckb", ckb);
      if (ckb == 0) {
        await db.Verification.updateOne({ _id: crt._id }, { $set: { message: "Insufficient balance!" } });
        return { success: false, message: "Insufficiant balance!" };
      } else {
        await db.Admin.updateOne({ income: 1 }, { $inc: { balance: parseFloat(totalCharge.toFixed(2)) } });
        await db.User.updateOne({ _id: uId }, { $inc: { balance: -parseFloat(totalCharge.toFixed(2)) } }, { new: true }).lean();
      }

      let server = 1;
      let sr = await db.Server.findOne({});
      if (sr) server = sr.panLiteServer;
      await db.Verification.updateOne({ _id: crt._id }, { server: server });

      if (server == 1) {
        let call = await panLite({ pan: pan, name: name, dob: dob, ref: ref });
        console.log(call);

        if (call.success) {
          await db.Verification.updateOne(
            { _id: crt._id },
            {
              response: JSON.stringify(call.data),
              status: 1,
              message: "verified",
              partnerReference: call.data?.reference_id || "",
            }
          );
          return { success: true, data: call.data };
        } else {
          await db.Verification.updateOne(
            { _id: crt._id },
            {
              charge: 0,
              gst: 0,
              totalCharge: 0,
              status: 3,
              message: "Failed to verify this document",
              partnerStatus: call.success || "",
              partnerMessage: call.message || "",
            }
          );

          await db.Admin.updateOne({ income: 1 }, { $inc: { balance: -parseFloat(totalCharge.toFixed(2)) } });
          await db.User.updateOne({ _id: uId }, { $inc: { balance: parseFloat(totalCharge.toFixed(2)) } }, { new: true }).lean();
          return { success: false, message: call.message || "" };
        }
      }
    } catch (error) {
      console.log(error);
      return { success: false, message: error.message || "Failed to access this service!" };
    }
  },
  panPremiumHandler: async ({ uId = "", pan = "", name = "", sendType = 1 }) => {
    try {
      let ck = await db.User.findOne({ _id: uId });
      if (!ck) return { success: false, message: noAccess };

      if (!pan) return { success: false, message: "Pan mandatory" };
      if (!name) return { success: false, message: "name mandatory" };
      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
      if (!panRegex.test(pan.toUpperCase())) return { success: false, message: "Invalid pan format" };

      let charge = panPremiumPrice;
      let totalCharge = 0;
      let gst = 0;

      //calculate price
      if (charge > 0 && currentGst != 0) {
        gst = (currentGst / 100) * charge;
        gst = parseFloat(gst.toFixed(2));
      }
      gst = gst;
      totalCharge = charge + gst;

      let crt = await db.Verification.create({
        User: uId,
        cusRef: "",
        status: 3, //1 success 2 pending 3 failed
        txnId: "",
        message: "Initiated",
        charge: charge,
        gst: gst,
        totalCharge: totalCharge,

        sendType: sendType, //1 app 2 api

        partnerStatus: "",
        partnerMessage: "",
        response: "",
        server: 1, //cashfree
        document: 2, //1 pan 2 pan premium
        docNumber: pan.toUpperCase(),
        partnerReference: "",
      });

      let ref = `${verificationRef}${crt.vId}`;
      await db.Verification.updateOne({ _id: crt._id }, { txnId: ref });

      let ckb = await db.User.countDocuments({ balance: { $gte: totalCharge }, _id: uId });
      console.log("ckb", ckb);
      if (ckb == 0) {
        await db.Verification.updateOne({ _id: crt._id }, { $set: { message: "Insufficient balance!" } });
        return { success: false, message: "Insufficiant balance!" };
      } else {
        await db.Admin.updateOne({ income: 1 }, { $inc: { balance: parseFloat(totalCharge.toFixed(2)) } });
        await db.User.updateOne({ _id: uId }, { $inc: { balance: -parseFloat(totalCharge.toFixed(2)) } }, { new: true }).lean();
      }

      let server = 1;
      let sr = await db.Server.findOne({});
      if (sr) server = sr.panPremiumServer;
      await db.Verification.updateOne({ _id: crt._id }, { server: server });

      if (server == 1) {
        let call = await panPremium({ pan: pan, name: name, ref: ref });
        console.log(call);

        if (call.success) {
          await db.Verification.updateOne(
            { _id: crt._id },
            {
              response: JSON.stringify(call.data),
              status: 1,
              message: "verified",
              partnerReference: "",
            }
          );
          return { success: true, data: call.data };
        } else {
          await db.Verification.updateOne(
            { _id: crt._id },
            {
              charge: 0,
              gst: 0,
              totalCharge: 0,
              status: 3,
              message: "Failed to verify this document",
              partnerStatus: call.success || "",
              partnerMessage: call.message || "",
            }
          );

          await db.Admin.updateOne({ income: 1 }, { $inc: { balance: -parseFloat(totalCharge.toFixed(2)) } });
          await db.User.updateOne({ _id: uId }, { $inc: { balance: parseFloat(totalCharge.toFixed(2)) } }, { new: true }).lean();
          return { success: false, message: call.message || "" };
        }
      }
    } catch (error) {
      console.log(error);
      return { success: false, message: error.message || "Failed to access this service!" };
    }
  },
  gstinHandler: async ({ uId = "", gstin = "", sendType = 1 }) => {
    try {
      let ck = await db.User.findOne({ _id: uId });
      if (!ck) return { success: false, message: noAccess };

      if (!gstin) return { success: false, message: "gstin mandatory" };
      const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

      if (!gstinRegex.test(gstin)) return { success: false, message: "Invalid gatin" };

      let charge = gstinPrice;
      let totalCharge = 0;
      let gst = 0;

      //calculate price
      if (charge > 0 && currentGst != 0) {
        gst = (currentGst / 100) * charge;
        gst = parseFloat(gst.toFixed(2));
      }
      gst = gst;
      totalCharge = charge + gst;

      let crt = await db.Verification.create({
        User: uId,
        cusRef: "",
        status: 3, //1 success 2 pending 3 failed
        txnId: "",
        message: "Initiated",
        charge: charge,
        gst: gst,
        totalCharge: totalCharge,

        sendType: sendType, //1 app 2 api

        partnerStatus: "",
        partnerMessage: "",
        response: "",
        server: 1, //cashfree
        document: 3, //1 pan 2 pan premium 3 gstin
        docNumber: gstin,
        partnerReference: "",
      });

      let ref = `${verificationRef}${crt.vId}`;
      await db.Verification.updateOne({ _id: crt._id }, { txnId: ref });

      let ckb = await db.User.countDocuments({ balance: { $gte: totalCharge }, _id: uId });
      console.log("ckb", ckb);
      if (ckb == 0) {
        await db.Verification.updateOne({ _id: crt._id }, { $set: { message: "Insufficient balance!" } });
        return { success: false, message: "Insufficiant balance!" };
      } else {
        await db.Admin.updateOne({ income: 1 }, { $inc: { balance: parseFloat(totalCharge.toFixed(2)) } });
        await db.User.updateOne({ _id: uId }, { $inc: { balance: -parseFloat(totalCharge.toFixed(2)) } }, { new: true }).lean();
      }

      let server = 1;
      let sr = await db.Server.findOne({});
      if (sr) server = sr.gstinServer;
      await db.Verification.updateOne({ _id: crt._id }, { server: server });

      if (server == 1) {
        let call = await gstinVerify({ gstin: gstin });
        console.log(call);

        if (call.success) {
          await db.Verification.updateOne(
            { _id: crt._id },
            {
              response: JSON.stringify(call.data),
              status: 1,
              message: "verified",
              partnerReference: "",
            }
          );
          return { success: true, data: call.data };
        } else {
          await db.Verification.updateOne(
            { _id: crt._id },
            {
              charge: 0,
              gst: 0,
              totalCharge: 0,
              status: 3,
              message: "Failed to verify this document",
              partnerStatus: call.success || "",
              partnerMessage: call.message || "",
            }
          );

          await db.Admin.updateOne({ income: 1 }, { $inc: { balance: -parseFloat(totalCharge.toFixed(2)) } });
          await db.User.updateOne({ _id: uId }, { $inc: { balance: parseFloat(totalCharge.toFixed(2)) } }, { new: true }).lean();
          return { success: false, message: call.message || "" };
        }
      }
    } catch (error) {
      console.log(error);
      return { success: false, message: error.message || "Failed to access this service!" };
    }
  },
  aadhaarSentOtpHandler: async ({ uId = "", aadhaar = "", sendType = 1 }) => {
    try {
      let ck = await db.User.findOne({ _id: uId });
      if (!ck) return { success: false, message: noAccess };

      if (!aadhaar) return { success: false, message: "aadhaar mandatory" };
      const regex = /^\d{12}$/;
      if (!regex.test(aadhaar)) return { success: false, message: "Invalid aadhaar" };

      let charge = aadhaarPrice;
      let totalCharge = 0;
      let gst = 0;

      //calculate price
      if (charge > 0 && currentGst != 0) {
        gst = (currentGst / 100) * charge;
        gst = parseFloat(gst.toFixed(2));
      }
      gst = gst;
      totalCharge = charge + gst;

      let crt = await db.Verification.create({
        User: uId,
        cusRef: "",
        status: 3, //1 success 2 pending 3 failed
        txnId: "",
        message: "Initiated",
        charge: charge,
        gst: gst,
        totalCharge: totalCharge,

        sendType: sendType, //1 app 2 api

        partnerStatus: "",
        partnerMessage: "",
        response: "",
        server: 1, //cashfree
        document: 4, //1 pan 2 pan premium 3 gstin 4 aadhaar
        docNumber: aadhaar,
        partnerReference: "",
      });

      let ref = `${verificationRef}${crt.vId}`;
      await db.Verification.updateOne({ _id: crt._id }, { txnId: ref });

      let ckb = await db.User.countDocuments({ balance: { $gte: totalCharge }, _id: uId });
      console.log("ckb", ckb);
      if (ckb == 0) {
        await db.Verification.updateOne({ _id: crt._id }, { $set: { message: "Insufficient balance!" } });
        return { success: false, message: "Insufficiant balance!" };
      } else {
        await db.Admin.updateOne({ income: 1 }, { $inc: { balance: parseFloat(totalCharge.toFixed(2)) } });
        await db.User.updateOne({ _id: uId }, { $inc: { balance: -parseFloat(totalCharge.toFixed(2)) } }, { new: true }).lean();
      }

      let server = 1;
      let sr = await db.Server.findOne({});
      if (sr) server = sr.aadhaarServer;
      await db.Verification.updateOne({ _id: crt._id }, { server: server });

      if (server == 1) {
        let call = await aadhaarSendOtp({ aadhaar: aadhaar });
        console.log(call);

        if (call.success) {
          await db.Verification.updateOne(
            { _id: crt._id },
            {
              response: JSON.stringify(call.data),
              status: 2,
              message: "verified",
              partnerReference: call.data.ref_id || "",
            }
          );
          return { success: true, data: call.data };
        } else {
          await db.Verification.updateOne(
            { _id: crt._id },
            {
              charge: 0,
              gst: 0,
              totalCharge: 0,
              status: 3,
              message: "Failed to verify this document",
              partnerStatus: call.success || "",
              partnerMessage: call.message || "",
            }
          );

          await db.Admin.updateOne({ income: 1 }, { $inc: { balance: -parseFloat(totalCharge.toFixed(2)) } });
          await db.User.updateOne({ _id: uId }, { $inc: { balance: parseFloat(totalCharge.toFixed(2)) } }, { new: true }).lean();
          return { success: false, message: call.message || "" };
        }
      }
    } catch (error) {
      console.log(error);
      return { success: false, message: error.message || "Failed to access this service!" };
    }
  },
  aadhaarOtpVerifyHandler: async ({ uId = "", otp = "", aadhaar = "" }) => {
    try {
      let ck = await db.User.findOne({ _id: uId });
      if (!ck) return { success: false, message: noAccess };

      if (!aadhaar) return { success: false, message: "aadhaar mandatory" };
      if (!otp) return { success: false, message: "otp mandatory" };
      const regex = /^\d{12}$/;
      if (!regex.test(aadhaar)) return { success: false, message: "Invalid aadhaar" };

      let crt = await db.Verification.findOne({ User: uId, status: 2, docNumber: aadhaar, partnerReference: { $exists: true } }).sort({ createdAt: -1 });
      if (!crt) return { success: false, message: "Please genetate OTP first" };

      let server = 1;
      let sr = await db.Server.findOne({});
      if (sr) server = sr.aadhaarServer;

      if (server == 1) {
        let call = await aadhaarVerifyOtp({ ref: crt.partnerReference, otp: otp });
        console.log(call);

        if (call.success) {
          await db.Verification.updateOne(
            { _id: crt._id },
            {
              response: JSON.stringify(call.data),
              status: 1,
              message: "verified",
              partnerReference: "",
            }
          );
          return { success: true, data: call.data };
        } else {
          await db.Verification.updateOne(
            { _id: crt._id },
            {
              charge: 0,
              gst: 0,
              totalCharge: 0,
              status: 3,
              message: "Failed to verify this document",
              partnerStatus: call.success || "",
              partnerMessage: call.message || "",
            }
          );
          return { success: false, message: call.message || "" };
        }
      }
    } catch (error) {
      console.log(error);
      return { success: false, message: error.message || "Failed to access this service!" };
    }
  },
  ocrHandler: async ({ uId = "", path = "", type = "", sendType = 1 }) => {
    try {
      let ck = await db.User.findOne({ _id: uId });
      if (!ck) return { success: false, message: noAccess };

      if (!path) return { success: false, message: "File mandatory" };
      if (type !== "PAN" && type !== "AADHAAR" && type !== "DRIVING_LICENCE" && type !== "VOTER_ID" && type !== "PASSPORT" && type !== "VEHICLE_RC" && type !== "CANCELLED_CHEQUE" && type !== "INVOICE") {
        return { success: false, message: "Invalid document type" };
      }
      let charge = ocrVerifyPrice;
      let totalCharge = 0;
      let gst = 0;

      //calculate price
      if (charge > 0 && currentGst != 0) {
        gst = (currentGst / 100) * charge;
        gst = parseFloat(gst.toFixed(2));
      }
      gst = gst;
      totalCharge = charge + gst;

      let crt = await db.Verification.create({
        User: uId,
        cusRef: "",
        status: 3, //1 success 2 pending 3 failed
        txnId: "",
        message: "Initiated",
        charge: charge,
        gst: gst,
        totalCharge: totalCharge,

        sendType: sendType, //1 app 2 api

        partnerStatus: "",
        partnerMessage: "",
        response: "",
        server: 1, //cashfree
        document: 5, //1 pan 2 pan premium 3 gstin 4 aadhaar 5 ocr
        docNumber: "",
        partnerReference: "",
      });

      let ref = `${verificationRef}${crt.vId}`;
      await db.Verification.updateOne({ _id: crt._id }, { txnId: ref });

      let ckb = await db.User.countDocuments({ balance: { $gte: totalCharge }, _id: uId });
      console.log("ckb", ckb);
      if (ckb == 0) {
        await db.Verification.updateOne({ _id: crt._id }, { $set: { message: "Insufficient balance!" } });
        return { success: false, message: "Insufficiant balance!" };
      } else {
        await db.Admin.updateOne({ income: 1 }, { $inc: { balance: parseFloat(totalCharge.toFixed(2)) } });
        await db.User.updateOne({ _id: uId }, { $inc: { balance: -parseFloat(totalCharge.toFixed(2)) } }, { new: true }).lean();
      }

      let server = 1;
      let sr = await db.Server.findOne({});
      if (sr) server = sr.ocrServer;
      await db.Verification.updateOne({ _id: crt._id }, { server: server });

      if (server == 1) {
        let call = await documentOcr({ ref: ref, docType: type, filePath: path });
        console.log(call);

        if (call.success) {
          await db.Verification.updateOne(
            { _id: crt._id },
            {
              response: JSON.stringify(call.data),
              status: 1,
              message: "verified",
              partnerReference: "",
            }
          );
          return { success: true, data: call.data };
        } else {
          await db.Verification.updateOne(
            { _id: crt._id },
            {
              charge: 0,
              gst: 0,
              totalCharge: 0,
              status: 3,
              message: "Failed to verify this document",
              partnerStatus: call.success || "",
              partnerMessage: call.message || "",
            }
          );

          await db.Admin.updateOne({ income: 1 }, { $inc: { balance: -parseFloat(totalCharge.toFixed(2)) } });
          await db.User.updateOne({ _id: uId }, { $inc: { balance: parseFloat(totalCharge.toFixed(2)) } }, { new: true }).lean();
          return { success: false, message: call.message || "" };
        }
      }
    } catch (error) {
      console.log(error);
      return { success: false, message: error.message || "Failed to access this service!" };
    }
  },
  uanHandler: async ({ uId = "", uan = "", sendType = 1 }) => {
    try {
      let ck = await db.User.findOne({ _id: uId });
      if (!ck) return { success: false, message: noAccess };

      if (!uan) return { success: false, message: "uan mandatory" };

      const regex = /^\d{12}$/;
      if (!regex.test(uan)) return { success: false, message: "Invalid uan" };

      let charge = uanPrice;
      let totalCharge = 0;
      let gst = 0;

      //calculate price
      if (charge > 0 && currentGst != 0) {
        gst = (currentGst / 100) * charge;
        gst = parseFloat(gst.toFixed(2));
      }
      gst = gst;
      totalCharge = charge + gst;

      let crt = await db.Verification.create({
        User: uId,
        cusRef: "",
        status: 3, //1 success 2 pending 3 failed
        txnId: "",
        message: "Initiated",
        charge: charge,
        gst: gst,
        totalCharge: totalCharge,

        sendType: sendType, //1 app 2 api

        partnerStatus: "",
        partnerMessage: "",
        response: "",
        server: 1, //cashfree
        document: 3, //1 pan 2 pan premium 3 gstin 4 aadhaar 5 ocr 6 face 7 uan
        docNumber: uan,
        partnerReference: "",
      });

      let ref = `${verificationRef}${crt.vId}`;
      await db.Verification.updateOne({ _id: crt._id }, { txnId: ref });

      let ckb = await db.User.countDocuments({ balance: { $gte: totalCharge }, _id: uId });
      console.log("ckb", ckb);
      if (ckb == 0) {
        await db.Verification.updateOne({ _id: crt._id }, { $set: { message: "Insufficient balance!" } });
        return { success: false, message: "Insufficiant balance!" };
      } else {
        await db.Admin.updateOne({ income: 1 }, { $inc: { balance: parseFloat(totalCharge.toFixed(2)) } });
        await db.User.updateOne({ _id: uId }, { $inc: { balance: -parseFloat(totalCharge.toFixed(2)) } }, { new: true }).lean();
      }

      let server = 1;
      let sr = await db.Server.findOne({});
      if (sr) server = sr.uanServer;
      await db.Verification.updateOne({ _id: crt._id }, { server: server });

      if (server == 1) {
        let call = await UAN({ uan: uan, ref: ref });
        console.log(call);

        if (call.success) {
          await db.Verification.updateOne(
            { _id: crt._id },
            {
              response: JSON.stringify(call.data),
              status: 1,
              message: "verified",
              partnerReference: "",
            }
          );
          return { success: true, data: call.data };
        } else {
          await db.Verification.updateOne(
            { _id: crt._id },
            {
              charge: 0,
              gst: 0,
              totalCharge: 0,
              status: 3,
              message: "Failed to verify this document",
              partnerStatus: call.success || "",
              partnerMessage: call.message || "",
            }
          );

          await db.Admin.updateOne({ income: 1 }, { $inc: { balance: -parseFloat(totalCharge.toFixed(2)) } });
          await db.User.updateOne({ _id: uId }, { $inc: { balance: parseFloat(totalCharge.toFixed(2)) } }, { new: true }).lean();
          return { success: false, message: call.message || "" };
        }
      }
    } catch (error) {
      console.log(error);
      return { success: false, message: error.message || "Failed to access this service!" };
    }
  },
};

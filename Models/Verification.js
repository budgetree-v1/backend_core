const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const AutoIncrement = require("mongoose-sequence")(mongoose);

const Verification = new Schema(
  {
    User: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    cusRef: String,
    status: Number, //1 success 2 pending 3 failed
    txnId: String,
    message: String,
    charge: Number,
    gst: Number,
    totalCharge: Number,

    sendType: Number, //1 app 2 api

    partnerStatus: String,
    partnerMessage: String,
    response: String,
    server: Number,
    docNumber: String,
    document: Number, //1 pan 2 pan premium 3 gstin 4 aadhaar 5 ocr 6 face 7 uan
    partnerReference: String,
    vId: Number,
  },
  {
    timestamps: true,
  }
);

Verification.plugin(AutoIncrement, { inc_field: "vId" });
module.exports = mongoose.model("Verification", Verification);

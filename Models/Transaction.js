const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Transaction = new Schema(
  {
    User: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    cusRef: String,
    txnType: Number, //1 credit 2 debit
    status: Number, //1 success 2 pending 3 failed
    utr: String,
    ref: String,
    txnId: String,
    message: String,
    amount: Number,
    charge: Number,
    gst: Number,
    totalCharge: Number,
    beforeBalance: Number,
    afterBalance: Number,
    paymentType: Number, //1 account 2 upi 3 wallet
    mode: Number, //1 imps 2 neft 3 rtgs

    beneAccount: String,
    beneIfsc: String,
    beneName: String,
    benePhone: String,
    beneEmail: String,
    beneVpa: String,

    sendType: Number, //1 app 2 api
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Transaction", Transaction);

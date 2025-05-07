const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Webhook = new Schema(
  {
    api: String,
    data: String,
    txnId: String,
    heeader: String
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Webhook", Webhook);

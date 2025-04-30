const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Wallet = new Schema(
  {
    User: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    balance: Number,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("wallet", Wallet);

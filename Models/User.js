const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const User = new Schema(
  {
    firstName: String,
    lastName: String,
    phone: String,
    email: String,
    balance: Number,
    isOtpSent: Number, //1 yes 2 no
    session: Number,

    btUpiMin: Number,
    btUpi24999: Number,
    btUpi49999: Number,
    btUpiMax: Number,

    btImpsMin: Number,
    btImps24999: Number,
    btImps49999: Number,
    btImpsMax: Number,

    btNeftMin: Number,
    btRtgsMin: Number,

    btPennyDrop: Number,
    btPennyLess: Number,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", User);

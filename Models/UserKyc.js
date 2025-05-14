const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserKyc = new Schema(
  {
    User: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    pan: String,
    address: String,
    name: String,
    dob: String,
    gender: String,
    panType: String,

    isKycVerified: Number, //1 yes 2 no
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("UserKyc", UserKyc);

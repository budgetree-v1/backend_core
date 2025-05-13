const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Server = new Schema(
  {
    payoutServer: Number, //1 cashfree 2 easebuzz
    pennyDropServer: Number, //1 cashfree
    pennyLessServer: Number, //1 cashfree
    panLiteServer: Number, //1 cashfree
    panPremiumServer: Number, //1 cashfree
    gstinServer: Number, //1 cashfree
    aadhaarServer: Number, //1 cashfree
    ocrServer: Number, //1 cashfree
    uanServer: Number, //1 cashfree
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Server", Server);

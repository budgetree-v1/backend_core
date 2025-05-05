const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Server = new Schema(
  {
    payoutServer: Number, //1 cashfree
    pennyDropServer: Number, //1 cashfree
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Server", Server);

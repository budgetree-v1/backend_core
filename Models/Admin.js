const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Admin = new Schema(
  {
    phone: String,
    password: String,
    income: Number,
    balance: Number,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Admin", Admin);

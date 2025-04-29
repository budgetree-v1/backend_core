const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const User = new Schema(
  {
    firstName: String,
    lastName: String,
    email: String,
    password: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", User);

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MemberAccess = new Schema(
  {
    endPoint: String,
    role: Number, //1 admin 2 viewer
    isActive: Number, //1 yes 2 no
    accessName: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("MemberAccess", MemberAccess);

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Member = new Schema(
  {
    User: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    role: Number, //1 admin 2 viewer
    phone: String,
    email: String,
    isActive: Number, //1 yes 2 no
    session: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Member", Member);

const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const AutoIncrement = require("mongoose-sequence")(mongoose);

const Beneficiary = new Schema(
  {
    User: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    beneficiaryId: String,
    benetype: Number, //1 account 2 vpa
    beneName: String,
    beneAccount: { type: String, trim: true },
    beneIfsc: { type: String, trim: true },
    beneVpa: { type: String, trim: true },
    benePhone: { type: String, trim: true },
    beneEmail: { type: String, trim: true, lowercase: true },
    status: Number, //1 success 2 pending 3 failed
    bId: Number,
  },
  {
    timestamps: true, // Adds createdAt & updatedAt
  }
);
Beneficiary.plugin(AutoIncrement, { inc_field: "bId" });
module.exports = mongoose.model("Beneficiary", Beneficiary);

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Beneficiary = new Schema(
  {
    User: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    beneficiary_id: String,
    beneficiary_name: String,
    bank_account_number: { type: String, trim: true },
    bank_ifsc: { type: String, trim: true },
    vpa: { type: String, trim: true },
    beneficiary_phone: { type: String, trim: true },
    beneficiary_email: { type: String, trim: true, lowercase: true },
    status: Number, //1 success 2 pending 3 failed
  },
  {
    timestamps: true, // Adds createdAt & updatedAt
  }
);

module.exports = mongoose.model("Beneficiary", Beneficiary);

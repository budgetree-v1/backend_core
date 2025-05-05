const mongoose = require("mongoose");

const TransactionInitiate = new mongoose.Schema(
  {
    DEBIT_PROFILE_ID: {
      type: String,
      required: true,
    },
    DEBIT_ACCOUNT_NUMBER: {
      type: String,
      required: true,
    },
    TRANSFER_MODE: {
      type: String,
      enum: ["IMPS", "NEFT", "RTGS", "UPI", "AMAZON", "PAYTM"],
      required: true,
    },
    PAYEE_NAME: {
      type: String,
      required: true,
    },
    PAYEE_ACCOUNT_NUMBER: {
      type: String,
      required: true,
    },
    PAYEE_IFSC: {
      type: String,
      required: function () {
        return ["IMPS", "NEFT", "RTGS"].includes(this.TRANSFER_MODE);
      },
    },
    REMARKS: {
      type: String,
      maxlength: 32,
      required: true,
    },
    AMOUNT: {
      type: Number,
      required: true,
    },
    UNIQUE_REFERENCE: {
      type: String,
    },
    EMAIL_NOTIFICATION: {
      type: String, // or [String] if you allow multiple comma-separated
    },
    STATUS: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

module.exports = mongoose.model("TransactionInitiate", TransactionInitiate);

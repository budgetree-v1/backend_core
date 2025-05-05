const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const BeneficiarySchema = new Schema(
  {
    User: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Custom Unique Beneficiary ID (e.g., CASH_1746303937763_2252)
    beneficiary_id: {
      type: String,
      required: true,
      unique: true,
    },

    // Name
    beneficiary_name: {
      type: String,
      required: true,
      trim: true,
    },

    // Grouped Instrument Details
    beneficiary_instrument_details: {
      bank_account_number: { type: String, trim: true },
      bank_ifsc: { type: String, trim: true },
      vpa: { type: String, trim: true }, // UPI ID
    },

    // Grouped Contact Details
    beneficiary_contact_details: {
      beneficiary_phone: { type: String, trim: true },
      beneficiary_country_code: { type: String, trim: true },
      beneficiary_email: { type: String, trim: true, lowercase: true },
      beneficiary_address: { type: String, trim: true },
      beneficiary_city: { type: String, trim: true },
      beneficiary_state: { type: String, trim: true },
      beneficiary_postal_code: { type: String, trim: true },
    },

    // Status Field
    beneficiary_status: {
      type: String,
      enum: ["PENDING", "VERIFIED", "REJECTED"],
      default: "PENDING",
    },
  },
  {
    timestamps: true, // Adds createdAt & updatedAt
  }
);

module.exports = mongoose.model("Beneficiary", BeneficiarySchema);

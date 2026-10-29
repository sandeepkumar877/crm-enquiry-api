const mongoose = require("mongoose");

const enquirySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, lowercase: true, trim: true, index: true },
  phone: { type: String, trim: true, maxlength: 25, default: "" },
  courseInterest: { type: String, required: true, trim: true, maxlength: 120 },
  message: { type: String, trim: true, maxlength: 2000, default: "" },
  source: { type: String, trim: true, maxlength: 100, default: "public-form" },
  status: {
    type: String,
    enum: ["unclaimed", "claimed"],
    default: "unclaimed",
    index: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    default: null,
    index: true
  },
  claimedAt: { type: Date, default: null }
}, { timestamps: true });

enquirySchema.index({ status: 1, createdAt: -1 });
enquirySchema.index({ assignedTo: 1, createdAt: -1 });

module.exports = mongoose.model("Enquiry", enquirySchema);
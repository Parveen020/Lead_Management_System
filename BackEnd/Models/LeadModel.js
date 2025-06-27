import mongoose from "mongoose";

const scheduledCallSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    time: { type: String, required: true },
    callType: {
      type: String,
      enum: ["Referral", "Cold call", "Follow-up"],
    },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const leadSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String },
    phoneNumber: { type: String },
    receivedDate: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["Unassigned", "Ongoing", "Closed"],
      default: "Unassigned",
    },
    type: { type: String, enum: ["Hot", "Warm", "Cold"], default: "Warm" },
    leadSource: {
      type: String,
      enum: ["Referral", "Cold call", "Website", "Email"],
    },
    location: {
      type: String,
      required: true,
      enum: ["Pune", "Hyderabad", "Delhi"],
    },
    language: {
      type: String,
      required: true,
      enum: ["Hindi", "English", "Bengali", "Tamil"],
    },
    notes: { type: String },
    isScheduled: { type: Boolean, default: false },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
    scheduledCalls: [scheduledCallSchema], // Includes both date & time now
    tags: [{ type: String }],
    csvRef: { type: mongoose.Schema.Types.ObjectId, ref: "CSVRecord" },
  },
  { timestamps: true }
);

const LeadModel = mongoose.models.Lead || mongoose.model("Lead", leadSchema);
export default LeadModel;

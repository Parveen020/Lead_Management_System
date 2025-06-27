import mongoose from "mongoose";

const breakLogSchema = new mongoose.Schema(
  {
    startTime: { type: String },
    endTime: { type: String },
  },
  { _id: false }
);

const checkInLogSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    checkInTime: { type: String },
    checkOutTime: { type: String },
    breaks: [breakLogSchema],
  },
  { _id: false }
);

const employeeSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, reqyired: true },
    employeeId: { type: String, required: true, unique: true },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
    location: { type: String, required: true },
    preferredLocation: { type: String },
    preferredLanguage: { type: String },
    assignedLeads: [{ type: mongoose.Schema.Types.ObjectId, ref: "Lead" }],
    closedLeads: [{ type: mongoose.Schema.Types.ObjectId, ref: "Lead" }],
    checkInLogs: [checkInLogSchema],
    recentActivities: [
      {
        action: { type: String },
        timestamp: { type: Date, default: Date.now },
        meta: { type: String },
      },
    ],
  },
  { timestamps: true }
);

const EmployeeModel =
  mongoose.models.Employee || mongoose.model("Employee", employeeSchema);
export default EmployeeModel;

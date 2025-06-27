import mongoose from "mongoose";

const csvRecordSchema = new mongoose.Schema(
  {
    fileName: { type: String, required: true, unique: true },
    uploadDate: { type: Date, default: Date.now },

    totalLeads: { type: Number, required: true },
    assignedLeads: { type: Number, default: 0 },
    unassignedLeads: { type: Number, default: 0 },
    closedLeads: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const CSVRecord =
  mongoose.models.CSVRecord || mongoose.model("CSVRecord", csvRecordSchema);
export default CSVRecord;

import mongoose from "mongoose";

const adminSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: "admin" },
    permissions: {
      canDeleteEmployees: { type: Boolean, default: true },
      canConfirmUploads: { type: Boolean, default: true },
      canConfigureSystem: { type: Boolean, default: true },
    },
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

const AdminModel =
  mongoose.models.Admin || mongoose.model("Admin", adminSchema);
export default AdminModel;

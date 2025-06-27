import express from "express";
import multer from "multer";
import {
  uploadLeadsCSV,
  distributeLeadsByLocationLanguage,
  addTeamMember,
  updateTeamMember,
  deleteTeamMember,
  updateAdminProfile,
  getAllEmployees,
  getDashboardMetrics,
  getCSVRecords,
  updateActivity,
  createDummyAdmin,
  getAdminDetails,
  getAdminRecentActivity,
  syncCSVRecords,
  autoCloseStaleLeads,
} from "../Controllers/AdminControllers.js";

const storage = multer.diskStorage({
  destination: "uploads",
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "text/csv" ||
    file.mimetype === "application/vnd.ms-excel"
  ) {
    cb(null, true);
  } else {
    cb(new Error("Only CSV files are allowed"), false);
  }
};

const upload = multer({ storage: storage, fileFilter });

const AdminRouter = express.Router();

AdminRouter.post("/create-admin", createDummyAdmin);
AdminRouter.get("/get-admin", getAdminDetails);
AdminRouter.post("/upload-csv", upload.single("file"), uploadLeadsCSV);
AdminRouter.post("/distribute-leads", distributeLeadsByLocationLanguage);
AdminRouter.post("/add-employee", addTeamMember);
AdminRouter.put("/update-employee/:id", updateTeamMember);
AdminRouter.delete("/delete-employee/:id", deleteTeamMember);
AdminRouter.get("/get-all-employees", getAllEmployees);
AdminRouter.get("/get-dashboard-metrices", getDashboardMetrics);
AdminRouter.put("/update-profile/:id", updateAdminProfile);
AdminRouter.get("/csv-records", getCSVRecords);
AdminRouter.post("/update-recent-activity/:id", updateActivity);
AdminRouter.get("/get-recent-activity/:id", getAdminRecentActivity);
AdminRouter.put("/sync-csv-records", syncCSVRecords);
AdminRouter.post("/auto-close-leads", autoCloseStaleLeads);

export default AdminRouter;

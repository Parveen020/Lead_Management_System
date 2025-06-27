import express from "express";
import {
  startWork,
  endWork,
  startBreak,
  endBreak,
  updateLeadDetails,
  updateEmployeeProfile,
  getEmployeeById,
  updateEmployeeStatus,
  getAssignedLeads,
  getScheduledLeads,
  getEmployeeProfile,
  loginEmployee,
  recentAcitivity,
  updateActivity,
  autoUpdateLeadStatus,
} from "../Controllers/EmployeeControllers.js";

const EmployeeRouter = express.Router();

EmployeeRouter.post("/login", loginEmployee);
EmployeeRouter.put("/start-work/:employeeId", startWork);
EmployeeRouter.put("/end-work/:employeeId", endWork);
EmployeeRouter.put("/start-break/:employeeId", startBreak);
EmployeeRouter.put("/end-break/:employeeId", endBreak);
EmployeeRouter.put("/update-lead/:leadId", updateLeadDetails);
EmployeeRouter.put("/update-profile/:employeeId", updateEmployeeProfile);
EmployeeRouter.get("/get-employee/:employeeId", getEmployeeById);
EmployeeRouter.put("/update-employee-status/:employeeId", updateEmployeeStatus);
EmployeeRouter.get("/get-assigned-leads/:employeeId", getAssignedLeads);
EmployeeRouter.get("/get-scheduled-leads/:employeeId", getScheduledLeads);
EmployeeRouter.get("/get-employee-profile/:employeeId", getEmployeeProfile);
EmployeeRouter.get("/get-recent-activity/:employeeId", recentAcitivity);
EmployeeRouter.post("/update-recent-activity/:employeeId", updateActivity);
EmployeeRouter.put("/lead-auto-update/:employeeId", autoUpdateLeadStatus);
export default EmployeeRouter;

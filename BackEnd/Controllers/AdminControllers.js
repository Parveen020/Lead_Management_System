import fs from "fs";
import path from "path";
import csv from "csv-parser";
import bcrypt from "bcryptjs";
import LeadModel from "../Models/LeadModel.js";
import AdminModel from "../Models/AdminModel.js";
import EmployeeModel from "../Models/EmployeeModel.js";
import CSVRecord from "../Models/CSVRecord.js";

const createDummyAdmin = async (req, res) => {
  try {
    const existing = await AdminModel.findOne({ email: "admin@example.com" });
    if (existing) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    const dummyAdmin = new AdminModel({
      firstName: "Parveen",
      lastName: "Kumar",
      email: "parveen@example.com",
      password: "123456",
      role: "admin",
      permissions: {
        canDeleteEmployees: true,
        canConfirmUploads: true,
        canConfigureSystem: true,
      },
      recentActivities: [],
    });

    await dummyAdmin.save();

    res.status(201).json({
      message: "Dummy admin created successfully",
      admin: dummyAdmin,
    });
  } catch (error) {
    console.error("Error creating dummy admin:", error);
    res.status(500).json({ error: "Server error" });
  }
};

const getAdminDetails = async (req, res) => {
  try {
    const admin = await AdminModel.findOne().select("-password");

    if (!admin) {
      return res.status(404).json({ error: "Admin not found" });
    }

    res.status(200).json(admin);
  } catch (error) {
    console.error("Error fetching admin:", error);
    res.status(500).json({ error: "Failed to fetch admin details" });
  }
};

const generateEmployeeId = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let id = "";
  for (let i = 0; i < 13; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
};

const uploadLeadsCSV = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const leads = [];

    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on("data", (row) => {
        leads.push({
          name: row.name,
          email: row.email,
          phoneNumber: row.phoneNumber,
          type: row.type,
          leadSource: row.leadSource,
          location: row.location,
          language: row.language,
          status: "Unassigned",
        });
      })
      .on("end", async () => {
        try {
          fs.unlinkSync(req.file.path);

          if (leads.length === 0) {
            return res
              .status(400)
              .json({ error: "No valid leads found in the CSV file" });
          }

          const insertedLeads = await LeadModel.insertMany(leads);

          const csvStats = new CSVRecord({
            fileName: req.file.originalname,
            uploadDate: new Date(),
            totalLeads: insertedLeads.length,
            unassignedLeads: insertedLeads.length,
            assignedLeads: 0,
            closedLeads: 0,
            leadRefs: insertedLeads.map((lead) => lead._id),
          });

          await csvStats.save();

          await LeadModel.updateMany(
            { _id: { $in: insertedLeads.map((lead) => lead._id) } },
            { $set: { csvRef: csvStats._id } }
          );

          return res.status(200).json({
            message: "Leads uploaded and CSV record created successfully",
            totalLeads: insertedLeads.length,
          });
        } catch (dbError) {
          console.error("DB Error:", dbError);
          return res.status(500).json({
            error: "Failed to save leads or CSV record",
            details: dbError.message,
          });
        }
      });
  } catch (error) {
    console.error("Upload Error:", error);
    return res.status(500).json({
      error: "Upload failed",
      details: error.message,
    });
  }
};

const distributeLeadsByLocationLanguage = async (req, res) => {
  try {
    const employees = await EmployeeModel.find();
    const leads = await LeadModel.find({ assignedTo: null });

    let assignedCount = 0;
    const priorityLeads = [];
    const secondaryLeads = [];

    for (const lead of leads) {
      const leadLang = lead.language?.toLowerCase();
      const leadLoc = lead.location?.toLowerCase();

      const exactMatches = employees.filter((emp) => {
        const empLang = emp.preferredLanguage?.toLowerCase();
        const empLoc = emp.location?.toLowerCase();
        return empLang === leadLang && empLoc === leadLoc;
      });

      if (exactMatches.length > 0) {
        priorityLeads.push({ lead, matches: exactMatches });
      } else {
        const looseMatches = employees.filter((emp) => {
          const empLang = emp.preferredLanguage?.toLowerCase();
          const empLoc = emp.location?.toLowerCase();
          return empLang === leadLang || empLoc === leadLoc;
        });

        if (looseMatches.length > 0) {
          secondaryLeads.push({ lead, matches: looseMatches });
        }
      }
    }

    const allLeadsToAssign = [...priorityLeads, ...secondaryLeads];

    const employeeLeadCount = {};
    for (const emp of employees) {
      employeeLeadCount[emp._id.toString()] = emp.assignedLeads?.length || 0;
    }

    for (const item of allLeadsToAssign) {
      const { lead, matches } = item;

      matches.sort(
        (a, b) =>
          employeeLeadCount[a._id.toString()] -
          employeeLeadCount[b._id.toString()]
      );

      const selectedEmployee = matches[0];
      if (selectedEmployee) {
        lead.assignedTo = selectedEmployee._id;
        lead.status = "Ongoing";
        await lead.save();

        selectedEmployee.assignedLeads.push(lead._id);
        await selectedEmployee.save();

        employeeLeadCount[selectedEmployee._id.toString()]++;

        if (lead.csvRef) {
          await CSVRecord.findByIdAndUpdate(lead.csvRef, {
            $inc: {
              assignedLeads: 1,
              unassignedLeads: -1,
            },
          });
        }

        assignedCount++;
      }
    }

    return res.status(200).json({
      message: `Assigned ${assignedCount} leads based on language/location and equal distribution.`,
    });
  } catch (error) {
    console.error("Lead distribution error:", error);
    return res.status(500).json({
      error: "Failed to distribute leads",
      details: error.message,
    });
  }
};

const addTeamMember = async (req, res) => {
  try {
    const { firstName, lastName, email, location, language, password } =
      req.body;

    const existing = await EmployeeModel.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: "Employee already exists" });
    }

    const employee = new EmployeeModel({
      firstName,
      lastName,
      email,
      location,
      preferredLanguage: language,
      employeeId: generateEmployeeId(),
      password: lastName,
      status: "Inactive",
    });

    await employee.save();
    res.status(201).json({ message: "Employee added", employee });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to add employee" });
  }
};

const updateTeamMember = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    const updated = await EmployeeModel.findByIdAndUpdate(id, updatedData, {
      new: true,
    });

    if (!updated) {
      return res.status(404).json({ error: "Employee not found" });
    }

    res.status(200).json({ message: "Employee updated", updated });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to update employee", details: error.message });
  }
};

const deleteTeamMember = async (req, res) => {
  const { id } = req.params;

  try {
    const employee = await EmployeeModel.findById(id);
    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    const assignedLeads = await LeadModel.find({ assignedTo: employee._id });

    const ongoingLeads = assignedLeads.filter(
      (lead) => lead.status === "Ongoing"
    );

    // Find other employees to reassign non-ongoing leads
    const otherEmployees = await EmployeeModel.find({
      _id: { $ne: employee._id },
    });

    let empIndex = 0;

    for (let lead of assignedLeads) {
      if (lead.status === "Ongoing") {
        // Make it unassigned again
        lead.assignedTo = null;
      } else {
        // Reassign only non-ongoing leads
        const newEmp = otherEmployees[empIndex % otherEmployees.length];
        lead.assignedTo = newEmp._id;
        await newEmp.save();
        empIndex++;
      }

      await lead.save();
    }

    // Finally delete the employee
    await EmployeeModel.findByIdAndDelete(id);

    res
      .status(200)
      .json({ message: "Employee deleted. Leads reassigned/unassigned." });
  } catch (error) {
    console.error("Error deleting employee:", error);
    res.status(500).json({ error: "Failed to delete employee" });
  }
};

const getAllEmployees = async (req, res) => {
  try {
    const employees = await EmployeeModel.find();
    return res.status(200).json({ employees });
  } catch (error) {
    console.error("Error fetching employees:", error);
    return res.status(500).json({
      error: "Failed to fetch employees",
      details: error.message,
    });
  }
};

const updateAdminProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, password } = req.body;

    const admin = await AdminModel.findById(id);
    if (!admin) return res.status(404).json({ error: "Admin not found" });

    if (password) {
      admin.password = await bcrypt.hash(password, 10);
    }

    if (firstName) admin.firstName = firstName;
    if (lastName) admin.lastName = lastName;
    if (email) admin.email = email;

    await admin.save();
    res.status(200).json({ message: "Profile updated", admin });
  } catch (error) {
    res.status(500).json({ error: "Update failed", details: error.message });
  }
};

const getDashboardMetrics = async (req, res) => {
  try {
    const [csvStats, employees, leads] = await Promise.all([
      CSVRecord.find(),
      EmployeeModel.find(),
      LeadModel.find(),
    ]);

    const unassignedLeads = leads.filter(
      (l) => l.assignedTo === null && l.status === "Ongoing"
    ).length;

    const closedLeads = leads.filter((l) => l.status === "Closed").length;

    const assignedThisWeek = leads.filter((l) => {
      const created = new Date(l.createdAt);
      const now = new Date();
      const weekAgo = new Date(now.setDate(now.getDate() - 7));
      return l.status !== "Unassigned" && created >= weekAgo;
    }).length;

    const totalLeads = leads.length;
    const conversionRate =
      totalLeads > 0 ? ((closedLeads / totalLeads) * 100).toFixed(2) : "0.00";

    const activeSalespeople = employees.filter(
      (e) => e.status === "Active"
    ).length;

    const salesAnalytics = Array(8).fill(0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    leads.forEach((lead) => {
      if (lead.status === "Closed") {
        const closedDate = new Date(lead.updatedAt);
        closedDate.setHours(0, 0, 0, 0);

        for (let i = 0; i < 8; i++) {
          const compareDate = new Date(today);
          compareDate.setDate(compareDate.getDate() - (7 - i));

          if (closedDate.getTime() === compareDate.getTime()) {
            salesAnalytics[i]++;
            break;
          }
        }
      }
    });

    const employeeStats = await Promise.all(
      employees.map(async (emp) => {
        const assigned = leads.filter(
          (l) => l.assignedTo?.toString() === emp._id.toString()
        );
        const closed = assigned.filter((l) => l.status === "Closed");

        return {
          _id: emp._id,
          name: `${emp.firstName} ${emp.lastName}`,
          email: emp.email,
          employeeId: emp.employeeId,
          assignedLeads: assigned.length,
          closedLeads: closed.length,
          status: emp.status,
          location: emp.location,
          preferredLanguage: emp.preferredLanguage,
        };
      })
    );

    return res.status(200).json({
      cards: {
        unassignedLeads,
        assignedThisWeek,
        activeSalespeople,
        conversionRate: `${conversionRate}%`,
      },
      salesAnalytics,
      employeeStats,
      recentActivities: [],
    });
  } catch (error) {
    console.error("Dashboard metrics error:", error);
    return res.status(500).json({
      error: "Failed to fetch dashboard data",
      details: error.message,
    });
  }
};

const getCSVRecords = async (req, res) => {
  try {
    const records = await CSVRecord.find().sort({ createdAt: -1 });

    const formatted = await Promise.all(
      records.map(async (record) => {
        const leads = await LeadModel.find(
          { csvRef: record._id },
          "status assignedTo"
        );

        const total = leads.length;
        const assigned = leads.filter(
          (lead) => lead.status === "Ongoing" && lead.assignedTo !== null
        ).length;
        const closed = leads.filter((lead) => lead.status === "Closed").length;
        const unassigned = total - assigned - closed;

        return {
          id: record._id,
          fileName: record.fileName,
          uploadedAt: record.createdAt,
          totalLeads: total,
          assignedLeads: assigned,
          unassignedLeads: unassigned,
          closedLeads: closed,
        };
      })
    );

    res.status(200).json({ records: formatted });
  } catch (error) {
    console.error("CSV Record Fetch Error:", error);
    res.status(500).json({
      error: "Failed to fetch CSV records",
      details: error.message,
    });
  }
};

const syncCSVRecords = async (req, res) => {
  try {
    // Get all leads that have a CSV reference
    const leads = await LeadModel.find({ csvRef: { $ne: null } });

    // Map: { csvRefId: { assigned: x, unassigned: y, closed: z } }
    const statsMap = {};

    leads.forEach((lead) => {
      const csvId = lead.csvRef.toString();
      if (!statsMap[csvId]) {
        statsMap[csvId] = { assigned: 0, unassigned: 0, closed: 0 };
      }

      if (lead.status === "Closed") {
        statsMap[csvId].closed += 1;
      } else if (lead.assignedTo) {
        statsMap[csvId].assigned += 1;
      } else {
        statsMap[csvId].unassigned += 1;
      }
    });

    // Update each CSVRecord
    const updatePromises = Object.entries(statsMap).map(([csvId, stats]) =>
      CSVRecord.findByIdAndUpdate(csvId, {
        assignedLeads: stats.assigned,
        unassignedLeads: stats.unassigned,
        closedLeads: stats.closed,
      })
    );

    await Promise.all(updatePromises);

    res.status(200).json({
      message: "CSV records synced successfully",
      updated: Object.keys(statsMap).length,
    });
  } catch (error) {
    console.error("Failed to sync CSV stats:", error);
    res.status(500).json({ error: "Failed to sync CSV records" });
  }
};

const updateActivity = async (req, res) => {
  try {
    const { id } = req.params;
    const { logClosedLeads } = req.query;

    const body = req.body || {};
    const { action, meta } = body;

    // Handle special mode: auto-log closed leads
    if (logClosedLeads === "true") {
      const recentDate = new Date();
      recentDate.setDate(recentDate.getDate() - 8);

      const closedLeads = await LeadModel.find({
        status: "Closed",
        updatedAt: { $gte: recentDate },
      }).populate("assignedTo");

      const activities = closedLeads.map((lead) => ({
        action: "Closed Lead",
        meta: `${lead.assignedTo?.firstName} ${lead.assignedTo?.lastName} closed the lead ${lead.name}`,
        timestamp: new Date(),
      }));

      const admin = await AdminModel.findByIdAndUpdate(
        id,
        { $push: { recentActivities: { $each: activities } } },
        { new: true }
      );

      return res.status(200).json({
        message: "Closed lead activities logged",
        activities: admin.recentActivities,
      });
    }

    // Default: Manual logging
    if (!action) return res.status(400).json({ error: "Action is required" });

    const admin = await AdminModel.findByIdAndUpdate(
      id,
      {
        $push: {
          recentActivities: {
            action,
            meta,
            timestamp: new Date(),
          },
        },
      },
      { new: true }
    );

    if (!admin) return res.status(404).json({ error: "Admin not found" });

    res.status(200).json({
      message: "Activity logged",
      activities: admin.recentActivities,
    });
  } catch (error) {
    console.error("Admin activity logging error:", error);
    res.status(500).json({ error: "Failed to log activity" });
  }
};

const getAdminRecentActivity = async (req, res) => {
  try {
    const { id } = req.params;

    const admin = await AdminModel.findById(id);
    if (!admin) return res.status(404).json({ error: "Admin not found" });

    const activities = [...admin.recentActivities].reverse();
    res.status(200).json({ activities });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

const autoCloseStaleLeads = async (req, res) => {
  try {
    const now = new Date();

    const leads = await LeadModel.find({
      status: "Ongoing",
      isScheduled: true,
      scheduledCalls: { $exists: true, $not: { $size: 0 } },
    });

    let updatedCount = 0;

    for (const lead of leads) {
      const lastCall =
        lead.scheduledCalls[lead.scheduledCalls.length - 1]?.date;

      if (lastCall && new Date(lastCall).getTime() < now.getTime()) {
        lead.status = "Closed";
        lead.isScheduled = false;
        await lead.save();
        updatedCount++;
      }
    }

    res.status(200).json({
      message: `Auto-close complete. ${updatedCount} lead(s) closed.`,
    });
  } catch (error) {
    console.error("Auto-close error:", error);
    res.status(500).json({ error: "Failed to auto-close leads" });
  }
};

export {
  createDummyAdmin,
  getAdminDetails,
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
  getAdminRecentActivity,
  syncCSVRecords,
  autoCloseStaleLeads,
};

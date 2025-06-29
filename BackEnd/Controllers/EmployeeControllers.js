import EmployeeModel from "../Models/EmployeeModel.js";
import LeadModel from "../Models/LeadModel.js";
import CSVRecord from "../Models/CSVRecord.js";

const loginEmployee = async (req, res) => {
  try {
    const { email, password } = req.body;

    const employee = await EmployeeModel.findOne({ email });
    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    if (employee.password !== password) {
      return res.status(401).json({ error: "Invalid password" });
    }

    res.status(200).json({ success: true, employee });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Server error during login" });
  }
};

const getISTTime = () => {
  const istDate = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
  );
  return istDate.toTimeString().slice(0, 5); // "HH:MM"
};

const startWork = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const now = new Date();
    const timeNow = getISTTime();

    const employee = await EmployeeModel.findOne({ employeeId });
    if (!employee) return res.status(404).json({ error: "Employee not found" });

    const today = now.toISOString().split("T")[0];

    const existingLog = employee.checkInLogs.find(
      (log) => new Date(log.date).toISOString().split("T")[0] === today
    );

    if (existingLog) {
      existingLog.checkInTime = timeNow;
    } else {
      employee.checkInLogs.push({
        date: now,
        checkInTime: timeNow,
        breaks: [],
      });
    }

    employee.status = "Active";
    await employee.save();

    res
      .status(200)
      .json({ message: "Work started", checkInLogs: employee.checkInLogs });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to start work", details: error.message });
  }
};

const endWork = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const now = new Date();
    const timeNow = getISTTime();

    const employee = await EmployeeModel.findOne({ employeeId });
    if (!employee) return res.status(404).json({ error: "Employee not found" });

    const todayLog = employee.checkInLogs.find(
      (log) =>
        new Date(log.date).toISOString().split("T")[0] ===
        now.toISOString().split("T")[0]
    );

    if (!todayLog) {
      return res.status(400).json({ error: "No check-in found for today" });
    }

    todayLog.checkOutTime = timeNow;
    employee.status = "Inactive";
    await employee.save();

    res
      .status(200)
      .json({ message: "Work ended", checkInLogs: employee.checkInLogs });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to end work", details: error.message });
  }
};

const startBreak = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const now = new Date();
    const timeNow = getISTTime();

    const employee = await EmployeeModel.findOne({ employeeId });
    if (!employee) return res.status(404).json({ error: "Employee not found" });

    const todayLog = employee.checkInLogs.find(
      (log) =>
        new Date(log.date).toISOString().split("T")[0] ===
        now.toISOString().split("T")[0]
    );

    if (!todayLog) {
      return res.status(400).json({ error: "Check-in not found for today" });
    }

    todayLog.breaks.push({ startTime: timeNow });

    employee.status = "Inactive";
    await employee.save();

    res.status(200).json({ message: "Break started", breaks: todayLog.breaks });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to start break", details: error.message });
  }
};

const endBreak = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const now = new Date();
    const timeNow = getISTTime();

    const employee = await EmployeeModel.findOne({ employeeId });
    if (!employee) return res.status(404).json({ error: "Employee not found" });

    const todayLog = employee.checkInLogs.find(
      (log) =>
        new Date(log.date).toISOString().split("T")[0] ===
        now.toISOString().split("T")[0]
    );

    if (!todayLog || !todayLog.breaks.length) {
      return res.status(400).json({ error: "No break to end" });
    }

    const lastBreak = todayLog.breaks[todayLog.breaks.length - 1];

    if (!lastBreak.endTime) {
      lastBreak.endTime = timeNow;
      employee.status = "Active";
      await employee.save();
    }

    res.status(200).json({ message: "Break ended", breaks: todayLog.breaks });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to end break", details: error.message });
  }
};

const updateLeadDetails = async (req, res) => {
  try {
    const { leadId } = req.params;
    const { type, status, date, time, callType } = req.body;

    console.log("Received update request for lead:", leadId, req.body);

    const lead = await LeadModel.findById(leadId);
    if (!lead) return res.status(404).json({ error: "Lead not found" });

    const oldStatus = lead.status;

    // ❌ Reject updates if already closed
    if (oldStatus === "Closed") {
      return res.status(400).json({
        error: "Cannot update a closed lead.",
      });
    }

    // ✅ Validate and parse date/time
    let scheduledTime = null;
    if (date && time) {
      if (date.includes("T")) {
        scheduledTime = new Date(date); // already ISO
      } else {
        scheduledTime = new Date(`${date}T${time}`);
      }

      if (isNaN(scheduledTime.getTime())) {
        return res.status(400).json({ error: "Invalid date/time format" });
      }

      const now = new Date();
      if (scheduledTime.getTime() < now.getTime()) {
        return res
          .status(400)
          .json({ error: "Scheduled time must be in the future" });
      }

      // ❌ Conflict check
      if (lead.assignedTo) {
        const conflictLead = await LeadModel.findOne({
          assignedTo: lead.assignedTo,
          "scheduledCalls.date": scheduledTime,
          _id: { $ne: lead._id },
        });

        if (conflictLead) {
          return res.status(400).json({
            error: "Another lead is already scheduled at this time",
          });
        }
      }
    }

    // ✅ Apply type
    if (type) lead.type = type;

    // ✅ Prevent closing future scheduled leads
    if (status) {
      const lastScheduled =
        Array.isArray(lead.scheduledCalls) && lead.scheduledCalls.length > 0
          ? lead.scheduledCalls[lead.scheduledCalls.length - 1]
          : null;

      const now = new Date();

      if (
        status === "Closed" &&
        lead.isScheduled &&
        lastScheduled &&
        new Date(lastScheduled.date).getTime() > now.getTime()
      ) {
        return res.status(400).json({
          error:
            "Scheduled leads cannot be closed before the scheduled call time.",
        });
      }

      lead.status = status;
    }

    // ✅ Handle scheduled call
    if (scheduledTime) {
      lead.isScheduled = true;

      if (!Array.isArray(lead.scheduledCalls)) {
        lead.scheduledCalls = [];
      }

      if (lead.scheduledCalls.length > 0) {
        const latestCall = lead.scheduledCalls[lead.scheduledCalls.length - 1];
        latestCall.date = scheduledTime;
        latestCall.time = time;
        latestCall.callType = callType || latestCall.callType || "Follow-up";
      } else {
        lead.scheduledCalls.push({
          date: scheduledTime,
          time,
          callType: callType || "Follow-up",
        });
      }
    }

    // ✅ Auto-close check
    const lastScheduled =
      Array.isArray(lead.scheduledCalls) && lead.scheduledCalls.length > 0
        ? lead.scheduledCalls[lead.scheduledCalls.length - 1]
        : null;

    const nowUTC = new Date().getTime();

    if (
      lead.status === "Ongoing" &&
      lastScheduled &&
      new Date(lastScheduled.date).getTime() < nowUTC
    ) {
      console.log("Auto-closing lead — last scheduled call has passed.");
      lead.status = "Closed";
      lead.isScheduled = false;
    }

    await lead.save();

    // ✅ Update CSV stats
    if (status && status !== oldStatus && lead.csvRef) {
      const update = {};
      if (oldStatus === "Unassigned") update.$inc = { unassignedLeads: -1 };
      if (oldStatus === "Ongoing") update.$inc = { assignedLeads: -1 };
      if (oldStatus === "Closed") update.$inc = { closedLeads: -1 };

      if (status === "Unassigned")
        update.$inc = { ...update.$inc, unassignedLeads: 1 };
      if (status === "Ongoing")
        update.$inc = { ...update.$inc, assignedLeads: 1 };
      if (status === "Closed") update.$inc = { ...update.$inc, closedLeads: 1 };

      await CSVRecord.findByIdAndUpdate(lead.csvRef, update);
    }

    return res.status(200).json({ message: "Lead updated successfully", lead });
  } catch (error) {
    console.error("Update Lead Error:", error);
    return res.status(500).json({
      error: "Failed to update lead",
      details: error.message,
    });
  }
};

const updateEmployeeProfile = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const updates = req.body;

    const employee = await EmployeeModel.findOneAndUpdate(
      { employeeId },
      updates,
      { new: true }
    );
    res.status(200).json({ message: "Profile updated", employee });
  } catch (error) {
    res.status(500).json({ error: "Failed to update profile" });
  }
};

const getEmployeeById = async (req, res) => {
  try {
    const { employeeId } = req.params;

    const employee = await EmployeeModel.findOne({ employeeId });

    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    res.status(200).json({
      employeeId: employee.employeeId,
      checkInLogs: employee.checkInLogs || [],
      status: employee.status,
      name: `${employee.firstName} ${employee.lastName}`,
    });
  } catch (err) {
    console.error("Error fetching employee:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

const updateEmployeeStatus = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { status } = req.body;

    if (!["Active", "Inactive"].includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    const employee = await EmployeeModel.findOneAndUpdate(
      { employeeId },
      { status },
      { new: true }
    );

    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    res
      .status(200)
      .json({ message: "Status updated", status: employee.status });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to update status", details: error.message });
  }
};

const getAssignedLeads = async (req, res) => {
  try {
    const { employeeId } = req.params;

    const employee = await EmployeeModel.findOne({ employeeId });

    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    const leads = await LeadModel.find({
      _id: { $in: employee.assignedLeads },
    });

    return res.status(200).json({ leads });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Failed to fetch leads", details: error.message });
  }
};

const getScheduledLeads = async (req, res) => {
  try {
    const { employeeId } = req.params;

    const employee = await EmployeeModel.findOne({ employeeId }).select(
      "assignedLeads"
    );

    if (
      !employee ||
      !employee.assignedLeads ||
      employee.assignedLeads.length === 0
    ) {
      return res
        .status(404)
        .json({ error: "No leads found for this employee" });
    }

    const scheduledLeads = await LeadModel.find(
      {
        _id: { $in: employee.assignedLeads },
        isScheduled: true,
      },
      { name: 1, email: 1, phoneNumber: 1, scheduledCalls: 1 }
    ).sort({ updatedAt: -1 });

    res.status(200).json({ scheduledLeads });
  } catch (err) {
    console.error("Failed to fetch scheduled leads:", err);
    res.status(500).json({ error: "Failed to fetch scheduled leads" });
  }
};

const getEmployeeProfile = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const employee = await EmployeeModel.findOne({ employeeId }).select(
      "firstName lastName email password"
    );

    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    res.status(200).json({ employee });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
};

const recentAcitivity = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const employee = await EmployeeModel.findOne({ employeeId });
    if (!employee) return res.status(404).json({ error: "Employee not found" });

    const activities = [...employee.recentActivities].reverse();
    res.json(activities);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

const updateActivity = async (req, res) => {
  try {
    const { action, meta } = req.body;
    const { employeeId } = req.params;

    if (!action) {
      return res.status(400).json({ error: "Action is required" });
    }

    const employee = await EmployeeModel.findOneAndUpdate(
      { employeeId },
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

    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    if (action === "Closed Lead") {
      const admin = await AdminModel.findOne();

      if (admin) {
        await AdminModel.findByIdAndUpdate(
          { _id: admin._id },
          {
            $push: {
              recentActivities: {
                action: "Closed Lead",
                meta: `${employee.fistrName + " " + employee.lastName} closed lead - just now`,
                timestamp: new Date(),
              },
            },
          }
        );
      }
    }

    res.status(200).json({
      message: "Activity logged",
      activities: employee.recentActivities,
    });
  } catch (error) {
    console.error("Activity log error:", error);
    res.status(500).json({ error: "Failed to log activity" });
  }
};

const autoUpdateLeadStatus = async (req, res) => {
  try {
    const { employeeId } = req.params;

    const employee = await EmployeeModel.findOne({ employeeId });
    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    const nowIST = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));

    const leads = await LeadModel.find({
      _id: { $in: employee.assignedLeads },
      status: "Ongoing",
      isScheduled: true,
      scheduledCalls: { $exists: true, $not: { $size: 0 } },
    });

    let updatedCount = 0;
    const updatedLeads = [];

    for (const lead of leads) {
      const lastCall = lead.scheduledCalls[lead.scheduledCalls.length - 1]?.date;

      if (lastCall && new Date(lastCall).getTime() < nowIST.getTime()) {
        lead.status = "Closed";
        lead.isScheduled = false;
        await lead.save();
        updatedLeads.push(lead._id);
        updatedCount++;
      }
    }

    return res.status(200).json({
      message: `Auto-close complete. ${updatedCount} lead(s) closed for employee.`,
      updatedCount,
      updatedLeads,
    });
  } catch (error) {
    console.error("Auto update error:", error);
    res.status(500).json({ error: "Failed to auto-update lead statuses" });
  }
};

export {
  loginEmployee,
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
  recentAcitivity,
  updateActivity,
  autoUpdateLeadStatus,
};

import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export const EmployeeContext = createContext();

const EmployeeProvider = ({ children }) => {
  const BASE_URL = "https://lead-management-system-backend-if9k.onrender.com/employee";
  const [employeeId, setEmployeeId] = useState(() => {
    return localStorage.getItem("employeeId") || "";
  });

  const [status, setStatus] = useState("Inactive");
  const [checkInLogs, setCheckInLogs] = useState([]);
  const [dutyStatus, setDutyStatus] = useState(() => {
    return localStorage.getItem("dutyStatus") || "initial";
  });

  const [breakStatus, setBreakStatus] = useState(() => {
    return localStorage.getItem("breakStatus") || "initial";
  });

  const [checkInTime, setCheckInTime] = useState(() => {
    return localStorage.getItem("checkInTime") || "--:-- --";
  });

  const [checkOutTime, setCheckOutTime] = useState(() => {
    return localStorage.getItem("checkOutTime") || "--:-- --";
  });

  const [breakStart, setBreakStart] = useState(() => {
    return localStorage.getItem("breakStart") || "--:-- --";
  });

  const [breakEnd, setBreakEnd] = useState(() => {
    return localStorage.getItem("breakEnd") || "--:-- --";
  });

  const [breakHistory, setBreakHistory] = useState([]);
  const [assignedLeads, setAssignedLeads] = useState([]);
  const [scheduledLeads, setScheduledLeads] = useState([]);
  const [employeeProfile, setEmployeeProfile] = useState(null);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const [recentActivities, setRecentActivities] = useState([]);

  const handleLogin = async (email, password) => {
    try {
      const response = await axios.post(`${BASE_URL}/login`, {
        email,
        password,
      });
      if (response.data.success) {
        localStorage.setItem(
          "employee",
          JSON.stringify(response.data.employee)
        );

        localStorage.setItem("employeeId", response.data.employee.employeeId);
        setEmployeeId(response.data.employee.employeeId);
        return { success: true };
      } else {
        return { success: false, error: "Login failed" };
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || "Login failed. Please try again.",
      };
    }
  };

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/get-employee/${employeeId}`);
        setCheckInLogs(res.data.checkInLogs);
        updateStatus(res.data.checkInLogs);
        console.log("res.data.checkInLogs1:", res.data.checkInLogs);
        updateBreakHistory(res.data.checkInLogs);
      } catch (err) {
        console.error("Failed to fetch logs on mount:", err);
      }
    };

    fetchLogs();
    autoUpdateStatus(employeeId);
    fetchEmployeeProfile();
    fetchAssignedLeads();
    fetchScheduledLeads();
    fetchRecentActivities(employeeId);
  }, [employeeId]);

  const fetchRecentActivities = async (employeeId) => {
    try {
      const res = await axios.get(
        `${BASE_URL}/get-recent-activity/${employeeId}`
      );
      console.log("red", res);
      setRecentActivities(res.data);
    } catch (error) {
      console.error("Failed to fetch recent activities:", error);
    }
  };

  const timeAgo = (timestamp) => {
    const now = new Date();
    const past = new Date(timestamp);
    const seconds = Math.floor((now - past) / 1000);

    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? "s" : ""} ago`;
  };

  const logActivity = async (employeeId, action, meta) => {
    try {
      const res = await axios.post(
        `${BASE_URL}/update-recent-activity/${employeeId}`,
        {
          action,
          meta,
        }
      );
      setRecentActivities(res.data.activities.reverse());
    } catch (error) {
      console.error("Failed to log activity:", error);
    }
  };

  const fetchEmployeeProfile = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/get-employee-profile/${employeeId}`
      );
      setEmployeeProfile(res.data.employee);
    } catch (err) {
      console.error("Failed to fetch employee profile:", err);
    }
  };

  const updateEmployeeProfile = async (updatedData) => {
    try {
      const res = await axios.put(
        `${BASE_URL}/update-profile/${employeeId}`,
        updatedData
      );
      setEmployeeProfile(res.data.employee);
      return { success: true };
    } catch (err) {
      console.error("Failed to update profile:", err);
      return { success: false };
    }
  };

  const fetchScheduledLeads = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/get-scheduled-leads/${employeeId}`
      );
      setScheduledLeads(res.data.scheduledLeads);
    } catch (error) {
      console.error("Failed to fetch scheduled leads:", error);
    }
  };

  const fetchAssignedLeads = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/get-assigned-leads/${employeeId}`
      );
      setAssignedLeads(res.data.leads || []);
    } catch (error) {
      console.error("Failed to fetch assigned leads:", error);
    }
  };

  const updateStatus = (logs) => {
    const formatDate = (date) => new Date(date).toLocaleDateString("en-CA"); // YYYY-MM-DD
    const today = formatDate(new Date());

    const todayLog = logs.find((log) => formatDate(log.date) === today);
    console.log("Status Debug - Today Log:", todayLog);

    if (!todayLog) return setStatus("Inactive");

    const { checkInTime, checkOutTime, breaks } = todayLog;

    if (checkInTime && !checkOutTime) {
      const onBreak = breaks?.some((b) => !b.endTime);
      setStatus(onBreak ? "Inactive" : "Active");
    } else {
      setStatus("Inactive");
    }
  };

  const updateBreakHistory = (logs) => {
    const today = new Date().toISOString().split("T")[0];

    const breakEntries = logs
      .filter((log) => {
        const logDate = new Date(log.date).toISOString().split("T")[0];
        return Array.isArray(log.breaks);
      })
      .flatMap((log) =>
        log.breaks.map((b) => ({
          start: b.startTime,
          end: b.endTime || "--:-- --",
          date: new Date(log.date).toLocaleDateString("en-GB"),
        }))
      );
    console.log("breakEntried-", breakEntries);
    setBreakHistory(breakEntries);
  };

  const startWork = async () => {
    try {
      const res = await axios.put(`${BASE_URL}/start-work/${employeeId}`);
      console.log("status res-", res);
      setCheckInLogs(res.data.checkInLogs);
      updateStatus(res.data.checkInLogs);
    } catch (error) {
      console.error("Failed to start work:", error);
    }
  };

  const endWork = async () => {
    try {
      const res = await axios.put(`${BASE_URL}/end-work/${employeeId}`);
      console.log("status res-", res);
      setCheckInLogs(res.data.checkInLogs);
      updateStatus(res.data.checkInLogs);
    } catch (error) {
      console.error("Failed to end work:", error);
    }
  };

  const startBreak = async () => {
    try {
      const res = await axios.put(`${BASE_URL}/start-break/${employeeId}`);

      const updatedLogs = [...checkInLogs];
      const today = new Date().toISOString().split("T")[0];
      const todayLog = updatedLogs.find(
        (log) => new Date(log.date).toISOString().split("T")[0] === today
      );
      if (todayLog) {
        todayLog.breaks = res.data.breaks;
        setCheckInLogs(updatedLogs);
        updateBreakHistory(updatedLogs);
      }

      updateStatus(updatedLogs);
    } catch (error) {
      console.error("Failed to start break:", error);
    }
  };

  const endBreak = async () => {
    try {
      const res = await axios.put(`${BASE_URL}/end-break/${employeeId}`);

      const updatedLogs = [...checkInLogs];
      const today = new Date().toISOString().split("T")[0];
      const todayLog = updatedLogs.find(
        (log) => new Date(log.date).toISOString().split("T")[0] === today
      );
      if (todayLog) {
        todayLog.breaks = res.data.breaks;
        setCheckInLogs(updatedLogs);
        updateBreakHistory(updatedLogs);
      }

      updateStatus(updatedLogs);
    } catch (error) {
      console.error("Failed to end break:", error);
    }
  };

  const updateLead = async (leadId, data) => {
    console.log(data);
    try {
      const res = await axios.put(`${BASE_URL}/update-lead/${leadId}`, data);
      const updatedLead = res.data.lead;

      const employee = JSON.parse(localStorage.getItem("employee"));
      const employeeId = employee?.employeeId;

      if (employeeId) {
        let action = "Updated Lead";
        let meta = "";

        if (data.status === "Closed") {
          action = "Closed Lead";
          meta = `You closed the lead "${updatedLead.name}"`;
        } else if (data.status) {
          meta = `Changed status of "${updatedLead.name}" to ${data.status}`;
        } else if (data.type) {
          meta = `Marked lead "${updatedLead.name}" as ${data.type}`;
        }

        logActivity(employeeId, action, meta);
      }
      toast.success("Lead updated Succcessfully");
      return updatedLead;
    } catch (error) {
      toast.error(error.response.data.error);
    }
  };

  const formatTime = (utcString) => {
    if (!utcString) return "--:--";
    const date = new Date(utcString);
    return date.toLocaleTimeString("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false, // use true if you want AM/PM
    });
  };

  const formatDate = (isoString) => {
    if (!isoString) return "--/--/--";
    const date = new Date(isoString);
    return date.toLocaleDateString("en-GB");
  };

  const handleCheckInOut = async () => {
    const currentTime = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    if (dutyStatus === "on") {
      await endWork();
      setCheckOutTime(currentTime);
      localStorage.setItem("checkOutTime", currentTime);
      setDutyStatus("off");
      localStorage.setItem("dutyStatus", "off");

      setTimeout(() => {
        setDutyStatus("initial");
        localStorage.setItem("dutyStatus", "initial");
      }, 2000);
    } else {
      await startWork();
      setCheckInTime(currentTime);
      localStorage.setItem("checkInTime", currentTime);
      setCheckOutTime("");
      localStorage.setItem("checkOutTime", "--:-- --");
      setDutyStatus("on");
      localStorage.setItem("dutyStatus", "on");
    }
  };

  const handleBreak = async () => {
    const currentTime = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    if (breakStatus === "on") {
      await endBreak();
      await setEmployeeStatus("Active");

      setBreakEnd(currentTime);
      localStorage.setItem("breakEnd", currentTime);
      setBreakStatus("off");
      localStorage.setItem("breakStatus", "off");

      setTimeout(() => {
        setBreakStatus("initial");
        localStorage.setItem("breakStatus", "initial");
      }, 2000);
    } else {
      await startBreak();
      await setEmployeeStatus("Inactive");

      setBreakStart(currentTime);
      localStorage.setItem("breakStart", currentTime);
      setBreakEnd("");
      localStorage.setItem("breakEnd", "--:-- --");
      setBreakStatus("on");
      localStorage.setItem("breakStatus", "on");
    }
  };

  const setEmployeeStatus = async (newStatus) => {
    try {
      const res = await axios.put(
        `${BASE_URL}/update-employee-status/${employeeId}`,
        {
          status: newStatus,
        }
      );
      setStatus(res.data.status);
    } catch (error) {
      console.error("Failed to update employee status:", error);
    }
  };

  const autoUpdateStatus = async (employeeId) => {
    try {
      await axios.put(`${BASE_URL}/lead-auto-update/${employeeId}`);
    } catch (error) {
      console.error("Auto status update failed:", error);
    }
  };

  console.log("recent Activity - ", scheduledLeads);

  const contextValue = {
    employeeId,
    setEmployeeId,
    status,
    checkInLogs,
    startWork,
    endWork,
    startBreak,
    endBreak,
    updateLead,
    checkInTime,
    checkOutTime,
    breakStart,
    breakEnd,
    breakHistory,
    breakStatus,
    dutyStatus,
    formatDate,
    formatTime,
    handleBreak,
    handleCheckInOut,
    assignedLeads,
    fetchAssignedLeads,
    scheduledLeads,
    fetchScheduledLeads,
    employeeProfile,
    fetchEmployeeProfile,
    updateEmployeeProfile,
    email,
    setEmail,
    message,
    setMessage,
    handleLogin,
    recentActivities,
    setRecentActivities,
    logActivity,
    timeAgo,
    autoUpdateStatus,
  };

  return (
    <EmployeeContext.Provider value={contextValue}>
      {children}
    </EmployeeContext.Provider>
  );
};

export default EmployeeProvider;

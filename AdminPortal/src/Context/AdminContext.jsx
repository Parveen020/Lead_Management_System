import axios from "axios";
import React, { createContext, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";

export const AdminContext = createContext(null);

const AdminContextProvider = ({ children }) => {
  const BASE_URL = "https://lead-management-system-backend-if9k.onrender.com/admin";

  const [adminDetails, setAdminDetails] = useState(() => {
    const stored = localStorage.getItem("adminDetails");
    try {
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      console.error("Failed to parse adminDetails:", e);
      return null;
    }
  });
  const [csvRecords, setCSVRecords] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [cards, setCards] = useState({
    unassignedLeads: 0,
    assignedThisWeek: 0,
    activeSalespeople: 0,
    conversionRate: "0%",
  });
  const [salesAnalytics, setSalesAnalytics] = useState([]);
  const [employeeStats, setEmployeeStats] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [menuOpenIndex, setMenuOpenIndex] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const employeesPerPage = 7;
  const [editEmployee, setEditEmployee] = useState(null);
  const [adminActivities, setAdminActivities] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchAdminDetails();
    fetchDashboardMetrics();
    fetchCSVRecords();
    fetchClosedLeadLogs();
    triggerAutoCloseLeads();
  }, []);

  const fetchClosedLeadLogs = async () => {
    const adminId = JSON.parse(localStorage.getItem("adminDetails"))?._id;
    if (!adminId) return;

    try {
      await axios.put(
        `${BASE_URL}/update-recent-activity/${adminId}?logClosedLeads=true`
      );
      fetchAdminActivities(adminId);
    } catch (error) {
      console.error("Failed to fetch and log closed leads:", error);
    }
  };

  const fetchAdminActivities = async (adminId) => {
    try {
      const res = await axios.get(`${BASE_URL}/get-recent-activity/${adminId}`);
      setAdminActivities(res.data.activities);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAdminDetails = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/get-admin`);
      const admin = res.data;

      setAdminDetails([admin]);
      localStorage.setItem("adminDetails", JSON.stringify([admin]));
      fetchAdminActivities(admin._id);
    } catch (err) {
      console.error("Failed to fetch admin details:", err);
    }
  };

  const fetchDashboardMetrics = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/get-dashboard-metrices`);
      setCards(res.data.cards);
      setSalesAnalytics(res.data.salesAnalytics);
      setEmployeeStats(res.data.employeeStats);
      setRecentActivities(res.data.recentActivities || []);
    } catch (err) {
      setError("Failed to fetch dashboard metrics");
      console.error(err);
    }
  };

  const fetchCSVRecords = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/csv-records`);
      setCSVRecords(response.data.records);
    } catch (error) {
      console.error("Failed to fetch CSV records:", error);
      setCSVRecords([]);
    }
  };

  const handleSelectOne = (email) => {
    setSelectedEmployees((prev) =>
      prev.includes(email) ? prev.filter((e) => e !== email) : [...prev, email]
    );
  };

  const handleSelectAll = (currentEmployees) => {
    const allEmails = currentEmployees.map((emp) => emp.email);
    const isAllSelected = currentEmployees.every((emp) =>
      selectedEmployees.includes(emp.email)
    );

    if (isAllSelected) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(allEmails);
    }
  };

  const handleDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file.name.endsWith(".csv")) {
      setError("Only CSV files are allowed");
      return;
    }
    setUploadedFile(file);
    setError("");
  };

  const simulateVerification = () => {
    setIsVerifying(true);
    setProgress(0);
    let value = 0;
    const interval = setInterval(() => {
      value += 10;
      setProgress(value);
      if (value >= 100) {
        clearInterval(interval);
        setIsVerifying(false);
        setShowConfirm(true);
      }
    }, 300);
  };

  const handleUpload = async () => {
    if (!uploadedFile) return;
    const adminDetails = JSON.parse(localStorage.getItem("adminDetails"));
    const adminId = adminDetails[0]?._id;
    const formData = new FormData();
    formData.append("file", uploadedFile);

    try {
      const uploadRes = await axios.post(`${BASE_URL}/upload-csv`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const totalLeads = uploadRes.data.totalLeads || 0;

      const distResult = await distributeLeadsAndLog(
        adminId,
        `uploaded ${totalLeads} leads via CSV`
      );

      if (!distResult.success) {
        alert(distResult.error);
        setError(distResult.error);
      }

      await fetchCSVRecords();
    } catch (err) {
      const message =
        err?.response?.data?.error || "Something went wrong during upload";
      setError(message);
    }

    resetModal();
  };

  const distributeLeadsAndLog = async (adminId, contextMessage = "") => {
    try {
      const distRes = await axios.post(`${BASE_URL}/distribute-leads`);
      const distributedMessage = distRes.data.message || "";
      const distributedCount =
        parseInt(distributedMessage.match(/\d+/)?.[0]) || 0;

      const meta = contextMessage
        ? `You ${contextMessage} and assigned ${distributedCount} leads`
        : `You assigned ${distributedCount} leads to employees`;

      await logAdminActivity(adminId, "Assigned Leads", meta);

      return {
        success: true,
        message: distributedMessage,
        distributedCount,
      };
    } catch (error) {
      console.error("Error during lead distribution:", error);
      return {
        success: false,
        error: error.response?.data?.error || "Lead distribution failed",
      };
    }
  };

  const resetModal = () => {
    setUploadedFile(null);
    setIsVerifying(false);
    setProgress(0);
    setShowConfirm(false);
    setIsModalOpen(false);
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: handleDrop,
    multiple: false,
    accept: { "text/csv": [".csv"] },
  });

  const addOrUpdateEmployee = async (formData, isEdit = false) => {
    const adminDetails = JSON.parse(localStorage.getItem("adminDetails"));
    const adminId = adminDetails[0]?._id;
    try {
      if (isEdit && editEmployee?._id) {
        await axios.put(
          `${BASE_URL}/update-employee/${editEmployee._id}`,
          formData
        );
        await distributeLeadsAndLog(adminId, "updated an employee");
      } else {
        await axios.post(`${BASE_URL}/add-employee`, formData);
        await distributeLeadsAndLog(adminId, "added a new employee");
      }

      syncCSVRecords();
      setIsModalOpen(false);
      setEditEmployee(null);
      fetchDashboardMetrics();
    } catch (error) {
      console.error("Error saving employee:", error);
    }
  };

  const deleteEmployee = async (id) => {
    const adminDetails = JSON.parse(localStorage.getItem("adminDetails"));
    const adminId = adminDetails[0]?._id;
    try {
      await axios.delete(`${BASE_URL}/delete-employee/${id}`);
      syncCSVRecords();
      fetchDashboardMetrics();
      await distributeLeadsAndLog(adminId, "deleted an employee");
    } catch (error) {
      console.error("Error deleting employee:", error);
    }
  };

  const logAdminActivity = async (adminId, action, meta) => {
    try {
      await axios.post(`${BASE_URL}/update-recent-activity/${adminId}`, {
        action,
        meta,
      });
    } catch (err) {
      console.error("Failed to log admin activity", err);
    }
  };

  const timeAgo = (timestamp) => {
    const diff = Date.now() - new Date(timestamp);
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins} min${mins > 1 ? "s" : ""} ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? "s" : ""} ago`;
  };

  const updateAdminProfile = async (updatedData, adminId) => {
    try {
      const response = await axios.put(
        `${BASE_URL}/update-profile/${adminId}`,
        updatedData
      );
      setAdminDetails(response.data.admin);
      return { success: true };
    } catch (error) {
      console.error("Profile update failed", error);
      return { success: false, error: error.response?.data || error.message };
    }
  };

  const syncCSVRecords = async () => {
    try {
      const res = await axios.put(`${BASE_URL}/sync-csv-records`);
      // toast.success(res.data.message);
    } catch (error) {
      // toast.error("Failed to sync CSV records");
      console.error(error);
    }
  };

  const triggerAutoCloseLeads = async () => {
    try {
      const response = await axios.post(`${BASE_URL}/auto-close-leads`);
      console.log("Auto-close result:", response.data);
      return response.data;
    } catch (error) {
      console.error("Failed to auto-close leads:", error);
      throw error;
    }
  };

  console.log("adminActivity-", csvRecords);

  const contextValue = {
    csvRecords,
    uploadedFile,
    isVerifying,
    progress,
    showConfirm,
    isModalOpen,
    getRootProps,
    getInputProps,
    setIsModalOpen,
    simulateVerification,
    handleUpload,
    resetModal,
    error,
    cards,
    salesAnalytics,
    employeeStats,
    recentActivities,
    handleSelectOne,
    handleSelectAll,
    menuOpenIndex,
    setMenuOpenIndex,
    selectedEmployees,
    setSelectedEmployees,
    currentPage,
    setCurrentPage,
    employeesPerPage,
    editEmployee,
    setEditEmployee,
    addOrUpdateEmployee,
    deleteEmployee,
    adminActivities,
    timeAgo,
    searchQuery,
    setSearchQuery,
    updateAdminProfile,
    adminDetails,
    setAdminDetails,
  };

  return (
    <AdminContext.Provider value={contextValue}>
      {children}
    </AdminContext.Provider>
  );
};

export default AdminContextProvider;

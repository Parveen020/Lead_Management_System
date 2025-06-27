import React, { useState, useContext, useEffect } from "react";
import "./LeadsSection.css";
import { EmployeeContext } from "../../Context/EmlpoyeeContext";
import Searchbar from "../Searchbar/Searchbar";
import { assets } from "../../assets/assets";

const LeadsSection = () => {
  const {
    assignedLeads,
    fetchAssignedLeads,
    formatDate,
    updateLead,
    autoUpdateStatus,
  } = useContext(EmployeeContext);

  const [selectedLead, setSelectedLead] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");

  const [selectedFilter, setSelectedFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredLeads, setFilteredLeads] = useState([]);

  useEffect(() => {
    filterLeads();
  }, [assignedLeads, selectedFilter, searchQuery]);

  const filterLeads = () => {
    let filtered = [...assignedLeads];

    if (selectedFilter !== "All") {
      filtered = filtered.filter((lead) => lead.status === selectedFilter);
    }

    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (lead) =>
          lead.name?.toLowerCase().includes(q) ||
          lead.email?.toLowerCase().includes(q) ||
          lead.phoneNumber?.includes(q)
      );
    }

    setFilteredLeads(filtered);
  };

  const handleActionClick = (lead, action) => {
    setSelectedLead(lead);
    setModalType(action);
    setShowModal(true);
    setSelectedStatus(lead.status || "");
    setSelectedType(lead.type || "");
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedLead(null);
    setModalType("");
    setSelectedStatus("");
    setSelectedType("");
  };

  const handleSave = async () => {
    try {
      if (!selectedLead) return;

      const data = {};
      if (modalType === "status") data.status = selectedStatus;
      if (modalType === "type") data.type = selectedType;
      if (modalType === "schedule") {
        if (!scheduleDate || !scheduleTime) {
          alert("Please select date and time");
          return;
        }

        data.date = `${scheduleDate}T${scheduleTime}`;
        data.time = scheduleTime;
        data.callType = "Follow-up";
      }

      await updateLead(selectedLead._id, data);
      await fetchAssignedLeads();
    } catch (error) {
      console.error("Failed to update lead:", error);
    } finally {
      closeModal();
    }
  };

  const getStatusColor = (status, type) => {
    console.log("color=", status + " " + type);
    if (type === "Hot") return "orange";
    if (type === "Warm") return "yellow";
    if (type === "Cold") return "blue";
    return "gray";
  };

  const renderModal = () => {
    if (!showModal || !selectedLead) return null;

    if (modalType === "status") {
      return (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Lead Status</h2>
            </div>
            <div className="modal-body">
              <div className="status-options">
                <div
                  className={`status-option ${selectedStatus === "Ongoing" ? "selected" : ""}`}
                  onClick={() => setSelectedStatus("Ongoing")}
                >
                  <div
                    className={`status-dot ${selectedStatus === "Ongoing" ? "orange" : "blue"}`}
                  ></div>
                  <span>Ongoing</span>
                </div>

                <div
                  className={`status-option ${selectedStatus === "Closed" ? "selected" : ""}`}
                  onClick={() => setSelectedStatus("Closed")}
                >
                  <div
                    className={`status-dot ${selectedStatus === "Closed" ? "orange" : "blue"}`}
                  ></div>
                  <span>Closed</span>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="save-btn" onClick={handleSave}>
                Save
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (modalType === "schedule") {
      return (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-body">
              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Time</label>
                <input
                  type="time"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className="form-input"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="save-btn" onClick={handleSave}>
                Save
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (modalType === "type") {
      return (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Type</h2>
            </div>
            <div className="modal-body">
              <div className="type-options">
                <div
                  className={`type-option hot ${selectedType === "Hot" ? "selected" : ""}`}
                  onClick={() => setSelectedType("Hot")}
                >
                  Hot
                </div>
                <div
                  className={`type-option warm ${selectedType === "Warm" ? "selected" : ""}`}
                  onClick={() => setSelectedType("Warm")}
                >
                  Warm
                </div>
                <div
                  className={`type-option cold ${selectedType === "Cold" ? "selected" : ""}`}
                  onClick={() => setSelectedType("Cold")}
                >
                  Cold
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="save-btn" onClick={handleSave}>
                Save
              </button>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="leads-section">
      <Searchbar
        selectedFilter={selectedFilter}
        setSelectedFilter={setSelectedFilter}
        onFilterSave={filterLeads}
        filterOptions={["Ongoing", "Closed", "All"]}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      <div className="leads-list">
        {filteredLeads.map((lead) => (
          <div
            key={lead._id}
            className={`lead-card ${lead.status === "Closed" ? "closed" : ""}`}
          >
            <div className="lead-info">
              <div className="lead-header">
                <h4 className="lead-name">{lead.name || "--"}</h4>
              </div>
              <p className="lead-email">{lead.email || "--"}</p>
              <div className="lead-date">
                <span>Date</span>
                <div className="date-value">
                  <img src={assets.calendar} alt="" />
                  {formatDate(lead.createdAt)}
                </div>
              </div>
            </div>
            <div className="lead-actions">
              <div
                className={`status-badge ${getStatusColor(lead.status, lead.type)} ${lead.status === "Closed" ? "closed" : ""}`}
              >
                <span>{lead.status}</span>
              </div>
              <div className="lead-actions-buttons">
                <button
                  className="action-btn edit-btn"
                  onClick={() => handleActionClick(lead, "type")}
                >
                  <img src={assets.type} alt="" />
                </button>
                <button
                  className="action-btn schedule-btn"
                  onClick={() => handleActionClick(lead, "schedule")}
                >
                  <img src={assets.time} alt="" />
                </button>
                <button
                  className="action-btn status-btn"
                  onClick={() => handleActionClick(lead, "status")}
                >
                  <img src={assets.status} alt="" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {renderModal()}
    </div>
  );
};

export default LeadsSection;

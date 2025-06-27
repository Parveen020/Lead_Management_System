import React, { useContext, useEffect, useState, useRef } from "react";
import { EmployeeContext } from "../../Context/EmlpoyeeContext";
import "./Schedule.css";
import Searchbar from "../Searchbar/Searchbar";
import { assets } from "../../assets/assets";

const Schedule = () => {
  const { scheduledLeads, fetchScheduledLeads, formatDate } =
    useContext(EmployeeContext);

  const [selectedFilter, setSelectedFilter] = useState("Allesw3");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredLeads, setFilteredLeads] = useState([]);

  useEffect(() => {
    fetchScheduledLeads();
  }, []);

  useEffect(() => {
    filterLeads();
  }, [scheduledLeads, selectedFilter, searchQuery]);

  const filterLeads = () => {
    let filtered = [...scheduledLeads];

    if (selectedFilter === "Today") {
      const today = new Date();
      filtered = filtered.filter((lead) => {
        const lastCall = lead.scheduledCalls.at(-1);
        if (!lastCall?.date) return false;

        const callDate = new Date(lastCall.date);

        return (
          callDate.getDate() === today.getDate() &&
          callDate.getMonth() === today.getMonth() &&
          callDate.getFullYear() === today.getFullYear()
        );
      });
    }

    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (lead) =>
          lead.name?.toLowerCase().includes(query) ||
          lead.phoneNumber?.includes(query)
      );
    }

    setFilteredLeads(filtered);
  };

  return (
    <div className="schedule">
      <Searchbar
        selectedFilter={selectedFilter}
        setSelectedFilter={setSelectedFilter}
        onFilterSave={filterLeads}
        filterOptions={["All", "Today"]}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
      <div className="card-container">
        {filteredLeads.map((lead, index) => {
          const latestCall =
            lead.scheduledCalls[lead.scheduledCalls.length - 1];

          return (
            <div
              key={index}
              className={`card ${index === 0 ? "highlight" : ""}`}
            >
              <div className="card-header">
                <div>{latestCall.callType || "Call"}</div>
                <div className="date">Date</div>
              </div>
              <div className="card-header">
                <div>{lead.phoneNumber || "N/A"}</div>
                <div className="date">
                  {formatDate(new Date(latestCall.date))} {latestCall.time}
                </div>
              </div>
              <div className="call-info">
                <span className="call-icon">
                  <img src={assets.call} alt="Call Icon" />
                </span>
                <span>{lead.scheduledCalls[0].callType}</span>
              </div>
              <div className="user-info">
                <img src={assets.suser} alt={lead.name} className="user-img" />
                <span>{lead.name}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Schedule;

import React, { useState } from "react";
import "./Dashboard.css";
import { assets } from "../../assets/assets";
import Charts from "./Charts";
import { useContext } from "react";
import { AdminContext } from "../../Context/AdminContext";

const Dashboard = () => {
  const [query, setQuery] = useState("");
  const { cards, employeeStats, adminActivities, timeAgo } =
    useContext(AdminContext);

  const match = (keyword) =>
    keyword.toLowerCase().includes(query.trim().toLowerCase());

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <span className="breadcrumb">Home &gt; Dashboard</span>
      </div>

      <div className="dashboard-content">
        {/* KPI Cards */}
        {(match("unassigned") ||
          match("assigned") ||
          match("salespeople") ||
          match("conversion")) && (
          <div className="kpi-cards">
            {match("unassigned") && (
              <div className="kpi-box">
                <img src={assets.unassigned} alt="icon" />
                <div>
                  <p className="kpi-title">Unassigned Leads</p>
                  <h3>{cards.unassignedLeads}</h3>
                </div>
              </div>
            )}
            {match("assigned") && (
              <div className="kpi-box">
                <img src={assets.assigned} alt="icon" />
                <div>
                  <p className="kpi-title">Assigned This Week</p>
                  <h3>{cards.assignedThisWeek}</h3>
                </div>
              </div>
            )}
            {match("salespeople") && (
              <div className="kpi-box">
                <img src={assets.active} alt="icon" />
                <div>
                  <p className="kpi-title">Active Salespeople</p>
                  <h3>{cards.activeSalespeople}</h3>
                </div>
              </div>
            )}
            {match("conversion") && (
              <div className="kpi-box">
                <img src={assets.conver} alt="icon" />
                <div>
                  <p className="kpi-title">Conversion Rate</p>
                  <h3>{cards.conversionRate}</h3>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="second-layer">
          {/* Sale Analytics */}
          {match("sale") || match("analytics") || match("chart") ? (
            <div className="chart-box">
              <h4>Sale Analytics</h4>
              <div className="fake-chart">
                <Charts />
              </div>
            </div>
          ) : null}

          {/* Recent Activity */}
          {match("activity") || match("feed") ? (
            <div className="activity-box">
              <h4>Recent Activity Feed</h4>
              <ul>
                {adminActivities && adminActivities.length > 0 ? (
                  adminActivities
                    .slice()

                    .map((activity, idx) => (
                      <li key={idx}>
                        {activity.meta} – {timeAgo(activity.timestamp)}
                      </li>
                    ))
                ) : (
                  <li>No recent activity</li>
                )}
              </ul>
            </div>
          ) : null}
        </div>

        {/* Team Table */}
        {match("team") ||
        match("table") ||
        match("employee") ||
        match("leads") ? (
          <div className="team-table">
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Employee ID</th>
                    <th>Assigned Leads</th>
                    <th>Closed Leads</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {employeeStats.map((emp, index) => (
                    <tr key={index}>
                      <td className="employee-row">
                        <div className="initials-circle">
                          {emp.name
                            .split(" ")
                            .map((word) => word[0])
                            .slice(0, 2)
                            .join("")
                            .toUpperCase()}
                        </div>
                        <div className="employee-info">
                          {emp.name}
                          <br />
                          <span>{emp.email}</span>
                        </div>
                      </td>
                      <td className="row">{emp.employeeId}</td>
                      <td className="row">{emp.assignedLeads}</td>
                      <td className="row">{emp.closedLeads}</td>
                      <td className="row">
                        <span className={`status ${emp.status.toLowerCase()}`}>
                          ● {emp.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Dashboard;

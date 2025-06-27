import React, { useContext } from "react";
import { EmployeeContext } from "../../Context/EmlpoyeeContext";
import "./EmployeeDashboard.css";

const EmployeeDashboard = () => {
  const {
    checkInLogs,
    checkInTime,
    checkOutTime,
    breakStart,
    breakEnd,
    breakHistory,
    breakStatus,
    dutyStatus,
    handleBreak,
    handleCheckInOut,
    recentActivities,
    setRecentActivities,
    logActivity,
    timeAgo,
  } = useContext(EmployeeContext);

  return (
    <div className="dashboard">
      <div className="timings">
        <h3>Timings</h3>

        <div className={`time-card ${dutyStatus === "on" ? "active-tab" : ""}`}>
          <div
            className={`card-header ${dutyStatus === "on" ? "active-tab" : ""}`}
          >
            <div>
              Checked-In
              <br />
              <span>{checkInTime || "--:-- --"}</span>
            </div>
            <div>
              Check Out
              <br />
              <span>{checkOutTime || "--:-- --"}</span>
            </div>
            <div
              className={`toggle ${dutyStatus}`}
              onClick={handleCheckInOut}
            ></div>
          </div>
        </div>

        <div className={`time-card `}>
          <div
            className={`card-header ${breakStatus === "on" ? "active-tab" : ""}`}
          >
            <div>
              Break
              <br />
              <span>{breakStart || "--:-- --"}</span>
            </div>
            <div>
              Ended
              <br />
              <span>{breakEnd || "--:-- --"}</span>
            </div>
            <div
              className={`toggle ${breakStatus}`}
              onClick={handleBreak}
            ></div>
          </div>
          <div className="break-history">
            {[...breakHistory].reverse().map((b, i) => (
              <div className="break-row" key={i}>
                <span>
                  Break
                  <br />
                  {b.start}
                </span>
                <span>
                  Ended
                  <br />
                  {b.end}
                </span>
                <span>
                  Date
                  <br />
                  {b.date}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="activity">
        <h3>Recent Activity</h3>
        <div className="activity-box">
          {recentActivities.map((a, i) => (
            <p key={i}>
              • {a.meta} – {timeAgo(a.timestamp)}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;

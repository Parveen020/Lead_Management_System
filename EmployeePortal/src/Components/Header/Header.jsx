import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Header.css";
import { ChevronLeft } from "lucide-react";

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname.substring(1);
  const isDashboard = path === "" || path === "home";

  const employeeData = JSON.parse(localStorage.getItem("employee"));
  const employeeName = employeeData?.firstName + " " + employeeData?.lastName;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const formatTabName = (tab) => {
    if (tab === "leads") return "Leads";
    if (tab === "schedule") return "Schedule";
    if (tab === "profile") return "Profile";
    return "Back";
  };

  const goBackToPreviousTab = () => {
    const history = JSON.parse(sessionStorage.getItem("tabHistory")) || [];

    if (history.length === 0) {
      navigate("/home");
      return;
    }

    const previousTab = history.pop();
    sessionStorage.setItem("tabHistory", JSON.stringify(history));
    navigate(`/${previousTab}`);
  };

  return (
    <div className="header">
      <p className="logo">
        Canova<span className="yellow">CRM</span>
      </p>

      {isDashboard ? (
        <div className="lower-box">
          <p className="wishes">{getGreeting()}</p>
          <p className="name">{employeeName}</p>
        </div>
      ) : (
        <div className="back-header">
          <button className="back-button" onClick={goBackToPreviousTab}>
            <ChevronLeft size={20} />
          </button>
          <span className="tab-title">{formatTabName(path)}</span>
        </div>
      )}
    </div>
  );
};

export default Header;

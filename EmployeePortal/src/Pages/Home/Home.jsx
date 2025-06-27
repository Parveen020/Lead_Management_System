import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Home.css";
import Header from "../../Components/Header/Header";
import Footer from "../../Components/Footer/Footer";
import EmployeeDashboard from "../../Components/EmployeeDashboard/EmployeeDashboard";
import LeadsSection from "../../Components/LeadsSection/LeadsSection";
import Schedule from "../../Components/Schedule/Schedule";
import Profile from "../../Components/Profile/Profile";

const Home = ({ initialTab = "home" }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    const path = location.pathname.substring(1); // remove leading slash
    if (path && ["home", "leads", "schedule", "profile"].includes(path)) {
      setActiveTab(path);
    }
  }, [location]);

  const handleTabChange = (tab) => {
    const history = JSON.parse(sessionStorage.getItem("tabHistory")) || [];

    const currentTab = activeTab || "home";
    if (history[history.length - 1] !== currentTab) {
      history.push(currentTab);
    }

    sessionStorage.setItem("tabHistory", JSON.stringify(history));
    setActiveTab(tab);
    navigate(`/${tab}`);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "home":
        return <EmployeeDashboard />;
      case "leads":
        return <LeadsSection />;
      case "schedule":
        return <Schedule />;
      case "profile":
        return <Profile />;
      default:
        return <EmployeeDashboard />;
    }
  };

  return (
    <div className="home">
      <Header />
      {renderTabContent()}
      <Footer activeTab={activeTab} setActiveTab={handleTabChange} />
    </div>
  );
};

export default Home;

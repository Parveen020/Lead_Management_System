import React from "react";
import "./Footer.css";
import { assets } from "../../assets/assets";

const Footer = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { name: "home", label: "Home", icon: assets.home },
    { name: "leads", label: "Leads", icon: assets.leads },
    { name: "schedule", label: "Schedule", icon: assets.calendar },
    { name: "profile", label: "Profile", icon: assets.profile },
  ];

  return (
    <div className="footer">
      {tabs.map((tab) => (
        <div
          key={tab.name}
          className={`tabs ${activeTab === tab.name ? "active" : ""}`}
          onClick={() => setActiveTab(tab.name)}
        >
          <img
            src={tab.icon}
            alt={tab.label}
            className={activeTab === tab.name ? "active-icon" : ""}
          />
          <p>{tab.label}</p>
        </div>
      ))}
    </div>
  );
};

export default Footer;

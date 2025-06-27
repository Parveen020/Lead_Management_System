import React from "react";
import { NavLink } from "react-router-dom";
import "./Sidebar.css";

const Sidebar = () => {
  const navItems = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Leads", path: "/leads" },
    { name: "Employees", path: "/employees" },
    { name: "Settings", path: "/settings" },
  ];

  return (
    <div className="sidebar">
      <div className="upper-box">
        <h1 className="logo">
          Canova<span className="highlight">CRM</span>
        </h1>

        <nav className="nav">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `nav-item ${isActive ? "active" : ""}`
              }
            >
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;

import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Home from "./Pages/Home/Home";
import Dashboard from "./Component/Dashboard/Dashboard";
import Leads from "./Component/Leads/Leads";
import Employee from "./Component/Employee/Employee";
import Settings from "./Component/Settings/Settings";
import "./App.css";

const App = () => {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<Home />}>
          <Route index element={<Navigate to="/dashboard" />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="leads" element={<Leads />} />
          <Route path="employees" element={<Employee />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </div>
  );
};

export default App;

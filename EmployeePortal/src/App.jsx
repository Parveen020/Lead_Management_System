import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "./App.css";
import Login from "./Components/Login/Login";
import Home from "./Pages/Home/Home";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const employee = JSON.parse(localStorage.getItem("employee"));
    setIsLoggedIn(!!employee);
  }, []);

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        {isLoggedIn ? (
          <>
            <Route path="/" element={<Home />} />
            <Route path="/leads" element={<Home initialTab="leads" />} />
            <Route path="/schedule" element={<Home initialTab="schedule" />} />
            <Route path="/profile" element={<Home initialTab="profile" />} />
            <Route path="*" element={<Navigate to="/" />} />
          </>
        ) : (
          <>
            <Route path="*" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
          </>
        )}
      </Routes>
    </>
  );
};

export default App;

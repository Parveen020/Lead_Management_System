import React, { useContext } from "react";
import "./Home.css";
import Sidebar from "../../Component/Sidebar/Sidebar";
import Searchbar from "../../Component/Searchbar/Searchbar";
import { Outlet } from "react-router-dom";
import { AdminContext } from "../../Context/AdminContext";

const Home = () => {
  const { setSearchQuery } = useContext(AdminContext);
  return (
    <div className="container">
      <div className="left-side">
        <Sidebar />
      </div>
      <div className="right-side">
        <Searchbar onChange={setSearchQuery} />
        <Outlet />
      </div>
    </div>
  );
};

export default Home;

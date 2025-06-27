import React from "react";
import "./Searchbar.css";
import { assets } from "../../assets/assets";

const Searchbar = ({ placeholder = "Search...", onChange }) => {
  return (
    <div className="searchbar-container">
      <span className="searchbar-icon">
        <img src={assets.search} alt="Search" />
      </span>
      <input
        type="text"
        className="searchbar-input"
        placeholder={placeholder}
        onChange={(e) => onChange?.(e.target.value)}
      />
    </div>
  );
};

export default Searchbar;

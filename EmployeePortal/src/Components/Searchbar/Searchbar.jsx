import React, { useState, useRef, useEffect } from "react";
import "./Searchbar.css";
import { Search } from "lucide-react";
import { assets } from "../../assets/assets";

const Searchbar = ({
  selectedFilter,
  setSelectedFilter,
  onFilterSave,
  filterOptions = [],
  searchQuery,
  setSearchQuery,
}) => {
  const [showFilter, setShowFilter] = useState(false);
  const modalRef = useRef(null);

  const toggleFilter = () => setShowFilter(!showFilter);

  const handleSave = () => {
    setShowFilter(false);
    onFilterSave();
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        setShowFilter(false);
      }
    };

    if (showFilter) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showFilter]);

  return (
    <div className="search-container">
      <div className="search-box">
        <Search className="search-icon" size={20} />
        <input
          type="text"
          placeholder="Search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="filter-wrapper">
        <button className="filter-btn" onClick={toggleFilter}>
          <img src={assets.filter} alt="Filter" />
        </button>

        {showFilter && (
          <div className="filter-modal" ref={modalRef}>
            <p className="filter-title">Filter</p>
            <select
              className="filter-select"
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
            >
              {filterOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <button className="filter-save-btn" onClick={handleSave}>
              Save
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Searchbar;

import React, { useContext, useRef, useState, useEffect } from "react";
import { assets } from "../../assets/assets";
import "./Employee.css";
import AddEmployee from "../AddEmployee/AddEmployee";
import { AdminContext } from "../../Context/AdminContext";

const Employee = () => {
  const {
    employeeStats,
    selectedEmployees,
    handleSelectAll,
    handleSelectOne,
    menuOpenIndex,
    setMenuOpenIndex,
    isModalOpen,
    setIsModalOpen,
    currentPage,
    setCurrentPage,
    employeesPerPage,
    setEditEmployee,
    deleteEmployee,
    searchQuery,
  } = useContext(AdminContext);
  const menuRef = useRef(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpenIndex(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef]);

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
  };

  const query = searchQuery.trim().toLowerCase();

  const filteredEmployees = employeeStats.filter((emp) => {
    return (
      emp.name?.toLowerCase().includes(query) ||
      emp.email?.toLowerCase().includes(query) ||
      emp.employeeId?.toLowerCase().includes(query) ||
      emp.location?.toLowerCase().includes(query) ||
      emp.preferredLanguage?.toLowerCase().includes(query) ||
      emp.status?.toLowerCase().includes(query)
    );
  });

  const totalPages = Math.ceil(filteredEmployees.length / employeesPerPage);
  const indexOfLast = currentPage * employeesPerPage;
  const indexOfFirst = indexOfLast - employeesPerPage;
  let currentEmployees = filteredEmployees.slice(indexOfFirst, indexOfLast);

  // Sorting logic for current page
  if (sortConfig.key) {
    currentEmployees.sort((a, b) => {
      const aVal = a[sortConfig.key]?.toString().toLowerCase() || "";
      const bVal = b[sortConfig.key]?.toString().toLowerCase() || "";
      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }

  const isAllSelected =
    currentEmployees.length > 0 &&
    currentEmployees.every((emp) => selectedEmployees.includes(emp.email));

  const handlePageClick = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="employee-container">
      <div className="leads-header">
        <div className="breadcrumb">Home &gt; Employees</div>
        <button
          className="add-employee-button"
          onClick={() => {
            setEditEmployee(null);
            setIsModalOpen(true);
          }}
        >
          Add Employees
        </button>
      </div>

      <div className="team-table-2">
        <div className="table-scroll-2">
          <table>
            <thead>
              <tr>
                <th onClick={() => handleSort("name")}>
                  Name{" "}
                  {sortConfig.key === "name" &&
                    (sortConfig.direction === "asc" ? "↑" : "↓")}
                </th>
                <th onClick={() => handleSort("employeeId")}>
                  Employee ID{" "}
                  {sortConfig.key === "employeeId" &&
                    (sortConfig.direction === "asc" ? "↑" : "↓")}
                </th>
                <th onClick={() => handleSort("assignedLeads")}>
                  Assigned Leads{" "}
                  {sortConfig.key === "assignedLeads" &&
                    (sortConfig.direction === "asc" ? "↑" : "↓")}
                </th>
                <th onClick={() => handleSort("closedLeads")}>
                  Closed Leads{" "}
                  {sortConfig.key === "closedLeads" &&
                    (sortConfig.direction === "asc" ? "↑" : "↓")}
                </th>
                <th onClick={() => handleSort("status")}>
                  Status{" "}
                  {sortConfig.key === "status" &&
                    (sortConfig.direction === "asc" ? "↑" : "↓")}
                </th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {currentEmployees.map((employee, index) => (
                <tr key={index} style={{ position: "relative" }}>
                  <td className="employee-row">
                    <div className="initials-circle">
                      {employee.name
                        .split(" ")
                        .map((word) => word[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase()}
                    </div>
                    <div className="employee-info">
                      {employee.name}
                      <br />
                      <span>{employee.email}</span>
                    </div>
                  </td>
                  <td className="row">{employee.employeeId}</td>
                  <td className="row">{employee.assignedLeads}</td>
                  <td className="row">{employee.closedLeads}</td>
                  <td className="row">
                    <span className={`status ${employee.status.toLowerCase()}`}>
                      ● {employee.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className="menu-button"
                      onClick={() =>
                        setMenuOpenIndex(menuOpenIndex === index ? null : index)
                      }
                    >
                      ⋮
                    </button>
                    {menuOpenIndex === index && (
                      <div className="row-menu" ref={menuRef}>
                        <button
                          onClick={() => {
                            const [firstName, ...rest] = (employee.name || "")
                              .trim()
                              .split(" ");
                            const lastName = rest.join(" ");
                            const updatedEmployee = {
                              ...employee,
                              firstName,
                              lastName,
                              location: employee.location,
                              preferredLanguage: employee.preferredLanguage,
                            };
                            setEditEmployee(updatedEmployee);
                            setIsModalOpen(true);
                          }}
                        >
                          <img src={assets.edit} alt="Edit Icon" /> Edit
                        </button>
                        <button onClick={() => deleteEmployee(employee._id)}>
                          <img src={assets.pic} alt="Delete Icon" /> Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="pagination">
        <button
          className="pagination-button"
          onClick={() => handlePageClick(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ion-icon name="chevron-back-outline"></ion-icon>
          Previous
        </button>

        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i + 1}
            className={`pagination-button ${
              currentPage === i + 1 ? "active" : ""
            }`}
            onClick={() => handlePageClick(i + 1)}
          >
            {i + 1}
          </button>
        ))}

        <button
          className="pagination-button"
          onClick={() => handlePageClick(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
          <ion-icon name="chevron-forward-outline"></ion-icon>
        </button>
      </div>

      <AddEmployee
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditEmployee(null);
        }}
      />
    </div>
  );
};

export default Employee;

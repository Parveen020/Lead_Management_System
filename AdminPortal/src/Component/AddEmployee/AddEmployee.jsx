import React, { useState, useEffect, useContext } from "react";
import "./AddEmployee.css";
import { AdminContext } from "../../Context/AdminContext";

const AddEmployee = ({ isOpen, onClose }) => {
  const { addOrUpdateEmployee, editEmployee, setEditEmployee } =
    useContext(AdminContext);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    location: "",
    preferredLanguage: "",
  });

  const [showTooltip1, setShowTooltip1] = useState(false);
  const [showTooltip2, setShowTooltip2] = useState(false);

  useEffect(() => {
    if (editEmployee) {
      setFormData({
        firstName: editEmployee.firstName || "",
        lastName: editEmployee.lastName || "",
        email: editEmployee.email || "",
        location: editEmployee.location || "",
        preferredLanguage: editEmployee.preferredLanguage || "",
      });
    } else {
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        location: "",
        preferredLanguage: "",
      });
    }
  }, [editEmployee]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addOrUpdateEmployee(formData, !!editEmployee);
    onClose();
    setEditEmployee(null);
  };

  const closeHandler = () => {
    onClose();
    setEditEmployee(null);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="form-wrapper2">
          <button className="close-button" onClick={closeHandler}>
            x
          </button>
          <h2>{editEmployee ? "Edit Employee" : "Add New Employee"}</h2>
          <form onSubmit={handleSubmit}>
            <label>First Name</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
            />

            <label>Last Name</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
            />

            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={!!editEmployee}
            />

            <label>Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              disabled={!!editEmployee}
            />
            <button
              className="tool-tip-button"
              type="button"
              onMouseEnter={() => setShowTooltip1(true)}
              onMouseLeave={() => setShowTooltip1(false)}
            >
              <i className="info-icon">i</i>
            </button>
            {showTooltip1 && (
              <div className="tooltip">
                Leads will be assigned based on location.
              </div>
            )}

            <label>Preferred Language</label>
            <input
              type="text"
              name="preferredLanguage"
              value={formData.preferredLanguage}
              onChange={handleChange}
              required
              disabled={!!editEmployee}
            />
            <button
              className="tool-tip-button"
              type="button"
              onMouseEnter={() => setShowTooltip2(true)}
              onMouseLeave={() => setShowTooltip2(false)}
            >
              <i className="info-icon">i</i>
            </button>
            {showTooltip2 && (
              <div className="tooltip">
                Language also helps in assigning relevant leads.
              </div>
            )}

            <div className="btn-wrapper">
              <button type="submit" className="save-btn">
                {editEmployee ? "Update" : "Save"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddEmployee;

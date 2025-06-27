import React, { useContext, useState, useEffect } from "react";
import "./Settings.css";
import { AdminContext } from "../../Context/AdminContext";

const Settings = () => {
  const { adminDetails, updateAdminProfile } = useContext(AdminContext);
  console.log("Admin - ", adminDetails);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const admin = Array.isArray(adminDetails) ? adminDetails[0] : adminDetails;
    if (admin) {
      setFormData((prev) => ({
        ...prev,
        firstName: admin.firstName || "",
        lastName: admin.lastName || "",
        email: admin.email || "",
        password: "",
        confirmPassword: "",
      }));
    }
  }, [adminDetails]);

  console.log("admin", formData);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    const updateData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      ...(formData.password && { password: formData.password }),
    };

    const result = await updateAdminProfile(updateData, adminDetails[0]._id);
    if (result.success) {
      setFormData((prev) => ({ ...prev, password: "", confirmPassword: "" }));
    } else {
      alert("Update failed: " + result.error?.error || result.error);
    }
  };

  return (
    <div className="settings-container">
      <div className="settings-header">
        <span>Home &gt; Settings</span>
      </div>
      <div className="form-wrapper">
        <h3>Edit Profile</h3>
        <hr className="section-divider" />
        <form onSubmit={handleSubmit}>
          <label>First name</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
          />
          <label>Last name</label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
          />
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
          <label>Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
          />
          <label>Confirm Password</label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
          />
          <div className="btn-wrapper">
            <button type="submit" className="save-btn">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;

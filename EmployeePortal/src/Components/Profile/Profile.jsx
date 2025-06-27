import React, { useEffect, useState, useContext } from "react";
import "./Profile.css";
import { EmployeeContext } from "../../Context/EmlpoyeeContext";
import { toast } from "react-toastify";

const Profile = () => {
  const { employeeProfile, fetchEmployeeProfile, updateEmployeeProfile } =
    useContext(EmployeeContext);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    fetchEmployeeProfile();
  }, []);

  useEffect(() => {
    if (employeeProfile) {
      setFormData({
        firstName: employeeProfile.firstName || "",
        lastName: employeeProfile.lastName || "",
        email: employeeProfile.email || "",
        password: employeeProfile.password || "",
      });
    }
  }, [employeeProfile]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await updateEmployeeProfile(formData);
    if (result.success) {
      toast.success("Profile updated successfully");
    } else {
      toast.error("Failed to update profile");
    }
  };

  return (
    <div className="profile">
      <form className="profile-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>First name</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            placeholder="First Name"
          />
        </div>

        <div className="form-group">
          <label>Last name</label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            placeholder="Last Name"
          />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Password"
          />
        </div>

        <div className="form-group">
          <label>Confirm Password</label>
          <input
            type="password"
            value=""
            onChange={handleChange}
            placeholder="Confirm Password"
          />
        </div>

        <button type="submit" className="save-button">
          Save
        </button>
      </form>
    </div>
  );
};

export default Profile;

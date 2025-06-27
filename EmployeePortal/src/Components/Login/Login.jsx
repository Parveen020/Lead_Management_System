import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import { EmployeeContext } from "../../Context/EmlpoyeeContext";

const Login = ({ setIsLoggedIn }) => {
  const { email, setEmail, message, setMessage, handleLogin } =
    useContext(EmployeeContext);
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await handleLogin(email, password);
    if (result.success) {
      setIsLoggedIn(true);
      navigate("/");
    } else {
      setMessage(result.error);
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Employee Login</h2>

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            placeholder="employee@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            placeholder="********"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="login-button">
          Login
        </button>
        {message && <p className="message">{message}</p>}
      </form>
    </div>
  );
};

export default Login;

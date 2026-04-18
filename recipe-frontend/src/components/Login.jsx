import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/auth.css";

export default function Login() {
  const [data, setData] = useState({
    email: "",
    password: ""
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleLogin = async () => {
    try {
      const res = await axios.post("http://localhost:5000/login", data);

      if (res.data.success) {
        localStorage.setItem("user", JSON.stringify(res.data.user));
        navigate("/dashboard");
      } else {
        alert("Invalid credentials");
      }
    } catch (err) {
      console.error(err);
      alert("Login failed");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card auth-card--compact">
        <div className="auth-header">
          <p className="eyebrow">Welcome Back</p>
          <h2>Log in to continue</h2>
          <p>Access your saved food preferences and jump right back into recipe discovery.</p>
        </div>

        <div className="auth-fields">
          <input
            name="email"
            placeholder="Email"
            onChange={handleChange}
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            onChange={handleChange}
          />
        </div>

        <button className="auth-button" onClick={handleLogin}>Login</button>

        <p className="auth-footer">
          Don't have an account?{" "}
          <span className="link" onClick={() => navigate("/")}>
            Register
          </span>
        </p>
      </div>
    </div>
  );
}

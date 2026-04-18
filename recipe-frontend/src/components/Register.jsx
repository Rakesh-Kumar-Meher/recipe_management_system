import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/auth.css";

export default function Register() {
  const navigate = useNavigate();

  const [user, setUser] = useState({
    name: "",
    email: "",
    password: "",
    dietary_preferences: "",
    allergies: "",
    skill_level: "",
    preferred_ingredients: "",
    avoid_ingredients: ""
  });

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      await axios.post("http://localhost:5000/register", user);
      alert("Registered Successfully");
      navigate("/login");
    } catch (err) {
      console.error(err);
      alert("Registration failed");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <p className="eyebrow">Join In</p>
          <h2>Create your recipe profile</h2>
          <p>Tell the app what you enjoy cooking so it can suggest recipes that fit your taste.</p>
        </div>

        <div className="auth-fields">
          <input name="name" placeholder="Name" onChange={handleChange} />
          <input name="email" placeholder="Email" onChange={handleChange} />
          <input name="password" type="password" placeholder="Password" onChange={handleChange} />
          <input name="dietary_preferences" placeholder="Dietary preferences" onChange={handleChange} />
          <input name="allergies" placeholder="Allergies" onChange={handleChange} />
          <input name="skill_level" placeholder="Skill level" onChange={handleChange} />
          <input name="preferred_ingredients" placeholder="Preferred ingredients" onChange={handleChange} />
          <input name="avoid_ingredients" placeholder="Avoid ingredients" onChange={handleChange} />
        </div>

        <button className="auth-button" onClick={handleSubmit}>Create Account</button>

        <p className="auth-footer">
          Already have an account?{" "}
          <span className="link" onClick={() => navigate("/login")}>
            Login
          </span>
        </p>
      </div>
    </div>
  );
}

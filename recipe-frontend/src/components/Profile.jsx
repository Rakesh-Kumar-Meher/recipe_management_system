import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/dashboard.css";

export default function Profile() {
  const storedUser = JSON.parse(localStorage.getItem("user") || "null");
  const navigate = useNavigate();

  const [user, setUser] = useState(storedUser ? { ...storedUser } : null);

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const updateProfile = async () => {
    try {
      const res = await axios.put(
        `http://localhost:5000/user/${user.id}`,
        user
      );

      localStorage.setItem("user", JSON.stringify(res.data));
      alert("Profile updated");
    } catch (err) {
      console.error(err);
      alert("Update failed");
    }
  };

  if (!user) {
    return (
      <div className="wrapper">
        <div className="profile-card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Profile</p>
              <h2>No user found</h2>
            </div>
            <p className="section-copy">Please log in first so your profile information can be loaded.</p>
          </div>
          <div className="profile-actions">
            <button onClick={() => navigate("/login")}>Go to Login</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="navbar">
        <div className="nav-left">Recipe App</div>
        <div className="nav-right" onClick={() => navigate("/dashboard")}>
          Dashboard
        </div>
      </div>

      <div className="wrapper">
        <div className="profile-card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Profile</p>
              <h2>Edit your preferences</h2>
            </div>
            <p className="section-copy">Update your food choices here so the dashboard can suggest better recipes.</p>
          </div>

          <div className="profile-form">
            <input name="dietary_preferences" value={user.dietary_preferences || ""} onChange={handleChange} placeholder="Dietary preferences" />
            <input name="allergies" value={user.allergies || ""} onChange={handleChange} placeholder="Allergies" />
            <input name="skill_level" value={user.skill_level || ""} onChange={handleChange} placeholder="Skill level" />
            <input name="preferred_ingredients" value={user.preferred_ingredients || ""} onChange={handleChange} placeholder="Preferred ingredients" />
            <input name="avoid_ingredients" value={user.avoid_ingredients || ""} onChange={handleChange} placeholder="Avoid ingredients" />
          </div>

          <div className="profile-actions">
            <button onClick={updateProfile}>Save Changes</button>
            <button className="secondary-button" onClick={() => navigate("/dashboard")}>
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

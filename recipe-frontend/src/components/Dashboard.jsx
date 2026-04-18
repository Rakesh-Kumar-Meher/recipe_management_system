import { useEffect, useState } from "react";
import axios from "axios";
import "../styles/dashboard.css";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [recipes, setRecipes] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(null);
  const [cuisine, setCuisine] = useState("");
  const [diet, setDiet] = useState("");
  const [type, setType] = useState("");
  const [time, setTime] = useState("");
  const [include, setInclude] = useState("");
  const [exclude, setExclude] = useState("");
  const [rating, setRating] = useState(1);
  const [comment, setComment] = useState("");

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const formatValue = (value, fallback = "Not specified") =>
    value && String(value).trim() ? value : fallback;

  useEffect(() => {
    if (selectedRecipe) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [selectedRecipe]);

  const searchRecipes = async () => {
    try {
      const res = await axios.get("http://localhost:5000/recipes", {
        params: {
          cuisine,
          diet,
          type,
          maxReadyTime: time,
          includeIngredients: include,
          excludeIngredients: exclude
        }
      });

      setRecipes(res.data);
      setSelectedRecipe(null);
    } catch (err) {
      console.error(err);
    }
  };

  const getDetails = async (id) => {
    const res = await axios.get(`http://localhost:5000/recipe/${id}`);
    setSelectedRecipe(res.data);
    loadReviews(id);
  };

  const loadReviews = async (recipeId) => {
    const res = await axios.get(`http://localhost:5000/reviews/${recipeId}`);
    setReviews(res.data.reviews);
    setAvgRating(res.data.avgRating);
  };

  const submitReview = async () => {
    if (!comment.trim()) {
      alert("Enter comment");
      return;
    }

    await axios.post("http://localhost:5000/review", {
      user_id: user.id,
      recipe_id: selectedRecipe.id,
      rating: Number(rating),
      comment
    });

    setComment("");
    loadReviews(selectedRecipe.id);
  };

  if (!user) {
    return (
      <div className="wrapper">
        <div className="profile-card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Welcome</p>
              <h2>Please log in first</h2>
            </div>
            <p className="section-copy">Your dashboard needs a saved user profile before it can show recipe suggestions.</p>
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

        <div className="nav-right" onClick={() => navigate("/profile")}>
          Profile
        </div>
      </div>

      <div className={selectedRecipe ? "wrapper wrapper--detail" : "wrapper"}>
        {!selectedRecipe && (
          <>
            <div className="profile-card">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">Your Kitchen</p>
                  <h2>Welcome, {user.name}</h2>
                </div>
                <p className="section-copy">Search by cuisine, diet, or ingredients to quickly find recipes that fit your profile.</p>
              </div>

              <div className="profile-grid">
                <div className="profile-item">
                  <span>Diet</span>
                  <strong>{formatValue(user.dietary_preferences)}</strong>
                </div>
                <div className="profile-item">
                  <span>Allergies</span>
                  <strong>{formatValue(user.allergies, "None listed")}</strong>
                </div>
                <div className="profile-item">
                  <span>Skill Level</span>
                  <strong>{formatValue(user.skill_level)}</strong>
                </div>
                <div className="profile-item">
                  <span>Preferred Ingredients</span>
                  <strong>{formatValue(user.preferred_ingredients)}</strong>
                </div>
                <div className="profile-item">
                  <span>Avoid Ingredients</span>
                  <strong>{formatValue(user.avoid_ingredients)}</strong>
                </div>
              </div>
            </div>

            <div className="filters">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">Recipe Search</p>
                  <h3>Find something good for today</h3>
                </div>
                <p className="section-copy">Use a few simple filters and the app will fetch matching recipes for you.</p>
              </div>

              <div className="filter-grid">
                <input placeholder="Cuisine" onChange={(e) => setCuisine(e.target.value)} />
                <input placeholder="Diet" onChange={(e) => setDiet(e.target.value)} />

                <select onChange={(e) => setType(e.target.value)}>
                  <option value="">Meal Type</option>
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="dinner">Dinner</option>
                </select>

                <input placeholder="Max Time in Minutes" onChange={(e) => setTime(e.target.value)} />
                <input placeholder="Include Ingredients" onChange={(e) => setInclude(e.target.value)} />
                <input placeholder="Exclude Ingredients" onChange={(e) => setExclude(e.target.value)} />

                <button onClick={searchRecipes}>Search Recipes</button>
              </div>
            </div>

          <div>
            <div className="results-header">
              <div>
                <p className="eyebrow">Results</p>
                <h3>Recipe ideas</h3>
              </div>
              <p className="section-copy">
                {recipes.length > 0 ? `${recipes.length} recipes found.` : "Search once to load recipe cards here."}
              </p>
            </div>

            {recipes.length === 0 ? (
              <div className="empty-state">Use the search filters above to explore recipes that match your taste.</div>
            ) : (
              <div className="recipes">
                {recipes.map((recipe) => (
                  <div key={recipe.id} className="card" onClick={() => getDetails(recipe.id)}>
                    <img src={recipe.image} alt={recipe.title} />
                    <div className="card-content">
                      <h4>{recipe.title}</h4>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          </>
        )}

        {selectedRecipe && (
          <div className="details">
            <div className="details-hero">
              <div>
                <p className="eyebrow">Recipe Details</p>
                <h2 className="details-title">{selectedRecipe.title}</h2>
              </div>
              <button className="secondary-button" onClick={() => setSelectedRecipe(null)}>
                Back to Results
              </button>
            </div>

            <div className="details-layout">
              <img className="details-image" src={selectedRecipe.image} alt={selectedRecipe.title} />

              <div className="details-stack">
                <div className="detail-panel">
                  <h3>Ingredients</h3>
                  <ul className="detail-list">
                    {selectedRecipe.extendedIngredients?.map((ingredient, index) => (
                      <li key={index}>{ingredient.original}</li>
                    ))}
                  </ul>
                </div>

                <div className="detail-panel">
                  <h3>Instructions</h3>
                  <div
                    className="instruction-text"
                    dangerouslySetInnerHTML={{
                      __html: selectedRecipe.instructions || "<p>No instructions available for this recipe.</p>"
                    }}
                  />
                </div>

                <div className="detail-panel">
                  <h3>Nutrition</h3>
                  {selectedRecipe.nutrition?.nutrients?.length ? (
                    <ul className="detail-list">
                      {selectedRecipe.nutrition.nutrients.slice(0, 5).map((nutrient, index) => (
                        <li key={index}>
                          {nutrient.name}: {nutrient.amount} {nutrient.unit}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="instruction-text">Nutrition data is not available for this recipe.</p>
                  )}
                </div>

                <div className="detail-panel">
                  <div className="rating-chip">
                    Average Rating: {avgRating ? Number(avgRating).toFixed(1) : "No ratings yet"}
                  </div>

                  <div className="review-form">
                    <select value={rating} onChange={(e) => setRating(e.target.value)}>
                      <option value="1">1 Star</option>
                      <option value="2">2 Stars</option>
                      <option value="3">3 Stars</option>
                      <option value="4">4 Stars</option>
                      <option value="5">5 Stars</option>
                    </select>

                    <input
                      placeholder="Write a short comment"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    />

                    <button onClick={submitReview}>Submit Review</button>
                  </div>

                  <div className="reviews-list">
                    {reviews.length === 0 ? (
                      <div className="review-empty">No reviews yet. Be the first to add one.</div>
                    ) : (
                      reviews.map((review, index) => (
                        <div key={index} className="review">
                          <span className="review-rating">Rating: {review.rating}/5</span>
                          <p>{review.comment}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

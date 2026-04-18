const express = require("express");
const cors = require("cors");
const pool = require("./db");
const axios = require("axios");
const {
  CACHE_TTL,
  buildRecipeSearchKey,
  buildRecipeDetailKey,
  getCacheEntry,
  setCacheEntry
} = require("./cache");

require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const setCacheHeader = (res, status) => {
  res.set("X-Cache", status);
};

const logCacheStatus = (status, key) => {
  console.log(`[CACHE ${status}] ${key}`);
};

const fetchReviewsPayload = async (recipeId) => {
  const reviewsResult = await pool.query(
    `SELECT * FROM reviews WHERE recipe_id = $1`,
    [recipeId]
  );

  const avgResult = await pool.query(
    `SELECT AVG(rating) AS avg_rating FROM reviews WHERE recipe_id = $1`,
    [recipeId]
  );

  return {
    reviews: reviewsResult.rows,
    avgRating: avgResult.rows[0].avg_rating
  };
};

app.post("/register", async (req, res) => {
  const {
    name,
    email,
    password,
    dietary_preferences,
    allergies,
    skill_level,
    preferred_ingredients,
    avoid_ingredients
  } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO users (name, email, password, dietary_preferences, allergies, skill_level, preferred_ingredients, avoid_ingredients)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [
        name,
        email,
        password,
        dietary_preferences,
        allergies,
        skill_level,
        preferred_ingredients,
        avoid_ingredients
      ]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error saving user");
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const result = await pool.query(
    "SELECT * FROM users WHERE email=$1 AND password=$2",
    [email, password]
  );

  if (result.rows.length > 0) {
    res.json({ success: true, user: result.rows[0] });
  } else {
    res.json({ success: false });
  }
});

app.get("/recipes", async (req, res) => {
  const {
    cuisine,
    diet,
    type,
    maxReadyTime,
    includeIngredients,
    excludeIngredients
  } = req.query;

  const cacheKey = buildRecipeSearchKey(req.query);
  const cachedRecipes = getCacheEntry(cacheKey);

  if (cachedRecipes !== undefined) {
    setCacheHeader(res, "HIT");
    logCacheStatus("HIT", cacheKey);
    return res.json(cachedRecipes);
  }

  try {
    setCacheHeader(res, "MISS");
    logCacheStatus("MISS", cacheKey);

    const params = {
      apiKey: process.env.API_KEY,
      number: 10
    };

    if (cuisine) params.cuisine = cuisine.toLowerCase();
    if (diet) params.diet = diet;
    if (type) params.type = type;
    if (maxReadyTime) params.maxReadyTime = maxReadyTime;
    if (includeIngredients) params.includeIngredients = includeIngredients;
    if (excludeIngredients) params.excludeIngredients = excludeIngredients;

    const response = await axios.get(
      "https://api.spoonacular.com/recipes/complexSearch",
      { params }
    );

    setCacheEntry(cacheKey, response.data.results, CACHE_TTL.recipeSearch);

    res.json(response.data.results);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching recipes");
  }
});

app.get("/recipe/:id", async (req, res) => {
  const cacheKey = buildRecipeDetailKey(req.params.id);
  const cachedRecipe = getCacheEntry(cacheKey);

  if (cachedRecipe !== undefined) {
    setCacheHeader(res, "HIT");
    logCacheStatus("HIT", cacheKey);
    return res.json(cachedRecipe);
  }

  try {
    setCacheHeader(res, "MISS");
    logCacheStatus("MISS", cacheKey);

    const response = await axios.get(
      `https://api.spoonacular.com/recipes/${req.params.id}/information`,
      {
        params: {
          apiKey: process.env.API_KEY,
          includeNutrition: true
        }
      }
    );

    setCacheEntry(cacheKey, response.data, CACHE_TTL.recipeDetail);

    res.json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching recipe details");
  }
});

app.post("/review", async (req, res) => {
  try {
    const { user_id, recipe_id, rating, comment } = req.body;

    await pool.query(
      `INSERT INTO reviews (user_id, recipe_id, rating, comment)
       VALUES ($1, $2, $3, $4)`,
      [user_id, recipe_id, rating, comment]
    );

    res.send("Review added");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error adding review");
  }
});

app.get("/reviews/:recipeId", async (req, res) => {
  try {
    const reviewPayload = await fetchReviewsPayload(req.params.recipeId);

    res.json(reviewPayload);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching reviews");
  }
});

app.put("/user/:id", async (req, res) => {
  const {
    dietary_preferences,
    allergies,
    skill_level,
    preferred_ingredients,
    avoid_ingredients
  } = req.body;

  try {
    const result = await pool.query(
      `UPDATE users
       SET dietary_preferences=$1,
           allergies=$2,
           skill_level=$3,
           preferred_ingredients=$4,
           avoid_ingredients=$5
       WHERE id=$6
       RETURNING *`,
      [
        dietary_preferences,
        allergies,
        skill_level,
        preferred_ingredients,
        avoid_ingredients,
        req.params.id
      ]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Update failed");
  }
});

const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(
      `Port ${PORT} is already in use. Stop the existing backend process or use a different PORT value.`
    );
  } else {
    console.error("Failed to start server:", error);
  }

  process.exit(1);
});

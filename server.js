const express = require("express")
const cors = require("cors")
const cookieParser = require("cookie-parser")
const bodyParser = require("body-parser")
const routes = require("./routes")
const connectDB = require("./config/db")
const { client } = require("./config/db")
require("dotenv").config()

// Create Express app
const app = express()

// Setup CORS for frontend connections
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://b10-a11-task.web.app",
      "https://b10-a11-task.firebaseapp.com",
      "https://culinary-canvas-kitchen.netlify.app",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "email"],
    credentials: true,
  }),
)

// Setup middleware for parsing requests
app.use(cookieParser())
app.use(bodyParser.json())

// Connect all API routes
app.use("/api", routes)

// Basic home route
app.get("/", (req, res) => {
  res.send("Welcome to the API")
})

// Get all foods route (direct route for testing)
app.get("/all-foods", async (req, res) => {
  try {
    const database = client.db("food_info")
    const foods = database.collection("food")
    const allFoods = await foods.find({}).toArray()
    res.status(200).json(allFoods)
  } catch (error) {
    console.error("Error fetching all foods:", error.message)
    res.status(500).json({ message: "Failed to retrieve all foods", error })
  }
})

const PORT = process.env.PORT || 5000

// Start server after database connection
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`)
    })
  })
  .catch((err) => {
    console.error("Failed to connect to the database", err)
  })

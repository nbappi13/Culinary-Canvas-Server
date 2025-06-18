const jwt = require("jsonwebtoken")

// Create JWT token for user
const generateToken = (user) => {
  return jwt.sign({ email: user.email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1h" })
}

// Handle user registration
const register = async (req, res) => {
  try {
    const { email, password } = req.body

    const user = { email }
    const token = generateToken(user)

    // Set secure cookie with token
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    })
    res.status(201).json({ user, token })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

// Handle user login
const login = async (req, res) => {
  try {
    const { email, password } = req.body

    const user = { email }
    const token = generateToken(user)

    // Set secure cookie with token
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    })
    res.status(200).json({ user, token })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

// Handle user logout
const logout = (req, res) => {
  res.clearCookie("token")
  res.status(200).json({ message: "Logged out successfully" })
}

module.exports = { register, login, logout }

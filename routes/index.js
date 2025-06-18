const express = require("express")
const router = express.Router()
const {
  addFood,
  getAllFoods,
  getFoodById,
  purchaseFood,
  getTopSellingFoods,
  getMyFoods,
  updateFood,
  getMyOrders,
  deleteOrder,
} = require("../controllers/foodController")
const { register, login, logout } = require("../controllers/authController")
const { addBooking } = require("../controllers/bookingController")
const { getDiscountFoods } = require("../controllers/discountController")
const authMiddleware = require("../middleware/authMiddleware")

// Authentication routes
router.post("/register", register)
router.post("/login", login)
router.post("/logout", logout)

// Food routes - public and protected
router.get("/foods", getAllFoods)
router.get("/foods/:id", getFoodById)
router.post("/foods/:id/purchase", authMiddleware, purchaseFood) 
router.get("/top-foods", getTopSellingFoods)

// Protected food management routes
router.get("/my-foods", authMiddleware, getMyFoods)
router.put("/update-food/:id", authMiddleware, updateFood)
router.post("/add-food", authMiddleware, addFood)

// Order management routes
router.get("/my-orders", authMiddleware, getMyOrders)
router.delete("/my-orders/:id", authMiddleware, deleteOrder)

// Booking and discount routes
router.post("/bookings", authMiddleware, addBooking)
router.get("/discounts/foods", getDiscountFoods)

module.exports = router
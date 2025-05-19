const express = require('express');
const router = express.Router();
const { addFood, getAllFoods, getFoodById, purchaseFood, getTopSellingFoods, getMyFoods, updateFood, getMyOrders, deleteOrder } = require('../controllers/foodController');
const { register, login, logout } = require('../controllers/authController');
const { addBooking } = require('../controllers/bookingController');
const authMiddleware = require('../middleware/authMiddleware');


router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);


router.get('/foods', getAllFoods);
router.get('/foods/:id', getFoodById);
router.post('/foods/:id/purchase', authMiddleware, purchaseFood);
router.post('/purchase', authMiddleware, purchaseFood);
router.get('/top-foods', getTopSellingFoods);
router.get('/my-foods', authMiddleware, getMyFoods);
router.put('/update-food/:id', authMiddleware, updateFood);
router.post('/add-food', authMiddleware, addFood);
router.get('/my-orders', authMiddleware, getMyOrders);
router.delete('/my-orders/:id', authMiddleware, deleteOrder);
router.post('/bookings', authMiddleware, addBooking);

module.exports = router;
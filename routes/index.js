const express = require('express');
const router = express.Router();
const { addFood, getAllFoods, getFoodById, purchaseFood, getTopSellingFoods, getMyFoods, updateFood } = require('../controllers/foodController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/foods', getAllFoods);
router.get('/foods/:id', getFoodById);
router.post('/foods/:id/purchase', purchaseFood);
router.post('/purchase', purchaseFood);
router.get('/top-foods', getTopSellingFoods);
router.get('/my-foods', authMiddleware, getMyFoods);
router.put('/update-food/:id', authMiddleware, updateFood);
router.post('/add-food', addFood);

module.exports = router;
const express = require('express');
const router = express.Router();
const { getAllFoods, getFoodById, purchaseFood } = require('../controllers/foodController');

router.get('/foods', getAllFoods);
router.get('/foods/:id', getFoodById);
router.post('/foods/:id/purchase', purchaseFood);
router.post('/purchase', purchaseFood);

module.exports = router;
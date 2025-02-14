const express = require('express');
const router = express.Router();
const { getAllFoods } = require('../controllers/foodController');

router.get('/foods', getAllFoods);

module.exports = router;
const { client } = require('../config/db');
const { ObjectId } = require('mongodb');

async function getAllFoods(req, res) {
  try {
    const { category, priceRange } = req.query;
    const database = client.db('food_info');
    const foods = database.collection('food');
    
    const filters = {};
    
    if (category) {
      filters.category = category;
    }
    
    if (priceRange) {
      const [min, max] = priceRange.split('-');
      filters.price = { $gte: parseFloat(min), $lte: parseFloat(max) };
    }
    
    const foodItems = await foods.find(filters).toArray();
    res.status(200).json(foodItems);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve food items', error });
  }
}

async function getFoodById(req, res) {
  try {
    const { id } = req.params;
    const database = client.db('food_info');
    const foods = database.collection('food');
    
    const food = await foods.findOne({ _id: new ObjectId(id) });
    if (!food) {
      return res.status(404).json({ message: 'Food not found' });
    }
    res.status(200).json(food);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve food item', error });
  }
}

async function purchaseFood(req, res) {
  try {
    const { id } = req.params;
    const database = client.db('food_info');
    const foods = database.collection('food');
    
    const result = await foods.updateOne(
      { _id: new ObjectId(id) },
      { $inc: { purchaseCount: 1 } }
    );
    
    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: 'Food not found' });
    }

    const updatedFood = await foods.findOne({ _id: new ObjectId(id) });
    res.status(200).json(updatedFood);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update purchase count', error });
  }
}

module.exports = { getAllFoods, getFoodById, purchaseFood };
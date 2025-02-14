const { client } = require('../config/db');

async function getAllFoods(req, res) {
  try {
    const database = client.db('food_info');
    const foods = database.collection('food');
    const foodItems = await foods.find({}).toArray();
    res.status(200).json(foodItems);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve food items', error });
  }
}

module.exports = { getAllFoods };
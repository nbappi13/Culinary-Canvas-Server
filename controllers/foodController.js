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
    const { foodId, foodName, price, quantity, buyerName, buyerEmail } = req.body;
    const database = client.db('food_info');
    const purchases = database.collection('purchases');

    const newPurchase = {
      foodId: new ObjectId(foodId),
      foodName,
      price,
      quantity,
      buyerName,
      buyerEmail,
      buyingDate: new Date().toISOString(), 
    };

    await purchases.insertOne(newPurchase);

    const updateResult = await database.collection('food').updateOne(
      { _id: new ObjectId(foodId) },
      {
        $inc: { quantity: -quantity, purchaseCount: quantity },
        $push: { orders: newPurchase } 
      }
    );

    if (updateResult.modifiedCount === 0) {
      return res.status(404).json({ message: 'Food not found' });
    }

    res.status(201).json({ message: 'Purchase successful' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to process purchase', error });
  }
}

async function getTopSellingFoods(req, res) {
  try {
    const database = client.db('food_info');
    const foods = database.collection('food');

    const topFoods = await foods.find().sort({ purchaseCount: -1 }).limit(6).toArray();
    res.status(200).json(topFoods);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve top-selling foods', error });
  }
}

module.exports = {
  getAllFoods,
  getFoodById,
  purchaseFood,
  getTopSellingFoods
};
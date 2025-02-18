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
    console.error('Error fetching foods:', error.message);
    res.status(500).json({ message: 'Failed to retrieve food items', error });
  }
}

async function getFoodById(req, res) {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid food ID' });
    }
    const database = client.db('food_info');
    const foods = database.collection('food');
    const food = await foods.findOne({ _id: new ObjectId(id) });
    if (!food) {
      return res.status(404).json({ message: 'Food not found' });
    }
    res.status(200).json(food);
  } catch (error) {
    console.error('Error fetching food by ID:', error.message);
    res.status(500).json({ message: 'Failed to retrieve food item', error });
  }
}

async function purchaseFood(req, res) {
  try {
    const { id } = req.params;
    const { foodId, foodName, price, quantity, buyerName, buyerEmail } = req.body;

    if (!ObjectId.isValid(id) || !ObjectId.isValid(foodId)) {
      return res.status(400).json({ message: 'Invalid food ID format' });
    }

    if (!foodId || !foodName || !price || !quantity || !buyerName || !buyerEmail) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const database = client.db('food_info');
    const purchases = database.collection('purchases');
    const newPurchase = {
      foodId: new ObjectId(foodId),
      foodName,
      price: parseFloat(price),
      quantity: parseInt(quantity, 10),
      buyerName,
      buyerEmail,
      buyingDate: new Date().toISOString(),
    };

    await purchases.insertOne(newPurchase);

    const updateResult = await database.collection('food').updateOne(
      { _id: new ObjectId(id) },
      {
        $inc: { quantity: -quantity, purchaseCount: quantity },
        $push: { orders: newPurchase },
      }
    );

    if (updateResult.modifiedCount === 0) {
      return res.status(404).json({ message: 'Food not found' });
    }

    console.log(`Updated purchaseCount for foodId: ${foodId}`);

    res.status(201).json({ message: 'Purchase successful' });
  } catch (error) {
    console.error('Error processing purchase:', error.message);
    res.status(500).json({ message: 'Failed to process purchase', error });
  }
}

async function getTopSellingFoods(req, res) {
  try {
    const database = client.db('food_info');
    const foods = database.collection('food');

    const topFoods = await foods.find().sort({ purchaseCount: -1 }).limit(6).toArray();

    console.log('Top-selling foods:', topFoods);

    res.status(200).json(topFoods);
  } catch (error) {
    console.error('Error fetching top-selling foods:', error.message);
    res.status(500).json({ message: 'Failed to retrieve top-selling foods', error });
  }
}

async function getMyFoods(req, res) {
  try {
    const email = req.headers.email;
    const database = client.db('food_info');
    const foods = database.collection('food');
    const userFoods = await foods.find({ 'addedBy.email': email }).toArray();
    res.status(200).json(userFoods);
  } catch (error) {
    console.error('Error fetching user foods:', error.message);
    res.status(500).json({ message: 'Failed to retrieve user foods', error });
  }
}

async function updateFood(req, res) {
  try {
    const { id } = req.params;
    const email = req.headers.email;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid food ID' });
    }

    const updateData = {
      name: req.body.name,
      image: req.body.image,
      category: req.body.category,
      quantity: parseInt(req.body.quantity, 10),
      price: parseFloat(req.body.price),
      description: {
        shortDescription: req.body.description?.shortDescription || '',
        foodOrigin: req.body.description?.foodOrigin || '',
      },
    };

    const database = client.db('food_info');
    const foods = database.collection('food');

    const updatedFood = await foods.findOneAndUpdate(
      { _id: new ObjectId(id), 'addedBy.email': email },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    if (!updatedFood.value) {
      return res.status(404).json({ message: 'Food not found or you do not have permission to update this food' });
    }

    res.status(200).json(updatedFood.value);
  } catch (error) {
    console.error('Failed to update food item:', error.message);
    res.status(500).json({ message: 'Failed to update food item', error });
  }
}

async function addFood(req, res) {
  try {
    const { name, image, category, quantity, price, addedBy, email, origin, description } = req.body;
    if (!name || !image || !category || !quantity || !price || !addedBy || !email || !origin || !description) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    const newFood = {
      name,
      image,
      category,
      quantity: parseInt(quantity, 10),
      price: parseFloat(price),
      addedBy: { name: addedBy, email },
      description: {
        shortDescription: description,
        ingredients: [],
        makingProcedure: '',
        foodOrigin: origin,
      },
      purchaseCount: 0,
      orders: [],
      addedDate: new Date().toISOString(),
    };
    const database = client.db('food_info');
    const foods = database.collection('food');
    await foods.insertOne(newFood);
    res.status(201).json(newFood);
  } catch (error) {
    console.error('Failed to add food item:', error.message);
    res.status(500).json({ message: 'Failed to add food item', error });
  }
}

async function getMyOrders(req, res) {
  try {
    const email = req.headers.email;
    const database = client.db('food_info');
    const purchases = database.collection('purchases');
    const userOrders = await purchases.aggregate([
      { $match: { buyerEmail: email } },
      {
        $lookup: {
          from: 'food',
          localField: 'foodId',
          foreignField: '_id',
          as: 'foodDetails',
        },
      },
      { $unwind: '$foodDetails' },
    ]).toArray();
    res.status(200).json(userOrders);
  } catch (error) {
    console.error('Error fetching user orders:', error.message);
    res.status(500).json({ message: 'Failed to retrieve user orders', error });
  }
}

async function deleteOrder(req, res) {
  try {
    const { id } = req.params;
    const email = req.headers.email;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid order ID' });
    }
    const database = client.db('food_info');
    const purchases = database.collection('purchases');
    const deleteResult = await purchases.deleteOne({ _id: new ObjectId(id), buyerEmail: email });
    if (deleteResult.deletedCount === 0) {
      return res.status(404).json({ message: 'Order not found or you do not have permission to delete this order' });
    }
    res.status(200).json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Failed to delete order:', error.message);
    res.status(500).json({ message: 'Failed to delete order', error });
  }
}

module.exports = {
  getAllFoods,
  getFoodById,
  purchaseFood,
  getTopSellingFoods,
  getMyFoods,
  updateFood,
  addFood,
  getMyOrders,
  deleteOrder,
};
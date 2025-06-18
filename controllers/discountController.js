// discountController.js
const { client } = require("../config/db");
const { ObjectId } = require("mongodb");

// Get discounted foods based on how long they've been in the system
async function getDiscountFoods(req, res) {
  try {
    const database = client.db("food_info");
    const foodsCollection = database.collection("food");

    // Get oldest 4 foods from database
    const result = await foodsCollection
      .find({})
      .sort({ addedDate: 1 }) // Sort by oldest first
      .limit(4)
      .toArray();

    // Calculate discount for each food
    const discountedFoods = result.map((food) => {
      // Calculate days since food was added
      const daysSinceAdded = Math.floor(
        (Date.now() - new Date(food.addedDate)) / (1000 * 60 * 60 * 24)
      );

      // Set discount percentage based on days
      let discountPercentage = 0;
      if (daysSinceAdded > 30) {
        discountPercentage = 30; // 30% discount if older than 30 days
      } else if (daysSinceAdded > 15) {
        discountPercentage = 15; // 15% discount if older than 15 days
      }

      // Calculate discounted price
      const discountedPrice = (food.price * ((100 - discountPercentage) / 100)).toFixed(2);

      // Return food with discount info
      return {
        ...food,
        discountPercentage,
        discountedPrice,
      };
    });

    res.status(200).json(discountedFoods);
  } catch (error) {
    console.error("Error fetching discount foods:", error.message);
    res.status(500).json({ message: "Failed to fetch discount foods", error });
  }
}

module.exports = {
  getDiscountFoods,
};
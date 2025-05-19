const { client } = require("../config/db");
const { ObjectId } = require("mongodb");

async function getDiscountFoods(req, res) {
  try {
    const database = client.db("food_info");
    const foodsCollection = database.collection("food");

   
    const result = await foodsCollection
      .find({})
      .sort({ addedDate: 1 }) 
      .limit(4)
      .toArray();

 
    const discountedFoods = result.map((food) => {
      const daysSinceAdded = Math.floor(
        (Date.now() - new Date(food.addedDate)) / (1000 * 60 * 60 * 24)
      );

      let discountPercentage = 0;
      if (daysSinceAdded > 30) {
        discountPercentage = 30;
      } else if (daysSinceAdded > 15) {
        discountPercentage = 15;
      }

      const discountedPrice = (food.price * ((100 - discountPercentage) / 100)).toFixed(2);

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
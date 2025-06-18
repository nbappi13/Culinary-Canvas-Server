const { client } = require("../config/db")
const { ObjectId } = require("mongodb")

// Get all foods with search and filter options
async function getAllFoods(req, res) {
  try {
    const { category, priceRange, page = 1, limit = 9, name } = req.query
    const database = client.db("food_info")
    const foods = database.collection("food")
    const filters = {}

    // Add search by name filter
    if (name) {
      filters.name = { $regex: name, $options: "i" }
    }
    // Add category filter
    if (category) {
      filters.category = category
    }
    // Add price range filter
    if (priceRange) {
      const [min, max] = priceRange.split("-")
      filters.price = { $gte: Number.parseFloat(min), $lte: Number.parseFloat(max) }
    }

    // Calculate pagination
    const skip = (page - 1) * limit
    const foodItems = await foods.find(filters).skip(skip).limit(Number.parseInt(limit)).toArray()
    const totalCount = await foods.countDocuments(filters)

    res.status(200).json({
      foodItems,
      currentPage: Number.parseInt(page),
      totalPages: Math.ceil(totalCount / limit),
      totalCount,
    })
  } catch (error) {
    console.error("Error fetching foods:", error.message)
    res.status(500).json({ message: "Failed to retrieve food items", error })
  }
}

// Get single food by ID
async function getFoodById(req, res) {
  try {
    const { id } = req.params
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid food ID" })
    }
    const database = client.db("food_info")
    const foods = database.collection("food")
    const food = await foods.findOne({ _id: new ObjectId(id) })
    if (!food) {
      return res.status(404).json({ message: "Food not found" })
    }
    res.status(200).json(food)
  } catch (error) {
    console.error("Error fetching food by ID:", error.message)
    res.status(500).json({ message: "Failed to retrieve food item", error })
  }
}

// Handle food purchase
async function purchaseFood(req, res) {
  try {
    const { id } = req.params
    const { foodId, foodName, price, quantity, buyerName, buyerEmail } = req.body

    if (!ObjectId.isValid(id) || !ObjectId.isValid(foodId)) {
      return res.status(400).json({ message: "Invalid food ID format" })
    }

    if (!foodId || !foodName || !price || !quantity || !buyerName || !buyerEmail) {
      return res.status(400).json({ message: "All fields are required" })
    }

    const database = client.db("food_info")
    const purchases = database.collection("purchases")

    // Create new purchase record
    const newPurchase = {
      foodId: new ObjectId(foodId),
      foodName,
      price: Number.parseFloat(price),
      quantity: Number.parseInt(quantity, 10),
      buyerName,
      buyerEmail,
      buyingDate: new Date().toISOString(),
    }

    // Save purchase to database
    await purchases.insertOne(newPurchase)

    // Update food quantity and purchase count
    const updateResult = await database.collection("food").updateOne(
      { _id: new ObjectId(id) },
      {
        $inc: { quantity: -quantity, purchaseCount: quantity },
        $push: { orders: newPurchase },
      },
    )

    if (updateResult.modifiedCount === 0) {
      return res.status(404).json({ message: "Food not found" })
    }

    console.log(`Updated purchaseCount for foodId: ${foodId}`)

    res.status(201).json({ message: "Purchase successful" })
  } catch (error) {
    console.error("Error processing purchase:", error.message)
    res.status(500).json({ message: "Failed to process purchase", error })
  }
}

// Get top selling foods
async function getTopSellingFoods(req, res) {
  try {
    const database = client.db("food_info")
    const foods = database.collection("food")

    // Sort by purchase count and get top 6
    const topFoods = await foods.find().sort({ purchaseCount: -1 }).limit(6).toArray()

    console.log("Top-selling foods:", topFoods)

    res.status(200).json(topFoods)
  } catch (error) {
    console.error("Error fetching top-selling foods:", error.message)
    res.status(500).json({ message: "Failed to retrieve top-selling foods", error })
  }
}

// Get foods added by specific user
async function getMyFoods(req, res) {
  try {
    const email = req.headers.email
    const database = client.db("food_info")
    const foods = database.collection("food")
    const userFoods = await foods.find({ "addedBy.email": email }).toArray()
    res.status(200).json(userFoods)
  } catch (error) {
    console.error("Error fetching user foods:", error.message)
    res.status(500).json({ message: "Failed to retrieve user foods", error })
  }
}

// Update food item
async function updateFood(req, res) {
  try {
    const { id } = req.params
    const email = req.headers.email

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid food ID" })
    }

    // Prepare update data
    const updateData = {
      name: req.body.name,
      image: req.body.image,
      category: req.body.category,
      quantity: Number.parseInt(req.body.quantity, 10),
      price: Number.parseFloat(req.body.price),
      description: {
        shortDescription: req.body.description?.shortDescription || "",
        foodOrigin: req.body.description?.foodOrigin || "",
      },
    }

    const database = client.db("food_info")
    const foods = database.collection("food")

    // Update only if user owns the food item
    const updatedFood = await foods.findOneAndUpdate(
      { _id: new ObjectId(id), "addedBy.email": email },
      { $set: updateData },
      { returnDocument: "after" },
    )

    if (!updatedFood.value) {
      return res.status(404).json({
        message: "Food not found or you do not have permission to update this food",
      })
    }

    res.status(200).json(updatedFood.value)
  } catch (error) {
    console.error("Failed to update food item:", error.message)
    res.status(500).json({ message: "Failed to update food item", error })
  }
}

// Add new food item
async function addFood(req, res) {
  try {
    const { name, image, category, quantity, price, addedBy, email, origin, description } = req.body

    // Check if all required fields are provided
    if (!name || !image || !category || !quantity || !price || !addedBy || !email || !origin || !description) {
      return res.status(400).json({ message: "All fields are required" })
    }

    // Create new food object
    const newFood = {
      name,
      image,
      category,
      quantity: Number.parseInt(quantity, 10),
      price: Number.parseFloat(price),
      addedBy: { name: addedBy, email },
      description: {
        shortDescription: description,
        ingredients: [],
        makingProcedure: "",
        foodOrigin: origin,
      },
      purchaseCount: 0,
      orders: [],
      addedDate: new Date().toISOString(),
    }

    const database = client.db("food_info")
    const foods = database.collection("food")
    await foods.insertOne(newFood)
    res.status(201).json(newFood)
  } catch (error) {
    console.error("Failed to add food item:", error.message)
    res.status(500).json({ message: "Failed to add food item", error })
  }
}

// Get user's orders
async function getMyOrders(req, res) {
  try {
    const email = req.headers.email
    const database = client.db("food_info")
    const purchases = database.collection("purchases")

    // Get orders with food details using aggregation
    const userOrders = await purchases
      .aggregate([
        { $match: { buyerEmail: email } },
        {
          $lookup: {
            from: "food",
            localField: "foodId",
            foreignField: "_id",
            as: "foodDetails",
          },
        },
        { $unwind: "$foodDetails" },
      ])
      .toArray()
    res.status(200).json(userOrders)
  } catch (error) {
    console.error("Error fetching user orders:", error.message)
    res.status(500).json({ message: "Failed to retrieve user orders", error })
  }
}

// Delete user's order
async function deleteOrder(req, res) {
  try {
    const { id } = req.params
    const email = req.headers.email
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid order ID" })
    }
    const database = client.db("food_info")
    const purchases = database.collection("purchases")

    // Delete only if user owns the order
    const deleteResult = await purchases.deleteOne({
      _id: new ObjectId(id),
      buyerEmail: email,
    })
    if (deleteResult.deletedCount === 0) {
      return res.status(404).json({
        message: "Order not found or you do not have permission to delete this order",
      })
    }
    res.status(200).json({ message: "Order deleted successfully" })
  } catch (error) {
    console.error("Failed to delete order:", error.message)
    res.status(500).json({ message: "Failed to delete order", error })
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
}

const { MongoClient, ServerApiVersion } = require("mongodb")
require("dotenv").config()

// MongoDB connection string with environment variables
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.0fter.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`

// Create MongoDB client
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
})

// Function to connect to database
async function connectDB() {
  try {
    // await client.connect();
    console.log("Connected to MongoDB!")
    return client
  } catch (error) {
    console.error("Error connecting to MongoDB:", error)
    throw error
  }
}

module.exports = connectDB
module.exports.client = client

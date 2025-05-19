const { client } = require('../config/db');
const { ObjectId } = require('mongodb');


async function addBooking(req, res) {
  try {
    const bookingData = req.body;

  
    const requiredFields = ['name', 'email', 'date', 'time', 'guests'];
    for (const field of requiredFields) {
      if (!bookingData[field]) {
        return res.status(400).json({ error: `Missing required field: ${field}` });
      }
    }

  
    const database = client.db("food_info");
    const bookingsCollection = database.collection("bookings");

  
    const newBooking = {
      ...bookingData,
      bookedAt: new Date().toISOString()
    };

    const result = await bookingsCollection.insertOne(newBooking);

    res.status(201).json({
      message: "Booking saved successfully",
      bookingId: result.insertedId
    });

  } catch (error) {
    console.error("Error saving booking:", error.message);
    res.status(500).json({ error: "Failed to save booking" });
  }
}

module.exports = {
  addBooking
};
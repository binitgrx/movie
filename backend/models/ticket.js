// Assuming you're using Mongoose for MongoDB interactions
const mongoose = require('mongoose');

// Define the schema for the Ticket model
const ticketSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  photo: {
    type: String, // Assuming you store the photo URL as a string
    default: 'default_photo_url.jpg', // You can set a default photo if needed
  }
});

// Compile the schema into a model
const Ticket = mongoose.model('Ticket', ticketSchema);

module.exports = Ticket;

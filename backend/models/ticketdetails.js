const mongoose = require('mongoose');

const ticketDetailSchema = new mongoose.Schema({
  name: {
    type: String,
    
  },
  description: {
    type: String,
    
  },
  slip: {
    type: String, // Assuming you store the photo URL as a string
    default: 'default_photo_url.jpg',
  },
  number:{
    type:String
  },
  status:{
    type:String,
    default:"unverified"
  },
  email:{
    type:String
  }
});

const TicketDetail = mongoose.model('TicketDetail', ticketDetailSchema);

module.exports = TicketDetail;
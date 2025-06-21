const mongoose = require('mongoose');

const PetProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  name: {
    type: String,
    required: true
  },
  species: {
    type: String,
    required: true
  },
  breed: {
    type: String
  },
  age: {
    type: Number
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const PetProfile = mongoose.model('PetProfile', PetProfileSchema);

module.exports = PetProfile;  // ✅ Esta es la clave

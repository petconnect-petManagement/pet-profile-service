const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const PetProfile = require('../models/PetProfile');
const authMiddleware = require('../middleware/authMiddleware');
const axios = require('axios');


router.post('/',
  authMiddleware,
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('species').notEmpty().withMessage('Species is required'),
    body('age').optional().isInt({ min: 0 }).withMessage('Age must be a positive number')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const userId = req.user.id;

      // Verificamos que el user existe en user-profile-service
      const response = await axios.get(`http://localhost:3001/user/${userId}`);

      if (!response.data) {
        return res.status(400).json({ message: 'User not found in user-profile-service' });
      }

      const pet = new PetProfile({
        userId,
        ...req.body
      });

      await pet.save();
      res.status(201).json(pet);
    } catch (err) {
      console.error(err.message);

      if (err.response && err.response.status === 404) {
        return res.status(400).json({ message: 'User not found in user-profile-service' });
      }

      res.status(500).json({ message: err.message });
    }
});


router.get('/:id', async (req, res) => {
  try {
    const pet = await PetProfile.findById(req.params.id);
    if (!pet) {
      return res.status(404).json({ message: 'Pet not found' });
    }
    res.json(pet);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.put('/:id',
  authMiddleware,
  async (req, res) => {
    try {
      const pet = await PetProfile.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );
      res.json(pet);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
});

router.delete('/:id',
  authMiddleware,
  async (req, res) => {
    try {
      await PetProfile.findByIdAndDelete(req.params.id);
      res.json({ message: 'Pet deleted' });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
});


router.get('/user/:userId', async (req, res) => {
  try {
    const pets = await PetProfile.find({ userId: req.params.userId });
    res.json(pets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

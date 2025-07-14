const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const PetProfile = require('../models/PetProfile');
const authMiddleware = require('../middleware/authMiddleware');
const axios = require('axios');

// Crear perfil de mascota
router.post(
  '/',
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

      // ✅ Verifica existencia del usuario en user-profile-service vía Docker
      const response = await axios.get(
        `http://user-profile-service:3001/api/user-profile/user/${userId}`
      );

      if (!response.data) {
        return res.status(400).json({ message: 'User not found in user-profile-service' });
      }

      const pet = new PetProfile({
        userId,
        ...req.body
      });

      await pet.save();

      // ✅ Respuesta estructurada con pet_id
      res.status(201).json({
        pet_id: pet._id,
        userId: pet.userId,
        name: pet.name,
        species: pet.species,
        breed: pet.breed,
        age: pet.age,
        createdAt: pet.createdAt
      });

    } catch (err) {
      console.error(err.message);

      if (err.response && err.response.status === 404) {
        return res.status(400).json({ message: 'User not found in user-profile-service' });
      }

      res.status(500).json({ message: err.message });
    }
  }
);

// Obtener una mascota por su ID
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

// Actualizar mascota
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const pet = await PetProfile.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(pet);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Eliminar mascota
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await PetProfile.findByIdAndDelete(req.params.id);
    res.json({ message: 'Pet deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Obtener todas las mascotas de un usuario
router.get('/user/:userId', async (req, res) => {
  try {
    const pets = await PetProfile.find({ userId: req.params.userId });
    res.json(pets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

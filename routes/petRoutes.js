const express = require('express');
const router = express.Router();
const PetProfile = require('../models/PetProfile');
const authMiddleware = require('../middleware/authMiddleware');
const { body, validationResult } = require('express-validator');


// Crear perfil de mascota
router.post('/',
  authMiddleware,
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('species').notEmpty().withMessage('Species is required'),
    body('age').isInt({ min: 0 }).withMessage('Age must be a positive number')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const pet = new PetProfile({
        userId: req.user.id,
        ...req.body
      });
      await pet.save();
      res.status(201).json(pet);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
});


// Listar mascotas por usuario (debe ir PRIMERO!)
router.get('/user/:userId', async (req, res) => {
  try {
    const pets = await PetProfile.find({ userId: req.params.userId });
    res.json(pets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Obtener perfil de mascota
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

// Actualizar perfil de mascota
router.put('/:id', authMiddleware, async (req, res) => {
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

// Eliminar perfil de mascota
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await PetProfile.findByIdAndDelete(req.params.id);
    res.json({ message: 'Pet deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

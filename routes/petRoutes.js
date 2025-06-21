const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const PetProfile = require('../models/PetProfile');
const authMiddleware = require('../middleware/authMiddleware');

/**
 * @swagger
 * /pets:
 *   post:
 *     summary: Create a new pet profile
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               species:
 *                 type: string
 *               breed:
 *                 type: string
 *               age:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Pet created
 *       400:
 *         description: Validation error
 */
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

/**
 * @swagger
 * /pets/{id}:
 *   get:
 *     summary: Get pet profile by ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Pet profile found
 *       404:
 *         description: Pet not found
 */
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

/**
 * @swagger
 * /pets/{id}:
 *   put:
 *     summary: Update pet profile by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       description: Fields to update
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               species:
 *                 type: string
 *               breed:
 *                 type: string
 *               age:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Updated pet profile
 *       500:
 *         description: Server error
 */
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

/**
 * @swagger
 * /pets/{id}:
 *   delete:
 *     summary: Delete pet profile by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Pet deleted successfully
 *       500:
 *         description: Server error
 */
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

/**
 * @swagger
 * /pets/user/{userId}:
 *   get:
 *     summary: List all pets for a user
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of pets
 *       500:
 *         description: Server error
 */
router.get('/user/:userId', async (req, res) => {
  try {
    const pets = await PetProfile.find({ userId: req.params.userId });
    res.json(pets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

import express from 'express';
import mongoose from 'mongoose';
import School from '../models/School.js';

const router = express.Router();

// GET /api/schools - List all schools
router.get('/', async (req, res) => {
  try {
    const schools = await School.find({ isActive: true });
    res.json({ success: true, schools });
  } catch (error) {
    console.error('Error fetching schools:', error);
    res
      .status(500)
      .json({ success: false, message: 'Failed to fetch schools' });
  }
});

// POST /schools
router.post('/', async (req, res) => {
  try {
    const {
      name,
      address = {},
      contact = {},
      settings = {},
      isActive = true,
    } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'School name is required' });
    }
    const school = new School({
      name,
      address,
      contact,
      settings,
      isActive,
    });
    await school.save();
    res.status(201).json({ school });
  } catch (err) {
    res
      .status(500)
      .json({ error: 'Failed to create school', details: err.message });
  }
});

export default router;

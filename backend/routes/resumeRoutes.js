const express = require('express');
const { createResume, getResume, getResumeById, updateResume, deleteResume } = require('../controllers/resumeController');

const router = express.Router();

router.post('/', createResume);
router.get('/', getResume);
router.get('/:id', getResumeById);
router.put('/:id', updateResume);
router.delete('/:id', deleteResume);

module.exports = router;
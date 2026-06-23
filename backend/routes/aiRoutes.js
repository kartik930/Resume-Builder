const express = require("express");
const { optimizeResumeData } = require("../controllers/aiController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Protected route to optimize resume fields
router.post("/optimize", authMiddleware, optimizeResumeData);

module.exports = router;

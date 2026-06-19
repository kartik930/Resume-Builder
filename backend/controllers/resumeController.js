const Resume = require('../models/Resume');

exports.createResume = async (req, res) => {
    try {
        const resume = await Resume.create({
            ...req.body,
            userId: req.user.id
        });
        res.status(201).json({ message: 'Resume created successfully', resume });
    } catch (error) {
        res.status(500).json({ message: 'Failed to create resume', error: error.message });
    }
};

exports.getResume = async (req, res) => {
    try {
        const resumes = await Resume.find({ userId: req.user.id });
        res.json({ resumes });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch resumes', error: error.message });
    }
};

exports.getResumeById = async (req, res) => {
    try {
        const { id } = req.params;
        const resume = await Resume.findOne({ _id: id, userId: req.user.id });
        if (!resume) {
            return res.status(404).json({ message: 'Resume not found' });
        }
        res.json({ resume });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch resume', error: error.message });
    }
};

exports.updateResume = async (req, res) => {
    try {
        const { id } = req.params;
        const resume = await Resume.findOneAndUpdate(
            { _id: id, userId: req.user.id },
            req.body,
            { new: true }
        );
        if (!resume) {
            return res.status(404).json({ message: 'Resume not found or access denied' });
        }
        res.json({ message: 'Resume updated successfully', resume });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update resume', error: error.message });
    }
};

exports.deleteResume = async (req, res) => {
    try {
        const { id } = req.params;
        const resume = await Resume.findOneAndDelete({ _id: id, userId: req.user.id });
        if (!resume) {
            return res.status(404).json({ message: 'Resume not found or access denied' });
        }
        res.json({ message: 'Resume deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete resume', error: error.message });
    }
};
const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        default: 'Untitled Resume'
    },
    template: {
        type: String,
        default: 'ats'
    },
    personalInfo: {
        fullName: { type: String, default: '' },
        jobTitle: { type: String, default: '' },
        email: { type: String, default: '' },
        phone: { type: String, default: '' },
        address: { type: String, default: '' },
        linkedin: { type: String, default: '' },
        github: { type: String, default: '' },
        portfolio: { type: String, default: '' },
        summary: { type: String, default: '' }
    },
    education: [
        {
            id: String,
            school: { type: String, default: '' },
            degree: { type: String, default: '' },
            startDate: { type: String, default: '' },
            endDate: { type: String, default: '' },
            score: { type: String, default: '' },
            location: { type: String, default: '' }
        }
    ],
    technicalSkills: [String],
    internships: [
        {
            id: String,
            role: { type: String, default: '' },
            company: { type: String, default: '' },
            startDate: { type: String, default: '' },
            endDate: { type: String, default: '' },
            location: { type: String, default: '' },
            description: [String]
        }
    ],
    projects: [
        {
            id: String,
            title: { type: String, default: '' },
            date: { type: String, default: '' },
            link: { type: String, default: '' },
            description: [String]
        }
    ],
    achievements: [String],
    certificates: [
        {
            id: String,
            name: { type: String, default: '' },
            issuer: { type: String, default: '' },
            date: { type: String, default: '' }
        }
    ],
    extracurricular: [
        {
            id: String,
            role: { type: String, default: '' },
            organization: { type: String, default: '' },
            date: { type: String, default: '' },
            description: [String]
        }
    ],
    languages: [String]
}, { timestamps: true });

module.exports = mongoose.model('Resume', resumeSchema);
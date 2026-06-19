import React, { createContext, useState, useEffect } from 'react';
import sampleData from '../data/sampleResume.json';
import { generateId } from '../utils/helpers';

export const ResumeContext = createContext();

const createSafeResumeData = (data) => {
    // Ensure we always return a fully-shaped object so the Editor never crashes
    // even if localStorage gets corrupted or contains null/invalid payloads.
    const fallback = JSON.parse(JSON.stringify(sampleData));

    if (!data || typeof data !== 'object') return fallback;

    return {
        ...fallback,
        ...data,
        personalInfo: { ...fallback.personalInfo, ...(data.personalInfo || {}) },
        education: Array.isArray(data.education) ? data.education : fallback.education,
        technicalSkills: Array.isArray(data.technicalSkills) ? data.technicalSkills : fallback.technicalSkills,
        internships: Array.isArray(data.internships) ? data.internships : fallback.internships,
        projects: Array.isArray(data.projects) ? data.projects : fallback.projects,
        achievements: Array.isArray(data.achievements) ? data.achievements : fallback.achievements,
        certificates: Array.isArray(data.certificates) ? data.certificates : fallback.certificates,
        extracurricular: Array.isArray(data.extracurricular) ? data.extracurricular : fallback.extracurricular,
        languages: Array.isArray(data.languages) ? data.languages : fallback.languages,
    };
};

export const ResumeProvider = ({ children }) => {
    const [resumeData, setResumeData] = useState(() => {
        const saved = localStorage.getItem('resumeData');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                return createSafeResumeData(parsed);
            } catch (error) {
                return createSafeResumeData(null);
            }
        }
        return createSafeResumeData(null);
    });

    useEffect(() => {
        const safeData = createSafeResumeData(resumeData);
        localStorage.setItem('resumeData', JSON.stringify(safeData));
    }, [resumeData]);

    const updatePersonalInfo = (field, value) => {
        setResumeData(prev => ({
            ...prev,
            personalInfo: {
                ...prev.personalInfo,
                [field]: value
            }
        }));
    };

    const updateSectionItem = (section, id, field, value) => {
        setResumeData(prev => ({
            ...prev,
            [section]: prev[section].map(item =>
                item.id === id ? { ...item, [field]: value } : item
            )
        }));
    };

    const addSectionItem = (section, initialData = {}) => {
        setResumeData(prev => ({
            ...prev,
            [section]: [...prev[section], { id: generateId(), ...initialData }]
        }));
    };

    const removeSectionItem = (section, id) => {
        setResumeData(prev => ({
            ...prev,
            [section]: prev[section].filter(item => item.id !== id)
        }));
    };

    const updateSkills = (value) => {
        setResumeData(prev => ({
            ...prev,
            technicalSkills: value
        }));
    };

    const updateListSection = (section, index, value) => {
        setResumeData(prev => {
            const newList = [...prev[section]];
            newList[index] = value;
            return {
                ...prev,
                [section]: newList
            };
        });
    };

    const updateResumeData = (section, value) => {
        setResumeData(prev => ({
            ...prev,
            [section]: value
        }));
    };

    return (
        <ResumeContext.Provider value={{
            resumeData,
            updatePersonalInfo,
            updateSectionItem,
            addSectionItem,
            removeSectionItem,
            updateSkills,
            updateListSection,
            setResumeData,
            updateResumeData
        }}>
            {children}
        </ResumeContext.Provider>
    );
};

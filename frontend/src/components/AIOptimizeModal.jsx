import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Loader2, Check, AlertCircle, ArrowRight, BookOpen, Briefcase, Code, Cpu } from 'lucide-react';
import { aiAPI } from '../services/api';

const AIOptimizeModal = ({ isOpen, onClose, resumeData, onApply }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [loadingStage, setLoadingStage] = useState(0);
    const [error, setError] = useState(null);
    const [optimizedData, setOptimizedData] = useState(null);
    const [activeTab, setActiveTab] = useState('summary');

    // Selection state for what parts to apply
    const [applySelections, setApplySelections] = useState({
        summary: true,
        experience: true,
        projects: true,
        skills: true
    });

    const loadingStages = [
        "Analyzing your profile data...",
        "Polishing professional summary with key terms...",
        "Formatting experience bullet points using STAR format...",
        "Optimizing projects for recruiter impact...",
        "Compiling suggested technical skills..."
    ];

    // Trigger AI call when modal opens and we don't have optimized data yet
    useEffect(() => {
        if (isOpen && !optimizedData && !isLoading && !error) {
            fetchOptimizations();
        }
    }, [isOpen]);

    // Handle smooth loader messages
    useEffect(() => {
        let interval;
        if (isLoading) {
            interval = setInterval(() => {
                setLoadingStage((prev) => {
                    if (prev < loadingStages.length - 1) {
                        return prev + 1;
                    }
                    return prev;
                });
            }, 2500);
        } else {
            setLoadingStage(0);
        }
        return () => clearInterval(interval);
    }, [isLoading]);

    const fetchOptimizations = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const { data } = await aiAPI.optimize({ resumeData });
            if (data.success && data.optimizedData) {
                setOptimizedData(data.optimizedData);
            } else {
                throw new Error("Invalid response structure from server.");
            }
        } catch (err) {
            console.error(err);
            const errMsg = err.response?.data?.message || err.message;
            const isApiKeyMissing = err.response?.data?.code === 'API_KEY_MISSING';
            
            setError({
                message: errMsg,
                isApiKeyMissing
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleApply = () => {
        if (!optimizedData) return;

        const mergedData = { ...resumeData };

        if (applySelections.summary && optimizedData.personalInfo?.summary) {
            mergedData.personalInfo = {
                ...mergedData.personalInfo,
                summary: optimizedData.personalInfo.summary
            };
        }

        if (applySelections.experience && optimizedData.internships) {
            // Merge optimized bullet points into internships, keeping other fields
            mergedData.internships = (mergedData.internships || []).map((item, idx) => {
                const optItem = optimizedData.internships[idx];
                if (optItem && optItem.description) {
                    return {
                        ...item,
                        description: optItem.description
                    };
                }
                return item;
            });
        }

        if (applySelections.projects && optimizedData.projects) {
            // Merge optimized bullet points into projects, keeping other fields
            mergedData.projects = (mergedData.projects || []).map((item, idx) => {
                const optItem = optimizedData.projects[idx];
                if (optItem && optItem.description) {
                    return {
                        ...item,
                        description: optItem.description
                    };
                }
                return item;
            });
        }

        if (applySelections.skills && optimizedData.technicalSkills) {
            mergedData.technicalSkills = optimizedData.technicalSkills;
        }

        onApply(mergedData);
        onClose();
    };

    const toggleSelection = (key) => {
        setApplySelections(prev => ({ ...prev, [key]: !prev[key] }));
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                {/* Modal Container */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 15 }}
                    transition={{ type: "spring", duration: 0.4 }}
                    className="relative flex flex-col w-full max-w-5xl h-[85vh] bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-5 border-b border-border bg-gradient-to-r from-primary/5 via-transparent to-transparent">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-glow">
                                <Sparkles size={20} className="animate-pulse" />
                            </div>
                            <div>
                                <h3 className="font-bold text-heading flex items-center gap-2">
                                    AI Resume Enhancer
                                    <span className="text-[10px] font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase tracking-wider">
                                        Gemini Powered
                                    </span>
                                </h3>
                                <p className="text-xs text-subtext">Polish your wording, check ATS alignment, and optimize bullet points</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-subtext hover:text-heading hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-all"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Content Section */}
                    <div className="flex-1 overflow-hidden flex flex-col min-h-0 bg-[#fdfdfd] dark:bg-[#101012]">
                        {isLoading ? (
                            /* LOADING STATE */
                            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                                <div className="relative mb-6">
                                    <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                                    <Sparkles className="absolute inset-0 m-auto text-primary animate-pulse" size={24} />
                                </div>
                                <h4 className="font-bold text-lg text-heading mb-2">Enhancing your Resume</h4>
                                <AnimatePresence mode="wait">
                                    <motion.p
                                        key={loadingStage}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.3 }}
                                        className="text-sm text-subtext max-w-md h-6 font-medium"
                                    >
                                        {loadingStages[loadingStage]}
                                    </motion.p>
                                </AnimatePresence>
                            </div>
                        ) : error ? (
                            /* ERROR STATE */
                            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-lg mx-auto">
                                <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mb-4">
                                    <AlertCircle size={28} />
                                </div>
                                <h4 className="font-bold text-lg text-heading mb-2">Optimization Failed</h4>
                                <p className="text-sm text-subtext mb-6">{error.message}</p>

                                {error.isApiKeyMissing && (
                                    <div className="p-4 bg-orange-500/5 border border-orange-500/10 rounded-xl text-left text-xs mb-6 text-subtext leading-relaxed">
                                        <strong className="text-heading block mb-1">Configuration Needed:</strong>
                                        Please obtain a free Gemini API key from 
                                        <a href="https://aistudio.google.com/" target="_blank" rel="noreferrer" className="text-primary hover:underline ml-1 font-bold">
                                            Google AI Studio
                                        </a>, then paste it inside your <code>backend/.env</code> file as <code>GEMINI_API_KEY=your_key</code> and restart your backend.
                                    </div>
                                )}
                                
                                <div className="flex gap-3">
                                    <button onClick={onClose} className="btn-secondary px-6 py-2">
                                        Close
                                    </button>
                                    <button onClick={fetchOptimizations} className="btn-cta text-white px-6 py-2">
                                        Try Again
                                    </button>
                                </div>
                            </div>
                        ) : optimizedData ? (
                            /* COMPARISON VIEW */
                            <div className="flex-1 flex flex-col lg:flex-row min-h-0">
                                {/* Left Selector/Tabs Column */}
                                <div className="w-full lg:w-64 border-b lg:border-b-0 lg:border-r border-border p-4 space-y-4 flex-shrink-0 bg-surface/50">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-subtext px-2">Optimize Sections</h4>
                                    
                                    <div className="space-y-1">
                                        {/* Tab Summary */}
                                        <button
                                            onClick={() => setActiveTab('summary')}
                                            className={`w-full flex items-center justify-between p-3 rounded-xl text-sm font-medium transition-all ${
                                                activeTab === 'summary'
                                                    ? 'bg-primary/10 text-primary'
                                                    : 'text-text hover:bg-gray-100 dark:hover:bg-white/5'
                                            }`}
                                        >
                                            <span className="flex items-center gap-2">
                                                <BookOpen size={16} /> Summary
                                            </span>
                                            <input
                                                type="checkbox"
                                                checked={applySelections.summary}
                                                onChange={() => toggleSelection('summary')}
                                                onClick={(e) => e.stopPropagation()}
                                                className="accent-primary h-4 w-4 rounded border-border"
                                            />
                                        </button>

                                        {/* Tab Experience */}
                                        <button
                                            onClick={() => setActiveTab('experience')}
                                            className={`w-full flex items-center justify-between p-3 rounded-xl text-sm font-medium transition-all ${
                                                activeTab === 'experience'
                                                    ? 'bg-primary/10 text-primary'
                                                    : 'text-text hover:bg-gray-100 dark:hover:bg-white/5'
                                            }`}
                                        >
                                            <span className="flex items-center gap-2">
                                                <Briefcase size={16} /> Experience
                                            </span>
                                            <input
                                                type="checkbox"
                                                checked={applySelections.experience}
                                                onChange={() => toggleSelection('experience')}
                                                onClick={(e) => e.stopPropagation()}
                                                className="accent-primary h-4 w-4 rounded border-border"
                                                disabled={!resumeData?.internships?.length}
                                            />
                                        </button>

                                        {/* Tab Projects */}
                                        <button
                                            onClick={() => setActiveTab('projects')}
                                            className={`w-full flex items-center justify-between p-3 rounded-xl text-sm font-medium transition-all ${
                                                activeTab === 'projects'
                                                    ? 'bg-primary/10 text-primary'
                                                    : 'text-text hover:bg-gray-100 dark:hover:bg-white/5'
                                            }`}
                                        >
                                            <span className="flex items-center gap-2">
                                                <Code size={16} /> Projects
                                            </span>
                                            <input
                                                type="checkbox"
                                                checked={applySelections.projects}
                                                onChange={() => toggleSelection('projects')}
                                                onClick={(e) => e.stopPropagation()}
                                                className="accent-primary h-4 w-4 rounded border-border"
                                                disabled={!resumeData?.projects?.length}
                                            />
                                        </button>

                                        {/* Tab Skills */}
                                        <button
                                            onClick={() => setActiveTab('skills')}
                                            className={`w-full flex items-center justify-between p-3 rounded-xl text-sm font-medium transition-all ${
                                                activeTab === 'skills'
                                                    ? 'bg-primary/10 text-primary'
                                                    : 'text-text hover:bg-gray-100 dark:hover:bg-white/5'
                                            }`}
                                        >
                                            <span className="flex items-center gap-2">
                                                <Cpu size={16} /> Skills
                                            </span>
                                            <input
                                                type="checkbox"
                                                checked={applySelections.skills}
                                                onChange={() => toggleSelection('skills')}
                                                onClick={(e) => e.stopPropagation()}
                                                className="accent-primary h-4 w-4 rounded border-border"
                                                disabled={!resumeData?.technicalSkills?.length}
                                            />
                                        </button>
                                    </div>

                                    {/* Selection Info */}
                                    <div className="hidden lg:block p-3.5 rounded-xl border border-border bg-gray-50/50 dark:bg-white/[0.02] text-[11px] text-subtext leading-relaxed">
                                        Check the sections you'd like to update on your resume, then click <strong>Apply Selected</strong> at the bottom.
                                    </div>
                                </div>

                                {/* Right Tab Comparison Panels */}
                                <div className="flex-1 min-h-0 overflow-y-auto p-6 flex flex-col">
                                    <AnimatePresence mode="wait">
                                        {activeTab === 'summary' && (
                                            <motion.div
                                                key="summary"
                                                initial={{ opacity: 0, x: 10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -10 }}
                                                className="space-y-4 flex-1 flex flex-col min-h-0"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <h4 className="text-base font-bold text-heading">Professional Summary</h4>
                                                    <span className="text-xs font-semibold text-primary">Enhances punchiness & industry keywords</span>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                                                    {/* Original */}
                                                    <div className="p-4 rounded-xl border border-red-500/10 bg-red-500/[0.02] flex flex-col">
                                                        <h5 className="text-xs font-bold uppercase tracking-wider text-red-500 mb-2">Current Draft</h5>
                                                        <div className="text-sm text-text leading-relaxed whitespace-pre-wrap flex-1 min-h-[150px]">
                                                            {resumeData.personalInfo?.summary || <span className="text-subtext italic">No summary details provided.</span>}
                                                        </div>
                                                    </div>

                                                    {/* Optimized */}
                                                    <div className="p-4 rounded-xl border border-green-500/20 bg-green-500/[0.03] flex flex-col shadow-inner">
                                                        <h5 className="text-xs font-bold uppercase tracking-wider text-green-500 mb-2 flex items-center gap-1.5">
                                                            <Sparkles size={12} /> Suggested AI Enhancements
                                                        </h5>
                                                        <div className="text-sm text-heading leading-relaxed font-medium whitespace-pre-wrap flex-1 min-h-[150px]">
                                                            {optimizedData.personalInfo?.summary || <span className="text-subtext italic">No optimization suggested.</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}

                                        {activeTab === 'experience' && (
                                            <motion.div
                                                key="experience"
                                                initial={{ opacity: 0, x: 10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -10 }}
                                                className="space-y-6 flex-1"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <h4 className="text-base font-bold text-heading">Internships & Experience</h4>
                                                    <span className="text-xs font-semibold text-primary">Starts with strong action verbs & quantifies impact</span>
                                                </div>

                                                {(!resumeData.internships || resumeData.internships.length === 0) ? (
                                                    <div className="p-8 border border-dashed border-border rounded-xl text-center text-subtext">
                                                        No experience listed to optimize. Add some in the Editor!
                                                    </div>
                                                ) : (
                                                    resumeData.internships.map((job, jIdx) => {
                                                        const optJob = optimizedData.internships?.[jIdx];
                                                        return (
                                                            <div key={jIdx} className="space-y-3 p-4 rounded-xl border border-border bg-surface/40">
                                                                <div className="flex items-center justify-between border-b border-border pb-2">
                                                                    <div className="text-sm font-bold text-heading">
                                                                        {job.role} <span className="font-medium text-subtext">at</span> {job.company}
                                                                    </div>
                                                                    <span className="text-xs text-subtext">{job.startDate} - {job.endDate}</span>
                                                                </div>

                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                    {/* Original Bullets */}
                                                                    <div className="space-y-2.5">
                                                                        <h5 className="text-[10px] font-bold uppercase tracking-wider text-red-400">Current Wording</h5>
                                                                        <ul className="list-disc pl-4 space-y-1.5 text-xs text-subtext">
                                                                            {(job.description || []).map((b, bIdx) => (
                                                                                <li key={bIdx}>{b || <span className="italic">Empty bullet point</span>}</li>
                                                                            ))}
                                                                        </ul>
                                                                    </div>

                                                                    {/* Optimized Bullets */}
                                                                    <div className="space-y-2.5">
                                                                        <h5 className="text-[10px] font-bold uppercase tracking-wider text-green-400 flex items-center gap-1">
                                                                            <Sparkles size={10} /> AI Optimized (STAR Wording)
                                                                        </h5>
                                                                        <ul className="list-disc pl-4 space-y-1.5 text-xs text-heading font-medium">
                                                                            {(optJob?.description || []).map((b, bIdx) => (
                                                                                <li key={bIdx}>{b}</li>
                                                                            ))}
                                                                        </ul>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })
                                                )}
                                            </motion.div>
                                        )}

                                        {activeTab === 'projects' && (
                                            <motion.div
                                                key="projects"
                                                initial={{ opacity: 0, x: 10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -10 }}
                                                className="space-y-6 flex-1"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <h4 className="text-base font-bold text-heading">Projects</h4>
                                                    <span className="text-xs font-semibold text-primary">Highlights technical problems solved & metrics</span>
                                                </div>

                                                {(!resumeData.projects || resumeData.projects.length === 0) ? (
                                                    <div className="p-8 border border-dashed border-border rounded-xl text-center text-subtext">
                                                        No projects listed to optimize. Add some in the Editor!
                                                    </div>
                                                ) : (
                                                    resumeData.projects.map((proj, pIdx) => {
                                                        const optProj = optimizedData.projects?.[pIdx];
                                                        return (
                                                            <div key={pIdx} className="space-y-3 p-4 rounded-xl border border-border bg-surface/40">
                                                                <div className="flex items-center justify-between border-b border-border pb-2">
                                                                    <div className="text-sm font-bold text-heading">
                                                                        {proj.title}
                                                                    </div>
                                                                    {proj.link && <span className="text-xs text-primary">{proj.link}</span>}
                                                                </div>

                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                    {/* Original Bullets */}
                                                                    <div className="space-y-2.5">
                                                                        <h5 className="text-[10px] font-bold uppercase tracking-wider text-red-400">Current Wording</h5>
                                                                        <ul className="list-disc pl-4 space-y-1.5 text-xs text-subtext">
                                                                            {(proj.description || []).map((b, bIdx) => (
                                                                                <li key={bIdx}>{b || <span className="italic">Empty bullet point</span>}</li>
                                                                            ))}
                                                                        </ul>
                                                                    </div>

                                                                    {/* Optimized Bullets */}
                                                                    <div className="space-y-2.5">
                                                                        <h5 className="text-[10px] font-bold uppercase tracking-wider text-green-400 flex items-center gap-1">
                                                                            <Sparkles size={10} /> AI Optimized
                                                                        </h5>
                                                                        <ul className="list-disc pl-4 space-y-1.5 text-xs text-heading font-medium">
                                                                            {(optProj?.description || []).map((b, bIdx) => (
                                                                                <li key={bIdx}>{b}</li>
                                                                            ))}
                                                                        </ul>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })
                                                )}
                                            </motion.div>
                                        )}

                                        {activeTab === 'skills' && (
                                            <motion.div
                                                key="skills"
                                                initial={{ opacity: 0, x: 10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -10 }}
                                                className="space-y-4 flex-1"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <h4 className="text-base font-bold text-heading">Technical Skills</h4>
                                                    <span className="text-xs font-semibold text-primary">Standardizes terminology & suggests missing terms</span>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    {/* Current Skills */}
                                                    <div className="p-4 rounded-xl border border-red-500/10 bg-red-500/[0.02]">
                                                        <h5 className="text-xs font-bold uppercase tracking-wider text-red-500 mb-3">Current Skills</h5>
                                                        <div className="flex flex-wrap gap-2">
                                                            {resumeData.technicalSkills?.map((skill, index) => (
                                                                <span key={index} className="px-2.5 py-1 bg-gray-100 dark:bg-white/5 rounded-lg text-xs font-medium text-subtext">
                                                                    {skill}
                                                                </span>
                                                            )) || <span className="text-subtext italic">No skills listed.</span>}
                                                        </div>
                                                    </div>

                                                    {/* AI Optimized Skills */}
                                                    <div className="p-4 rounded-xl border border-green-500/20 bg-green-500/[0.03] shadow-inner">
                                                        <h5 className="text-xs font-bold uppercase tracking-wider text-green-500 mb-3 flex items-center gap-1.5">
                                                            <Sparkles size={12} /> Suggested Skills (with additions)
                                                        </h5>
                                                        <div className="flex flex-wrap gap-2">
                                                            {optimizedData.technicalSkills?.map((skill, index) => {
                                                                const isNew = !resumeData.technicalSkills?.some(s => s.toLowerCase().trim() === skill.toLowerCase().trim());
                                                                return (
                                                                    <span
                                                                        key={index}
                                                                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 ${
                                                                            isNew
                                                                                ? 'bg-primary/20 text-primary border border-primary/30 animate-pulse'
                                                                                : 'bg-green-500/10 text-green-600 dark:text-green-400'
                                                                        }`}
                                                                    >
                                                                        {skill}
                                                                        {isNew && <span className="text-[8px] font-black uppercase tracking-wider bg-primary text-white px-1 rounded-sm">NEW</span>}
                                                                    </span>
                                                                );
                                                            }) || <span className="text-subtext italic">No skills suggested.</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        ) : null}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#131315] border-t border-border flex-shrink-0">
                        <div className="text-[11px] text-subtext flex items-center gap-2">
                            {optimizedData && (
                                <>
                                    <div className="flex items-center gap-1">
                                        <div className="w-2.5 h-2.5 bg-red-500/25 border border-red-500/35 rounded-full" />
                                        <span>Current</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <div className="w-2.5 h-2.5 bg-green-500/20 border border-green-500/30 rounded-full" />
                                        <span>AI Suggested</span>
                                    </div>
                                </>
                            )}
                        </div>
                        
                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                className="px-5 py-2.5 text-xs font-bold rounded-xl text-subtext hover:text-heading hover:bg-gray-100 dark:hover:bg-white/5 transition-all"
                            >
                                Cancel
                            </button>
                            {optimizedData && (
                                <button
                                    onClick={handleApply}
                                    className="btn-cta text-white px-6 py-2.5 text-xs font-bold flex items-center gap-2 shadow-lg shadow-primary/25"
                                >
                                    <Check size={14} />
                                    Apply Selected
                                </button>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default AIOptimizeModal;

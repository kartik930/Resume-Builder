import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useResumeData } from '../hooks/useResumeData';
import ResumePreview from '../components/ResumePreview';
import FormSection from '../components/FormSection';
import InputField from '../components/InputField';
import Navbar from '../components/Navbar';
import HorizontalSectionsNav from '../components/HorizontalSectionsNav';
import { Plus, Trash2, ZoomIn, ZoomOut, RotateCcw, Download, FileText, Loader2, X, CheckCircle2, ShieldCheck } from 'lucide-react';
import { resumeAPI } from '../services/api';
import ATSWarningsPanel from '../components/ATSWarningsPanel';

const Editor = () => {
    const { resumeData, updateResumeData, setResumeData } = useResumeData();
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const resumeId = searchParams.get('id');
    const templateParam = searchParams.get('template');

    const [resumeTitle, setResumeTitle] = useState('Untitled Resume');
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState(null); // 'success' | 'error'

    const [activeSection, setActiveSection] = useState('personal');
    const [zoom, setZoom] = useState(100);
    const [template, setTemplate] = useState('ats');
    const resumeRef = useRef(null);
    const [exporting, setExporting] = useState(false);
    const [showExportModal, setShowExportModal] = useState(false);
    const [exportSuccess, setExportSuccess] = useState(false);
    const [exportFilename, setExportFilename] = useState('my-resume');
    const [exportQuality, setExportQuality] = useState(2); // 1 = fast, 2 = high, 3 = ultra
    const [showAnalysis, setShowAnalysis] = useState(true);

    // Resizable layout states
    const containerRef = useRef(null);
    const [isMobile, setIsMobile] = useState(false);
    const [editorWidth, setEditorWidth] = useState(33); // Initial editor width in percentage
    const [analysisWidth, setAnalysisWidth] = useState(25); // Initial analysis width in percentage
    const [isResizingEditor, setIsResizingEditor] = useState(false);
    const [isResizingAnalysis, setIsResizingAnalysis] = useState(false);

    // Responsive listener
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 1024);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Resize event listener for mouse dragging
    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!containerRef.current) return;
            const containerRect = containerRef.current.getBoundingClientRect();
            
            if (isResizingEditor) {
                const newWidthPx = e.clientX - containerRect.left;
                const newWidthPercent = (newWidthPx / containerRect.width) * 100;
                // Bound editor width between 20% and 50%
                setEditorWidth(Math.max(20, Math.min(newWidthPercent, 50)));
            }
            
            if (isResizingAnalysis) {
                const newWidthPx = containerRect.right - e.clientX;
                const newWidthPercent = (newWidthPx / containerRect.width) * 100;
                // Bound analysis width between 15% and 40%
                setAnalysisWidth(Math.max(15, Math.min(newWidthPercent, 40)));
            }
        };

        const handleMouseUp = () => {
            setIsResizingEditor(false);
            setIsResizingAnalysis(false);
        };

        if (isResizingEditor || isResizingAnalysis) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isResizingEditor, isResizingAnalysis]);

    const {
        personalInfo = {},
        education = [],
        technicalSkills = [],
        internships = [],
        projects = [],
        achievements = [],
        certificates = [],
        extracurricular = [],
        languages = [],
    } = resumeData || {};

    // Load resume from database if ID exists
    useEffect(() => {
        const loadResume = async () => {
            if (!resumeId) {
                if (templateParam) {
                    setTemplate(templateParam);
                }
                return;
            }
            try {
                setIsLoading(true);
                const { data } = await resumeAPI.getById(resumeId);
                if (data.resume) {
                    const loaded = data.resume;
                    setResumeTitle(loaded.title || 'Untitled Resume');
                    if (loaded.template) {
                        setTemplate(loaded.template);
                    }
                    // Extract data fields, skip schema fields
                    const { _id, userId, createdAt, updatedAt, __v, title, template: tempVal, ...cleanData } = loaded;
                    setResumeData(cleanData);
                }
            } catch (error) {
                console.error('Failed to load resume:', error);
                alert('Failed to load the resume. Redirecting to your Dashboard.');
                navigate('/dashboard');
            } finally {
                setIsLoading(false);
            }
        };

        loadResume();
    }, [resumeId, templateParam, navigate, setResumeData]);

    // Save or update resume in database
    const handleSave = async () => {
        try {
            setIsSaving(true);
            setSaveStatus(null);

            const payload = {
                title: resumeTitle,
                template: template,
                personalInfo,
                education,
                technicalSkills,
                internships,
                projects,
                achievements,
                certificates,
                extracurricular,
                languages
            };

            if (resumeId) {
                // Update
                await resumeAPI.update(resumeId, payload);
                setSaveStatus('success');
                return true;
            } else {
                // Create new
                const { data } = await resumeAPI.create(payload);
                if (data.resume?._id) {
                    setSaveStatus('success');
                    setSearchParams({ id: data.resume._id });
                    return true;
                }
            }
            return false;
        } catch (error) {
            console.error('Failed to save resume:', error);
            setSaveStatus('error');
            return false;
        } finally {
            setIsSaving(false);
            setTimeout(() => {
                setSaveStatus(null);
            }, 3000);
        }
    };

    // Save to profile and then download as PDF
    const handleSaveAndDownload = async () => {
        const success = await handleSave();
        if (success) {
            setTimeout(() => {
                handleQuickExport();
            }, 500); // Give state a brief moment to settle
        }
    };

    // Refs for scrolling to sections
    const sectionRefs = {
        personal: useRef(null),
        education: useRef(null),
        skills: useRef(null),
        experience: useRef(null),
        projects: useRef(null),
        achievements: useRef(null),
        certificates: useRef(null),
        extracurricular: useRef(null),
        languages: useRef(null),
    };

    // Scroll to section when activeSection changes
    useEffect(() => {
        if (sectionRefs[activeSection]?.current) {
            sectionRefs[activeSection].current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [activeSection]);

    const handleInputChange = (section, field, value) => {
        const existing = (resumeData && resumeData[section]) || {};
        updateResumeData(section, { ...existing, [field]: value });
    };

    const handleArrayChange = (section, index, field, value) => {
        const currentArray = Array.isArray(resumeData?.[section]) ? resumeData[section] : [];
        const newArray = [...currentArray];
        newArray[index] = { ...newArray[index], [field]: value };
        updateResumeData(section, newArray);
    };

    const addItem = (section, initialData) => {
        const currentArray = Array.isArray(resumeData?.[section]) ? resumeData[section] : [];
        updateResumeData(section, [...currentArray, initialData]);
    };

    const removeItem = (section, index) => {
        const currentArray = Array.isArray(resumeData?.[section]) ? resumeData[section] : [];
        const newArray = currentArray.filter((_, i) => i !== index);
        updateResumeData(section, newArray);
    };

    const handleZoomIn = () => setZoom(prev => Math.min(prev + 10, 150));
    const handleZoomOut = () => setZoom(prev => Math.max(prev - 10, 50));
    const handleResetZoom = () => setZoom(100);

    // PDF Export
    const handleExportPDF = useCallback(async () => {
        if (!resumeRef.current || exporting) return;

        setExporting(true);
        setExportSuccess(false);

        try {
            const html2pdf = (await import('html2pdf.js')).default;

            const element = resumeRef.current;
            const filename = (exportFilename.trim() || 'my-resume') + '.pdf';

            const originalBg = element.style.backgroundColor;
            const originalColor = element.style.color;
            element.style.backgroundColor = '#FFFFFF';
            element.style.color = '#1a1a1a';

            const allElements = element.querySelectorAll('*');
            const originalStyles = [];
            allElements.forEach((el) => {
                originalStyles.push({
                    el,
                    color: el.style.color,
                    bg: el.style.backgroundColor,
                    borderColor: el.style.borderColor,
                });
                const computed = window.getComputedStyle(el);
                if (computed.color === 'rgb(212, 212, 216)' || computed.color === 'rgb(161, 161, 170)') {
                    el.style.color = computed.color === 'rgb(161, 161, 170)' ? '#4a4a4a' : '#1a1a1a';
                }
                if (computed.color === 'rgb(255, 255, 255)') {
                    el.style.color = '#000000';
                }
                if (computed.backgroundColor === 'rgb(24, 24, 27)' || computed.backgroundColor === 'rgb(15, 15, 17)') {
                    el.style.backgroundColor = '#FFFFFF';
                }
                if (computed.backgroundColor === 'rgb(19, 19, 21)') {
                    el.style.backgroundColor = '#F9FAFB';
                }
                if (computed.borderColor === 'rgb(47, 47, 54)') {
                    el.style.borderColor = '#E2E8F0';
                }
            });

            const opt = {
                margin: 0,
                filename,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: {
                    scale: exportQuality,
                    useCORS: true,
                    logging: false,
                    letterRendering: true,
                    backgroundColor: '#FFFFFF',
                },
                jsPDF: {
                    unit: 'mm',
                    format: 'a4',
                    orientation: 'portrait',
                },
                pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
            };

            await html2pdf().set(opt).from(element).save();

            element.style.backgroundColor = originalBg;
            element.style.color = originalColor;
            originalStyles.forEach(({ el, color, bg, borderColor }) => {
                el.style.color = color;
                el.style.backgroundColor = bg;
                el.style.borderColor = borderColor;
            });

            setExportSuccess(true);
            setTimeout(() => {
                setExportSuccess(false);
                setShowExportModal(false);
            }, 2000);
        } catch (error) {
            console.error('PDF export failed:', error);
            alert('Failed to export PDF. Please try again.');
        } finally {
            setExporting(false);
        }
    }, [exporting, exportFilename, exportQuality]);

    const handleQuickExport = useCallback(async () => {
        if (!resumeRef.current || exporting) return;
        setExportFilename(personalInfo?.fullName?.replace(/\s+/g, '_') || 'my-resume');
        setExporting(true);
        setExportSuccess(false);
        try {
            const html2pdf = (await import('html2pdf.js')).default;
            const element = resumeRef.current;
            const filename = (personalInfo?.fullName?.replace(/\s+/g, '_') || 'my-resume') + '_resume.pdf';

            const originalBg = element.style.backgroundColor;
            const originalColor = element.style.color;
            element.style.backgroundColor = '#FFFFFF';
            element.style.color = '#1a1a1a';

            const allElements = element.querySelectorAll('*');
            const originalStyles = [];
            allElements.forEach((el) => {
                originalStyles.push({
                    el,
                    color: el.style.color,
                    bg: el.style.backgroundColor,
                    borderColor: el.style.borderColor,
                });
                const computed = window.getComputedStyle(el);
                if (computed.color === 'rgb(212, 212, 216)' || computed.color === 'rgb(161, 161, 170)') {
                    el.style.color = computed.color === 'rgb(161, 161, 170)' ? '#4a4a4a' : '#1a1a1a';
                }
                if (computed.color === 'rgb(255, 255, 255)') {
                    el.style.color = '#000000';
                }
                if (computed.backgroundColor === 'rgb(24, 24, 27)' || computed.backgroundColor === 'rgb(15, 15, 17)') {
                    el.style.backgroundColor = '#FFFFFF';
                }
                if (computed.backgroundColor === 'rgb(19, 19, 21)') {
                    el.style.backgroundColor = '#F9FAFB';
                }
                if (computed.borderColor === 'rgb(47, 47, 54)') {
                    el.style.borderColor = '#E2E8F0';
                }
            });

            const opt = {
                margin: 0,
                filename,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true, logging: false, letterRendering: true, backgroundColor: '#FFFFFF' },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
                pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
            };

            await html2pdf().set(opt).from(element).save();

            element.style.backgroundColor = originalBg;
            element.style.color = originalColor;
            originalStyles.forEach(({ el, color, bg, borderColor }) => {
                el.style.color = color;
                el.style.backgroundColor = bg;
                el.style.borderColor = borderColor;
            });
        } catch (error) {
            console.error('PDF export failed:', error);
        } finally {
            setExporting(false);
        }
    }, [exporting, personalInfo?.fullName]);

    if (isLoading) {
        return (
            <div className="h-screen bg-background flex flex-col overflow-hidden text-text">
                <Navbar />
                <div className="flex-1 flex flex-col items-center justify-center gap-4">
                    <Loader2 className="animate-spin text-primary" size={40} />
                    <p className="text-subtext text-sm">Loading your resume...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen bg-background flex flex-col overflow-hidden text-text">
            <Navbar />
            <HorizontalSectionsNav activeSection={activeSection} onSectionChange={setActiveSection} />

            <div className="flex-1 min-h-0 overflow-hidden">
                <div className="max-w-8xl mx-auto px-6 py-4 h-full">
                    <div ref={containerRef} className={`flex flex-col lg:flex-row gap-0 h-full w-full min-w-0 ${isResizingEditor || isResizingAnalysis ? 'select-none cursor-col-resize' : ''}`}>
                        {/* Left: Editor Form */}
                        <div 
                            style={{ width: isMobile ? '100%' : `${editorWidth}%` }}
                            className="flex flex-col h-full min-h-0 flex-shrink-0"
                        >
                            <div className="mb-4 flex-shrink-0 flex items-center justify-between gap-4">
                                <div className="space-y-0.5">
                                    <h2 className="text-xl font-bold text-heading">Editor</h2>
                                    <input
                                        type="text"
                                        value={resumeTitle}
                                        onChange={(e) => setResumeTitle(e.target.value)}
                                        className="bg-transparent text-xs font-semibold border-b border-dashed border-border text-subtext focus:border-primary focus:outline-none py-0.5 max-w-[160px] truncate"
                                        placeholder="Rename resume..."
                                        title="Click to rename"
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={handleSaveAndDownload}
                                        disabled={isSaving || exporting}
                                        className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl border border-primary/25 bg-primary/5 text-primary hover:bg-primary/10 transition-all disabled:opacity-50 shadow-sm"
                                        title="Save your changes and download as PDF immediately"
                                    >
                                        {isSaving || exporting ? (
                                            <>
                                                <Loader2 className="animate-spin" size={13} />
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <Download size={13} />
                                                Save & Download
                                            </>
                                        )}
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        disabled={isSaving}
                                        className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl border transition-all ${
                                            saveStatus === 'success'
                                                ? 'bg-green-500/10 text-green-500 border-green-500/20'
                                                : saveStatus === 'error'
                                                ? 'bg-red-500/10 text-red-500 border-red-500/20'
                                                : 'bg-primary text-white border-primary hover:opacity-90 shadow-md shadow-primary/20'
                                        } disabled:opacity-50`}
                                        title="Save your changes to your cloud profile"
                                    >
                                        {isSaving ? (
                                            <>
                                                <Loader2 className="animate-spin" size={13} />
                                                Saving...
                                            </>
                                        ) : saveStatus === 'success' ? (
                                            <>
                                                <CheckCircle2 size={13} />
                                                Saved!
                                            </>
                                        ) : saveStatus === 'error' ? (
                                            <>
                                                <X size={13} />
                                                Error!
                                            </>
                                        ) : (
                                            <>
                                                <FileText size={13} />
                                                Save
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-2 space-y-4">
                                {/* Personal Info */}
                                <div ref={sectionRefs.personal} className="scroll-mt-4">
                                    <FormSection title="Personal Information" icon={null} isOpen={true}>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <InputField label="Full Name" value={personalInfo.fullName || ''} onChange={(e) => handleInputChange('personalInfo', 'fullName', e.target.value)} placeholder="John Doe" />
                                            <InputField label="Job Title" value={personalInfo.jobTitle || ''} onChange={(e) => handleInputChange('personalInfo', 'jobTitle', e.target.value)} placeholder="Software Engineer" />
                                            <InputField label="Email" value={personalInfo.email || ''} onChange={(e) => handleInputChange('personalInfo', 'email', e.target.value)} placeholder="john@example.com" />
                                            <InputField label="Phone" value={personalInfo.phone || ''} onChange={(e) => handleInputChange('personalInfo', 'phone', e.target.value)} placeholder="+1 234 567 890" />
                                            <InputField label="Address" value={personalInfo.address || ''} onChange={(e) => handleInputChange('personalInfo', 'address', e.target.value)} placeholder="City, Country" />
                                            <InputField label="LinkedIn" value={personalInfo.linkedin || ''} onChange={(e) => handleInputChange('personalInfo', 'linkedin', e.target.value)} placeholder="linkedin.com/in/johndoe" />
                                            <InputField label="GitHub" value={personalInfo.github || ''} onChange={(e) => handleInputChange('personalInfo', 'github', e.target.value)} placeholder="github.com/johndoe" />
                                            <InputField label="Portfolio" value={personalInfo.portfolio || ''} onChange={(e) => handleInputChange('personalInfo', 'portfolio', e.target.value)} placeholder="johndoe.com" />
                                        </div>
                                        <div className="mt-4">
                                            <label className="block text-xs font-medium text-subtext mb-1.5">Professional Summary</label>
                                            <textarea
                                                className="input-base min-h-[100px] resize-y"
                                                value={personalInfo.summary || ''}
                                                onChange={(e) => handleInputChange('personalInfo', 'summary', e.target.value)}
                                                placeholder="Briefly describe your professional background and key achievements..."
                                            />
                                        </div>
                                    </FormSection>
                                </div>

                                {/* Education */}
                                <div ref={sectionRefs.education} className="scroll-mt-4">
                                    <FormSection title="Education" icon={null} isOpen={true}>
                                        {education.length > 0 && (
                                            <div className="flex justify-end mb-4">
                                                <button
                                                    onClick={() => updateResumeData('education', [])}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-500 hover:text-red-600 transition-colors bg-red-500/5 hover:bg-red-500/10 rounded-xl border border-red-500/10"
                                                    title="Delete all education items"
                                                >
                                                    <Trash2 size={13} />
                                                    Delete Education Section
                                                </button>
                                            </div>
                                        )}
                                        {education.map((edu, index) => (
                                            <div key={index} className="mb-6 p-4 bg-gray-50 dark:bg-input-bg rounded-lg border border-border relative group hover:border-primary/30 transition-all">
                                                <button onClick={() => removeItem('education', index)} className="absolute top-2 right-2 text-subtext hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-500/10 rounded">
                                                    <Trash2 size={16} />
                                                </button>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <InputField label="School/University" value={edu.school} onChange={(e) => handleArrayChange('education', index, 'school', e.target.value)} />
                                                    <InputField label="Degree" value={edu.degree} onChange={(e) => handleArrayChange('education', index, 'degree', e.target.value)} />
                                                    <InputField label="Start Date" value={edu.startDate} onChange={(e) => handleArrayChange('education', index, 'startDate', e.target.value)} type="month" />
                                                    <InputField label="End Date" value={edu.endDate} onChange={(e) => handleArrayChange('education', index, 'endDate', e.target.value)} type="month" />
                                                    <InputField label="Score/GPA" value={edu.score} onChange={(e) => handleArrayChange('education', index, 'score', e.target.value)} />
                                                    <InputField label="Location" value={edu.location} onChange={(e) => handleArrayChange('education', index, 'location', e.target.value)} />
                                                </div>
                                            </div>
                                        ))}
                                        <button onClick={() => addItem('education', { school: '', degree: '', startDate: '', endDate: '', score: '', location: '' })} className="btn-secondary w-full py-2 text-sm bg-primary/5 hover:bg-primary/10 border-primary/20 text-primary">
                                            <Plus size={16} /> Add Education
                                        </button>
                                    </FormSection>
                                </div>

                                {/* Technical Skills */}
                                        <div ref={sectionRefs.skills} className="scroll-mt-4">
                                    <FormSection title="Technical Skills" icon={null} isOpen={true}>
                                        {technicalSkills.length > 0 && (
                                            <div className="flex justify-end mb-4">
                                                <button
                                                    onClick={() => updateResumeData('technicalSkills', [])}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-500 hover:text-red-600 transition-colors bg-red-500/5 hover:bg-red-500/10 rounded-xl border border-red-500/10"
                                                    title="Delete all technical skills"
                                                >
                                                    <Trash2 size={13} />
                                                    Delete Skills Section
                                                </button>
                                            </div>
                                        )}
                                        <div className="space-y-3">
                                            {technicalSkills.map((skill, index) => (
                                                <div key={index} className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        className="input-base"
                                                        value={skill}
                                                        onChange={(e) => {
                                                            const newSkills = [...technicalSkills];
                                                            newSkills[index] = e.target.value;
                                                            updateResumeData('technicalSkills', newSkills);
                                                        }}
                                                        placeholder="e.g. JavaScript, React, Node.js"
                                                    />
                                                    <button onClick={() => {
                                                        const newSkills = technicalSkills.filter((_, i) => i !== index);
                                                        updateResumeData('technicalSkills', newSkills);
                                                    }} className="text-subtext hover:text-red-500 p-2 hover:bg-red-500/10 rounded-lg transition-colors">
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            ))}
                                            <button onClick={() => updateResumeData('technicalSkills', [...technicalSkills, ''])} className="btn-secondary w-full py-2 text-sm bg-primary/5 hover:bg-primary/10 border-primary/20 text-primary">
                                                <Plus size={16} /> Add Skill
                                            </button>
                                        </div>
                                    </FormSection>
                                </div>

                                {/* Experience / Internships */}
                                <div ref={sectionRefs.experience} className="scroll-mt-4">
                                    <FormSection title="Internships & Experience" icon={null} isOpen={true}>
                                        {internships.length > 0 && (
                                            <div className="flex justify-end mb-4">
                                                <button
                                                    onClick={() => updateResumeData('internships', [])}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-500 hover:text-red-600 transition-colors bg-red-500/5 hover:bg-red-500/10 rounded-xl border border-red-500/10"
                                                    title="Delete all internships and experience"
                                                >
                                                    <Trash2 size={13} />
                                                    Delete Experience Section
                                                </button>
                                            </div>
                                        )}
                                        {internships.map((intern, index) => (
                                            <div key={index} className="mb-6 p-4 bg-gray-50 dark:bg-input-bg rounded-lg border border-border relative group hover:border-primary/30 transition-all">
                                                <button onClick={() => removeItem('internships', index)} className="absolute top-2 right-2 text-subtext hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-500/10 rounded">
                                                    <Trash2 size={16} />
                                                </button>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                    <InputField label="Job Title" value={intern.role} onChange={(e) => handleArrayChange('internships', index, 'role', e.target.value)} />
                                                    <InputField label="Company" value={intern.company} onChange={(e) => handleArrayChange('internships', index, 'company', e.target.value)} />
                                                    <InputField label="Start Date" value={intern.startDate} onChange={(e) => handleArrayChange('internships', index, 'startDate', e.target.value)} type="month" />
                                                    <InputField label="End Date" value={intern.endDate} onChange={(e) => handleArrayChange('internships', index, 'endDate', e.target.value)} type="month" />
                                                    <InputField label="Location" value={intern.location} onChange={(e) => handleArrayChange('internships', index, 'location', e.target.value)} />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-subtext mb-1.5">Description (Bullet points)</label>
                                                    {(intern.description || []).map((desc, i) => (
                                                        <div key={i} className="flex gap-2 mb-2">
                                                            <input
                                                                type="text"
                                                                className="input-base text-sm"
                                                                value={desc}
                                                                onChange={(e) => {
                                                                    const newInterns = [...internships];
                                                                    newInterns[index].description[i] = e.target.value;
                                                                    updateResumeData('internships', newInterns);
                                                                 }}
                                                                placeholder="• Achieved X by doing Y..."
                                                            />
                                                            <button onClick={() => {
                                                                const newInterns = [...internships];
                                                                newInterns[index].description = newInterns[index].description.filter((_, dIndex) => dIndex !== i);
                                                                updateResumeData('internships', newInterns);
                                                            }} className="text-subtext hover:text-red-500 p-2 hover:bg-red-500/10 rounded-lg">
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                    <button onClick={() => {
                                                        const newInterns = [...internships];
                                                        if (!newInterns[index].description) newInterns[index].description = [];
                                                        newInterns[index].description.push('');
                                                        updateResumeData('internships', newInterns);
                                                    }} className="text-xs text-primary font-medium hover:text-primary-light flex items-center gap-1 mt-2">
                                                        <Plus size={12} /> Add Bullet Point
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        <button onClick={() => addItem('internships', { role: '', company: '', startDate: '', endDate: '', location: '', description: [''] })} className="btn-secondary w-full py-2 text-sm bg-primary/5 hover:bg-primary/10 border-primary/20 text-primary">
                                            <Plus size={16} /> Add Experience
                                        </button>
                                    </FormSection>
                                </div>

                                {/* Projects */}
                                <div ref={sectionRefs.projects} className="scroll-mt-4">
                                    <FormSection title="Projects" icon={null} isOpen={true}>
                                        {projects.length > 0 && (
                                            <div className="flex justify-end mb-4">
                                                <button
                                                    onClick={() => updateResumeData('projects', [])}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-500 hover:text-red-600 transition-colors bg-red-500/5 hover:bg-red-500/10 rounded-xl border border-red-500/10"
                                                    title="Delete all projects"
                                                >
                                                    <Trash2 size={13} />
                                                    Delete Projects Section
                                                </button>
                                            </div>
                                        )}
                                        {projects.map((proj, index) => (
                                            <div key={index} className="mb-6 p-4 bg-gray-50 dark:bg-input-bg rounded-lg border border-border relative group hover:border-primary/30 transition-all">
                                                <button onClick={() => removeItem('projects', index)} className="absolute top-2 right-2 text-subtext hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-500/10 rounded">
                                                    <Trash2 size={16} />
                                                </button>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                    <InputField label="Project Title" value={proj.title} onChange={(e) => handleArrayChange('projects', index, 'title', e.target.value)} />
                                                    <InputField label="Date" value={proj.date} onChange={(e) => handleArrayChange('projects', index, 'date', e.target.value)} />
                                                    <InputField label="Link" value={proj.link} onChange={(e) => handleArrayChange('projects', index, 'link', e.target.value)} />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-subtext mb-1.5">Description</label>
                                                    {(proj.description || []).map((desc, i) => (
                                                        <div key={i} className="flex gap-2 mb-2">
                                                            <input
                                                                type="text"
                                                                className="input-base text-sm"
                                                                value={desc}
                                                                onChange={(e) => {
                                                                    const newProjects = [...projects];
                                                                    newProjects[index].description[i] = e.target.value;
                                                                    updateResumeData('projects', newProjects);
                                                                }}
                                                                placeholder="• Key feature or technology used..."
                                                            />
                                                            <button onClick={() => {
                                                                const newProjects = [...projects];
                                                                newProjects[index].description = newProjects[index].description.filter((_, dIndex) => dIndex !== i);
                                                                updateResumeData('projects', newProjects);
                                                            }} className="text-subtext hover:text-red-500 p-2 hover:bg-red-500/10 rounded-lg">
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                    <button onClick={() => {
                                                        const newProjects = [...projects];
                                                        if (!newProjects[index].description) newProjects[index].description = [];
                                                        newProjects[index].description.push('');
                                                        updateResumeData('projects', newProjects);
                                                    }} className="text-xs text-primary font-medium hover:text-primary-light flex items-center gap-1 mt-2">
                                                        <Plus size={12} /> Add Bullet Point
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        <button onClick={() => addItem('projects', { title: '', date: '', link: '', description: [''] })} className="btn-secondary w-full py-2 text-sm bg-primary/5 hover:bg-primary/10 border-primary/20 text-primary">
                                            <Plus size={16} /> Add Project
                                        </button>
                                    </FormSection>
                                </div>

                                {/* Achievements */}
                                <div ref={sectionRefs.achievements} className="scroll-mt-4">
                                    <FormSection title="Achievements" icon={null} isOpen={true}>
                                        {achievements.length > 0 && (
                                            <div className="flex justify-end mb-4">
                                                <button
                                                    onClick={() => updateResumeData('achievements', [])}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-500 hover:text-red-600 transition-colors bg-red-500/5 hover:bg-red-500/10 rounded-xl border border-red-500/10"
                                                    title="Delete all achievements"
                                                >
                                                    <Trash2 size={13} />
                                                    Delete Achievements Section
                                                </button>
                                            </div>
                                        )}
                                        <div className="space-y-3">
                                            {achievements.map((ach, index) => (
                                                <div key={index} className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        className="input-base"
                                                        value={ach}
                                                        onChange={(e) => {
                                                            const newAch = [...achievements];
                                                            newAch[index] = e.target.value;
                                                            updateResumeData('achievements', newAch);
                                                        }}
                                                        placeholder="e.g. 1st Place in Hackathon"
                                                    />
                                                    <button onClick={() => {
                                                        const newAch = achievements.filter((_, i) => i !== index);
                                                        updateResumeData('achievements', newAch);
                                                    }} className="text-subtext hover:text-red-500 p-2 hover:bg-red-500/10 rounded-lg transition-colors">
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            ))}
                                            <button onClick={() => updateResumeData('achievements', [...achievements, ''])} className="btn-secondary w-full py-2 text-sm bg-primary/5 hover:bg-primary/10 border-primary/20 text-primary">
                                                <Plus size={16} /> Add Achievement
                                            </button>
                                        </div>
                                    </FormSection>
                                </div>

                                {/* Certificates */}
                                <div ref={sectionRefs.certificates} className="scroll-mt-4">
                                    <FormSection title="Certificates" icon={null} isOpen={true}>
                                        {certificates.length > 0 && (
                                            <div className="flex justify-end mb-4">
                                                <button
                                                    onClick={() => updateResumeData('certificates', [])}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-500 hover:text-red-600 transition-colors bg-red-500/5 hover:bg-red-500/10 rounded-xl border border-red-500/10"
                                                    title="Delete all certificates"
                                                >
                                                    <Trash2 size={13} />
                                                    Delete Certificates Section
                                                </button>
                                            </div>
                                        )}
                                        {certificates.map((cert, index) => (
                                            <div key={index} className="mb-6 p-4 bg-gray-50 dark:bg-input-bg rounded-lg border border-border relative group hover:border-primary/30 transition-all">
                                                <button onClick={() => removeItem('certificates', index)} className="absolute top-2 right-2 text-subtext hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-500/10 rounded">
                                                    <Trash2 size={16} />
                                                </button>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <InputField label="Certificate Name" value={cert.name} onChange={(e) => handleArrayChange('certificates', index, 'name', e.target.value)} />
                                                    <InputField label="Issuer" value={cert.issuer} onChange={(e) => handleArrayChange('certificates', index, 'issuer', e.target.value)} />
                                                    <InputField label="Date" value={cert.date} onChange={(e) => handleArrayChange('certificates', index, 'date', e.target.value)} />
                                                </div>
                                            </div>
                                        ))}
                                        <button onClick={() => addItem('certificates', { name: '', issuer: '', date: '' })} className="btn-secondary w-full py-2 text-sm bg-primary/5 hover:bg-primary/10 border-primary/20 text-primary">
                                            <Plus size={16} /> Add Certificate
                                        </button>
                                    </FormSection>
                                </div>

                                {/* Extracurricular */}
                                <div ref={sectionRefs.extracurricular} className="scroll-mt-4">
                                    <FormSection title="Extracurricular" icon={null} isOpen={true}>
                                        {extracurricular.length > 0 && (
                                            <div className="flex justify-end mb-4">
                                                <button
                                                    onClick={() => updateResumeData('extracurricular', [])}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-500 hover:text-red-600 transition-colors bg-red-500/5 hover:bg-red-500/10 rounded-xl border border-red-500/10"
                                                    title="Delete all extracurricular activities"
                                                >
                                                    <Trash2 size={13} />
                                                    Delete Activities Section
                                                </button>
                                            </div>
                                        )}
                                        {extracurricular.map((extra, index) => (
                                            <div key={index} className="mb-6 p-4 bg-gray-50 dark:bg-input-bg rounded-lg border border-border relative group hover:border-primary/30 transition-all">
                                                <button onClick={() => removeItem('extracurricular', index)} className="absolute top-2 right-2 text-subtext hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-500/10 rounded">
                                                    <Trash2 size={16} />
                                                </button>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                    <InputField label="Role" value={extra.role} onChange={(e) => handleArrayChange('extracurricular', index, 'role', e.target.value)} />
                                                    <InputField label="Organization" value={extra.organization} onChange={(e) => handleArrayChange('extracurricular', index, 'organization', e.target.value)} />
                                                    <InputField label="Date" value={extra.date} onChange={(e) => handleArrayChange('extracurricular', index, 'date', e.target.value)} />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-subtext mb-1.5">Description</label>
                                                    {(extra.description || []).map((desc, i) => (
                                                        <div key={i} className="flex gap-2 mb-2">
                                                            <input
                                                                type="text"
                                                                className="input-base text-sm"
                                                                value={desc}
                                                                onChange={(e) => {
                                                                    const newExtra = [...extracurricular];
                                                                    newExtra[index].description[i] = e.target.value;
                                                                    updateResumeData('extracurricular', newExtra);
                                                                }}
                                                                placeholder="• Description..."
                                                            />
                                                            <button onClick={() => {
                                                                const newExtra = [...extracurricular];
                                                                newExtra[index].description = newExtra[index].description.filter((_, dIndex) => dIndex !== i);
                                                                updateResumeData('extracurricular', newExtra);
                                                            }} className="text-subtext hover:text-red-500 p-2 hover:bg-red-500/10 rounded-lg">
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                    <button onClick={() => {
                                                        const newExtra = [...extracurricular];
                                                        if (!newExtra[index].description) newExtra[index].description = [];
                                                        newExtra[index].description.push('');
                                                        updateResumeData('extracurricular', newExtra);
                                                    }} className="text-xs text-primary font-medium hover:text-primary-light flex items-center gap-1 mt-2">
                                                        <Plus size={12} /> Add Bullet Point
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        <button onClick={() => addItem('extracurricular', { role: '', organization: '', date: '', description: [''] })} className="btn-secondary w-full py-2 text-sm bg-primary/5 hover:bg-primary/10 border-primary/20 text-primary">
                                            <Plus size={16} /> Add Activity
                                        </button>
                                    </FormSection>
                                </div>

                                {/* Languages */}
                                <div ref={sectionRefs.languages} className="scroll-mt-4">
                                    <FormSection title="Languages" icon={null} isOpen={true}>
                                        {languages.length > 0 && (
                                            <div className="flex justify-end mb-4">
                                                <button
                                                    onClick={() => updateResumeData('languages', [])}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-500 hover:text-red-600 transition-colors bg-red-500/5 hover:bg-red-500/10 rounded-xl border border-red-500/10"
                                                    title="Delete all languages"
                                                >
                                                    <Trash2 size={13} />
                                                    Delete Languages Section
                                                </button>
                                            </div>
                                        )}
                                        <div className="space-y-3">
                                            {languages.map((lang, index) => (
                                                <div key={index} className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        className="input-base"
                                                        value={lang}
                                                        onChange={(e) => {
                                                            const newLangs = [...languages];
                                                            newLangs[index] = e.target.value;
                                                            updateResumeData('languages', newLangs);
                                                        }}
                                                        placeholder="e.g. English (Native)"
                                                    />
                                                    <button onClick={() => {
                                                        const newLangs = languages.filter((_, i) => i !== index);
                                                        updateResumeData('languages', newLangs);
                                                    }} className="text-subtext hover:text-red-500 p-2 hover:bg-red-500/10 rounded-lg transition-colors">
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            ))}
                                            <button onClick={() => updateResumeData('languages', [...languages, ''])} className="btn-secondary w-full py-2 text-sm bg-primary/5 hover:bg-primary/10 border-primary/20 text-primary">
                                                <Plus size={16} /> Add Language
                                            </button>
                                        </div>
                                    </FormSection>
                                </div>
                            </div>
                        </div>

                        {/* Editor Draggable Resizer Bar */}
                        {!isMobile && (
                            <div 
                                onMouseDown={(e) => {
                                    e.preventDefault();
                                    setIsResizingEditor(true);
                                }}
                                className={`w-2 hover:w-2 cursor-col-resize group relative h-full flex-shrink-0 transition-all ${
                                    isResizingEditor ? 'bg-primary/20' : 'hover:bg-primary/10'
                                }`}
                            >
                                <div className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-0.5 h-20 rounded bg-border group-hover:bg-primary transition-all ${
                                    isResizingEditor ? 'bg-primary h-28' : ''
                                }`} />
                            </div>
                        )}

                        {/* Right: Live Preview */}
                        <div className="flex-1 min-w-0 flex flex-col h-full min-h-0">
                            <div className="mb-4 flex-shrink-0 flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-bold text-heading">Live Preview</h2>
                                    <p className="text-xs text-subtext mt-0.5">Real-time resume preview</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    {/* Template Selector */}
                                    <div className="inline-flex items-center rounded-lg bg-gray-100 dark:bg-surface-highlight p-0.5 text-xs border border-border">
                                        <button
                                            onClick={() => setTemplate('ats')}
                                            className={`px-3 py-1.5 rounded-md font-medium transition-all ${template === 'ats' ? 'bg-white dark:bg-[#0F0F11] text-heading shadow-sm border border-border' : 'text-subtext hover:text-heading'}`}
                                        >
                                            ATS
                                        </button>
                                        <button
                                            onClick={() => setTemplate('classic')}
                                            className={`px-3 py-1.5 rounded-md font-medium transition-all ${template === 'classic' ? 'bg-white dark:bg-[#0F0F11] text-heading shadow-sm border border-border' : 'text-subtext hover:text-heading'}`}
                                        >
                                            Classic
                                        </button>
                                        <button
                                            onClick={() => setTemplate('accent')}
                                            className={`px-3 py-1.5 rounded-md font-medium transition-all ${template === 'accent' ? 'bg-white dark:bg-[#0F0F11] text-heading shadow-sm border border-border' : 'text-subtext hover:text-heading'}`}
                                        >
                                            Accent
                                        </button>
                                        <button
                                            onClick={() => setTemplate('boxed')}
                                            className={`px-3 py-1.5 rounded-md font-medium transition-all ${template === 'boxed' ? 'bg-white dark:bg-[#0F0F11] text-heading shadow-sm border border-border' : 'text-subtext hover:text-heading'}`}
                                        >
                                            Boxed
                                        </button>
                                    </div>
                                    {/* Zoom Controls */}
                                    <div className="flex items-center gap-1 bg-gray-100 dark:bg-surface-highlight rounded-lg p-0.5 border border-border">
                                        <button
                                            onClick={handleZoomOut}
                                            className="p-1.5 hover:bg-white dark:hover:bg-[#0F0F11] rounded-md transition-all text-subtext hover:text-heading"
                                            disabled={zoom <= 50}
                                        >
                                            <ZoomOut size={16} />
                                        </button>
                                        <span className="text-xs font-medium text-heading min-w-[2.5rem] text-center">{zoom}%</span>
                                        <button
                                            onClick={handleZoomIn}
                                            className="p-1.5 hover:bg-white dark:hover:bg-[#0F0F11] rounded-md transition-all text-subtext hover:text-heading"
                                            disabled={zoom >= 150}
                                        >
                                            <ZoomIn size={16} />
                                        </button>
                                        <div className="w-px h-4 bg-border mx-0.5"></div>
                                        <button
                                            onClick={handleResetZoom}
                                            className="p-1.5 hover:bg-white dark:hover:bg-[#0F0F11] rounded-md transition-all text-subtext hover:text-heading"
                                            title="Reset to 100%"
                                        >
                                            <RotateCcw size={16} />
                                        </button>
                                    </div>

                                    {/* Analysis Toggle */}
                                    <button
                                        onClick={() => setShowAnalysis(!showAnalysis)}
                                        className={`p-1.5 rounded-lg transition-all border border-border flex items-center gap-2 ${showAnalysis ? 'bg-primary/10 text-primary border-primary/30' : 'text-subtext hover:text-heading'}`}
                                        title="Analyze ATS Score"
                                    >
                                        <ShieldCheck size={16} />
                                        <span className="text-xs font-semibold hidden xl:inline">Analysis</span>
                                    </button>

                                    {/* Export Buttons */}
                                    <button
                                        onClick={handleQuickExport}
                                        disabled={exporting}
                                        className="flex items-center gap-2 px-4 py-1.5 text-sm font-medium text-white bg-gradient-to-r from-primary to-primary-light rounded-lg hover:opacity-90 transition-all shadow-md shadow-primary/20 disabled:opacity-50"
                                        title="Quick download as PDF"
                                    >
                                        {exporting ? <Loader2 className="animate-spin" size={16} /> : <Download size={16} />}
                                        <span className="hidden xl:inline">{exporting ? 'Exporting...' : 'Export'}</span>
                                    </button>
                                    <button
                                        onClick={() => {
                                            setExportFilename(personalInfo?.fullName?.replace(/\s+/g, '_') || 'my-resume');
                                            setShowExportModal(true);
                                        }}
                                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-all text-subtext hover:text-heading border border-border"
                                        title="Export options"
                                    >
                                        <FileText size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 min-h-0 overflow-auto custom-scrollbar flex justify-center items-start pt-6">
                                <div
                                    className="origin-top transition-transform duration-200 shadow-2xl"
                                    style={{ transform: `scale(${zoom / 100})` }}
                                >
                                    <ResumePreview ref={resumeRef} template={template} />
                                </div>
                            </div>
                        </div>

                        {/* Analysis Draggable Resizer Bar */}
                        {!isMobile && showAnalysis && (
                            <div 
                                onMouseDown={(e) => {
                                    e.preventDefault();
                                    setIsResizingAnalysis(true);
                                }}
                                className={`w-2 hover:w-2 cursor-col-resize group relative h-full flex-shrink-0 transition-all ${
                                    isResizingAnalysis ? 'bg-primary/20' : 'hover:bg-primary/10'
                                }`}
                            >
                                <div className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-0.5 h-20 rounded bg-border group-hover:bg-primary transition-all ${
                                    isResizingAnalysis ? 'bg-primary h-28' : ''
                                }`} />
                            </div>
                        )}

                        {/* Right: Analysis Panel */}
                        {showAnalysis && (
                            <div 
                                style={{ width: isMobile ? '100%' : `${analysisWidth}%` }}
                                className="flex flex-col h-full min-h-0 flex-shrink-0 animate-in slide-in-from-right-10 duration-300 animate-duration-500"
                            >
                                <ATSWarningsPanel resumeData={resumeData} template={template} onClose={() => setShowAnalysis(false)} />
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {/* Export Modal */}
            {showExportModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] animate-fade-in">
                    <div className="bg-surface border border-border rounded-2xl p-8 w-full max-w-md shadow-2xl mx-4">
                        {exportSuccess ? (
                            <div className="text-center py-6">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-green-500/10 border border-green-500/20 mb-4">
                                    <CheckCircle2 className="text-green-500" size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-heading mb-2">PDF Downloaded!</h3>
                                <p className="text-subtext text-sm">Your resume has been saved successfully.</p>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h3 className="text-xl font-bold text-heading">Export as PDF</h3>
                                        <p className="text-subtext text-xs mt-1">Customize your download</p>
                                    </div>
                                    <button
                                        onClick={() => setShowExportModal(false)}
                                        className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg text-subtext hover:text-heading transition-all"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className="space-y-5">
                                    {/* Filename */}
                                    <div>
                                        <label className="block text-xs font-medium text-subtext mb-2">File Name</label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="text"
                                                className="input-base"
                                                value={exportFilename}
                                                onChange={(e) => setExportFilename(e.target.value)}
                                                placeholder="my-resume"
                                            />
                                            <span className="text-subtext text-sm font-medium">.pdf</span>
                                        </div>
                                    </div>

                                    {/* Quality */}
                                    <div>
                                        <label className="block text-xs font-medium text-subtext mb-2">Quality</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {[
                                                { value: 1, label: 'Fast', desc: 'Smaller file' },
                                                { value: 2, label: 'High', desc: 'Recommended' },
                                                { value: 3, label: 'Ultra', desc: 'Best quality' },
                                            ].map((q) => (
                                                <button
                                                    key={q.value}
                                                    onClick={() => setExportQuality(q.value)}
                                                    className={`p-3 rounded-xl border-2 text-center transition-all ${
                                                        exportQuality === q.value
                                                            ? 'border-primary bg-primary/5 text-primary'
                                                            : 'border-border hover:border-primary/30 text-text'
                                                    }`}
                                                >
                                                    <div className="font-semibold text-sm">{q.label}</div>
                                                    <div className="text-[10px] text-subtext mt-0.5">{q.desc}</div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Template Info */}
                                    <div className="flex items-center gap-3 p-3 bg-primary/5 border border-primary/20 rounded-xl">
                                        <FileText size={18} className="text-primary flex-shrink-0" />
                                        <div className="text-xs">
                                            <span className="text-heading font-medium">Template: </span>
                                            <span className="text-subtext capitalize">{template}</span>
                                            <span className="text-subtext"> • A4 format • Light mode</span>
                                        </div>
                                    </div>

                                    {/* Export Button */}
                                    <button
                                        onClick={handleExportPDF}
                                        disabled={exporting}
                                        className="w-full py-3 px-4 bg-gradient-to-r from-primary to-primary-light text-white font-semibold rounded-xl hover:opacity-90 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/25"
                                    >
                                        {exporting ? (
                                            <>
                                                <Loader2 className="animate-spin" size={20} />
                                                Generating PDF...
                                            </>
                                        ) : (
                                            <>
                                                <Download size={18} />
                                                Download PDF
                                            </>
                                        )}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Editor;

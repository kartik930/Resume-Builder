import React, { useMemo } from 'react';
import { AlertTriangle, CheckCircle, Info, ShieldCheck, Zap, Hash, Palette, Image as ImageIcon, Layout, X } from 'lucide-react';

const ATSWarningsPanel = ({ resumeData, template, onClose }) => {
    const analysis = useMemo(() => {
        const warnings = [];
        const successes = [];
        const tips = [];

        if (!resumeData) return { warnings, successes, tips, score: 0 };

        const {
            personalInfo = {},
            education = [],
            technicalSkills = [],
            internships = [],
            projects = [],
        } = resumeData;

        // 1. Tables/Layout Check
        if (template === 'boxed' || template === 'accent') {
            warnings.push({
                id: 'layout-table',
                type: 'warning',
                title: 'Complex Layout Detected',
                message: 'Multi-column or boxed layouts can sometimes confuse older ATS scanners. Stick to a single-column "ATS" template for 99% compatibility.',
                icon: <Layout className="text-orange-500" size={18} />
            });
        } else {
            successes.push({
                title: 'Standard Layout',
                message: 'Your current template uses a clean, scanner-friendly structure.',
                icon: <CheckCircle className="text-green-500" size={18} />
            });
        }

        // 2. Icons Check
        const contactIconsCount = [personalInfo.phone, personalInfo.email, personalInfo.linkedin, personalInfo.github].filter(Boolean).length;
        if (contactIconsCount > 3 && template !== 'ats') {
            warnings.push({
                id: 'icons-issue',
                type: 'warning',
                title: 'High Icon Usage',
                message: 'Some ATS systems may struggle with graphical symbols. Ensure your contact info is also clearly readable as text.',
                icon: <ImageIcon className="text-orange-500" size={18} />
            });
        }

        // 3. Colors Check
        if (template === 'accent' || template === 'boxed') {
            warnings.push({
                id: 'color-count',
                type: 'info',
                title: 'Color Palatte',
                message: 'Using multiple colors is visually nice but ensure high contrast. Dark text on light background is always safest for OCR.',
                icon: <Palette className="text-blue-500" size={18} />
            });
        }

        // 4. Keywords Check
        const allText = JSON.stringify(resumeData).toLowerCase();
        const commonKeywords = [
            'javascript', 'react', 'node', 'python', 'sql', 'agile', 'scrum', 
            'management', 'leadership', 'development', 'analysis', 'design',
            'git', 'cloud', 'aws', 'docker', 'api', 'testing'
        ];
        
        const foundKeywords = commonKeywords.filter(kw => allText.includes(kw));
        const missingKeywords = commonKeywords.filter(kw => !allText.includes(kw)).slice(0, 5);

        if (foundKeywords.length < 5) {
            warnings.push({
                id: 'keywords-missing',
                type: 'critical',
                title: 'Low Keyword Density',
                message: `Missing essential industry keywords. Consider adding: ${missingKeywords.join(', ')}.`,
                icon: <Hash className="text-red-500" size={18} />
            });
        } else {
            successes.push({
                title: 'Good Keyword Usage',
                message: `Found ${foundKeywords.length} key industry terms in your resume.`,
                icon: <Zap className="text-yellow-500" size={18} />
            });
        }

        // 5. Structure Checks
        if (!personalInfo.summary || personalInfo.summary.length < 50) {
            tips.push({
                title: 'Missing Summary',
                message: 'A strong professional summary helps ATS categorize your profile faster.',
                icon: <Info className="text-blue-400" size={16} />
            });
        }

        // Calculate Score
        let score = 70;
        score -= (warnings.filter(w => w.type === 'critical').length * 15);
        score -= (warnings.filter(w => w.type === 'warning').length * 10);
        score += (successes.length * 5);
        score = Math.min(Math.max(score, 0), 100);

        return { warnings, successes, tips, score };
    }, [resumeData, template]);

    return (
        <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-xl flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-500">
            {/* Header */}
            <div className="p-5 border-b border-border bg-gradient-to-br from-primary/5 to-transparent flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <ShieldCheck className="text-primary" size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-heading">ATS Optimizer</h3>
                        <p className="text-[10px] text-subtext uppercase tracking-wider font-semibold">Real-time Analysis</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end">
                        <div className={`text-2xl font-black ${analysis.score > 80 ? 'text-green-500' : analysis.score > 60 ? 'text-yellow-500' : 'text-red-500'}`}>
                            {analysis.score}<span className="text-xs text-subtext ml-0.5">%</span>
                        </div>
                        <div className="w-24 h-1.5 bg-border rounded-full mt-1 overflow-hidden font-sans">
                            <div 
                                className={`h-full transition-all duration-1000 ${analysis.score > 80 ? 'bg-green-500' : analysis.score > 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                style={{ width: `${analysis.score}%` }}
                            />
                        </div>
                    </div>
                    {onClose && (
                        <button 
                            onClick={onClose}
                            className="p-1.5 hover:bg-gray-200 dark:hover:bg-white/10 rounded-lg text-subtext hover:text-heading transition-all"
                            title="Hide ATS Optimizer"
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
                {/* Warnings / Critical */}
                {analysis.warnings.length > 0 && (
                    <div className="space-y-3">
                        <h4 className="text-xs font-bold text-subtext uppercase tracking-widest px-1">Optimization Required</h4>
                        {analysis.warnings.map((item, i) => (
                            <div key={i} className="group p-4 rounded-xl bg-orange-500/5 border border-orange-500/10 hover:border-orange-500/30 transition-all">
                                <div className="flex gap-3">
                                    <div className="mt-0.5">{item.icon}</div>
                                    <div>
                                        <h5 className="text-sm font-bold text-heading group-hover:text-primary transition-colors">{item.title}</h5>
                                        <p className="text-xs text-subtext mt-1 leading-relaxed">{item.message}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Successes */}
                {analysis.successes.length > 0 && (
                    <div className="space-y-3">
                        <h4 className="text-xs font-bold text-subtext uppercase tracking-widest px-1">Passes</h4>
                        {analysis.successes.map((item, i) => (
                            <div key={i} className="p-4 rounded-xl bg-green-500/5 border border-green-500/10 transition-all">
                                <div className="flex gap-3">
                                    <div className="mt-0.5">{item.icon}</div>
                                    <div>
                                        <h5 className="text-sm font-bold text-heading">{item.title}</h5>
                                        <p className="text-xs text-subtext mt-1 leading-relaxed">{item.message}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Tips */}
                {analysis.tips.length > 0 && (
                    <div className="space-y-3">
                        <h4 className="text-xs font-bold text-subtext uppercase tracking-widest px-1">Expert Tips</h4>
                        <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-4">
                            <ul className="space-y-3">
                                {analysis.tips.map((item, i) => (
                                    <li key={i} className="flex gap-2">
                                        <div className="mt-1">{item.icon}</div>
                                        <div className="text-xs text-subtext">
                                            <span className="font-bold text-heading block mb-0.5">{item.title}</span>
                                            {item.message}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-gray-50 dark:bg-[#131315] border-top border-border">
                <p className="text-[10px] text-center text-subtext italic">
                    ATS analysis is based on established industry standards and patterns.
                </p>
            </div>
        </div>
    );
};

export default ATSWarningsPanel;

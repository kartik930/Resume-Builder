import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Sparkles, Grid, Palette, ShieldCheck, Wand2, LayoutGrid, Download, ArrowRight } from 'lucide-react';

const templatesData = [
    {
        id: 'modern-ats',
        name: 'Modern ATS',
        category: 'Modern',
        description: 'ATS Friendly · Clean Layout',
        image: 'https://images.unsplash.com/photo-1523475472560-d2df97ec485c?auto=format&fit=crop&w=900&q=80',
        badges: ['ATS optimized', 'Crisp spacing', 'Clean typography']
    },
    {
        id: 'minimal-classic',
        name: 'Minimal Classic',
        category: 'Minimal',
        description: 'Simple · Legible · Balanced',
        image: 'https://images.unsplash.com/photo-1483478550801-ceba5fe50e8e?auto=format&fit=crop&w=900&q=80',
        badges: ['Readable', 'Subtle dividers', 'Calm palette']
    },
    {
        id: 'executive-pro',
        name: 'Executive Pro',
        category: 'Executive / Senior',
        description: 'Executive presence · Strong hierarchy',
        image: 'https://images.unsplash.com/photo-1521791055366-0d553872125f?auto=format&fit=crop&w=900&q=80',
        badges: ['Bold headings', 'Role focused', 'ATS aligned']
    },
    {
        id: 'creative-bright',
        name: 'Creative Bright',
        category: 'Creative',
        description: 'Expressive · Accent color · Structured',
        image: 'https://images.unsplash.com/photo-1503389152951-9f343605f61e?auto=format&fit=crop&w=900&q=80',
        badges: ['Accent color', 'Grid aligned', 'Portfolio ready']
    },
    {
        id: 'corporate-blue',
        name: 'Corporate Blue',
        category: 'Corporate',
        description: 'Formal · Confident · Clear',
        image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=80',
        badges: ['Hiring friendly', 'Neat columns', 'PDF perfect']
    },
    {
        id: 'student-launch',
        name: 'Student Launch',
        category: 'Student / Fresher',
        description: 'Internships · Projects · Skills forward',
        image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=900&q=80',
        badges: ['Project first', 'Skills highlights', 'ATS safe']
    },
    {
        id: 'elegant-neutral',
        name: 'Elegant Neutral',
        category: 'Minimal',
        description: 'Soft neutral palette · Airy spacing',
        image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=900&q=80',
        badges: ['Soft palette', 'Wide margins', 'Printer friendly']
    },
    {
        id: 'senior-impact',
        name: 'Senior Impact',
        category: 'Executive / Senior',
        description: 'Impactful summary · Achievement led',
        image: 'https://images.unsplash.com/photo-1481277542470-605612bd2d61?auto=format&fit=crop&w=900&q=80',
        badges: ['Results focus', 'Clear metrics', 'ATS tuned']
    },
];

const categories = [
    'All Templates',
    'Modern',
    'Minimal',
    'Corporate',
    'Creative',
    'Student / Fresher',
    'Executive / Senior',
];

const getTemplateParam = (id) => {
    if (id === 'minimal-classic' || id === 'elegant-neutral') return 'classic';
    if (id === 'creative-bright') return 'accent';
    if (id === 'corporate-blue') return 'boxed';
    return 'ats'; // default
};

const recIds = {
    'Student Launch': 'student-launch',
    'Corporate Blue': 'corporate-blue',
    'Modern ATS': 'modern-ats'
};

const Templates = () => {
    const [activeCategory, setActiveCategory] = useState('All Templates');

    const filteredTemplates = useMemo(() => {
        if (activeCategory === 'All Templates') return templatesData;
        return templatesData.filter(t => t.category === activeCategory);
    }, [activeCategory]);

    return (
        <div className="min-h-screen bg-background font-sans selection:bg-primary/30 dark:selection:text-white text-text">
            <Navbar />

            <main className="max-w-screen-xl mx-auto px-4 pt-14 pb-16 space-y-12">
                <section className="relative overflow-hidden rounded-4xl bg-white dark:bg-[rgba(255,255,255,0.02)] backdrop-blur-xl border border-border shadow-2xl px-6 md:px-12 py-14">
                    <div className="relative space-y-6">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm w-fit border border-primary/20">
                            <Sparkles size={16} />
                            <span>Premium Gallery</span>
                        </div>
                        <div className="space-y-4">
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight text-heading drop-shadow-sm">
                                Browse Premium Resume Templates
                            </h1>
                            <p className="text-lg sm:text-xl text-subtext max-w-3xl font-light">
                                Pick a design, customize instantly, and export in minutes. Minimal, ATS-friendly layouts with clean typography and balanced spacing.
                            </p>
                        </div>
                        <div className="grid sm:grid-cols-3 gap-3 rounded-2xl bg-surface-highlight border border-border shadow-inner p-4 text-sm text-text">
                            <div className="flex items-center gap-2">
                                <ShieldCheck size={18} className="text-primary" />
                                20+ ATS-ready designs
                            </div>
                            <div className="flex items-center gap-2">
                                <Download size={18} className="text-secondary" />
                                PDF / DOCX export
                            </div>
                            <div className="flex items-center gap-2">
                                <Wand2 size={18} className="text-secondary" />
                                AI-optimized formatting
                            </div>
                        </div>
                    </div>
                </section>

                <section className="space-y-6">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.25rem] text-primary">Filters</p>
                            <h2 className="text-2xl font-bold text-heading">Find the perfect template</h2>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 overflow-x-auto custom-scrollbar pb-2">
                        {categories.map((cat) => {
                            const isActive = activeCategory === cat;
                            return (
                                <button
                                    key={cat}
                                    onClick={() => setActiveCategory(cat)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${isActive
                                        ? 'bg-primary text-white border-primary'
                                        : 'bg-surface border-border text-subtext hover:border-primary/30 hover:text-heading hover:bg-surface-highlight'
                                        }`}
                                >
                                    {cat}
                                </button>
                            );
                        })}
                    </div>
                </section>

                <section className="space-y-6">
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {filteredTemplates.map((tpl) => (
                            <div
                                key={tpl.id}
                                className="group relative overflow-hidden rounded-3xl bg-surface-highlight border border-border shadow-lg hover:-translate-y-1 transition-all duration-300 hover:shadow-glow hover:border-primary/20"
                            >
                                <div className="relative h-52 bg-gray-100 dark:bg-[#131315] overflow-hidden">
                                    <img
                                        src={tpl.image}
                                        alt={tpl.name}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                    <div className="absolute bottom-3 left-3 right-3 flex flex-wrap gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
                                        {tpl.badges.map((badge) => (
                                            <span key={badge} className="text-[10px] px-2 py-1 rounded-full bg-background/90 text-text border border-[rgba(255,255,255,0.1)] backdrop-blur-sm">
                                                {badge}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className="p-4 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-semibold text-heading">{tpl.name}</p>
                                            <p className="text-xs text-subtext">{tpl.description}</p>
                                        </div>
                                        <span className="text-[10px] px-2 py-1 rounded-full bg-surface border border-border text-subtext">{tpl.category}</span>
                                    </div>
                                    <Link
                                        to={`/editor?template=${getTemplateParam(tpl.id)}`}
                                        className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-light transition-colors"
                                    >
                                        Use Template
                                        <ArrowRight size={16} />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="rounded-3xl bg-white dark:bg-[rgba(255,255,255,0.02)] border border-border shadow-xl p-8 space-y-6">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.25rem] text-primary">Need help?</p>
                            <h3 className="text-2xl font-bold text-heading">Not sure which template to choose?</h3>
                            <p className="text-sm text-subtext">Pick a recommended style and start editing in one click.</p>
                        </div>
                    </div>
                    <div className="grid md:grid-cols-3 gap-4">
                        {[
                            { title: 'Best for Freshers', name: 'Student Launch', bg: 'bg-gray-50 dark:bg-[#1A1B20]', border: 'border-emerald-500/20', text: 'text-emerald-400' },
                            { title: 'Best for Corporate Jobs', name: 'Corporate Blue', bg: 'bg-gray-50 dark:bg-[#1A1B20]', border: 'border-blue-500/20', text: 'text-blue-400' },
                            { title: 'Most Popular', name: 'Modern ATS', bg: 'bg-gray-50 dark:bg-[#1A1B20]', border: 'border-indigo-500/20', text: 'text-indigo-400' },
                        ].map((rec) => (
                            <div key={rec.title} className={`p-5 rounded-2xl border ${rec.border} ${rec.bg} shadow-sm flex flex-col gap-3 hover:bg-gray-100 dark:hover:bg-[rgba(255,255,255,0.03)] transition-colors`}>
                                <div className={`text-xs font-semibold uppercase tracking-[0.1rem] ${rec.text}`}>{rec.title}</div>
                                <div className="text-lg font-semibold text-heading">{rec.name}</div>
                                <Link 
                                    to={`/editor?template=${getTemplateParam(recIds[rec.name])}`} 
                                    className="text-sm font-semibold text-primary hover:text-primary-light inline-flex items-center gap-1"
                                >
                                    Use Template <ArrowRight size={14} />
                                </Link>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary via-primary-dark to-[#4f46e5] text-white px-8 py-10 shadow-glow">
                    <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_top_left,_#ffffff33,_transparent_45%),_radial-gradient(circle_at_bottom_right,_#ffffff22,_transparent_45%)]" />
                    <div className="relative flex flex-col lg:flex-row items-center justify-between gap-6">
                        <div className="space-y-2">
                            <h3 className="text-3xl font-bold">Ready to build your perfect resume?</h3>
                            <p className="text-sm text-white/80">Choose a template, start editing, and export a polished PDF in minutes.</p>
                        </div>
                        <Link
                            to="/editor"
                            className="btn-secondary bg-white text-primary border-white text-base px-6 py-3 font-semibold shadow-lg hover:bg-gray-100 hover:text-primary-dark"
                        >
                            Start Editing →
                        </Link>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default Templates;





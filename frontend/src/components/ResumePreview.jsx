import React, { forwardRef } from 'react';
import { useResumeData } from '../hooks/useResumeData';
import { Mail, Phone, Linkedin, Github, Globe } from 'lucide-react';

const ResumePreview = forwardRef(({ template = 'classic' }, ref) => {
    const { resumeData } = useResumeData();
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

    const HeaderBlock = ({ align = 'center' }) => (
        <div className={`${align === 'left' ? 'text-left' : 'text-center'} mb-6`}>
            <h1 className="text-3xl font-bold uppercase tracking-wide mb-2 font-sans">
                {personalInfo?.fullName || 'Your Name'}
            </h1>
            <div className="text-sm text-slate-600 flex flex-wrap justify-center gap-x-4 gap-y-1">
                {personalInfo?.address && <span>{personalInfo.address}</span>}
            </div>
            <div className="text-sm text-slate-600 flex flex-wrap justify-center gap-x-4 gap-y-1 mt-1">
                {personalInfo?.phone && (
                    <div className="flex items-center gap-1">
                        <Phone size={12} />
                        <span>{personalInfo.phone}</span>
                    </div>
                )}
                {personalInfo?.email && (
                    <div className="flex items-center gap-1">
                        <Mail size={12} />
                        <a href={`mailto:${personalInfo.email}`} className="hover:text-primary">
                            {personalInfo.email}
                        </a>
                    </div>
                )}
                {personalInfo?.linkedin && (
                    <div className="flex items-center gap-1">
                        <Linkedin size={12} />
                        <a
                            href={`https://${personalInfo.linkedin}`}
                            target="_blank"
                            rel="noreferrer"
                            className="hover:text-primary"
                        >
                            {personalInfo.linkedin}
                        </a>
                    </div>
                )}
                {personalInfo?.github && (
                    <div className="flex items-center gap-1">
                        <Github size={12} />
                        <a
                            href={`https://${personalInfo.github}`}
                            target="_blank"
                            rel="noreferrer"
                            className="hover:text-primary"
                        >
                            {personalInfo.github}
                        </a>
                    </div>
                )}
                {personalInfo?.portfolio && (
                    <div className="flex items-center gap-1">
                        <Globe size={12} />
                        <a
                            href={personalInfo.portfolio.startsWith('http') ? personalInfo.portfolio : `https://${personalInfo.portfolio}`}
                            target="_blank"
                            rel="noreferrer"
                            className="hover:text-primary"
                        >
                            Portfolio
                        </a>
                    </div>
                )}
            </div>
        </div>
    );

    const SectionsBlock = ({ headingClass }) => (
        <div className="space-y-4 text-sm">
            {/* Education */}
            {education && education.length > 0 && (
                <section>
                    <h2 className={headingClass}>Education</h2>
                    <div className="space-y-2">
                        {education.map((edu) => (
                            <div key={edu.id} className="flex justify-between">
                                <div>
                                    <div className="font-bold">{edu.degree}</div>
                                    <div className="italic">{edu.school}</div>
                                </div>
                                <div className="text-right">
                                    <div className="font-medium">
                                        {edu.startDate} – {edu.endDate}
                                    </div>
                                    {edu.score && <div>{edu.score}</div>}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Technical Skills */}
            {technicalSkills && technicalSkills.length > 0 && (
                <section>
                    <h2 className={headingClass}>Technical Skills</h2>
                    <ul className="list-disc list-inside space-y-1">
                        {technicalSkills.map((skill, index) => (
                            <li key={index} className="text-slate-800">
                                {skill}
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            {/* Internships */}
            {internships && internships.length > 0 && (
                <section>
                    <h2 className={headingClass}>Internships</h2>
                    <div className="space-y-3">
                        {internships.map((intern) => (
                            <div key={intern.id}>
                                <div className="flex justify-between mb-1">
                                    <div>
                                        <span className="font-bold">{intern.role}</span>
                                        <span className="mx-1">|</span>
                                        <span className="italic">{intern.company}</span>
                                    </div>
                                    <div className="font-medium text-right">
                                        {intern.startDate} – {intern.endDate}
                                        {intern.location && (
                                            <div className="text-xs font-normal">{intern.location}</div>
                                        )}
                                    </div>
                                </div>
                                {intern.description && (
                                    <ul className="list-disc list-inside text-slate-700 pl-2">
                                        {intern.description.map((desc, i) => (
                                            <li key={i}>{desc}</li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Projects */}
            {projects && projects.length > 0 && (
                <section>
                    <h2 className={headingClass}>Projects</h2>
                    <div className="space-y-3">
                        {projects.map((proj) => (
                            <div key={proj.id}>
                                <div className="flex justify-between mb-1">
                                    <div className="font-bold">{proj.title}</div>
                                    <div className="font-medium">{proj.date}</div>
                                </div>
                                {proj.description && (
                                    <ul className="list-disc list-inside text-slate-700 pl-2">
                                        {proj.description.map((desc, i) => (
                                            <li key={i}>{desc}</li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Achievements */}
            {achievements && achievements.length > 0 && (
                <section>
                    <h2 className={headingClass}>Achievements</h2>
                    <ul className="list-disc list-inside space-y-1">
                        {achievements.map((ach, index) => (
                            <li key={index} className="text-slate-800">
                                {ach}
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            {/* Certificates */}
            {certificates && certificates.length > 0 && (
                <section>
                    <h2 className={headingClass}>Certificates</h2>
                    <div className="space-y-1">
                        {certificates.map((cert) => (
                            <div key={cert.id} className="flex justify-between">
                                <div>
                                    <span className="font-bold">{cert.name}</span>
                                    <span className="mx-1">-</span>
                                    <span className="italic">{cert.issuer}</span>
                                </div>
                                <div className="font-medium">{cert.date}</div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Extracurricular */}
            {extracurricular && extracurricular.length > 0 && (
                <section>
                    <h2 className={headingClass}>Extracurricular</h2>
                    <div className="space-y-2">
                        {extracurricular.map((extra) => (
                            <div key={extra.id}>
                                <div className="flex justify-between mb-1">
                                    <div>
                                        <span className="font-bold">{extra.role}</span>
                                        <span className="mx-1">|</span>
                                        <span className="italic">{extra.organization}</span>
                                    </div>
                                    <div className="font-medium">{extra.date}</div>
                                </div>
                                {extra.description && (
                                    <ul className="list-disc list-inside text-slate-700 pl-2">
                                        {extra.description.map((desc, i) => (
                                            <li key={i}>{desc}</li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Languages */}
            {languages && languages.length > 0 && (
                <section className="mt-4">
                    <h2 className={headingClass}>Languages</h2>
                    <ul className="list-disc list-inside space-y-1">
                        {languages.map((lang, index) => (
                            <li key={index} className="text-slate-800">
                                {lang}
                            </li>
                        ))}
                    </ul>
                </section>
            )}
        </div>
    );

    // Classic template: centered name, simple separators
    if (template === 'classic') {
        return (
            <div
                ref={ref}
                id="resume-preview"
                className="bg-surface shadow-[0_0_40px_rgba(0,0,0,0.1)] dark:shadow-[0_0_40px_rgba(0,0,0,0.3)] text-text font-serif relative overflow-hidden mx-auto border border-border dark:border-[rgba(255,255,255,0.05)]"
                style={{ width: '210mm', minHeight: '297mm' }}
            >
                <div className="p-[40px]">
                    <HeaderBlock />
                    <SectionsBlock headingClass="text-sm font-bold uppercase border-b border-border mb-2 tracking-wider font-sans text-heading" />
                </div>
            </div>
        );
    }

    // Accent bar template: colored sidebar with contact, content on right
    if (template === 'accent') {
        return (
            <div
                ref={ref}
                id="resume-preview"
                className="bg-surface shadow-[0_0_40px_rgba(0,0,0,0.1)] dark:shadow-[0_0_40px_rgba(0,0,0,0.3)] text-text font-serif relative overflow-hidden mx-auto flex border border-border dark:border-[rgba(255,255,255,0.05)]"
                style={{ width: '210mm', minHeight: '297mm' }}
            >
                <aside className="w-40 bg-gray-50 dark:bg-[#131315] border-r border-border p-6 flex flex-col gap-4">
                    <div>
                        <h1 className="text-2xl font-bold uppercase tracking-wide font-sans text-primary">
                            {personalInfo?.fullName || 'Your Name'}
                        </h1>
                    </div>
                    <div className="space-y-2 text-xs text-subtext group-hover:text-heading transition-colors">
                        {personalInfo?.address && <div>{personalInfo.address}</div>}
                        {personalInfo?.phone && (
                            <div className="flex items-center gap-2">
                                <Phone size={12} /> {personalInfo.phone}
                            </div>
                        )}
                        {personalInfo?.email && (
                            <div className="flex items-center gap-2">
                                <Mail size={12} /> {personalInfo.email}
                            </div>
                        )}
                        {personalInfo?.linkedin && (
                            <div className="flex items-center gap-2">
                                <Linkedin size={12} /> {personalInfo.linkedin}
                            </div>
                        )}
                        {personalInfo?.github && (
                            <div className="flex items-center gap-2">
                                <Github size={12} /> {personalInfo.github}
                            </div>
                        )}
                    </div>
                </aside>
                <main className="flex-1 p-8">
                    <SectionsBlock headingClass="text-sm font-bold uppercase border-l-4 border-primary pl-3 mb-2 tracking-wider font-sans text-heading" />
                </main>
            </div>
        );
    }

    // Boxed template: soft grey background with white cards for each section
    if (template === 'boxed') {
        return (
            <div
                ref={ref}
                id="resume-preview"
                className="bg-gray-50 dark:bg-[#131315] text-text font-serif relative overflow-hidden mx-auto border border-border dark:border-[rgba(255,255,255,0.05)]"
                style={{ width: '210mm', minHeight: '297mm' }}
            >
                <div className="p-8">
                    <div className="bg-surface rounded-xl shadow-lg border border-border mb-4 p-6">
                        <HeaderBlock align="left" />
                    </div>
                    <div className="space-y-4">
                        {/* Reuse sections but wrap each in a card */}
                        <div className="bg-surface rounded-xl shadow-sm border border-border p-6">
                            <SectionsBlock headingClass="text-sm font-bold uppercase mb-2 tracking-wider font-sans text-primary" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ATS template: clean, simple, ATS-friendly format (default)
    return (
        <div
            ref={ref}
            id="resume-preview"
            className="bg-surface shadow-[0_0_40px_rgba(0,0,0,0.1)] dark:shadow-[0_0_40px_rgba(0,0,0,0.3)] text-black font-serif relative overflow-hidden mx-auto border border-border dark:border-[rgba(255,255,255,0.05)]"
            style={{ width: '210mm', minHeight: '297mm' }}
        >
            <div className="p-[40px_45px] text-[11px] leading-relaxed text-black">
                {/* Header - Name and Contact */}
                <div className="text-center mb-4">
                    <h1 className="text-3xl font-bold tracking-wide mb-1 font-serif text-black">
                        {personalInfo?.fullName || 'ABC XYZ'}
                    </h1>
                    {personalInfo?.address && (
                        <div className="text-xs text-black mb-1.5 font-serif font-light">
                            {personalInfo.address}
                        </div>
                    )}
                    <div className="text-[10px] text-black flex flex-wrap justify-center items-center gap-x-3.5 gap-y-1 font-serif">
                        {personalInfo?.phone && (
                            <span className="flex items-center gap-1.5">
                                <Phone size={10} className="text-black" />
                                {personalInfo.phone}
                            </span>
                        )}
                        {personalInfo?.email && (
                            <span className="flex items-center gap-1.5">
                                <Mail size={10} className="text-black" />
                                <a href={`mailto:${personalInfo.email}`} className="underline hover:text-primary">
                                    {personalInfo.email}
                                </a>
                            </span>
                        )}
                        {personalInfo?.linkedin && (
                            <span className="flex items-center gap-1.5">
                                <Linkedin size={10} className="text-black" />
                                <a href={`https://${personalInfo.linkedin}`} target="_blank" rel="noreferrer" className="underline hover:text-primary">
                                    {personalInfo.linkedin}
                                </a>
                            </span>
                        )}
                        {personalInfo?.github && (
                            <span className="flex items-center gap-1.5">
                                <Github size={10} className="text-black" />
                                <a href={`https://${personalInfo.github}`} target="_blank" rel="noreferrer" className="underline hover:text-primary">
                                    {personalInfo.github}
                                </a>
                            </span>
                        )}
                        {typeof personalInfo?.portfolio === 'string' && personalInfo.portfolio.trim() && (
                            <span className="flex items-center gap-1.5">
                                <Globe size={10} className="text-black" />
                                <a href={personalInfo.portfolio.startsWith('http') ? personalInfo.portfolio : `https://${personalInfo.portfolio}`} target="_blank" rel="noreferrer" className="underline hover:text-primary">
                                    {personalInfo.portfolio === 'Portfolio Link' ? 'Portfolio' : personalInfo.portfolio}
                                </a>
                            </span>
                        )}
                    </div>
                </div>

                <div className="space-y-4">
                    {/* Education */}
                    {education && education.length > 0 && (
                        <section className="space-y-2">
                            <h2 className="text-[12px] font-bold border-b border-black pb-0.5 mt-3 mb-2 text-black font-serif uppercase tracking-wide">Education</h2>
                            <div className="space-y-2.5">
                                {education.map((edu) => (
                                    <div key={edu.id} className="space-y-0.5">
                                        <div className="flex justify-between items-baseline font-bold text-black">
                                            <span>{edu.degree}</span>
                                            <span>{edu.startDate ? `${edu.startDate} – ${edu.endDate}` : edu.endDate}</span>
                                        </div>
                                        <div className="flex justify-between items-baseline italic text-black font-light">
                                            <span>{edu.school}</span>
                                            <span>{edu.score}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Technical Skills */}
                    {technicalSkills && technicalSkills.length > 0 && (
                        <section className="space-y-2">
                            <h2 className="text-[12px] font-bold border-b border-black pb-0.5 mt-3 mb-2 text-black font-serif uppercase tracking-wide">Technical Skills</h2>
                            <div className="space-y-1">
                                {technicalSkills.map((skill, index) => {
                                    if (typeof skill !== 'string') return null;
                                    const parts = skill.split(':');
                                    if (parts.length > 1) {
                                        return (
                                            <div key={index} className="leading-relaxed text-black">
                                                <strong className="text-black">{parts[0]}:</strong>
                                                <span>{parts.slice(1).join(':')}</span>
                                            </div>
                                        );
                                    }
                                    return (
                                        <div key={index} className="leading-relaxed text-black">
                                            {skill}
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    )}

                    {/* Internships */}
                    {internships && internships.length > 0 && (
                        <section className="space-y-2">
                            <h2 className="text-[12px] font-bold border-b border-black pb-0.5 mt-3 mb-2 text-black font-serif uppercase tracking-wide">Internships</h2>
                            <div className="space-y-3">
                                {internships.map((intern) => (
                                    <div key={intern.id} className="space-y-1">
                                        <div className="flex justify-between items-baseline font-bold text-black">
                                            <span>{intern.company}</span>
                                            <span>{intern.startDate} – {intern.endDate}</span>
                                        </div>
                                        <div className="flex justify-between items-baseline italic text-black font-light">
                                            <span>{intern.role}</span>
                                            <span>{intern.location}</span>
                                        </div>
                                        {intern.description && intern.description.length > 0 && (
                                            <ul className="list-disc pl-4 space-y-0.5 text-black">
                                                {intern.description.map((desc, i) => (
                                                    <li key={i} className="pl-0.5 leading-relaxed font-light">
                                                        {desc}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Projects */}
                    {projects && projects.length > 0 && (
                        <section className="space-y-2">
                            <h2 className="text-[12px] font-bold border-b border-black pb-0.5 mt-3 mb-2 text-black font-serif uppercase tracking-wide">Projects</h2>
                            <div className="space-y-3">
                                {projects.map((proj) => (
                                    <div key={proj.id} className="space-y-1">
                                        <div className="flex justify-between items-baseline font-bold text-black">
                                            <span>{proj.title}</span>
                                            <span>{proj.date}</span>
                                        </div>
                                        {typeof proj.link === 'string' && proj.link.trim() && (
                                            <div className="text-[10px] text-slate-700 italic">
                                                <a href={proj.link.startsWith('http') ? proj.link : `https://${proj.link}`} target="_blank" rel="noreferrer" className="underline hover:text-primary">
                                                    {proj.link}
                                                </a>
                                            </div>
                                        )}
                                        {proj.description && proj.description.length > 0 && (
                                            <ul className="list-disc pl-4 space-y-0.5 text-black">
                                                {proj.description.map((desc, i) => (
                                                    <li key={i} className="pl-0.5 leading-relaxed font-light">
                                                        {desc}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Achievements */}
                    {achievements && achievements.length > 0 && (
                        <section className="space-y-2">
                            <h2 className="text-[12px] font-bold border-b border-black pb-0.5 mt-3 mb-2 text-black font-serif uppercase tracking-wide">Achievement</h2>
                            <div className="space-y-2">
                                {achievements.map((ach, index) => {
                                    if (typeof ach !== 'string') return null;
                                    const parts = ach.split(' - ');
                                    if (parts.length > 1) {
                                        return (
                                            <div key={index} className="space-y-0.5">
                                                <div className="font-bold text-black">{parts[0]}</div>
                                                <div className="italic text-black font-light">{parts[1]}</div>
                                            </div>
                                        );
                                    }
                                    return (
                                        <div key={index} className="font-bold text-black">
                                            {ach}
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    )}

                    {/* Certificates */}
                    {certificates && certificates.length > 0 && (
                        <section className="space-y-2">
                            <h2 className="text-[12px] font-bold border-b border-black pb-0.5 mt-3 mb-2 text-black font-serif uppercase tracking-wide">Certificates</h2>
                            <div className="space-y-2.5">
                                {certificates.map((cert) => (
                                    <div key={cert.id} className="space-y-0.5">
                                        <div className="flex justify-between items-baseline font-bold text-black">
                                            <span>{cert.name}</span>
                                            <span>{cert.date}</span>
                                        </div>
                                        <div className="italic text-black font-light">
                                            {cert.issuer}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Extracurricular */}
                    {extracurricular && extracurricular.length > 0 && (
                        <section className="space-y-2">
                            <h2 className="text-[12px] font-bold border-b border-black pb-0.5 mt-3 mb-2 text-black font-serif uppercase tracking-wide">Extracurricular</h2>
                            <div className="space-y-3">
                                {extracurricular.map((extra) => (
                                    <div key={extra.id} className="space-y-1">
                                        <div className="flex justify-between items-baseline font-bold text-black">
                                            <span>{extra.organization}</span>
                                            <span>{extra.date}</span>
                                        </div>
                                        <div className="flex justify-between items-baseline italic text-black font-light">
                                            <span>{extra.role}</span>
                                        </div>
                                        {extra.description && extra.description.length > 0 && (
                                            <ul className="list-disc pl-4 space-y-0.5 text-black">
                                                {extra.description.map((desc, i) => (
                                                    <li key={i} className="pl-0.5 leading-relaxed font-light">
                                                        {desc}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            </div>
        </div>
    );
});

ResumePreview.displayName = 'ResumePreview';

export default ResumePreview;

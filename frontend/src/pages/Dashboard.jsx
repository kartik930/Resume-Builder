import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { resumeAPI } from '../services/api';
import Navbar from '../components/Navbar';
import { 
    Plus, 
    Trash2, 
    Edit, 
    Download, 
    Loader2, 
    Calendar, 
    FileText, 
    LayoutGrid, 
    AlertTriangle, 
    Clock, 
    User, 
    ArrowRight 
} from 'lucide-react';

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    
    const [resumes, setResumes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null); // stores resume object to delete

    // Fetch user's resumes from the backend
    const fetchResumes = async () => {
        try {
            setLoading(true);
            const { data } = await resumeAPI.getAll();
            setResumes(data.resumes || []);
            setError(null);
        } catch (err) {
            console.error('Failed to fetch resumes:', err);
            setError('Could not load your resumes. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchResumes();
    }, []);

    // Handle delete action
    const handleDelete = async (id) => {
        try {
            setDeletingId(id);
            await resumeAPI.delete(id);
            setResumes(prev => prev.filter(r => r._id !== id));
            setShowDeleteConfirm(null);
        } catch (err) {
            console.error('Failed to delete resume:', err);
            alert('Failed to delete resume. Please try again.');
        } finally {
            setDeletingId(null);
        }
    };

    // Format ISO dates into human-readable strings
    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <div className="min-h-screen bg-background text-text font-sans">
            <Navbar />

            <main className="max-w-screen-xl mx-auto px-6 py-10 space-y-8">
                {/* Header Welcome Section */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-[rgba(255,255,255,0.01)] border border-border rounded-3xl p-8 backdrop-blur-xl shadow-lg relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-50" />
                    <div className="relative space-y-2">
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2rem] text-primary">
                            <Clock size={14} />
                            <span>Welcome Back</span>
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-black text-heading">
                            Hello, <span className="text-primary">{user?.name || 'User'}</span>
                        </h1>
                        <p className="text-subtext text-sm sm:text-base font-light">
                            Manage your professional resumes, apply modern templates, and stand out to recruiters.
                        </p>
                    </div>
                    <div className="relative flex-shrink-0">
                        <Link
                            to="/editor"
                            className="btn-primary px-6 py-3 font-semibold text-sm flex items-center gap-2 rounded-xl shadow-lg shadow-primary/25 hover:shadow-glow hover:scale-[1.02] transition-all duration-300"
                        >
                            <Plus size={18} />
                            Create New Resume
                        </Link>
                    </div>
                </div>

                {/* Resumes Grid/Section */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-border pb-3">
                        <div className="flex items-center gap-2">
                            <FileText size={20} className="text-primary" />
                            <h2 className="text-xl font-bold text-heading">Your Saved Resumes</h2>
                        </div>
                        <span className="text-xs px-2.5 py-1 rounded-full bg-surface-highlight border border-border text-subtext font-semibold">
                            {resumes.length} {resumes.length === 1 ? 'Resume' : 'Resumes'}
                        </span>
                    </div>

                    {/* Error Alerts */}
                    {error && (
                        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-sm">
                            <AlertTriangle size={18} className="flex-shrink-0" />
                            <span>{error}</span>
                            <button onClick={fetchResumes} className="ml-auto underline font-semibold text-xs hover:text-red-400">
                                Retry
                            </button>
                        </div>
                    )}

                    {/* Loading State */}
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-48 rounded-2xl border border-border bg-surface-highlight/40 animate-pulse flex flex-col justify-between p-6">
                                    <div className="space-y-3">
                                        <div className="w-1/2 h-5 bg-border rounded" />
                                        <div className="w-3/4 h-4 bg-border rounded" />
                                    </div>
                                    <div className="flex justify-between items-center pt-4 border-t border-border/50">
                                        <div className="w-1/3 h-4 bg-border rounded" />
                                        <div className="w-1/4 h-8 bg-border rounded" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : resumes.length === 0 ? (
                        /* Empty State */
                        <div className="flex flex-col items-center justify-center text-center p-12 bg-white dark:bg-[rgba(255,255,255,0.01)] border border-dashed border-border rounded-3xl space-y-6 max-w-xl mx-auto py-16 shadow-inner">
                            <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-inner">
                                <FileText size={32} />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-bold text-heading">No resumes found</h3>
                                <p className="text-sm text-subtext leading-relaxed max-w-sm">
                                    You haven't saved any resumes to your profile yet. Start by creating a resume using one of our premium ATS templates.
                                </p>
                            </div>
                            <Link
                                to="/editor"
                                className="btn-secondary py-2.5 px-5 text-sm bg-primary/5 border-primary/20 hover:bg-primary/10 text-primary inline-flex items-center gap-2"
                            >
                                <Plus size={16} /> Create My First Resume
                            </Link>
                        </div>
                    ) : (
                        /* Resumes List */
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {resumes.map((resume) => {
                                const fullName = resume.personalInfo?.fullName || 'No Name Provided';
                                const jobTitle = resume.personalInfo?.jobTitle || 'No Title Provided';
                                
                                return (
                                    <div 
                                        key={resume._id} 
                                        className="group relative flex flex-col justify-between p-6 rounded-2xl bg-surface border border-border hover:border-primary/30 shadow-md hover:shadow-glow transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                                    >
                                        {/* Card Background Gradient effect on Hover */}
                                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                                        
                                        <div className="relative space-y-4">
                                            {/* Card Top Title & Details */}
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="space-y-1">
                                                    <h3 className="font-bold text-lg text-heading group-hover:text-primary transition-colors leading-snug truncate max-w-[200px]" title={resume.title}>
                                                        {resume.title}
                                                    </h3>
                                                    <div className="flex items-center gap-1.5 text-xs text-subtext">
                                                        <User size={12} />
                                                        <span className="truncate max-w-[150px]">{fullName}</span>
                                                    </div>
                                                </div>
                                                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 flex-shrink-0">
                                                    {resume.template || 'ats'}
                                                </span>
                                            </div>

                                            <p className="text-xs text-subtext font-light leading-relaxed truncate max-w-full">
                                                {jobTitle}
                                            </p>
                                        </div>

                                        {/* Card Footer Actions */}
                                        <div className="relative flex items-center justify-between mt-6 pt-4 border-t border-border">
                                            <div className="flex items-center gap-1 text-[11px] text-subtext">
                                                <Calendar size={12} />
                                                <span>{formatDate(resume.updatedAt)}</span>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {/* Edit Button */}
                                                <button
                                                    onClick={() => navigate(`/editor?id=${resume._id}`)}
                                                    className="p-2 bg-primary/5 hover:bg-primary text-primary hover:text-white rounded-lg transition-all"
                                                    title="Edit Resume"
                                                >
                                                    <Edit size={14} />
                                                </button>

                                                {/* Delete Button */}
                                                <button
                                                    onClick={() => setShowDeleteConfirm(resume)}
                                                    className="p-2 bg-red-500/5 hover:bg-red-500 text-red-500 hover:text-white rounded-lg transition-all"
                                                    title="Delete Resume"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] animate-fade-in">
                    <div className="bg-surface border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl mx-4 space-y-4">
                        <div className="flex items-center gap-3 text-red-500">
                            <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                                <AlertTriangle size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-heading">Delete Resume</h3>
                                <p className="text-xs text-subtext">This action cannot be undone</p>
                            </div>
                        </div>

                        <p className="text-sm text-subtext leading-relaxed">
                            Are you sure you want to delete <span className="font-bold text-heading">"{showDeleteConfirm.title}"</span>? This will permanently delete it from your cloud profile.
                        </p>

                        <div className="flex items-center justify-end gap-3 pt-2">
                            <button
                                onClick={() => setShowDeleteConfirm(null)}
                                className="px-4 py-2 text-xs font-semibold border border-border bg-surface-highlight hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg text-text transition-all"
                                disabled={deletingId !== null}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDelete(showDeleteConfirm._id)}
                                className="px-4 py-2 text-xs font-semibold bg-red-500 text-white hover:bg-red-600 rounded-lg transition-all flex items-center gap-2"
                                disabled={deletingId !== null}
                            >
                                {deletingId === showDeleteConfirm._id ? (
                                    <>
                                        <Loader2 size={12} className="animate-spin" />
                                        Deleting...
                                    </>
                                ) : (
                                    'Delete'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;

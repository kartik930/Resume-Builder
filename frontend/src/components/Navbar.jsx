import React, { useContext, useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileText, Sparkles, Download, Sun, Moon, LogOut, User, ChevronDown } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
    const { theme, toggleTheme } = useTheme();
    const { user, isAuthenticated, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        setShowDropdown(false);
        await logout();
        navigate('/login');
    };

    return (
        <nav className="h-16 border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50">
            <div className="max-w-8xl mx-auto px-6 h-full flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-3 group">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-light rounded-xl flex items-center justify-center text-white shadow-glow group-hover:shadow-glow-cyan transition-all duration-300">
                        <FileText size={22} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 className="font-bold text-lg leading-tight text-heading">ResumeCraft</h1>
                        <p className="text-xs text-subtext group-hover:text-primary transition-colors">Build. Export. Land.</p>
                    </div>
                </Link>

                {/* Actions */}
                <div className="flex items-center gap-3 ml-auto">
                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className="flex items-center justify-center w-10 h-10 text-subtext hover:text-heading hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-all"
                        aria-label="Toggle theme"
                    >
                        {theme === 'light' ? (
                            <Moon size={20} className="transition-transform duration-200" />
                        ) : (
                            <Sun size={20} className="transition-transform duration-200" />
                        )}
                    </button>

                    {/* AI Optimize */}
                    <button className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-all">
                        <Sparkles size={16} />
                        <span>AI Optimize</span>
                    </button>

                    {/* Export */}
                    <button className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-medium text-subtext hover:text-heading hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-all">
                        <Download size={16} />
                        <span>Export</span>
                    </button>

                    {isAuthenticated ? (
                        /* User Dropdown */
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setShowDropdown(!showDropdown)}
                                className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-all"
                            >
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-white text-sm font-bold">
                                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                </div>
                                <span className="hidden md:block text-sm font-medium text-heading max-w-[100px] truncate">
                                    {user?.name}
                                </span>
                                <ChevronDown
                                    size={14}
                                    className={`text-subtext transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`}
                                />
                            </button>

                            {showDropdown && (
                                <div className="absolute right-0 mt-2 w-56 bg-surface border border-border rounded-xl shadow-2xl shadow-black/20 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div className="px-4 py-3 border-b border-border">
                                        <p className="text-sm font-semibold text-heading truncate">{user?.name}</p>
                                        <p className="text-xs text-subtext truncate">{user?.email}</p>
                                    </div>
                                    <div className="py-1">
                                        <button
                                            onClick={() => { setShowDropdown(false); navigate('/dashboard'); }}
                                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-text hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                                        >
                                            <FileText size={16} className="text-subtext" />
                                            My Resumes
                                        </button>
                                        <button
                                            onClick={() => { setShowDropdown(false); }}
                                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-text hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                                        >
                                            <User size={16} className="text-subtext" />
                                            Profile
                                        </button>
                                    </div>
                                    <div className="border-t border-border py-1">
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                                        >
                                            <LogOut size={16} />
                                            Sign Out
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        /* Login / Signup Buttons */
                        <div className="flex items-center gap-2">
                            <Link
                                to="/login"
                                className="px-4 py-2.5 text-sm font-medium text-heading hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-all"
                            >
                                Sign In
                            </Link>
                            <Link
                                to="/register"
                                className="btn-cta text-white px-5 py-2.5 text-sm font-semibold"
                            >
                                <FileText size={16} />
                                <span>Get Started</span>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;

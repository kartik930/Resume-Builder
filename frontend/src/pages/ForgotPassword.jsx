import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Mail, ArrowRight, Loader2, KeyRound } from 'lucide-react';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const { forgotPassword } = useContext(AuthContext);

    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await forgotPassword(email);
            setSent(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const handleContinue = () => {
        navigate('/reset-password', { state: { email } });
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
            {/* Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
            </div>

            <div className="relative w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 mb-6">
                        <KeyRound className="text-primary" size={32} />
                    </div>
                    <h1 className="text-3xl font-bold text-heading mb-2">
                        {sent ? 'Check your email' : 'Forgot password?'}
                    </h1>
                    <p className="text-subtext">
                        {sent
                            ? `We've sent a reset code to ${email}`
                            : "No worries, we'll send you reset instructions"
                        }
                    </p>
                </div>

                {/* Card */}
                <div className="bg-surface border border-border rounded-2xl p-8 shadow-xl shadow-black/5">
                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-start gap-3">
                            <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    {!sent ? (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-xs font-medium text-subtext mb-2">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-subtext" size={18} />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => { setEmail(e.target.value); setError(''); }}
                                        className="input-base pl-11"
                                        placeholder="you@example.com"
                                        required
                                        autoComplete="email"
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 px-4 bg-gradient-to-r from-primary to-primary-light text-white font-semibold rounded-xl hover:opacity-90 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/25"
                            >
                                {loading ? (
                                    <Loader2 className="animate-spin" size={20} />
                                ) : (
                                    <>
                                        Send Reset Code
                                        <ArrowRight size={18} />
                                    </>
                                )}
                            </button>
                        </form>
                    ) : (
                        <div className="space-y-5">
                            <div className="text-center p-6 bg-green-500/5 border border-green-500/20 rounded-xl">
                                <p className="text-green-400 text-sm">
                                    ✅ If an account exists with that email, you'll receive a 6-digit OTP code.
                                </p>
                            </div>
                            <button
                                onClick={handleContinue}
                                className="w-full py-3 px-4 bg-gradient-to-r from-primary to-primary-light text-white font-semibold rounded-xl hover:opacity-90 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-primary/25"
                            >
                                Enter OTP & Reset Password
                                <ArrowRight size={18} />
                            </button>
                        </div>
                    )}

                    {/* Back */}
                    <div className="mt-6 text-center">
                        <Link to="/login" className="text-sm text-subtext hover:text-heading transition-colors">
                            ← Back to login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;

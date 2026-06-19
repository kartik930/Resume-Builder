import React, { useState, useContext, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ShieldCheck, Loader2, RotateCcw } from 'lucide-react';

const VerifyOTP = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { verifyOTP, resendOTP } = useContext(AuthContext);

    const email = location.state?.email;
    const purpose = location.state?.purpose || 'verification';

    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [countdown, setCountdown] = useState(60);
    const inputRefs = useRef([]);

    // Redirect if no email in state
    useEffect(() => {
        if (!email) {
            navigate('/register');
        }
    }, [email, navigate]);

    // Countdown timer for resend
    useEffect(() => {
        if (countdown <= 0) return;
        const timer = setInterval(() => {
            setCountdown((prev) => prev - 1);
        }, 1000);
        return () => clearInterval(timer);
    }, [countdown]);

    const handleChange = (index, value) => {
        if (!/^\d*$/.test(value)) return; // Only allow digits

        const newOtp = [...otp];
        newOtp[index] = value.slice(-1); // Take only last char
        setOtp(newOtp);
        setError('');

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        // Move back on backspace if current is empty
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (pasted.length > 0) {
            const newOtp = [...otp];
            for (let i = 0; i < 6; i++) {
                newOtp[i] = pasted[i] || '';
            }
            setOtp(newOtp);
            // Focus last filled or the next empty
            const focusIndex = Math.min(pasted.length, 5);
            inputRefs.current[focusIndex]?.focus();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const otpString = otp.join('');
        if (otpString.length !== 6) {
            setError('Please enter all 6 digits');
            return;
        }

        setLoading(true);
        setError('');
        try {
            await verifyOTP(email, otpString);
            navigate('/editor');
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setResending(true);
        setError('');
        try {
            await resendOTP(email, purpose);
            setSuccess('A new OTP has been sent to your email!');
            setCountdown(60);
            setOtp(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
            setTimeout(() => setSuccess(''), 4000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to resend OTP');
        } finally {
            setResending(false);
        }
    };

    if (!email) return null;

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
                        <ShieldCheck className="text-primary" size={32} />
                    </div>
                    <h1 className="text-3xl font-bold text-heading mb-2">Verify your email</h1>
                    <p className="text-subtext">
                        We sent a 6-digit code to{' '}
                        <span className="text-heading font-medium">{email}</span>
                    </p>
                </div>

                {/* OTP Card */}
                <div className="bg-surface border border-border rounded-2xl p-8 shadow-xl shadow-black/5">
                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-start gap-3">
                            <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm flex items-start gap-3">
                            <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        {/* OTP Input Grid */}
                        <div className="flex gap-3 justify-center mb-8" onPaste={handlePaste}>
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={(el) => (inputRefs.current[index] = el)}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    className="w-12 h-14 text-center text-xl font-bold rounded-xl border-2 border-border bg-input-bg text-heading focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200"
                                    autoFocus={index === 0}
                                />
                            ))}
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading || otp.join('').length !== 6}
                            className="w-full py-3 px-4 bg-gradient-to-r from-primary to-primary-light text-white font-semibold rounded-xl hover:opacity-90 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/25"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : (
                                'Verify & Continue'
                            )}
                        </button>
                    </form>

                    {/* Resend */}
                    <div className="mt-6 text-center">
                        {countdown > 0 ? (
                            <p className="text-sm text-subtext">
                                Resend code in <span className="text-heading font-semibold">{countdown}s</span>
                            </p>
                        ) : (
                            <button
                                onClick={handleResend}
                                disabled={resending}
                                className="text-sm text-primary hover:text-primary-light font-semibold transition-colors inline-flex items-center gap-1.5"
                            >
                                {resending ? <Loader2 className="animate-spin" size={14} /> : <RotateCcw size={14} />}
                                Resend OTP
                            </button>
                        )}
                    </div>

                    {/* Back */}
                    <div className="mt-4 text-center">
                        <Link to="/login" className="text-xs text-subtext hover:text-heading transition-colors">
                            ← Back to login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerifyOTP;

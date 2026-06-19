const nodemailer = require('nodemailer');

/**
 * Create email transporter
 * In development mode without email config, OTPs are logged to console
 */
const createTransporter = () => {
    const emailUser = process.env.EMAIL_USER || process.env.SMTP_USER;
    const emailPass = process.env.EMAIL_PASS || process.env.SMTP_PASS;

    if (!emailUser || emailUser === 'your_email@gmail.com') {
        return null; // No email configured — will log to console
    }

    return nodemailer.createTransport({
        host: process.env.EMAIL_HOST || process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT || process.env.SMTP_PORT) || 587,
        secure: false,
        auth: {
            user: emailUser,
            pass: emailPass,
        },
    });
};

/**
 * Send OTP via email
 * Falls back to console logging in dev mode if email isn't configured
 */
const sendOTPEmail = async (email, otp, purpose) => {
    const subject =
        purpose === 'verification'
            ? '✅ Verify Your Resume Builder Account'
            : '🔐 Password Reset OTP';

    const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 500px; margin: 0 auto; background: #0f0f11; border-radius: 16px; overflow: hidden; border: 1px solid #1e1e24;">
        <div style="background: linear-gradient(135deg, #6C63FF 0%, #4F46E5 100%); padding: 32px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">Resume Builder</h1>
            <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 14px;">
                ${purpose === 'verification' ? 'Email Verification' : 'Password Reset'}
            </p>
        </div>
        <div style="padding: 32px; text-align: center;">
            <p style="color: #a1a1aa; font-size: 15px; margin: 0 0 24px;">
                ${purpose === 'verification'
                    ? 'Use the code below to verify your email address:'
                    : 'Use the code below to reset your password:'
                }
            </p>
            <div style="background: #1a1a2e; border: 2px dashed #6C63FF; border-radius: 12px; padding: 20px; margin: 0 0 24px;">
                <span style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #6C63FF; font-family: 'Courier New', monospace;">
                    ${otp}
                </span>
            </div>
            <p style="color: #71717a; font-size: 13px; margin: 0;">
                This code expires in <strong style="color: #a1a1aa;">10 minutes</strong>.
                <br/>Do not share this code with anyone.
            </p>
        </div>
        <div style="padding: 16px 32px; border-top: 1px solid #1e1e24; text-align: center;">
            <p style="color: #52525b; font-size: 12px; margin: 0;">
                If you didn't request this, you can safely ignore this email.
            </p>
        </div>
    </div>
    `;

    const transporter = createTransporter();

    if (!transporter) {
        // Development fallback — log to console
        console.log('');
        console.log('╔══════════════════════════════════════════╗');
        console.log('║     📧 EMAIL NOT CONFIGURED             ║');
        console.log('║     OTP logged to console instead        ║');
        console.log('╠══════════════════════════════════════════╣');
        console.log(`║  Email:   ${email.padEnd(30)}║`);
        console.log(`║  OTP:     ${otp.padEnd(30)}║`);
        console.log(`║  Purpose: ${purpose.padEnd(30)}║`);
        console.log(`║  Expires: 10 minutes                     ║`);
        console.log('╚══════════════════════════════════════════╝');
        console.log('');
        return true;
    }

    try {
        await transporter.sendMail({
            from: process.env.EMAIL_FROM || process.env.SMTP_FROM || `Resume Builder <${emailUser}>`,
            to: email,
            subject,
            html,
        });
        console.log(`📧 OTP email sent to ${email}`);
        return true;
    } catch (error) {
        console.error(`❌ Failed to send email to ${email}:`, error.message);
        // Still log OTP to console so dev can continue testing
        console.log(`🔑 Fallback — OTP for ${email}: ${otp}`);
        return true; // Don't block registration even if email fails
    }
};

module.exports = { sendOTPEmail };


import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { userRepository } from '@/lib/supabaseUserRepository';

// Configure email transporter (using Gmail or your email service)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASSWORD || 'your-app-password',
  },
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    console.log('🔑 Password reset request for:', email);

    if (!email) {
      console.log('❌ Email not provided');
      return NextResponse.json(
        { error: 'Please provide your email address' },
        { status: 400 }
      );
    }

    // Find user
    const user = await userRepository.findByEmail(email);
    if (!user) {
      console.log('ℹ️ User not found:', email);
      // For security, don't reveal if user exists
      return NextResponse.json(
        {
          success: true,
          message: 'If an account exists with this email, a password reset link has been sent',
        },
        { status: 200 }
      );
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Update user with reset token
    await userRepository.update(user.id, {
      resetToken,
      resetTokenExpiry,
    });

    console.log('✅ Reset token generated for:', user.id);

    // Create password reset link
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    // Send email
    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@quickprep.com',
      to: user.email,
      subject: 'Password Reset Request - QuickPrep',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #667eea;">Password Reset Request</h2>
          <p>Hello ${user.name},</p>
          <p>We received a request to reset your password. Click the link below to proceed:</p>
          <a href="${resetLink}" style="display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">
            Reset Password
          </a>
          <p>Or copy and paste this link in your browser:</p>
          <p style="word-break: break-all; color: #666;">${resetLink}</p>
          <p style="color: #999; font-size: 12px;">This link will expire in 1 hour.</p>
          <p>If you didn't request a password reset, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #999; font-size: 12px;">© 2026 QuickPrep. All rights reserved.</p>
        </div>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log('📧 Reset email sent to:', user.email);
    } catch (emailError) {
      console.warn('⚠️ Email not sent (development mode):', emailError);
      // In development, we can still proceed without email
    }

    return NextResponse.json(
      {
        success: true,
        message: 'If an account exists with this email, a password reset link has been sent',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Forgot password error:', error);
    return NextResponse.json(
      { error: 'An error occurred. Please try again.' },
      { status: 500 }
    );
  }
}

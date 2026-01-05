import { NextRequest, NextResponse } from 'next/server';
import { userRepository } from '@/lib/userRepository';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, password, confirmPassword } = body;

    console.log('🔐 Password reset attempt with token:', token);

    // Validate required fields
    if (!token || !password || !confirmPassword) {
      console.log('❌ Missing required fields');
      return NextResponse.json(
        { error: 'Please provide reset token and new password' },
        { status: 400 }
      );
    }

    // Validate passwords match
    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: 'Passwords do not match' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 6) {
      console.log('❌ Password too short');
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Find user by reset token
    const user = userRepository.findByResetToken(token);

    if (!user) {
      console.log('❌ Invalid or expired token');
      return NextResponse.json(
        { error: 'Invalid or expired reset token. Please request a new password reset.' },
        { status: 400 }
      );
    }

    console.log('👤 User found:', user.id);

    // Update password and clear reset token
    console.log('🔐 Hashing new password...');
    userRepository.update(user.id, {
      password,
      resetToken: null,
      resetTokenExpiry: null,
    });

    console.log('✅ Password updated successfully');

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully. You can now login with your new password.',
    });
  } catch (error) {
    console.error('❌ Reset password error:', error);
    return NextResponse.json(
      { error: 'An error occurred. Please try again.' },
      { status: 500 }
    );
  }
}

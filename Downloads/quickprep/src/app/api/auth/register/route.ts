import { NextRequest, NextResponse } from 'next/server';
import bcryptjs from 'bcryptjs';
import { userRepository } from '@/lib/userRepository';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, confirmPassword } = body;

    console.log('📝 Registration attempt:', { name, email });

    // Validate required fields
    if (!name || !email || !password || !confirmPassword) {
      console.log('❌ Missing fields');
      return NextResponse.json(
        { error: 'Please provide all required fields' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('❌ Invalid email format:', email);
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Check if passwords match
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

    // Check if user already exists
    const existingUser = userRepository.findByEmail(email);
    if (existingUser) {
      console.log('❌ Email already exists:', email);
      return NextResponse.json(
        { error: 'Email already registered. Please login or use a different email.' },
        { status: 409 }
      );
    }

    // Create new user
    console.log('🔐 Hashing password...');
    const newUser = userRepository.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=667eea&color=fff`,
    });

    console.log('✅ User created successfully:', newUser.id);

    return NextResponse.json(
      {
        success: true,
        message: 'Account created successfully! Please log in.',
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('❌ Registration error:', error);
    return NextResponse.json(
      { error: 'An error occurred during registration. Please try again.' },
      { status: 500 }
    );
  }
}


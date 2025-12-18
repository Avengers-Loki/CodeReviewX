
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';


export async function POST(request: Request) {
    try {
        console.log('Login API hit');
        const { email, password } = await request.json();
        console.log('Login attempt for:', email);

        if (!email || !password) {
            console.log('Login missing fields');
            return NextResponse.json(
                { error: 'Please provide email and password' },
                { status: 400 }
            );
        }

        await dbConnect();

        // Check for user
        const user = await User.findOne({ email });
        if (!user) {
            console.log('Login: User not found for email:', email);
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 400 }
            );
        }

        // Check password
        console.log('Login: User found, verifying password...');
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log('Login: Password mismatch');
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 400 }
            );
        }

        console.log('Login: Credentials valid, generating token...');
        // Create token
        const token = jwt.sign(
            { id: user._id, email: user.email, name: user.name },
            JWT_SECRET,
            { expiresIn: '30d' }
        );

        // Create the response
        const response = NextResponse.json(
            {
                message: 'Login successful',
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email
                }
            },
            { status: 200 }
        );

        // Set cookie
        response.cookies.set('token', token, {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24 * 30, // 30 days
            path: '/',
        });

        console.log('Login successful, cookie set');
        return response;

    } catch (error: any) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}


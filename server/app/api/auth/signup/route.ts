
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';


export async function POST(request: Request) {
    try {
        console.log('Signup API hit');
        const body = await request.json();
        console.log('Request body:', body);
        const { name, email, password } = body;

        if (!name || !email || !password) {
            console.log('Missing fields');
            return NextResponse.json(
                { error: 'Please provide all required fields' },
                { status: 400 }
            );
        }

        console.log('Connecting to DB...');
        await dbConnect();
        console.log('Connected to DB');

        console.log('Checking for existing user...');
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log('User already exists');
            return NextResponse.json(
                { error: 'User already exists with this email' },
                { status: 400 }
            );
        }

        console.log('Hashing password...');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        console.log('Creating user...');
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
        });
        console.log('User created:', user);

        return NextResponse.json(
            { message: 'User created successfully', userId: user._id },
            { status: 201 }
        );
    } catch (error: any) {
        console.error('Signup error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error: ' + error.message },
            { status: 500 }
        );
    }
}


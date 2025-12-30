import { OAuth2Client } from "google-auth-library";
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import jwt from 'jsonwebtoken';

const client = new OAuth2Client(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    console.error('JWT_SECRET is not defined in environment variables');
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { token } = body;

        if (!token) {
            return NextResponse.json({ error: "Missing token" }, { status: 400 });
        }

        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();

        if (!payload) {
            return NextResponse.json({ error: "Invalid token payload" }, { status: 400 });
        }

        const { email, name, picture, sub: googleId } = payload;

        await dbConnect();

        let user = await User.findOne({ email });

        if (!user) {
            user = await User.create({
                name,
                email,
                image: picture,
                googleId,
            });
        } else if (!user.googleId) {
            user.googleId = googleId;
            user.image = picture || user.image;
            await user.save();
        }

        // Create JWT token
        if (!JWT_SECRET) {
            return NextResponse.json({ error: "Configuration error" }, { status: 500 });
        }

        const jwtToken = jwt.sign(
            { id: user._id, email: user.email, name: user.name },
            JWT_SECRET,
            { expiresIn: '30d' }
        );

        // Create the response
        const response = NextResponse.json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                image: user.image
            }
        });

        // Set cookie
        response.cookies.set('token', jwtToken, {
            httpOnly: false, // Must be false so client-side js-cookie can read it (per existing Navbar logic)
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24 * 30, // 30 days
            path: '/',
        });

        return response;

    } catch (error: any) {
        console.error("Google Login Error:", error);
        return NextResponse.json({ error: "Authentication failed" }, { status: 401 });
    }
}

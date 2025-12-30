
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get('endpoint');

    // --- Authentication & Abuse Prevention ---
    const cookieStore = await cookies();
    const token = cookieStore.get('token');
    const guestUsage = cookieStore.get('codewiki_guest_usage');
    const JWT_SECRET = process.env.JWT_SECRET;

    let isAuthorized = false;

    // Check if user is authenticated
    if (token && JWT_SECRET) {
        try {
            jwt.verify(token.value, JWT_SECRET);
            isAuthorized = true;
        } catch (e) {
            isAuthorized = false;
        }
    }

    // Allow 1-time guest access if token is missing but guest usage is not yet marked
    // Note: /api/analyze marks the guest usage, so if they haven't analyzed anything yet, they are "new guest"
    if (!isAuthorized && !guestUsage) {
        isAuthorized = true;
    }

    if (!isAuthorized) {
        return NextResponse.json({ error: 'Authentication required. Please sign in.' }, { status: 401 });
    }
    // -----------------------------------------


    if (!endpoint) {
        return NextResponse.json({ error: 'Endpoint parameter is required' }, { status: 400 });
    }

    // Prevent abuse by validating endpoint starts with 'repos/'
    if (!endpoint.startsWith('repos/')) {
        return NextResponse.json({ error: 'Invalid endpoint' }, { status: 403 });
    }

    const githubToken = process.env.GITHUB_TOKEN;
    const headers: HeadersInit = {
        'Accept': 'application/vnd.github.v3+json',
    };

    if (githubToken) {
        headers['Authorization'] = `token ${githubToken}`;
    }

    try {
        const res = await fetch(`https://api.github.com/${endpoint}`, {
            headers,
            next: { revalidate: 60 } // Cache for 1 minute
        });

        if (!res.ok) {
            return NextResponse.json(
                { error: res.statusText, status: res.status },
                { status: res.status }
            );
        }

        const data = await res.json();
        return NextResponse.json(data);

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

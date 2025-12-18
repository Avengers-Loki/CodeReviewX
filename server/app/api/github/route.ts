
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get('endpoint');

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

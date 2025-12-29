import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export async function POST(req: Request) {
    try {
        const { code, filename, repo } = await req.json();

        // --- Usage Limit Logic ---
        const cookieStore = cookies();
        const token = cookieStore.get('token');
        let isAuthenticated = false;

        const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';
        
        // Warn if using default secret in production
        if (process.env.NODE_ENV === 'production' && JWT_SECRET === 'your-secret-key-change-this') {
            console.error('WARNING: Using default JWT_SECRET in production! Set JWT_SECRET environment variable.');
        }

        if (token) {
            try {
                // Verify token if it exists
                jwt.verify(token.value, JWT_SECRET);
                isAuthenticated = true;
            } catch (e) {
                // Invalid token, treating as guest
                isAuthenticated = false;
            }
        }

        if (!isAuthenticated) {
            const usageCookie = cookieStore.get('codewiki_guest_usage');
            if (usageCookie) {
                return NextResponse.json(
                    { error: 'Free Usage Limit Reached. Please Sign In to continue using CodeReviewX.' },
                    { status: 403 }
                );
            }
        }
        // -------------------------

        const apiKey = process.env.GOOGLE_AI_API_KEY;
        if (!apiKey) {
            return NextResponse.json(
                { error: 'GOOGLE_AI_API_KEY is not set in environment variables.' },
                { status: 500 }
            );
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemma-3-27b-it' });

        const prompt = `
        You are an expert software engineer and technical writer. 
        Analyze the following code file from the repository "${repo}".
        
        File Name: ${filename}
        
        CODE:
        \`\`\`
        ${code.slice(0, 4000)} // Reduced context to avoid free tier token limits
        \`\`\`

        Please provide a comprehensive documentation in Markdown format including:
        1. **Overview**: A high-level plain English summary of what this file does.
        2. **Key Components**: Identify classes, main functions, or configuration blocks.
        3. **Dependencies**: What external libraries or internal modules does it rely on?
        4. **Usage/Flow**: Briefly explain how this code is used or the logic flow.
        
        Format the output clearly with Markdown headers.
        `;

        // Helper for retry logic
        const generateWithRetry = async (retries = 3, initialDelay = 5000) => {
            try {
                const result = await model.generateContent(prompt);
                const response = await result.response;
                return response.text();
            } catch (error: any) {
                // Parse retry delay from error message if available
                let waitTime = initialDelay;
                const match = error.message?.match(/retry in (\d+(\.\d+)?)s/);
                if (match && match[1]) {
                    waitTime = Math.ceil(parseFloat(match[1])) * 1000 + 1000; // Add 1s buffer
                }

                if (retries > 0 && (error.status === 429 || error.status === 503 || error.message?.includes('429'))) {
                    console.log(`Rate limited. Waiting ${waitTime / 1000}s before retry... (${retries} retries left)`);
                    await new Promise(resolve => setTimeout(resolve, waitTime));
                    // If we waited a specific long time, reset delay or keep it standard for next try
                    return generateWithRetry(retries - 1, match ? 5000 : initialDelay * 2);
                }
                throw error;
            }
        };

        const text = await generateWithRetry(3, 5000);

        const response = NextResponse.json({ result: text });

        // If guest, mark as used
        if (!isAuthenticated) {
            response.cookies.set('codewiki_guest_usage', 'true', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 60 * 60 * 24 * 365, // 1 year
                path: '/',
            });
        }

        return response;

    } catch (error: any) {
        console.error('Gemini Analysis Error:', error);

        const isRateLimit = error.status === 429 || error.message?.includes('429');
        const status = isRateLimit ? 429 : 500;

        // Extract retry delay if possible
        let retryAfter = 60;
        const match = error.message?.match(/retry in (\d+(\.\d+)?)s/);
        if (match && match[1]) {
            retryAfter = Math.ceil(parseFloat(match[1]));
        }

        return NextResponse.json(
            {
                error: isRateLimit ? `Rate limit exceeded. Please retry in ${retryAfter} seconds.` : (error.message || 'Failed to generate analysis.'),
                retryAfter: retryAfter,
                details: error.message
            },
            { status: status }
        );
    }
}

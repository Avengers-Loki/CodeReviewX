
import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { messages, context } = await req.json();

        const apiKey = process.env.GOOGLE_AI_API_KEY;
        if (!apiKey) {
            return NextResponse.json(
                { error: 'GOOGLE_AI_API_KEY is not set' },
                { status: 500 }
            );
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: 'gemma-3-27b-it',
        });

        // Prepare history
        // Context is injected as the first user message effectively
        const validMessages = messages.filter((m: any) => m.content && m.content.trim() !== '');

        // We'll construct the chat history
        // The most recent message is the one we want to send to sendMessage
        const lastUserMessage = validMessages[validMessages.length - 1].content;
        const historyMessages = validMessages.slice(0, -1);

        // If this is the start of the conversation or we have context, purely relying on "history" formatting
        // We can prepend a context message if the history is empty, OR we can dynamically include it in the last message if needed.
        // A cleaner way is to start the chat with history where the first turn establishes context.

        const history = [];
        if (context) {
            history.push({
                role: 'user',
                parts: [{ text: `Here is the code I am looking at:\n\n\`\`\`\n${context.slice(0, 20000)}\n\`\`\`\n` }]
            });
            history.push({
                role: 'model',
                parts: [{ text: 'I have analyzed the code. What would you like to know about it?' }]
            });
        }

        historyMessages.forEach((m: any) => {
            history.push({
                role: m.role === 'user' ? 'user' : 'model',
                parts: [{ text: m.content }]
            });
        });

        const chat = model.startChat({
            history: history
        });

        // Retry logic for chat
        const sendMessageWithRetry = async (msg: string, retries = 3, initialDelay = 5000) => {
            try {
                const result = await chat.sendMessage(msg);
                const response = await result.response;
                return response.text();
            } catch (error: any) {
                // Parse retry delay if available
                let waitTime = initialDelay;
                const match = error.message?.match(/retry in (\d+(\.\d+)?)s/);
                if (match && match[1]) {
                    waitTime = Math.ceil(parseFloat(match[1])) * 1000 + 1000;
                }

                if (retries > 0 && (error.status === 429 || error.status === 503 || error.message?.includes('429'))) {
                    console.log(`Chat Rate limited. Waiting ${waitTime / 1000}s... (${retries} retries left)`);
                    await new Promise(resolve => setTimeout(resolve, waitTime));
                    return sendMessageWithRetry(msg, retries - 1, match ? 5000 : initialDelay * 2);
                }
                throw error;
            }
        }

        const text = await sendMessageWithRetry(lastUserMessage, 3, 5000);

        return NextResponse.json({ result: text });

    } catch (error: any) {
        console.error('Chat API Error:', error);
        return NextResponse.json(
            { error: error?.message || 'Failed to generate chat response' },
            { status: 500 }
        );
    }
}

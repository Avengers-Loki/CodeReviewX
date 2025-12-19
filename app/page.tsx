
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Github, BookOpen, Code2 } from 'lucide-react';


export default function Home() {
    const [repoUrl, setRepoUrl] = useState('');
    const router = useRouter();

    const handleAnalyze = (e: React.FormEvent) => {
        e.preventDefault();
        if (!repoUrl) return;

        // Extract owner/repo from URL or string
        let path = repoUrl;
        if (repoUrl.includes('github.com')) {
            const url = new URL(repoUrl);
            path = url.pathname.slice(1);
        }

        // Check if user is logged in (token cookie exists)
        const isLoggedIn = document.cookie.includes('token=');

        if (isLoggedIn) {
            router.push(`/analyze?repo=${path}`);
            return;
        }

        // Check usage for guest
        const usageCount = parseInt(localStorage.getItem('guest_usage_count') || '0', 10);

        if (usageCount < 1) {
            localStorage.setItem('guest_usage_count', (usageCount + 1).toString());
            router.push(`/analyze?repo=${path}`);
        } else {
            // Redirect to signup with return URL
            router.push(`/signup?returnUrl=${encodeURIComponent(`/analyze?repo=${path}`)}`);
        }
    };


    const popularRepos = ['facebook/react', 'vercel/next.js', 'tensorflow/tensorflow'];

    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)]" style={{ padding: '4rem 1rem' }}>
            <div className="container animate-fade-in" style={{ textAlign: 'center', maxWidth: '800px' }}>
                <div style={{ marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '3.5rem', lineHeight: 1.1, background: 'linear-gradient(to right, #1a1a1a, #7456F1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 800 }}>
                        Understand any codebase<br />in seconds.
                    </h1>
                    <p style={{ fontSize: '1.25rem', marginTop: '1.5rem', opacity: 0.8, color: 'var(--secondary)' }}>
                        AI-powered documentation, architecture diagrams, and customized explanations for any GitHub repository.
                    </p>
                </div>

                <form onSubmit={handleAnalyze} className="card" style={{ padding: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', maxWidth: '600px', margin: '0 auto', background: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 8px 30px rgba(0,0,0,0.08)', borderRadius: '12px' }}>
                    <Search size={20} style={{ color: '#7456F1', marginLeft: '0.75rem' }} />
                    <input
                        type="text"
                        className="input"
                        style={{ border: 'none', background: 'transparent', fontSize: '1.1rem', padding: '0.75rem', color: '#1e293b' }}
                        placeholder="Search or enter GitHub URL..."
                        value={repoUrl}
                        onChange={(e) => setRepoUrl(e.target.value)}
                    />
                    <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', background: '#7456F1', color: 'white' }}>
                        Analyze
                    </button>
                </form>

                <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <span style={{ color: 'var(--secondary)', fontSize: '0.9rem' }}>Popular:</span>
                    {popularRepos.map(repo => (
                        <button key={repo} onClick={() => router.push(`/analyze?repo=${repo}`)} style={{ background: 'none', border: 'none', color: '#7456F1', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 500 }}>
                            {repo}
                        </button>
                    ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', marginTop: '5rem', textAlign: 'left' }}>
                    <FeatureCard
                        icon={<BookOpen size={24} color="#7456F1" />}
                        title="Instant Wikis"
                        desc="Turn code into readable documentation automatically. No more outdated READMEs."
                    />
                    <FeatureCard
                        icon={<Code2 size={24} color="#E95C88" />}
                        title="Code Explanation"
                        desc="Get line-by-line explanations of complex logic using advanced LLMs."
                    />
                    <FeatureCard
                        icon={<Github size={24} color="#333" />}
                        title="Repo Chat"
                        desc="Ask questions about your codebase and get answers with citations."
                    />
                </div>
            </div>
        </div>
    );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
    return (
        <div className="card" style={{ height: '100%', background: 'white', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
            <div style={{ marginBottom: '1rem' }}>{icon}</div>
            <h3 style={{ color: '#1e293b' }}>{title}</h3>
            <p style={{ color: '#64748b' }}>{desc}</p>
        </div>
    );
}

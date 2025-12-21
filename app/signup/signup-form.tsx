'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2, Eye, EyeOff } from 'lucide-react';

export default function SignupForm() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        const initializeGoogleLogin = () => {
            const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
            if (!clientId) {
                console.error("Missing NEXT_PUBLIC_GOOGLE_CLIENT_ID");
                return;
            }

            if ((window as any).google && (window as any).google.accounts) {
                (window as any).google.accounts.id.initialize({
                    client_id: clientId,
                    callback: (window as any).handleGoogleLogin
                });

                const btnContainer = document.getElementById("google-signup-btn");
                if (btnContainer) {
                    (window as any).google.accounts.id.renderButton(
                        btnContainer,
                        { theme: "outline", size: "large", width: "400", type: "standard", shape: "rectangular", text: "signup_with", logo_alignment: "left" }
                    );
                }
            }
        };

        (window as any).handleGoogleLogin = async (response: any) => {
            try {
                setLoading(true);
                const res = await fetch("/api/google-login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ token: response.credential })
                });
                const data = await res.json();
                if (res.ok) {
                    window.location.href = '/';
                } else {
                    setError(data.error || 'Google signup failed');
                    setLoading(false);
                }
            } catch (err) {
                setError('Google signup error');
                setLoading(false);
            }
        };

        initializeGoogleLogin();
        const interval = setInterval(() => {
            if ((window as any).google && (window as any).google.accounts) {
                initializeGoogleLogin();
                clearInterval(interval);
            }
        }, 500);

        return () => clearInterval(interval);
    }, []);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Something went wrong');
            }

            // Automatically login or redirect to login
            router.push('/login?registered=true');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f8fafc',
            fontFamily: '"Inter", sans-serif',
            padding: '20px'
        }}>
            <div style={{
                width: '100%',
                maxWidth: '480px',
                backgroundColor: '#ffffff',
                borderRadius: '8px',
                boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
                padding: '48px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                border: '1px solid #f1f5f9'
            }}>
                {/* Logo Placeholder */}
                <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {/* Using a simple icon for logo to match the "Specify" look */}
                    <div style={{
                        width: '32px', height: '32px',
                        background: 'linear-gradient(135deg, #7c5dfa 0%, #a29bfe 100%)',
                        borderRadius: '8px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white'
                    }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                        </svg>
                    </div>
                    <span style={{ fontWeight: '700', fontSize: '1.25rem', color: '#1e293b' }}>CodeWiki</span>
                </div>

                <h1 style={{
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    marginBottom: '8px',
                    color: '#0f172a',
                    textAlign: 'center',
                    lineHeight: 1.3
                }}>
                    Sign up with your work email
                </h1>

                <p style={{
                    fontSize: '0.95rem',
                    color: '#64748b',
                    marginBottom: '32px',
                    textAlign: 'center',
                    lineHeight: 1.5
                }}>
                    Create your account to start managing your team workspace.
                </p>

                {error && (
                    <div style={{ width: '100%', padding: '12px', background: '#fef2f2', color: '#b91c1c', borderRadius: '6px', marginBottom: '24px', fontSize: '0.9rem', border: '1px solid #fecaca' }}>
                        {error}
                    </div>
                )}

                {/* Google Signup Button */}
                <div style={{ position: 'relative', width: '100%', marginBottom: '24px' }}>
                    {/* Invisible Google Button Overlay */}
                    <div id="google-signup-btn"
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            opacity: 0.01,
                            zIndex: 10,
                            overflow: 'hidden'
                        }}>
                    </div>

                    {/* Custom Visual Button */}
                    <button
                        type="button"
                        style={{
                            width: '100%',
                            background: 'white',
                            border: '1px solid #e2e8f0',
                            borderRadius: '6px',
                            padding: '12px',
                            fontSize: '0.95rem',
                            fontWeight: '500',
                            color: '#334155',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px',
                            transition: 'all 0.2s ease',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                        }}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Sign up with Google
                    </button>
                </div>

                <div style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '24px',
                    color: '#cbd5e1',
                    fontSize: '0.8rem',
                    fontWeight: '500'
                }}>
                    <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }}></div>
                    <span style={{ padding: '0 12px', color: '#94a3b8' }}>OR</span>
                    <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }}></div>
                </div>

                <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>

                    {/* Name Input */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '0.9rem', fontWeight: '600', color: '#334155' }}>Full Name</label>
                        <input
                            type="text"
                            required
                            placeholder="John Doe"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            style={{
                                width: '100%',
                                backgroundColor: 'white',
                                border: '1px solid #e2e8f0',
                                borderRadius: '6px',
                                padding: '12px 14px',
                                fontSize: '0.95rem',
                                outline: 'none',
                                color: '#0f172a',
                                transition: 'all 0.2s',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = '#7c5dfa';
                                e.target.style.boxShadow = '0 0 0 3px rgba(124, 93, 250, 0.1)';
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = '#e2e8f0';
                                e.target.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)';
                            }}
                        />
                    </div>

                    {/* Email Input */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '0.9rem', fontWeight: '600', color: '#334155' }}>Email</label>
                        <input
                            type="email"
                            required
                            placeholder="yourname@company.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            style={{
                                width: '100%',
                                backgroundColor: 'white',
                                border: '1px solid #e2e8f0',
                                borderRadius: '6px',
                                padding: '12px 14px',
                                fontSize: '0.95rem',
                                outline: 'none',
                                color: '#0f172a',
                                transition: 'all 0.2s',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = '#7c5dfa';
                                e.target.style.boxShadow = '0 0 0 3px rgba(124, 93, 250, 0.1)';
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = '#e2e8f0';
                                e.target.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)';
                            }}
                        />
                    </div>

                    {/* Password Input */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '0.9rem', fontWeight: '600', color: '#334155' }}>Password</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                placeholder="Create a password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                style={{
                                    width: '100%',
                                    backgroundColor: 'white',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '6px',
                                    padding: '12px 14px',
                                    paddingRight: '40px',
                                    fontSize: '0.95rem',
                                    outline: 'none',
                                    color: '#0f172a',
                                    transition: 'all 0.2s',
                                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = '#7c5dfa';
                                    e.target.style.boxShadow = '0 0 0 3px rgba(124, 93, 250, 0.1)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = '#e2e8f0';
                                    e.target.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)';
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute',
                                    right: '12px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: '#94a3b8',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: '4px'
                                }}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            backgroundColor: '#7c5dfa', // Specified purple
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '14px',
                            fontSize: '0.95rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            marginTop: '8px',
                            transition: 'all 0.2s ease',
                            boxShadow: '0 4px 6px -1px rgba(124, 93, 250, 0.2), 0 2px 4px -1px rgba(124, 93, 250, 0.1)'
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.backgroundColor = '#6d4df0';
                            e.currentTarget.style.transform = 'translateY(-1px)';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.backgroundColor = '#7c5dfa';
                            e.currentTarget.style.transform = 'translateY(0)';
                        }}
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} style={{ margin: '0 auto' }} /> : 'Sign Up'}
                    </button>

                    <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.9rem', color: '#64748b' }}>
                        Already have an account? <Link href="/login" style={{ color: '#7c5dfa', fontWeight: '500', textDecoration: 'none' }}>Log in</Link>
                    </div>

                </form>

                <style jsx global>{`
                    input::placeholder { color: #cbd5e1; }
                `}</style>
            </div>
        </div>
    );
}

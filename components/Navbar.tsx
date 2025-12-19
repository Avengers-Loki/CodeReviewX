
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { Code, LogOut, User } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Navbar() {
    const router = useRouter();
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        // Check for token on mount
        const token = Cookies.get('token');
        setIsLoggedIn(!!token);
    }, []);

    function handleLogout() {
        Cookies.remove('token');
        setIsLoggedIn(false);
        router.push('/login');
        router.refresh();
    }

    return (
        <nav className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--surface)]/80 backdrop-blur-md h-40 flex items-center shrink-0 transition-all">
            <div className="w-full max-w-[1920px] mx-auto px-12 flex items-center justify-between">

                <Link href="/" className="flex items-center gap-5 text-4xl font-bold text-[var(--foreground)] hover:opacity-80 transition-opacity">
                    <div className="bg-[var(--primary)]/10 p-3 rounded-2xl">
                        <Code className="text-[var(--primary)]" size={48} />
                    </div>
                    <span className="tracking-tight">Code<span className="text-[var(--primary)]">Wiki</span></span>
                </Link>
                <div className="flex items-center gap-12">
                    <Link href="/" className="text-[var(--secondary)] hover:text-[var(--foreground)] text-xl font-medium transition-colors">
                        Documentation
                    </Link>

                    {isLoggedIn ? (
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--border)] px-8 py-4 rounded-full text-xl font-medium transition-all hover:shadow-sm active:scale-95"
                        >
                            <LogOut size={24} className="text-[var(--secondary)]" />
                            Sign Out
                        </button>
                    ) : (
                        <div className="flex gap-8">
                            <Link href="/login" className="text-[var(--secondary)] hover:text-[var(--primary)] px-6 py-4 text-xl font-medium transition-colors">
                                Sign In
                            </Link>
                            <Link href="/signup" className="flex items-center gap-3 bg-[var(--primary)] text-white px-10 py-5 rounded-full text-xl font-medium hover:brightness-110 hover:shadow-md transition-all active:scale-95">
                                <User size={24} />
                                Get Started
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}


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
        <nav className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--surface)]/80 backdrop-blur-md h-20 flex items-center shrink-0 transition-all">
            <div className="w-full max-w-[1920px] mx-auto px-6 flex items-center justify-between">

                <Link href="/" className="flex items-center gap-2.5 text-xl font-bold text-[var(--foreground)] hover:opacity-80 transition-opacity">
                    <div className="bg-[var(--primary)]/10 p-1.5 rounded-md">
                        <Code className="text-[var(--primary)]" size={24} />
                    </div>
                    <span className="tracking-tight">Code<span className="text-[var(--primary)]">Wiki</span></span>
                </Link>
                <div className="flex items-center gap-6">
                    <Link href="/" className="text-[var(--secondary)] hover:text-[var(--foreground)] text-sm font-medium transition-colors">
                        Documentation
                    </Link>

                    {isLoggedIn ? (
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--border)] px-4 py-2 rounded-full text-sm font-medium transition-all hover:shadow-sm active:scale-95"
                        >
                            <LogOut size={16} className="text-[var(--secondary)]" />
                            Sign Out
                        </button>
                    ) : (
                        <div className="flex gap-4">
                            <Link href="/login" className="text-[var(--secondary)] hover:text-[var(--primary)] px-3 py-2 text-sm font-medium transition-colors">
                                Sign In
                            </Link>
                            <Link href="/signup" className="flex items-center gap-2 bg-[var(--primary)] text-white px-5 py-2 rounded-full text-sm font-medium hover:brightness-110 hover:shadow-md transition-all active:scale-95">
                                <User size={16} />
                                Get Started
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}


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
        <nav className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--surface)]/80 backdrop-blur-md h-24 flex items-center shrink-0 transition-all">
            <div className="w-full max-w-[1920px] mx-auto px-10 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-3 text-2xl font-bold text-[var(--foreground)] hover:opacity-80 transition-opacity">
                    <div className="bg-[var(--primary)]/10 p-2 rounded-lg">
                        <Code className="text-[var(--primary)]" size={32} />
                    </div>
                    <span className="tracking-tight">Code<span className="text-[var(--primary)]">Wiki</span></span>
                </Link>
                <div className="flex items-center gap-10">
                    {isLoggedIn ? (
                        <div className="flex items-center gap-8">
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-3 text-xl font-bold text-[var(--primary)] hover:text-purple-600 transition-colors bg-transparent border-none p-0"
                            >
                                <LogOut size={24} />
                                Sign Out
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-8">
                            <Link
                                href="/signup"
                                className="flex items-center gap-3 text-xl font-bold text-[var(--primary)] hover:text-purple-600 transition-colors bg-transparent border-none p-0"
                            >
                                <User size={24} />
                                Sign Up
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}

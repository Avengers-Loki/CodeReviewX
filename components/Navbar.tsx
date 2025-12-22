
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
        <nav className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--surface)]/80 backdrop-blur-md h-14 h-nav flex items-center shrink-0 transition-all">
            <div className="w-full max-w-[1920px] mx-auto px-6 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 text-lg font-bold text-[var(--foreground)] hover:opacity-80 transition-opacity">
                    <div className="bg-[var(--primary)]/10 p-1.5 rounded-lg">
                        <Code className="text-[var(--primary)]" size={18} />
                    </div>
                    <span className="tracking-tight">Code<span className="text-[var(--primary)]">Wiki</span></span>
                </Link>
                <div className="flex items-center gap-6">
                    {isLoggedIn ? (
                        <div className="flex items-center gap-6">
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 text-sm font-bold text-[var(--primary)] hover:text-purple-600 transition-colors bg-transparent border-none p-0"
                            >
                                <LogOut size={16} />
                                Sign Out
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-6">
                            <Link
                                href="/signup"
                                className="flex items-center gap-2 text-sm font-bold text-[var(--primary)] hover:text-purple-600 transition-colors bg-transparent border-none p-0"
                            >
                                <User size={16} />
                                Sign Up
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}

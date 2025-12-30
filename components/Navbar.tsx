
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import Image from 'next/image';
import { LogOut, User } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Navbar() {
    const router = useRouter();
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        // Check for non-sensitive flag on mount
        const loggedIn = Cookies.get('is_logged_in');
        setIsLoggedIn(!!loggedIn);
    }, []);

    async function handleLogout() {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            Cookies.remove('is_logged_in');
            setIsLoggedIn(false);
            router.push('/login');
            router.refresh();
        } catch (error) {
            console.error('Logout failed:', error);
            // Fallback: clear local state anyway
            Cookies.remove('is_logged_in');
            setIsLoggedIn(false);
            router.push('/login');
        }
    }

    return (
        <nav className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--surface)]/80 backdrop-blur-md h-14 h-nav flex items-center shrink-0 transition-all">
            <div className="w-full max-w-[1920px] mx-auto px-6 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 text-lg font-bold text-[var(--foreground)] hover:opacity-80 transition-opacity">
                    <div className="relative w-8 h-8 rounded-full overflow-hidden">
                        <Image
                            src="/logo.png"
                            alt="CodeReviewX Logo"
                            fill
                            className="object-cover"
                            priority
                        />
                    </div>
                    <span className="tracking-tight">Code<span className="text-[var(--primary)]">ReviewX</span></span>
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
                                href="/login"
                                className="flex items-center gap-2 text-sm font-bold text-[var(--primary)] hover:text-purple-600 transition-colors bg-transparent border-none p-0"
                            >
                                <User size={16} />
                                Login
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}

"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Home, TreeDeciduous, Users, BookOpen, HelpCircle, Settings,
    Menu, X
} from 'lucide-react';

const navLinks = [
    { href: '/', label: 'Trang Chủ', icon: Home },
    { href: '/tree', label: 'Cây Gia Phả', icon: TreeDeciduous },
    { href: '/directory', label: 'Danh Bạ', icon: Users },
    { href: '/book', label: 'Sách Gia Phả', icon: BookOpen },
    { href: '/guide', label: 'Hướng Dẫn', icon: HelpCircle },
    { href: '/admin', label: 'Quản Trị', icon: Settings },
];

export default function Navbar() {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setMobileOpen(false);
    }, [pathname]);

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        if (mobileOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [mobileOpen]);

    const isActive = (href: string) => {
        if (href === '/') return pathname === '/';
        return pathname.startsWith(href);
    };

    return (
        <>
            {/* Desktop + Mobile top bar */}
            <nav
                className={`fixed top-0 left-0 right-0 z-9998 transition-all duration-300 ${scrolled
                    ? 'bg-[#0a0a0f]/95 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.4)] border-b border-amber-500/10'
                    : 'bg-[#0a0a0f]/70 backdrop-blur-md'
                    }`}
                data-print-hide
            >
                <div className="max-w-7xl mx-auto px-4 md:px-6">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-3 group shrink-0">
                            <div className="hidden sm:block">
                                <span className="text-base font-serif font-bold text-amber-200 group-hover:text-amber-100 transition-colors">
                                    Họ Nguyễn
                                </span>
                                <span className="text-[10px] block text-amber-500/60 tracking-[0.15em] uppercase -mt-0.5">
                                    Cẩm Giang · 1469
                                </span>
                            </div>
                        </Link>

                        {/* Desktop links */}
                        <div className="hidden lg:flex items-center gap-1">
                            {navLinks.map((link) => {
                                const Icon = link.icon;
                                const active = isActive(link.href);
                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${active
                                            ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm shadow-amber-500/10'
                                            : 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent'
                                            }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        {link.label}
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Mobile hamburger */}
                        <button
                            onClick={() => setMobileOpen(!mobileOpen)}
                            className="lg:hidden flex items-center justify-center w-11 h-11 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all active:scale-95"
                            aria-label="Menu"
                        >
                            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile menu overlay */}
            {mobileOpen && (
                <div className="fixed inset-0 z-9997 lg:hidden" data-print-hide>
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                        onClick={() => setMobileOpen(false)}
                        style={{ animation: 'fadeIn 200ms ease-out' }}
                    />

                    {/* Slide-in panel */}
                    <div
                        className="absolute top-16 left-0 right-0 bottom-0 bg-[#0d0d14]/98 overflow-y-auto"
                        style={{ animation: 'slideDown 250ms ease-out' }}
                    >
                        <div className="p-6 space-y-2">
                            {navLinks.map((link) => {
                                const Icon = link.icon;
                                const active = isActive(link.href);
                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        onClick={() => setMobileOpen(false)}
                                        className={`flex items-center gap-4 px-5 py-4 rounded-2xl text-lg font-medium transition-all ${active
                                            ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                                            : 'text-white/70 hover:text-white hover:bg-white/5 border border-transparent'
                                            }`}
                                    >
                                        <Icon className={`w-6 h-6 ${active ? 'text-amber-400' : 'text-white/40'}`} />
                                        {link.label}
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Mobile menu footer */}
                        <div className="p-6 pt-4 border-t border-white/5 mt-4">
                            <p className="text-sm text-white/30 text-center">
                                Phả Đồ Họ Nguyễn Cẩm Giang · Từ Năm 1469
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Spacer so content doesn't hide behind fixed navbar */}
            <div className="h-16 print:hidden" data-print-hide />

            {/* Inline keyframe styles for mobile menu animations */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-12px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}} />
        </>
    );
}

"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { HelpCircle, X, ChevronRight } from 'lucide-react';

interface HelpTip {
    emoji: string;
    text: string;
}

interface FloatingHelpProps {
    pageName: string;
    tips: HelpTip[];
}

/**
 * Floating help button + contextual tips panel for every page.
 * Shows a "?" button at bottom-right. On click, opens a mini panel with tips for the current page.
 * Also tracks first-time visits and shows an onboarding overlay.
 */
export default function FloatingHelp({ pageName, tips }: FloatingHelpProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isPermanentlyHidden, setIsPermanentlyHidden] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('phado_hide_all_help') === 'true';
        }
        return false;
    });
    const [showOnboarding, setShowOnboarding] = useState(() => {
        if (typeof window !== 'undefined') {
            if (localStorage.getItem('phado_hide_all_help') === 'true') return false;
            const key = `phado_visited_${pageName}`;
            return !localStorage.getItem(key);
        }
        return false;
    });

    useEffect(() => {
        if (showOnboarding && typeof window !== 'undefined') {
            const key = `phado_visited_${pageName}`;
            localStorage.setItem(key, 'true');
        }
    }, [showOnboarding, pageName]);

    const handleHidePermanently = () => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('phado_hide_all_help', 'true');
        }
        setIsPermanentlyHidden(true);
        setIsOpen(false);
        setShowOnboarding(false);
    };

    if (isPermanentlyHidden) return null;

    return (
        <>
            {/* First-time onboarding overlay */}
            {showOnboarding && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-300 p-4">
                    <div className="bg-[#1a1510] border border-amber-500/30 rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl shadow-amber-500/10 relative max-h-[90vh] overflow-y-auto">
                        <button onClick={() => setShowOnboarding(false)} className="absolute top-4 right-4 text-white/40 hover:text-white/80 transition-colors">
                            <X className="w-6 h-6" />
                        </button>
                        <div className="text-5xl mb-4 text-center">👋</div>
                        <h2 className="text-2xl font-serif font-bold text-amber-200 mb-3 text-center">
                            Chào mừng đến {pageName}!
                        </h2>
                        <div className="space-y-3 mb-6">
                            {tips.slice(0, 3).map((tip, i) => (
                                <div key={i} className="flex items-start gap-3 bg-white/5 rounded-xl px-4 py-3">
                                    <span className="text-xl flex-shrink-0">{tip.emoji}</span>
                                    <p className="text-base text-amber-100/80">{tip.text}</p>
                                </div>
                            ))}
                            <div className="flex flex-col gap-3 bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3">
                                <div className="flex items-start gap-3 border-b border-amber-500/20 pb-3">
                                    <span className="text-xl shrink-0">👨‍💻</span>
                                    <p className="text-sm text-amber-100/90 leading-relaxed">
                                        Kỹ thuật Website: <span className="text-amber-300 font-bold">Nguyễn Trung Kiên</span> (đời thứ 21, con bố Nguyễn Văn Hải). SĐT: <a href="tel:0983545091" className="text-amber-300 font-bold hover:text-amber-200 underline underline-offset-2">0983545091</a>
                                    </p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <span className="text-xl shrink-0">📝</span>
                                    <p className="text-sm text-amber-100/90 leading-relaxed">
                                        Nội dung Gia Phả: <span className="text-amber-300 font-bold">Nguyễn Đức Doanh</span> (đời thứ 19). SĐT: <a href="tel:0913568292" className="text-amber-300 font-bold hover:text-amber-200 underline underline-offset-2">0913568292</a>
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowOnboarding(false)}
                                className="flex-1 bg-amber-500 hover:bg-amber-400 text-black font-bold py-3 rounded-xl transition-colors text-lg"
                            >
                                Đã hiểu! 👍
                            </button>
                            <Link
                                href="/guide"
                                className="flex items-center justify-center gap-1 bg-white/10 hover:bg-white/20 text-amber-200 font-medium py-3 px-4 rounded-xl transition-colors text-sm"
                            >
                                Xem chi tiết
                                <ChevronRight className="w-4 h-4" />
                            </Link>
                        </div>
                        <button
                            onClick={handleHidePermanently}
                            className="mt-4 w-full text-center text-sm text-white/40 hover:text-white/80 transition-colors underline decoration-white/20 underline-offset-4"
                        >
                            Đừng hiện lại hướng dẫn ở tất cả các trang
                        </button>
                    </div>
                </div>
            )}

            {/* Floating help button */}
            <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-[999] flex flex-col items-end gap-3">
                {/* Tips panel */}
                {isOpen && (
                    <div className="bg-[#1a1510]/95 backdrop-blur-xl border border-amber-500/30 rounded-2xl w-80 max-h-[70vh] overflow-y-auto shadow-2xl shadow-black/50 animate-in slide-in-from-bottom-4 duration-200">
                        <div className="sticky top-0 bg-[#1a1510] border-b border-amber-500/20 px-5 py-4 flex items-center justify-between rounded-t-2xl">
                            <h3 className="text-lg font-serif font-bold text-amber-200">💡 Mẹo sử dụng</h3>
                            <button onClick={() => setIsOpen(false)} className="text-white/40 hover:text-white/80">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-4 space-y-3">
                            {tips.map((tip, i) => (
                                <div key={i} className="flex items-start gap-3 bg-white/5 rounded-xl px-4 py-3 hover:bg-white/10 transition-colors">
                                    <span className="text-lg shrink-0">{tip.emoji}</span>
                                    <p className="text-sm text-amber-100/80 leading-relaxed">{tip.text}</p>
                                </div>
                            ))}
                            <div className="flex flex-col gap-3 bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3">
                                <div className="flex items-start gap-3 border-b border-amber-500/20 pb-3">
                                    <span className="text-xl shrink-0">👨‍💻</span>
                                    <p className="text-xs text-amber-100/90 leading-relaxed">
                                        Kỹ thuật: <span className="text-amber-300 font-bold">Nguyễn Trung Kiên</span> (đời 21, con bố Nguyễn Văn Hải). SĐT: <a href="tel:0983545091" className="text-amber-300 font-bold hover:text-amber-200 underline underline-offset-2">0983545091</a>
                                    </p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <span className="text-xl shrink-0">📝</span>
                                    <p className="text-xs text-amber-100/90 leading-relaxed">
                                        Nội dung: <span className="text-amber-300 font-bold">Nguyễn Đức Doanh</span> (đời 19). SĐT: <a href="tel:0913568292" className="text-amber-300 font-bold hover:text-amber-200 underline underline-offset-2">0913568292</a>
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 border-t border-amber-500/10 flex flex-col gap-2">
                            <Link href="/guide" className="flex items-center justify-center gap-2 w-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 py-3 rounded-xl transition-colors text-sm font-medium">
                                📖 Xem hướng dẫn chi tiết
                                <ChevronRight className="w-4 h-4" />
                            </Link>
                            <button
                                onClick={handleHidePermanently}
                                className="w-full text-center text-xs text-white/40 hover:text-white/80 py-2 transition-colors"
                            >
                                Đừng hiện nút trợ giúp này nữa
                            </button>
                        </div>
                    </div>
                )}

                {/* Button */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${isOpen
                        ? 'bg-amber-500 text-black rotate-90 shadow-amber-500/30'
                        : 'bg-[#1a1510] border border-amber-500/40 text-amber-400 hover:bg-amber-500 hover:text-black hover:shadow-amber-500/30 animate-pulse'
                        }`}
                    style={{ animationDuration: isOpen ? '0s' : '3s' }}
                    title="Trợ giúp"
                >
                    {isOpen ? <X className="w-6 h-6" /> : <HelpCircle className="w-7 h-7" />}
                </button>
            </div>
        </>
    );
}

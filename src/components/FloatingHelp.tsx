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
    const [showOnboarding, setShowOnboarding] = useState(false);

    useEffect(() => {
        const key = `phado_visited_${pageName}`;
        if (!localStorage.getItem(key)) {
            setShowOnboarding(true);
            localStorage.setItem(key, 'true');
        }
    }, [pageName]);

    return (
        <>
            {/* First-time onboarding overlay */}
            {showOnboarding && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-[#1a1510] border border-amber-500/30 rounded-3xl max-w-md mx-4 p-8 shadow-2xl shadow-amber-500/10 relative">
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
                                Xem đầy đủ
                                <ChevronRight className="w-4 h-4" />
                            </Link>
                        </div>
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
                                    <span className="text-lg flex-shrink-0">{tip.emoji}</span>
                                    <p className="text-sm text-amber-100/80 leading-relaxed">{tip.text}</p>
                                </div>
                            ))}
                        </div>
                        <div className="p-4 border-t border-amber-500/10">
                            <Link href="/guide" className="flex items-center justify-center gap-2 w-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 py-3 rounded-xl transition-colors text-sm font-medium">
                                📖 Xem hướng dẫn đầy đủ
                                <ChevronRight className="w-4 h-4" />
                            </Link>
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

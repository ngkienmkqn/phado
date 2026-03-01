"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, TreeDeciduous, Users, BookOpen, HelpCircle, Phone, User, Heart } from 'lucide-react';

const quickLinks = [
    { href: '/', label: 'Trang Chủ', icon: Home },
    { href: '/tree', label: 'Cây Gia Phả', icon: TreeDeciduous },
    { href: '/directory', label: 'Danh Bạ Dòng Họ', icon: Users },
    { href: '/book', label: 'Sách Gia Phả', icon: BookOpen },
    { href: '/guide', label: 'Hướng Dẫn Sử Dụng', icon: HelpCircle },
];

export default function Footer() {
    const pathname = usePathname();

    // Don't show footer on tree page (fullscreen canvas)
    if (pathname === '/tree' || pathname === '/tree-organic') return null;

    return (
        <footer className="relative bg-[#070710] text-white/70 border-t border-amber-500/10 overflow-hidden print:hidden" data-print-hide>
            {/* Ambient glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[2px] bg-linear-to-r from-transparent via-amber-500/40 to-transparent" />
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[400px] h-[80px] bg-amber-500/5 rounded-full blur-[60px]" />

            <div className="relative max-w-7xl mx-auto px-6 pt-12 pb-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8 mb-10">
                    {/* Column 1: About */}
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div>
                                <h3 className="text-lg font-serif font-bold text-amber-200">Họ Nguyễn Cẩm Giang</h3>
                                <p className="text-[11px] text-amber-500/60 tracking-[0.12em] uppercase">Từ năm 1469 · 22 đời</p>
                            </div>
                        </div>
                        <p className="text-sm text-white/40 leading-relaxed">
                            Gia phả điện tử dòng họ Nguyễn Cẩm Giang — lưu giữ và kế thừa giá trị lịch sử của tổ tiên qua nhiều thế hệ.
                        </p>
                    </div>

                    {/* Column 2: Quick Links */}
                    <div>
                        <h4 className="text-sm font-bold text-amber-300/80 uppercase tracking-[0.15em] mb-4">Liên Kết</h4>
                        <div className="space-y-2">
                            {quickLinks.map((link) => {
                                const Icon = link.icon;
                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className="flex items-center gap-3 text-sm text-white/50 hover:text-amber-300 transition-colors py-1 group"
                                    >
                                        <Icon className="w-4 h-4 text-white/20 group-hover:text-amber-400 transition-colors" />
                                        {link.label}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    {/* Column 3: Credit / Contact */}
                    <div>
                        <h4 className="text-sm font-bold text-amber-300/80 uppercase tracking-[0.15em] mb-4">Ban Quản Trị & Phát Triển</h4>
                        <div className="bg-white/3 border border-white/6 rounded-2xl p-5 flex flex-col gap-4">

                            {/* Kien */}
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-linear-to-br from-amber-400/20 to-amber-600/20 border border-amber-500/20 flex items-center justify-center shrink-0 mt-1">
                                    <User className="w-5 h-5 text-amber-400" />
                                </div>
                                <div>
                                    <p className="text-[11px] text-white/50 uppercase tracking-widest mb-1">Xây dựng kỹ thuật Website</p>
                                    <p className="text-base font-bold text-amber-200">Nguyễn Trung Kiên</p>
                                    <p className="text-xs text-amber-500/60 mt-0.5 mb-2">Đời thứ 21 · Con của Nguyễn Văn Hải</p>
                                    <a href="tel:0983545091" className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-300 hover:text-amber-200 bg-amber-500/10 px-3 py-1.5 rounded-lg transition-colors border border-amber-500/20 hover:bg-amber-500/20">
                                        <Phone className="w-3.5 h-3.5" /> 0983 545 091
                                    </a>
                                </div>
                            </div>

                            <div className="h-px bg-white/5 w-full my-2"></div>

                            {/* Doanh */}
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-linear-to-br from-amber-400/20 to-amber-600/20 border border-amber-500/20 flex items-center justify-center shrink-0 mt-1">
                                    <User className="w-5 h-5 text-amber-400" />
                                </div>
                                <div>
                                    <p className="text-[11px] text-white/50 uppercase tracking-widest mb-1">Cập nhật nội dung gia phả</p>
                                    <p className="text-base font-bold text-amber-200">Nguyễn Đức Doanh</p>
                                    <p className="text-xs text-amber-500/60 mt-0.5 mb-2">Đời thứ 19</p>
                                    <a href="tel:0913568292" className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-300 hover:text-amber-200 bg-amber-500/10 px-3 py-1.5 rounded-lg transition-colors border border-amber-500/20 hover:bg-amber-500/20">
                                        <Phone className="w-3.5 h-3.5" /> 0913 568 292
                                    </a>
                                </div>
                            </div>

                            <p className="text-[11px] text-white/30 leading-relaxed mt-2 border-t border-white/5 pt-4">
                                Nếu có thắc mắc hoặc muốn đóng góp, vui lòng gọi các số trên để được hỗ trợ.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p className="text-xs text-white/25 text-center sm:text-left">
                        © {new Date().getFullYear()} Phả Đồ Họ Nguyễn Cẩm Giang · Dữ liệu trích xuất từ phả đồ gốc
                    </p>
                    <p className="flex items-center gap-1.5 text-xs text-white/25">
                        Được xây dựng với <Heart className="w-3 h-3 text-red-400/60 fill-red-400/60" /> bởi Nguyễn Trung Kiên
                    </p>
                </div>
            </div>
        </footer>
    );
}

"use client";

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Search, Phone, User, Calendar, MapPin } from 'lucide-react';

export default function DirectoryPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [generationFilter, setGenerationFilter] = useState<string>('all');
    const [familyDataRaw, setFamilyDataRaw] = useState<any>({ members: [], totalMembers: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/family-data', { cache: 'no-store' })
            .then(r => r.json())
            .then(data => { setFamilyDataRaw(data); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    // Generate unique generations for filter dropdown
    const generations = useMemo(() => {
        const gens = new Set(familyDataRaw.members.map((m: any) => m.generation));
        return Array.from(gens).sort((a: any, b: any) => a - b);
    }, [familyDataRaw]);

    const filteredMembers = useMemo(() => {
        return familyDataRaw.members.filter((m: any) => {
            const matchSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (m.spouse && m.spouse.toLowerCase().includes(searchTerm.toLowerCase()));
            const matchGen = generationFilter === 'all' || m.generation?.toString() === generationFilter;
            return matchSearch && matchGen;
        });
    }, [searchTerm, generationFilter, familyDataRaw]);

    if (loading) return <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center text-gold-400 text-xl">Đang tải...</div>;

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-[#f0ebe0] font-sans">
            <header className="sticky top-0 z-20 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/10 p-4">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <Link href="/" className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl hover:bg-white/10 transition-colors text-sm shrink-0">
                            Quay lại
                        </Link>
                        <h1 className="font-serif font-bold text-xl text-gold-400">Danh Bạ Dòng Họ</h1>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-1/2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Tìm tên thành viên hoặc vợ/chồng..."
                                className="w-full bg-[#1a1a24] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-all text-lg placeholder:text-gray-600"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <select
                            className="bg-[#1a1a24] border border-white/10 rounded-xl px-4 py-3 outline-none text-white appearance-none cursor-pointer focus:border-gold-500 min-w-[120px]"
                            value={generationFilter}
                            onChange={e => setGenerationFilter(e.target.value)}
                        >
                            <option value="all">Tất cả đời</option>
                            {generations.map((g: any) => (
                                <option key={String(g)} value={String(g)}>Đời {g}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto p-4 py-8">
                <div className="mb-6 flex justify-between items-end">
                    <h2 className="text-2xl font-serif text-white/90">
                        Tìm thấy <span className="text-gold-400 font-bold">{filteredMembers.length}</span> người
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredMembers.map(member => (
                        <div key={member.id} className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-colors flex flex-col">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <div className="text-xs text-gold-400 font-bold tracking-wider uppercase mb-1">Đời {member.generation}</div>
                                    <h3 className={`text-xl font-serif font-bold ${member.gender === 'female' ? 'text-pink-300' : 'text-blue-300'}`}>
                                        {member.name}
                                    </h3>
                                    {member.spouse && (
                                        <div className="text-sm text-gray-400 mt-1 flex items-center gap-1">
                                            <span className="opacity-60">&</span> {member.spouse}
                                        </div>
                                    )}
                                </div>
                                {member.status === 'Đã mất' && (
                                    <span className="bg-white/10 text-gray-300 text-[10px] px-2 py-1 rounded-md shrink-0">Đã mất</span>
                                )}
                            </div>

                            <div className="mt-auto pt-4 flex flex-col gap-2">
                                {/* Mock Data for Display Purposes */}
                                <div className="flex items-center gap-2 text-sm text-gray-300 bg-black/20 p-2 rounded-lg">
                                    <Calendar className="w-4 h-4 text-gray-500" />
                                    <span>{member.birthSolar || 'Chưa cập nhật ngày sinh'}</span>
                                </div>

                                {(member as any).phone && (
                                    <a
                                        href={`tel:${(member as any).phone}`}
                                        className="mt-2 w-full flex items-center justify-center gap-2 bg-green-600/20 hover:bg-green-600/30 text-green-400 border border-green-500/30 py-3 rounded-xl transition-colors font-medium text-lg"
                                    >
                                        <Phone className="w-5 h-5" />
                                        Gọi Điện
                                    </a>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {filteredMembers.length === 0 && (
                    <div className="text-center py-20 text-gray-500">
                        <User className="w-16 h-16 mx-auto mb-4 opacity-20" />
                        <p className="text-xl">Không tìm thấy thành viên nào phù hợp.</p>
                    </div>
                )}
            </main>
        </div>
    );
}

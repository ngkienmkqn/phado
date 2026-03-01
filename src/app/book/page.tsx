"use client";

import React, { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { Printer } from 'lucide-react';

// Utility to group members by generation
const groupMembersByGen = (members: any[]) => {
    const grouped = members.reduce((acc, member) => {
        const gen = member.generation;
        if (!acc[gen]) acc[gen] = [];
        acc[gen].push(member);
        return acc;
    }, {} as Record<number, any[]>);

    return grouped;
};

export default function BookPage() {
    const [familyDataRaw, setFamilyDataRaw] = useState<any>({ members: [], since: 1469, totalMembers: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/family-data', { cache: 'no-store' })
            .then(r => r.json())
            .then(data => { setFamilyDataRaw(data); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    const groupedMembers = useMemo(() => groupMembersByGen(familyDataRaw.members), [familyDataRaw]);
    const generations = Object.keys(groupedMembers).sort((a, b) => Number(a) - Number(b));

    if (loading) return <div className="min-h-screen bg-gold-50 flex items-center justify-center text-gold-600 text-xl font-serif">Đang tải...</div>;

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="min-h-screen bg-gold-50 text-gold-950 font-serif">
            {/* Non-printable controls */}
            <div className="print:hidden sticky top-0 bg-white/80 backdrop-blur-md shadow-sm z-50 p-4 border-b border-gray-200">
                <div className="max-w-4xl mx-auto flex justify-between items-center">
                    <Link href="/" className="text-gray-600 hover:text-gray-900 font-sans text-sm font-semibold transition-colors">
                        ← Quay lại trang chủ
                    </Link>
                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 bg-gold-600 hover:bg-gold-700 text-white px-6 py-2 rounded-lg font-sans font-medium transition-colors shadow-lg"
                    >
                        <Printer size={18} />
                        Xuất file PDF / In Sách
                    </button>
                </div>
            </div>

            {/* Book Content - styled for A4 print */}
            <main className="max-w-4xl mx-auto p-10 print:p-0">
                {/* Cover Page */}
                <div className="min-h-[297mm] flex flex-col items-center justify-center text-center border-8 border-double border-gold-600 p-12 bg-white shadow-2xl print:shadow-none print:border-4 print:mb-0 mb-12">
                    <div className="flex-1 flex flex-col items-center justify-center w-full">
                        <h2 className="text-3xl text-gray-500 uppercase tracking-[0.5em] mb-8 font-light">Gia Phả</h2>
                        <h1 className="text-7xl font-bold text-gold-600 mb-12 leading-tight">
                            Họ Nguyễn <br /> Cẩm Giang
                        </h1>
                        <div className="w-32 h-1 bg-gold-600 mb-12"></div>
                        <p className="text-xl text-gray-600 italic">Lập từ năm {familyDataRaw.since}</p>
                        <p className="text-xl text-gray-600 mt-4">Gia phả lưu truyền muôn đời</p>
                    </div>
                    <div className="mt-auto pt-10 text-gray-400 font-sans text-sm">
                        Xuất bản năm {new Date().getFullYear()} · Tổng số {familyDataRaw.totalMembers} thành viên
                    </div>
                </div>

                {/* Content Pages */}
                <div className="bg-white shadow-xl print:shadow-none p-12 print:p-0">
                    <h2 className="text-4xl font-bold text-center mb-16 text-gold-600 border-b border-gray-200 pb-8">
                        Danh Sách Các Đời
                    </h2>

                    {generations.map(gen => (
                        <div key={gen} className="mb-16 print:break-inside-avoid">
                            <div className="flex items-center gap-4 mb-8">
                                <h3 className="text-2xl font-bold text-gray-800 uppercase tracking-widest whitespace-nowrap">
                                    Đời Thứ {gen}
                                </h3>
                                <div className="h-px bg-gray-300 w-full" />
                            </div>

                            <div className="grid grid-cols-1 gap-y-8 gap-x-12">
                                {groupedMembers[Number(gen)].map((member: any) => (
                                    <div key={member.id} className="flex flex-col border-b border-gray-200 pb-6 print:break-inside-avoid shadow-sm hover:shadow-md transition-shadow p-6 rounded-xl bg-white/50 print:bg-transparent print:shadow-none print:p-0 print:border-b-2">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex flex-col">
                                                <h4 className={`font-bold text-2xl ${member.gender === 'female' ? 'text-gray-700' : 'text-black'}`}>
                                                    {member.name}
                                                </h4>
                                                {member.spouse && (
                                                    <span className="text-gray-600 font-medium mt-1">
                                                        Phối ngẫu: {member.spouse}
                                                    </span>
                                                )}
                                            </div>
                                            {member.status === 'Đã mất' && (
                                                <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold uppercase tracking-widest rounded-full border border-gray-200">Đã mất</span>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 text-sm text-gray-700">
                                            {member.birthSolar && (
                                                <div className="flex gap-2">
                                                    <span className="text-gray-400 w-20">Ngày sinh:</span>
                                                    <span className="font-medium">{member.birthSolar}</span>
                                                </div>
                                            )}
                                            {member.deathDate && (
                                                <div className="flex gap-2">
                                                    <span className="text-gray-400 w-20">Ngày mất:</span>
                                                    <span className="font-medium">{member.deathDate}</span>
                                                </div>
                                            )}
                                            {member.hometown && (
                                                <div className="flex gap-2 sm:col-span-2">
                                                    <span className="text-gray-400 w-20 shrink-0">Quê quán:</span>
                                                    <span className="font-medium">{member.hometown}</span>
                                                </div>
                                            )}
                                            {member.address && (
                                                <div className="flex gap-2 sm:col-span-2">
                                                    <span className="text-gray-400 w-20 shrink-0">Địa chỉ:</span>
                                                    <span className="font-medium">{member.address}</span>
                                                </div>
                                            )}
                                            {member.burialPlace && (
                                                <div className="flex gap-2 sm:col-span-2">
                                                    <span className="text-gray-400 w-20 shrink-0">Nơi an nghỉ:</span>
                                                    <span className="font-medium">{member.burialPlace}</span>
                                                </div>
                                            )}
                                            {member.phone && (
                                                <div className="flex gap-2">
                                                    <span className="text-gray-400 w-20 shrink-0">Điện thoại:</span>
                                                    <span className="font-medium whitespace-nowrap">{member.phone}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}

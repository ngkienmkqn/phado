"use client";

import React, { useMemo } from 'react';
import Link from 'next/link';
import { Printer } from 'lucide-react';
import familyDataRaw from '@/data/family_data.json';

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
    const groupedMembers = useMemo(() => groupMembersByGen(familyDataRaw.members), []);
    const generations = Object.keys(groupedMembers).sort((a, b) => Number(a) - Number(b));

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
                        <p className="text-xl text-gray-600 mt-4">Kỷ yếu lưu truyền muôn đời</p>
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

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6">
                                {groupedMembers[Number(gen)].map((member: any) => (
                                    <div key={member.id} className="flex flex-col border-b border-gray-100 pb-4">
                                        <div className="flex justify-between items-baseline mb-1">
                                            <span className={`font-bold text-lg ${member.gender === 'female' ? 'text-gray-600' : 'text-black'}`}>
                                                {member.name}
                                            </span>
                                            {member.status === 'Đã mất' && (
                                                <span className="text-[10px] uppercase tracking-wider text-gray-400 ml-2">Đã mất</span>
                                            )}
                                        </div>

                                        {member.spouse && (
                                            <div className="text-sm text-gray-600 italic">
                                                Phối ngẫu: {member.spouse}
                                            </div>
                                        )}

                                        {(member.birthSolar || member.birthLunar) && (
                                            <div className="text-sm text-gray-500 mt-1">
                                                Sinh: {member.birthSolar || member.birthLunar}
                                            </div>
                                        )}
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

"use client";

import TreeCanvas from "@/components/TreeCanvas";
import FloatingHelp from "@/components/FloatingHelp";
import { useState, useEffect } from 'react';

interface MemberData {
    id: string; name: string; generation: number; gender: string;
    spouse?: string | null; status?: string | null; parentId?: string | null;
    birthSolar?: string | null;[key: string]: unknown;
}
interface FamilyDataRaw {
    familyName: string;
    since: number;
    totalGenerations: number;
    totalMembers: number;
    members: MemberData[];
    [key: string]: unknown;
}

export default function TreePage() {
    const [data, setData] = useState<FamilyDataRaw | null>(null);

    useEffect(() => {
        fetch('/api/family-data', { cache: 'no-store' })
            .then(r => r.json())
            .then(setData);
    }, []);

    if (!data) return (
        <div className="w-full h-screen flex items-center justify-center bg-[#f4efe6]">
            <div className="text-center">
                <div className="animate-spin w-10 h-10 border-4 border-[#8b6914] border-t-transparent rounded-full mx-auto mb-3" />
                <p className="text-[#5c4033] font-serif">Đang tải phả đồ...</p>
            </div>
        </div>
    );

    return (
        <div className="w-full h-screen bg-[#f4efe6] text-[#3e2723] overflow-hidden flex flex-col">
            <header className="absolute top-0 left-0 right-0 z-10 p-4 pointer-events-none">
                <div className="max-w-7xl mx-auto flex justify-between items-center pointer-events-auto">
                    <div className="bg-[#fdfbf7]/90 backdrop-blur-md border border-[#d2b48c] shadow-md px-4 py-2 rounded-xl flex items-center gap-4">
                        <h1 className="font-serif font-bold text-lg text-[#5c4033]">
                            Phả Đồ Họ {data.familyName}
                        </h1>
                        <span className="text-xs text-[#8b5a2b] font-bold border-l border-[#d2b48c] pl-4 py-1">
                            Từ năm {data.since} · {data.totalGenerations} Đời
                        </span>
                    </div>
                    <div className="flex gap-2">
                        <a href="/" className="bg-[#8b5a2b] hover:bg-[#5c4033] shadow-md text-white px-4 py-2 rounded-xl transition-colors text-sm font-bold">
                            Quay lại
                        </a>
                    </div>
                </div>
            </header>

            <main className="flex-1 w-full h-full relative">
                <TreeCanvas data={data} />
            </main>

            <FloatingHelp pageName="Cây Gia Phả" tips={[
                { emoji: '🔍', text: 'Gõ tên vào ô "Tìm thành viên" góc trái để tìm nhanh bất kỳ ai' },
                { emoji: '🤝', text: 'Nhấn "Tìm xưng hô" để biết gọi nhau là gì' },
                { emoji: '✋', text: 'KÉO để di chuyển bản đồ, CHỤM 2 NGÓN để phóng to' },
                { emoji: '👆', text: 'NHẤN vào tên bất kỳ ai để xem thông tin chi tiết' },
                { emoji: '↩️', text: 'Nhấn "Quay lại" góc phải trên để về trang chủ' },
            ]} />
        </div>
    );
}

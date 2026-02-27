"use client";

import OrganicTreeCanvas from "@/components/OrganicTreeCanvas";
import FloatingHelp from "@/components/FloatingHelp";
import { useState, useEffect } from 'react';

interface MemberData {
    id: string; name: string; generation: number; gender: string;
    spouse?: string | null; status?: string | null; parentId?: string | null;
    birthSolar?: string | null;[key: string]: unknown;
}
interface FamilyData {
    familyName: string; since: number; totalGenerations: number;
    totalMembers: number; members: MemberData[];
}

export default function TreeOrganicPage() {
    const [data, setData] = useState<FamilyData | null>(null);

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
        <div className="w-full h-screen overflow-hidden">
            <OrganicTreeCanvas data={data} />
            <FloatingHelp pageName="Cây Phả Đồ Organic" tips={[
                { emoji: '🌳', text: 'Gốc cây ở dưới, tán lá ở trên — như cây thật!' },
                { emoji: '🔍', text: 'Gõ tên vào ô tìm kiếm góc trái để tìm người' },
                { emoji: '🤝', text: 'Nhấn "Tìm xưng hô" để biết gọi nhau là gì' },
                { emoji: '👆', text: 'NHẤN vào vòng tròn vàng bất kỳ để xem người đó' },
                { emoji: '📱', text: 'CHỤM 2 NGÓN để phóng to/thu nhỏ; KÉO để di chuyển' },
            ]} />
        </div>
    );
}

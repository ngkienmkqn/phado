import TreeCanvas from "@/components/TreeCanvas";
import { readFileSync } from 'fs';
import { join } from 'path';

// Force dynamic rendering - never cache, always read latest data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

function loadFamilyData() {
    const filePath = join(process.cwd(), 'src', 'data', 'family_data.json');
    return JSON.parse(readFileSync(filePath, 'utf8'));
}

export default function TreePage() {
    const familyDataRaw = loadFamilyData();

    return (
        <div className="w-full h-screen bg-[#f4efe6] text-[#3e2723] overflow-hidden flex flex-col">
            <header className="absolute top-0 left-0 right-0 z-10 p-4 pointer-events-none">
                <div className="max-w-7xl mx-auto flex justify-between items-center pointer-events-auto">
                    <div className="bg-[#fdfbf7]/90 backdrop-blur-md border border-[#d2b48c] shadow-md px-4 py-2 rounded-xl flex items-center gap-4">
                        <h1 className="font-serif font-bold text-lg text-[#5c4033]">
                            Phả Đồ Họ {familyDataRaw.familyName}
                        </h1>
                        <span className="text-xs text-[#8b5a2b] font-bold border-l border-[#d2b48c] pl-4 py-1">
                            Từ năm {familyDataRaw.since} · {familyDataRaw.totalGenerations} Đời
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
                <TreeCanvas data={familyDataRaw} />
            </main>
        </div>
    );
}

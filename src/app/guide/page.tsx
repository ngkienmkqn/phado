"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Home, ArrowLeft } from 'lucide-react';

const steps = [
    {
        icon: '🏠',
        title: 'Trang Chủ',
        subtitle: 'Nơi bắt đầu mọi thứ',
        color: 'from-amber-500 to-yellow-600',
        borderColor: 'border-amber-400/30',
        content: [
            { emoji: '1️⃣', text: 'Mở trình duyệt trên điện thoại hoặc máy tính (Chrome, Safari, Cốc Cốc đều được)' },
            { emoji: '2️⃣', text: 'Gõ địa chỉ trang web hoặc nhấn vào link được gửi trong nhóm Zalo dòng họ' },
            { emoji: '3️⃣', text: 'Trang chủ hiện ra — có 4 ô lớn để chọn chức năng' },
        ],
        tip: '💡 Nhờ con cháu lưu trang web ra màn hình chính điện thoại cho tiện!',
    },
    {
        icon: '🌳',
        title: 'Xem Cây Gia Phả',
        subtitle: 'Bản đồ gia phả tương tác',
        color: 'from-green-500 to-emerald-600',
        borderColor: 'border-green-400/30',
        content: [
            { emoji: '1️⃣', text: 'Ở trang chủ, nhấn vào ô "Cây Gia Phả" hoặc "Cây Phả Đồ Organic"' },
            { emoji: '2️⃣', text: 'Bản đồ gia phả hiện ra — mỗi ô hoặc vòng tròn là một người trong dòng họ' },
            { emoji: '3️⃣', text: 'Dùng ngón tay KÉO để di chuyển bản đồ' },
            { emoji: '4️⃣', text: 'NHẤN vào tên người bất kỳ → hiện thông tin chi tiết' },
        ],
        tip: '💡 "Cây Organic" có hình cây thật rất đẹp — gốc ở dưới, tán lá ở trên!',
    },
    {
        icon: '🔍',
        title: 'Tìm Người',
        subtitle: 'Tìm nhanh bất kỳ ai trong dòng họ',
        color: 'from-blue-500 to-indigo-600',
        borderColor: 'border-blue-400/30',
        content: [
            { emoji: '1️⃣', text: 'Ở trang Cây Gia Phả, nhìn góc trái phía trên — có ô "Tìm thành viên..."' },
            { emoji: '2️⃣', text: 'Nhấn vào ô đó rồi GÕ TÊN người cần tìm' },
            { emoji: '3️⃣', text: 'Danh sách gợi ý hiện ra → nhấn vào tên đúng' },
            { emoji: '4️⃣', text: 'Bản đồ sẽ TỰ ĐỘNG di chuyển đến người đó!' },
        ],
        tip: '💡 Gõ chậm, chờ gợi ý — không cần gõ hết cả tên dài!',
    },
    {
        icon: '🤝',
        title: 'Tìm Xưng Hô',
        subtitle: 'Biết gọi nhau là gì',
        color: 'from-purple-500 to-pink-600',
        borderColor: 'border-purple-400/30',
        content: [
            { emoji: '1️⃣', text: 'Ở trang Cây Gia Phả, nhấn nút "Tìm xưng hô" (góc trái, dưới ô tìm kiếm)' },
            { emoji: '2️⃣', text: 'Bảng tính xưng hô hiện ra với 2 ô chọn người' },
            { emoji: '3️⃣', text: 'Ô "Người A" — chọn BẠN (hoặc người muốn hỏi)' },
            { emoji: '4️⃣', text: 'Ô "Người B" — chọn NGƯỜI MUỐN BIẾT CÁCH GỌI' },
            { emoji: '✅', text: 'Kết quả hiện ngay: "A gọi B là BÁC/CHÚ/ANH/EM..."' },
        ],
        tip: '💡 Ví dụ: Chọn mình và một người lạ → biết ngay gọi nhau thế nào!',
    },
    {
        icon: '📒',
        title: 'Danh Bạ & Sách',
        subtitle: 'Tra cứu và in ấn',
        color: 'from-orange-500 to-red-600',
        borderColor: 'border-orange-400/30',
        content: [
            { emoji: '📒', text: '"Danh Bạ Dòng Họ" — xem danh sách tất cả thành viên, sắp xếp theo đời' },
            { emoji: '📕', text: '"Sách Gia Phả" — xem và IN ra giấy toàn bộ gia phả' },
            { emoji: '🖨️', text: 'Muốn in sách → vào "Sách Gia Phả" → nhấn nút "In Sách" góc phải trên' },
        ],
        tip: '💡 Có thể in sách gia phả ra giấy để đọc khi không có mạng!',
    },
    {
        icon: '📱',
        title: 'Mẹo Sử Dụng',
        subtitle: 'Phóng to chữ, xử lý lỗi',
        color: 'from-teal-500 to-cyan-600',
        borderColor: 'border-teal-400/30',
        content: [
            { emoji: '🔎', text: 'CHỮ NHỎ QUÁ? → Dùng 2 ngón tay mở ra để phóng to (điện thoại) hoặc Ctrl + phím "+" (máy tính)' },
            { emoji: '🔄', text: 'TRANG BỊ LỖI? → Kéo xuống rồi thả để tải lại (điện thoại) hoặc nhấn F5 (máy tính)' },
            { emoji: '❌', text: 'KHÔNG TÌM THẤY TÊN? → Thử gõ tên khác hoặc liên hệ ban quản lý dòng họ' },
            { emoji: '✏️', text: 'THÔNG TIN SAI? → Nhấn vào người đó → bấm "Đề xuất chỉnh sửa" → ban quản lý sẽ duyệt' },
        ],
        tip: '💡 Gặp khó khăn gì cứ nhờ con cháu hỗ trợ — đừng ngại hỏi!',
    },
];

export default function GuidePage() {
    const [currentStep, setCurrentStep] = useState(0);
    const step = steps[currentStep];

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-[#f0ebe0] relative overflow-hidden">
            {/* Ambient background */}
            <div className="absolute inset-0 pointer-events-none z-0">
                <div className="absolute top-[15%] left-[5%] w-[35vw] h-[35vw] min-w-[200px] min-h-[200px] bg-amber-500/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[10%] right-[5%] w-[30vw] h-[30vw] min-w-[200px] min-h-[200px] bg-purple-500/5 rounded-full blur-[100px]" />
            </div>

            {/* Top bar - sticky */}
            <header className="sticky top-0 z-20 flex items-center justify-between px-4 py-4 md:px-8 bg-[#0a0a0f]/90 backdrop-blur-xl">
                <Link href="/" className="flex items-center gap-2 text-amber-300/80 hover:text-amber-200 transition-colors bg-white/5 border border-white/10 px-4 py-2 rounded-xl backdrop-blur-md">
                    <ArrowLeft className="w-5 h-5" />
                    <span className="text-base font-medium">Về trang chủ</span>
                </Link>
                <h1 className="text-lg md:text-xl font-serif font-bold text-amber-200/90">
                    📖 Hướng Dẫn Sử Dụng
                </h1>
                <div className="text-amber-400/60 text-sm font-medium bg-white/5 border border-white/10 px-3 py-2 rounded-xl">
                    {currentStep + 1} / {steps.length}
                </div>
            </header>

            {/* Step indicator dots */}
            <div className="relative z-10 flex justify-center gap-2 mt-2 mb-6 px-4">
                {steps.map((s, i) => (
                    <button
                        key={i}
                        onClick={() => setCurrentStep(i)}
                        className={`transition-all duration-300 rounded-full ${i === currentStep
                            ? 'w-10 h-3 bg-amber-400'
                            : i < currentStep
                                ? 'w-3 h-3 bg-amber-600/60 hover:bg-amber-500/80'
                                : 'w-3 h-3 bg-white/15 hover:bg-white/30'
                            }`}
                        aria-label={`Bước ${i + 1}`}
                    />
                ))}
            </div>

            {/* Main content card */}
            <main className="relative z-10 max-w-2xl mx-auto px-4 pb-32">
                <div className={`bg-[#14110e]/80 border ${step.borderColor} rounded-3xl overflow-hidden shadow-2xl backdrop-blur-xl`}>
                    {/* Card header */}
                    <div className={`bg-gradient-to-r ${step.color} px-6 py-6 md:px-8 md:py-8`}>
                        <div className="text-5xl mb-3">{step.icon}</div>
                        <h2 className="text-3xl md:text-4xl font-serif font-black text-white mb-1">{step.title}</h2>
                        <p className="text-lg text-white/80 font-medium">{step.subtitle}</p>
                    </div>

                    {/* Steps list */}
                    <div className="px-6 py-6 md:px-8 md:py-8 space-y-5">
                        {step.content.map((item, i) => (
                            <div key={i} className="flex items-start gap-4 group">
                                <span className="text-2xl md:text-3xl flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                                    {item.emoji}
                                </span>
                                <p className="text-lg md:text-xl text-[#e8dcc8] leading-relaxed font-medium">
                                    {item.text}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Tip */}
                    {step.tip && (
                        <div className="mx-6 mb-6 md:mx-8 md:mb-8 bg-amber-500/10 border border-amber-500/20 rounded-2xl px-5 py-4">
                            <p className="text-lg text-amber-300 font-medium leading-relaxed">{step.tip}</p>
                        </div>
                    )}
                </div>
            </main>

            {/* Fixed bottom navigation */}
            <div className="fixed bottom-0 left-0 right-0 z-20 bg-[#0a0a0f]/95 backdrop-blur-xl border-t border-white/10 px-4 py-4 md:px-8">
                <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
                    <button
                        onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                        disabled={currentStep === 0}
                        className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-lg font-bold transition-all ${currentStep === 0
                            ? 'bg-white/5 text-white/20 cursor-not-allowed'
                            : 'bg-white/10 text-white hover:bg-white/20 active:scale-95'
                            }`}
                    >
                        <ChevronLeft className="w-6 h-6" />
                        Trước
                    </button>

                    {currentStep < steps.length - 1 ? (
                        <button
                            onClick={() => setCurrentStep(currentStep + 1)}
                            className="flex items-center gap-2 px-8 py-3 rounded-2xl text-lg font-bold bg-amber-500 text-black hover:bg-amber-400 active:scale-95 transition-all shadow-lg shadow-amber-500/20"
                        >
                            Tiếp theo
                            <ChevronRight className="w-6 h-6" />
                        </button>
                    ) : (
                        <Link
                            href="/"
                            className="flex items-center gap-2 px-8 py-3 rounded-2xl text-lg font-bold bg-green-500 text-black hover:bg-green-400 active:scale-95 transition-all shadow-lg shadow-green-500/20"
                        >
                            <Home className="w-6 h-6" />
                            Bắt đầu dùng!
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}

"use client";

import Link from "next/link";
import { Users, TreeDeciduous, BookOpen, Settings, Leaf, HelpCircle } from "lucide-react";
import BlogSection from '@/components/BlogSection';
import { useState, useEffect } from 'react';

interface FamilyDataRaw {
  familyName: string;
  since: number;
  totalGenerations: number;
  totalMembers: number;
}

export default function Home() {
  const [familyDataRaw, setData] = useState<FamilyDataRaw | null>(null);

  useEffect(() => {
    fetch('/api/family-data', { cache: 'no-store' })
      .then(r => r.json())
      .then(setData);
  }, []);

  const currentYear = new Date().getFullYear();
  const histYears = familyDataRaw ? currentYear - familyDataRaw.since : 0;

  if (!familyDataRaw) return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin w-10 h-10 border-4 border-[#d4a012] border-t-transparent rounded-full mx-auto mb-3" />
        <p className="text-[#c0a880] font-serif">Đang tải...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-[#f0ebe0] font-sans selection:bg-[#d4a012] selection:text-[#0a0a0f] relative overflow-hidden">

      {/* Decorative Flying Dragon & Phoenix Effects via CSS background and SVG data URIs */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-20" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='800' viewBox='0 0 800 800'%3E%3Cpath fill='%23d4a012' fill-opacity='0.15' d='M237 0C215 57 159 93 92 108 55 116 26 137 0 178v5l26-17c37-23 72-13 113 12 30 18 57 26 82 25 39-1 74-21 110-44 51-33 104-62 165-71 47-7 92 1 131 23l19 12-16-16c-37-37-83-51-137-51-64-1-125 24-183 55-46 25-90 44-137 43-26 0-51-8-75-21-36-23-75-35-115-32l-14 1V51c41-21 86-27 131-27 8 0 16 0 25 1 45 4 84 21 123 41 21 11 41 21 63 29 27 10 56 16 88 17 48 1 97-12 143-39l23-14-19-14C655 4 597-9 537-8c-50 1-96 15-141 38-34 18-67 36-104 43-29 5-58 1-84-13-33-18-69-30-107-35l-19-2V0h237zm8 0V4c-35 5-69 16-100 34-26 14-53 19-81 14-35-6-67-24-99-41-25-13-52-25-80-33l3-1c32 9 60 21 86 35 29 15 57 31 89 36 29 5 57 0 84-13 32-17 68-29 104-35h-6z'/%3E%3C/svg%3E")`,
        backgroundSize: '800px 800px',
        backgroundPosition: 'center',
        backgroundRepeat: 'repeat',
        animation: 'drift 60s linear infinite'
      }} />

      {/* Floating Orbs overlay */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[20%] left-[10%] w-[30vw] h-[30vw] min-w-[300px] min-h-[300px] bg-gold-400/5 rounded-full blur-[120px] mix-blend-screen animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-[20%] right-[10%] w-[25vw] h-[25vw] min-w-[250px] min-h-[250px] bg-red-900/10 rounded-full blur-[100px] mix-blend-screen animate-pulse" style={{ animationDuration: '12s' }} />
      </div>

      {/* Hero Section */}
      <header className="relative min-h-screen flex flex-col items-center justify-center text-center overflow-hidden px-4">
        {/* Top Right Admin Link */}
        <div className="absolute top-6 right-6 z-20">
          <Link href="/admin" className="flex items-center gap-2 text-gold-200/50 hover:text-gold-400 transition-colors bg-white/5 border border-white/10 px-4 py-2 rounded-xl backdrop-blur-md">
            <Settings className="w-4 h-4" />
            <span className="text-sm font-medium">Bảng Điều Khiển</span>
          </Link>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
          <h1 className="text-5xl md:text-[5.5rem] font-serif font-black mb-6 bg-linear-to-b from-[#ffedb3] via-[#facc15] to-[#996515] text-transparent bg-clip-text drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)] leading-tight tracking-tight uppercase px-4 pt-16 text-center">
            Phả Đồ Họ {familyDataRaw.familyName}
          </h1>
          <p className="text-lg md:text-2xl font-medium text-[#c0a880] tracking-[0.3em] uppercase mb-16 relative">
            <span className="absolute -left-12 top-1/2 w-8 h-px bg-gold-600/50"></span>
            - TỪ NĂM {familyDataRaw.since} -
            <span className="absolute -right-12 top-1/2 w-8 h-px bg-gold-600/50"></span>
          </p>

          <div className="flex flex-wrap justify-center gap-10 md:gap-16 mb-20 px-8 md:px-16 py-8 rounded-[2rem] bg-[#1a140d]/40 border border-gold-900/30 backdrop-blur-xl shadow-[0_0_50px_-12px_rgba(212,160,18,0.15)] ring-1 ring-white/5 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gold-500/5 to-transparent -translate-x-full group-hover:translate-x-full duration-[2s] transition-transform ease-in-out" />

            <div className="flex flex-col items-center transform hover:scale-105 transition-transform">
              <span className="text-5xl md:text-7xl font-serif font-bold bg-linear-to-b from-white to-gold-400 text-transparent bg-clip-text leading-none mb-3 drop-shadow-md">{familyDataRaw.totalGenerations}</span>
              <span className="text-xs md:text-sm text-gold-600 uppercase tracking-[0.2em] font-bold">Đời Truyền Lại</span>
            </div>
            <div className="w-px h-24 bg-gradient-to-b from-transparent via-gold-800/50 to-transparent hidden sm:block"></div>
            <div className="flex flex-col items-center transform hover:scale-105 transition-transform">
              <span className="text-5xl md:text-7xl font-serif font-bold bg-linear-to-b from-white to-gold-400 text-transparent bg-clip-text leading-none mb-3 drop-shadow-md">{familyDataRaw.totalMembers}</span>
              <span className="text-xs md:text-sm text-gold-600 uppercase tracking-[0.2em] font-bold">Thành Viên</span>
            </div>
            <div className="w-px h-24 bg-gradient-to-b from-transparent via-gold-800/50 to-transparent hidden sm:block"></div>
            <div className="flex flex-col items-center transform hover:scale-105 transition-transform">
              <span className="text-5xl md:text-7xl font-serif font-bold bg-linear-to-b from-white to-gold-400 text-transparent bg-clip-text leading-none mb-3 drop-shadow-md">{histYears}</span>
              <span className="text-xs md:text-sm text-gold-600 uppercase tracking-[0.2em] font-bold">Năm Lịch Sử</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl relative z-10 px-4">
            <Link href="/tree" className="group relative flex flex-col items-center justify-center p-8 rounded-3xl bg-[#14100c]/80 border border-gold-900/30 hover:border-gold-500/50 hover:bg-[#1f1811] transition-all overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,160,18,0.1)_0,transparent_100%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <TreeDeciduous className="w-12 h-12 text-gold-500 mb-4 group-hover:-translate-y-2 group-hover:scale-110 group-hover:text-gold-300 transition-all duration-300 drop-shadow-[0_0_8px_rgba(212,160,18,0.4)]" />
              <h3 className="font-serif font-bold text-xl text-gold-100 mb-2">Cây Gia Phả</h3>
              <p className="text-sm text-gold-200/50 text-center font-medium">Bản đồ tương tác đa chiều</p>
            </Link>

            <Link href="/tree-organic" className="group relative flex flex-col items-center justify-center p-8 rounded-3xl bg-[#14100c]/80 border border-green-900/30 hover:border-green-500/50 hover:bg-[#111f14] transition-all overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,197,94,0.1)_0,transparent_100%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <Leaf className="w-12 h-12 text-green-400 mb-4 group-hover:-translate-y-2 group-hover:scale-110 group-hover:text-green-300 transition-all duration-300 drop-shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
              <h3 className="font-serif font-bold text-xl text-green-100 mb-2">Cây Phả Đồ Organic</h3>
              <p className="text-sm text-green-200/50 text-center font-medium">Biểu đồ nghệ thuật dạng cây</p>
            </Link>

            <Link href="/directory" className="group relative flex flex-col items-center justify-center p-8 rounded-3xl bg-[#14100c]/80 border border-blue-900/30 hover:border-blue-500/50 hover:bg-[#11141f] transition-all overflow-hidden lg:-translate-y-4 shadow-[0_15px_30px_-10px_rgba(0,0,0,0.5)]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.1)_0,transparent_100%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <Users className="w-12 h-12 text-blue-400 mb-4 group-hover:-translate-y-2 group-hover:scale-110 group-hover:text-blue-300 transition-all duration-300 drop-shadow-[0_0_8px_rgba(59,130,246,0.4)]" />
              <h3 className="font-serif font-bold text-xl text-blue-100 mb-2">Danh Bạ Dòng Họ</h3>
              <p className="text-sm text-blue-200/50 text-center font-medium">Tra cứu & liên hệ thành viên</p>
            </Link>

            <Link href="/book" className="group relative flex flex-col items-center justify-center p-8 rounded-3xl bg-[#14100c]/80 border border-pink-900/30 hover:border-pink-500/50 hover:bg-[#1f1118] transition-all overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(236,72,153,0.1)_0,transparent_100%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <BookOpen className="w-12 h-12 text-pink-400 mb-4 group-hover:-translate-y-2 group-hover:scale-110 group-hover:text-pink-300 transition-all duration-300 drop-shadow-[0_0_8px_rgba(236,72,153,0.4)]" />
              <h3 className="font-serif font-bold text-xl text-pink-100 mb-2">Sách Gia Phả</h3>
              <p className="text-sm text-pink-200/50 text-center font-medium">Kỷ yếu lịch sử truyền nối</p>
            </Link>

            <Link href="/guide" className="group relative flex flex-col items-center justify-center p-8 rounded-3xl bg-[#14100c]/80 border border-amber-900/30 hover:border-amber-500/50 hover:bg-[#1f1a11] transition-all overflow-hidden lg:col-span-1">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.1)_0,transparent_100%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <HelpCircle className="w-12 h-12 text-amber-400 mb-4 group-hover:-translate-y-2 group-hover:scale-110 group-hover:text-amber-300 transition-all duration-300 drop-shadow-[0_0_8px_rgba(245,158,11,0.4)]" />
              <h3 className="font-serif font-bold text-xl text-amber-100 mb-2">Hướng Dẫn Sử Dụng</h3>
              <p className="text-sm text-amber-200/50 text-center font-medium">Cho các bác, các cụ cao tuổi</p>
            </Link>
          </div>
        </div>

        {/* Decorative corner element */}
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black to-transparent pointer-events-none z-10" />
      </header>

      <BlogSection />

      {/* Inject custom CSS directly for the drift/spin animations */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes drift {
            from { background-position: 0 0; }
            to { background-position: 800px 800px; }
        }
        .animate-spin-slow {
            animation: spin 20s linear infinite;
        }
      `}} />
    </div>
  );
}

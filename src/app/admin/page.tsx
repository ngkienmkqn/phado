"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Settings, Users, Database, ShieldCheck, CheckCircle, XCircle, Grid } from 'lucide-react';
import familyDataRaw from '@/data/family_data.json';

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState<'pending' | 'members'>('pending');

    // Multi-step mock Elder Mode requests
    const pendingRequests = [
        { id: 1, type: 'Sửa lỗi', memberName: 'Nguyễn Văn Hải (Đời 20)', request: 'Đổi năm sinh thành 1958 (trước đó là 1960)', by: 'Bà Thơm (09xx)', time: '10 phút trước' },
        { id: 2, type: 'Báo thiếu', memberName: 'Chưa có tên', request: 'Thêm cháu nội tên Nguyễn Phúc An, con của Nguyễn Trung Kiên', by: 'Ông Kiên (08xx)', time: '2 giờ trước' }
    ];

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-[#f0ebe0] font-sans flex">
            {/* Sidebar */}
            <aside className="w-64 bg-[#121218] border-r border-white/10 flex-col hidden md:flex">
                <div className="p-6 border-b border-white/10">
                    <Link href="/" className="flex items-center gap-2 text-gold-400 hover:text-gold-300">
                        <ShieldCheck className="w-6 h-6" />
                        <span className="font-serif font-bold text-lg">Admin Panel</span>
                    </Link>
                </div>
                <nav className="flex-1 p-4 flex flex-col gap-2">
                    <button
                        onClick={() => setActiveTab('pending')}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'pending' ? 'bg-gold-500/20 text-gold-400' : 'hover:bg-white/5 text-gray-400'}`}
                    >
                        <CheckCircle className="w-5 h-5" />
                        <span>Duyệt Yêu Cầu</span>
                        <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{pendingRequests.length}</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('members')}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'members' ? 'bg-gold-500/20 text-gold-400' : 'hover:bg-white/5 text-gray-400'}`}
                    >
                        <Users className="w-5 h-5" />
                        <span>Quản Lý Thành Viên</span>
                    </button>
                    <div className="mt-8 mb-2 px-4 text-xs font-bold text-gray-600 uppercase tracking-wider">Hệ Thống (Vercel)</div>
                    <button className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-gray-400 transition-colors w-full cursor-not-allowed opacity-50">
                        <div className="flex items-center gap-3">
                            <Database className="w-5 h-5" />
                            <span>Postgres DB</span>
                        </div>
                    </button>
                    <button className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-gray-400 transition-colors w-full cursor-not-allowed opacity-50">
                        <div className="flex items-center gap-3">
                            <Grid className="w-5 h-5" />
                            <span>Blob Storage</span>
                        </div>
                    </button>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                <header className="h-16 flex items-center justify-between px-6 border-b border-white/10 bg-[#0a0a0f]">
                    <h2 className="text-xl font-semibold text-white">
                        {activeTab === 'pending' ? 'Yêu Cầu Từ Người Dùng (Elder Mode)' : 'Database Gia Phả'}
                    </h2>
                    <div className="flex items-center gap-4">
                        <span className="text-sm border border-gold-500/30 bg-gold-500/10 text-gold-400 px-3 py-1 rounded-full flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-gold-400 animate-pulse"></span>
                            Admin Mode
                        </span>
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                            <Settings className="w-4 h-4" />
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-auto p-6">
                    {activeTab === 'pending' && (
                        <div className="max-w-4xl">
                            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                                <div className="p-4 border-b border-white/10 bg-[#121218] flex justify-between items-center">
                                    <h3 className="font-semibold text-lg flex items-center gap-2">
                                        <AlertTriangleIcon className="w-5 h-5 text-yellow-500" />
                                        Danh sách cần duyệt ({pendingRequests.length})
                                    </h3>
                                    <p className="text-sm text-gray-400">Được gửi từ tính năng Báo Sai của Người Cao Tuổi</p>
                                </div>
                                <div className="divide-y divide-white/10">
                                    {pendingRequests.map(req => (
                                        <div key={req.id} className="p-6 hover:bg-white/5 transition-colors">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded border border-red-500/30 uppercase tracking-wider font-bold mr-3">
                                                        {req.type}
                                                    </span>
                                                    <span className="text-gray-400 text-sm">{req.time}</span>
                                                </div>
                                                <div className="text-sm text-gray-400">
                                                    Người gửi: <strong className="text-white">{req.by}</strong>
                                                </div>
                                            </div>
                                            <h4 className="text-lg font-serif font-bold text-gold-300 mb-2">Đối tượng: {req.memberName}</h4>
                                            <p className="text-gray-300 bg-black/20 p-3 rounded-lg border border-white/5 mb-4">
                                                {req.request}
                                            </p>
                                            <div className="flex gap-3">
                                                <button className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                                                    <CheckCircle className="w-4 h-4" /> Duyệt & Cập nhật
                                                </button>
                                                <button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-gray-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                                                    <XCircle className="w-4 h-4" /> Từ chối
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'members' && (
                        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                            <div className="p-4 border-b border-white/10 bg-[#121218] flex justify-between items-center">
                                <h3 className="font-semibold text-lg">Tổng quan Database ({familyDataRaw.totalMembers} Record)</h3>
                                <button className="bg-gold-500 hover:bg-gold-400 text-black px-4 py-2 rounded-lg text-sm font-bold transition-colors">
                                    + Thêm Thành Viên
                                </button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-[#1a1a24] text-gray-400 text-sm uppercase tracking-wider">
                                            <th className="p-4 font-semibold border-b border-white/10">ID</th>
                                            <th className="p-4 font-semibold border-b border-white/10">Họ và Tên</th>
                                            <th className="p-4 font-semibold border-b border-white/10">Đời</th>
                                            <th className="p-4 font-semibold border-b border-white/10">Vợ/Chồng</th>
                                            <th className="p-4 font-semibold border-b border-white/10">Hành động</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {familyDataRaw.members.slice(0, 15).map(m => (
                                            <tr key={m.id} className="hover:bg-white/5 transition-colors">
                                                <td className="p-4 text-sm text-gray-500">{m.id}</td>
                                                <td className="p-4 font-medium text-white">{m.name}</td>
                                                <td className="p-4 text-gold-400">Đời {m.generation}</td>
                                                <td className="p-4 text-gray-400">{m.spouse || '-'}</td>
                                                <td className="p-4">
                                                    <button className="text-blue-400 hover:text-blue-300 text-sm font-medium mr-3">Sửa</button>
                                                    <button className="text-red-400 hover:text-red-300 text-sm font-medium">Xóa</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="p-4 text-center text-sm text-gray-500 border-t border-white/10">
                                Hiển thị 15 kết quả đầu tiên. Vui lòng kết nối Vercel Postgres để xem toàn bộ.
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

// Quick icon definitions
function AlertTriangleIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
            <path d="M12 9v4" />
            <path d="M12 17h.01" />
        </svg>
    );
}

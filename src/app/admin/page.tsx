"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Settings, Users, ShieldCheck, CheckCircle, XCircle, Lock, LogOut, Trash2, Grid } from 'lucide-react';
import familyDataRaw from '@/data/family_data.json';

const ADMIN_PASSWORD = 'phado2025';

interface PendingRequest {
    id: number;
    type: string;
    memberName: string;
    memberId?: string;
    request: string;
    by: string;
    time: string;
}

export default function AdminDashboard() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState<'pending' | 'members'>('pending');
    const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);

    // Check if already logged in
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const saved = sessionStorage.getItem('phado_admin');
            if (saved === 'true') setIsAuthenticated(true);
        }
    }, []);

    // Load pending requests from localStorage
    useEffect(() => {
        if (isAuthenticated && typeof window !== 'undefined') {
            const stored = localStorage.getItem('phado_requests');
            if (stored) {
                try { setPendingRequests(JSON.parse(stored)); } catch { setPendingRequests([]); }
            }
        }
    }, [isAuthenticated]);

    const handleLogin = () => {
        if (password === ADMIN_PASSWORD) {
            setIsAuthenticated(true);
            sessionStorage.setItem('phado_admin', 'true');
            setError('');
        } else {
            setError('Sai mật khẩu. Vui lòng thử lại.');
        }
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        sessionStorage.removeItem('phado_admin');
    };

    const handleApprove = (id: number) => {
        const updated = pendingRequests.filter(r => r.id !== id);
        setPendingRequests(updated);
        localStorage.setItem('phado_requests', JSON.stringify(updated));
    };

    const handleReject = (id: number) => {
        const updated = pendingRequests.filter(r => r.id !== id);
        setPendingRequests(updated);
        localStorage.setItem('phado_requests', JSON.stringify(updated));
    };

    const handleClearAll = () => {
        setPendingRequests([]);
        localStorage.setItem('phado_requests', '[]');
    };

    // Login Screen
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
                <div className="w-full max-w-sm">
                    <div className="text-center mb-8">
                        <div className="w-20 h-20 rounded-full bg-gold-500/20 border-2 border-gold-500/30 flex items-center justify-center mx-auto mb-4">
                            <Lock className="w-8 h-8 text-gold-400" />
                        </div>
                        <h1 className="text-2xl font-serif font-bold text-white mb-2">Đăng Nhập Admin</h1>
                        <p className="text-gray-400 text-sm">Phả Đồ Nguyễn Cẩm Giang</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <label className="text-sm text-gray-400 block mb-2 font-medium">Mật khẩu quản trị</label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => { setPassword(e.target.value); setError(''); }}
                            onKeyDown={e => e.key === 'Enter' && handleLogin()}
                            placeholder="Nhập mật khẩu..."
                            className="w-full bg-[#1a1a24] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-all text-lg mb-4"
                            autoFocus
                        />
                        {error && <p className="text-red-400 text-sm mb-3 flex items-center gap-2"><XCircle className="w-4 h-4" /> {error}</p>}
                        <button
                            onClick={handleLogin}
                            className="w-full bg-gold-600 hover:bg-gold-500 text-black font-bold py-3 rounded-xl transition-colors text-lg"
                        >
                            Đăng Nhập
                        </button>
                    </div>
                    <div className="text-center mt-6">
                        <Link href="/" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">
                            ← Quay lại trang chủ
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

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
                        {pendingRequests.length > 0 && (
                            <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{pendingRequests.length}</span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('members')}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'members' ? 'bg-gold-500/20 text-gold-400' : 'hover:bg-white/5 text-gray-400'}`}
                    >
                        <Users className="w-5 h-5" />
                        <span>Danh Sách Thành Viên</span>
                    </button>
                </nav>
                <div className="p-4 border-t border-white/10">
                    <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-colors w-full">
                        <LogOut className="w-5 h-5" />
                        <span>Đăng Xuất</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                <header className="h-16 flex items-center justify-between px-6 border-b border-white/10 bg-[#0a0a0f]">
                    <h2 className="text-xl font-semibold text-white">
                        {activeTab === 'pending' ? 'Yêu Cầu Cập Nhật Hồ Sơ' : 'Danh Sách Thành Viên'}
                    </h2>
                    <div className="flex items-center gap-4">
                        <span className="text-sm border border-gold-500/30 bg-gold-500/10 text-gold-400 px-3 py-1 rounded-full flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-gold-400 animate-pulse"></span>
                            Admin
                        </span>
                        <button onClick={handleLogout} className="md:hidden text-gray-400 hover:text-red-400">
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-auto p-6">
                    {activeTab === 'pending' && (
                        <div className="max-w-4xl">
                            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                                <div className="p-4 border-b border-white/10 bg-[#121218] flex justify-between items-center">
                                    <h3 className="font-semibold text-lg flex items-center gap-2">
                                        <AlertTriangleIcon className="w-5 h-5 text-yellow-500" />
                                        Yêu cầu chờ duyệt ({pendingRequests.length})
                                    </h3>
                                    {pendingRequests.length > 0 && (
                                        <button onClick={handleClearAll} className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1">
                                            <Trash2 className="w-3 h-3" /> Xoá hết
                                        </button>
                                    )}
                                </div>
                                {pendingRequests.length === 0 ? (
                                    <div className="p-12 text-center text-gray-500">
                                        <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                        <p className="text-lg">Không có yêu cầu nào đang chờ duyệt.</p>
                                        <p className="text-sm mt-2">Khi người dùng bấm &quot;Cập Nhật Hồ Sơ&quot; trên phả đồ, yêu cầu sẽ hiện tại đây.</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-white/10">
                                        {pendingRequests.map(req => (
                                            <div key={req.id} className="p-6 hover:bg-white/5 transition-colors">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <span className={`text-xs px-2 py-1 rounded border uppercase tracking-wider font-bold mr-3 ${req.type === 'Sửa lỗi' ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-blue-500/20 text-blue-400 border-blue-500/30'}`}>
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
                                                    <button onClick={() => handleApprove(req.id)} className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                                                        <CheckCircle className="w-4 h-4" /> Đã xử lý
                                                    </button>
                                                    <button onClick={() => handleReject(req.id)} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-gray-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                                                        <XCircle className="w-4 h-4" /> Bỏ qua
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'members' && (
                        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                            <div className="p-4 border-b border-white/10 bg-[#121218] flex justify-between items-center">
                                <h3 className="font-semibold text-lg">Tổng cộng {familyDataRaw.totalMembers} thành viên</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-[#1a1a24] text-gray-400 text-sm uppercase tracking-wider">
                                            <th className="p-4 font-semibold border-b border-white/10">ID</th>
                                            <th className="p-4 font-semibold border-b border-white/10">Họ và Tên</th>
                                            <th className="p-4 font-semibold border-b border-white/10">Đời</th>
                                            <th className="p-4 font-semibold border-b border-white/10">Vợ/Chồng</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {familyDataRaw.members.slice(0, 30).map(m => (
                                            <tr key={m.id} className="hover:bg-white/5 transition-colors">
                                                <td className="p-4 text-sm text-gray-500">{m.id}</td>
                                                <td className="p-4 font-medium text-white">{m.name}</td>
                                                <td className="p-4 text-gold-400">Đời {m.generation}</td>
                                                <td className="p-4 text-gray-400">{m.spouse || '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="p-4 text-center text-sm text-gray-500 border-t border-white/10">
                                Hiển thị 30 / {familyDataRaw.totalMembers} thành viên đầu tiên.
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

function AlertTriangleIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
            <path d="M12 9v4" />
            <path d="M12 17h.01" />
        </svg>
    );
}

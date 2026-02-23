"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, ShieldCheck, CheckCircle, XCircle, Lock, LogOut, Trash2, Eye, EyeOff, FileText } from 'lucide-react';
import familyDataRaw from '@/data/family_data.json';

const DEFAULT_PASSWORD = '856226';
const getAdminPassword = () => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('phado_admin_pass') || DEFAULT_PASSWORD;
    }
    return DEFAULT_PASSWORD;
};

interface FieldChange {
    field: string;
    label: string;
    oldValue: string;
    newValue: string;
}

interface PendingRequest {
    type?: 'edit' | 'add';
    relatedToId?: string;
    relatedToName?: string;
    relation?: string;
    newData?: any;
    id: number;
    memberId: string;
    memberName: string;
    memberGeneration: number;
    changes: FieldChange[];
    note: string;
    by: string;
    phone?: string;
    time: string;
}

export default function AdminDashboard() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState<'pending' | 'members' | 'blog'>('pending');
    const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
    const [blogPosts, setBlogPosts] = useState<any[]>([]);
    const [newBlogTitle, setNewBlogTitle] = useState('');
    const [newBlogContent, setNewBlogContent] = useState('');
    const [newBlogAuthor, setNewBlogAuthor] = useState('');
    const [showPassChange, setShowPassChange] = useState(false);
    const [newPass, setNewPass] = useState('');
    const [passMsg, setPassMsg] = useState('');

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const saved = sessionStorage.getItem('phado_admin');
            if (saved === 'true') setIsAuthenticated(true);
        }
    }, []);

    useEffect(() => {
        if (isAuthenticated && typeof window !== 'undefined') {
            const stored = localStorage.getItem('phado_requests');
            if (stored) {
                try { setPendingRequests(JSON.parse(stored)); } catch { setPendingRequests([]); }
            }
            const blogStored = localStorage.getItem('phado_blog');
            if (blogStored) {
                try { setBlogPosts(JSON.parse(blogStored)); } catch { setBlogPosts([]); }
            }
        }
    }, [isAuthenticated]);

    const handleLogin = () => {
        if (password === getAdminPassword()) {
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

    // AUTO-APPLY: When admin approves, apply changes to localStorage overlay
    const handleApprove = (req: PendingRequest) => {
        // Load existing overlay
        const overlay: Record<string, Record<string, string>> = JSON.parse(localStorage.getItem('phado_overlay') || '{}');

        if (req.type === 'add' && req.relation === 'spouse' && req.relatedToId) {
            // Find current spouse value
            let currentSpouse = '';
            if (overlay[req.relatedToId] && overlay[req.relatedToId].spouse !== undefined) {
                currentSpouse = overlay[req.relatedToId].spouse;
            } else {
                const baseMember = familyDataRaw.members.find((m: any) => m.id === req.relatedToId);
                if (baseMember && baseMember.spouse) {
                    currentSpouse = baseMember.spouse as string;
                }
            }

            // Append new spouse
            const newSpouseName = req.newData?.name;
            if (newSpouseName) {
                const updatedSpouse = currentSpouse ? `${currentSpouse} | ${newSpouseName}` : newSpouseName;
                if (!overlay[req.relatedToId]) overlay[req.relatedToId] = {};
                overlay[req.relatedToId].spouse = updatedSpouse;
            }
        } else if (req.type === 'add' && req.relation === 'child' && req.relatedToId) {
            // Add completely new node
            const newId = `child_${Date.now()}`;
            overlay[newId] = {
                id: newId,
                name: req.newData?.name || 'Chưa rõ',
                gender: req.newData?.gender || 'male',
                generation: String(req.newData?.generation || ''),
                parentId: req.relatedToId
            };
        } else if (req.memberId) {
            // Normal edit
            if (!overlay[req.memberId]) overlay[req.memberId] = {};
            for (const change of req.changes || []) {
                overlay[req.memberId][change.field] = change.newValue;
            }
        }

        localStorage.setItem('phado_overlay', JSON.stringify(overlay));

        // Remove from pending
        const updated = pendingRequests.filter(r => r.id !== req.id);
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

    // Privacy toggle
    const togglePublicField = (memberId: string, field: string) => {
        const overlay: Record<string, any> = JSON.parse(localStorage.getItem('phado_overlay') || '{}');
        if (!overlay[memberId]) overlay[memberId] = {};
        const current: string[] = overlay[memberId].publicFields ? JSON.parse(overlay[memberId].publicFields) : [];
        const idx = current.indexOf(field);
        if (idx >= 0) current.splice(idx, 1); else current.push(field);
        overlay[memberId].publicFields = JSON.stringify(current);
        localStorage.setItem('phado_overlay', JSON.stringify(overlay));
    };

    // Blog CRUD
    const handleAddBlog = () => {
        if (!newBlogTitle.trim() || !newBlogContent.trim()) return;
        const post = {
            id: Date.now(),
            title: newBlogTitle.trim(),
            content: newBlogContent.trim(),
            author: newBlogAuthor.trim() || 'Admin',
            date: new Date().toLocaleDateString('vi-VN'),
        };
        const updated = [post, ...blogPosts];
        setBlogPosts(updated);
        localStorage.setItem('phado_blog', JSON.stringify(updated));
        setNewBlogTitle(''); setNewBlogContent(''); setNewBlogAuthor('');
    };

    const handleDeleteBlog = (id: number) => {
        const updated = blogPosts.filter(p => p.id !== id);
        setBlogPosts(updated);
        localStorage.setItem('phado_blog', JSON.stringify(updated));
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
                        <h1 className="text-2xl font-serif font-bold text-white mb-2">{'\u0110\u0103ng Nh\u1EADp Admin'}</h1>
                        <p className="text-gray-400 text-sm">{`Ph\u1EA3 \u0110\u1ED3 Nguy\u1EC5n C\u1EA9m Giang`}</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <label className="text-sm text-gray-400 block mb-2 font-medium">{`M\u1EADt kh\u1EA9u qu\u1EA3n tr\u1ECB`}</label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => { setPassword(e.target.value); setError(''); }}
                            onKeyDown={e => e.key === 'Enter' && handleLogin()}
                            placeholder={`Nh\u1EADp m\u1EADt kh\u1EA9u...`}
                            className="w-full bg-[#1a1a24] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-all text-lg mb-4"
                            autoFocus
                        />
                        {error && <p className="text-red-400 text-sm mb-3 flex items-center gap-2"><XCircle className="w-4 h-4" /> {error}</p>}
                        <button onClick={handleLogin} className="w-full bg-gold-600 hover:bg-gold-500 text-black font-bold py-3 rounded-xl transition-colors text-lg">
                            {`\u0110\u0103ng Nh\u1EADp`}
                        </button>
                    </div>
                    <div className="text-center mt-6">
                        <Link href="/" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">
                            {`\u2190 Quay l\u1EA1i trang ch\u1EE7`}
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
                    <button onClick={() => setActiveTab('pending')}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'pending' ? 'bg-gold-500/20 text-gold-400' : 'hover:bg-white/5 text-gray-400'}`}>
                        <CheckCircle className="w-5 h-5" />
                        <span>{`Duy\u1EC7t Y\u00EAu C\u1EA7u`}</span>
                        {pendingRequests.length > 0 && <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{pendingRequests.length}</span>}
                    </button>
                    <button onClick={() => setActiveTab('members')}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'members' ? 'bg-gold-500/20 text-gold-400' : 'hover:bg-white/5 text-gray-400'}`}>
                        <Users className="w-5 h-5" />
                        <span>Danh Sách Thành Viên</span>
                    </button>
                    <button onClick={() => setActiveTab('blog')}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'blog' ? 'bg-gold-500/20 text-gold-400' : 'hover:bg-white/5 text-gray-400'}`}>
                        <FileText className="w-5 h-5" />
                        <span>Quản Lý Blog</span>
                    </button>
                </nav>
                <div className="p-4 border-t border-white/10 space-y-2">
                    <button onClick={() => setShowPassChange(!showPassChange)} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-gray-400 hover:text-gold-400 transition-colors w-full">
                        <Lock className="w-5 h-5" />
                        <span>Đổi Mật Khẩu</span>
                    </button>
                    {showPassChange && (
                        <div className="px-4 pb-2 space-y-2">
                            <input type="password" value={newPass} onChange={e => setNewPass(e.target.value)} placeholder="Mật khẩu mới..."
                                className="w-full bg-[#1a1a24] border border-white/10 rounded-lg py-2 px-3 text-white text-sm focus:outline-none focus:border-gold-500" />
                            <button onClick={() => {
                                if (newPass.length < 4) { setPassMsg('Mật khẩu phải ít nhất 4 ký tự'); return; }
                                localStorage.setItem('phado_admin_pass', newPass);
                                setPassMsg('✅ Đã đổi mật khẩu thành công!');
                                setNewPass('');
                                setTimeout(() => setPassMsg(''), 3000);
                            }} className="w-full bg-gold-600 hover:bg-gold-500 text-black font-bold py-2 rounded-lg text-sm transition-colors">
                                Lưu
                            </button>
                            {passMsg && <p className="text-xs text-gold-400">{passMsg}</p>}
                        </div>
                    )}
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
                        {activeTab === 'pending' ? `Y\u00EAu C\u1EA7u C\u1EADp Nh\u1EADt H\u1ED3 S\u01A1` : `Danh S\u00E1ch Th\u00E0nh Vi\u00EAn`}
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
                                        {`Y\u00EAu c\u1EA7u ch\u1EDD duy\u1EC7t (${pendingRequests.length})`}
                                    </h3>
                                    {pendingRequests.length > 0 && (
                                        <button onClick={handleClearAll} className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1">
                                            <Trash2 className="w-3 h-3" /> {`Xo\u00E1 h\u1EBFt`}
                                        </button>
                                    )}
                                </div>
                                {pendingRequests.length === 0 ? (
                                    <div className="p-12 text-center text-gray-500">
                                        <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                        <p className="text-lg">{`Kh\u00F4ng c\u00F3 y\u00EAu c\u1EA7u n\u00E0o \u0111ang ch\u1EDD duy\u1EC7t.`}</p>
                                        <p className="text-sm mt-2">{`Khi ng\u01B0\u1EDDi d\u00F9ng s\u1EEDa th\u00F4ng tin tr\u00EAn ph\u1EA3 \u0111\u1ED3, y\u00EAu c\u1EA7u s\u1EBD hi\u1EC7n t\u1EA1i \u0111\u00E2y.`}</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-white/10">
                                        {pendingRequests.map(req => (
                                            <div key={req.id} className="p-6 hover:bg-white/5 transition-colors">
                                                {/* Header */}
                                                <div className="flex flex-col gap-3 mb-4">
                                                    <div>
                                                        <h4 className="text-xl font-serif font-bold text-gold-300">
                                                            {req.type === 'add' ? req.newData?.name : req.memberName}
                                                            <span className="text-base text-gray-400 font-normal ml-2">
                                                                ({`Đời ${req.type === 'add' ? req.newData?.generation : (req.memberGeneration || '?')}`})
                                                            </span>
                                                        </h4>
                                                    </div>

                                                    {/* Contact Info Block */}
                                                    <div className="bg-[#1a1a24] border border-white/10 rounded-lg p-3 flex flex-col md:flex-row md:items-center gap-2 md:gap-6">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Người gửi:</span>
                                                            <strong className="text-gray-200 text-sm whitespace-nowrap">{req.by || 'Ẩn danh'}</strong>
                                                        </div>
                                                        <div className="hidden md:block w-px h-4 bg-white/10"></div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">SĐT / Zalo:</span>
                                                            {req.phone ? (
                                                                <strong className="text-blue-400 text-sm">{req.phone}</strong>
                                                            ) : (
                                                                <span className="text-gray-500 text-sm italic">Không cung cấp</span>
                                                            )}
                                                        </div>
                                                        <div className="hidden md:block w-px h-4 bg-white/10"></div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Thời gian:</span>
                                                            <span className="text-gray-400 text-sm">{req.time}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Edit Diff View */}
                                                {req.type !== 'add' && req.changes && req.changes.length > 0 && (
                                                    <div className="bg-black/30 rounded-xl border border-white/10 overflow-hidden mb-3">
                                                        <div className="px-4 py-2 bg-white/5 border-b border-white/10">
                                                            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                                                                {`${req.changes.length} thay \u0111\u1ED5i`}
                                                            </span>
                                                        </div>
                                                        {req.changes.map((c: FieldChange, i: number) => (
                                                            <div key={i} className="px-4 py-3 flex items-center gap-3 border-b border-white/5 last:border-b-0">
                                                                <span className="text-sm text-gray-400 w-24 shrink-0 font-medium">{c.label}:</span>
                                                                <span className="text-sm text-red-400 line-through">{c.oldValue || `(tr\u1ED1ng)`}</span>
                                                                <span className="text-gray-500">{'\u2192'}</span>
                                                                <span className="text-sm text-green-400 font-bold">{c.newValue || `(tr\u1ED1ng)`}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* Add New View */}
                                                {req.type === 'add' && req.newData && (
                                                    <div className="bg-blue-900/20 rounded-xl border border-blue-500/30 overflow-hidden mb-3">
                                                        <div className="px-4 py-2 bg-blue-500/10 border-b border-blue-500/20">
                                                            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                                                                {req.relation === 'child' ? '✨ Thêm Mới Con Cái' : '✨ Thêm Mới Vợ/Chồng'}
                                                            </span>
                                                        </div>
                                                        <div className="px-4 py-3 border-b border-white/5 flex flex-col gap-2">
                                                            <div className="flex gap-3">
                                                                <span className="text-sm text-blue-300 w-28 shrink-0 font-medium">Họ và tên:</span>
                                                                <span className="text-sm text-blue-100 font-bold">{req.newData.name}</span>
                                                            </div>
                                                            {req.relation === 'child' && (
                                                                <div className="flex gap-3">
                                                                    <span className="text-sm text-blue-300 w-28 shrink-0 font-medium">Thuộc về bố/mẹ:</span>
                                                                    <span className="text-sm text-blue-100 font-bold">{req.relatedToName}</span>
                                                                </div>
                                                            )}
                                                            {req.relation === 'child' && (
                                                                <div className="flex gap-3">
                                                                    <span className="text-sm text-blue-300 w-28 shrink-0 font-medium">Giới tính:</span>
                                                                    <span className="text-sm text-blue-100 font-bold">{req.newData.gender === 'male' ? 'Nam' : 'Nữ'}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Note */}
                                                {req.note && (
                                                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mb-3">
                                                        <p className="text-sm text-blue-300">
                                                            <span className="font-bold">{'\uD83D\uDCDD Ghi ch\u00FA: '}</span>{req.note}
                                                        </p>
                                                    </div>
                                                )}

                                                {/* Legacy format support */}
                                                {!req.changes && (req as unknown as { request: string }).request && (
                                                    <p className="text-gray-300 bg-black/20 p-3 rounded-lg border border-white/5 mb-3">
                                                        {(req as unknown as { request: string }).request}
                                                    </p>
                                                )}

                                                {/* Actions */}
                                                <div className="flex gap-3">
                                                    <button onClick={() => handleApprove(req)}
                                                        className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-5 py-2.5 rounded-lg text-sm font-bold transition-colors shadow-lg">
                                                        <CheckCircle className="w-4 h-4" />
                                                        {req.changes && req.changes.length > 0 ? `Duy\u1EC7t & \u00C1p d\u1EE5ng` : `\u0110\u00E3 x\u1EED l\u00FD`}
                                                    </button>
                                                    <button onClick={() => handleReject(req.id)}
                                                        className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-gray-300 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors">
                                                        <XCircle className="w-4 h-4" /> {`B\u1ECF qua`}
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
                                            <th className="p-4 font-semibold border-b border-white/10">Công khai</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {familyDataRaw.members.slice(0, 30).map(m => {
                                            const overlay: Record<string, any> = JSON.parse(localStorage.getItem('phado_overlay') || '{}');
                                            const pub: string[] = overlay[m.id]?.publicFields ? JSON.parse(overlay[m.id].publicFields) : [];
                                            const fields = ['phone', 'facebook', 'address', 'industry'];
                                            const labels: Record<string, string> = { phone: 'SĐT', facebook: 'FB', address: 'Đ/c', industry: 'Nghề' };
                                            return (
                                                <tr key={m.id} className="hover:bg-white/5 transition-colors">
                                                    <td className="p-4 text-sm text-gray-500">{m.id}</td>
                                                    <td className="p-4 font-medium text-white">{m.name}</td>
                                                    <td className="p-4 text-gold-400">Đời {m.generation}</td>
                                                    <td className="p-4 text-gray-400">{m.spouse || '-'}</td>
                                                    <td className="p-4">
                                                        <div className="flex gap-1 flex-wrap">
                                                            {fields.map(f => (
                                                                <button key={f} onClick={() => { togglePublicField(m.id, f); window.location.reload(); }}
                                                                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold transition-colors ${pub.includes(f) ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-white/5 text-gray-500 border border-white/10'}`}>
                                                                    {pub.includes(f) ? '👁' : '🔒'} {labels[f]}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                            <div className="p-4 text-center text-sm text-gray-500 border-t border-white/10">
                                Hiển thị 30 / {familyDataRaw.totalMembers} thành viên đầu tiên.
                            </div>
                        </div>
                    )}

                    {activeTab === 'blog' && (
                        <div className="space-y-6">
                            {/* New Blog Post Form */}
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
                                <h3 className="text-lg font-bold text-gold-400">📝 Viết bài mới</h3>
                                <input type="text" value={newBlogTitle} onChange={e => setNewBlogTitle(e.target.value)} placeholder="Tiêu đề bài viết..."
                                    className="w-full bg-[#1a1a24] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-gold-500" />
                                <textarea value={newBlogContent} onChange={e => setNewBlogContent(e.target.value)} rows={5} placeholder="Nội dung bài viết..."
                                    className="w-full bg-[#1a1a24] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-gold-500 resize-none" />
                                <input type="text" value={newBlogAuthor} onChange={e => setNewBlogAuthor(e.target.value)} placeholder="Tác giả (mặc định: Admin)"
                                    className="w-full bg-[#1a1a24] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-gold-500" />
                                <button onClick={handleAddBlog} className="bg-gold-600 hover:bg-gold-500 text-black font-bold py-3 px-8 rounded-xl transition-colors">
                                    Đăng bài
                                </button>
                            </div>

                            {/* Existing Posts */}
                            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                                <div className="p-4 border-b border-white/10 bg-[#121218]">
                                    <h3 className="font-semibold text-lg">Bài viết đã đăng ({blogPosts.length})</h3>
                                </div>
                                {blogPosts.length === 0 ? (
                                    <div className="p-8 text-center text-gray-500">Chưa có bài viết nào.</div>
                                ) : (
                                    <div className="divide-y divide-white/5">
                                        {blogPosts.map(post => (
                                            <div key={post.id} className="p-4 flex justify-between items-start gap-4">
                                                <div className="flex-1">
                                                    <h4 className="text-white font-bold">{post.title}</h4>
                                                    <p className="text-sm text-gray-400 mt-1 line-clamp-2">{post.content}</p>
                                                    <span className="text-xs text-gray-500 mt-2 block">{post.date} · {post.author}</span>
                                                </div>
                                                <button onClick={() => handleDeleteBlog(post.id)} className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors shrink-0">
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
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

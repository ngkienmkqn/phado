"use client";

import React, { useState, useMemo, useCallback } from 'react';
import { Search, X, ChevronRight, Calculator } from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────
interface MemberData {
    id: string;
    name: string;
    generation: number;
    gender: string;
    spouse?: string | null;
    status?: string | null;
    parentId?: string | null;
    birthSolar?: string | null;
    [key: string]: unknown;
}

interface FamilyData {
    familyName: string;
    since: number;
    totalGenerations: number;
    totalMembers: number;
    members: MemberData[];
}

const removeDiacritics = (str: string) =>
    str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');

// ─── Person Bubble on Tree ──────────────────────────────────────────
function PersonBubble({
    member, x, y, size, isFocused, isOnRelPath, onClick, label
}: {
    member: MemberData; x: number; y: number; size: number;
    isFocused: boolean; isOnRelPath: boolean;
    onClick: (m: MemberData) => void; label?: string;
}) {
    const isFemale = member.gender === 'female';
    const shortName = member.name.length > 14 ? member.name.substring(0, 12) + '…' : member.name;

    return (
        <div
            className="absolute flex flex-col items-center cursor-pointer group"
            style={{
                left: `${x}%`,
                top: `${y}%`,
                transform: 'translate(-50%, -50%)',
                zIndex: isFocused ? 20 : 10,
            }}
            onClick={() => onClick(member)}
        >
            {/* Glow for focused or relation path */}
            {(isFocused || isOnRelPath) && (
                <div className="absolute rounded-full"
                    style={{
                        width: size + 14,
                        height: size + 14,
                        border: `3px solid ${isOnRelPath ? '#dc2626' : '#f0c040'}`,
                        boxShadow: `0 0 16px ${isOnRelPath ? 'rgba(220,38,38,0.5)' : 'rgba(240,192,64,0.5)'}`,
                        top: -7,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        animation: isFocused ? 'pulse 2s infinite' : 'none',
                    }}
                />
            )}

            {/* Circle avatar */}
            <div
                className="rounded-full flex items-center justify-center text-white font-bold shadow-lg group-hover:scale-110 transition-transform duration-200"
                style={{
                    width: size,
                    height: size,
                    backgroundColor: isFemale ? '#c27ba0' : '#795548',
                    border: `3px solid ${isFemale ? '#a0527a' : '#5c3317'}`,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3), inset 0 -2px 4px rgba(0,0,0,0.15)',
                    fontSize: size > 50 ? 18 : 13,
                }}
            >
                {isFemale ? '♀' : '♂'}
            </div>

            {/* Name ribbon */}
            <div className="mt-1 relative">
                <div
                    className="px-2 py-0.5 rounded-md text-center whitespace-nowrap shadow-md"
                    style={{
                        backgroundColor: isFemale ? '#8e3a6e' : '#4e342e',
                        color: 'white',
                        fontSize: size > 50 ? 10 : 8,
                        fontWeight: 700,
                        maxWidth: 120,
                        border: `1px solid ${isFemale ? '#a0527a' : '#6d4c41'}`,
                    }}
                >
                    {shortName}
                </div>
                {label && (
                    <div className="text-center mt-0.5" style={{ fontSize: 7, color: '#5d4037', fontWeight: 600, textShadow: '0 0 4px rgba(255,255,255,0.9)' }}>
                        {label}
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Searchable Dropdown for xưng hô ────────────────────────────────
function MemberDropdown({ value, onChange, members, placeholder }: {
    value: string; onChange: (id: string) => void; members: MemberData[]; placeholder: string;
}) {
    const [open, setOpen] = useState(false);
    const [term, setTerm] = useState('');
    const selected = members.find(m => m.id === value);
    const filtered = useMemo(() => {
        if (!term || term.length < 2) return [];
        const t = removeDiacritics(term.toLowerCase());
        return members.filter(m => removeDiacritics(m.name.toLowerCase()).includes(t)).slice(0, 8);
    }, [term, members]);

    return (
        <div className="relative">
            <div className="border border-[#d2b48c] rounded-lg py-2 px-3 text-sm bg-white cursor-pointer flex items-center justify-between"
                onClick={() => setOpen(!open)}>
                <span className={selected ? 'text-[#3e2723]' : 'text-gray-400'}>
                    {selected ? selected.name : placeholder}
                </span>
                <ChevronRight size={14} className={`text-[#d2b48c] transition-transform ${open ? 'rotate-90' : ''}`} />
            </div>
            {open && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#d2b48c] rounded-lg shadow-xl z-50 max-h-[200px] overflow-y-auto">
                    <input type="text" value={term} onChange={e => setTerm(e.target.value)} placeholder="Gõ tên..."
                        className="w-full px-3 py-2 text-sm border-b border-[#e8dcb8] focus:outline-none" autoFocus />
                    {filtered.map(m => (
                        <div key={m.id} onClick={() => { onChange(m.id); setOpen(false); setTerm(''); }}
                            className="px-3 py-2 text-sm hover:bg-[#f4efe6] cursor-pointer flex items-center gap-2">
                            <span className={`w-4 h-4 rounded-full text-[9px] text-white flex items-center justify-center
                                ${m.gender === 'female' ? 'bg-[#c27ba0]' : 'bg-[#795548]'}`}>
                                {m.gender === 'female' ? '♀' : '♂'}
                            </span>
                            <span className="truncate">{m.name}</span>
                            <span className="text-[10px] text-gray-400 ml-auto">Đ.{m.generation ?? '?'}</span>
                        </div>
                    ))}
                    {term.length >= 2 && filtered.length === 0 && (
                        <div className="px-3 py-2 text-sm text-gray-400">Không tìm thấy</div>
                    )}
                </div>
            )}
        </div>
    );
}

// ─── Relationship Calculator ─────────────────────────────────────────
function getRelationTerm(genDiff: number, dA: number, dB: number): string {
    if (genDiff === 0) return 'ANH/CHỊ/EM';
    if (genDiff > 0) {
        const isDirect = dB === 0;
        if (isDirect) {
            if (genDiff === 1) return 'CHA / MẸ';
            if (genDiff === 2) return 'ÔNG / BÀ';
            if (genDiff === 3) return 'CỤ (Cố)';
            if (genDiff === 4) return 'KỴ (Sơ)';
            return `TỔ TIÊN (cách ${genDiff} đời)`;
        } else {
            if (genDiff === 1) return 'BÁC / CHÚ / CÔ';
            if (genDiff === 2) return 'ÔNG / BÀ';
            if (genDiff === 3) return 'CỤ (Cố)';
            if (genDiff === 4) return 'KỴ (Sơ)';
            return `TIÊN TỔ (cách ${genDiff} đời)`;
        }
    }
    const absDiff = Math.abs(genDiff);
    const isDirect = dA === 0;
    if (isDirect) {
        if (absDiff === 1) return 'CON';
        if (absDiff === 2) return 'CHÁU';
        if (absDiff === 3) return 'CHẮT';
        if (absDiff === 4) return 'CHÚT';
        if (absDiff === 5) return 'CHÍT';
        return `HẬU DUỆ (cách ${absDiff} đời)`;
    }
    if (absDiff === 1) return 'CHÁU';
    if (absDiff === 2) return 'CHÁU';
    if (absDiff === 3) return 'CHẮT';
    if (absDiff === 4) return 'CHÚT';
    if (absDiff === 5) return 'CHÍT';
    return `HẬU DUỆ (cách ${absDiff} đời)`;
}

// ─── Main Component ─────────────────────────────────────────────────
export default function OrganicTreeCanvas({ data }: { data: FamilyData }) {
    const { members } = data;

    // Pick initial focus: a member who has BOTH parent AND children
    const initialFocus = useMemo(() => {
        const withFamily = members.find(m =>
            m.parentId && members.some(c => c.parentId === m.id) && m.generation && m.generation >= 5
        );
        return withFamily?.id || members.find(m => m.parentId)?.id || members[0]?.id || '';
    }, [members]);

    const [focusId, setFocusId] = useState(initialFocus);
    const [searchTerm, setSearchTerm] = useState('');
    const [detailMember, setDetailMember] = useState<MemberData | null>(null);
    const [showCalc, setShowCalc] = useState(false);
    const [calcA, setCalcA] = useState('');
    const [calcB, setCalcB] = useState('');

    // ─── Build focused subset ────────────────────────────────────────
    const { subset, positions } = useMemo(() => {
        const focused = members.find(m => m.id === focusId);
        if (!focused) return { subset: [], positions: {} };

        const sub: MemberData[] = [];
        const pos: Record<string, { x: number; y: number; size: number; label?: string }> = {};

        // Gather family
        const parent = focused.parentId ? members.find(m => m.id === focused.parentId) : undefined;
        const grandparent = parent?.parentId ? members.find(m => m.id === parent.parentId) : undefined;
        const siblings = focused.parentId
            ? members.filter(m => m.parentId === focused.parentId && m.id !== focusId).slice(0, 4)
            : [];
        const children = members.filter(m => m.parentId === focusId).slice(0, 6);

        // ── Position layout (% of container) ──
        // Top = ancestor, center = focused, bottom = children

        // Grandparent
        if (grandparent) {
            sub.push(grandparent);
            pos[grandparent.id] = { x: 50, y: 15, size: 46, label: `Đời ${grandparent.generation ?? '?'}` };
        }

        // Parent
        if (parent) {
            sub.push(parent);
            pos[parent.id] = { x: 50, y: grandparent ? 30 : 18, size: 52, label: `Đời ${parent.generation ?? '?'}` };
        }

        // Focused person — center
        const baseY = parent ? (grandparent ? 48 : 40) : 30;
        sub.push(focused);
        pos[focused.id] = { x: 50, y: baseY, size: 60, label: `Đời ${focused.generation ?? '?'} ★` };

        // Siblings — left and right of focused (stay within tree: 32%-68%)
        siblings.forEach((s, i) => {
            sub.push(s);
            const isLeft = i % 2 === 0;
            const tier = Math.floor(i / 2);
            pos[s.id] = {
                x: isLeft ? 36 - tier * 4 : 64 + tier * 4,
                y: baseY + tier * 5 + 2,
                size: 42,
                label: `Đời ${s.generation ?? '?'}`,
            };
        });

        // Children — bottom, spread within tree width (34%-66%)
        const childY = baseY + 18;
        if (children.length <= 3) {
            const positions_x = children.length === 1 ? [50] : children.length === 2 ? [42, 58] : [35, 50, 65];
            children.forEach((c, i) => {
                sub.push(c);
                pos[c.id] = { x: positions_x[i], y: childY, size: 44, label: `Đời ${c.generation ?? '?'}` };
            });
        } else {
            const totalW = Math.min(30, children.length * 8);
            const startX = 50 - totalW / 2;
            const step = children.length > 1 ? totalW / (children.length - 1) : 0;
            children.forEach((c, i) => {
                sub.push(c);
                pos[c.id] = { x: startX + i * step, y: childY + (i % 2 === 0 ? 0 : 4), size: 38, label: `Đời ${c.generation ?? '?'}` };
            });
        }

        return { subset: sub, positions: pos };
    }, [focusId, members]);

    // ─── Relationship path (for xưng hô highlighting) ────────────────
    const { relationResult, relationPath } = useMemo(() => {
        if (!calcA || !calcB || calcA === calcB) return { relationResult: null, relationPath: new Set<string>() };

        const resolveToBloodline = (memberId: string): string => {
            const person = members.find(m => m.id === memberId);
            if (!person) return memberId;
            if (person.parentId) return memberId;
            const partner = members.find(m => m.spouse === person.name);
            if (partner) return partner.id;
            return memberId;
        };

        const resolvedA = resolveToBloodline(calcA);
        const resolvedB = resolveToBloodline(calcB);

        const pathA: MemberData[] = [];
        let currA = members.find(m => m.id === resolvedA);
        while (currA) { pathA.push(currA); currA = currA.parentId ? members.find(m => m.id === currA?.parentId) : undefined; }

        const pathB: MemberData[] = [];
        let currB = members.find(m => m.id === resolvedB);
        while (currB) { pathB.push(currB); currB = currB.parentId ? members.find(m => m.id === currB?.parentId) : undefined; }

        let lcaA = -1, lcaB = -1;
        for (let i = 0; i < pathA.length; i++) {
            const found = pathB.findIndex(m => m.id === pathA[i].id);
            if (found !== -1) { lcaA = i; lcaB = found; break; }
        }

        if (lcaA === -1) return { relationResult: 'Không tìm thấy quan hệ trong dữ liệu', relationPath: new Set<string>() };

        const pIds = new Set<string>();
        for (let i = 0; i <= lcaA; i++) pIds.add(pathA[i].id);
        for (let i = 0; i <= lcaB; i++) pIds.add(pathB[i].id);
        pIds.add(calcA); pIds.add(calcB);

        const personA = members.find(m => m.id === calcA) || pathA[0];
        const personB = members.find(m => m.id === calcB) || pathB[0];
        const diff = (pathA[0]?.generation ?? 0) - (pathB[0]?.generation ?? 0);

        const termAB = getRelationTerm(diff, lcaA, lcaB);
        const termBA = getRelationTerm(-diff, lcaB, lcaA);

        const result = `🔴 ${personA.name} gọi ${personB.name} là ${termAB}\n🔵 ${personB.name} gọi ${personA.name} là ${termBA}`;

        return { relationResult: result, relationPath: pIds };
    }, [calcA, calcB, members]);

    // ─── Search ──────────────────────────────────────────────────────
    const searchResults = useMemo(() => {
        if (!searchTerm || searchTerm.length < 2) return [];
        const term = removeDiacritics(searchTerm.toLowerCase());
        return members.filter(m => removeDiacritics(m.name.toLowerCase()).includes(term)).slice(0, 8);
    }, [searchTerm, members]);

    const handleClickMember = useCallback((m: MemberData) => {
        setDetailMember(m);
    }, []);

    const navigateToMember = useCallback((id: string) => {
        setFocusId(id);
        setDetailMember(null);
        setSearchTerm('');
    }, []);

    // ─── Render ──────────────────────────────────────────────────────
    return (
        <div className="w-full h-full relative overflow-hidden bg-[#f5f0e1]">
            {/* Tree background */}
            <div className="absolute inset-0 flex items-center justify-center">
                <img src="/tree_bg.png" alt="Family Tree" className="w-full h-full object-contain opacity-75" draggable={false} />
            </div>

            {/* Members on tree */}
            <div className="absolute inset-0">
                {subset.map(m => {
                    const p = positions[m.id];
                    if (!p) return null;
                    return (
                        <PersonBubble key={m.id} member={m} x={p.x} y={p.y} size={p.size}
                            isFocused={m.id === focusId}
                            isOnRelPath={relationPath.has(m.id)}
                            onClick={handleClickMember}
                            label={p.label}
                        />
                    );
                })}
            </div>

            {/* Title */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30">
                <div className="bg-[#4e342e]/90 backdrop-blur-sm text-white px-5 py-1.5 rounded-xl shadow-lg border border-[#8d6e63]">
                    <h1 className="font-serif font-bold text-sm sm:text-base text-center">🌳 Phả Đồ Họ {data.familyName}</h1>
                </div>
            </div>

            {/* Left Panel: Search + Xưng hô */}
            <div className="absolute top-14 left-3 z-30 w-[250px] sm:w-[280px] space-y-3">
                {/* Search */}
                <div className="bg-white/92 backdrop-blur-md border border-[#d2b48c] rounded-2xl shadow-xl p-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#8b5a2b]" />
                        <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                            placeholder="Tìm thành viên..." className="w-full pl-9 pr-8 py-2 border border-[#d2b48c] rounded-xl text-sm bg-white focus:outline-none focus:border-[#8b5a2b]" />
                        {searchTerm && (
                            <button onClick={() => setSearchTerm('')} className="absolute right-2 top-2 p-0.5 hover:bg-gray-100 rounded-full">
                                <X size={16} className="text-gray-400" />
                            </button>
                        )}
                    </div>
                    {searchResults.length > 0 && (
                        <div className="mt-2 max-h-[150px] overflow-y-auto border border-[#e8dcb8] rounded-xl bg-white">
                            {searchResults.map(m => (
                                <div key={m.id} onClick={() => navigateToMember(m.id)}
                                    className="px-3 py-1.5 hover:bg-[#8b5a2b]/10 cursor-pointer border-b border-[#e8dcb8] last:border-0 flex items-center gap-2">
                                    <span className={`w-4 h-4 rounded-full text-[9px] text-white flex items-center justify-center shrink-0
                                        ${m.gender === 'female' ? 'bg-[#c27ba0]' : 'bg-[#795548]'}`}>
                                        {m.gender === 'female' ? '♀' : '♂'}
                                    </span>
                                    <span className="text-sm font-bold text-[#3e2723] truncate flex-1">{m.name}</span>
                                    <span className="text-[9px] text-[#8b5a2b]">Đ.{m.generation ?? '?'}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Xưng hô toggle */}
                <button onClick={() => setShowCalc(!showCalc)}
                    className="w-full bg-white/92 backdrop-blur-md border border-[#d2b48c] rounded-xl shadow-lg p-2.5 flex items-center justify-center gap-2 text-sm font-bold text-[#5c4033] hover:bg-[#f4efe6] transition-colors">
                    <Calculator size={16} /> Phép tính xưng hô
                </button>

                {/* Xưng hô calculator */}
                {showCalc && (
                    <div className="bg-white/95 backdrop-blur-md border border-[#d2b48c] rounded-2xl shadow-xl p-3 space-y-2">
                        <div>
                            <label className="text-[10px] font-bold text-[#8b5a2b] uppercase block mb-1">Người A</label>
                            <MemberDropdown value={calcA} onChange={setCalcA} members={members} placeholder="-- Chọn người A --" />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-[#8b5a2b] uppercase block mb-1">Người B</label>
                            <MemberDropdown value={calcB} onChange={setCalcB} members={members} placeholder="-- Chọn người B --" />
                        </div>
                        {relationResult && (
                            <div className="mt-2 space-y-1.5">
                                {relationResult.split('\n').map((line, i) => (
                                    <div key={i} className={`text-xs font-bold px-3 py-2 rounded-lg text-center
                                        ${i === 0 ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-blue-50 border border-blue-200 text-blue-700'}`}>
                                        {line}
                                    </div>
                                ))}
                            </div>
                        )}
                        {(calcA || calcB) && (
                            <button onClick={() => { setCalcA(''); setCalcB(''); }}
                                className="w-full py-1.5 text-xs font-bold text-gray-500 bg-gray-50 rounded-lg hover:bg-gray-100 border border-gray-200">
                                ✕ Xóa
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Back button */}
            <div className="absolute top-14 right-3 z-30">
                <a href="/tree" className="bg-[#4e342e] hover:bg-[#3e2723] text-white px-3 py-2 rounded-xl text-xs font-bold shadow-lg transition-colors">
                    ← Cây chính
                </a>
            </div>

            {/* Hint */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30">
                <span className="bg-white/80 backdrop-blur-sm text-[#5d4037] text-[10px] font-bold px-4 py-1.5 rounded-full shadow border border-[#d2b48c]">
                    Bấm vào người để xem chi tiết · Bấm &quot;Đặt làm gốc&quot; để chuyển nhánh
                </span>
            </div>

            {/* Detail popup */}
            {detailMember && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setDetailMember(null)}>
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
                    <div className="relative bg-[#fdfbf7] border-2 border-[#d2b48c] rounded-2xl shadow-2xl max-w-sm w-full p-5"
                        onClick={e => e.stopPropagation()}>
                        <button onClick={() => setDetailMember(null)} className="absolute top-3 right-3 p-1 hover:bg-gray-100 rounded-full">
                            <X size={20} className="text-[#8b5a2b]" />
                        </button>

                        <div className="flex items-center gap-3 mb-4">
                            <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg
                                ${detailMember.gender === 'female' ? 'bg-[#c27ba0]' : 'bg-[#795548]'}`}>
                                {detailMember.gender === 'female' ? '♀' : '♂'}
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-[#3e2723] font-serif">{detailMember.name}</h3>
                                <p className="text-xs text-[#8b5a2b]">
                                    Đời {detailMember.generation ?? '?'} • {detailMember.gender === 'female' ? 'Nữ' : 'Nam'}
                                    {detailMember.status ? ` • ${detailMember.status}` : ''}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-2 text-sm mb-4">
                            {detailMember.spouse && (
                                <div className="flex gap-2 p-2 bg-[#f4efe6] rounded-lg">
                                    <span className="text-[#8b5a2b] font-bold">{detailMember.gender === 'female' ? 'Chồng:' : 'Vợ:'}</span>
                                    <span className="text-[#3e2723]">{detailMember.spouse}</span>
                                </div>
                            )}
                            {detailMember.birthSolar && (
                                <div className="flex gap-2 p-2 bg-[#f4efe6] rounded-lg">
                                    <span className="text-[#8b5a2b] font-bold">Sinh:</span>
                                    <span className="text-[#3e2723]">{detailMember.birthSolar}</span>
                                </div>
                            )}
                            {(() => {
                                const par = members.find(m => m.id === detailMember.parentId);
                                return par ? (
                                    <div className="flex gap-2 p-2 bg-[#f4efe6] rounded-lg">
                                        <span className="text-[#8b5a2b] font-bold">Cha:</span>
                                        <span className="text-[#3e2723] underline cursor-pointer" onClick={() => navigateToMember(par.id)}>{par.name}</span>
                                    </div>
                                ) : null;
                            })()}
                            {(() => {
                                const kids = members.filter(m => m.parentId === detailMember.id);
                                return kids.length > 0 ? (
                                    <div className="p-2 bg-[#f4efe6] rounded-lg">
                                        <span className="text-[#8b5a2b] font-bold block mb-1">Con ({kids.length}):</span>
                                        <div className="flex flex-wrap gap-1">
                                            {kids.slice(0, 10).map(c => (
                                                <span key={c.id} className={`text-xs px-2 py-0.5 rounded-full text-white cursor-pointer hover:opacity-80
                                                    ${c.gender === 'female' ? 'bg-[#c27ba0]' : 'bg-[#795548]'}`}
                                                    onClick={() => navigateToMember(c.id)}>
                                                    {c.name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ) : null;
                            })()}
                        </div>

                        {detailMember.id !== focusId && (
                            <button onClick={() => navigateToMember(detailMember.id)}
                                className="w-full py-2.5 bg-[#4e342e] hover:bg-[#3e2723] text-white rounded-xl font-bold text-sm shadow-md transition-colors">
                                🌳 Đặt làm gốc cây
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Pulse animation */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
            ` }} />
        </div>
    );
}

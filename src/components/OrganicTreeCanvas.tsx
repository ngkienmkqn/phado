"use client";

import React, { useState, useMemo, useCallback } from 'react';
import { Search, X, ChevronRight } from 'lucide-react';

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

// ─── Person Circle on Tree ──────────────────────────────────────────
function PersonBubble({
    member, x, y, size, isFocused, onClick
}: {
    member: MemberData; x: number; y: number; size: number;
    isFocused: boolean; onClick: (m: MemberData) => void;
}) {
    const isFemale = member.gender === 'female';
    const borderColor = isFocused ? '#d4a017' : isFemale ? '#a0527a' : '#5c3317';
    const bgColor = isFemale ? '#f3e5f5' : '#efebe9';
    const shortName = member.name.length > 12 ? member.name.substring(0, 10) + '…' : member.name;

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
            {/* Glow ring for focused */}
            {isFocused && (
                <div className="absolute rounded-full animate-pulse"
                    style={{
                        width: size + 16,
                        height: size + 16,
                        border: '3px solid #f0c040',
                        boxShadow: '0 0 20px rgba(240,192,64,0.5)',
                        top: -8,
                        left: '50%',
                        transform: 'translateX(-50%)',
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
                    border: `3px solid ${borderColor}`,
                    boxShadow: `0 4px 12px rgba(0,0,0,0.3), inset 0 -2px 4px rgba(0,0,0,0.15)`,
                    fontSize: size > 50 ? 20 : 14,
                }}
            >
                {isFemale ? '♀' : '♂'}
            </div>

            {/* Name ribbon/banner below */}
            <div className="mt-1 relative">
                <div
                    className="px-2 py-0.5 rounded-md text-center whitespace-nowrap shadow-md"
                    style={{
                        backgroundColor: isFemale ? '#8e3a6e' : '#4e342e',
                        color: 'white',
                        fontSize: size > 50 ? 11 : 9,
                        fontWeight: 700,
                        maxWidth: 130,
                        border: `1px solid ${isFemale ? '#a0527a' : '#6d4c41'}`,
                    }}
                >
                    {shortName}
                </div>
                <div className="text-center mt-0.5"
                    style={{
                        fontSize: 8,
                        color: '#5d4037',
                        fontWeight: 600,
                        textShadow: '0 0 4px rgba(255,255,255,0.8)',
                    }}>
                    Đời {member.generation ?? '?'}
                    {member.status === 'Đã mất' ? ' ✝' : ''}
                </div>
            </div>
        </div>
    );
}

// ─── Main Component ─────────────────────────────────────────────────
export default function OrganicTreeCanvas({ data }: { data: FamilyData }) {
    const { members } = data;

    const [focusId, setFocusId] = useState(members.find(m => m.parentId && m.generation && m.generation <= 10)?.id || members[0]?.id || '');
    const [searchTerm, setSearchTerm] = useState('');
    const [detailMember, setDetailMember] = useState<MemberData | null>(null);

    // ─── Build focused subset: grandparent → parent → focused → children ──
    const { subset, positions } = useMemo(() => {
        const focused = members.find(m => m.id === focusId);
        if (!focused) return { subset: [], positions: {} };

        const sub: MemberData[] = [];
        const pos: Record<string, { x: number; y: number; size: number }> = {};

        // Grandparent (if exists)
        let grandparent: MemberData | undefined;
        const parent = focused.parentId ? members.find(m => m.id === focused.parentId) : undefined;
        if (parent?.parentId) {
            grandparent = members.find(m => m.id === parent.parentId);
        }

        // Siblings (same parent)
        const siblings = focused.parentId
            ? members.filter(m => m.parentId === focused.parentId && m.id !== focusId)
            : [];

        // Children
        const children = members.filter(m => m.parentId === focusId);

        // ── Position layout (percentage-based to overlay on tree image) ──
        // Tree structure: grandparent at top center, parent below, focused in middle,
        // siblings on sides, children at bottom

        // Grandparent — top of tree (crown)
        if (grandparent) {
            sub.push(grandparent);
            pos[grandparent.id] = { x: 50, y: 12, size: 56 };
        }

        // Parent — upper middle
        if (parent) {
            sub.push(parent);
            pos[parent.id] = { x: 50, y: grandparent ? 28 : 15, size: 60 };
        }

        // Focused person — center
        sub.push(focused);
        const focusY = parent ? (grandparent ? 46 : 38) : 25;
        pos[focused.id] = { x: 50, y: focusY, size: 68 };

        // Siblings — spread on left and right of focused person
        const maxSiblings = 6; // show max 6 siblings
        const visibleSiblings = siblings.slice(0, maxSiblings);
        visibleSiblings.forEach((s, i) => {
            sub.push(s);
            const isLeft = i % 2 === 0;
            const tier = Math.floor(i / 2);
            const xOffset = 18 + tier * 12;
            pos[s.id] = {
                x: isLeft ? 50 - xOffset : 50 + xOffset,
                y: focusY + (tier * 3) - 2,
                size: 48,
            };
        });

        // Children — bottom of tree, spread horizontally
        const maxChildren = 8;
        const visibleChildren = children.slice(0, maxChildren);
        const childY = focusY + 20;
        if (visibleChildren.length === 1) {
            sub.push(visibleChildren[0]);
            pos[visibleChildren[0].id] = { x: 50, y: childY, size: 50 };
        } else {
            const totalWidth = Math.min(70, visibleChildren.length * 14);
            const startX = 50 - totalWidth / 2;
            const step = visibleChildren.length > 1 ? totalWidth / (visibleChildren.length - 1) : 0;
            visibleChildren.forEach((c, i) => {
                sub.push(c);
                pos[c.id] = {
                    x: startX + i * step,
                    y: childY + (i % 2 === 0 ? 0 : 5),
                    size: 46,
                };
            });
        }

        return { subset: sub, positions: pos };
    }, [focusId, members]);

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
            {/* Tree background image */}
            <div className="absolute inset-0 flex items-center justify-center">
                <img
                    src="/tree_bg.png"
                    alt="Family Tree"
                    className="w-full h-full object-contain opacity-80"
                    draggable={false}
                />
            </div>

            {/* Members positioned on the tree */}
            <div className="absolute inset-0">
                {subset.map(m => {
                    const p = positions[m.id];
                    if (!p) return null;
                    return (
                        <PersonBubble
                            key={m.id}
                            member={m}
                            x={p.x}
                            y={p.y}
                            size={p.size}
                            isFocused={m.id === focusId}
                            onClick={handleClickMember}
                        />
                    );
                })}
            </div>

            {/* Title banner */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30">
                <div className="bg-[#4e342e]/90 backdrop-blur-sm text-white px-6 py-2 rounded-xl shadow-lg border border-[#8d6e63]">
                    <h1 className="font-serif font-bold text-base sm:text-lg text-center">
                        🌳 Phả Đồ Họ {data.familyName}
                    </h1>
                </div>
            </div>

            {/* Search Panel */}
            <div className="absolute top-16 left-3 sm:left-4 z-30 w-[240px] sm:w-[270px]">
                <div className="bg-white/90 backdrop-blur-md border border-[#d2b48c] rounded-2xl shadow-xl p-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#8b5a2b]" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            placeholder="Tìm thành viên..."
                            className="w-full pl-9 pr-8 py-2 border border-[#d2b48c] rounded-xl text-sm bg-white focus:outline-none focus:border-[#8b5a2b]"
                        />
                        {searchTerm && (
                            <button onClick={() => setSearchTerm('')}
                                className="absolute right-2 top-2 p-0.5 hover:bg-gray-100 rounded-full">
                                <X size={16} className="text-gray-400" />
                            </button>
                        )}
                    </div>

                    {searchResults.length > 0 && (
                        <div className="mt-2 max-h-[180px] overflow-y-auto border border-[#e8dcb8] rounded-xl bg-white">
                            {searchResults.map(m => (
                                <div key={m.id}
                                    onClick={() => navigateToMember(m.id)}
                                    className="px-3 py-2 hover:bg-[#8b5a2b]/10 cursor-pointer border-b border-[#e8dcb8] last:border-0 flex items-center gap-2">
                                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-white shrink-0
                                        ${m.gender === 'female' ? 'bg-[#c27ba0]' : 'bg-[#795548]'}`}>
                                        {m.gender === 'female' ? '♀' : '♂'}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-bold text-[#3e2723] truncate">{m.name}</div>
                                        <div className="text-[10px] text-[#8b5a2b]">Đời {m.generation ?? '?'}</div>
                                    </div>
                                    <ChevronRight size={14} className="text-[#d2b48c] shrink-0" />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Back button */}
            <div className="absolute top-16 right-3 sm:right-4 z-30">
                <a href="/tree" className="bg-[#4e342e] hover:bg-[#3e2723] text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg transition-colors">
                    ← Cây chính
                </a>
            </div>

            {/* Hint */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 text-center">
                <span className="bg-white/80 backdrop-blur-sm text-[#5d4037] text-xs font-bold px-4 py-2 rounded-full shadow border border-[#d2b48c]">
                    Bấm vào tên để xem chi tiết · Bấm &quot;Đặt làm gốc&quot; để chuyển nhánh
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

                        {/* Header */}
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

                        {/* Info */}
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
                                        <span className="text-[#3e2723] underline cursor-pointer hover:text-[#8b5a2b]"
                                            onClick={() => navigateToMember(par.id)}>{par.name}</span>
                                    </div>
                                ) : null;
                            })()}
                            {(() => {
                                const kids = members.filter(m => m.parentId === detailMember.id);
                                return kids.length > 0 ? (
                                    <div className="p-2 bg-[#f4efe6] rounded-lg">
                                        <span className="text-[#8b5a2b] font-bold block mb-1">Con ({kids.length}):</span>
                                        <div className="flex flex-wrap gap-1">
                                            {kids.map(c => (
                                                <span key={c.id}
                                                    className={`text-xs px-2 py-0.5 rounded-full text-white cursor-pointer hover:opacity-80
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

                        {/* Navigate button */}
                        {detailMember.id !== focusId && (
                            <button
                                onClick={() => navigateToMember(detailMember.id)}
                                className="w-full py-2.5 bg-[#4e342e] hover:bg-[#3e2723] text-white rounded-xl font-bold text-sm shadow-md transition-colors">
                                🌳 Đặt làm gốc cây
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

"use client";

import React, { useState, useMemo, useRef, useCallback } from 'react';
import { Search, X, ZoomIn, ZoomOut, Home, ChevronRight } from 'lucide-react';

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

// ─── Helper: Remove diacritics ───────────────────────────────────────
const removeDiacritics = (str: string) =>
    str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');

// ─── Layout constants ────────────────────────────────────────────────
const NODE_W = 160;
const NODE_H = 36;
const H_GAP = 24;
const V_GAP = 100;
const PADDING_X = 80;
const PADDING_TOP = 100;
const PADDING_BOTTOM = 200;

// ─── Leaf SVG decoration ────────────────────────────────────────────
function LeafDecoration({ x, y, rotate, scale = 1 }: { x: number; y: number; rotate: number; scale?: number }) {
    return (
        <g transform={`translate(${x},${y}) rotate(${rotate}) scale(${scale})`} opacity={0.6}>
            <path d="M0,0 C4,-12 16,-16 20,-24 C16,-14 6,-8 0,0Z" fill="#6b8e44" />
            <path d="M0,0 C-4,-12 -16,-16 -20,-24 C-16,-14 -6,-8 0,0Z" fill="#7da04e" />
        </g>
    );
}

// ─── Organic Branch Path ─────────────────────────────────────────────
function BranchPath({ x1, y1, x2, y2, highlight }: { x1: number; y1: number; x2: number; y2: number; highlight?: boolean }) {
    // Create organic-looking bezier curve
    const midY = (y1 + y2) / 2;
    const d = `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`;

    return (
        <>
            {/* Shadow */}
            <path d={d} fill="none" stroke="rgba(90,55,25,0.15)" strokeWidth={highlight ? 7 : 5} strokeLinecap="round" />
            {/* Main branch */}
            <path d={d} fill="none" stroke={highlight ? '#c0392b' : '#6d4c2a'}
                strokeWidth={highlight ? 5 : 3} strokeLinecap="round"
                style={{ filter: 'url(#branchTexture)' }}
            />
        </>
    );
}

// ─── Member Pill/Tag Node ───────────────────────────────────────────
function MemberNode({
    member, x, y, isFocused, isOnPath, onClick
}: {
    member: MemberData; x: number; y: number;
    isFocused: boolean; isOnPath: boolean;
    onClick: (m: MemberData) => void;
}) {
    const isFemale = member.gender === 'female';
    const bgColor = isFocused ? '#d4a017' : isOnPath ? '#c0392b' : isFemale ? '#8e3a6e' : '#5c3317';
    const borderColor = isFocused ? '#f0c040' : isOnPath ? '#e74c3c' : isFemale ? '#a04e7a' : '#7a4a2a';

    // Truncate name for display
    const displayName = member.name.length > 18 ? member.name.substring(0, 16) + '…' : member.name;

    return (
        <g className="cursor-pointer" onClick={() => onClick(member)}
            style={{ transition: 'transform 0.2s' }}>
            {/* Glow for focused */}
            {(isFocused || isOnPath) && (
                <rect x={x - NODE_W / 2 - 3} y={y - NODE_H / 2 - 3}
                    width={NODE_W + 6} height={NODE_H + 6} rx={NODE_H / 2 + 3}
                    fill="none" stroke={isFocused ? '#f0c040' : '#e74c3c'} strokeWidth={2} opacity={0.5}
                />
            )}
            {/* Pill shape */}
            <rect x={x - NODE_W / 2} y={y - NODE_H / 2}
                width={NODE_W} height={NODE_H} rx={NODE_H / 2}
                fill={bgColor} stroke={borderColor} strokeWidth={1.5}
                style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}
            />
            {/* Gender icon */}
            <text x={x - NODE_W / 2 + 14} y={y + 1}
                textAnchor="middle" dominantBaseline="middle"
                fontSize={12} fill="white" opacity={0.8}>
                {isFemale ? '♀' : '♂'}
            </text>
            {/* Name */}
            <text x={x + 4} y={y - 2}
                textAnchor="middle" dominantBaseline="middle"
                fontSize={11} fontWeight="bold" fill="white"
                fontFamily="'Segoe UI', system-ui, sans-serif">
                {displayName}
            </text>
            {/* Generation */}
            <text x={x + 4} y={y + 11}
                textAnchor="middle" dominantBaseline="middle"
                fontSize={8} fill="rgba(255,255,255,0.7)"
                fontFamily="'Segoe UI', system-ui, sans-serif">
                Đời {member.generation ?? '?'}{member.status === 'Đã mất' ? ' • ✝' : ''}
            </text>
        </g>
    );
}

// ─── Detail Popup ───────────────────────────────────────────────────
function DetailPopup({ member, onClose, allMembers }: { member: MemberData; onClose: () => void; allMembers: MemberData[] }) {
    const parent = allMembers.find(m => m.id === member.parentId);
    const children = allMembers.filter(m => m.parentId === member.id);
    const isFemale = member.gender === 'female';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <div className="relative bg-[#fdfbf7] border-2 border-[#d2b48c] rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-[fadeIn_0.2s]"
                onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-3 right-3 p-1 hover:bg-gray-100 rounded-full">
                    <X size={20} className="text-[#8b5a2b]" />
                </button>

                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold
                        ${isFemale ? 'bg-[#8e3a6e]' : 'bg-[#5c3317]'}`}>
                        {isFemale ? '♀' : '♂'}
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-[#3e2723] font-serif">{member.name}</h3>
                        <p className="text-xs text-[#8b5a2b]">
                            Đời thứ {member.generation ?? '?'} • {isFemale ? 'Nữ' : 'Nam'}
                            {member.status ? ` • ${member.status}` : ''}
                        </p>
                    </div>
                </div>

                {/* Info grid */}
                <div className="space-y-2 text-sm">
                    {member.spouse && (
                        <div className="flex gap-2 p-2 bg-[#f4efe6] rounded-lg">
                            <span className="text-[#8b5a2b] font-bold whitespace-nowrap">{isFemale ? 'Chồng:' : 'Vợ:'}</span>
                            <span className="text-[#3e2723]">{member.spouse}</span>
                        </div>
                    )}
                    {member.birthSolar && (
                        <div className="flex gap-2 p-2 bg-[#f4efe6] rounded-lg">
                            <span className="text-[#8b5a2b] font-bold">Sinh:</span>
                            <span className="text-[#3e2723]">{member.birthSolar}</span>
                        </div>
                    )}
                    {parent && (
                        <div className="flex gap-2 p-2 bg-[#f4efe6] rounded-lg">
                            <span className="text-[#8b5a2b] font-bold">Cha:</span>
                            <span className="text-[#3e2723]">{parent.name}</span>
                        </div>
                    )}
                    {children.length > 0 && (
                        <div className="p-2 bg-[#f4efe6] rounded-lg">
                            <span className="text-[#8b5a2b] font-bold block mb-1">Con ({children.length}):</span>
                            <div className="flex flex-wrap gap-1">
                                {children.map(c => (
                                    <span key={c.id} className={`text-xs px-2 py-0.5 rounded-full text-white
                                        ${c.gender === 'female' ? 'bg-[#8e3a6e]' : 'bg-[#5c3317]'}`}>
                                        {c.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── Main Component ─────────────────────────────────────────────────
export default function OrganicTreeCanvas({ data }: { data: FamilyData }) {
    const { members } = data;
    const containerRef = useRef<HTMLDivElement>(null);

    // State
    const [zoom, setZoom] = useState(0.5);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);
    const [panStart, setPanStart] = useState({ x: 0, y: 0 });
    const [searchTerm, setSearchTerm] = useState('');
    const [focusId, setFocusId] = useState<string | null>(null);
    const [detailMember, setDetailMember] = useState<MemberData | null>(null);

    // ─── Layout: compute x,y for each member ────────────────────────
    const { positions, treeWidth, treeHeight, edges } = useMemo(() => {
        const pos: Record<string, { x: number; y: number }> = {};
        const edgeList: { from: string; to: string }[] = [];

        // Group members by generation
        const genMap: Record<number, MemberData[]> = {};
        let maxGen = 0;
        for (const m of members) {
            const gen = m.generation ?? 0;
            if (!genMap[gen]) genMap[gen] = [];
            genMap[gen].push(m);
            if (gen > maxGen) maxGen = gen;
        }

        // For the organic tree: root at bottom, branches going up
        // So generation 0 = bottom, maxGen = top
        // This creates a "tree growing upward" effect

        let maxX = 0;

        // Position each generation layer
        for (let gen = 0; gen <= maxGen; gen++) {
            const genMembers = genMap[gen] || [];
            const startX = PADDING_X;

            genMembers.forEach((m, i) => {
                const x = startX + i * (NODE_W + H_GAP) + NODE_W / 2;
                // Invert Y: gen 0 at bottom, higher gens go up
                const y = PADDING_TOP + (maxGen - gen) * V_GAP + NODE_H / 2;
                pos[m.id] = { x, y };
                if (x + NODE_W / 2 > maxX) maxX = x + NODE_W / 2;
            });
        }

        // Build edges
        for (const m of members) {
            if (m.parentId && pos[m.id] && pos[m.parentId]) {
                edgeList.push({ from: m.parentId, to: m.id });
            }
        }

        const tw = maxX + PADDING_X;
        const th = PADDING_TOP + (maxGen + 1) * V_GAP + PADDING_BOTTOM;

        return { positions: pos, treeWidth: tw, treeHeight: th, edges: edgeList };
    }, [members]);

    // ─── Focus path: ancestor chain from focused member to root ──────
    const focusPath = useMemo(() => {
        if (!focusId) return new Set<string>();
        const path = new Set<string>();
        let curr = members.find(m => m.id === focusId);
        while (curr) {
            path.add(curr.id);
            curr = curr.parentId ? members.find(m => m.id === curr?.parentId) : undefined;
        }
        return path;
    }, [focusId, members]);

    // ─── Search results ──────────────────────────────────────────────
    const searchResults = useMemo(() => {
        if (!searchTerm || searchTerm.length < 2) return [];
        const term = removeDiacritics(searchTerm.toLowerCase());
        return members.filter(m => removeDiacritics(m.name.toLowerCase()).includes(term)).slice(0, 10);
    }, [searchTerm, members]);

    // ─── Leaf positions (decorative, precomputed) ────────────────────
    const leaves = useMemo(() => {
        const result: { x: number; y: number; r: number; s: number }[] = [];
        // Add leaves along some edges
        for (let i = 0; i < edges.length; i += 3) {
            const e = edges[i];
            const p1 = positions[e.from];
            const p2 = positions[e.to];
            if (!p1 || !p2) continue;
            const mx = (p1.x + p2.x) / 2 + (Math.random() - 0.5) * 30;
            const my = (p1.y + p2.y) / 2 + (Math.random() - 0.5) * 20;
            result.push({ x: mx, y: my, r: Math.random() * 360, s: 0.6 + Math.random() * 0.4 });
        }
        return result;
    }, [edges, positions]);

    // ─── Zoom/Pan handlers ───────────────────────────────────────────
    const handleWheel = useCallback((e: React.WheelEvent) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.05 : 0.05;
        setZoom(z => Math.max(0.1, Math.min(2, z + delta)));
    }, []);

    const handlePointerDown = useCallback((e: React.PointerEvent) => {
        if (e.button !== 0) return;
        setIsPanning(true);
        setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }, [pan]);

    const handlePointerMove = useCallback((e: React.PointerEvent) => {
        if (!isPanning) return;
        setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
    }, [isPanning, panStart]);

    const handlePointerUp = useCallback(() => {
        setIsPanning(false);
    }, []);

    const resetView = useCallback(() => {
        setZoom(0.5);
        setPan({ x: 0, y: 0 });
    }, []);

    const handleFocusMember = useCallback((m: MemberData) => {
        setFocusId(m.id);
        setSearchTerm('');
        // Center on the member
        const p = positions[m.id];
        if (p && containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            setPan({
                x: rect.width / 2 - p.x * zoom,
                y: rect.height / 2 - p.y * zoom
            });
        }
    }, [positions, zoom]);

    // ─── Render ──────────────────────────────────────────────────────
    return (
        <div className="w-full h-full relative overflow-hidden bg-linear-to-b from-[#e8e0d0] via-[#f0ebe0] to-[#d4c9a8]"
            ref={containerRef}>

            {/* SVG Tree */}
            <div
                className="w-full h-full"
                onWheel={handleWheel}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
                style={{
                    cursor: isPanning ? 'grabbing' : 'grab',
                    touchAction: 'none'
                }}
            >
                <svg
                    width={treeWidth}
                    height={treeHeight}
                    viewBox={`0 0 ${treeWidth} ${treeHeight}`}
                    style={{
                        transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                        transformOrigin: '0 0',
                        transition: isPanning ? 'none' : 'transform 0.15s ease-out'
                    }}
                >
                    {/* SVG Filters */}
                    <defs>
                        <filter id="branchTexture">
                            <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" result="noise" />
                            <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" />
                        </filter>
                        <radialGradient id="trunkGrad" cx="50%" cy="100%">
                            <stop offset="0%" stopColor="#5a3720" />
                            <stop offset="100%" stopColor="#3d2510" />
                        </radialGradient>
                        <linearGradient id="titleBanner" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#8b6914" />
                            <stop offset="50%" stopColor="#c9a227" />
                            <stop offset="100%" stopColor="#8b6914" />
                        </linearGradient>
                    </defs>

                    {/* Tree trunk at bottom center */}
                    {(() => {
                        const trunkX = treeWidth / 2;
                        const trunkY = treeHeight - PADDING_BOTTOM + 40;
                        return (
                            <g>
                                {/* Main trunk */}
                                <path d={`M ${trunkX - 30} ${trunkY} 
                                    C ${trunkX - 25} ${trunkY - 80}, ${trunkX - 10} ${trunkY - 120}, ${trunkX} ${trunkY - 160}
                                    C ${trunkX + 10} ${trunkY - 120}, ${trunkX + 25} ${trunkY - 80}, ${trunkX + 30} ${trunkY}`}
                                    fill="url(#trunkGrad)" stroke="#3d2510" strokeWidth={1}
                                />
                                {/* Trunk texture lines */}
                                <path d={`M ${trunkX - 10} ${trunkY} C ${trunkX - 8} ${trunkY - 60}, ${trunkX - 2} ${trunkY - 100}, ${trunkX} ${trunkY - 140}`}
                                    fill="none" stroke="#4a2c15" strokeWidth={0.5} opacity={0.4}
                                />
                                <path d={`M ${trunkX + 8} ${trunkY} C ${trunkX + 6} ${trunkY - 50}, ${trunkX + 3} ${trunkY - 90}, ${trunkX + 2} ${trunkY - 130}`}
                                    fill="none" stroke="#4a2c15" strokeWidth={0.5} opacity={0.4}
                                />
                                {/* Root */}
                                <ellipse cx={trunkX} cy={trunkY + 5} rx={50} ry={10} fill="#4a3020" opacity={0.3} />

                                {/* Title banner */}
                                <rect x={trunkX - 120} y={trunkY + 20} width={240} height={32} rx={4}
                                    fill="url(#titleBanner)" stroke="#6b4c10" strokeWidth={1} />
                                <text x={trunkX} y={trunkY + 40} textAnchor="middle" dominantBaseline="middle"
                                    fontSize={14} fontWeight="bold" fill="white" fontFamily="serif">
                                    🌳 Phả Đồ Họ {data.familyName}
                                </text>
                            </g>
                        );
                    })()}

                    {/* Leaf decorations */}
                    {leaves.map((l, i) => (
                        <LeafDecoration key={i} x={l.x} y={l.y} rotate={l.r} scale={l.s} />
                    ))}

                    {/* Branches (edges) */}
                    {edges.map((e, i) => {
                        const p1 = positions[e.from];
                        const p2 = positions[e.to];
                        if (!p1 || !p2) return null;
                        const isOnPath = focusPath.has(e.from) && focusPath.has(e.to);
                        return (
                            <BranchPath key={i}
                                x1={p1.x} y1={p1.y + NODE_H / 2}
                                x2={p2.x} y2={p2.y - NODE_H / 2}
                                highlight={isOnPath}
                            />
                        );
                    })}

                    {/* Member nodes */}
                    {members.map(m => {
                        const p = positions[m.id];
                        if (!p) return null;
                        return (
                            <MemberNode key={m.id} member={m}
                                x={p.x} y={p.y}
                                isFocused={m.id === focusId}
                                isOnPath={focusPath.has(m.id)}
                                onClick={setDetailMember}
                            />
                        );
                    })}
                </svg>
            </div>

            {/* Search Panel */}
            <div className="absolute top-4 left-4 z-30 w-[280px] max-w-[calc(100vw-32px)]">
                <div className="bg-[#fdfbf7]/95 backdrop-blur-md border border-[#d2b48c] rounded-2xl shadow-xl p-3">
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
                        <div className="mt-2 max-h-[200px] overflow-y-auto border border-[#e8dcb8] rounded-xl">
                            {searchResults.map(m => (
                                <div key={m.id}
                                    onClick={() => handleFocusMember(m)}
                                    className="px-3 py-2 hover:bg-[#8b5a2b]/10 cursor-pointer border-b border-[#e8dcb8] last:border-0 flex items-center gap-2">
                                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-white
                                        ${m.gender === 'female' ? 'bg-[#8e3a6e]' : 'bg-[#5c3317]'}`}>
                                        {m.gender === 'female' ? '♀' : '♂'}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-bold text-[#3e2723] truncate">{m.name}</div>
                                        <div className="text-[10px] text-[#8b5a2b]">Đời {m.generation ?? '?'}</div>
                                    </div>
                                    <ChevronRight size={14} className="text-[#d2b48c]" />
                                </div>
                            ))}
                        </div>
                    )}

                    {focusId && (
                        <button onClick={() => setFocusId(null)}
                            className="mt-2 w-full py-1.5 text-xs font-bold text-[#8b5a2b] bg-[#f4efe6] rounded-lg hover:bg-[#e8dcb8] border border-[#d2b48c]">
                            ✕ Bỏ highlight dòng dõi
                        </button>
                    )}
                </div>
            </div>

            {/* Zoom Controls */}
            <div className="absolute bottom-6 left-4 z-30 flex flex-col gap-2">
                <button onClick={() => setZoom(z => Math.min(2, z + 0.15))}
                    className="w-10 h-10 bg-[#fdfbf7]/95 border border-[#d2b48c] rounded-xl shadow-lg flex items-center justify-center hover:bg-[#e8dcb8] transition-colors">
                    <ZoomIn size={18} className="text-[#5c4033]" />
                </button>
                <button onClick={() => setZoom(z => Math.max(0.1, z - 0.15))}
                    className="w-10 h-10 bg-[#fdfbf7]/95 border border-[#d2b48c] rounded-xl shadow-lg flex items-center justify-center hover:bg-[#e8dcb8] transition-colors">
                    <ZoomOut size={18} className="text-[#5c4033]" />
                </button>
                <button onClick={resetView}
                    className="w-10 h-10 bg-[#fdfbf7]/95 border border-[#d2b48c] rounded-xl shadow-lg flex items-center justify-center hover:bg-[#e8dcb8] transition-colors">
                    <Home size={18} className="text-[#5c4033]" />
                </button>
            </div>

            {/* Legend */}
            <div className="absolute bottom-6 right-4 z-30 bg-[#fdfbf7]/90 backdrop-blur-md border border-[#d2b48c] rounded-xl shadow-lg p-3 text-[10px] space-y-1 hidden sm:block">
                <div className="flex items-center gap-2">
                    <span className="w-4 h-3 rounded-full bg-[#5c3317]" /> <span className="text-[#3e2723] font-bold">Nam</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-4 h-3 rounded-full bg-[#8e3a6e]" /> <span className="text-[#3e2723] font-bold">Nữ</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-4 h-3 rounded-full bg-[#d4a017]" /> <span className="text-[#3e2723] font-bold">Đang chọn</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-4 h-3 rounded-full bg-[#c0392b]" /> <span className="text-[#3e2723] font-bold">Dòng dõi</span>
                </div>
            </div>

            {/* Back button */}
            <div className="absolute top-4 right-4 z-30">
                <a href="/tree" className="bg-[#8b5a2b] hover:bg-[#5c4033] text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg transition-colors">
                    ← Quay lại cây chính
                </a>
            </div>

            {/* Detail popup */}
            {detailMember && (
                <DetailPopup member={detailMember} onClose={() => setDetailMember(null)} allMembers={members} />
            )}
        </div>
    );
}

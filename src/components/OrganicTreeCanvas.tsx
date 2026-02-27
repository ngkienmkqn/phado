"use client";

import React, { useState, useMemo, useCallback, useRef } from 'react';
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

// ─── Tree Node Position ──────────────────────────────────────────────
interface TreeNode {
    member: MemberData;
    x: number;
    y: number;
    parentNode?: TreeNode;
    size: number;
}

// ─── SVG Leaf Component ──────────────────────────────────────────────
function SvgLeaf({ cx, cy, rotation, scale = 1 }: { cx: number; cy: number; rotation: number; scale?: number }) {
    return (
        <g transform={`translate(${cx},${cy}) rotate(${rotation}) scale(${scale})`}>
            <ellipse rx="6" ry="12" fill="#5a9e3c" opacity="0.7" />
            <line x1="0" y1="-12" x2="0" y2="12" stroke="#3d7a28" strokeWidth="0.8" opacity="0.5" />
        </g>
    );
}

// ─── SVG Branch (Bezier curve from parent to child) ──────────────────
function SvgBranch({ x1, y1, x2, y2, thickness }: { x1: number; y1: number; x2: number; y2: number; thickness: number }) {
    // Bezier curve going upward from parent to child
    const midY = y1 + (y2 - y1) * 0.4;
    const path = `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY + (y2 - y1) * 0.1}, ${x2} ${y2}`;

    return (
        <>
            {/* Branch shadow */}
            <path d={path} fill="none" stroke="#3d2b1f" strokeWidth={thickness + 2} opacity="0.15" strokeLinecap="round" />
            {/* Branch wood */}
            <path d={path} fill="none" stroke="#6d4c2e" strokeWidth={thickness} strokeLinecap="round" />
            {/* Branch highlight */}
            <path d={path} fill="none" stroke="#8b6f47" strokeWidth={Math.max(1, thickness - 3)} opacity="0.4" strokeLinecap="round" />
        </>
    );
}

// ─── SVG Person Circle ──────────────────────────────────────────────
function SvgPerson({
    node, isFocused, isOnRelPath, onClick
}: {
    node: TreeNode; isFocused: boolean; isOnRelPath: boolean; onClick: (m: MemberData) => void;
}) {
    const { member, x, y, size } = node;
    const isFemale = member.gender === 'female';
    const r = size / 2;
    const shortName = member.name.length > 14 ? member.name.substring(0, 12) + '…' : member.name;

    return (
        <g className="cursor-pointer" onClick={() => onClick(member)} style={{ transition: 'transform 0.3s' }}>
            {/* Glow ring */}
            {(isFocused || isOnRelPath) && (
                <circle cx={x} cy={y} r={r + 6}
                    fill="none"
                    stroke={isOnRelPath ? '#dc2626' : '#f0c040'}
                    strokeWidth={3}
                    opacity={0.8}
                >
                    {isFocused && (
                        <animate attributeName="opacity" values="0.8;0.3;0.8" dur="2s" repeatCount="indefinite" />
                    )}
                </circle>
            )}

            {/* Gold frame ring */}
            <circle cx={x} cy={y} r={r + 3} fill="none" stroke="#c5a55a" strokeWidth={2.5} opacity={0.8} />

            {/* Circle background */}
            <circle cx={x} cy={y} r={r}
                fill={isFemale ? '#c27ba0' : '#795548'}
                stroke={isFemale ? '#9c4d78' : '#4e342e'}
                strokeWidth={2.5}
            />

            {/* Gradient sheen */}
            <circle cx={x} cy={y - r * 0.2} r={r * 0.6}
                fill="url(#sheenGrad)" opacity={0.25}
            />

            {/* Gender icon */}
            <text x={x} y={y + 2} textAnchor="middle" dominantBaseline="middle"
                fill="white" fontSize={r > 20 ? 18 : 14} fontWeight="bold"
                style={{ pointerEvents: 'none' }}>
                {isFemale ? '♀' : '♂'}
            </text>

            {/* Name banner */}
            <rect x={x - 55} y={y + r + 4} width={110} height={16} rx={4}
                fill={isFemale ? '#8e3a6e' : '#4e342e'} opacity={0.92}
            />
            <text x={x} y={y + r + 14} textAnchor="middle" dominantBaseline="middle"
                fill="white" fontSize={9} fontWeight="700"
                style={{ pointerEvents: 'none' }}>
                {shortName}
            </text>

            {/* Generation label */}
            <text x={x} y={y + r + 26} textAnchor="middle" dominantBaseline="middle"
                fill="#5d4037" fontSize={8} fontWeight="600"
                style={{ pointerEvents: 'none' }}>
                Đ.{member.generation ?? '?'}{isFocused ? ' ★' : ''}
            </text>
        </g>
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

// ─── SVG dimensions ──────────────────────────────────────────────────
const SVG_W = 1200;
const SVG_H = 800;
const TRUNK_X = SVG_W / 2;
const TRUNK_BOTTOM = SVG_H - 40;
const TRUNK_TOP = SVG_H - 140;
const ROOT_Y = TRUNK_TOP - 20;

// Layer Y positions (bottom to top, root at bottom)
const LAYER_Y = [
    ROOT_Y,          // Layer 0: root (bottom)
    ROOT_Y - 140,    // Layer 1: children
    ROOT_Y - 280,    // Layer 2: grandchildren
    ROOT_Y - 400,    // Layer 3: great-grandchildren
    ROOT_Y - 500,    // Layer 4: great-great-grandchildren
];

// ─── Main Component ─────────────────────────────────────────────────
export default function OrganicTreeCanvas({ data }: { data: FamilyData }) {
    const { members } = data;
    const svgRef = useRef<SVGSVGElement>(null);

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

    // ─── Build tree nodes with position via BFS ──────────────────────
    const { treeNodes, leaves } = useMemo(() => {
        const focused = members.find(m => m.id === focusId);
        if (!focused) return { treeNodes: [], leaves: [] };

        const nodes: TreeNode[] = [];
        const maxPerLayer = [1, 3, 5, 7, 7];

        // Root node
        const rootNode: TreeNode = { member: focused, x: TRUNK_X, y: ROOT_Y, size: 52 };
        nodes.push(rootNode);

        // BFS layer by layer
        let currentLayer: TreeNode[] = [rootNode];

        for (let depth = 1; depth < LAYER_Y.length; depth++) {
            const nextLayer: TreeNode[] = [];
            const maxSlots = maxPerLayer[depth];

            for (const parentNode of currentLayer) {
                const kids = members.filter(m => m.parentId === parentNode.member.id);
                for (const kid of kids) {
                    if (nextLayer.length < maxSlots) {
                        nextLayer.push({
                            member: kid,
                            x: 0, // will calculate below
                            y: LAYER_Y[depth],
                            parentNode,
                            size: Math.max(30, 48 - depth * 4),
                        });
                    }
                }
            }

            if (nextLayer.length === 0) break;

            // Spread children horizontally 
            const layerWidth = Math.min(SVG_W - 200, nextLayer.length * 160);
            const startX = TRUNK_X - layerWidth / 2;
            const step = nextLayer.length > 1 ? layerWidth / (nextLayer.length - 1) : 0;

            nextLayer.forEach((n, i) => {
                n.x = nextLayer.length === 1 ? TRUNK_X : startX + i * step;
            });

            nodes.push(...nextLayer);
            currentLayer = nextLayer;
        }

        // Generate decorative leaves along branches
        const leafData: { cx: number; cy: number; rotation: number; scale: number }[] = [];
        for (const node of nodes) {
            if (node.parentNode) {
                const px = node.parentNode.x;
                const py = node.parentNode.y;
                const dx = node.x - px;
                const dy = node.y - py;
                // Place 2-4 leaves along each branch
                for (let t = 0.2; t < 0.9; t += 0.25) {
                    const lx = px + dx * t + (Math.random() - 0.5) * 30;
                    const ly = py + dy * t + (Math.random() - 0.5) * 15;
                    leafData.push({
                        cx: lx,
                        cy: ly,
                        rotation: Math.random() * 360,
                        scale: 0.6 + Math.random() * 0.6,
                    });
                }
            }
        }
        // Extra leaves around the crown
        for (let i = 0; i < 20; i++) {
            leafData.push({
                cx: TRUNK_X + (Math.random() - 0.5) * (SVG_W * 0.7),
                cy: 20 + Math.random() * 180,
                rotation: Math.random() * 360,
                scale: 0.5 + Math.random() * 0.8,
            });
        }

        return { treeNodes: nodes, leaves: leafData };
    }, [focusId, members]);

    // ─── Relationship path ───────────────────────────────────────────
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
        <div className="w-full h-full relative overflow-hidden" style={{ background: 'linear-gradient(to bottom, #d4e8c2, #f5f0e1 30%, #f5f0e1 80%, #8b6f47 100%)' }}>
            {/* SVG Tree */}
            <svg ref={svgRef} viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
                <defs>
                    {/* Sheen gradient for circles */}
                    <radialGradient id="sheenGrad" cx="40%" cy="30%">
                        <stop offset="0%" stopColor="white" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="white" stopOpacity="0" />
                    </radialGradient>
                    {/* Trunk gradient */}
                    <linearGradient id="trunkGrad" x1="0" x2="1" y1="0" y2="0">
                        <stop offset="0%" stopColor="#4a3220" />
                        <stop offset="30%" stopColor="#6d4c2e" />
                        <stop offset="50%" stopColor="#8b6f47" />
                        <stop offset="70%" stopColor="#6d4c2e" />
                        <stop offset="100%" stopColor="#4a3220" />
                    </linearGradient>
                    {/* Root texture */}
                    <linearGradient id="rootGrad" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#6d4c2e" />
                        <stop offset="100%" stopColor="#3d2b1f" />
                    </linearGradient>
                </defs>

                {/* Ground */}
                <ellipse cx={TRUNK_X} cy={TRUNK_BOTTOM + 15} rx={200} ry={20} fill="#8b6f47" opacity="0.3" />

                {/* Tree Trunk — thick at bottom, narrows upward */}
                <path d={`
                    M ${TRUNK_X - 40} ${TRUNK_BOTTOM}
                    C ${TRUNK_X - 45} ${TRUNK_TOP + 40}, ${TRUNK_X - 20} ${TRUNK_TOP + 20}, ${TRUNK_X - 15} ${TRUNK_TOP}
                    L ${TRUNK_X + 15} ${TRUNK_TOP}
                    C ${TRUNK_X + 20} ${TRUNK_TOP + 20}, ${TRUNK_X + 45} ${TRUNK_TOP + 40}, ${TRUNK_X + 40} ${TRUNK_BOTTOM}
                    Z
                `} fill="url(#trunkGrad)" />

                {/* Trunk bark texture lines */}
                {[0.2, 0.4, 0.6, 0.8].map((t, i) => {
                    const ty = TRUNK_TOP + (TRUNK_BOTTOM - TRUNK_TOP) * t;
                    return (
                        <line key={`bark${i}`} x1={TRUNK_X - 15 + i * 5} y1={ty - 8} x2={TRUNK_X - 10 + i * 3} y2={ty + 8}
                            stroke="#3d2b1f" strokeWidth="1" opacity="0.2" />
                    );
                })}

                {/* Roots */}
                {[-60, -30, 30, 60].map((offset, i) => (
                    <path key={`root${i}`}
                        d={`M ${TRUNK_X + offset * 0.4} ${TRUNK_BOTTOM} Q ${TRUNK_X + offset} ${TRUNK_BOTTOM + 20}, ${TRUNK_X + offset * 1.2} ${TRUNK_BOTTOM + 10}`}
                        fill="none" stroke="url(#rootGrad)" strokeWidth={4 - i * 0.5} strokeLinecap="round"
                    />
                ))}

                {/* Decorative leaves (behind branches) */}
                {leaves.map((l, i) => (
                    <SvgLeaf key={`leaf${i}`} cx={l.cx} cy={l.cy} rotation={l.rotation} scale={l.scale} />
                ))}

                {/* Branches (from parent to child) */}
                {treeNodes.filter(n => n.parentNode).map((node, i) => (
                    <SvgBranch
                        key={`branch${i}`}
                        x1={node.parentNode!.x}
                        y1={node.parentNode!.y}
                        x2={node.x}
                        y2={node.y}
                        thickness={Math.max(4, 10 - i)}
                    />
                ))}

                {/* Person circles */}
                {treeNodes.map(node => (
                    <SvgPerson
                        key={node.member.id}
                        node={node}
                        isFocused={node.member.id === focusId}
                        isOnRelPath={relationPath.has(node.member.id)}
                        onClick={handleClickMember}
                    />
                ))}
            </svg>

            {/* Title */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30">
                <div className="bg-[#4e342e]/90 backdrop-blur-sm text-white px-5 py-1.5 rounded-xl shadow-lg border border-[#8d6e63]">
                    <h1 className="font-serif font-bold text-sm sm:text-base text-center">🌳 Phả Đồ Họ {data.familyName}</h1>
                </div>
            </div>

            {/* Left Panel */}
            <div className="absolute top-14 left-3 z-30 w-[240px] sm:w-[260px] space-y-2">
                <div className="bg-white/92 backdrop-blur-md border border-[#d2b48c] rounded-2xl shadow-xl p-2.5">
                    <div className="relative">
                        <Search className="absolute left-3 top-2 h-4 w-4 text-[#8b5a2b]" />
                        <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                            placeholder="Tìm thành viên..." className="w-full pl-9 pr-8 py-1.5 border border-[#d2b48c] rounded-xl text-sm bg-white focus:outline-none focus:border-[#8b5a2b]" />
                        {searchTerm && (
                            <button onClick={() => setSearchTerm('')} className="absolute right-2 top-1.5 p-0.5 hover:bg-gray-100 rounded-full">
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

                <button onClick={() => setShowCalc(!showCalc)}
                    className="w-full bg-white/92 backdrop-blur-md border border-[#d2b48c] rounded-xl shadow-lg p-2 flex items-center justify-center gap-2 text-sm font-bold text-[#5c4033] hover:bg-[#f4efe6] transition-colors">
                    <Calculator size={16} /> Tìm xưng hô
                </button>

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
                    🌳 Gốc ở dưới thân cây · Bấm vào người → chi tiết → &quot;Đặt làm gốc&quot; để duyệt nhánh
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
        </div>
    );
}

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

// ─── Tree node with position ─────────────────────────────────────────
interface TreeNode {
    member: MemberData;
    x: number; // percentage
    y: number; // percentage
    parentNode?: TreeNode;
    size: number; // px
    layer: number;
}

// ─── Person Bubble Component ─────────────────────────────────────────
function PersonBubble({
    node, isFocused, isOnRelPath, onClick
}: {
    node: TreeNode; isFocused: boolean; isOnRelPath: boolean;
    onClick: (m: MemberData) => void;
}) {
    const { member, x, y, size } = node;
    const isFemale = member.gender === 'female';
    const shortName = member.name.length > 12 ? member.name.substring(0, 10) + '…' : member.name;

    return (
        <div
            className="absolute flex flex-col items-center cursor-pointer group"
            style={{
                left: `${x}%`,
                top: `${y}%`,
                transform: 'translate(-50%, -50%)',
                zIndex: isFocused ? 30 : 20,
                transition: 'all 0.4s ease',
            }}
            onClick={() => onClick(member)}
        >
            {/* Outer glow for focus/relation */}
            {(isFocused || isOnRelPath) && (
                <div className="absolute rounded-full animate-pulse"
                    style={{
                        width: size + 16,
                        height: size + 16,
                        top: -(16) / 2,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        boxShadow: isOnRelPath
                            ? '0 0 20px rgba(220,38,38,0.6), 0 0 40px rgba(220,38,38,0.3)'
                            : '0 0 20px rgba(218,165,32,0.7), 0 0 40px rgba(218,165,32,0.4)',
                        border: `3px solid ${isOnRelPath ? '#dc2626' : '#daa520'}`,
                    }}
                />
            )}

            {/* Ornate gold circle frame */}
            <div
                className="relative rounded-full overflow-hidden group-hover:scale-110 transition-transform duration-300"
                style={{
                    width: size,
                    height: size,
                    background: `conic-gradient(from 0deg, #b8860b, #daa520, #ffd700, #daa520, #b8860b, #8b6914, #daa520, #ffd700, #daa520, #b8860b)`,
                    padding: 3,
                    boxShadow: '0 4px 15px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,215,0,0.5)',
                }}
            >
                {/* Inner circle */}
                <div
                    className="w-full h-full rounded-full flex items-center justify-center overflow-hidden"
                    style={{
                        background: isFemale
                            ? 'radial-gradient(circle at 30% 30%, #f8d7e8, #e8a0c0)'
                            : 'radial-gradient(circle at 30% 30%, #f5f0e1, #d2b48c)',
                        border: '2px solid rgba(139,109,20,0.5)',
                    }}
                >
                    {/* Avatar emoji */}
                    <span style={{ fontSize: size * 0.45 }}>
                        {isFemale ? '👩' : '👨'}
                    </span>
                </div>
            </div>

            {/* Compact name ribbon */}
            <div className="relative -mt-1" style={{ width: Math.min(100, size + 10) }}>
                <svg viewBox="0 0 120 26" className="w-full" style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))' }}>
                    <polygon points="0,4 6,4 10,0 110,0 114,4 120,4 120,20 114,20 110,24 10,24 6,20 0,20" fill="#c8912c" />
                    <polygon points="3,5 6,5 10,1 110,1 114,5 117,5 117,19 114,19 110,23 10,23 6,19 3,19" fill="#daa520" />
                    <rect x="10" y="2" width="100" height="1.5" rx="1" fill="#ffd700" opacity="0.5" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center" style={{ paddingBottom: 1 }}>
                    <span className="text-white font-bold drop-shadow-md text-center leading-none"
                        style={{ fontSize: Math.max(7, Math.min(10, size * 0.15)) }}>
                        {shortName}
                    </span>
                </div>
            </div>

            {/* Generation tag */}
            <div className="text-center -mt-0.5" style={{ fontSize: 8, color: '#5d4037', fontWeight: 700, textShadow: '0 0 6px rgba(255,255,255,0.9)' }}>
                Đ.{member.generation ?? '?'}{isFocused ? ' ★' : ''}
            </div>
        </div>
    );
}

// ─── SVG Branch Line connecting parent to child (tree trunk/branch style) ────
function BranchLine({ x1, y1, x2, y2, layer }: { x1: number; y1: number; x2: number; y2: number; layer: number }) {
    // Branch width tapers: thick at trunk (parent), thin at tip (child)
    const baseWidth = layer === 0 ? 3.5 : layer === 1 ? 2.2 : layer === 2 ? 1.4 : 0.9;
    const tipWidth = baseWidth * 0.45;

    // Control points for natural curve
    const midY = y1 + (y2 - y1) * 0.4;
    // Slight organic offset for natural look
    const dx = x2 - x1;
    const wobble = dx * 0.08;

    // Build a filled "branch" shape using 2 bezier curves (left edge + right edge)
    // Left edge goes from parent to child
    const lx1 = x1 - baseWidth / 2;
    const rx1 = x1 + baseWidth / 2;
    const lx2 = x2 - tipWidth / 2;
    const rx2 = x2 + tipWidth / 2;

    const path = [
        // Start at parent left
        `M ${lx1} ${y1}`,
        // Curve to child left
        `C ${lx1 + wobble} ${midY}, ${lx2 - wobble * 0.3} ${midY + (y2 - y1) * 0.12}, ${lx2} ${y2}`,
        // Line across child tip
        `L ${rx2} ${y2}`,
        // Curve back to parent right
        `C ${rx2 + wobble * 0.3} ${midY + (y2 - y1) * 0.12}, ${rx1 + wobble} ${midY}, ${rx1} ${y1}`,
        `Z`,
    ].join(' ');

    // Unique gradient id
    const gradId = `bark-${x1.toFixed(1)}-${y1.toFixed(1)}-${x2.toFixed(1)}-${y2.toFixed(1)}`.replace(/\./g, '_');

    return (
        <>
            <defs>
                <linearGradient id={gradId} x1="0" y1={y1} x2="0" y2={y2} gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#5d3a1a" />
                    <stop offset="35%" stopColor="#6d4c2e" />
                    <stop offset="70%" stopColor="#7a5a3c" />
                    <stop offset="100%" stopColor="#8b6e50" />
                </linearGradient>
            </defs>
            {/* Shadow / depth */}
            <path
                d={path}
                fill="#3d2b1f"
                opacity="0.25"
                transform="translate(0.3, 0.3)"
            />
            {/* Main branch body */}
            <path
                d={path}
                fill={`url(#${gradId})`}
            />
            {/* Bark center highlight (thin line for texture) */}
            <path
                d={`M ${x1} ${y1} C ${x1 + wobble} ${midY}, ${x2 - wobble * 0.3} ${midY + (y2 - y1) * 0.12}, ${x2} ${y2}`}
                fill="none"
                stroke="#8b7355"
                strokeWidth={baseWidth * 0.15}
                opacity="0.35"
                strokeLinecap="round"
            />
        </>
    );
}


// ─── Searchable Dropdown ─────────────────────────────────────────────
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
    return `HẬU DUỆ (cách ${absDiff} đời)`;
}

// ─── Main Component ─────────────────────────────────────────────────
export default function OrganicTreeCanvas({ data }: { data: FamilyData }) {
    const { members } = data;

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

    // ─── Pan and Zoom ────────────────────────────────────────────────
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const isDragging = useRef(false);
    const lastPos = useRef({ x: 0, y: 0 });

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if ((e.target as HTMLElement).closest('button, input, a, [data-no-drag]')) return;
        isDragging.current = true;
        lastPos.current = { x: e.clientX, y: e.clientY };
    }, []);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (!isDragging.current) return;
        const dx = e.clientX - lastPos.current.x;
        const dy = e.clientY - lastPos.current.y;
        lastPos.current = { x: e.clientX, y: e.clientY };
        setPan(prev => ({ x: prev.x + dx, y: prev.y + dy }));
    }, []);

    const handleMouseUp = useCallback(() => { isDragging.current = false; }, []);

    const handleWheel = useCallback((e: React.WheelEvent) => {
        e.preventDefault();
        setZoom(prev => Math.max(0.3, Math.min(3, prev - e.deltaY * 0.001)));
    }, []);

    // ─── Build tree: root at BOTTOM, all children grow UPWARD ────────
    const { treeNodes } = useMemo(() => {
        const focused = members.find(m => m.id === focusId);
        if (!focused) return { treeNodes: [] };

        const nodes: TreeNode[] = [];
        const maxDepth = 5;
        // Vertical positions (percentage) — root at bottom, children up
        const layerY = [80, 62, 44, 28, 14, 5];
        const layerSizes = [62, 50, 44, 38, 34, 30];

        // Root
        const rootNode: TreeNode = {
            member: focused, x: 50, y: layerY[0],
            size: layerSizes[0], layer: 0,
        };
        nodes.push(rootNode);

        let currentLayer: TreeNode[] = [rootNode];

        for (let depth = 1; depth <= maxDepth; depth++) {
            const nextLayer: TreeNode[] = [];

            for (const parentNode of currentLayer) {
                const kids = members.filter(m => m.parentId === parentNode.member.id);
                for (const kid of kids) {
                    nextLayer.push({
                        member: kid, x: 0, y: layerY[depth] ?? (14 - (depth - 4) * 8),
                        parentNode, size: layerSizes[depth] ?? 28, layer: depth,
                    });
                }
            }

            if (nextLayer.length === 0) break;

            // Dynamic width based on count — expands for more children
            const count = nextLayer.length;
            const maxWidth = Math.min(88, 20 + count * 8);
            const startX = 50 - maxWidth / 2;
            const step = count > 1 ? maxWidth / (count - 1) : 0;

            nextLayer.forEach((n, i) => {
                n.x = count === 1 ? 50 : startX + i * step;
            });

            nodes.push(...nextLayer);
            currentLayer = nextLayer;
        }

        return { treeNodes: nodes };
    }, [focusId, members]);

    // ─── Relationship path (with cycle protection) ─────────────────
    const memberMap = useMemo(() => {
        const map = new Map<string, MemberData>();
        for (const m of members) map.set(m.id, m);
        return map;
    }, [members]);

    const { relationResult, relationPath } = useMemo(() => {
        if (!calcA || !calcB || calcA === calcB) return { relationResult: null, relationPath: new Set<string>() };

        const resolveToBloodline = (memberId: string): string => {
            const person = memberMap.get(memberId);
            if (!person) return memberId;
            if (person.parentId) return memberId;
            const partner = members.find(m => m.spouse === person.name);
            if (partner) return partner.id;
            return memberId;
        };

        const resolvedA = resolveToBloodline(calcA);
        const resolvedB = resolveToBloodline(calcB);

        // Trace ancestor chain with cycle detection + depth cap
        const traceAncestors = (startId: string): MemberData[] => {
            const path: MemberData[] = [];
            const visited = new Set<string>();
            let curr = memberMap.get(startId);
            while (curr && path.length < 50 && !visited.has(curr.id)) {
                visited.add(curr.id);
                path.push(curr);
                curr = curr.parentId ? memberMap.get(curr.parentId) : undefined;
            }
            return path;
        };

        const pathA = traceAncestors(resolvedA);
        const pathB = traceAncestors(resolvedB);

        let lcaA = -1, lcaB = -1;
        for (let i = 0; i < pathA.length; i++) {
            const found = pathB.findIndex(m => m.id === pathA[i].id);
            if (found !== -1) { lcaA = i; lcaB = found; break; }
        }

        if (lcaA === -1) return { relationResult: 'Không tìm thấy quan hệ', relationPath: new Set<string>() };

        const pIds = new Set<string>();
        for (let i = 0; i <= lcaA; i++) pIds.add(pathA[i].id);
        for (let i = 0; i <= lcaB; i++) pIds.add(pathB[i].id);
        pIds.add(calcA); pIds.add(calcB);

        const personA = members.find(m => m.id === calcA) || pathA[0];
        const personB = members.find(m => m.id === calcB) || pathB[0];
        const diff = (pathA[0]?.generation ?? 0) - (pathB[0]?.generation ?? 0);

        const termAB = getRelationTerm(diff, lcaA, lcaB);
        const termBA = getRelationTerm(-diff, lcaB, lcaA);

        return {
            relationResult: `🔴 ${personA.name} gọi ${personB.name} là ${termAB}\n🔵 ${personB.name} gọi ${personA.name} là ${termBA}`,
            relationPath: pIds,
        };
    }, [calcA, calcB, members, memberMap]);

    // ─── Search ──────────────────────────────────────────────────────
    const searchResults = useMemo(() => {
        if (!searchTerm || searchTerm.length < 2) return [];
        const term = removeDiacritics(searchTerm.toLowerCase());
        return members.filter(m => removeDiacritics(m.name.toLowerCase()).includes(term)).slice(0, 8);
    }, [searchTerm, members]);

    const handleClickMember = useCallback((m: MemberData) => setDetailMember(m), []);

    const navigateToMember = useCallback((id: string) => {
        setFocusId(id);
        setDetailMember(null);
        setSearchTerm('');
        setPan({ x: 0, y: 0 });
        setZoom(1);
    }, []);

    // ─── Render ──────────────────────────────────────────────────────
    // Compute tree bounds for dynamic trunk
    const treeBounds = useMemo(() => {
        if (treeNodes.length === 0) return { rootX: 50, rootY: 85, topY: 15 };
        const rootNode = treeNodes[0];
        const topY = Math.min(...treeNodes.map(n => n.y));
        return { rootX: rootNode?.x ?? 50, rootY: rootNode?.y ?? 80, topY };
    }, [treeNodes]);

    // Leaf animation seeds — dense oak leaf canopy
    const leafSeeds = useMemo(() => {
        return treeNodes.flatMap((node, ni) => {
            if (node.layer < 1) return [];
            // More leaves at higher layers for a dense canopy
            const count = node.layer >= 3 ? 12 : node.layer >= 2 ? 8 : 5;
            return Array.from({ length: count }, (_, i) => ({
                x: node.x + ((ni * 7 + i * 17) % 28 - 14),
                y: node.y - ((ni * 3 + i * 11) % 12) - 3,
                scale: 0.6 + ((ni + i) % 4) * 0.25,
                rotate: ((ni * 37 + i * 73) % 360),
                delay: ((ni * 5 + i * 3) % 10) * 0.3,
                // Oak-like olive/golden green colors to match background
                color: ['#7a8a3a', '#8b9a40', '#6b7a30', '#9aaa50', '#5a6a28',
                    '#a4a44a', '#768338', '#8c9c42'][((ni + i) * 3) % 8],
            }));
        });
    }, [treeNodes]);

    return (
        <div
            className="w-full h-full relative overflow-hidden bg-[#f5f0e1]"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
            style={{ cursor: isDragging.current ? 'grabbing' : 'grab' }}
        >
            {/* Leaf sway animation CSS */}
            <style>{`
                @keyframes leafSway {
                    0%, 100% { transform: translate(0px, 0px) rotate(0deg); }
                    25% { transform: translate(0.5px, -0.3px) rotate(5deg); }
                    50% { transform: translate(-0.3px, 0.5px) rotate(-3deg); }
                    75% { transform: translate(0.4px, 0.2px) rotate(4deg); }
                }
                @keyframes leafFall {
                    0% { transform: translateY(0) rotate(0deg); opacity: 0.4; }
                    50% { transform: translateY(3px) rotate(15deg); opacity: 0.3; }
                    100% { transform: translateY(0) rotate(0deg); opacity: 0.4; }
                }
            `}</style>

            {/* Sky / ground gradient background */}
            <div className="absolute inset-0" style={{
                background: 'linear-gradient(to bottom, #d4e8c2 0%, #e8dfc4 35%, #f5f0e1 55%, #d4c4a0 85%, #8b7355 100%)',
            }} />

            {/* Soft vignette */}
            <div className="absolute inset-0" style={{
                background: 'radial-gradient(ellipse at 50% 70%, transparent 30%, rgba(62,39,35,0.15) 100%)',
            }} />

            {/* Pan/zoom transform wrapper */}
            <div className="absolute inset-0 transition-transform duration-100" style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transformOrigin: 'center center',
            }}>

                {/* ALGORITHMIC TREE SVG — trunk, branches, roots, leaves */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ zIndex: 5 }}>
                    <defs>
                        {/* Bark gradient for the main trunk */}
                        <linearGradient id="trunkGrad" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#4a3020" />
                            <stop offset="25%" stopColor="#5d3a1a" />
                            <stop offset="50%" stopColor="#6d4c2e" />
                            <stop offset="75%" stopColor="#5d3a1a" />
                            <stop offset="100%" stopColor="#4a3020" />
                        </linearGradient>
                        {/* Root gradient */}
                        <linearGradient id="rootGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#5d3a1a" />
                            <stop offset="100%" stopColor="#3d2510" />
                        </linearGradient>
                        {/* Oak leaf shape — lobed leaf like in the background image */}
                        <symbol id="oakLeaf" viewBox="0 0 20 24" overflow="visible">
                            <path d="M10 0 C8 2, 4 3, 2 5 C0 7, 1 9, 3 10 C1 11, 0 13, 1 15 C2 17, 4 17, 5 16 C4 18, 4 20, 6 22 C8 24, 10 24, 10 24 C10 24, 12 24, 14 22 C16 20, 16 18, 15 16 C16 17, 18 17, 19 15 C20 13, 19 11, 17 10 C19 9, 20 7, 18 5 C16 3, 12 2, 10 0Z" />
                            <line x1="10" y1="2" x2="10" y2="22" stroke="#5a6a28" strokeWidth="0.6" opacity="0.4" />
                        </symbol>
                    </defs>

                    {/* ═══ ROOTS ═══ Decorative roots spreading from trunk base */}
                    {[[-12, 6], [-7, 4], [7, 4.5], [13, 5.5], [-4, 3], [5, 3.5]].map(([offsetX, height], i) => {
                        const rx = treeBounds.rootX + offsetX;
                        const ry = 95;
                        const baseW = 1.2 + Math.abs(offsetX) * 0.06;
                        return (
                            <path key={`root-${i}`}
                                d={`M ${treeBounds.rootX - baseW * 0.3} ${treeBounds.rootY + 6}
                                Q ${treeBounds.rootX + offsetX * 0.4} ${ry - height * 0.2}, ${rx} ${ry}
                                L ${rx + baseW * 0.3} ${ry}
                                Q ${treeBounds.rootX + offsetX * 0.4 + baseW * 0.3} ${ry - height * 0.2}, ${treeBounds.rootX + baseW * 0.3} ${treeBounds.rootY + 6}
                                Z`}
                                fill="url(#rootGrad)" opacity={0.6 + i * 0.05}
                            />
                        );
                    })}

                    {/* ═══ MAIN TRUNK ═══ From bottom ground up to root node */}
                    {(() => {
                        const tx = treeBounds.rootX;
                        const bottomY = 95;
                        const topY = treeBounds.rootY;
                        const baseWidth = 5;
                        const topWidth = 3;
                        // Slight curve for organic feel
                        const wobble = 0.8;
                        return (
                            <>
                                {/* Trunk shadow */}
                                <path
                                    d={`M ${tx - baseWidth / 2} ${bottomY}
                                    Q ${tx - topWidth / 2 - wobble} ${(bottomY + topY) / 2}, ${tx - topWidth / 2} ${topY}
                                    L ${tx + topWidth / 2} ${topY}
                                    Q ${tx + topWidth / 2 + wobble} ${(bottomY + topY) / 2}, ${tx + baseWidth / 2} ${bottomY}
                                    Z`}
                                    fill="#3d2510" opacity="0.2" transform="translate(0.4, 0.4)"
                                />
                                {/* Main trunk */}
                                <path
                                    d={`M ${tx - baseWidth / 2} ${bottomY}
                                    Q ${tx - topWidth / 2 - wobble} ${(bottomY + topY) / 2}, ${tx - topWidth / 2} ${topY}
                                    L ${tx + topWidth / 2} ${topY}
                                    Q ${tx + topWidth / 2 + wobble} ${(bottomY + topY) / 2}, ${tx + baseWidth / 2} ${bottomY}
                                    Z`}
                                    fill="url(#trunkGrad)"
                                />
                                {/* Bark texture lines */}
                                {[0.2, 0.35, 0.5, 0.65, 0.8].map((t, i) => {
                                    const cy = bottomY + (topY - bottomY) * t;
                                    const w = baseWidth + (topWidth - baseWidth) * t;
                                    return (
                                        <line key={`bark-${i}`}
                                            x1={tx - w / 2.5} y1={cy}
                                            x2={tx + w / 2.5} y2={cy + 0.3}
                                            stroke="#4a3020" strokeWidth="0.15" opacity="0.3"
                                        />
                                    );
                                })}
                            </>
                        );
                    })()}

                    {/* ═══ BRANCH CONNECTIONS ═══ Parent-to-child branches */}
                    {treeNodes.filter(n => n.parentNode).map((node, i) => (
                        <BranchLine
                            key={`branch-${i}`}
                            x1={node.parentNode!.x}
                            y1={node.parentNode!.y}
                            x2={node.x}
                            y2={node.y}
                            layer={node.layer}
                        />
                    ))}

                    {/* ═══ OAK LEAVES ═══ Realistic leaf shapes scattered around branches */}
                    {leafSeeds.map((leaf, i) => (
                        <use key={`leaf-${i}`}
                            href="#oakLeaf"
                            x={leaf.x - leaf.scale * 1.2}
                            y={leaf.y - leaf.scale * 1.4}
                            width={leaf.scale * 2.4}
                            height={leaf.scale * 2.8}
                            fill={leaf.color}
                            opacity={0.55 + (i % 3) * 0.1}
                            transform={`rotate(${leaf.rotate}, ${leaf.x}, ${leaf.y})`}
                            style={{ animation: `leafSway ${2.5 + (i % 4) * 0.5}s ease-in-out ${leaf.delay}s infinite` }}
                        />
                    ))}
                </svg>

                {/* Person bubbles (HTML overlay for rich styling) */}
                <div className="absolute inset-0" style={{ zIndex: 10 }}>
                    {treeNodes.map(node => (
                        <PersonBubble
                            key={node.member.id}
                            node={node}
                            isFocused={node.member.id === focusId}
                            isOnRelPath={relationPath.has(node.member.id)}
                            onClick={handleClickMember}
                        />
                    ))}
                </div>

            </div> {/* End pan/zoom transform wrapper */}

            {/* Title */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30">
                <div className="bg-[#4e342e]/90 backdrop-blur-sm text-white px-6 py-2 rounded-2xl shadow-xl border border-[#8d6e63]">
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

            {/* Back + Navigation */}
            <div className="absolute top-14 right-3 z-30 flex flex-col gap-2">
                <a href="/tree" className="bg-[#4e342e] hover:bg-[#3e2723] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg transition-colors text-center">
                    ← Cây chính
                </a>
            </div>

            {/* Legend */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30">
                <span className="bg-[#4e342e]/80 backdrop-blur-sm text-white/90 text-[10px] font-bold px-5 py-2 rounded-full shadow-lg border border-[#8d6e63]/50">
                    🌳 Gốc ở dưới · Bấm vào người → chi tiết → &quot;Đặt làm gốc&quot; để duyệt nhánh
                </span>
            </div>

            {/* Detail popup */}
            {detailMember && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setDetailMember(null)}>
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-md" />
                    <div className="relative bg-[#fdfbf7] border-2 border-[#c8912c] rounded-3xl shadow-2xl max-w-sm w-full p-6 bg-gradient-to-b from-[#fdfbf7] to-[#f4efe6]"
                        onClick={e => e.stopPropagation()}>
                        <button onClick={() => setDetailMember(null)} className="absolute top-3 right-3 p-1.5 hover:bg-gray-100 rounded-full">
                            <X size={20} className="text-[#8b5a2b]" />
                        </button>

                        {/* Header */}
                        <div className="flex items-center gap-4 mb-5">
                            <div className="relative rounded-full"
                                style={{
                                    width: 64,
                                    height: 64,
                                    background: 'conic-gradient(from 0deg, #b8860b, #daa520, #ffd700, #daa520, #b8860b)',
                                    padding: 3,
                                }}>
                                <div className={`w-full h-full rounded-full flex items-center justify-center text-3xl
                                    ${detailMember.gender === 'female' ? 'bg-pink-100' : 'bg-amber-50'}`}>
                                    {detailMember.gender === 'female' ? '👩' : '👨'}
                                </div>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-[#3e2723] font-serif">{detailMember.name}</h3>
                                <p className="text-xs text-[#8b5a2b] mt-0.5">
                                    Đời {detailMember.generation ?? '?'} • {detailMember.gender === 'female' ? 'Nữ' : 'Nam'}
                                    {detailMember.status ? ` • ${detailMember.status}` : ''}
                                </p>
                            </div>
                        </div>

                        {/* Info */}
                        <div className="space-y-2 text-sm mb-5">
                            {detailMember.spouse && (
                                <div className="flex gap-2 p-2.5 bg-white rounded-xl border border-[#e8dcb8]">
                                    <span className="text-[#8b5a2b] font-bold">{detailMember.gender === 'female' ? 'Chồng:' : 'Vợ:'}</span>
                                    <span className="text-[#3e2723]">{detailMember.spouse}</span>
                                </div>
                            )}
                            {detailMember.birthSolar && (
                                <div className="flex gap-2 p-2.5 bg-white rounded-xl border border-[#e8dcb8]">
                                    <span className="text-[#8b5a2b] font-bold">Sinh:</span>
                                    <span className="text-[#3e2723]">{detailMember.birthSolar}</span>
                                </div>
                            )}
                            {(() => {
                                const par = members.find(m => m.id === detailMember.parentId);
                                return par ? (
                                    <div className="flex gap-2 p-2.5 bg-white rounded-xl border border-[#e8dcb8]">
                                        <span className="text-[#8b5a2b] font-bold">Cha:</span>
                                        <span className="text-[#3e2723] underline cursor-pointer hover:text-[#8b5a2b]" onClick={() => navigateToMember(par.id)}>{par.name}</span>
                                    </div>
                                ) : null;
                            })()}
                            {(() => {
                                const kids = members.filter(m => m.parentId === detailMember.id);
                                return kids.length > 0 ? (
                                    <div className="p-2.5 bg-white rounded-xl border border-[#e8dcb8]">
                                        <span className="text-[#8b5a2b] font-bold block mb-1.5">Con ({kids.length}):</span>
                                        <div className="flex flex-wrap gap-1.5">
                                            {kids.slice(0, 10).map(c => (
                                                <span key={c.id} className={`text-xs px-2.5 py-1 rounded-full text-white cursor-pointer hover:opacity-80 font-medium
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
                                className="w-full py-3 bg-gradient-to-r from-[#8b5a2b] to-[#5c4033] hover:from-[#5c4033] hover:to-[#3e2723] text-white rounded-2xl font-bold text-sm shadow-lg transition-all">
                                🌳 Đặt làm gốc cây
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

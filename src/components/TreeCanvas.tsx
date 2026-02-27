"use client";

import React, { useCallback, useMemo, memo, useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import {
    ReactFlow,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
    Connection,
    Edge,
    Node,
    ReactFlowProvider,
    MarkerType,
    useReactFlow,
    Panel,
    Handle,
    Position
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import ELK from 'elkjs/lib/elk.bundled.js';
import { Info, Calculator, X, ChevronRight, User, CalendarDays, Search, Focus, ChevronDown, Map, HelpCircle, Plus, Minus, Printer } from 'lucide-react';
import MemberSidePanel from './MemberSidePanel';

const elk = new ELK();

// Helper to normalize Vietnamese strings (remove diacritics) for easy search
const removeDiacritics = (str: string) => {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');
};

const nodeWidth = 280;
const nodeHeight = 190;

interface MemberData {
    id: string;
    name: string;
    generation: number;
    gender: string;
    spouse?: string | null;
    status?: string | null;
    parentId?: string | null;
    birthSolar?: string | null;
    birthLunar?: string | null;
    onFocus?: (id: string) => void;
    onViewDetails?: (id: string) => void;
    isFocused?: boolean;
    hasChildren?: boolean;
    isExpanded?: boolean;
    onExpand?: (id: string) => void;
    [key: string]: unknown;
}

interface FamilyData {
    familyName: string;
    since: number;
    totalGenerations: number;
    totalMembers: number;
    exportDate?: string;
    dataSource?: string;
    members: MemberData[];
    [key: string]: unknown;
}

// Node Component optimized for Elder UX (Wooden Picture Frame Style)
const CustomPersonNode = memo(({ data }: { data: Record<string, unknown> }) => {
    const typedData = data as unknown as MemberData;
    const isFocused = typedData.isFocused;
    const isFemale = typedData.gender === 'female';

    // Get children count by gender from allMembers (passed via data)
    const allMembers = (typedData as any).allMembers as MemberData[] | undefined;
    const children = allMembers ? allMembers.filter(m => m.parentId === typedData.id) : [];
    const sons = children.filter(c => c.gender !== 'female').length;
    const daughters = children.filter(c => c.gender === 'female').length;

    return (
        <div
            onClick={() => typedData.onViewDetails?.(typedData.id)}
            className={`relative flex flex-col w-[280px] min-h-[160px] h-auto rounded-2xl border-[3px] transition-all cursor-pointer shadow-xl group
            ${isFocused ? `border-[#5c4033] ${isFemale ? 'bg-[#8b4567]' : 'bg-[#5c4033]'} scale-105 shadow-2xl shadow-[#5c4033]/40 z-50` :
                    `${isFemale ? 'border-[#a0527a] bg-[#a0527a] hover:bg-[#8b4060]' : 'border-[#8b5a2b] bg-[#8b5a2b] hover:bg-[#704218]'}`}`}
        >
            {/* Inner "Parchment/Paper" Area */}
            <div className="flex flex-col flex-1 bg-[#fdfbf7] m-[3px] rounded-xl p-3 border border-[#e8dcb8] relative overflow-hidden">
                {/* Gender indicator badge */}
                <div className={`absolute -right-1 -top-1 w-6 h-6 rounded-bl-lg flex items-center justify-center text-[10px] font-bold text-white ${isFemale ? 'bg-[#c27ba0]' : 'bg-[#6fa8dc]'}`}>
                    {isFemale ? '♀' : '♂'}
                </div>

                <div className="flex items-start gap-4">
                    {/* Frame Avatar */}
                    <div className={`w-12 h-12 rounded-full flex shrink-0 items-center justify-center border-2 ${isFemale ? 'border-[#c27ba0]/40 bg-[#fce4ec]' : 'border-[#8b5a2b]/30 bg-[#f4efe6]'} text-[#8b5a2b] shadow-sm z-10 overflow-hidden`}>
                        {(typedData as any).avatarUrl ? (
                            <img src={(typedData as any).avatarUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <User size={24} />
                        )}
                    </div>

                    <div className="flex flex-col flex-1 min-w-0 z-10 pt-0.5">
                        <span className="text-[10px] text-[#8b5a2b] font-bold tracking-widest uppercase mb-0.5">Đời thứ {typedData.generation}</span>
                        <h3 className="font-serif font-bold text-sm leading-tight line-clamp-2 text-[#3e2723]" title={typedData.name}>
                            {typedData.name}
                        </h3>
                        {typedData.status && (
                            <span className="inline-block mt-1.5 text-[10px] px-2 py-0.5 rounded-sm bg-[#e8dcb8]/50 text-[#5c4033] border border-[#d2b48c] w-fit font-medium">
                                {typedData.status}
                            </span>
                        )}
                    </div>
                </div>

                <div className="mt-auto z-10 pb-1 pt-1 space-y-1">
                    {typedData.spouse && (
                        <div className="flex items-start gap-1.5 text-[11px] text-[#5c4033]/90">
                            <strong className="text-[#8b5a2b] whitespace-nowrap">
                                {isFemale ? 'Chồng:' : 'Vợ:'}
                            </strong>
                            <span
                                className="leading-tight underline decoration-dotted cursor-pointer hover:text-[#8b5a2b] transition-colors"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    // Find the spouse member by name
                                    const spouseMember = allMembers?.find(m => m.id !== typedData.id && (m.name === typedData.spouse || m.spouse === typedData.name));
                                    if (spouseMember) {
                                        typedData.onFocus?.(spouseMember.id);
                                        typedData.onViewDetails?.(spouseMember.id);
                                    }
                                }}
                                title="Bấm để xem thông tin"
                            >{typedData.spouse}</span>
                        </div>
                    )}
                    {children.length > 0 && (
                        <div className="flex items-center gap-1.5 text-[10px] text-[#5c4033]/70">
                            <span>👶</span>
                            <span>
                                {sons > 0 && <span className="text-[#6fa8dc] font-bold">{sons} trai</span>}
                                {sons > 0 && daughters > 0 && ', '}
                                {daughters > 0 && <span className="text-[#c27ba0] font-bold">{daughters} gái</span>}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Wood Panel Area for Actions */}
            <div className="flex justify-between items-center px-4 py-1.5 -mt-0.5">
                {!isFocused ? (
                    <button
                        onClick={(e) => { e.stopPropagation(); typedData.onFocus?.(typedData.id); }}
                        className="flex items-center gap-1.5 text-[11px] text-[#fdfbf7]/80 hover:text-white uppercase font-bold tracking-wide transition-colors"
                    >
                        <Focus size={14} /> Lấy làm tâm
                    </button>
                ) : (
                    <div className="flex items-center gap-1.5 text-[11px] text-[#e8dcb8] uppercase font-bold tracking-wide">
                        <Focus size={14} /> Tâm điểm
                    </div>
                )}

                <button
                    onClick={(e) => { e.stopPropagation(); typedData.onViewDetails?.(typedData.id); }}
                    className="flex items-center justify-center text-[#fdfbf7]/80 hover:text-white transition-colors p-1"
                    title="Chi Tiết"
                >
                    <Info size={18} />
                </button>
            </div>

            {/* Expand children button */}
            {typedData.hasChildren && (
                <button
                    onClick={(e) => { e.stopPropagation(); typedData.onExpand?.(typedData.id); }}
                    className={`absolute -bottom-3 left-1/2 -translate-x-1/2 z-30 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all shadow-md ${typedData.isExpanded ? 'bg-[#5c4033] border-[#3e2723] text-white' : 'bg-[#fdfbf7] border-[#8b5a2b] text-[#8b5a2b] hover:bg-[#8b5a2b] hover:text-white'}`}
                    title={typedData.isExpanded ? 'Thu gọn nhánh con' : 'Mở rộng thêm đời dưới'}
                >
                    {typedData.isExpanded ? <Minus size={14} /> : <Plus size={14} />}
                </button>
            )}

            {/* Invisible handles for routing */}
            <Handle type="target" position={Position.Top} className="opacity-0 w-1! h-1! border-none!" />
            <Handle type="source" position={Position.Bottom} className="opacity-0 w-1! h-1! border-none!" />
        </div>
    );
});
CustomPersonNode.displayName = 'CustomPersonNode';

const nodeTypes = {
    person: CustomPersonNode,
};

const LayoutFlow = forwardRef(function LayoutFlowInner({
    initialNodes,
    initialEdges,
}: {
    initialNodes: Node[],
    initialEdges: Edge[],
}, ref: React.Ref<{ getNodes: () => Node[], setViewport: (vp: { x: number, y: number, zoom: number }) => void }>) {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const { fitView, getNodes: rfGetNodes, setViewport: rfSetViewport } = useReactFlow();

    useImperativeHandle(ref, () => ({
        getNodes: rfGetNodes,
        setViewport: (vp: { x: number, y: number, zoom: number }) => rfSetViewport(vp, { duration: 0 }),
    }), [rfGetNodes, rfSetViewport]);

    useEffect(() => {
        setNodes(initialNodes);
        setEdges(initialEdges);
        setTimeout(() => {
            fitView({ padding: 0.5, duration: 800 });
        }, 50);
    }, [initialNodes, initialEdges, setNodes, setEdges, fitView]);

    return (
        <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={(e, node) => {
                const m = node.data as any;
                if (m.onViewDetails) m.onViewDetails(node.id);
            }}
            nodeTypes={nodeTypes}
            minZoom={0.2}
            maxZoom={1.5}
            defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
            className="bg-[#f4efe6]"
            fitView
            fitViewOptions={{ padding: 0.5, maxZoom: 1, minZoom: 0.2 }}
            nodesConnectable={false}
            elementsSelectable={false}
            nodesDraggable={false}
            proOptions={{ hideAttribution: true }}
        >
            <Controls
                className="bg-[#fdfbf7] fill-[#5c4033] text-[#5c4033] border border-[#d2b48c] shadow-2xl rounded-xl overflow-hidden mb-20 sm:mb-8 ml-4"
                showInteractive={false}
            />
            <Background color="rgba(139, 90, 43, 0.15)" gap={32} size={1} />
        </ReactFlow>
    );
});

// Elder-friendly Searchable Dropdown
const SearchableDropdown = ({ value, onChange, options, placeholder }: { value: string, onChange: (val: string) => void, options: MemberData[], placeholder: string }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const selectedText = options.find(o => o.id === value)?.name || '';

    const filteredOptions = useMemo(() => {
        const normalizedSearch = removeDiacritics(searchTerm.toLowerCase());
        return options.filter(m => {
            const norm = removeDiacritics(m.name.toLowerCase());
            const spouseNorm = m.spouse ? removeDiacritics(m.spouse.toLowerCase()) : '';
            return norm.includes(normalizedSearch) || spouseNorm.includes(normalizedSearch);
        }).slice(0, 30);
    }, [searchTerm, options]);

    return (
        <div className="relative">
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="w-full bg-white border border-[#d2b48c] hover:border-[#8b5a2b] rounded-xl px-4 py-3.5 sm:py-3 text-[#3e2723] text-sm cursor-pointer flex justify-between items-center transition-colors"
            >
                <span className={value ? 'text-[#3e2723] font-bold' : 'text-[#8b5a2b]/70'}>{value ? selectedText : placeholder}</span>
                <ChevronDown size={16} className={`text-[#8b5a2b] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </div>

            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#fdfbf7] border border-[#d2b48c] rounded-xl shadow-2xl z-60 overflow-hidden">
                    <div className="p-2 border-b border-[#e8dcb8]">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8b5a2b]/60" size={14} />
                            <input
                                type="text"
                                placeholder="Gõ tên không dấu..."
                                className="w-full bg-white border border-[#e8dcb8] rounded-lg py-2.5 sm:py-2 pl-9 pr-3 text-sm text-[#3e2723] focus:outline-none focus:border-[#8b5a2b]"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                onClick={e => e.stopPropagation()}
                                onTouchStart={e => e.stopPropagation()}
                                autoFocus
                            />
                        </div>
                    </div>
                    <div className="max-h-[200px] sm:max-h-[250px] overflow-y-auto">
                        {filteredOptions.length > 0 ? filteredOptions.map(m => (
                            <div
                                key={m.id}
                                onClick={() => { onChange(m.id); setIsOpen(false); setSearchTerm(''); }}
                                className="px-4 py-3 sm:py-2.5 hover:bg-[#8b5a2b]/10 cursor-pointer border-b border-[#e8dcb8] last:border-0"
                            >
                                <div className="text-[#3e2723] text-sm font-bold">{m.name}</div>
                                <div className="text-xs text-[#5c4033]/80 mt-0.5">Đời thứ {m.generation}{` | Sinh: ${m.birthSolar || '-- - -- - ----'}`} {m.parentId ? ` - Bố: ${options.find(p => p.id === m.parentId)?.name || ''}` : ''} {m.spouse ? ` | Vợ/Chồng: ${m.spouse}` : ''}</div>
                            </div>
                        )) : (
                            <div className="p-4 text-center text-[#8b5a2b]/70 text-sm">Không tìm thấy ai</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default function TreeCanvas({ data }: { data: FamilyData }) {
    const [overlay, setOverlay] = useState<Record<string, Record<string, string>>>({});

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('phado_overlay');
            if (stored) {
                try {
                    setOverlay(JSON.parse(stored));
                } catch (e) { }
            }
        }
    }, []);

    const members = useMemo(() => {
        const base = data.members || [];
        if (Object.keys(overlay).length === 0) return base;

        // Fields that should NEVER be overridden by localStorage overlay
        // parentId and childrenIds must come from server data only
        const protectedFields = new Set(['parentId', 'childrenIds', 'id', 'generation']);

        const updated = base.map(m => {
            if (overlay[m.id]) {
                const safeOverlay: Record<string, any> = {};
                for (const [key, val] of Object.entries(overlay[m.id])) {
                    if (!protectedFields.has(key)) {
                        safeOverlay[key] = val;
                    }
                }
                return { ...m, ...safeOverlay };
            }
            return m;
        });

        // Add completely new members from overlay (with parentId allowed for new nodes)
        const existingIds = new Set(base.map(m => String(m.id)));
        const newMembers = Object.keys(overlay)
            .filter(id => !existingIds.has(String(id)) && overlay[id].name)
            .map(id => ({ id, ...overlay[id] } as unknown as MemberData));

        return [...updated, ...newMembers];
    }, [data, overlay]);

    const [focusId, setFocusId] = useState<string | null>(members.length > 0 ? members[0].id : null);
    const [selectedMember, setSelectedMember] = useState<MemberData | null>(null);
    const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

    const [activeMobileTab, setActiveMobileTab] = useState<'search' | 'calc' | null>(null);
    const [mobileSearchTerm, setMobileSearchTerm] = useState('');
    const [isDesktopToolsOpen, setIsDesktopToolsOpen] = useState(true);
    const [desktopSearchTerm, setDesktopSearchTerm] = useState('');
    const [showHelp, setShowHelp] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('phado_hide_help') !== 'true';
        }
        return true;
    });
    const [calcA, setCalcA] = useState('');
    const [calcB, setCalcB] = useState('');
    const [relationPath, setRelationPath] = useState<string[]>([]);
    const [hideFemale, setHideFemale] = useState(false);

    // Compute the relationship path whenever calcA/calcB change
    useEffect(() => {
        if (!calcA || !calcB || calcA === calcB) {
            setRelationPath([]);
            return;
        }

        // Resolve spouses to bloodline
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

        const memberLookup: Record<string, MemberData> = {};
        for (const m of members) memberLookup[m.id] = m;

        const traceAncestors = (startId: string): MemberData[] => {
            const path: MemberData[] = [];
            const visited: Record<string, boolean> = {};
            let curr: MemberData | undefined = memberLookup[startId];
            while (curr && path.length < 50 && !visited[curr.id]) {
                visited[curr.id] = true;
                path.push(curr);
                curr = curr.parentId ? memberLookup[curr.parentId] : undefined;
            }
            return path;
        };

        const pathA = traceAncestors(resolvedA);
        const pathB = traceAncestors(resolvedB);

        let lcaIndexA = -1, lcaIndexB = -1;
        for (let i = 0; i < pathA.length; i++) {
            const found = pathB.findIndex(m => m.id === pathA[i].id);
            if (found !== -1) { lcaIndexA = i; lcaIndexB = found; break; }
        }

        if (lcaIndexA === -1) {
            setRelationPath([]);
            return;
        }

        const pathIds = new Set<string>();
        for (let i = 0; i <= lcaIndexA; i++) pathIds.add(pathA[i].id);
        for (let i = 0; i <= lcaIndexB; i++) pathIds.add(pathB[i].id);
        pathIds.add(calcA);
        pathIds.add(calcB);
        setRelationPath(Array.from(pathIds));
    }, [calcA, calcB, members]);

    useEffect(() => {
        if (!focusId && members.length > 0) {
            setFocusId(members[0].id);
        }
    }, [members, focusId]);

    const handleFocus = useCallback((id: string) => {
        setFocusId(id);
        setSelectedMember(null); // optional: close panel on focus change to declutter
    }, []);

    const handleViewDetails = useCallback((id: string) => {
        const member = members.find(m => m.id === id);
        if (member) setSelectedMember(member as MemberData);
    }, [members]);

    const handleExpand = useCallback((id: string) => {
        setExpandedNodes(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    }, []);

    // Recursively collect all descendants of a node
    const collectDescendants = useCallback((parentId: string, depth: number, maxDepth: number): MemberData[] => {
        if (depth >= maxDepth) return [];
        const children = members.filter(m => m.parentId === parentId);
        const result: MemberData[] = [...children];
        for (const child of children) {
            result.push(...collectDescendants(child.id, depth + 1, maxDepth));
        }
        return result;
    }, [members]);

    const layoutFlowRef = useRef<{ getNodes: () => Node[], setViewport: (vp: { x: number, y: number, zoom: number }) => void }>(null);
    const savedTransformRef = useRef<string>('');
    const savedContainerStyleRef = useRef<{ width: string, height: string }>({ width: '', height: '' });
    const savedWrapperStyleRef = useRef<{ width: string, height: string }>({ width: '', height: '' });

    // Direct DOM manipulation for print — compute scale to fit A4 landscape
    useEffect(() => {
        const handleBeforePrint = () => {
            const viewport = document.querySelector('.react-flow__viewport') as HTMLElement;
            const rfContainer = document.querySelector('.react-flow') as HTMLElement;
            const wrapper = document.getElementById('tree-print-wrapper');
            if (!viewport || !rfContainer) return;

            // Save originals
            savedTransformRef.current = viewport.style.transform;
            savedContainerStyleRef.current = { width: rfContainer.style.width, height: rfContainer.style.height };
            if (wrapper) savedWrapperStyleRef.current = { width: wrapper.style.width, height: wrapper.style.height };

            // Get all node DOM elements to compute bounding box
            const nodeEls = document.querySelectorAll('.react-flow__node');
            if (nodeEls.length === 0) return;

            let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
            nodeEls.forEach(el => {
                const htmlEl = el as HTMLElement;
                const match = htmlEl.style.transform.match(/translate\((-?[\d.]+)px,\s*(-?[\d.]+)px\)/);
                if (match) {
                    const nx = parseFloat(match[1]);
                    const ny = parseFloat(match[2]);
                    const nw = htmlEl.offsetWidth || 280;
                    const nh = htmlEl.offsetHeight || 180;
                    minX = Math.min(minX, nx);
                    minY = Math.min(minY, ny);
                    maxX = Math.max(maxX, nx + nw);
                    maxY = Math.max(maxY, ny + nh);
                }
            });

            if (minX === Infinity) return;

            const treeW = maxX - minX;
            const treeH = maxY - minY;
            const treeCX = minX + treeW / 2;
            const treeCY = minY + treeH / 2;

            // A4 landscape printable area: (297-20)mm × (210-20)mm at 96dpi
            const pageW = 1047;
            const pageH = 718;

            // Scale to fit tree within one page
            const scale = Math.min(pageW / treeW, pageH / treeH);
            const tx = pageW / 2 - treeCX * scale;
            const ty = pageH / 2 - treeCY * scale;

            // Set containers to exact page size
            if (wrapper) {
                wrapper.style.width = `${pageW}px`;
                wrapper.style.height = `${pageH}px`;
            }
            rfContainer.style.width = `${pageW}px`;
            rfContainer.style.height = `${pageH}px`;

            // Apply computed transform — tree fits and centers within page
            viewport.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
            viewport.style.transformOrigin = '0 0';
        };

        const handleAfterPrint = () => {
            const viewport = document.querySelector('.react-flow__viewport') as HTMLElement;
            const rfContainer = document.querySelector('.react-flow') as HTMLElement;
            const wrapper = document.getElementById('tree-print-wrapper');
            if (viewport && savedTransformRef.current) {
                viewport.style.transform = savedTransformRef.current;
            }
            if (rfContainer) {
                rfContainer.style.width = savedContainerStyleRef.current.width;
                rfContainer.style.height = savedContainerStyleRef.current.height;
            }
            if (wrapper) {
                wrapper.style.width = savedWrapperStyleRef.current.width;
                wrapper.style.height = savedWrapperStyleRef.current.height;
            }
        };

        window.addEventListener('beforeprint', handleBeforePrint);
        window.addEventListener('afterprint', handleAfterPrint);
        return () => {
            window.removeEventListener('beforeprint', handleBeforePrint);
            window.removeEventListener('afterprint', handleAfterPrint);
        };
    }, []);

    const handlePrint = useCallback(() => {
        window.print();
    }, []);

    const { elkNodes, elkEdges, initialNodes, initialEdges } = useMemo(() => {
        let subset: MemberData[] = [];

        // Relationship Path Mode: show ONLY the direct path between two people
        if (relationPath.length > 0) {
            const pathSet = new Set(relationPath);
            subset = members.filter(m => pathSet.has(m.id));
        }
        // Focus Mode: only show focused person, their parents, and direct children
        else if (focusId) {
            const focused = members.find(m => m.id === focusId);
            if (focused) {
                subset.push(focused);
                // Parents
                if (focused.parentId) {
                    const parent = members.find(m => m.id === focused.parentId);
                    if (parent) subset.push(parent);
                    // Siblings
                    const siblings = members.filter(m => m.parentId === focused.parentId && m.id !== focusId);
                    subset.push(...siblings);
                }
                // Children
                const children = members.filter(m => m.parentId === focusId);
                subset.push(...children);

                // Expanded descendants: for each child that is expanded, recursively add their descendants
                const addExpanded = (parentId: string) => {
                    if (!expandedNodes.has(parentId)) return;
                    const grandChildren = members.filter(m => m.parentId === parentId);
                    for (const gc of grandChildren) {
                        if (!subset.some(s => s.id === gc.id)) {
                            subset.push(gc);
                        }
                        addExpanded(gc.id); // recursively expand further if those are also expanded
                    }
                };
                // Expand from focused node itself
                addExpanded(focusId);
                // Expand from each direct child
                for (const child of children) {
                    addExpanded(child.id);
                }
            }
        }

        // Filter: hide females if toggle is on (keep females that are on the relationship path)
        if (hideFemale && subset.length > 0) {
            const pathSet = new Set(relationPath);
            subset = subset.filter(m => m.gender !== 'female' || pathSet.has(m.id) || m.id === focusId);
        }

        if (subset.length === 0) subset = members.slice(0, 10);

        const iNodes: Node[] = [];
        const iEdges: Edge[] = [];
        const pathSetForEdges = new Set(relationPath);

        subset.forEach((m: MemberData) => {
            const hasChildren = members.some(c => c.parentId === m.id);
            iNodes.push({
                id: m.id,
                type: 'person',
                position: { x: 0, y: 0 },
                data: {
                    ...m,
                    allMembers: members,
                    onFocus: handleFocus,
                    onViewDetails: handleViewDetails,
                    isFocused: m.id === focusId || (relationPath.length > 0 && (m.id === calcA || m.id === calcB)),
                    hasChildren,
                    isExpanded: expandedNodes.has(m.id),
                    onExpand: handleExpand,
                } as Record<string, unknown>
            });

            if (m.parentId && subset.some(p => p.id === m.parentId)) {
                // IMPORTANT: Prevent drawing child arrow if m is actually just a spouse of parentId.
                // In some flawed data structures, spouses might be linked via parentId.
                const parentNode = subset.find(p => p.id === m.parentId);
                const isSpouseOfParent = parentNode && (parentNode.spouse === m.name || m.spouse === parentNode.name);

                if (!isSpouseOfParent) {
                    // For relationship path mode: edges on the direct path are RED, others are normal
                    const isOnPath = relationPath.length > 0 && pathSetForEdges.has(m.id) && pathSetForEdges.has(m.parentId!);
                    const isOnPathMode = relationPath.length > 0;
                    let edgeStroke = m.id === focusId || m.parentId === focusId ? '#654321' : '#8b5a2b';
                    let edgeWidth = m.id === focusId || m.parentId === focusId ? 5 : 3;
                    if (isOnPath) {
                        edgeStroke = '#dc2626'; // RED for direct path
                        edgeWidth = 5;
                    } else if (isOnPathMode) {
                        edgeStroke = '#8b5a2b'; // normal brown for sibling edges
                        edgeWidth = 2;
                    }
                    iEdges.push({
                        id: `e-${m.parentId}-${m.id}`,
                        source: m.parentId,
                        target: m.id,
                        type: 'smoothstep',
                        animated: false,
                        style: {
                            stroke: edgeStroke,
                            strokeWidth: edgeWidth,
                            opacity: 1
                        },
                        markerEnd: { type: MarkerType.ArrowClosed, color: edgeStroke }
                    });
                }
            }
        });

        const eNodes = iNodes.map((node) => ({ id: node.id, width: nodeWidth, height: nodeHeight }));
        const eEdges = iEdges.map((edge) => ({ id: edge.id, sources: [edge.source], targets: [edge.target] }));

        return { elkNodes: eNodes, elkEdges: eEdges, initialNodes: iNodes, initialEdges: iEdges };
    }, [members, focusId, handleFocus, handleViewDetails, expandedNodes, handleExpand, relationPath, calcA, calcB, hideFemale]);

    const [finalNodes, setFinalNodes] = useState<Node[]>([]);
    const [finalEdges, setFinalEdges] = useState<Edge[]>([]);

    useEffect(() => {
        let isCancelled = false;

        const runLayout = async () => {
            const graph = {
                id: 'root',
                layoutOptions: {
                    'elk.algorithm': 'layered',
                    'elk.direction': 'DOWN',
                    'elk.spacing.nodeNode': '40',
                    'elk.layered.spacing.nodeNodeBetweenLayers': '120',
                    'elk.edgeRouting': 'POLYLINE',
                },
                children: elkNodes,
                edges: elkEdges,
            };
            const layoutedGraph = await elk.layout(graph);
            if (isCancelled) return;

            const newNodes = initialNodes.map((node) => {
                const layoutNode = layoutedGraph.children?.find((n) => n.id === node.id);
                return {
                    ...node,
                    position: { x: layoutNode?.x || 0, y: layoutNode?.y || 0 },
                };
            });
            setFinalNodes(newNodes);
            setFinalEdges(initialEdges);
        };
        runLayout();

        return () => { isCancelled = true; };
    }, [elkNodes, elkEdges, initialNodes, initialEdges]);

    // Relationship Calculator Logic
    const calculateRelation = useCallback((): React.ReactNode => {
        if (!calcA || !calcB || calcA === calcB) return "Vui l\u00F2ng ch\u1ECDn 2 ng\u01B0\u1EDDi kh\u00E1c nhau";

        // Resolve spouses: if a person has no parentId and no children, they may be a spouse
        // Find their partner (the member who lists them as spouse) and use partner's lineage
        const resolveToBloodline = (memberId: string): string => {
            const person = members.find(m => m.id === memberId);
            if (!person) return memberId;
            // If person has parentId, they're already in the bloodline
            if (person.parentId) return memberId;
            // If person has no parentId, check if someone lists them as spouse
            const partner = members.find(m => m.spouse === person.name);
            if (partner) return partner.id;
            return memberId;
        };

        const resolvedA = resolveToBloodline(calcA);
        const resolvedB = resolveToBloodline(calcB);
        const isASpouse = resolvedA !== calcA;
        const isBSpouse = resolvedB !== calcB;

        const memberLookup2: Record<string, MemberData> = {};
        for (const m of members) memberLookup2[m.id] = m;

        const traceAncestors2 = (startId: string): MemberData[] => {
            const path: MemberData[] = [];
            const visited: Record<string, boolean> = {};
            let curr: MemberData | undefined = memberLookup2[startId];
            while (curr && path.length < 50 && !visited[curr.id]) {
                visited[curr.id] = true;
                path.push(curr);
                curr = curr.parentId ? memberLookup2[curr.parentId] : undefined;
            }
            return path;
        };

        const pathA = traceAncestors2(resolvedA);
        const pathB = traceAncestors2(resolvedB);

        let lcaIndexA = -1, lcaIndexB = -1;
        for (let i = 0; i < pathA.length; i++) {
            const found = pathB.findIndex(m => m.id === pathA[i].id);
            if (found !== -1) { lcaIndexA = i; lcaIndexB = found; break; }
        }

        if (lcaIndexA === -1) return "Hai người không có chung Tổ Tiên trong dữ liệu";

        const personA = members.find(m => m.id === calcA) || pathA[0];
        const personB = members.find(m => m.id === calcB) || pathB[0];
        const distA = lcaIndexA;
        const distB = lcaIndexB;
        const genA = pathA[0].generation;
        const genB = pathB[0].generation;
        const diff = genA - genB;
        const spouseNote = (isASpouse || isBSpouse) ? ` (Tính theo dòng họ của ${isASpouse ? `chồng/vợ của ${personA.name}` : `chồng/vợ của ${personB.name}`})` : '';

        let resultTitle = "";
        let resultReason = "";

        // Helper to get relationship term given generation diff and directness
        const getRelationTerm = (genDiff: number, dA: number, dB: number): string => {
            if (genDiff === 0) {
                return 'ANH/CHỊ/EM';
            } else if (genDiff > 0) {
                // A is younger, B is elder
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
            } else {
                // A is elder, B is younger
                const absDiff = Math.abs(genDiff);
                const isDirect = dA === 0;
                if (isDirect) {
                    if (absDiff === 1) return 'CON';
                    if (absDiff === 2) return 'CHÁU';
                    if (absDiff === 3) return 'CHẮT';
                    if (absDiff === 4) return 'CHÚT';
                    if (absDiff === 5) return 'CHÍT';
                    return `HẬU DUỆ (cách ${absDiff} đời)`;
                } else {
                    if (absDiff === 1) return 'CHÁU';
                    if (absDiff === 2) return 'CHÁU';
                    if (absDiff === 3) return 'CHẮT';
                    if (absDiff === 4) return 'CHÚT';
                    if (absDiff === 5) return 'CHÍT';
                    return `HẬU DUỆ (cách ${absDiff} đời)`;
                }
            }
        };

        // A → B
        const termAB = getRelationTerm(diff, distA, distB);
        resultTitle = `${personA.name} gọi ${personB.name} là ${termAB}`;

        // B → A (reverse: swap diff, swap distA/distB)
        const termBA = getRelationTerm(-diff, distB, distA);
        const reverseTitle = `${personB.name} gọi ${personA.name} là ${termBA}`;

        if (diff === 0) {
            const isDirect = (distA === 1 && distB === 1);
            if (isDirect) {
                resultReason = `${personA.name} và ${personB.name} cùng do một cha mẹ sinh ra, đều thuộc Đời thứ ${personA.generation}. Vì là anh chị em ruột, ai lớn tuổi hơn làm Anh/Chị.`;
            } else {
                resultReason = `${personA.name} và ${personB.name} cùng thuộc Đời thứ ${personA.generation}, có chung tổ tiên là ${pathA[lcaIndexA]?.name || 'không rõ'}. Hai người là anh chị em họ, ai lớn tuổi hơn làm Anh/Chị.`;
            }
        } else if (diff > 0) {
            const isDirect = distB === 0;
            if (isDirect) {
                resultReason = `${personB.name} (Đời ${personB.generation}) nằm trên dòng huyết thống trực tiếp của ${personA.name} (Đời ${personA.generation}). ${diff === 1 ? `${personB.name} là cha/mẹ đẻ sinh ra ${personA.name}.` : diff === 2 ? `${personB.name} là ông/bà đẻ sinh ra cha/mẹ của ${personA.name}.` : `${personB.name} cách ${personA.name} ${diff} đời trực hệ.`} Vì vậy ${personA.name} phải gọi ${personB.name} là ${termAB}.`;
            } else {
                resultReason = `${personA.name} (Đời ${personA.generation}) và ${personB.name} (Đời ${personB.generation}) có chung tổ tiên là ${pathA[lcaIndexA]?.name || '(không rõ)'}. ${personB.name} thuộc đời bề trên, cao hơn ${personA.name} ${diff} đời. Theo phả hệ, ${personA.name} phải kính trọng gọi ${personB.name} là ${termAB}.`;
            }
        } else {
            const absDiff = Math.abs(diff);
            const isDirect = distA === 0;
            if (isDirect) {
                resultReason = `${personA.name} (Đời ${personA.generation}) nằm trên dòng huyết thống trực tiếp của ${personB.name} (Đời ${personB.generation}). ${absDiff === 1 ? `${personA.name} đã sinh ra ${personB.name}, nên ${personB.name} là con của ${personA.name}.` : absDiff === 2 ? `${personA.name} là ông/bà, đã sinh ra cha/mẹ của ${personB.name}.` : `${personA.name} cách ${personB.name} ${absDiff} đời trực hệ.`} Vì vậy ${personA.name} gọi ${personB.name} là ${termAB}.`;
            } else {
                resultReason = `${personA.name} (Đời ${personA.generation}) và ${personB.name} (Đời ${personB.generation}) có chung tổ tiên là ${pathA[lcaIndexA]?.name || '(không rõ)'}. ${personA.name} thuộc đời bề trên, cao hơn ${personB.name} ${absDiff} đời. Vì vậy ${personA.name} gọi ${personB.name} là ${termAB}.`;
            }
        }

        return (
            <div className="flex flex-col items-center gap-2.5">
                <div className="w-full space-y-2">
                    <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center">
                        <span className="text-red-700 text-[15px] font-bold uppercase block">🔴 {resultTitle}</span>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center">
                        <span className="text-blue-700 text-[15px] font-bold uppercase block">🔵 {reverseTitle}</span>
                    </div>
                </div>
                <div className="text-[13px] font-normal text-[#5c4033]/90 bg-[#e8dcb8]/40 p-3.5 rounded-xl text-left border border-[#d2b48c] shadow-inner leading-relaxed">
                    <span className="text-[#8b5a2b] font-bold block mb-1">🧐 Lý giải cặn kẽ:</span>
                    {resultReason}{spouseNote}
                </div>
            </div>
        );
    }, [calcA, calcB, members]);

    return (
        <div id="tree-print-wrapper" className="w-full h-full relative overflow-hidden bg-[#f4efe6]">
            {/* Desktop Side Navigation / Widgets Toggle Button */}
            {!isDesktopToolsOpen && (
                <div data-print-hide className="hidden sm:flex absolute top-24 right-6 z-40 flex-col gap-3 print:hidden">
                    <button
                        onClick={() => setIsDesktopToolsOpen(true)}
                        className="flex items-center justify-center bg-[#fdfbf7]/95 backdrop-blur-md border border-[#d2b48c] shadow-xl rounded-full p-4 hover:scale-105 transition-transform text-[#8b5a2b] font-bold gap-2"
                    >
                        <Search size={22} /> Mở Công Cụ Thêm
                    </button>
                </div>
            )}

            {/* Desktop Side Navigation / Widgets */}
            <div data-print-hide className={`hidden sm:flex absolute top-24 right-6 bottom-6 flex-col gap-4 z-40 w-[340px] pointer-events-none transition-all duration-300 ${isDesktopToolsOpen ? 'translate-x-0 opacity-100' : 'translate-x-[120%] opacity-0'}`}>
                {/* Desktop Search widget */}
                <div className="bg-[#fdfbf7]/95 backdrop-blur-md border border-[#d2b48c] shadow-xl rounded-2xl p-4 w-full pointer-events-auto shrink-0">
                    <div className="flex justify-between items-center mb-3">
                        <h2 className="text-[#5c4033] font-serif font-bold text-lg flex items-center gap-2">
                            <Search size={18} /> Tìm thành viên
                        </h2>
                        <button onClick={() => setIsDesktopToolsOpen(false)} className="text-[#8b5a2b] hover:text-[#5c4033] bg-[#e8dcb8]/40 hover:bg-[#d2b48c]/40 p-1.5 rounded-full transition-colors"><X size={16} /></button>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-[14px] text-[#8b5a2b]" size={16} />
                        <input
                            type="text"
                            placeholder="Gõ tên không dấu (ví dụ: giang)..."
                            className="w-full bg-white border border-[#d2b48c] rounded-xl py-3 pl-10 pr-4 text-sm text-[#3e2723] focus:outline-none focus:border-[#8b5a2b] transition-colors shadow-inner"
                            value={desktopSearchTerm}
                            onChange={(e) => setDesktopSearchTerm(e.target.value)}
                        />
                    </div>
                    {desktopSearchTerm.length > 1 && (
                        <div className="max-h-[250px] overflow-y-auto bg-white rounded-xl border border-[#e8dcb8] mt-2">
                            {members.filter(m => { const s = removeDiacritics(desktopSearchTerm.toLowerCase()); return removeDiacritics(m.name.toLowerCase()).includes(s) || (m.spouse && removeDiacritics(m.spouse.toLowerCase()).includes(s)); }).slice(0, 20).map(m => (
                                <div
                                    key={m.id}
                                    onClick={() => {
                                        setFocusId(m.id);
                                        setDesktopSearchTerm('');
                                        setRelationPath([]);
                                    }}
                                    className="px-3 py-2.5 border-b border-[#e8dcb8] last:border-b-0 hover:bg-[#8b5a2b]/10 cursor-pointer"
                                >
                                    <div className="text-[#3e2723] text-sm font-bold">{m.name}</div>
                                    <div className="text-xs text-[#5c4033]/80 mt-0.5">Đời thứ {m.generation}{` | Sinh: ${m.birthSolar || '-- - -- - ----'}`} {m.parentId ? ` - Bố: ${members.find(p => p.id === m.parentId)?.name || ''}` : ''} {m.spouse ? ` | Vợ/Chồng: ${m.spouse}` : ''}</div>
                                </div>
                            ))}
                            {members.filter(m => { const s = removeDiacritics(desktopSearchTerm.toLowerCase()); return removeDiacritics(m.name.toLowerCase()).includes(s) || (m.spouse && removeDiacritics(m.spouse.toLowerCase()).includes(s)); }).length === 0 && (
                                <p className="text-sm text-[#8b5a2b]/80 text-center italic p-3">Không tìm thấy</p>
                            )}
                        </div>
                    )}
                </div>

                {/* Desktop Calculator widget */}
                <div className="bg-[#fdfbf7]/95 backdrop-blur-md border border-[#e8dcb8] rounded-2xl shadow-xl p-5 pointer-events-auto flex-1 flex flex-col min-h-0 overflow-y-auto">
                    <div className="flex justify-between items-center mb-5 shrink-0">
                        <h3 className="text-[#5c4033] font-serif font-bold text-lg flex items-center gap-2">
                            <Calculator size={18} /> Phép tính xưng hô
                        </h3>
                    </div>
                    <div className="space-y-4 shrink-0">
                        <div>
                            <label className="text-xs text-[#8b5a2b] mb-1.5 block font-bold uppercase tracking-wider">Làm A là người hỏi</label>
                            <SearchableDropdown value={calcA} onChange={setCalcA} options={members} placeholder="-- Chọn người A --" />
                        </div>
                        <div>
                            <label className="text-xs text-[#8b5a2b] mb-1.5 block font-bold uppercase tracking-wider">Gọi B là gì?</label>
                            <SearchableDropdown value={calcB} onChange={setCalcB} options={members} placeholder="-- Chọn người B --" />
                        </div>
                        {calcA && calcB && (
                            <div className="mt-4 p-4 rounded-xl bg-[#e8dcb8]/40 border-2 border-[#d2b48c] shadow-inner">
                                <div className="text-[#5c4033] text-[15px] font-bold text-center leading-relaxed">
                                    {calculateRelation()}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Desktop Help + Print + Male-Only Toggle Buttons */}
            <div data-print-hide className="hidden sm:flex absolute bottom-6 right-[380px] z-40 gap-2 print:hidden">
                <button
                    onClick={() => setHideFemale(!hideFemale)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-full shadow-lg font-bold text-sm transition-all hover:scale-105 border ${hideFemale
                        ? 'bg-[#6fa8dc] text-white border-[#5a8fbd] hover:bg-[#5a8fbd]'
                        : 'bg-[#fdfbf7] text-[#8b5a2b] border-[#d2b48c] hover:bg-[#e8dcb8]'
                        }`}
                    title={hideFemale ? 'Đang ẩn phụ nữ — bấm để hiện lại' : 'Bấm để chỉ hiện Đinh Nam (ẩn phụ nữ)'}
                >
                    {hideFemale ? '♂ Đinh Nam' : '👨‍👩 Tất Cả'}
                </button>
                <button onClick={handlePrint} className="flex items-center gap-2 bg-[#fdfbf7] hover:bg-[#e8dcb8] text-[#8b5a2b] border border-[#d2b48c] px-4 py-2.5 rounded-full shadow-lg font-bold text-sm transition-transform hover:scale-105">
                    <Printer size={18} /> In Phả Đồ
                </button>
                <button onClick={() => setShowHelp(true)} className="flex items-center gap-2 bg-[#8b5a2b] hover:bg-[#5c4033] text-white px-4 py-2.5 rounded-full shadow-lg font-bold text-sm transition-transform hover:scale-105">
                    <HelpCircle size={18} /> Hướng Dẫn
                </button>
            </div>

            {/* Mobile Bottom Navigation Bar */}
            <div data-print-hide className="fixed sm:hidden bottom-0 left-0 right-0 h-16 bg-[#fdfbf7] border-t-2 border-[#d2b48c] flex justify-around items-center z-50 shadow-[0_-10px_30px_rgba(92,64,51,0.15)] pb-safe">
                <button onClick={() => setActiveMobileTab('search')} className={`flex flex-col items-center justify-center w-full h-full transition-colors ${activeMobileTab === 'search' ? 'text-[#5c4033] bg-[#e8dcb8]/40' : 'text-[#8b5a2b] hover:bg-[#e8dcb8]/20'}`}>
                    <Search size={22} className={activeMobileTab === 'search' ? 'scale-110 transition-transform' : ''} />
                    <span className="text-[11px] mt-1 font-bold">Tìm Người</span>
                </button>
                <div className="w-[2px] h-8 bg-[#e8dcb8]"></div>
                <button onClick={() => setActiveMobileTab('calc')} className={`flex flex-col items-center justify-center w-full h-full transition-colors ${activeMobileTab === 'calc' ? 'text-[#5c4033] bg-[#e8dcb8]/40' : 'text-[#8b5a2b] hover:bg-[#e8dcb8]/20'}`}>
                    <Calculator size={22} className={activeMobileTab === 'calc' ? 'scale-110 transition-transform' : ''} />
                    <span className="text-[11px] mt-1 font-bold">Xưng Hô</span>
                </button>
                <div className="w-[2px] h-8 bg-[#e8dcb8]"></div>
                <button onClick={() => setHideFemale(!hideFemale)} className={`flex flex-col items-center justify-center w-full h-full transition-colors ${hideFemale ? 'text-white bg-[#6fa8dc]' : 'text-[#8b5a2b] hover:bg-[#e8dcb8]/20'}`}>
                    <User size={22} />
                    <span className="text-[11px] mt-1 font-bold">{hideFemale ? '♂ Nam' : '👥 Tất Cả'}</span>
                </button>
                <div className="w-[2px] h-8 bg-[#e8dcb8]"></div>
                <button onClick={() => setShowHelp(true)} className="flex flex-col items-center justify-center w-full h-full text-[#8b5a2b] hover:bg-[#e8dcb8]/20 transition-colors">
                    <HelpCircle size={22} />
                    <span className="text-[11px] mt-1 font-bold">HDSD</span>
                </button>
            </div>

            {/* Mobile Full Screen modals */}
            {activeMobileTab && (
                <div data-print-hide className="fixed inset-0 z-50 sm:hidden bg-[#fdfbf7] flex flex-col h-[100dvh] animate-in slide-in-from-bottom-full">

                    <div className="flex justify-between items-center px-5 shrink-0">
                        <h2 className="text-[#5c4033] font-serif font-bold text-xl items-center gap-2 flex">
                            {activeMobileTab === 'search' ? <><Search size={20} /> Tìm thành viên</> : <><Calculator size={20} /> Phép Tính Xưng Hô</>}
                        </h2>
                        <button onClick={() => setActiveMobileTab(null)} className="p-2 bg-[#e8dcb8]/50 rounded-full text-[#8b5a2b]"><X size={20} /></button>
                    </div>

                    <div className="p-5 overflow-y-auto flex-1">
                        {activeMobileTab === 'search' && (
                            <div className="space-y-4">
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8b5a2b]" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Gõ tên cần tìm (ví dụ: giang)"
                                        className="w-full bg-white border-2 border-[#d2b48c] rounded-xl py-4 pl-12 pr-4 text-base text-[#3e2723] focus:outline-none focus:border-[#8b5a2b] shadow-inner"
                                        value={mobileSearchTerm}
                                        onChange={(e) => setMobileSearchTerm(e.target.value)}
                                        autoFocus
                                    />
                                </div>
                                <div className="max-h-[50vh] overflow-y-auto bg-white rounded-xl border border-[#e8dcb8]">
                                    {mobileSearchTerm.length > 1 ? (
                                        members.filter(m => { const s = removeDiacritics(mobileSearchTerm.toLowerCase()); return removeDiacritics(m.name.toLowerCase()).includes(s) || (m.spouse && removeDiacritics(m.spouse.toLowerCase()).includes(s)); }).slice(0, 20).map(m => (
                                            <div
                                                key={m.id}
                                                onClick={() => {
                                                    setFocusId(m.id);
                                                    setActiveMobileTab(null);
                                                    setMobileSearchTerm('');
                                                    setCalcA('');
                                                    setCalcB('');
                                                    setRelationPath([]);
                                                }}
                                                className="px-4 py-3 border-b border-[#e8dcb8] last:border-b-0 hover:bg-[#8b5a2b]/10 active:bg-[#8b5a2b]/20 cursor-pointer"
                                            >
                                                <div className="text-[#3e2723] text-sm font-bold">{m.name}</div>
                                                <div className="text-xs text-[#5c4033]/80 mt-0.5">Đời thứ {m.generation}{` | Sinh: ${m.birthSolar || '-- - -- - ----'}`} {m.parentId ? ` - Bố: ${members.find(p => p.id === m.parentId)?.name || ''}` : ''} {m.spouse ? ` | Vợ/Chồng: ${m.spouse}` : ''}</div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-[#8b5a2b]/90 text-center italic bg-[#f4efe6] p-3 rounded-lg">Bạn chỉ cần gõ tên chữ thường không dấu. Hệ thống sẽ lọc kết quả bên dưới để bạn chọn.</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeMobileTab === 'calc' && (
                            <div className="space-y-5">
                                <div>
                                    <label className="text-sm text-[#8b5a2b] mb-2 block font-bold uppercase">1. Chọn người hỏi (A)</label>
                                    <SearchableDropdown value={calcA} onChange={setCalcA} options={members} placeholder="-- Chọn người A --" />
                                </div>
                                <div>
                                    <label className="text-sm text-[#8b5a2b] mb-2 block font-bold uppercase">2. Chọn người bị gọi (B)</label>
                                    <SearchableDropdown value={calcB} onChange={setCalcB} options={members} placeholder="-- Chọn người B --" />
                                </div>
                                {calcA && calcB && (
                                    <div className="mt-4 p-5 rounded-2xl bg-[#e8dcb8]/30 border-2 border-[#d2b48c]">
                                        <div className="text-[#5c4033] text-lg font-bold text-center leading-relaxed">
                                            {calculateRelation()}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Help / Instruction Modal */}
            {showHelp && (
                <div data-print-hide className="fixed inset-0 z-100 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-[#3e2723]/60 backdrop-blur-sm" onClick={() => setShowHelp(false)}></div>
                    <div className="bg-[#fdfbf7] w-full max-w-lg rounded-2xl shadow-2xl relative flex flex-col overflow-hidden animate-in zoom-in-95 border-2 border-[#d2b48c]">
                        <div className="bg-[#5c4033] text-[#fdfbf7] p-4 text-center relative">
                            <button onClick={() => setShowHelp(false)} className="absolute right-3 top-3 text-white/70 hover:text-white p-1"><X size={20} /></button>
                            <h2 className="text-2xl font-serif font-bold">Hướng Dẫn Sử Dụng</h2>
                            <p className="text-sm text-[#e8dcb8] opacity-90">Sổ Tay Gia Phả Điện Tử</p>
                        </div>
                        <div className="p-5 space-y-4 overflow-y-auto max-h-[60vh] text-[#3e2723] text-[15px] leading-relaxed">
                            {/* Desktop-specific instructions */}
                            <div className="hidden sm:block">
                                <h3 className="font-bold text-[#5c4033] text-lg mb-3 border-b border-[#e8dcb8] pb-2">💻 Trên Máy Tính</h3>
                                <div className="space-y-3">
                                    <div className="flex gap-3 items-start"><span className="shrink-0 w-7 h-7 rounded-full bg-[#8b5a2b] text-white flex items-center justify-center text-sm font-bold">1</span><div><strong>Di chuyển:</strong> Giữ chuột trái và kéo để dịch chuyển phả đồ. Lăn con lăn chuột để phóng to/thu nhỏ.</div></div>
                                    <div className="flex gap-3 items-start"><span className="shrink-0 w-7 h-7 rounded-full bg-[#8b5a2b] text-white flex items-center justify-center text-sm font-bold">2</span><div><strong>Xem nhánh khác:</strong> Bấm nút <span className="inline-block bg-[#8b5a2b] text-white px-1.5 py-0.5 rounded text-xs">Lấy làm tâm</span> trên thẻ bất kỳ để hiển thị cha mẹ, anh chị em, và con cái của người đó.</div></div>
                                    <div className="flex gap-3 items-start"><span className="shrink-0 w-7 h-7 rounded-full bg-[#8b5a2b] text-white flex items-center justify-center text-sm font-bold">3</span><div><strong>Xem chi tiết:</strong> Bấm vào thẻ hoặc nút <span className="inline-block bg-[#e8dcb8] text-[#5c4033] px-1.5 py-0.5 rounded text-xs">ⓘ</span> ở góc dưới để mở bảng thông tin chi tiết bên phải.</div></div>
                                    <div className="flex gap-3 items-start"><span className="shrink-0 w-7 h-7 rounded-full bg-[#8b5a2b] text-white flex items-center justify-center text-sm font-bold">4</span><div><strong>Tìm kiếm:</strong> Dùng ô tìm kiếm ở góc phải, gõ tên không dấu (ví dụ &quot;giang&quot;), hệ thống tự động zoom tới người đó.</div></div>
                                    <div className="flex gap-3 items-start"><span className="shrink-0 w-7 h-7 rounded-full bg-[#8b5a2b] text-white flex items-center justify-center text-sm font-bold">5</span><div><strong>Phép tính Xưng hô:</strong> Chọn 2 người (A và B), hệ thống sẽ cho biết A gọi B là gì kèm lý giải chi tiết.</div></div>
                                    <div className="flex gap-3 items-start"><span className="shrink-0 w-7 h-7 rounded-full bg-[#8b5a2b] text-white flex items-center justify-center text-sm font-bold">6</span><div><strong>Ẩn/Hiện công cụ:</strong> Bấm dấu <span className="inline-block bg-[#e8dcb8] text-[#5c4033] px-1.5 py-0.5 rounded text-xs">✕</span> trên bảng Tìm Kiếm để thu gọn bảng, nhấn nút &quot;Mở Công Cụ Thêm&quot; để mở lại.</div></div>
                                </div>
                            </div>
                            {/* Mobile-specific instructions */}
                            <div className="sm:hidden">
                                <h3 className="font-bold text-[#5c4033] text-lg mb-3 border-b border-[#e8dcb8] pb-2">📱 Trên Điện Thoại</h3>
                                <div className="space-y-3">
                                    <div className="flex gap-3 items-start"><span className="shrink-0 w-7 h-7 rounded-full bg-[#8b5a2b] text-white flex items-center justify-center text-sm font-bold">1</span><div><strong>Di chuyển:</strong> Dùng ngón tay chạm và kéo để dịch phả đồ. Chụm/mở 2 ngón tay để phóng to/thu nhỏ.</div></div>
                                    <div className="flex gap-3 items-start"><span className="shrink-0 w-7 h-7 rounded-full bg-[#8b5a2b] text-white flex items-center justify-center text-sm font-bold">2</span><div><strong>Xem nhánh khác:</strong> Chạm nút <span className="inline-block bg-[#8b5a2b] text-white px-1.5 py-0.5 rounded text-xs">Lấy làm tâm</span> trên thẻ bất kỳ.</div></div>
                                    <div className="flex gap-3 items-start"><span className="shrink-0 w-7 h-7 rounded-full bg-[#8b5a2b] text-white flex items-center justify-center text-sm font-bold">3</span><div><strong>Xem chi tiết:</strong> Chạm vào thẻ hoặc nút ⓘ ở góc dưới thẻ để mở bảng thông tin.</div></div>
                                    <div className="flex gap-3 items-start"><span className="shrink-0 w-7 h-7 rounded-full bg-[#8b5a2b] text-white flex items-center justify-center text-sm font-bold">4</span><div><strong>Thanh công cụ dưới:</strong> Bấm &quot;Tìm Người&quot; để tìm kiếm, &quot;Xưng Hô&quot; để tính quan hệ, &quot;HDSD&quot; để xem lại hướng dẫn này.</div></div>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 border-t border-[#e8dcb8] bg-[#f4efe6] flex flex-col gap-3">
                            <label className="flex items-center gap-3 cursor-pointer text-sm text-[#5c4033]">
                                <input type="checkbox" className="w-5 h-5 accent-[#8b5a2b] rounded" onChange={(e) => { if (e.target.checked) localStorage.setItem('phado_hide_help', 'true'); else localStorage.removeItem('phado_hide_help'); }} />
                                Không hiện lại khi mở trang
                            </label>
                            <button onClick={() => setShowHelp(false)} className="w-full bg-[#8b5a2b] hover:bg-[#5c4033] text-white font-bold text-lg py-3 rounded-xl shadow-md transition-colors">
                                Đã Hiểu, Đóng Lại ✓
                            </button>
                        </div>
                    </div>
                </div>
            )
            }

            {/* Main Canvas Area */}
            {
                finalNodes.length > 0 ? (
                    <ReactFlowProvider>
                        <LayoutFlow ref={layoutFlowRef} initialNodes={finalNodes} initialEdges={finalEdges} />
                    </ReactFlowProvider>
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#5c4033] font-serif animated-pulse">Đang định dạng thẻ...</div>
                )
            }

            {/* Side Details Panel */}
            <MemberSidePanel member={selectedMember} onClose={() => setSelectedMember(null)} allMembers={members} onViewMember={handleViewDetails} />
        </div >
    );
}

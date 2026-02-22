"use client";

import React, { useCallback, useMemo, memo, useState, useEffect } from 'react';
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
import { Info, Calculator, X, ChevronRight, User, CalendarDays, Search, Focus, ChevronDown, Map, HelpCircle } from 'lucide-react';

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

    return (
        <div
            onClick={() => typedData.onViewDetails?.(typedData.id)}
            className={`relative flex flex-col w-[280px] min-h-[160px] h-auto rounded-2xl border-[3px] transition-all cursor-pointer shadow-xl overflow-hidden group
            ${isFocused ? 'border-[#5c4033] bg-[#5c4033] scale-105 shadow-2xl shadow-[#5c4033]/40 z-50' :
                    'border-[#8b5a2b] bg-[#8b5a2b] hover:bg-[#704218]'}`}
        >
            {/* Inner "Parchment/Paper" Area */}
            <div className="flex flex-col flex-1 bg-[#fdfbf7] m-[3px] rounded-xl p-3 border border-[#e8dcb8] relative overflow-hidden">
                {/* Decorative gender corner ribbon */}
                <div className={`absolute -right-6 -top-6 w-12 h-12 rotate-45 ${typedData.gender === 'female' ? 'bg-[#c27ba0]' : 'bg-[#6fa8dc]'} opacity-30`}></div>

                <div className="flex items-start gap-4">
                    {/* Frame Avatar */}
                    <div className="w-12 h-12 rounded-full flex shrink-0 items-center justify-center border-2 border-[#8b5a2b]/30 bg-[#f4efe6] text-[#8b5a2b] shadow-sm z-10">
                        <User size={24} />
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

                <div className="mt-auto z-10 pb-1 pt-1">
                    {typedData.spouse && (
                        <div className="flex items-start gap-1.5 text-[11px] text-[#5c4033]/90">
                            <span className="text-[#c27ba0] text-xs leading-none mt-[1px]">❤</span>
                            <span className="leading-tight">{typedData.spouse}</span>
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

function LayoutFlow({
    initialNodes,
    initialEdges,
}: {
    initialNodes: Node[],
    initialEdges: Edge[],
}) {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const { fitView } = useReactFlow();

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
                // Ensure clicks always trigger details even if internal card click fails
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
}

// Elder-friendly Searchable Dropdown
const SearchableDropdown = ({ value, onChange, options, placeholder }: { value: string, onChange: (val: string) => void, options: MemberData[], placeholder: string }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const selectedText = options.find(o => o.id === value)?.name || '';

    const filteredOptions = useMemo(() => {
        const normalizedSearch = removeDiacritics(searchTerm.toLowerCase());
        return options.filter(m => removeDiacritics(m.name.toLowerCase()).includes(normalizedSearch)).slice(0, 30);
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
                                <div className="text-xs text-[#5c4033]/80 mt-0.5">Đời thứ {m.generation} {m.spouse ? ` - Vợ/C: ${m.spouse}` : ''}</div>
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

// Side Panel Component
const MemberSidePanel = ({ member, onClose }: { member: MemberData | null, onClose: () => void }) => {
    if (!member) return null;
    return (
        <div className="absolute top-0 right-0 bottom-0 w-full md:w-[400px] bg-[#fcfaf5] border-l border-[#d2b48c] shadow-2xl z-50 flex flex-col transform transition-transform duration-300 translate-x-0">
            <div className="p-6 border-b border-[#e8dcb8] flex justify-between items-center bg-[#f7f3e8]">
                <h2 className="text-xl font-serif text-[#5c4033] font-bold">Thông tin chi tiết</h2>
                <button onClick={onClose} className="text-[#8b5a2b] hover:text-[#5c4033] bg-[#e8dcb8]/40 hover:bg-[#d2b48c]/40 p-2 rounded-full transition-colors"><X size={20} /></button>
            </div>
            <div className="p-6 flex-1 overflow-y-auto">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-24 h-24 rounded-full bg-[#f4efe6] border-2 border-[#8b5a2b]/30 flex items-center justify-center mb-4 shadow-md text-[#8b5a2b]">
                        <User size={40} className="text-[#8b5a2b]" />
                    </div>
                    <h3 className="text-2xl font-serif font-bold text-[#3e2723] text-center mb-1">{member.name}</h3>
                    <span className="text-[#8b5a2b] text-sm font-bold uppercase tracking-wider">Đời thứ {member.generation}</span>
                    {member.status && (
                        <span className="mt-3 text-xs px-3 py-1 rounded-sm bg-[#e8dcb8]/60 text-[#5c4033] border border-[#d2b48c] font-medium">
                            {member.status}
                        </span>
                    )}
                </div>

                <div className="space-y-4">
                    <div className="bg-[#f7f3e8] p-4 rounded-xl border border-[#e8dcb8]">
                        <div className="flex items-center gap-3 mb-3">
                            <CalendarDays size={18} className="text-[#8b5a2b]" />
                            <span className="text-sm text-[#5c4033]">Năm sinh:</span>
                            <span className="text-sm text-[#3e2723] font-bold ml-auto">{member.birthSolar || 'Không rõ'}</span>
                        </div>
                        {member.spouse && (
                            <div className="flex items-center gap-3 pt-3 border-t border-[#e8dcb8]">
                                <User size={18} className="text-[#c27ba0]" />
                                <span className="text-sm text-[#5c4033]">Vợ/Chồng:</span>
                                <span className="text-sm text-[#3e2723] font-bold ml-auto text-right line-clamp-2">{member.spouse}</span>
                            </div>
                        )}
                    </div>

                    <button className="w-full mt-6 py-3.5 bg-[#8b5a2b] hover:bg-[#704218] text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2 shadow-md">
                        Cập Nhật Hồ Sơ <ChevronRight size={16} />
                    </button>
                    <p className="text-center text-xs text-[#8b5a2b]/80 mt-2 italic">Dành cho việc thêm thông tin ngày tháng năm</p>
                </div>
            </div>
        </div>
    );
};

export default function TreeCanvas({ data }: { data: FamilyData }) {
    const members = useMemo(() => data.members || [], [data]);

    const [focusId, setFocusId] = useState<string | null>(members.length > 0 ? members[0].id : null);
    const [selectedMember, setSelectedMember] = useState<MemberData | null>(null);

    const [activeMobileTab, setActiveMobileTab] = useState<'search' | 'calc' | null>(null);
    const [isDesktopToolsOpen, setIsDesktopToolsOpen] = useState(true);
    const [showHelp, setShowHelp] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('phado_hide_help') !== 'true';
        }
        return true;
    });
    const [calcA, setCalcA] = useState('');
    const [calcB, setCalcB] = useState('');

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

    const { elkNodes, elkEdges, initialNodes, initialEdges } = useMemo(() => {
        let subset: MemberData[] = [];

        // Focus Mode: only show focused person, their parents, and direct children
        if (focusId) {
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
            }
        }

        if (subset.length === 0) subset = members.slice(0, 10);

        const iNodes: Node[] = [];
        const iEdges: Edge[] = [];

        subset.forEach((m: MemberData) => {
            iNodes.push({
                id: m.id,
                type: 'person',
                position: { x: 0, y: 0 },
                data: {
                    ...m,
                    onFocus: handleFocus,
                    onViewDetails: handleViewDetails,
                    isFocused: m.id === focusId
                } as Record<string, unknown>
            });

            if (m.parentId && subset.some(p => p.id === m.parentId)) {
                iEdges.push({
                    id: `e-${m.parentId}-${m.id}`,
                    source: m.parentId,
                    target: m.id,
                    type: 'smoothstep',
                    animated: false,
                    style: {
                        stroke: m.id === focusId || m.parentId === focusId ? '#654321' : '#8b5a2b',
                        strokeWidth: m.id === focusId || m.parentId === focusId ? 5 : 3,
                        opacity: m.id === focusId || m.parentId === focusId ? 1 : 0.6
                    },
                    markerEnd: { type: MarkerType.ArrowClosed, color: m.id === focusId || m.parentId === focusId ? '#654321' : '#8b5a2b' }
                });
            }
        });

        const eNodes = iNodes.map((node) => ({ id: node.id, width: nodeWidth, height: nodeHeight }));
        const eEdges = iEdges.map((edge) => ({ id: edge.id, sources: [edge.source], targets: [edge.target] }));

        return { elkNodes: eNodes, elkEdges: eEdges, initialNodes: iNodes, initialEdges: iEdges };
    }, [members, focusId, handleFocus, handleViewDetails]);

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
        if (!calcA || !calcB || calcA === calcB) return "Vui lòng chọn 2 người khác nhau";
        const pathA: MemberData[] = [];
        let currA = members.find(m => m.id === calcA);
        while (currA) { pathA.push(currA); currA = currA.parentId ? members.find(m => m.id === currA?.parentId) : undefined; }

        const pathB: MemberData[] = [];
        let currB = members.find(m => m.id === calcB);
        while (currB) { pathB.push(currB); currB = currB.parentId ? members.find(m => m.id === currB?.parentId) : undefined; }

        let lcaIndexA = -1, lcaIndexB = -1;
        for (let i = 0; i < pathA.length; i++) {
            const found = pathB.findIndex(m => m.id === pathA[i].id);
            if (found !== -1) { lcaIndexA = i; lcaIndexB = found; break; }
        }

        if (lcaIndexA === -1) return "Hai người không có chung Tổ Tiên trong dữ liệu";

        const personA = pathA[0];
        const personB = pathB[0];
        const distA = lcaIndexA;
        const distB = lcaIndexB;
        const diff = personA.generation - personB.generation;

        let resultTitle = "";
        let resultReason = "";

        if (diff === 0) {
            const isDirect = (distA === 1 && distB === 1);
            resultTitle = `A gọi B là Anh/Chị/Em`;
            resultReason = `A và B ngang hàng ngang vế bới cùng thuộc Đời thứ ${personA.generation}. Do đó tuổi ai lớn hơn sẽ làm Anh/Chị. ${isDirect ? '(Là anh chị em ruột)' : '(Là anh chị em họ)'}.`;
        } else if (diff > 0) {
            let term = "";
            let isDirect = distB === 0;
            if (isDirect) {
                if (diff === 1) term = "CHA / MẸ";
                else if (diff === 2) term = "ÔNG / BÀ";
                else if (diff === 3) term = "CỤ (Cố)";
                else if (diff === 4) term = "KỴ (Sơ)";
                else term = `TỔ TIÊN (cách ${diff} đời)`;
            } else {
                if (diff === 1) term = "BÁC / CHÚ / CÔ";
                else if (diff === 2) term = "ÔNG / BÀ";
                else if (diff === 3) term = "CỤ (Cố)";
                else if (diff === 4) term = "KỴ (Sơ)";
                else term = `TIÊN TỔ (cách ${diff} đời)`;
            }
            resultTitle = `A gọi B là ${term}`;
            resultReason = `Tuy về mặt tuổi tác B có thể nhỏ tuổi hơn A, nhưng xét theo gia phả bề bậc thì A thuộc bề dưới (Đời ${personA.generation}), còn B thuộc bề trên (Đời ${personB.generation}). Do B cao hơn A tới ${diff} đời, theo truyền thống dòng họ A bắt buộc kính trọng gọi B là ${term}.`;
        } else {
            const absDiff = Math.abs(diff);
            let term = "";
            let isDirect = distA === 0;
            if (isDirect) {
                if (absDiff === 1) term = "CON";
                else if (absDiff === 2) term = "CHÁU";
                else if (absDiff === 3) term = "CHẮT";
                else if (absDiff === 4) term = "CHÚT";
                else if (absDiff === 5) term = "CHÍT";
                else term = `HẬU DUỆ (cách ${absDiff} đời)`;
            } else {
                if (absDiff === 1) term = "CHÁU";
                else if (absDiff === 2) term = "CHÁU";
                else if (absDiff === 3) term = "CHẮT";
                else if (absDiff === 4) term = "CHÚT";
                else if (absDiff === 5) term = "CHÍT";
                else term = `HẬU DUỆ (cách ${absDiff} đời)`;
            }
            resultTitle = `A gọi B là ${term}`;
            resultReason = `Dù A có thể ít tuổi hơn, mang thân hình một đứa trẻ con, nhưng bậc hàm xét theo phả hệ thì A thuộc bề trên (Đời ${personA.generation}), còn B bề dưới (Đời ${personB.generation}). Do A cao hơn B ${absDiff} đời vế, nên B phải xưng con cháu với A. Suy ra A gọi B là ${term}.`;
        }

        return (
            <div className="flex flex-col items-center gap-2.5">
                <span className="text-[#5c4033] text-[17px] font-bold uppercase block">{resultTitle}</span>
                <div className="text-[13px] font-normal text-[#5c4033]/90 bg-[#e8dcb8]/40 p-3.5 rounded-xl text-left border border-[#d2b48c] shadow-inner leading-relaxed">
                    <span className="text-[#8b5a2b] font-bold block mb-1">🧐 Lý giải cặn kẽ:</span>
                    {resultReason}
                </div>
            </div>
        );
    }, [calcA, calcB, members]);

    return (
        <div className="w-full h-full relative overflow-hidden bg-[#f4efe6]">
            {/* Desktop Side Navigation / Widgets Toggle Button */}
            {!isDesktopToolsOpen && (
                <button
                    onClick={() => setIsDesktopToolsOpen(true)}
                    className="hidden sm:flex absolute top-24 right-6 z-40 items-center justify-center bg-[#fdfbf7]/95 backdrop-blur-md border border-[#d2b48c] shadow-xl rounded-full p-4 hover:scale-105 transition-transform text-[#8b5a2b] font-bold gap-2 animate-in slide-in-from-right"
                >
                    <Search size={22} /> Mở Công Cụ Thêm
                </button>
            )}

            {/* Desktop Side Navigation / Widgets */}
            <div className={`hidden sm:flex absolute top-24 right-6 bottom-6 flex-col gap-4 z-40 w-[340px] pointer-events-none transition-all duration-300 ${isDesktopToolsOpen ? 'translate-x-0 opacity-100' : 'translate-x-[120%] opacity-0'}`}>
                {/* Desktop Search widget */}
                <div className="bg-[#fdfbf7]/95 backdrop-blur-md border border-[#d2b48c] shadow-xl rounded-2xl p-4 w-full pointer-events-auto shrink-0">
                    <div className="flex justify-between items-center mb-3">
                        <h2 className="text-[#5c4033] font-serif font-bold text-lg flex items-center gap-2">
                            <Search size={18} /> Tìm thành viên
                        </h2>
                        <button onClick={() => setIsDesktopToolsOpen(false)} className="text-[#8b5a2b] hover:text-[#5c4033] bg-[#e8dcb8]/40 hover:bg-[#d2b48c]/40 p-1.5 rounded-full transition-colors"><X size={16} /></button>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8b5a2b]" size={16} />
                        <input
                            type="text"
                            placeholder="Gõ tên không dấu (ví dụ: giang)..."
                            className="w-full bg-white border border-[#d2b48c] rounded-xl py-3 pl-10 pr-4 text-sm text-[#3e2723] focus:outline-none focus:border-[#8b5a2b] transition-colors shadow-inner"
                            onChange={(e) => {
                                const val = removeDiacritics(e.target.value.toLowerCase());
                                if (val.length > 2) {
                                    const found = members.find(m => removeDiacritics(m.name.toLowerCase()).includes(val));
                                    if (found) setFocusId(found.id);
                                }
                            }}
                        />
                    </div>
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

            {/* Desktop Help Button */}
            <button onClick={() => setShowHelp(true)} className="hidden sm:flex absolute bottom-6 right-[380px] z-40 items-center gap-2 bg-[#8b5a2b] hover:bg-[#5c4033] text-white px-4 py-2.5 rounded-full shadow-lg font-bold text-sm transition-transform hover:scale-105">
                <HelpCircle size={18} /> Hướng Dẫn
            </button>

            {/* Mobile Bottom Navigation Bar */}
            <div className="fixed sm:hidden bottom-0 left-0 right-0 h-16 bg-[#fdfbf7] border-t-2 border-[#d2b48c] flex justify-around items-center z-50 shadow-[0_-10px_30px_rgba(92,64,51,0.15)] pb-safe">
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
                <button onClick={() => setShowHelp(true)} className="flex flex-col items-center justify-center w-full h-full text-[#8b5a2b] hover:bg-[#e8dcb8]/20 transition-colors">
                    <HelpCircle size={22} />
                    <span className="text-[11px] mt-1 font-bold">HDSD</span>
                </button>
            </div>

            {/* Mobile Bottom Sheet modals */}
            {activeMobileTab && (
                <div className="fixed inset-0 z-50 sm:hidden flex flex-col justify-end">
                    <div className="absolute inset-0 bg-[#3e2723]/30 backdrop-blur-sm" onClick={() => setActiveMobileTab(null)}></div>
                    <div className="w-full bg-[#fdfbf7] rounded-t-3xl shadow-[0_-10px_40px_rgba(92,64,51,0.3)] relative flex flex-col overflow-hidden max-h-[85vh] animate-in slide-in-from-bottom-full border-t border-[#d2b48c]">
                        <div className="w-12 h-1.5 bg-[#d2b48c] rounded-full mx-auto my-3 opacity-50"></div>

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
                                            onChange={(e) => {
                                                const val = removeDiacritics(e.target.value.toLowerCase());
                                                if (val.length > 2) {
                                                    const found = members.find(m => removeDiacritics(m.name.toLowerCase()).includes(val));
                                                    if (found) {
                                                        setFocusId(found.id);
                                                        setActiveMobileTab(null);
                                                    }
                                                }
                                            }}
                                            autoFocus
                                        />
                                    </div>
                                    <p className="text-sm text-[#8b5a2b]/90 text-center italic bg-[#f4efe6] p-3 rounded-lg">Bạn chỉ cần gõ tên chữ thường không dấu. Hệ thống sẽ tự tìm và zoom vào người đó trên phả đồ.</p>
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
                </div>
            )}

            {/* Help / Instruction Modal */}
            {showHelp && (
                <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
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
            )}

            {/* Main Canvas Area */}
            {finalNodes.length > 0 ? (
                <ReactFlowProvider>
                    <LayoutFlow initialNodes={finalNodes} initialEdges={finalEdges} />
                </ReactFlowProvider>
            ) : (
                <div className="w-full h-full flex items-center justify-center text-[#5c4033] font-serif animated-pulse">Đang định dạng thẻ...</div>
            )}

            {/* Side Details Panel */}
            <MemberSidePanel member={selectedMember} onClose={() => setSelectedMember(null)} />
        </div>
    );
}

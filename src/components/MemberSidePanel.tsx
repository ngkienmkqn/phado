"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { X, ChevronRight, User, CalendarDays, Edit3, Trash2, Plus, ArrowLeft, Search, Phone, MapPin, Briefcase, Globe, Camera, Eye, EyeOff } from 'lucide-react';

const removeDiacritics = (str: string) => {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');
};

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
    [key: string]: unknown;
}

interface MemberSidePanelProps {
    member: MemberData | null;
    onClose: () => void;
    allMembers: MemberData[];
    onViewMember: (id: string) => void;
}

export default function MemberSidePanel({ member, onClose, allMembers, onViewMember }: MemberSidePanelProps) {
    type PanelMode = 'view' | 'edit' | 'add_spouse' | 'add_child';
    const [mode, setMode] = useState<PanelMode>('view');
    const [submitted, setSubmitted] = useState(false);

    // View history for back button
    const [history, setHistory] = useState<string[]>([]);

    useEffect(() => {
        if (member && !history.includes(member.id)) {
            setHistory(prev => [...prev, member.id]);
        }
    }, [member]);

    const handleBack = () => {
        if (history.length > 1) {
            const newHistory = [...history];
            newHistory.pop(); // remove current
            const prevId = newHistory[newHistory.length - 1];
            setHistory(newHistory);
            onViewMember(prevId);
        }
    };

    // Edit states
    const [editName, setEditName] = useState('');
    const [editBirth, setEditBirth] = useState('');
    const [editStatus, setEditStatus] = useState('');
    const [editGender, setEditGender] = useState('');
    const [editGeneration, setEditGeneration] = useState('');
    const [editNote, setEditNote] = useState('');
    const [editBy, setEditBy] = useState('');
    const [editPhone, setEditPhone] = useState('');
    const [editFacebook, setEditFacebook] = useState('');
    const [editAddress, setEditAddress] = useState('');
    const [editIndustry, setEditIndustry] = useState('');
    const [editAvatarUrl, setEditAvatarUrl] = useState('');

    // Advanced Spouse States
    // In our legacy data, spouse is single string. We parse it into an array for editing.
    const [spouses, setSpouses] = useState<string[]>([]);
    const [newSpouse, setNewSpouse] = useState('');
    const [newChildName, setNewChildName] = useState('');
    const [newChildGender, setNewChildGender] = useState('male');

    const [spouseInputMode, setSpouseInputMode] = useState<'existing' | 'new'>('existing');
    const [childInputMode, setChildInputMode] = useState<'existing' | 'new'>('existing');
    const [searchSpouseTerm, setSearchSpouseTerm] = useState('');
    const [searchChildTerm, setSearchChildTerm] = useState('');
    const [selectedSpouse, setSelectedSpouse] = useState<MemberData | null>(null);
    const [selectedChild, setSelectedChild] = useState<MemberData | null>(null);

    useEffect(() => {
        if (member) {
            setEditName(member.name || '');
            setEditBirth(member.birthSolar || '');
            setEditStatus(member.status || '');
            setEditGender(member.gender || '');
            setEditGeneration(String(member.generation || ''));
            setEditNote('');
            setEditBy('');
            setEditPhone((member as any).phone || '');
            setEditFacebook((member as any).facebook || '');
            setEditAddress((member as any).address || '');
            setEditIndustry((member as any).industry || '');
            setEditAvatarUrl((member as any).avatarUrl || '');

            // Parse spouses (split by comma or pipe if they exist)
            if (member.spouse) {
                const spList = member.spouse.split(/[,|]/).map(s => s.trim()).filter(Boolean);
                setSpouses(spList);
            } else {
                setSpouses([]);
            }

            setSubmitted(false);
            setMode('view');
            setSpouseInputMode('existing');
            setChildInputMode('existing');
            setSearchSpouseTerm('');
            setSearchChildTerm('');
            setSelectedSpouse(null);
            setSelectedChild(null);
        }
    }, [member]);

    const parentNode = useMemo(() => {
        if (!member?.parentId) return null;
        return allMembers.find(m => m.id === member.parentId) || null;
    }, [member, allMembers]);

    const childrenNodes = useMemo(() => {
        if (!member) return [];
        return allMembers.filter(m => m.parentId === member.id);
    }, [member, allMembers]);

    const spouseSearchResults = useMemo(() => {
        if (!searchSpouseTerm.trim() || searchSpouseTerm.length < 2) return [];
        const term = removeDiacritics(searchSpouseTerm.toLowerCase());
        return allMembers.filter(m => m.id !== member?.id && removeDiacritics(m.name.toLowerCase()).includes(term)).slice(0, 5);
    }, [searchSpouseTerm, allMembers, member]);

    const childSearchResults = useMemo(() => {
        if (!searchChildTerm.trim() || searchChildTerm.length < 2) return [];
        const term = removeDiacritics(searchChildTerm.toLowerCase());
        return allMembers.filter(m => m.id !== member?.id && m.parentId !== member?.id && removeDiacritics(m.name.toLowerCase()).includes(term)).slice(0, 5);
    }, [searchChildTerm, allMembers, member]);

    const getChanges = () => {
        if (!member) return [];
        const changes = [];
        if (editName !== (member.name || '')) changes.push({ field: 'name', label: 'Họ và tên', oldValue: member.name || '', newValue: editName });
        if (editBirth !== (member.birthSolar || '')) changes.push({ field: 'birthSolar', label: 'Năm sinh', oldValue: member.birthSolar || '', newValue: editBirth });
        if (editStatus !== (member.status || '')) changes.push({ field: 'status', label: 'Trạng thái', oldValue: member.status || '', newValue: editStatus });
        if (editGender !== (member.gender || '')) changes.push({ field: 'gender', label: 'Giới tính', oldValue: member.gender || '', newValue: editGender });
        if (editGeneration !== String(member.generation || '')) changes.push({ field: 'generation', label: 'Đời thứ', oldValue: String(member.generation || ''), newValue: editGeneration });
        if (editPhone !== ((member as any).phone || '')) changes.push({ field: 'phone', label: 'Số điện thoại', oldValue: (member as any).phone || '', newValue: editPhone });
        if (editFacebook !== ((member as any).facebook || '')) changes.push({ field: 'facebook', label: 'Facebook', oldValue: (member as any).facebook || '', newValue: editFacebook });
        if (editAddress !== ((member as any).address || '')) changes.push({ field: 'address', label: 'Địa chỉ', oldValue: (member as any).address || '', newValue: editAddress });
        if (editIndustry !== ((member as any).industry || '')) changes.push({ field: 'industry', label: 'Ngành nghề', oldValue: (member as any).industry || '', newValue: editIndustry });
        if (editAvatarUrl !== ((member as any).avatarUrl || '')) changes.push({ field: 'avatarUrl', label: 'Ảnh đại diện', oldValue: (member as any).avatarUrl ? '(có ảnh)' : '(chưa có)', newValue: editAvatarUrl });

        const currentSpouseStr = spouses.join(' | ');
        const oldSpouseStr = member.spouse || '';
        if (currentSpouseStr !== oldSpouseStr) {
            changes.push({ field: 'spouse', label: 'Vợ/Chồng', oldValue: oldSpouseStr, newValue: currentSpouseStr });
        }

        return changes;
    };

    const handleSubmit = () => {
        if (!member) return;
        const changes = getChanges();

        const requests = JSON.parse(localStorage.getItem('phado_requests') || '[]');

        // Ensure type='edit' so Admin handles it as modification
        requests.push({
            id: Date.now(),
            type: 'edit',
            memberId: member.id,
            memberName: member.name,
            memberGeneration: member.generation,
            changes,
            note: editNote || '',
            by: editBy || 'Ẩn danh',
            phone: editPhone || '',
            time: new Date().toLocaleString('vi-VN'),
        });

        localStorage.setItem('phado_requests', JSON.stringify(requests));
        setSubmitted(true);
        setTimeout(() => { setSubmitted(false); setMode('view'); }, 2000);
    };

    const handleAddSpouseSubmit = () => {
        if (!member) return;
        if (spouseInputMode === 'new' && !newSpouse.trim()) return;
        if (spouseInputMode === 'existing' && !selectedSpouse) return;

        const requests = JSON.parse(localStorage.getItem('phado_requests') || '[]');
        const nameToUse = spouseInputMode === 'existing' ? selectedSpouse!.name : newSpouse.trim();

        requests.push({
            id: Date.now(),
            type: 'add',
            relatedToId: member.id,
            relatedToName: member.name,
            relation: 'spouse',
            newData: {
                name: nameToUse,
                gender: member.gender === 'male' ? 'female' : 'male',
                generation: member.generation
            },
            note: editNote || `Đề xuất thêm Vợ/Chồng cho ${member.name}`,
            by: editBy || 'Ẩn danh',
            phone: editPhone || '',
            time: new Date().toLocaleString('vi-VN'),
        });
        localStorage.setItem('phado_requests', JSON.stringify(requests));
        setSubmitted(true);
        setTimeout(() => { setSubmitted(false); setMode('view'); setNewSpouse(''); setSelectedSpouse(null); }, 2000);
    };

    const handleAddChildSubmit = () => {
        if (!member) return;
        if (childInputMode === 'new' && !newChildName.trim()) return;
        if (childInputMode === 'existing' && !selectedChild) return;

        const requests = JSON.parse(localStorage.getItem('phado_requests') || '[]');

        if (childInputMode === 'existing') {
            requests.push({
                id: Date.now(),
                type: 'edit',
                memberId: selectedChild!.id,
                memberName: selectedChild!.name,
                memberGeneration: selectedChild!.generation,
                changes: [
                    { field: 'parentId', label: 'Thuộc về', oldValue: 'Trống/Mới', newValue: member.id }
                ],
                note: editNote || `Gắn kết bé ${selectedChild!.name} làm con của ${member.name} (Chưa được nối cành nhánh).`,
                by: editBy || 'Ẩn danh',
                phone: editPhone || '',
                time: new Date().toLocaleString('vi-VN'),
            });
        } else {
            requests.push({
                id: Date.now(),
                type: 'add',
                relatedToId: member.id,
                relatedToName: member.name,
                relation: 'child',
                newData: {
                    name: newChildName.trim(),
                    gender: newChildGender,
                    generation: member.generation + 1
                },
                note: editNote || `Đề xuất thêm Con mới cho ${member.name}`,
                by: editBy || 'Ẩn danh',
                phone: editPhone || '',
                time: new Date().toLocaleString('vi-VN'),
            });
        }

        localStorage.setItem('phado_requests', JSON.stringify(requests));
        setSubmitted(true);
        setTimeout(() => { setSubmitted(false); setMode('view'); setNewChildName(''); setSelectedChild(null); }, 2000);
    };

    const updateSpouse = (index: number, newName: string) => {
        const newSpouses = [...spouses];
        newSpouses[index] = newName;
        setSpouses(newSpouses);
    };

    const removeSpouse = (index: number) => {
        const newSpouses = [...spouses];
        newSpouses.splice(index, 1);
        setSpouses(newSpouses);
    };

    if (!member) return null;
    const changes = getChanges();
    const hasEditChanges = changes.length > 0 || editNote.length > 0;

    return (
        <div className="absolute top-0 right-0 bottom-0 w-full md:w-[420px] bg-[#fcfaf5] border-l border-[#d2b48c] shadow-2xl z-50 flex flex-col transform transition-transform duration-300 translate-x-0">
            {/* Header */}
            <div className="p-4 border-b border-[#e8dcb8] flex justify-between items-center bg-[#f7f3e8]">
                <div className="flex items-center gap-3">
                    {history.length > 1 && mode === 'view' && (
                        <button onClick={handleBack} className="p-1.5 bg-[#e8dcb8]/40 hover:bg-[#d2b48c]/50 rounded-full text-[#8b5a2b] transition-colors">
                            <ArrowLeft size={18} />
                        </button>
                    )}
                    <h2 className="text-lg font-serif text-[#5c4033] font-bold">
                        {mode === 'edit' ? '✏️ Chỉnh sửa thông tin' : mode === 'add_spouse' ? '✨ Thêm Vợ/Chồng' : 'Thông tin chi tiết'}
                    </h2>
                </div>
                <button onClick={onClose} className="text-[#8b5a2b] hover:text-[#5c4033] bg-[#e8dcb8]/40 hover:bg-[#d2b48c]/40 p-2 rounded-full transition-colors"><X size={20} /></button>
            </div>

            <div className="p-5 flex-1 overflow-y-auto relative pb-24">
                {mode === 'view' && (
                    <div className="animate-fade-in">
                        <div className="flex flex-col items-center mb-6">
                            {(member as any).avatarUrl ? (
                                <img src={(member as any).avatarUrl} alt={member.name} className="w-20 h-20 rounded-full object-cover border-2 border-[#8b5a2b]/30 mb-3 shadow-md" />
                            ) : (
                                <div className="w-20 h-20 rounded-full bg-[#f4efe6] border-2 border-[#8b5a2b]/30 flex items-center justify-center mb-3 shadow-md text-[#8b5a2b]">
                                    <User size={36} className="text-[#8b5a2b]" />
                                </div>
                            )}
                            <h3 className="text-xl font-serif font-bold text-[#3e2723] text-center mb-1">{member.name}</h3>
                            <span className="text-[#8b5a2b] text-xs font-bold uppercase tracking-wider">Đời thứ {member.generation} • {member.gender === 'male' ? 'Nam' : 'Nữ'}</span>
                            {member.status && <span className="mt-2 text-xs px-3 py-1 rounded-sm bg-[#e8dcb8]/60 text-[#5c4033] border border-[#d2b48c] font-medium">{member.status}</span>}
                        </div>

                        <div className="bg-white p-4 rounded-xl border border-[#e8dcb8] shadow-sm space-y-4">
                            {/* Basic Info */}
                            <div className="flex items-center gap-3">
                                <CalendarDays size={18} className="text-[#8b5a2b] shrink-0" />
                                <span className="text-sm font-medium text-[#5c4033]">Năm sinh:</span>
                                <span className="text-sm text-[#3e2723] font-bold ml-auto">{member.birthSolar || 'Không rõ'}</span>
                            </div>

                            {/* Contact Info - only show if public or always show labels */}
                            {(() => {
                                const pub = ((member as any).publicFields as string[]) || [];
                                const phone = (member as any).phone as string;
                                const fb = (member as any).facebook as string;
                                const addr = (member as any).address as string;
                                const ind = (member as any).industry as string;
                                return (
                                    <>
                                        {phone && pub.includes('phone') && (
                                            <div className="flex items-center gap-3">
                                                <Phone size={18} className="text-green-600 shrink-0" />
                                                <span className="text-sm font-medium text-[#5c4033]">SĐT:</span>
                                                <a href={`tel:${phone}`} className="text-sm text-green-700 font-bold ml-auto hover:underline">{phone}</a>
                                            </div>
                                        )}
                                        {fb && pub.includes('facebook') && (
                                            <div className="flex items-center gap-3">
                                                <Globe size={18} className="text-blue-500 shrink-0" />
                                                <span className="text-sm font-medium text-[#5c4033]">Facebook:</span>
                                                <a href={fb.startsWith('http') ? fb : `https://facebook.com/${fb}`} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 font-bold ml-auto hover:underline truncate max-w-[150px]">Xem trang</a>
                                            </div>
                                        )}
                                        {addr && pub.includes('address') && (
                                            <div className="flex items-center gap-3">
                                                <MapPin size={18} className="text-red-400 shrink-0" />
                                                <span className="text-sm font-medium text-[#5c4033]">Địa chỉ:</span>
                                                <span className="text-sm text-[#3e2723] font-bold ml-auto text-right max-w-[180px]">{addr}</span>
                                            </div>
                                        )}
                                        {ind && pub.includes('industry') && (
                                            <div className="flex items-center gap-3">
                                                <Briefcase size={18} className="text-amber-600 shrink-0" />
                                                <span className="text-sm font-medium text-[#5c4033]">Nghề nghiệp:</span>
                                                <span className="text-sm text-[#3e2723] font-bold ml-auto">{ind}</span>
                                            </div>
                                        )}
                                    </>
                                );
                            })()}

                            {/* Parents Lineage */}
                            {parentNode && (
                                <div className="pt-3 border-t border-[#e8dcb8]/50">
                                    <span className="text-xs text-[#8b5a2b] font-bold uppercase tracking-wider block mb-2">Con của</span>
                                    <div
                                        onClick={() => onViewMember(parentNode.id)}
                                        className="p-3 bg-[#fdfbf7] border border-[#e8dcb8] rounded-lg cursor-pointer hover:border-[#8b5a2b] hover:shadow-md transition-all group flex items-center justify-between"
                                    >
                                        <div>
                                            <div className="text-sm font-bold text-[#3e2723] group-hover:text-[#8b5a2b]">{parentNode.name}</div>
                                            {(parentNode.spouse) && <div className="text-xs text-[#5c4033]/80 mt-1">phu nhân: {parentNode.spouse}</div>}
                                        </div>
                                        <ChevronRight size={16} className="text-[#d2b48c] group-hover:text-[#8b5a2b]" />
                                    </div>
                                </div>
                            )}

                            {/* Spouses List */}
                            {spouses.length > 0 && (
                                <div className="pt-3 border-t border-[#e8dcb8]/50">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs text-[#8b5a2b] font-bold uppercase tracking-wider">Vợ / Chồng</span>
                                    </div>
                                    <div className="space-y-2">
                                        {spouses.map((sp, idx) => (
                                            <div key={idx} className="p-3 bg-pink-50/50 border border-pink-100/80 rounded-lg flex items-center justify-between">
                                                <div className="text-sm font-bold text-[#3e2723]">{sp}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Children List */}
                            {childrenNodes.length > 0 && (
                                <div className="pt-3 border-t border-[#e8dcb8]/50">
                                    <span className="text-xs text-[#8b5a2b] font-bold uppercase tracking-wider block mb-2">Con cái ({childrenNodes.length})</span>
                                    <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                                        {childrenNodes.map(child => (
                                            <div
                                                key={child.id}
                                                onClick={() => onViewMember(child.id)}
                                                className="p-2.5 bg-[#fdfbf7] border border-[#e8dcb8] rounded-lg cursor-pointer hover:border-[#8b5a2b] transition-all group flex items-center justify-between"
                                            >
                                                <span className="text-sm font-medium text-[#3e2723] group-hover:text-[#8b5a2b]">{child.name}</span>
                                                <ChevronRight size={14} className="text-[#d2b48c] group-hover:text-[#8b5a2b]" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="mt-6 flex flex-col gap-3">
                            <button onClick={() => setMode('edit')} className="w-full py-3.5 bg-[#8b5a2b] hover:bg-[#704218] text-white rounded-xl font-bold transition-all shadow-md flex items-center justify-center gap-2">
                                <Edit3 size={18} /> Chỉnh Sửa Thông Tin
                            </button>
                            <div className="grid grid-cols-2 gap-3">
                                <button onClick={() => setMode('add_spouse')} className="w-full py-3 bg-white border-2 border-[#d2b48c] hover:border-[#8b5a2b] text-[#5c4033] rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 text-[13px]">
                                    <Plus size={16} /> Thêm Vợ/Chồng
                                </button>
                                <button onClick={() => setMode('add_child')} className="w-full py-3 bg-white border-2 border-[#d2b48c] hover:border-[#8b5a2b] text-[#5c4033] rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 text-[13px]">
                                    <Plus size={16} /> Thêm Con Mới
                                </button>
                            </div>
                            <p className="text-center text-xs text-[#8b5a2b]/80 mt-1">Yêu cầu được gửi lên Admin duyệt</p>
                        </div>
                    </div>
                )}

                {/* EDIT MODE */}
                {mode === 'edit' && !submitted && (
                    <div className="animate-fade-in space-y-4">
                        <div className="bg-white p-4 rounded-xl border border-[#e8dcb8] shadow-sm space-y-4">
                            <div>
                                <label className="text-xs text-[#8b5a2b] font-bold block mb-1.5">Họ và tên</label>
                                <input type="text" value={editName} onChange={e => setEditName(e.target.value)}
                                    className="w-full border border-[#d2b48c] rounded-lg py-2.5 px-3 text-sm bg-white focus:outline-none focus:border-[#8b5a2b] focus:ring-1 focus:ring-[#8b5a2b]" />
                            </div>

                            {/* Spouses Editor */}
                            <div>
                                <label className="text-xs text-[#8b5a2b] font-bold flex mb-1.5 justify-between">
                                    <span>Danh sách Vợ/Chồng (Sửa lỗi chính tả)</span>
                                </label>
                                {spouses.length === 0 ? (
                                    <div className="text-xs text-gray-500 italic">Chưa có thông tin. Dùng nút Thêm ở trang trước.</div>
                                ) : (
                                    <div className="space-y-2">
                                        {spouses.map((sp, idx) => (
                                            <div key={idx} className="flex gap-2 items-center">
                                                <input
                                                    type="text"
                                                    value={sp}
                                                    onChange={e => updateSpouse(idx, e.target.value)}
                                                    className="flex-1 border border-[#e8dcb8] rounded-md py-2 px-3 text-sm focus:border-[#8b5a2b] outline-none"
                                                />
                                                <button onClick={() => removeSpouse(idx)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Xóa bỏ">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <p className="text-[10px] text-amber-700 mt-1.5 bg-amber-50 p-2 rounded border border-amber-200">
                                    💡 <strong>Lưu ý:</strong> Xóa tên ở đây sẽ mất trên danh bạ. Nếu ông/bà có nhiều vợ/chồng, hãy thoát ra và chọn "Thêm Vợ/Chồng Mới".
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs text-[#8b5a2b] font-bold block mb-1.5">Năm sinh</label>
                                    <input type="text" value={editBirth} onChange={e => setEditBirth(e.target.value)} placeholder="VD: 1990"
                                        className="w-full border border-[#d2b48c] rounded-lg py-2.5 px-3 text-sm bg-white focus:outline-none focus:border-[#8b5a2b]" />
                                </div>
                                <div>
                                    <label className="text-xs text-[#8b5a2b] font-bold block mb-1.5">Trạng thái</label>
                                    <select value={editStatus} onChange={e => setEditStatus(e.target.value)}
                                        className="w-full border border-[#d2b48c] rounded-lg py-2.5 px-3 text-sm bg-white focus:outline-none focus:border-[#8b5a2b]">
                                        <option value="">Không rõ</option>
                                        <option value="Còn sống">Còn sống</option>
                                        <option value="Đã mất">Đã mất</option>
                                    </select>
                                </div>
                            </div>

                            {/* Avatar upload */}
                            <div>
                                <label className="text-xs text-[#8b5a2b] font-bold block mb-1.5">Ảnh đại diện</label>
                                <div className="flex items-center gap-3">
                                    {editAvatarUrl ? (
                                        <img src={editAvatarUrl} alt="Preview" className="w-14 h-14 rounded-full object-cover border-2 border-[#8b5a2b]/30" />
                                    ) : (
                                        <div className="w-14 h-14 rounded-full bg-[#f4efe6] border-2 border-[#8b5a2b]/20 flex items-center justify-center text-[#8b5a2b]/50">
                                            <Camera size={24} />
                                        </div>
                                    )}
                                    <label className="flex-1 text-center py-2 bg-[#f4efe6] border border-[#d2b48c] rounded-lg text-sm text-[#8b5a2b] font-bold cursor-pointer hover:bg-[#e8dcb8] transition-colors">
                                        📷 Chọn ảnh
                                        <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (!file) return;
                                            if (file.size > 500 * 1024) { alert('Ảnh quá lớn (tối đa 500KB)'); return; }
                                            const reader = new FileReader();
                                            reader.onload = (ev) => setEditAvatarUrl(ev.target?.result as string);
                                            reader.readAsDataURL(file);
                                        }} />
                                    </label>
                                    {editAvatarUrl && (
                                        <button onClick={() => setEditAvatarUrl('')} className="p-2 text-red-400 hover:text-red-600 rounded-md transition-colors" title="Xóa ảnh">
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Contact info fields with privacy toggles */}
                            {(() => {
                                const overlay = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('phado_overlay') || '{}') : {};
                                const currentPub: string[] = member && overlay[member.id]?.publicFields ? JSON.parse(overlay[member.id].publicFields) : [];
                                const toggleField = (field: string) => {
                                    if (!member) return;
                                    if (!overlay[member.id]) overlay[member.id] = {};
                                    const arr = overlay[member.id].publicFields ? JSON.parse(overlay[member.id].publicFields) : [];
                                    const idx = arr.indexOf(field);
                                    if (idx >= 0) arr.splice(idx, 1); else arr.push(field);
                                    overlay[member.id].publicFields = JSON.stringify(arr);
                                    localStorage.setItem('phado_overlay', JSON.stringify(overlay));
                                };
                                const fields = [
                                    { key: 'phone', label: 'Số điện thoại', icon: <Phone size={12} />, type: 'tel', value: editPhone, setter: setEditPhone, placeholder: 'VD: 0901234567' },
                                    { key: 'facebook', label: 'Facebook', icon: <Globe size={12} />, type: 'text', value: editFacebook, setter: setEditFacebook, placeholder: 'Link hoặc tên tài khoản' },
                                    { key: 'address', label: 'Địa chỉ', icon: <MapPin size={12} />, type: 'text', value: editAddress, setter: setEditAddress, placeholder: 'VD: 123 Nguyễn Trãi, Q1' },
                                    { key: 'industry', label: 'Ngành nghề', icon: <Briefcase size={12} />, type: 'text', value: editIndustry, setter: setEditIndustry, placeholder: 'VD: Kỹ sư phần mềm' },
                                ];
                                return (
                                    <div className="pt-3 border-t border-[#e8dcb8]/50">
                                        <span className="text-xs text-[#8b5a2b] font-bold uppercase tracking-wider block mb-3">Thông tin liên hệ</span>
                                        <div className="space-y-3">
                                            {fields.map(f => (
                                                <div key={f.key}>
                                                    <div className="flex items-center justify-between mb-1.5">
                                                        <label className="text-xs text-[#8b5a2b] font-bold flex items-center gap-1">{f.icon} {f.label}</label>
                                                        <button type="button" onClick={() => { toggleField(f.key); window.dispatchEvent(new Event('storage')); }}
                                                            className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold transition-colors ${currentPub.includes(f.key) ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-gray-100 text-gray-500 border border-gray-300'}`}
                                                            title={currentPub.includes(f.key) ? 'Đang công khai — bấm để ẩn' : 'Đang ẩn — bấm để công khai'}>
                                                            {currentPub.includes(f.key) ? <><Eye size={10} /> Công khai</> : <><EyeOff size={10} /> Ẩn</>}
                                                        </button>
                                                    </div>
                                                    <input type={f.type} value={f.value} onChange={e => f.setter(e.target.value)} placeholder={f.placeholder}
                                                        className="w-full border border-[#d2b48c] rounded-lg py-2.5 px-3 text-sm bg-white focus:outline-none focus:border-[#8b5a2b]" />
                                                </div>
                                            ))}
                                        </div>
                                        <p className="text-[10px] text-amber-700 mt-2 bg-amber-50 p-2 rounded border border-amber-200">
                                            🔒 <strong>Bảo mật:</strong> Bấm 👁 / 🔒 bên cạnh để chọn công khai hoặc ẩn từng mục.
                                        </p>
                                    </div>
                                );
                            })()}
                        </div>

                        <div className="bg-white p-4 rounded-xl border border-[#e8dcb8] shadow-sm space-y-3">
                            <div>
                                <label className="text-xs text-[#8b5a2b] font-bold block mb-1.5">Ghi chú cho Admin duyệt</label>
                                <textarea value={editNote} onChange={e => setEditNote(e.target.value)} rows={2}
                                    placeholder="Giải thích lý do sửa..."
                                    className="w-full border border-[#d2b48c] rounded-lg py-2 px-3 text-sm resize-none focus:border-[#8b5a2b] outline-none" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs text-[#8b5a2b] font-bold block mb-1.5">Tên người gửi</label>
                                    <input type="text" value={editBy} onChange={e => setEditBy(e.target.value)} placeholder="VD: Anh Tùng..."
                                        className="w-full border border-[#d2b48c] rounded-lg py-2 px-3 text-sm focus:border-[#8b5a2b] outline-none" />
                                </div>
                                <div>
                                    <label className="text-xs text-[#8b5a2b] font-bold block mb-1.5">SĐT / Zalo liên hệ</label>
                                    <input type="text" value={editPhone} onChange={e => setEditPhone(e.target.value)} placeholder="VD: 0912..."
                                        className="w-full border border-[#d2b48c] rounded-lg py-2 px-3 text-sm focus:border-[#8b5a2b] outline-none" />
                                </div>
                            </div>
                        </div>

                        {changes.length > 0 && (
                            <div className="p-3 bg-green-50/50 border border-green-200 rounded-xl">
                                <span className="text-xs font-bold text-green-800 uppercase block mb-1.5">Tóm tắt {changes.length} thay đổi:</span>
                                {changes.map((c, i) => (
                                    <div key={i} className="text-xs text-green-900 flex justify-between py-1 border-b border-green-100 last:border-0">
                                        <span className="font-medium">{c.label}:</span>
                                        <span className="text-right truncate max-w-[180px] font-bold">{c.newValue || '(trống)'}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="flex gap-2 pt-2">
                            <button onClick={handleSubmit} disabled={!hasEditChanges}
                                className="flex-1 py-3.5 bg-[#8b5a2b] hover:bg-[#704218] disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-all shadow-md">
                                Gửi Yêu Cầu
                            </button>
                            <button onClick={() => setMode('view')} className="py-3.5 px-5 bg-white border border-[#d2b48c] hover:bg-gray-50 text-[#5c4033] rounded-xl font-bold transition-all">
                                Hủy
                            </button>
                        </div>
                    </div>
                )}

                {/* ADD SPOUSE MODE */}
                {mode === 'add_spouse' && !submitted && (
                    <div className="animate-fade-in space-y-4">
                        <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl mb-4">
                            <h4 className="font-bold text-blue-900 text-sm mb-1">Thêm Vợ/Chồng cho {member.name}</h4>
                            <p className="text-xs text-blue-800">Thông tin này sẽ được thêm mới độc lập, không ghi đè lên những người vợ/chồng cũ (nếu có).</p>
                        </div>

                        <div className="flex gap-2">
                            <button onClick={() => setSpouseInputMode('existing')} className={`flex-1 py-2 text-sm font-bold rounded-lg border transition-colors ${spouseInputMode === 'existing' ? 'bg-[#8b5a2b] text-white border-[#8b5a2b]' : 'bg-white text-[#5c4033] border-[#d2b48c] hover:bg-gray-50'}`}>Chọn người đã có</button>
                            <button onClick={() => setSpouseInputMode('new')} className={`flex-1 py-2 text-sm font-bold rounded-lg border transition-colors ${spouseInputMode === 'new' ? 'bg-[#8b5a2b] text-white border-[#8b5a2b]' : 'bg-white text-[#5c4033] border-[#d2b48c] hover:bg-gray-50'}`}>Tạo mới hoàn toàn</button>
                        </div>

                        {spouseInputMode === 'existing' ? (
                            <div className="bg-[#fcfaf5] p-4 rounded-xl border border-[#d2b48c] space-y-3">
                                <label className="text-xs text-[#8b5a2b] font-bold block">Tìm kiếm người dùng có sẵn trong phả đồ</label>
                                {!selectedSpouse ? (
                                    <>
                                        <div className="relative">
                                            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                            <input type="text" value={searchSpouseTerm} onChange={e => setSearchSpouseTerm(e.target.value)} placeholder="Nhập tên để tìm kiếm..." autoFocus
                                                className="w-full border border-[#d2b48c] rounded-lg py-2.5 pl-9 pr-3 text-sm bg-white focus:outline-none focus:border-[#8b5a2b]" />
                                        </div>
                                        {searchSpouseTerm.length >= 2 && (
                                            <div className="mt-2 bg-white border border-[#e8dcb8] rounded-lg shadow-sm max-h-48 overflow-y-auto">
                                                {spouseSearchResults.length > 0 ? spouseSearchResults.map(m => (
                                                    <div key={m.id} onClick={() => { setSelectedSpouse(m); setSearchSpouseTerm(''); }} className="p-3 hover:bg-[#8b5a2b]/10 cursor-pointer border-b border-[#e8dcb8] last:border-0">
                                                        <div className="text-sm font-bold text-[#3e2723]">{m.name}</div>
                                                        <div className="text-xs text-[#5c4033]/70">Đời thứ {m.generation} • {m.gender === 'male' ? 'Nam' : 'Nữ'}</div>
                                                    </div>
                                                )) : <div className="p-3 text-sm text-gray-500 text-center">Không tìm thấy ai</div>}
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex justify-between items-center animate-fade-in">
                                        <div>
                                            <div className="text-sm font-bold text-emerald-900">{selectedSpouse.name}</div>
                                            <div className="text-xs text-emerald-700">Đã chọn để liên kết</div>
                                        </div>
                                        <button onClick={() => setSelectedSpouse(null)} className="text-emerald-700 hover:bg-emerald-100 p-1.5 rounded-full"><X size={16} /></button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="bg-white p-4 rounded-xl border border-[#e8dcb8] shadow-sm space-y-4">
                                <div>
                                    <label className="text-xs text-[#8b5a2b] font-bold block mb-1.5">Họ và Tên Vợ/Chồng Mới</label>
                                    <input type="text" value={newSpouse} onChange={e => setNewSpouse(e.target.value)} placeholder="VD: Phạm Thị Hoa" autoFocus
                                        className="w-full border border-[#d2b48c] rounded-lg py-3 px-3 text-sm bg-white focus:outline-none focus:border-[#8b5a2b]" />
                                </div>
                            </div>
                        )}

                        <div className="bg-white p-4 rounded-xl border border-[#e8dcb8] shadow-sm space-y-4">
                            <div>
                                <label className="text-xs text-[#8b5a2b] font-bold block mb-1.5">Ghi chú thêm (Tuỳ chọn)</label>
                                <textarea value={editNote} onChange={e => setEditNote(e.target.value)} rows={2}
                                    placeholder="Thêm thông tin, quê quán để Admin dễ duyệt..."
                                    className="w-full border border-[#d2b48c] rounded-lg py-2 px-3 text-sm resize-none focus:border-[#8b5a2b] outline-none" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs text-[#8b5a2b] font-bold block mb-1.5">Tên người gửi</label>
                                    <input type="text" value={editBy} onChange={e => setEditBy(e.target.value)} placeholder="VD: Anh Tùng..."
                                        className="w-full border border-[#d2b48c] rounded-lg py-2 px-3 text-sm focus:border-[#8b5a2b] outline-none" />
                                </div>
                                <div>
                                    <label className="text-xs text-[#8b5a2b] font-bold block mb-1.5">SĐT / Zalo</label>
                                    <input type="text" value={editPhone} onChange={e => setEditPhone(e.target.value)} placeholder="VD: 0912..."
                                        className="w-full border border-[#d2b48c] rounded-lg py-2 px-3 text-sm focus:border-[#8b5a2b] outline-none" />
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2 pt-2">
                            <button onClick={handleAddSpouseSubmit} disabled={spouseInputMode === 'new' ? !newSpouse.trim() : !selectedSpouse}
                                className="flex-1 py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-all shadow-md flex justify-center items-center gap-2">
                                <Plus size={18} /> Gửi Yêu Cầu Liên Kết
                            </button>
                            <button onClick={() => setMode('view')} className="py-3.5 px-5 bg-white border border-[#d2b48c] hover:bg-gray-50 text-[#5c4033] rounded-xl font-bold transition-all">
                                Hủy
                            </button>
                        </div>
                    </div>
                )}

                {/* ADD CHILD MODE */}
                {mode === 'add_child' && !submitted && (
                    <div className="animate-fade-in space-y-4">
                        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl mb-4">
                            <h4 className="font-bold text-emerald-900 text-sm mb-1">Thêm Con Mới cho {member.name}</h4>
                            <p className="text-xs text-emerald-800">Người con này sẽ ở đời thứ {member.generation + 1}.</p>
                        </div>

                        <div className="flex gap-2">
                            <button onClick={() => setChildInputMode('existing')} className={`flex-1 py-2 text-sm font-bold rounded-lg border transition-colors ${childInputMode === 'existing' ? 'bg-[#8b5a2b] text-white border-[#8b5a2b]' : 'bg-white text-[#5c4033] border-[#d2b48c] hover:bg-gray-50'}`}>Chọn người đã có</button>
                            <button onClick={() => setChildInputMode('new')} className={`flex-1 py-2 text-sm font-bold rounded-lg border transition-colors ${childInputMode === 'new' ? 'bg-[#8b5a2b] text-white border-[#8b5a2b]' : 'bg-white text-[#5c4033] border-[#d2b48c] hover:bg-gray-50'}`}>Tạo mới hoàn toàn</button>
                        </div>

                        {childInputMode === 'existing' ? (
                            <div className="bg-[#fcfaf5] p-4 rounded-xl border border-[#d2b48c] space-y-3">
                                <label className="text-xs text-[#8b5a2b] font-bold block">Tìm kiếm người dùng có sẵn trong phả đồ</label>
                                {!selectedChild ? (
                                    <>
                                        <div className="relative">
                                            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                            <input type="text" value={searchChildTerm} onChange={e => setSearchChildTerm(e.target.value)} placeholder="Nhập tên để tìm kiếm..." autoFocus
                                                className="w-full border border-[#d2b48c] rounded-lg py-2.5 pl-9 pr-3 text-sm bg-white focus:outline-none focus:border-[#8b5a2b]" />
                                        </div>
                                        {searchChildTerm.length >= 2 && (
                                            <div className="mt-2 bg-white border border-[#e8dcb8] rounded-lg shadow-sm max-h-48 overflow-y-auto">
                                                {childSearchResults.length > 0 ? childSearchResults.map(m => (
                                                    <div key={m.id} onClick={() => { setSelectedChild(m); setSearchChildTerm(''); }} className="p-3 hover:bg-[#8b5a2b]/10 cursor-pointer border-b border-[#e8dcb8] last:border-0">
                                                        <div className="text-sm font-bold text-[#3e2723]">{m.name}</div>
                                                        <div className="text-xs text-[#5c4033]/70">Đời thứ {m.generation} • {m.gender === 'male' ? 'Nam' : 'Nữ'}</div>
                                                    </div>
                                                )) : <div className="p-3 text-sm text-gray-500 text-center">Không tìm thấy ai</div>}
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex justify-between items-center animate-fade-in">
                                        <div>
                                            <div className="text-sm font-bold text-emerald-900">{selectedChild.name}</div>
                                            <div className="text-xs text-emerald-700">Đã chọn để liên kết nhánh gốc</div>
                                        </div>
                                        <button onClick={() => setSelectedChild(null)} className="text-emerald-700 hover:bg-emerald-100 p-1.5 rounded-full"><X size={16} /></button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="bg-white p-4 rounded-xl border border-[#e8dcb8] shadow-sm space-y-4">
                                <div>
                                    <label className="text-xs text-[#8b5a2b] font-bold block mb-1.5">Họ và Tên Con</label>
                                    <input type="text" value={newChildName} onChange={e => setNewChildName(e.target.value)} placeholder="VD: Nguyễn Văn A" autoFocus
                                        className="w-full border border-[#d2b48c] rounded-lg py-3 px-3 text-sm bg-white focus:outline-none focus:border-[#8b5a2b]" />
                                </div>

                                <div>
                                    <label className="text-xs text-[#8b5a2b] font-bold block mb-1.5">Giới tính</label>
                                    <div className="flex gap-4">
                                        <label className="flex items-center gap-2 text-sm cursor-pointer text-[#3e2723]">
                                            <input type="radio" name="childGender" value="male" checked={newChildGender === 'male'} onChange={() => setNewChildGender('male')} className="accent-[#8b5a2b]" /> Nam
                                        </label>
                                        <label className="flex items-center gap-2 text-sm cursor-pointer text-[#3e2723]">
                                            <input type="radio" name="childGender" value="female" checked={newChildGender === 'female'} onChange={() => setNewChildGender('female')} className="accent-[#8b5a2b]" /> Nữ
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="bg-white p-4 rounded-xl border border-[#e8dcb8] shadow-sm space-y-4">
                            <div>
                                <label className="text-xs text-[#8b5a2b] font-bold block mb-1.5">Ghi chú thêm (Tuỳ chọn)</label>
                                <textarea value={editNote} onChange={e => setEditNote(e.target.value)} rows={2}
                                    placeholder="Thêm thông tin, lý do thêm để Admin duyệt..."
                                    className="w-full border border-[#d2b48c] rounded-lg py-2 px-3 text-sm resize-none focus:border-[#8b5a2b] outline-none" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs text-[#8b5a2b] font-bold block mb-1.5">Tên người gửi</label>
                                    <input type="text" value={editBy} onChange={e => setEditBy(e.target.value)} placeholder="VD: Anh Tùng..."
                                        className="w-full border border-[#d2b48c] rounded-lg py-2 px-3 text-sm focus:border-[#8b5a2b] outline-none" />
                                </div>
                                <div>
                                    <label className="text-xs text-[#8b5a2b] font-bold block mb-1.5">SĐT / Zalo</label>
                                    <input type="text" value={editPhone} onChange={e => setEditPhone(e.target.value)} placeholder="VD: 0912..."
                                        className="w-full border border-[#d2b48c] rounded-lg py-2 px-3 text-sm focus:border-[#8b5a2b] outline-none" />
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2 pt-2">
                            <button onClick={handleAddChildSubmit} disabled={childInputMode === 'new' ? !newChildName.trim() : !selectedChild}
                                className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-all shadow-md flex justify-center items-center gap-2">
                                <Plus size={18} /> Gửi Yêu Cầu Liên Kết
                            </button>
                            <button onClick={() => setMode('view')} className="py-3.5 px-5 bg-white border border-[#d2b48c] hover:bg-gray-50 text-[#5c4033] rounded-xl font-bold transition-all">
                                Hủy
                            </button>
                        </div>
                    </div>
                )}

                {/* SUCCESS SCREEN */}
                {submitted && (
                    <div className="absolute inset-0 bg-[#fdfbf7] flex flex-col items-center justify-center p-6 text-center animate-fade-in z-20">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex justify-center items-center mb-4 border-4 border-green-50 shadow-inner">
                            <span className="text-3xl">✅</span>
                        </div>
                        <h3 className="text-xl font-serif font-bold text-green-800 mb-2">Gửi Thành Công!</h3>
                        <p className="text-sm text-green-700 font-medium">Ban quản trị đã nhận được yêu cầu.</p>
                        <p className="text-xs text-gray-500 mt-4 max-w-[250px]">Dữ liệu sẽ được tự động hiển thị sau khi Admin duyệt.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

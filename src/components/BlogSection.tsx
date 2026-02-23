"use client";

import { useState, useEffect } from "react";
import { FileText } from "lucide-react";

interface BlogPost {
    id: number;
    title: string;
    content: string;
    author: string;
    date: string;
}

export default function BlogSection() {
    const [posts, setPosts] = useState<BlogPost[]>([]);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const stored = localStorage.getItem("phado_blog");
            if (stored) {
                try { setPosts(JSON.parse(stored)); } catch { setPosts([]); }
            }
        }
    }, []);

    if (posts.length === 0) return null;

    return (
        <section className="relative z-20 max-w-5xl mx-auto px-4 pb-20 -mt-8">
            <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-serif font-bold bg-linear-to-r from-[#facc15] to-[#d4a012] text-transparent bg-clip-text">
                    📰 Tin Tức Dòng Họ
                </h2>
                <p className="text-sm text-[#a8a29e] mt-2">Cập nhật mới nhất từ Ban quản lý</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {posts.slice(0, 6).map(post => (
                    <article key={post.id} className="bg-[#14100c]/80 border border-gold-900/30 rounded-2xl p-5 hover:border-gold-500/40 transition-all group">
                        <div className="flex items-center gap-2 mb-3">
                            <FileText size={16} className="text-gold-500" />
                            <span className="text-xs text-[#a8a29e]">{post.date} · {post.author}</span>
                        </div>
                        <h3 className="font-serif font-bold text-[#facc15] text-lg mb-2 group-hover:text-gold-300 transition-colors">{post.title}</h3>
                        <p className="text-sm text-[#a8a29e] line-clamp-3 leading-relaxed">{post.content}</p>
                    </article>
                ))}
            </div>
        </section>
    );
}

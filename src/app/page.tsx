import Link from "next/link";
import { Users, Search, TreeDeciduous, BookOpen, Calendar, Settings } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-[#f0ebe0] font-sans selection:bg-[#d4a012] selection:text-[#0a0a0f]">
      {/* Hero Section */}
      <header className="relative min-h-screen flex flex-col items-center justify-center text-center overflow-hidden px-4">
        {/* Top Right Admin Link */}
        <div className="absolute top-6 right-6 z-20">
          <Link href="/admin" className="flex items-center gap-2 text-gray-400 hover:text-gold-400 transition-colors bg-white/5 border border-white/10 px-4 py-2 rounded-xl backdrop-blur-md">
            <Settings className="w-4 h-4" />
            <span className="text-sm font-medium">Bảng Điều Khiển</span>
          </Link>
        </div>

        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_40%,rgba(212,160,18,0.08)_0%,transparent_70%)] animate-pulse" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
          <div className="text-6xl md:text-8xl mb-6 bg-linear-to-br from-[#facc15] via-[#b8860b] to-[#facc15] text-transparent bg-clip-text drop-shadow-[0_0_20px_rgba(212,160,18,0.3)] select-none">
            族
          </div>
          <h1 className="text-4xl md:text-7xl font-serif font-bold mb-4 bg-linear-to-r from-gold-100 via-[#facc15] to-gold-400 text-transparent bg-clip-text">
            Phả Đồ Họ Nguyễn
          </h1>
          <p className="text-lg md:text-2xl font-light text-[#a8a29e] tracking-[0.4em] uppercase mb-12">
            CẨM GIANG · TỪ NĂM 1469
          </p>

          <div className="flex flex-wrap justify-center gap-8 mb-16 px-4 py-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <div className="flex flex-col items-center">
              <span className="text-5xl font-serif font-bold text-[#facc15] leading-none mb-2">22</span>
              <span className="text-xs text-[#6b6560] uppercase tracking-widest">Đời</span>
            </div>
            <div className="w-px h-16 bg-gradient-to-b from-transparent via-[#6b5210] to-transparent hidden sm:block"></div>
            <div className="flex flex-col items-center">
              <span className="text-5xl font-serif font-bold text-[#facc15] leading-none mb-2">1095</span>
              <span className="text-xs text-[#6b6560] uppercase tracking-widest">Thành viên</span>
            </div>
            <div className="w-px h-16 bg-gradient-to-b from-transparent via-[#6b5210] to-transparent hidden sm:block"></div>
            <div className="flex flex-col items-center">
              <span className="text-5xl font-serif font-bold text-[#facc15] leading-none mb-2">557</span>
              <span className="text-xs text-[#6b6560] uppercase tracking-widest">Năm lịch sử</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-5xl">
            <Link href="/tree" className="group flex flex-col items-center justify-center p-6 rounded-xl bg-white/5 border border-white/10 hover:bg-gold-500/10 hover:border-gold-500/30 transition-all">
              <TreeDeciduous className="w-8 h-8 text-gold-500 mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-lg text-gold-100">Cây Gia Phả</h3>
              <p className="text-sm text-[#a8a29e] text-center mt-2">Xem toàn cảnh sơ đồ kéo thả tương tác</p>
            </Link>

            <Link href="/directory" className="group flex flex-col items-center justify-center p-6 rounded-xl bg-white/5 border border-white/10 hover:bg-gold-500/10 hover:border-gold-500/30 transition-all">
              <Users className="w-8 h-8 text-blue-400 mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-lg text-blue-100">Danh Bạ Hàng Hàng</h3>
              <p className="text-sm text-[#a8a29e] text-center mt-2">Tìm kiếm tra cứu thông tin 1000+ thành viên</p>
            </Link>

            <Link href="/book" className="group flex flex-col items-center justify-center p-6 rounded-xl bg-white/5 border border-white/10 hover:bg-gold-500/10 hover:border-gold-500/30 transition-all">
              <BookOpen className="w-8 h-8 text-pink-400 mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-lg text-pink-100">Sách Gia Phả</h3>
              <p className="text-sm text-[#a8a29e] text-center mt-2">Xuất bản kỷ yếu dạng PDF khổ A4</p>
            </Link>
          </div>
        </div>
      </header>
    </div>
  );
}

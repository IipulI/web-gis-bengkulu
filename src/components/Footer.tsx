import {
  Mail,
  Phone,
  MapPin,
  Instagram,
  Facebook,
  Youtube,
  Globe,
  ArrowUpRight,
} from "lucide-react";

// Ikon TikTok sederhana menggunakan SVG karena Lucide-react versi lama kadang belum menyediakannya
const TikTokIcon = ({ size = 18 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
);

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const socialLinks = [
    {
      icon: <Instagram size={18} />,
      href: "https://www.instagram.com/dinas_pupr_kotabengkulu?igsh=MWJtdDdxa3V3azNmeA==",
    },
    {
      icon: <Facebook size={18} />,
      href: "https://www.facebook.com/share/1aQRSfoCBJ/",
    },
    {
      icon: <Youtube size={18} />,
      href: "https://youtube.com/@dpuprkotabengkulu7699?si=I1VuOytGGJkf1knh",
    },
    {
      icon: <TikTokIcon size={18} />,
      href: "https://www.tiktok.com/@dpupr_kota_bengkulu?_r=1&_t=ZS-9413Z6M76Hs",
    },
  ];

  return (
    <footer className="bg-blue-950 text-blue-100/70 pt-20 pb-10 relative overflow-hidden">
      {/* Dekorasi Garis Atas - Gradient Kuning Amber */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />

      {/* Dekorasi Cahaya Halus di Pojok */}
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16 mb-20">
          {/* KOLOM 1: BRANDING */}
          <div className="space-y-8">
            <div className="flex items-center gap-4">
              <img
                src="https://iconlogovector.com/uploads/images/2023/05/lg-9cee3ca8e0a838a8e72da83c54f6e5fc56.jpg"
                alt="Logo Kota Bengkulu"
                className="w-14 h-14 object-contain brightness-125"
              />
              <div>
                <h4 className="font-black text-white leading-none tracking-tight text-lg">
                  DATABASE{" "}
                  <span className="text-amber-400 italic">INFRASTRUKTUR</span>
                </h4>
                <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] mt-1">
                  Kota Bengkulu
                </p>
              </div>
            </div>

            <p className="text-sm leading-relaxed text-blue-100/60 border-l-2 border-amber-400/30 pl-4">
              Portal resmi pengelolaan informasi infrastruktur dan aset daerah
              Kota Bengkulu. Berbasis data spasial untuk mewujudkan pembangunan
              yang cerdas dan berkelanjutan.
            </p>

            <div className="flex gap-3">
              {socialLinks.map((social, i) => (
                <a
                  key={i}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-amber-400 hover:text-blue-950 transition-all duration-500 border border-white/10 group"
                >
                  <span className="group-hover:scale-110 transition-transform">
                    {social.icon}
                  </span>
                </a>
              ))}
            </div>
          </div>

          {/* KOLOM 2: CONTACT INFO */}
          <div className="space-y-8">
            <h4 className="text-sm font-black text-white uppercase tracking-[0.2em] flex items-center gap-3">
              <span className="w-8 h-px bg-amber-400" />
              Kontak Kami
            </h4>
            <div className="space-y-6">
              <div className="flex gap-5 group">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-blue-900 flex items-center justify-center text-amber-400 group-hover:bg-amber-400 group-hover:text-blue-900 transition-colors">
                  <MapPin size={20} />
                </div>
                <p className="text-sm leading-relaxed">
                  Jl. Soeprapto Dalam, Betungan,
                  <br />{" "}
                  <span className="text-white font-medium">
                    Kec. Selebar, Kota Bengkulu
                  </span>
                </p>
              </div>
              <div className="flex gap-5 group">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-blue-900 flex items-center justify-center text-amber-400 group-hover:bg-amber-400 group-hover:text-blue-900 transition-colors">
                  <Mail size={20} />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-blue-400 mb-1">
                    Email Resmi
                  </p>
                  <p className="text-sm text-white font-medium">
                    dpupr.bengkulukota@gmail.com
                  </p>
                </div>
              </div>
              <div className="flex gap-5 group">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-blue-900 flex items-center justify-center text-amber-400 group-hover:bg-amber-400 group-hover:text-blue-900 transition-colors">
                  <Phone size={20} />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-blue-400 mb-1">
                    Layanan Telepon
                  </p>
                  <p className="text-sm text-white font-medium">0736 3877</p>
                </div>
              </div>
            </div>
          </div>

          {/* KOLOM 3: SUPPORT BOX */}
          <div className="space-y-8">
            <h4 className="text-sm font-black text-white uppercase tracking-[0.2em] flex items-center gap-3">
              <span className="w-8 h-px bg-amber-400" />
              Layanan Publik
            </h4>
            <div className="relative p-8 rounded-[2rem] bg-gradient-to-br from-blue-900/50 to-blue-800/30 border border-white/10 overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-150 transition-transform duration-700">
                <Globe size={80} className="text-white" />
              </div>

              <p className="text-sm text-blue-100/70 leading-relaxed mb-8 relative z-10">
                Butuh bantuan teknis terkait data aset atau ingin melaporkan
                masalah infrastruktur di wilayah Anda?
              </p>
              <button className="w-full py-4 bg-amber-400 hover:bg-amber-300 text-blue-950 rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all shadow-lg shadow-amber-900/20 active:scale-95 relative z-10">
                Hubungi Support
              </button>
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION */}
        <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-center md:text-left">
            <p className="text-xs font-bold text-blue-400/60 uppercase tracking-widest mb-1">
              © 2026 Pemerintah Kota Bengkulu
            </p>
            <p className="text-[10px] text-blue-100/40">
              Dikembangkan oleh Bidang Bina Marga - DPUPR Kota Bengkulu
            </p>
          </div>

          <div className="flex items-center gap-10">
            <div className="hidden lg:flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-blue-400/40">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              Server Status: Online
            </div>

            <button
              onClick={scrollToTop}
              className="group flex items-center gap-4 text-xs font-black uppercase tracking-[0.2em] text-white hover:text-amber-400 transition-all"
            >
              Back To Top
              <div className="w-12 h-12 rounded-full border-2 border-white/10 flex items-center justify-center group-hover:border-amber-400 group-hover:-translate-y-1 transition-all duration-300">
                ↑
              </div>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

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

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-slate-950 text-slate-300 pt-20 pb-10 relative overflow-hidden">
      {/* Dekorasi Halus */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />

      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-16">
          {/* KOLOM 1: BRANDING */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <img
                src="https://iconlogovector.com/uploads/images/2023/05/lg-9cee3ca8e0a838a8e72da83c54f6e5fc56.jpg"
                alt="Logo Kota Bengkulu"
                className="w-12 h-12 object-contain brightness-110"
              />
              <div>
                <h4 className="font-black text-white leading-none tracking-tight">
                  DATABASE <span className="text-emerald-500">ASET</span>
                </h4>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                  Kota Bengkulu
                </p>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-slate-400 mb-6">
              Portal resmi pengelolaan informasi infrastruktur dan aset daerah
              yang transparan, akuntabel, dan berbasis spasial untuk pembangunan
              berkelanjutan.
            </p>
            <div className="flex gap-4">
              {[
                { icon: <Instagram size={18} />, href: "#" },
                { icon: <Facebook size={18} />, href: "#" },
                { icon: <Youtube size={18} />, href: "#" },
              ].map((social, i) => (
                <a
                  key={i}
                  href={social.href}
                  className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all duration-300 border border-white/5"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* KOLOM 2: QUICK LINKS */}
          {/* <div>
            <h4 className="text-sm font-black text-white uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full" />
              Tautan Cepat
            </h4>
            <ul className="space-y-4">
              {[
                "Beranda",
                "Peta Interaktif",
                "Statistik Aset",
                "Produk Hukum",
                "Panduan Pengguna",
              ].map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-sm hover:text-emerald-400 flex items-center group transition-colors"
                  >
                    <ArrowUpRight
                      size={14}
                      className="mr-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all"
                    />
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div> */}

          {/* KOLOM 3: CONTACT INFO */}
          <div>
            <h4 className="text-sm font-black text-white uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full" />
              Kontak Kami
            </h4>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="mt-1 text-emerald-500">
                  <MapPin size={18} />
                </div>
                <p className="text-sm leading-relaxed">
                  Jl. Soeprapto Dalam, Betungan,
                  <br /> Kec. Selebar, Kota Bengkulu
                </p>
              </div>
              <div className="flex gap-4">
                <div className="text-emerald-500">
                  <Mail size={18} />
                </div>
                <p className="text-sm">dpupr.bengkulukota@gmail.com</p>
              </div>
              <div className="flex gap-4">
                <div className="text-emerald-500">
                  <Phone size={18} />
                </div>
                <p className="text-sm">0736 3877</p>
              </div>
            </div>
          </div>

          {/* KOLOM 4: BADGE/WIDGET */}
          <div>
            <h4 className="text-sm font-black text-white uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full" />
              Layanan Terkait
            </h4>
            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-600/10 to-blue-600/10 border border-white/5">
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Butuh bantuan teknis terkait data aset atau ingin melaporkan
                masalah infrastruktur?
              </p>
              <button className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all">
                Hubungi Support
              </button>
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION */}
        <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs font-medium text-slate-500">
            © 2026{" "}
            <span className="text-slate-300">Pemerintah Kota Bengkulu</span>.
            Dikembangkan oleh DPUPR.
          </p>

          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
              <Globe size={14} className="text-emerald-500" />
            </div>
            <button
              onClick={scrollToTop}
              className="group flex items-center gap-2 text-xs font-black uppercase tracking-widest text-white hover:text-emerald-400 transition-colors"
            >
              Back To Top
              <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center group-hover:border-emerald-500 transition-colors">
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

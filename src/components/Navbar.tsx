import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ArrowRight, LayoutDashboard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  // Efek scroll untuk mengubah tampilan navbar
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [{ name: "Beranda", path: "/" }];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${
        scrolled
          ? "py-3 bg-white/80 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.05)] border-b border-slate-200/50"
          : "py-5 bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        {/* LOGO SECTION */}
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="relative">
            <div className="absolute inset-0 bg-emerald-500 blur-lg opacity-0 group-hover:opacity-40 transition-opacity duration-500" />
            <img
              src="https://iconlogovector.com/uploads/images/2023/05/lg-9cee3ca8e0a838a8e72da83c54f6e5fc56.jpg"
              alt="Logo"
              className="w-10 h-10 object-contain relative transition-transform duration-500 group-hover:scale-110"
            />
          </div>
          <div className="flex flex-col">
            <h1
              className={`text-sm font-black tracking-tighter leading-none transition-colors duration-300 ${
                scrolled
                  ? "text-slate-900"
                  : "text-white md:text-white sm:text-slate-900"
              }`}
            >
              DATABASE <span className="text-emerald-500">ASET</span>
            </h1>
            <p
              className={`text-[10px] font-bold uppercase tracking-[0.2em] transition-colors duration-300 ${
                scrolled ? "text-slate-400" : "text-slate-300"
              }`}
            >
              Kota Bengkulu
            </p>
          </div>
        </Link>

        {/* NAV - DESKTOP */}
        <nav className="hidden md:flex items-center space-x-1">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 relative group ${
                scrolled
                  ? "text-slate-600 hover:text-emerald-600"
                  : "text-white/80 hover:text-white"
              }`}
            >
              {link.name}
              {/* Underline Indicator */}
              <span
                className={`absolute bottom-0 left-4 right-4 h-0.5 bg-emerald-500 transform scale-x-0 transition-transform duration-300 group-hover:scale-x-100 ${
                  location.pathname === link.path ? "scale-x-100" : ""
                }`}
              />
            </Link>
          ))}

          <div className="h-6 w-px bg-slate-300/30 mx-4" />

          <Link
            to="/login"
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all duration-300 active:scale-95 ${
              scrolled
                ? "bg-slate-900 text-white hover:bg-emerald-600 shadow-lg shadow-slate-900/10"
                : "bg-white text-slate-900 hover:bg-emerald-500 hover:text-white shadow-xl"
            }`}
          >
            Masuk
            <ArrowRight size={14} />
          </Link>
        </nav>

        {/* TOGGLE BUTTON - MOBILE */}
        <button
          onClick={() => setOpen(!open)}
          className={`md:hidden p-2 rounded-xl transition-colors ${
            scrolled
              ? "text-slate-900 bg-slate-100"
              : "text-white bg-white/10 backdrop-blur-md"
          }`}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-slate-100 overflow-hidden shadow-2xl"
          >
            <nav className="flex flex-col p-6 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className="px-4 py-4 rounded-2xl text-sm font-black text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 transition-all flex justify-between items-center group"
                  onClick={() => setOpen(false)}
                >
                  {link.name}
                  <ArrowRight
                    size={16}
                    className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all"
                  />
                </Link>
              ))}

              <div className="pt-4 mt-2 border-t border-slate-100">
                <Link
                  to="/login"
                  className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-xl active:scale-[0.98] transition-all"
                  onClick={() => setOpen(false)}
                >
                  Akses Dashboard
                  <LayoutDashboard size={18} />
                </Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;

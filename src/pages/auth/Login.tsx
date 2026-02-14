import React, { useEffect, useState } from "react";
import {
  Lock,
  Mail,
  ArrowLeft,
  ShieldCheck,
  ChevronRight,
  Loader2,
  EyeOff,
  Eye,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { authService } from "../../services/authService";
import { setUserData } from "../../store/userSlice";
import type { RootState } from "../../store/store";

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { token } = useSelector((state: any) => state.user);

  const loginMutation = useMutation({
    mutationFn: async () => await authService.login({ username, password }),
    onSuccess: (response) => {
      const userData = {
        userId: response.data.userId,
        name: response.data.name,
        username: response.data.username,
        role: response.data.role,
        token: response.data.token,
      };

      dispatch(setUserData(userData));
      localStorage.setItem("user", JSON.stringify(userData));

      toast.success("Akses diterima. Selamat datang kembali!");
      navigate("/dashboard");
    },
    onError: () => {
      toast.error("Kredensial salah. Periksa kembali username & sandi.");
    },
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate();
  };

  useEffect(() => {
    if (token) navigate("/dashboard");
  }, [token, navigate]);

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* --- BACKGROUND DECORATION --- */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" />

      <div className="w-full max-w-[440px] z-10">
        {/* TOMBOL KEMBALI */}
        <button
          onClick={() => navigate("/")}
          className="group mb-8 flex items-center gap-2 text-slate-500 hover:text-emerald-600 transition-all duration-300 font-bold text-sm"
        >
          <div className="p-2 rounded-lg group-hover:bg-emerald-50 transition-colors">
            <ArrowLeft size={18} />
          </div>
          Kembali ke Beranda
        </button>

        {/* KARTU LOGIN */}
        <div className="bg-white/80 backdrop-blur-2xl border border-white shadow-[0_20px_50px_rgba(0,0,0,0.05)] rounded-[2.5rem] p-10 relative">
          {/* HEADER SECTION */}
          <div className="flex flex-col items-center mb-10">
            <div className="relative mb-6 group">
              <div className="absolute inset-0 bg-emerald-500 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity animate-pulse" />
              <img
                src="https://iconlogovector.com/uploads/images/2023/05/lg-9cee3ca8e0a838a8e72da83c54f6e5fc56.jpg"
                alt="Logo"
                className="w-20 h-20 object-contain relative drop-shadow-2xl transition-transform group-hover:scale-110 duration-500"
              />
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight text-center leading-tight uppercase">
              Database <span className="text-emerald-600">Aset</span>
            </h2>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-2">
              Pemerintah Kota Bengkulu
            </p>
          </div>

          {/* FORM SECTION */}
          <form onSubmit={handleLogin} className="space-y-6">
            {/* USERNAME */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider">
                Username
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                  <Mail size={18} />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username"
                  className="w-full pl-12 pr-4 py-4 bg-slate-100/50 border border-transparent focus:bg-white focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 rounded-2xl text-sm font-semibold transition-all outline-none placeholder:text-slate-300"
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Kata Sandi
                </label>
                <a
                  href="#"
                  className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
                >
                  Lupa Password?
                </a>
              </div>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-4 bg-slate-100/50 border border-transparent focus:bg-white focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 rounded-2xl text-sm font-semibold transition-all outline-none placeholder:text-slate-300"
                />

                {/* TOMBOL SHOW/HIDE */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-200/50 rounded-lg transition-all"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* REMEMBER ME */}
            <div className="flex items-center gap-2 px-1">
              <input
                type="checkbox"
                id="remember"
                className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer accent-emerald-500"
              />
              <label
                htmlFor="remember"
                className="text-xs font-bold text-slate-500 cursor-pointer select-none"
              >
                Ingat perangkat ini
              </label>
            </div>

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full bg-slate-900 hover:bg-emerald-600 text-white py-4 rounded-2xl font-bold text-sm shadow-xl shadow-slate-900/10 hover:shadow-emerald-500/20 transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed group"
            >
              {loginMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Mengautentikasi...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5" />
                  Masuk Sekarang
                  <ChevronRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </>
              )}
            </button>
          </form>

          {/* FOOTER SECTION */}
          <div className="mt-10 pt-8 border-t border-slate-100 flex flex-col items-center gap-1">
            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.1em] text-center">
              Sistem Informasi Geografis Aset
            </p>
            <p className="text-[10px] font-bold text-slate-400">
              &copy; 2025 Pemerintah Kota Bengkulu
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

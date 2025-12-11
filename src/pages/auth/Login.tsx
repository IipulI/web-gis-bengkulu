import React, { useState } from "react";
import { Lock, Mail, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { authService } from "../../services/authService";
import { setUserData } from "../../store/userSlice";

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

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

      toast.success("Login berhasil 🎉");
      navigate("/dashboard");
    },
    onError: () => {
      toast.error("Username atau password salah!");
    },
  });

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");
    loginMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/90 backdrop-blur-xl border shadow-xl rounded-3xl p-8 relative">
        <button
          onClick={() => navigate("/")}
          className="absolute left-4 top-4 flex items-center text-blue-700 hover:text-blue-900 transition font-semibold"
        >
          <ArrowLeft className="mr-1" size={18} /> Kembali
        </button>

        <div className="flex flex-col items-center mt-6 mb-6">
          <img
            src="https://iconlogovector.com/uploads/images/2023/05/lg-9cee3ca8e0a838a8e72da83c54f6e5fc56.jpg"
            alt="Logo"
            className="w-20 h-20 object-contain mb-3 drop-shadow-md"
          />
          <h2 className="text-2xl font-extrabold text-blue-900 tracking-wide">
            Database Aset
          </h2>
          <p className="text-sm text-gray-500 -mt-1">
            Pemerintah Kota Bengkulu
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username"
                className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kata Sandi
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center space-x-2 text-gray-600">
              <input
                type="checkbox"
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span>Ingat saya</span>
            </label>
            <a href="#" className="text-blue-600 hover:underline">
              Lupa Password?
            </a>
          </div>

          {error && <p className="text-red-600 text-sm text-center">{error}</p>}

          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-semibold transition duration-200 shadow-md hover:shadow-lg disabled:opacity-60"
          >
            {loginMutation.isPending ? "Memproses..." : "Masuk"}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-8">
          © 2025 Pemerintah Kota Bengkulu.
          <br /> Data Aset Kota Bengkulu
        </p>
      </div>
    </div>
  );
}

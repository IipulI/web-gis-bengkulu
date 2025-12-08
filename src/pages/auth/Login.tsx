import React from "react";
import { Lock, Mail } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    // Dummy credential
    const validEmail = "admin@gmail.com";
    const validPassword = "admin123";

    if (email === validEmail && password === validPassword) {
      setError("");
      navigate("/dashboard"); // redirect
    } else {
      setError("Email atau kata sandi salah!");
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md bg-white/95 backdrop-blur-sm shadow-2xl rounded-2xl p-8 border border-blue-100">
        <h2 className="text-2xl font-bold text-center text-blue-900 mb-6">
          Masuk ke Akun Anda
        </h2>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Alamat Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contoh@email.com"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-semibold transition duration-200 shadow-md hover:shadow-lg"
          >
            Masuk
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-8">
          © 2025 Pemerintah Kota Bengkulu.
          <br />
          Data Aset Kota Bengkulu
        </p>
      </div>
    </div>
  );
}

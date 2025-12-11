// src/routes/ProtectedRoute.tsx
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import { type RootState, reduxStore } from "../store/store";
import { toast } from "sonner";
import { clearUserData } from "../store/userSlice";

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { role, token } = useSelector((state: RootState) => state.user);
  const [redirectTo, setRedirectTo] = useState<string | null>(null);

  useEffect(() => {
    // 🧩 Ambil data user dari localStorage
    const localUser = localStorage.getItem("user");
    const parsedUser = localUser ? JSON.parse(localUser) : null;
    const localToken = parsedUser?.token;

    // 🔒 Jika token hilang dari Redux ATAU localStorage
    if (!token || !localToken) {
      reduxStore.dispatch(clearUserData());
      toast.error("Sesi Anda telah berakhir. Silakan login kembali!");
      setRedirectTo("/login");
      return;
    }

    // 🧠 Jika role tidak sesuai
    if (allowedRoles && !allowedRoles.includes(role || "")) {
      toast.warning("Anda tidak memiliki akses ke halaman ini!");
      setRedirectTo("/");
      return;
    }
  }, [token, role, allowedRoles]);

  // 🪄 Tambahkan listener agar auto logout kalau user dihapus manual dari localStorage
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "user" && !event.newValue) {
        reduxStore.dispatch(clearUserData());
        toast.error("Sesi Anda telah berakhir.");
        window.location.href = "/login";
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // 🚪 Redirect kalau tidak memenuhi syarat
  if (redirectTo) return <Navigate to={redirectTo} replace />;

  return <Outlet />;
}

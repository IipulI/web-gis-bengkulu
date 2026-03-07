import {
  FileText,
  HelpCircle,
  Home,
  Layers,
  Map,
  Settings,
  ShieldUser,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";

import React, { useContext, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../store/store";
import { hasPermission, Permission } from "../permission/permission";
import { categoryService } from "../services/categoryService";
import { useQuery } from "@tanstack/react-query";
import { LogOut } from "lucide-react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { clearUserData } from "../store/userSlice";

interface SubCategory {
  name: string;
  value: string;
}

interface MenuItem {
  name: string;
  icon: any; // Atau gunakan LucideIcon jika kamu mengimport tipenya
  path: string;
  permission: Permission;
  children?: SubCategory[]; // Tanda tanya (?) berarti opsional
}

interface MenuGroup {
  key: string;
  title?: string;
  items: MenuItem[];
}

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { role } = useSelector((state: RootState) => state.user);

  const [openGroup, setOpenGroup] = useState<string | null>("gis"); // Default open gis untuk estetika
  const [openSubGroup, setOpenSubGroup] = useState<string | null>(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const { data: categoryResponse } = useQuery({
    queryKey: ["sidebar-categories"],
    queryFn: categoryService.getCategory,
    staleTime: 1000 * 60 * 10,
  });

  const categories = categoryResponse || [];

  const toggleGroup = (key: string) => {
    setOpenGroup((prev) => (prev === key ? null : key));
  };

  const toggleSubGroup = (key: string) => {
    setOpenSubGroup((prev) => (prev === key ? null : key));
  };

  const handleLogout = () => {
    dispatch(clearUserData());
    navigate("/login");
  };

  // Helper untuk mengecek active state yang lebih clean
  const getActiveStyles = (isActive: boolean) =>
    isActive
      ? "bg-emerald-500/10 text-emerald-600 shadow-[inset_0px_0px_0px_1px_rgba(16,185,129,0.2)]"
      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900";

  const toggleMobile = () => setIsMobileOpen(!isMobileOpen);
  const menuGroups: MenuGroup[] = [
    {
      key: "general",
      items: [
        {
          name: "Dashboard",
          icon: Home,
          path: "/dashboard",
          permission: Permission.DASHBOARD_VIEW,
        },
      ],
    },
    {
      key: "gis",
      title: "GIS & Data",
      items: [
        {
          name: "Peta & Layer",
          icon: Map,
          path: "/dashboard/map-layer",
          permission: Permission.MAP_LAYER_VIEW,
        },
        {
          name: "Layer Schema",
          icon: Layers,
          path: "/dashboard/layer-schema",
          permission: Permission.LAYER_SCHEMA_VIEW,
        },
        {
          name: "Laporan Data Aset",
          icon: FileText,
          path: "/dashboard/report", // ✅ tambahkan ini
          permission: Permission.REPORT_VIEW,
          children: categories,
        },
      ],
    },
    {
      key: "management",
      title: "Manajemen",
      items: [
        {
          name: "Manajemen User",
          icon: Layers,
          path: "/dashboard/user-management",
          permission: Permission.USER_MANAGEMENT_VIEW,
        },
        {
          name: "Manajemen Role",
          icon: ShieldUser,
          path: "/dashboard/user-role",
          permission: Permission.USER_ROLE_VIEW,
        },
      ],
    },
  ];

  const footerLinks = [
    {
      name: "Bantuan",
      icon: HelpCircle,
      path: "/dashboard/help",
      permission: Permission.HELP_VIEW,
    },
    {
      name: "Pengaturan",
      icon: Settings,
      path: "/dashboard/settings",
      permission: Permission.SETTINGS_VIEW,
    },
  ];

  return (
    <>
      {/* --- MOBILE TOPBAR --- */}
      <div className="lg:hidden flex items-center justify-between bg-white border-b px-4 py-3 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-amber-500 rounded-lg shadow-sm">
            <img
              src="logo-url"
              className="w-5 h-5 brightness-0 invert"
              alt="Logo"
            />
          </div>
          <span className="font-black text-slate-900 text-xs uppercase tracking-tight">
            Database Aset
          </span>
        </div>
        <button
          onClick={toggleMobile}
          className="p-2 bg-slate-100 rounded-xl text-slate-600 hover:bg-amber-50 hover:text-amber-600 transition-all"
        >
          {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* --- OVERLAY --- */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        className={`
    fixed inset-y-0 left-0 z-[70] w-72 bg-white flex flex-col h-screen border-r border-slate-200/60 transition-transform duration-300 ease-in-out
    lg:sticky lg:translate-x-0
    ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
  `}
      >
        {/* HEADER: Brand Identity */}
        <div className="p-8 pb-6 flex flex-col items-start gap-4">
          <div className="p-2.5 bg-amber-500 rounded-2xl shadow-lg shadow-amber-500/30">
            <img
              src="https://iconlogovector.com/uploads/images/2023/05/lg-9cee3ca8e0a838a8e72da83c54f6e5fc56.jpg"
              className="w-7 h-7 brightness-0 invert"
              alt="Logo"
            />
          </div>
          <div>
            <h1 className="font-black text-slate-900 text-sm leading-tight tracking-tight uppercase">
              Database Aset
            </h1>
            <p className="text-[10px] font-bold text-indigo-600 tracking-[0.2em] uppercase">
              Kota Bengkulu
            </p>
          </div>
        </div>

        {/* NAVIGATION BODY */}
        <nav className="flex-1 px-4 py-2 overflow-y-auto custom-scrollbar space-y-6">
          {menuGroups.map((group) => {
            const visibleItems = group.items.filter((item) =>
              hasPermission(role, item.permission),
            );
            if (visibleItems.length === 0) return null;

            return (
              <div key={group.key} className="space-y-1">
                {/* GROUP TITLE/HEADER */}
                {group.title && (
                  <div className="flex items-center justify-between px-4 mb-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      {group.title}
                    </span>
                    <div className="h-[1px] flex-1 bg-slate-100 ml-3" />
                  </div>
                )}

                {visibleItems.map((item) => {
                  const { name, icon: Icon, path, children } = item;

                  // CASE 1: ITEM WITH CHILDREN
                  if (children) {
                    const isSubOpen = openSubGroup === "report";
                    const isActiveParent =
                      location.pathname.includes("/dashboard/report");

                    return (
                      <div key="report-group" className="space-y-1">
                        <div
                          className={`flex items-center group px-2 rounded-xl transition-all duration-200 ${
                            isActiveParent
                              ? "bg-indigo-50 text-indigo-700"
                              : "hover:bg-slate-50 text-slate-600"
                          }`}
                        >
                          <Link
                            to="/dashboard/report"
                            className="flex items-center gap-3 flex-1 py-2.5 pl-2 font-bold text-[13px]"
                          >
                            <Icon
                              className={`w-4 h-4 ${isActiveParent ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-900"}`}
                            />
                            {name}
                          </Link>
                          <button
                            onClick={() => toggleSubGroup("report")}
                            className="p-2 hover:bg-black/5 rounded-lg transition-colors"
                          >
                            <ChevronDown
                              className={`w-3.5 h-3.5 transition-transform duration-300 ${isSubOpen ? "rotate-180" : ""}`}
                            />
                          </button>
                        </div>

                        <div
                          className={`overflow-hidden transition-all duration-500 ease-in-out ${isSubOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}
                        >
                          <div className="ml-6 pl-4 border-l-2 border-slate-100 space-y-1 mt-1 pb-2">
                            {children.map((cat: any) => {
                              const isActive =
                                location.pathname ===
                                `/dashboard/report/${cat.value}`;
                              return (
                                <Link
                                  key={cat.value}
                                  to={`/dashboard/report/${cat.value}`}
                                  className={`block py-2 px-3 rounded-lg text-xs font-bold transition-all duration-200 ${
                                    isActive
                                      ? "text-indigo-600 bg-indigo-50/50"
                                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                                  }`}
                                >
                                  {cat.name}
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  }

                  // CASE 2: NORMAL LINK
                  const isActive = location.pathname === path;
                  return (
                    <Link
                      key={name}
                      to={path}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl font-bold text-[13px] group transition-all duration-200 ${
                        isActive
                          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                          : "hover:bg-slate-50 text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400 group-hover:text-amber-500"}`}
                      />
                      {name}
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </nav>

        {/* FOOTER: User Profile & Quick Actions */}
        <div className="p-4 bg-slate-50/80 border border-slate-200/60 m-4 rounded-[2rem] space-y-3 shadow-sm">
          <div className="flex justify-around pb-2 border-b border-slate-200/50">
            {footerLinks.map(({ name, icon: Icon, path }) => (
              <Link
                key={name}
                to={path}
                title={name}
                className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all"
              >
                <Icon className="w-4 h-4" />
              </Link>
            ))}
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {/* Profile Card */}
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-tr from-amber-500 to-amber-400 rounded-2xl shadow-md flex items-center justify-center text-white font-black text-xs">
                {role?.slice(0, 2).toUpperCase()}
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-50">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              </div>
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-black text-slate-900 truncate uppercase tracking-tight">
                {role === "Admin" ? "Administrator" : "GIS Analyst"}
              </p>
              <p className="text-[10px] font-bold text-slate-400 tracking-wider">
                {role}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

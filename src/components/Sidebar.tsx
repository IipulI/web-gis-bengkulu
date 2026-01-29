import {
  FileText,
  HelpCircle,
  Home,
  Layers,
  Map,
  Settings,
  ShieldUser,
  ChevronDown,
} from "lucide-react";

import React, { useContext, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../store/store";
import { hasPermission, Permission } from "../permission/permission";

const Sidebar = () => {
  const location = useLocation();
  const { role } = useSelector((state: RootState) => state.user);

  const [openGroup, setOpenGroup] = useState<string | null>("gis");

  const toggleGroup = (key: string) => {
    setOpenGroup((prev) => (prev === key ? null : key));
  };

  const menuGroups = [
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
          path: "/dashboard/report",
          permission: Permission.REPORT_VIEW,
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
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* HEADER */}
      <div className="p-6 border-b border-gray-200 flex items-center gap-2">
        <img
          src="https://iconlogovector.com/uploads/images/2023/05/lg-9cee3ca8e0a838a8e72da83c54f6e5fc56.jpg"
          className="w-10 h-10"
        />
        <span className="font-semibold text-base text-gray-800">
          Database Aset Kota Bengkulu
        </span>
      </div>

      {/* NAV */}
      <nav className="flex-1 p-4 space-y-2 text-sm">
        {menuGroups.map((group) => {
          const visibleItems = group.items.filter((item) =>
            hasPermission(role, item.permission),
          );
          if (visibleItems.length === 0) return null;

          const isOpen = openGroup === group.key;

          // GROUP DENGAN DROPDOWN
          if (group.title) {
            return (
              <div key={group.key}>
                {/* GROUP HEADER — STYLE SAMA PERSIS MENU */}
                <button
                  onClick={() => toggleGroup(group.key)}
                  className="flex items-center justify-between w-full p-2 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <span>{group.title}</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* GROUP ITEMS */}
                <div
                  className={`overflow-hidden transition-all ${
                    isOpen ? "max-h-96" : "max-h-0"
                  }`}
                >
                  {visibleItems.map(({ name, icon: Icon, path }) => {
                    const isActive = location.pathname === path;
                    return (
                      <Link
                        key={name}
                        to={path}
                        className={`flex items-center gap-2 w-full p-2 mx-2 rounded-lg font-medium transition-colors ${
                          isActive
                            ? "bg-green-50 text-green-700"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {name}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          }

          // GROUP TANPA DROPDOWN (Dashboard)
          return visibleItems.map(({ name, icon: Icon, path }) => {
            const isActive = location.pathname === path;
            return (
              <Link
                key={name}
                to={path}
                className={`flex items-center gap-2 w-full p-2 rounded-lg font-medium transition-colors ${
                  isActive
                    ? "bg-green-50 text-green-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Icon className="w-4 h-4" />
                {name}
              </Link>
            );
          });
        })}
      </nav>

      {/* FOOTER */}
      <div className="border-t border-gray-200 p-4 space-y-3">
        {footerLinks
          .filter((item) => hasPermission(role, item.permission))
          .map(({ name, icon: Icon, path }) => {
            const isActive = location.pathname === path;
            return (
              <Link
                key={name}
                to={path}
                className={`flex items-center gap-2 w-full p-2 rounded-lg transition-colors ${
                  isActive
                    ? "bg-green-50 text-green-700"
                    : "hover:bg-gray-100 text-gray-700"
                }`}
              >
                <Icon className="w-4 h-4" />
                {name}
              </Link>
            );
          })}

        {/* USER INFO */}
        <div className="flex items-center gap-3 mt-4 p-2 bg-gray-50 rounded-lg">
          <div className="w-8 h-8 bg-gray-300 rounded-full" />
          <div>
            <p className="text-sm font-medium text-gray-800">
              {role === "Admin" ? "Admin GIS" : "Staff GIS"}
            </p>
            <p className="text-xs text-gray-500">{role}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

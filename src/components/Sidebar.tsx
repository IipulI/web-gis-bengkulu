import { FileText, HelpCircle, Home, Map, Settings } from "lucide-react";
import React from "react";
import { Link, useLocation } from "react-router-dom";

const Sidebar = () => {
  const location = useLocation();

  const navLinks = [
    { name: "Dashboard", icon: Home, path: "/dashboard" },
    // { name: "Upload Data GIS", icon: Layers, path: "/gis-upload" },
    { name: "Peta & Layer", icon: Map, path: "/dashboard/map-layer" },
    { name: "Laporan Data Aset", icon: FileText, path: "/dashboard/report" },
  ];

  const footerLinks = [
    { name: "Bantuan", icon: HelpCircle, path: "/dashboard/help" },
    { name: "Pengaturan", icon: Settings, path: "/dashboard/settings" },
  ];

  return (
    <aside className={`w-64 bg-white border-r border-gray-200 flex flex-col `}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200 flex items-center gap-2">
        <img
          src="https://iconlogovector.com/uploads/images/2023/05/lg-9cee3ca8e0a838a8e72da83c54f6e5fc56.jpg"
          alt="Logo Kota Bengkulu"
          className="w-10 h-10"
        />
        <span className="font-semibold text-base text-gray-800">
          Database Aset Kota Bengkulu
        </span>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 p-4 space-y-2 text-sm">
        {navLinks.map(({ name, icon: Icon, path }) => {
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
              <Icon className="w-4 h-4" /> {name}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-200 p-4 space-y-2">
        {footerLinks.map(({ name, icon: Icon, path }) => {
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
              <Icon className="w-4 h-4" /> {name}
            </Link>
          );
        })}

        <div className="flex items-center gap-3 mt-4 p-2 bg-gray-50 rounded-lg">
          <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
          <div>
            <p className="text-sm font-medium text-gray-800">Admin GIS</p>
            <p className="text-xs text-gray-500">Administrator</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

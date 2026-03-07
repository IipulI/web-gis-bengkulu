import Sidebar from "../components/Sidebar";

const DashboardLayout = ({ children, sidebarHidden = false }) => {
  return (
    // Kita gunakan flex-col di mobile agar Topbar (dari Sidebar) berada di atas
    // Dan flex-row di desktop (lg) agar Sidebar berada di samping
    <div className="min-h-screen flex flex-col lg:flex-row bg-gray-50 text-gray-800">
      {!sidebarHidden && <Sidebar />}

      {/* PENTING:
        1. flex-1 agar main mengambil sisa ruang yang ada.
        2. w-full agar tidak meluber di layar kecil.
        3. min-w-0 adalah trik CSS agar konten di dalam main (seperti tabel/grafik)
           tidak merusak lebar layout (flexbox bug).
      */}
      <main className="flex-1 w-full min-w-0 p-4 lg:p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;

import Sidebar from "../components/Sidebar";

const DashboardLayout = ({ children, sidebarHidden = false }) => {
  return (
    <div className="min-h-screen flex bg-gray-50 text-gray-800">
      {!sidebarHidden && <Sidebar />}
      <main className="flex-1 p-8 overflow-y-auto">{children}</main>
    </div>
  );
};

export default DashboardLayout;

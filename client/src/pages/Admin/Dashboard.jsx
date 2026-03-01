import React from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "../../components/admin/AdminSidebar";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-[#0e0e0e] flex font-sans">
      <AdminSidebar />
      <main className="flex-1 h-screen overflow-y-auto">
        <div className="p-8 max-w-[1600px] mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

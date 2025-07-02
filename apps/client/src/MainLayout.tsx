// src/components/Layout/MainLayout.tsx
import React from "react";
import Sidebar from "./components/Layout/Sidebar";
import { Outlet } from "react-router-dom";

const MainLayout: React.FC = () => {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 overflow-auto p-4">
        <Outlet /> {/* ← This is where Upload, Preview, etc. will render */}
      </div>
    </div>
  );
};

export default MainLayout;

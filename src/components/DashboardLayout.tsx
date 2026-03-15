import { Outlet } from "react-router-dom";
import TopBar from "./TopBar";
import AppSidebar from "./AppSidebar";

const DashboardLayout = () => {
  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <AppSidebar />
      <main className="ml-[220px] pt-16">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;

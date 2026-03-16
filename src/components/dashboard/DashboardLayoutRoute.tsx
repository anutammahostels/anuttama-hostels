import { Outlet } from "react-router-dom";
import { DashboardLayout } from "./DashboardLayout";

export const DashboardLayoutRoute = () => (
  <DashboardLayout>
    <Outlet />
  </DashboardLayout>
);

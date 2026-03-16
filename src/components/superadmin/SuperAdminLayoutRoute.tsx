import { Outlet } from "react-router-dom";
import { SuperAdminLayout } from "./SuperAdminLayout";

export const SuperAdminLayoutRoute = () => (
  <SuperAdminLayout>
    <Outlet />
  </SuperAdminLayout>
);

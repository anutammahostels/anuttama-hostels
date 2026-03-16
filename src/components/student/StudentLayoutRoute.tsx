import { Outlet } from "react-router-dom";
import { StudentLayout } from "./StudentLayout";

export const StudentLayoutRoute = () => (
  <StudentLayout>
    <Outlet />
  </StudentLayout>
);

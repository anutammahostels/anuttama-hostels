import { SuperAdminLayout } from "@/components/superadmin/SuperAdminLayout";

interface SuperAdminWrapperProps {
  children: React.ReactNode;
}

/**
 * Wraps existing admin/student pages inside the Super Admin layout
 * by stripping their original layout and using SuperAdminLayout instead.
 */
const SuperAdminWrapper = ({ children }: SuperAdminWrapperProps) => {
  return <SuperAdminLayout>{children}</SuperAdminLayout>;
};

export default SuperAdminWrapper;

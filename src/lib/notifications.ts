import { supabase } from "@/integrations/supabase/client";

export type NotificationType = "gate_pass" | "complaint" | "maintenance" | "billing" | "admission" | "general";

export async function createNotification(
  userId: string,
  title: string,
  message: string,
  type: NotificationType = "general",
  link?: string
) {
  try {
    const { error } = await supabase.rpc("create_notification", {
      _target_user_id: userId,
      _title: title,
      _message: message,
      _type: type,
      _link: link || null,
    });
    if (error) console.error("Notification error:", error.message);
  } catch (e) {
    console.error("Failed to create notification:", e);
  }
}

export async function createBulkNotifications(
  notifications: { userId: string; title: string; message: string; type: NotificationType; link?: string }[]
) {
  await Promise.allSettled(
    notifications.map((n) => createNotification(n.userId, n.title, n.message, n.type, n.link))
  );
}

/** Get admin/warden user_ids for a property (for sending them notifications) */
export async function getAdminUserIds(propertyId?: string): Promise<string[]> {
  const { data } = await supabase
    .from("user_roles")
    .select("user_id")
    .in("role", ["super_admin", "tenant_admin", "warden"]);
  return (data || []).map((r) => r.user_id);
}

/** Get student's user_id from student record id */
export async function getStudentUserId(studentId: string): Promise<string | null> {
  const { data } = await supabase
    .from("students")
    .select("user_id")
    .eq("id", studentId)
    .maybeSingle();
  return data?.user_id || null;
}

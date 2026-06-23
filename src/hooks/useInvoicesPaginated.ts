import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { InvoiceWithStudent } from "./useInvoices";

interface Params {
  page: number;
  pageSize: number;
  search: string;
  centerId: string; // "all" or property id
  enabled?: boolean;
}

export function useInvoicesPaginated({ page, pageSize, search, centerId, enabled = true }: Params) {
  return useQuery({
    queryKey: ["invoices-paginated", page, pageSize, search, centerId],
    placeholderData: keepPreviousData,
    enabled,
    queryFn: async () => {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      // We need a server-side join when filtering by center (property_id on students).
      const useInner = centerId !== "all";
      const studentSelect = useInner
        ? "student:students!inner(id, roll_number, user_id, property_id, father_name, mother_name, gender, course)"
        : "student:students(id, roll_number, user_id, property_id, father_name, mother_name, gender, course)";

      let query = supabase
        .from("invoices")
        .select(`*, ${studentSelect}`, { count: "exact" })
        .order("created_at", { ascending: false });

      if (useInner) {
        query = query.eq("students.property_id", centerId);
      }

      const term = search.trim();
      if (term) {
        const escaped = term.replace(/[%,()]/g, "");
        // Resolve matching student IDs by:
        //  1. Form Number (students.roll_number)
        //  2. Name / phone / email (profiles → students.user_id)
        let studentQuery = supabase
          .from("students")
          .select("id")
          .ilike("roll_number", `%${escaped}%`)
          .limit(1000);
        if (useInner) studentQuery = studentQuery.eq("property_id", centerId);

        const profileQuery = supabase
          .from("profiles")
          .select("id")
          .or(`full_name.ilike.%${escaped}%,phone.ilike.%${escaped}%,email.ilike.%${escaped}%`)
          .limit(1000);

        const [{ data: matchedStudents, error: sErr }, { data: matchedProfiles, error: pErr }] =
          await Promise.all([studentQuery, profileQuery]);
        if (sErr) throw sErr;
        if (pErr) throw pErr;

        const idSet = new Set<string>((matchedStudents || []).map((s: any) => s.id));
        const userIds = (matchedProfiles || []).map((p: any) => p.id);
        if (userIds.length) {
          let byUser = supabase.from("students").select("id").in("user_id", userIds).limit(1000);
          if (useInner) byUser = byUser.eq("property_id", centerId);
          const { data: byUserRows } = await byUser;
          (byUserRows || []).forEach((r: any) => idSet.add(r.id));
        }

        const ids = Array.from(idSet);
        const orParts = [`invoice_number.ilike.%${escaped}%`];
        if (ids.length) orParts.push(`student_id.in.(${ids.join(",")})`);
        query = query.or(orParts.join(","));
      }

      query = query.range(from, to);

      const { data, error, count } = await query;
      if (error) throw error;
      const rows = data || [];

      const userIds = rows
        .map((r: any) => r.student?.user_id)
        .filter((id: string | undefined): id is string => !!id);

      let profilesMap = new Map<string, any>();
      if (userIds.length) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name, email, phone")
          .in("id", userIds);
        profilesMap = new Map((profiles || []).map((p) => [p.id, p]));
      }

      const enriched: InvoiceWithStudent[] = rows.map((inv: any) => ({
        ...inv,
        student: inv.student
          ? { ...inv.student, profile: profilesMap.get(inv.student.user_id) || null }
          : inv.student_id === null
          ? {
              id: "",
              roll_number: "-",
              user_id: "",
              profile: { full_name: "Deleted Student", email: null, phone: null },
            } as any
          : null,
      }));

      return { rows: enriched, totalCount: count || 0 };
    },
  });
}

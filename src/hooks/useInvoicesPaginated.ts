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
        // Resolve matching student IDs by Form Number (roll_number) first,
        // then OR with invoice_number on the invoices table. Filtering on a
        // joined table inside .or() does not filter parent rows reliably.
        let studentQuery = supabase
          .from("students")
          .select("id")
          .ilike("roll_number", `%${escaped}%`)
          .limit(1000);
        if (useInner) {
          studentQuery = studentQuery.eq("property_id", centerId);
        }
        const { data: matchedStudents, error: sErr } = await studentQuery;
        if (sErr) throw sErr;
        const ids = (matchedStudents || []).map((s: any) => s.id);
        const orParts = [`invoice_number.ilike.%${escaped}%`];
        if (ids.length) {
          orParts.push(`student_id.in.(${ids.join(",")})`);
        }
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

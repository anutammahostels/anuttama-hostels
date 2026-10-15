// Centralized stream options for the Add/Edit Student forms.
// students.department stores the stream (free text historically, from Excel imports —
// legacy values aren't forced into this list; see Students.tsx edit-dialog handling).

export const STREAMS = [
  { value: "NEET", label: "NEET (Pre-Medical)" },
  { value: "JEE Main & Advanced", label: "JEE Main & Advanced (IIT)" },
  { value: "JEE Main", label: "JEE Main" },
  { value: "Foundation", label: "Foundation / Pre-Nurture" },
  { value: "Other", label: "Other" },
] as const;

export function streamLabel(value: string | null | undefined): string {
  return STREAMS.find((s) => s.value === value)?.label ?? value ?? "—";
}

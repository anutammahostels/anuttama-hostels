# Plan: Date-Range Payroll Generation + Clean Employee Date Picker

## 1. Replace cluttered Employee Date-of-Joining picker (Payroll.tsx ~lines 999-1038)

Replace the dual input + scaled dropdown calendar with the standard shadcn Popover + Button + Calendar pattern (single trigger, default chevron navigation, full-size, no `captionLayout="dropdown-buttons"`):

```tsx
<div className="space-y-2">
  <Label>Date of Joining</Label>
  <Popover>
    <PopoverTrigger asChild>
      <Button
        type="button"
        variant="outline"
        className={cn(
          "w-full justify-start text-left font-normal",
          !empForm.date_of_joining && "text-muted-foreground"
        )}
      >
        <CalendarIcon className="mr-2 h-4 w-4" />
        {empForm.date_of_joining
          ? format(empForm.date_of_joining, "PPP")
          : <span>Pick a date</span>}
      </Button>
    </PopoverTrigger>
    <PopoverContent className="w-auto p-0" align="start">
      <Calendar
        mode="single"
        selected={empForm.date_of_joining || undefined}
        onSelect={(d) => setEmpForm(p => ({ ...p, date_of_joining: d || null }))}
        initialFocus
        className={cn("p-3 pointer-events-auto")}
      />
    </PopoverContent>
  </Popover>
</div>
```

## 2. Date-Range Payroll Generation (Payroll.tsx)

### 2a. Period helpers (replace `getMonthsInRange` block ~lines 571-583)

Add utilities that work on date ranges instead of months. The DB `month` text column will store a period token: `"YYYY-MM-DD_to_YYYY-MM-DD"` so no migration is needed and existing locking logic (`isMonthLocked`, lock/unlock mutations that key off `r.month === month`) keeps working.

```ts
// Build period token from start/end ISO date strings
const buildPeriodKey = (start: string, end: string) => `${start}_to_${end}`;

// Parse a stored month/period back to {start, end} dates
const parsePeriodKey = (m: string): { start: Date; end: Date } => {
  if (m.includes("_to_")) {
    const [s, e] = m.split("_to_");
    return { start: new Date(s), end: new Date(e) };
  }
  // Backward compat: legacy "YYYY-MM"
  const [y, mo] = m.split("-").map(Number);
  const start = new Date(y, mo - 1, 1);
  const end = new Date(y, mo, 0);
  return { start, end };
};

// Inclusive day count between two ISO dates
const daysBetween = (start: string, end: string): number => {
  const s = new Date(start); const e = new Date(end);
  return Math.max(1, Math.round((e.getTime() - s.getTime()) / 86400000) + 1);
};

// Display helper for tables / payslip / exports
const formatPeriodDisplay = (m: string): string => {
  const { start, end } = parsePeriodKey(m);
  return `${format(start, "dd MMM yyyy")} → ${format(end, "dd MMM yyyy")}`;
};
```

Remove `getMonthsInRange` and the per-month iteration — bulk generation now creates ONE record per employee for the chosen range.

### 2b. State changes (~lines 210-226)

Replace month-based state with date-based:

```ts
const todayIso = format(new Date(), "yyyy-MM-dd");
const defaultPayrollForm = {
  employee_id: "",
  start_date: todayIso,
  end_date: todayIso,
  // ... rest unchanged ...
  total_days: "1", lop: "0",
  notes: "",
};
const [bulkStartDate, setBulkStartDate] = useState(todayIso);
const [bulkEndDate, setBulkEndDate] = useState(todayIso);
const [payrollStartDate, setPayrollStartDate] = useState(todayIso);
const [payrollEndDate, setPayrollEndDate] = useState(todayIso);
```

### 2c. Auto-calculate total_days (replace effect ~lines 278-288)

```ts
useEffect(() => {
  const s = selectedEmployeeIds.length === 1 ? payrollStartDate : payrollForm.start_date;
  const e = selectedEmployeeIds.length === 1 ? payrollEndDate   : payrollForm.end_date;
  if (s && e && s <= e) {
    setPayrollForm(p => ({ ...p, total_days: String(daysBetween(s, e)) }));
  }
}, [payrollStartDate, payrollEndDate, payrollForm.start_date, payrollForm.end_date, selectedEmployeeIds.length]);
```

### 2d. Update `calculatePT` (~line 103)

```ts
const calculatePT = (gross: number, periodStartIso: string): number => {
  if (gross < 25000) return 0;
  const monthNum = new Date(periodStartIso).getMonth() + 1; // 1-12
  return monthNum === 2 ? 300 : 200;
};
```

Update all call sites to pass the period start ISO instead of `"YYYY-MM"`.

### 2e. `doGeneratePayroll` (~lines 429-468)

```ts
const periodKey = buildPeriodKey(payrollStartDate, payrollEndDate);
const existingLocked = payrollRecords.find(r => r.month === periodKey && r.is_locked);
// ...
.insert({ ..., month: periodKey, ... })
```

### 2f. Bulk generation in `payrollMutation` and `bulkPayrollMutation` (~lines 484-535, 586-631)

Replace the `for (const month of months)` loop with a single iteration using `periodKey`. `total_days` and `days_worked` come from `daysBetween(start, end)`. Skip if `isMonthLocked(periodKey)`.

```ts
const periodKey = buildPeriodKey(bulkStartDate, bulkEndDate);
if (isMonthLocked(periodKey)) {
  toast({ title: "This period is already locked. Unlock it first to regenerate." });
  return 0;
}
const totalDays = daysBetween(bulkStartDate, bulkEndDate);
const records = activeEmployees.map(emp => {
  // ... pro-rate basic for non-monthly ranges? Keep current behavior — basic = emp.salary_amount.
  // total_days/days_worked = totalDays
  // pt = calculatePT(gross, bulkStartDate)
  return { ..., month: periodKey, total_days: totalDays, days_worked: totalDays, ... };
});
const { error } = await supabase.from("payroll_records").insert(records);
```

### 2g. UI: replace month inputs with date inputs (~lines 1244-1256, 1359-1371)

```tsx
<div className="grid grid-cols-2 gap-4">
  <div className="space-y-2">
    <Label>Start Date *</Label>
    <Input type="date" value={bulkStartDate} onChange={e => setBulkStartDate(e.target.value)} />
  </div>
  <div className="space-y-2">
    <Label>End Date *</Label>
    <Input type="date" value={bulkEndDate} onChange={e => setBulkEndDate(e.target.value)} />
  </div>
</div>
{bulkStartDate > bulkEndDate && (
  <p className="text-sm text-destructive font-medium">⚠️ Start date must be on or before end date.</p>
)}
<p className="text-xs text-muted-foreground">
  Total days: <strong>{daysBetween(bulkStartDate, bulkEndDate)}</strong>
</p>
```

Same swap for the `payrollStartMonth`/`payrollEndMonth` block in the Generate Payroll dialog.

### 2h. Make Total Days read-only inside detailed form (~line 1382)

```tsx
<Input type="number" value={payrollForm.total_days} disabled />
<p className="text-[10px] text-muted-foreground">Auto-calculated from date range</p>
```

### 2i. Display & export updates

- **Lock/Unlock select** (~lines 1219-1225): show `formatPeriodDisplay(m)` instead of raw `m`.
- **Payroll records table** (~lines 1569, 1607): replace `{record.month}` with `{formatPeriodDisplay(record.month)}`. Header label: "Period".
- **Mobile card** (~line 1569): same.
- **Excel exports** (~lines 1271, 711, 726, 737, 776): rename column `"Month"` → `"Period"` and use `formatPeriodDisplay(r.month)`.
- **Payslip PDF** (~lines 790, 823, 834): title and badge use `formatPeriodDisplay(record.month)`. "Pay Period" row already exists — feed the formatted period.

### 2j. Submit-button disabled checks (~line 1547, 1257)

Replace `payrollStartMonth > payrollEndMonth` with `payrollStartDate > payrollEndDate` (and same for bulk).

## 3. Backward compatibility

`parsePeriodKey` and `formatPeriodDisplay` both gracefully handle legacy `"YYYY-MM"` records, so existing payroll history continues to render correctly. No DB migration required.

## 4. Files touched

- `src/pages/Payroll.tsx` — all changes above.

No edge function, schema, or other component changes needed.

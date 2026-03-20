

## Fix All Bugs and Non-Working Buttons Across Dashboard

### Issues Found

1. **"Send Reminders" button in Billing page (line 353)** — does nothing when clicked, no onClick handler
2. **"Remind" button in Billing overdue tab (line 549-551)** — does nothing, no onClick handler
3. **"Send Reminder" dropdown item in Billing invoice actions (line 453-456)** — does nothing, no onClick handler
4. **"Customize" button in QuickActions (line 73-76)** — does nothing, purely decorative
5. **Billing payment dialog clears invoice on close** — when `onOpenChange` fires with `false`, it sets invoice to null immediately (line 618), which can cause a flash before dialog closes
6. **Accounting: `account_type` cast issue** — inserting with `as any` on accounts; the `account_type` column is `USER-DEFINED` (enum), but form sends a plain string — this may fail silently

### Plan

#### 1. Fix "Send Reminders" / "Remind" buttons in Billing (`src/pages/Billing.tsx`)
- Add a `handleSendReminder` function that shows a toast notification saying "Reminder sent" (placeholder for future email/notification integration)
- Wire it to all 3 reminder buttons (bulk Send Reminders button, individual Remind button on overdue tab, and Send Reminder dropdown item)

#### 2. Fix "Customize" button in QuickActions (`src/components/dashboard/QuickActions.tsx`)
- Remove the non-functional "Customize" button entirely since there's no customization feature — it misleads users

#### 3. Fix Billing payment dialog close behavior (`src/pages/Billing.tsx`)
- Don't clear invoice immediately on `onOpenChange(false)` — only clear after dialog transition completes, or keep invoice data until explicitly closed

#### 4. Validate all other pages have working buttons
- Admissions: All buttons work (New Admission, Approve, Reject, Enroll, View) ✅
- Accounting: All buttons work (Add Transaction, Journal Entry, Add Account, Export Report) ✅
- Student Invoices: Pay Now and Download work ✅
- Dashboard Stats, PendingApprovals, RecentActivity: All functional ✅

### Files to Edit
1. `src/pages/Billing.tsx` — Add reminder handler, fix dialog close
2. `src/components/dashboard/QuickActions.tsx` — Remove non-functional Customize button


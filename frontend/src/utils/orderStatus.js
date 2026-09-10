// Shared by OrderCard, OrderFinish and Admin's active-orders view, so the
// OPEN/CLOSE-only inline ternary that used to live duplicated in each of
// them doesn't drift as statuses are added.
const STATUS_LABELS = {
  OPEN: 'עגלה פתוחה',
  RECEIVED: 'התקבלה',
  IN_PROGRESS: 'בהכנה',
  // Split 2026-09-10 (Yaron's own correction) - these used to be one
  // combined status/label. READY = Keren finished preparing it, awaiting
  // handoff. SENT = the customer actually has it - a distinct final step,
  // not just different wording for the same thing.
  READY: 'מוכן',
  SENT: 'נשלח',
  CANCELLED: 'בוטלה',
  // Legacy - orders placed before the 3-stage flow existed still have this
  // in the DB (Status.java keeps it defined for exactly that reason).
  CLOSE: 'הושלם',
};

export const getOrderStatusLabel = (status) => STATUS_LABELS[status] || status;

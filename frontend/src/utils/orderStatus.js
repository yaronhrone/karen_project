// Shared by OrderCard, OrderFinish and Admin's active-orders view, so the
// OPEN/CLOSE-only inline ternary that used to live duplicated in each of
// them doesn't drift as statuses are added.
const STATUS_LABELS = {
  OPEN: 'עגלה פתוחה',
  RECEIVED: 'התקבלה',
  IN_PROGRESS: 'בהכנה',
  READY: 'מוכן / נשלח',
  CANCELLED: 'בוטלה',
  // Legacy - orders placed before the 3-stage flow existed still have this
  // in the DB (Status.java keeps it defined for exactly that reason).
  CLOSE: 'הושלם',
};

export const getOrderStatusLabel = (status) => STATUS_LABELS[status] || status;

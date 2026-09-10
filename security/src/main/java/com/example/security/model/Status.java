package com.example.security.model;

public enum Status {
// CLOSE stays defined (even though nothing sets it going forward) so
// OrderMapper's Status.valueOf(...) doesn't blow up reading any order row
// that already has "CLOSE" in the DB from before this 3-stage flow existed.
// READY and SENT used to be a single combined status/label ("מוכן / נשלח")
// until Yaron split them (2026-09-10): READY means Keren finished
// preparing it, SENT means the customer has actually received it - a real,
// separate final step, not just a wording difference.
OPEN, CLOSE, RECEIVED, IN_PROGRESS, READY, SENT, CANCELLED
}

package com.example.security.model;

public enum Status {
// CLOSE stays defined (even though nothing sets it going forward) so
// OrderMapper's Status.valueOf(...) doesn't blow up reading any order row
// that already has "CLOSE" in the DB from before this 3-stage flow existed.
OPEN, CLOSE, RECEIVED, IN_PROGRESS, READY, CANCELLED
}

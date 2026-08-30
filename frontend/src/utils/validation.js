// Shared validation rules used by both Register.jsx and ResetPassword.jsx -
// keep this the single source of truth so the two don't silently drift.
export const passwordRegex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;

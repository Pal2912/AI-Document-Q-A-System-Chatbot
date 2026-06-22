/**
 * FastAPI's error `detail` field is a plain string for our own
 * HTTPExceptions (e.g. "Incorrect email or password.") but an ARRAY of
 * objects for Pydantic validation errors (422s) — e.g. if a request ever
 * bypasses client-side validation. This normalizes both shapes into one
 * displayable string so a form never accidentally renders an array of
 * objects as JSX text.
 */
export function extractErrorMessage(error, fallback = "Something went wrong. Please try again.") {
  const detail = error?.response?.data?.detail;
  if (!detail) return fallback;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail.map((d) => d.msg).filter(Boolean).join(" ") || fallback;
  }
  return fallback;
}

/**
 * Dashboard API call. Mirrors backend/app/routes/dashboard_routes.py.
 */

import api from "./api";

export async function getDashboardData() {
  const res = await api.get("/api/dashboard");
  return res.data;
}

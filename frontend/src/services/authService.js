/**
 * Auth API calls. Mirrors backend/app/routes/auth_routes.py exactly.
 */

import api from "./api";

export async function signup({ fullName, email, password }) {
  const res = await api.post("/api/auth/signup", {
    full_name: fullName,
    email,
    password,
  });
  return res.data; // { access_token, token_type, user }
}

export async function login({ email, password }) {
  const res = await api.post("/api/auth/login", { email, password });
  return res.data;
}

export async function logout() {
  const res = await api.post("/api/auth/logout");
  return res.data;
}

export async function getCurrentUser() {
  const res = await api.get("/api/auth/me");
  return res.data;
}

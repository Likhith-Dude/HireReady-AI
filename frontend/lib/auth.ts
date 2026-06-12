const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface AuthUser {
  id: number;
  email: string;
  name: string;
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("hr_token");
}

export function getUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const u = localStorage.getItem("hr_user");
  return u ? JSON.parse(u) : null;
}

export function setAuth(token: string, user: AuthUser) {
  localStorage.setItem("hr_token", token);
  localStorage.setItem("hr_user", JSON.stringify(user));
}

export function clearAuth() {
  localStorage.removeItem("hr_token");
  localStorage.removeItem("hr_user");
}

export async function login(email: string, password: string) {
  const form = new URLSearchParams({ username: email, password });
  const res = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form,
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Login failed");
  }
  const data = await res.json();
  setAuth(data.access_token, data.user);
  return data;
}

export async function register(email: string, name: string, password: string) {
  const res = await fetch(`${API}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, name, password }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Registration failed");
  }
  const data = await res.json();
  setAuth(data.access_token, data.user);
  return data;
}

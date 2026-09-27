// src/api/auth.ts
// Wrapper for authentication endpoints — all requests go through Vite proxy to backend

import type { UserAccount } from '../types';

export interface LoginPayload {
  identifier: string; // email, phone or username
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  phone: string;
  password: string;
}

// Backend returns { id, name, email, phone, role } — we map `name` → `username`
interface BackendUser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
}

function toUserAccount(u: BackendUser): UserAccount {
  return {
    id: u.id,
    username: u.name,
    email: u.email,
    phone: u.phone ?? '',
  };
}

const API_BASE = '/api/auth'; // Vite dev server proxies to backend

export async function login(payload: LoginPayload): Promise<UserAccount> {
  const resp = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // send/receive HttpOnly cookie
    body: JSON.stringify({
      email: payload.identifier, // backend expects email field
      password: payload.password,
    }),
  });
  let data: any = {};
  try {
    data = await resp.json();
  } catch {
    // Non-JSON response fallback
  }
  if (!resp.ok) {
    throw new Error(data.message || `Login failed (${resp.status})`);
  }
  return toUserAccount(data.user);
}

export async function register(payload: RegisterPayload): Promise<UserAccount> {
  const resp = await fetch(`${API_BASE}/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  let data: any = {};
  try {
    data = await resp.json();
  } catch {
    // Non-JSON response fallback
  }
  if (!resp.ok) {
    throw new Error(data.message || `Registration failed (${resp.status})`);
  }
  return toUserAccount(data.user);
}

export async function logout(): Promise<void> {
  await fetch(`${API_BASE}/logout`, {
    method: 'POST',
    credentials: 'include',
  });
}

export async function fetchCurrentUser(): Promise<UserAccount | null> {
  try {
    const resp = await fetch(`${API_BASE}/me`, {
      method: 'GET',
      credentials: 'include',
    });
    if (!resp.ok) return null;
    const data = await resp.json();
    return toUserAccount(data.user);
  } catch {
    return null;
  }
}

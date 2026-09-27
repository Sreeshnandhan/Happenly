import { describe, it, expect, vi, beforeEach } from 'vitest';
import { login, register, logout, fetchCurrentUser } from '../api/auth';

// Mock global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

beforeEach(() => {
  mockFetch.mockReset();
});

// ─── register() ───────────────────────────────────────────────────────────────

describe('register()', () => {
  it('sends POST to /api/auth/signup with correct payload', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        user: { id: '1', name: 'John', email: 'john@test.com', phone: '1234567890', role: 'USER' },
      }),
    });

    const result = await register({
      name: 'John',
      email: 'john@test.com',
      phone: '1234567890',
      password: 'secret123',
    });

    // Verify fetch was called correctly
    expect(mockFetch).toHaveBeenCalledWith('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        name: 'John',
        email: 'john@test.com',
        phone: '1234567890',
        password: 'secret123',
      }),
    });

    // Verify backend `name` is mapped to frontend `username`
    expect(result).toEqual({
      id: '1',
      username: 'John',
      email: 'john@test.com',
      phone: '1234567890',
    });
  });

  it('throws with backend error message on 400', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        success: false,
        message: 'Email is already registered',
      }),
    });

    await expect(
      register({ name: 'John', email: 'john@test.com', phone: '123', password: 'pass' })
    ).rejects.toThrow('Email is already registered');
  });

  it('throws generic message when no message in response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ success: false }),
    });

    await expect(
      register({ name: 'John', email: 'john@test.com', phone: '123', password: 'pass' })
    ).rejects.toThrow('Registration failed');
  });

  it('throws on network error', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    await expect(
      register({ name: 'John', email: 'john@test.com', phone: '123', password: 'pass' })
    ).rejects.toThrow('Network error');
  });
});

// ─── login() ──────────────────────────────────────────────────────────────────

describe('login()', () => {
  it('sends POST to /api/auth/login and maps response correctly', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        user: { id: '1', name: 'Jane', email: 'jane@test.com', phone: '9876543210', role: 'USER' },
      }),
    });

    const result = await login({ identifier: 'jane@test.com', password: 'pass123' });

    expect(mockFetch).toHaveBeenCalledWith('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email: 'jane@test.com', password: 'pass123' }),
    });

    expect(result).toEqual({
      id: '1',
      username: 'Jane',
      email: 'jane@test.com',
      phone: '9876543210',
    });
  });

  it('throws on invalid credentials', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ success: false, message: 'Invalid email or password' }),
    });

    await expect(login({ identifier: 'bad@test.com', password: 'wrong' })).rejects.toThrow(
      'Invalid email or password'
    );
  });
});

// ─── logout() ─────────────────────────────────────────────────────────────────

describe('logout()', () => {
  it('sends POST to /api/auth/logout', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) });

    await logout();

    expect(mockFetch).toHaveBeenCalledWith('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
  });
});

// ─── fetchCurrentUser() ───────────────────────────────────────────────────────

describe('fetchCurrentUser()', () => {
  it('returns mapped user when authenticated', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        user: { id: '1', name: 'Alice', email: 'alice@test.com', phone: null, role: 'USER' },
      }),
    });

    const result = await fetchCurrentUser();

    expect(result).toEqual({
      id: '1',
      username: 'Alice',
      email: 'alice@test.com',
      phone: '',  // null phone maps to empty string
    });
  });

  it('returns null when not authenticated (401)', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ success: false, message: 'Not authenticated' }),
    });

    const result = await fetchCurrentUser();
    expect(result).toBeNull();
  });

  it('returns null on network error (does not throw)', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const result = await fetchCurrentUser();
    expect(result).toBeNull();
  });
});

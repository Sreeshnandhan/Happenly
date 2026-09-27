import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthModal } from '../components/auth/AuthModal';

// Mock the API module
vi.mock('../api/auth', () => ({
  login: vi.fn(),
  register: vi.fn(),
}));

import { login, register } from '../api/auth';

const mockLogin = vi.mocked(login);
const mockRegister = vi.mocked(register);

const defaultProps = {
  mode: 'register' as const,
  onToggleMode: vi.fn(),
  onClose: vi.fn(),
  onSuccess: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.useFakeTimers({ shouldAdvanceTime: true });
});

// ─── Validation Tests ─────────────────────────────────────────────────────────

describe('AuthModal — Registration Validation', () => {
  it('shows error when fields are empty', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<AuthModal {...defaultProps} />);

    await user.click(screen.getByText(/Create Account/i));

    expect(screen.getByText(/All fields are required/i)).toBeInTheDocument();
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('shows error when passwords do not match', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<AuthModal {...defaultProps} />);

    const inputs = screen.getAllByRole('textbox');
    // Username
    await user.type(inputs[0], 'TestUser');
    // Email
    await user.type(inputs[1], 'test@example.com');
    // Phone
    await user.type(inputs[2], '1234567890');
    // Password (type="password" is not a textbox role)
    const passwordInputs = document.querySelectorAll('input[type="password"]');
    await user.type(passwordInputs[0] as HTMLInputElement, 'password123');
    await user.type(passwordInputs[1] as HTMLInputElement, 'different123');

    await user.click(screen.getByText(/Create Account/i));

    expect(screen.getByText(/Passwords do not match/i)).toBeInTheDocument();
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('shows error when password is too short', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<AuthModal {...defaultProps} />);

    const inputs = screen.getAllByRole('textbox');
    await user.type(inputs[0], 'TestUser');
    await user.type(inputs[1], 'test@example.com');
    await user.type(inputs[2], '1234567890');
    const passwordInputs = document.querySelectorAll('input[type="password"]');
    await user.type(passwordInputs[0] as HTMLInputElement, '12345');
    await user.type(passwordInputs[1] as HTMLInputElement, '12345');

    await user.click(screen.getByText(/Create Account/i));

    expect(screen.getByText(/at least 6 characters/i)).toBeInTheDocument();
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('shows error for invalid email', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<AuthModal {...defaultProps} />);

    const inputs = screen.getAllByRole('textbox');
    await user.type(inputs[0], 'TestUser');
    await user.type(inputs[1], 'not-an-email');
    await user.type(inputs[2], '1234567890');
    const passwordInputs = document.querySelectorAll('input[type="password"]');
    await user.type(passwordInputs[0] as HTMLInputElement, 'password123');
    await user.type(passwordInputs[1] as HTMLInputElement, 'password123');

    await user.click(screen.getByText(/Create Account/i));

    expect(screen.getByText(/valid email/i)).toBeInTheDocument();
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('shows error for invalid phone number', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<AuthModal {...defaultProps} />);

    const inputs = screen.getAllByRole('textbox');
    await user.type(inputs[0], 'TestUser');
    await user.type(inputs[1], 'test@example.com');
    await user.type(inputs[2], '123'); // too short
    const passwordInputs = document.querySelectorAll('input[type="password"]');
    await user.type(passwordInputs[0] as HTMLInputElement, 'password123');
    await user.type(passwordInputs[1] as HTMLInputElement, 'password123');

    await user.click(screen.getByText(/Create Account/i));

    expect(screen.getByText(/valid phone/i)).toBeInTheDocument();
    expect(mockRegister).not.toHaveBeenCalled();
  });
});

// ─── Successful Registration ──────────────────────────────────────────────────

describe('AuthModal — Successful Registration', () => {
  it('calls register API and shows success message', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    mockRegister.mockResolvedValueOnce({
      id: '1',
      username: 'TestUser',
      email: 'test@example.com',
      phone: '1234567890',
    });

    render(<AuthModal {...defaultProps} />);

    const inputs = screen.getAllByRole('textbox');
    await user.type(inputs[0], 'TestUser');
    await user.type(inputs[1], 'test@example.com');
    await user.type(inputs[2], '1234567890');
    const passwordInputs = document.querySelectorAll('input[type="password"]');
    await user.type(passwordInputs[0] as HTMLInputElement, 'password123');
    await user.type(passwordInputs[1] as HTMLInputElement, 'password123');

    await user.click(screen.getByText(/Create Account/i));

    // Verify API was called with correct data
    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        name: 'TestUser',
        email: 'test@example.com',
        phone: '1234567890',
        password: 'password123',
      });
    });

    // Verify success message is shown
    expect(screen.getByText(/Account created successfully/i)).toBeInTheDocument();

    // onSuccess should NOT have been called (signup doesn't auto-login)
    expect(defaultProps.onSuccess).not.toHaveBeenCalled();
  });

  it('clears form fields after successful registration', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    mockRegister.mockResolvedValueOnce({
      id: '1',
      username: 'TestUser',
      email: 'test@example.com',
      phone: '1234567890',
    });

    render(<AuthModal {...defaultProps} />);

    const inputs = screen.getAllByRole('textbox');
    await user.type(inputs[0], 'TestUser');
    await user.type(inputs[1], 'test@example.com');
    await user.type(inputs[2], '1234567890');
    const passwordInputs = document.querySelectorAll('input[type="password"]');
    await user.type(passwordInputs[0] as HTMLInputElement, 'password123');
    await user.type(passwordInputs[1] as HTMLInputElement, 'password123');

    await user.click(screen.getByText(/Create Account/i));

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalled();
    });

    // All textbox fields should be cleared
    const updatedInputs = screen.getAllByRole('textbox');
    updatedInputs.forEach((input) => {
      expect(input).toHaveValue('');
    });
  });
});

// ─── Backend Error Handling ───────────────────────────────────────────────────

describe('AuthModal — Backend Errors', () => {
  it('shows backend error message on duplicate email', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    mockRegister.mockRejectedValueOnce(new Error('Email is already registered'));

    render(<AuthModal {...defaultProps} />);

    const inputs = screen.getAllByRole('textbox');
    await user.type(inputs[0], 'TestUser');
    await user.type(inputs[1], 'taken@example.com');
    await user.type(inputs[2], '1234567890');
    const passwordInputs = document.querySelectorAll('input[type="password"]');
    await user.type(passwordInputs[0] as HTMLInputElement, 'password123');
    await user.type(passwordInputs[1] as HTMLInputElement, 'password123');

    await user.click(screen.getByText(/Create Account/i));

    await waitFor(() => {
      expect(screen.getByText(/Email is already registered/i)).toBeInTheDocument();
    });
  });

  it('shows generic error on non-Error throw', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    mockRegister.mockRejectedValueOnce('unexpected');

    render(<AuthModal {...defaultProps} />);

    const inputs = screen.getAllByRole('textbox');
    await user.type(inputs[0], 'TestUser');
    await user.type(inputs[1], 'test@example.com');
    await user.type(inputs[2], '1234567890');
    const passwordInputs = document.querySelectorAll('input[type="password"]');
    await user.type(passwordInputs[0] as HTMLInputElement, 'password123');
    await user.type(passwordInputs[1] as HTMLInputElement, 'password123');

    await user.click(screen.getByText(/Create Account/i));

    await waitFor(() => {
      expect(screen.getByText(/Registration error/i)).toBeInTheDocument();
    });
  });
});

// ─── Login Tests ──────────────────────────────────────────────────────────────

describe('AuthModal — Login', () => {
  it('calls login API and triggers onSuccess', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const onSuccess = vi.fn();
    const loggedUser = {
      id: '1',
      username: 'Jane',
      email: 'jane@test.com',
      phone: '123',
    };
    mockLogin.mockResolvedValueOnce(loggedUser);

    render(<AuthModal {...defaultProps} mode="login" onSuccess={onSuccess} />);

    const inputs = screen.getAllByRole('textbox');
    await user.type(inputs[0], 'jane@test.com');
    const passwordInput = document.querySelector('input[type="password"]') as HTMLInputElement;
    await user.type(passwordInput, 'secret123');

    await user.click(screen.getByRole('button', { name: /Sign In/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        identifier: 'jane@test.com',
        password: 'secret123',
      });
      expect(onSuccess).toHaveBeenCalledWith(loggedUser);
    });
  });

  it('shows validation error when login fields are empty', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<AuthModal {...defaultProps} mode="login" />);

    await user.click(screen.getByRole('button', { name: /Sign In/i }));

    expect(screen.getByText(/Please fill in all fields/i)).toBeInTheDocument();
    expect(mockLogin).not.toHaveBeenCalled();
  });
});

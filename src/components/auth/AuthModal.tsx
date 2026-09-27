import { useState } from "react";
import type { UserAccount } from "../../types";
import { Field } from "../common/Field";
import { login, register } from "../../api/auth";

export function AuthModal({
  mode,
  onToggleMode,
  onClose,
  onSuccess,
}: {
  mode: "login" | "register";
  onToggleMode: () => void;
  onClose: () => void;
  onSuccess: (user: UserAccount) => void;
}) {
  const [identifier, setIdentifier] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<"USER" | "ORGANIZER">("USER");

  // Clear all fields when switching between login and signup.
  const clearForm = () => {
    setIdentifier("");
    setUsername("");
    setEmail("");
    setPhone("");
    setPassword("");
    setConfirm("");
    setError("");
    setSuccess("");
    setRole("USER");
  };

  const handleToggleMode = () => {
    clearForm();
    onToggleMode();
  };

  const handleLogin = async () => {
    setError("");
    setSuccess("");

    if (!identifier.trim() || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);

    try {
      const loggedUser = await login({
        identifier: identifier.trim(),
        password,
      });

      clearForm();
      onSuccess(loggedUser);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login error");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    setError("");
    setSuccess("");

    if (
      !username.trim() ||
      !email.trim() ||
      !phone.trim() ||
      !password ||
      !confirm
    ) {
      setError("All fields are required.");
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    // Allow +, spaces and hyphens in phone numbers.
    const digitsOnly = phone.replace(/\D/g, "");

    if (digitsOnly.length < 10 || digitsOnly.length > 15) {
      setError("Please enter a valid phone number.");
      return;
    }

    setLoading(true);

    try {
      await register({
        name: username.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
        role,
      });

      // Clear signup fields and login credentials.
      setIdentifier("");
      setUsername("");
      setEmail("");
      setPhone("");
      setPassword("");
      setConfirm("");

      setSuccess("Account created successfully! Please sign in.");

      // Switch to an empty login form after 2 seconds.
      setTimeout(() => {
        setSuccess("");
        setIdentifier("");
        setPassword("");
        onToggleMode();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration error");
    } finally {
      setLoading(false);
    }
  };
  console.log("Auth form state:", {
    mode,
    email: identifier,
    passwordLength: password.length,
  });
  return (
    <div
      style={{
        background: "white",
        borderRadius: 20,
        padding: "2rem",
        boxShadow: "0 30px 80px rgba(0,0,0,0.25)",
      }}
    >
      {/* Header */}
      <div
        style={{
          textAlign: "center",
          marginBottom: "1.5rem",
        }}
      >
        <div
          style={{
            width: 60,
            height: 60,
            background: mode === "login" ? "#EFF6FF" : "#FEF2EE",
            borderRadius: 18,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 1rem",
            fontSize: 26,
          }}
        >
          {mode === "login" ? "🔑" : "✨"}
        </div>

        <h2
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 24,
            fontWeight: 700,
            color: "#1B2B4E",
            margin: "0 0 6px",
          }}
        >
          {mode === "login" ? "Welcome Back" : "Create Your Account"}
        </h2>

        <p
          style={{
            fontSize: 14,
            color: "#6B7280",
            margin: 0,
          }}
        >
          {mode === "login"
            ? "Sign in to book events and access your tickets"
            : "Join thousands of event-goers across Bengaluru"}
        </p>
      </div>

      {/* Form */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.875rem",
        }}
      >
        {mode === "login" ? (
          <>
            <Field
              label="Email"
              type="email"
              placeholder="Enter your email"
              value={identifier}
              onChange={setIdentifier}
              autoComplete="off"
            />

            <Field
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={setPassword}
              autoComplete="off"
            />
          </>
        ) : (
          <>
            <div>
              <p
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#1B2B4E",
                  marginBottom: 10,
                }}
              >
                I'm joining as
              </p>

              <div style={{ display: "flex", gap: 12 }}>
                {(
                  [
                    {
                      value: "USER",
                      title: "Event Lover",
                      description: "Discover and book events",
                      icon: "🎟️",
                    },
                    {
                      value: "ORGANIZER",
                      title: "Organizer",
                      description: "Host and manage events",
                      icon: "🎤",
                    },
                  ] as const
                ).map((option) => (
                  <label
                    key={option.value}
                    style={{
                      flex: 1,
                      minWidth: 0,
                      padding: 12,
                      borderRadius: 12,
                      border:
                        role === option.value
                          ? "2px solid #C84B31"
                          : "1px solid #E5E7EB",
                      background: role === option.value ? "#FEF2EE" : "#FFFFFF",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      gap: 5,
                    }}
                  >
                    <input
                      type="radio"
                      name="accountRole"
                      value={option.value}
                      checked={role === option.value}
                      onChange={() => setRole(option.value)}
                      style={{ accentColor: "#C84B31" }}
                    />

                    <span style={{ fontSize: 23 }}>{option.icon}</span>

                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: "#1B2B4E",
                      }}
                    >
                      {option.title}
                    </span>

                    <span style={{ fontSize: 12, color: "#6B7280" }}>
                      {option.description}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <Field
              label="Username"
              placeholder="Choose a username"
              value={username}
              onChange={setUsername}
            />

            <Field
              label="Email Address"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={setEmail}
            />

            <Field
              label="Phone Number"
              type="tel"
              placeholder="+91 98765 43210"
              value={phone}
              onChange={setPhone}
            />

            <Field
              label="Password"
              type="password"
              placeholder="Minimum 6 characters"
              value={password}
              onChange={setPassword}
            />

            <Field
              label="Confirm Password"
              type="password"
              placeholder="Re-enter your password"
              value={confirm}
              onChange={setConfirm}
            />
          </>
        )}

        {/* Error message */}
        {error && (
          <div
            style={{
              background: "#FEF2F2",
              border: "1px solid #FECACA",
              borderRadius: 10,
              padding: "10px 14px",
              fontSize: 13,
              color: "#DC2626",
            }}
          >
            ⚠️ {error}
          </div>
        )}

        {/* Success message */}
        {success && (
          <div
            style={{
              background: "#F0FDF4",
              border: "1px solid #BBF7D0",
              borderRadius: 10,
              padding: "10px 14px",
              fontSize: 13,
              color: "#16A34A",
              textAlign: "center",
              fontWeight: 500,
            }}
          >
            ✅ {success}
          </div>
        )}

        {/* Submit button */}
        <button
          onClick={mode === "login" ? handleLogin : handleRegister}
          disabled={loading || Boolean(success)}
          style={{
            background: loading
              ? "#9CA3AF"
              : "linear-gradient(135deg, #C84B31 0%, #E05B3A 100%)",
            color: "white",
            border: "none",
            borderRadius: 12,
            padding: "14px",
            fontSize: 15,
            fontWeight: 700,
            cursor: loading || success ? "default" : "pointer",
            fontFamily: "inherit",
            transition: "opacity 0.2s",
            marginTop: 4,
            letterSpacing: "0.3px",
          }}
        >
          {loading
            ? "⏳ Please wait…"
            : mode === "login"
              ? "🚀 Sign In"
              : role === "ORGANIZER"
                ? "🎤 Create Organizer Account"
                : "🎉 Create Account & Book"}
        </button>

        {/* Switch between login and signup */}
        <div
          style={{
            textAlign: "center",
            fontSize: 14,
            color: "#6B7280",
          }}
        >
          {mode === "login"
            ? "Don't have an account? "
            : "Already have an account? "}

          <button
            onClick={handleToggleMode}
            disabled={loading}
            style={{
              color: "#C84B31",
              fontWeight: 700,
              background: "none",
              border: "none",
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: 14,
            }}
          >
            {mode === "login" ? "Sign up free" : "Sign in"}
          </button>
        </div>

        {/* Close modal */}
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            color: "#9CA3AF",
            fontSize: 13,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

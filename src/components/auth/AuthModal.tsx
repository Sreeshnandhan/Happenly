import { useState } from "react";
import { UserAccount } from "../../types";
import { Field } from "../common/Field";

export function AuthModal({
  mode,
  onToggleMode,
  onClose,
  onSuccess,
  users,
  onRegister,
}: {
  mode: "login" | "register";
  onToggleMode: () => void;
  onClose: () => void;
  onSuccess: (user: UserAccount) => void;
  users: Map<string, UserAccount>;
  onRegister: (user: UserAccount) => void;
}) {
  const [identifier, setIdentifier] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setError("");
    if (!identifier || !password) {
      setError("Please fill in all fields.");
      return;
    }
    const user = [...users.values()].find(
      (u) =>
        (u.email === identifier ||
          u.phone === identifier ||
          u.username === identifier) &&
        u.password === password,
    );
    if (!user) {
      setError(
        "Invalid credentials. Check your username / email / phone and password.",
      );
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onSuccess(user);
    }, 700);
  };

  const handleRegister = () => {
    setError("");
    if (!username || !email || !phone || !password || !confirm) {
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
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!/^\+?[\d\s\-]{10,}$/.test(phone)) {
      setError("Please enter a valid phone number.");
      return;
    }
    const exists = [...users.values()].find(
      (u) => u.email === email || u.phone === phone,
    );
    if (exists) {
      setError("An account with this email or phone number already exists.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const newUser: UserAccount = {
        id: `user-${Date.now()}`,
        username,
        email,
        phone,
        password,
      };
      onRegister(newUser);
      setLoading(false);
      onSuccess(newUser);
    }, 900);
  };

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
      <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
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
        <p style={{ fontSize: 14, color: "#6B7280", margin: 0 }}>
          {mode === "login"
            ? "Sign in to book events and access your tickets"
            : "Join thousands of event-goers across Bengaluru"}
        </p>
      </div>

      <div
        style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}
      >
        {mode === "login" ? (
          <>
            <Field
              label="Username / Email / Phone"
              placeholder="Enter your username, email, or phone"
              value={identifier}
              onChange={setIdentifier}
            />
            <Field
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={setPassword}
            />
          </>
        ) : (
          <>
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

        <button
          onClick={mode === "login" ? handleLogin : handleRegister}
          disabled={loading}
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
            cursor: loading ? "default" : "pointer",
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
              : "🎉 Create Account & Book"}
        </button>

        <div style={{ textAlign: "center", fontSize: 14, color: "#6B7280" }}>
          {mode === "login"
            ? "Don't have an account? "
            : "Already have an account? "}
          <button
            onClick={onToggleMode}
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

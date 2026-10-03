import { useState } from "react";
import { forgotPassword, resetPassword } from "../../api/auth";
import { Field } from "../common/Field";

export function PasswordRecovery({
  token,
  initialEmail = "",
  onBack,
}: {
  token?: string;
  initialEmail?: string;
  onBack: () => void;
}) {
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [requestNewLink, setRequestNewLink] = useState(false);
  const resetting = token !== undefined && !requestNewLink;
  const invalidLink = resetting && !/^[a-f0-9]{64}$/.test(token ?? "");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    setError("");
    setMessage("");
    if (resetting) {
      if (
        password.length < 8 ||
        new TextEncoder().encode(password).length > 72
      ) {
        setError(
          "Use at least 8 characters and no more than 72 bytes for your password.",
        );
        return;
      }
      if (password !== confirm) {
        setError("Passwords do not match.");
        return;
      }
    } else if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    try {
      setMessage(
        resetting
          ? await resetPassword(token!, password)
          : await forgotPassword(email.trim()),
      );
      setPassword("");
      setConfirm("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to complete your request. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section
      className="auth-card"
      style={{
        background: "white",
        borderRadius: 20,
        boxShadow: "0 30px 80px rgba(0,0,0,0.15)",
        width: "100%",
        maxWidth: 440,
        boxSizing: "border-box",
      }}
    >
      <h2
        style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 26,
          color: "#1B2B4E",
          marginTop: 0,
        }}
      >
        {resetting ? "Choose a new password" : "Forgot your password?"}
      </h2>
      <p style={{ color: "#6B7280", fontSize: 14 }}>
        {resetting
          ? "Enter and confirm your new password below."
          : "Enter your registered email and we’ll send you a reset link valid for 15 minutes."}
      </p>
      {invalidLink ? (
        <p role="alert">
          This reset link is invalid. Please request a new one.
        </p>
      ) : (
        <form onSubmit={submit} noValidate style={{ display: "grid", gap: 16 }}>
          {!message && (
            <>
              {resetting ? (
                <>
                  <Field
                    label="New password"
                    type="password"
                    placeholder="At least 8 characters"
                    value={password}
                    onChange={setPassword}
                    autoComplete="new-password"
                  />
                  <Field
                    label="Confirm new password"
                    type="password"
                    placeholder="Re-enter your new password"
                    value={confirm}
                    onChange={setConfirm}
                    autoComplete="new-password"
                  />
                </>
              ) : (
                <Field
                  label="Email address"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={setEmail}
                  autoComplete="email"
                />
              )}
              <button
                type="submit"
                disabled={loading}
                style={{
                  border: 0,
                  borderRadius: 12,
                  padding: 14,
                  background: "#C84B31",
                  color: "white",
                  fontWeight: 700,
                  cursor: loading ? "wait" : "pointer",
                  opacity: loading ? 0.65 : 1,
                }}
              >
                {loading
                  ? "Please wait…"
                  : resetting
                    ? "Update password"
                    : "Send reset link"}
              </button>
            </>
          )}
          {error && (
            <p role="alert" style={{ color: "#B91C1C", margin: 0 }}>
              {error}
            </p>
          )}
          {message && (
            <p role="status" style={{ color: "#166534", margin: 0 }}>
              {message}
            </p>
          )}
        </form>
      )}
      {resetting && !message && (
        <button
          type="button"
          disabled={loading}
          onClick={() => {
            setRequestNewLink(true);
            setError("");
            setPassword("");
            setConfirm("");
          }}
          style={{
            display: "block",
            marginTop: 18,
            color: "#C84B31",
            border: 0,
            background: "none",
            cursor: "pointer",
          }}
        >
          Request a new link
        </button>
      )}
      <button
        type="button"
        disabled={loading}
        onClick={onBack}
        style={{
          display: "block",
          marginTop: 18,
          color: "#1B2B4E",
          border: 0,
          background: "none",
          cursor: "pointer",
        }}
      >
        Back to sign in
      </button>
    </section>
  );
}

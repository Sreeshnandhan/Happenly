import { useEffect, useId, useState } from "react";

export function Field({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  autoComplete = "off",
}: {
  label: string;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
}) {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const id = useId();
  const isPassword = type === "password";
  useEffect(() => {
    if (!value || type !== "password") setShowPassword(false);
  }, [value, type]);

  return (
    <div>
      <label
        htmlFor={id}
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: "#374151",
          marginBottom: 6,
          display: "block",
        }}
      >
        {label}
      </label>

      <div style={{ position: "relative" }}>
        <input
          id={id}
          type={isPassword && showPassword ? "text" : type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          autoComplete={autoComplete}
          style={{
            width: "100%",
            padding: "12px 14px",
            paddingRight: isPassword ? 52 : 14,
            borderRadius: 10,
            border: `1.5px solid ${focused ? "#C84B31" : "#E5E7EB"}`,
            fontSize: 15,
            outline: "none",
            fontFamily: "inherit",
            background: "#FAFAFA",
            boxSizing: "border-box",
            transition: "border-color 0.2s",
            color: "#1B2B4E",
          }}
        />
        {isPassword && (
          <button
            type="button"
            aria-label={`${
              showPassword ? "Hide" : "Show"
            } ${label.toLowerCase()}`}
            aria-pressed={showPassword}
            aria-controls={id}
            onClick={() => setShowPassword((visible) => !visible)}
            style={{
              position: "absolute",
              right: 4,
              top: "50%",
              transform: "translateY(-50%)",
              width: 44,
              height: 44,
              display: "grid",
              placeItems: "center",
              border: "none",
              borderRadius: 8,
              background: "transparent",
              color: "#6B7280",
              cursor: "pointer",
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
              <circle cx="12" cy="12" r="3" />
              {showPassword && <path d="m3 3 18 18" />}
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

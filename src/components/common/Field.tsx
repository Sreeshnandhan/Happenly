import { useState } from "react";

export function Field({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
}: {
  label: string;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label
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
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: "100%",
          padding: "12px 14px",
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
    </div>
  );
}

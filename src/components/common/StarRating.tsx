import { useState } from "react";

export function StarRating({
  value,
  onChange,
  readonly = false,
}: {
  value: number;
  onChange?: (v: number) => void;
  readonly?: boolean;
}) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => !readonly && onChange?.(star)}
          onMouseEnter={() => !readonly && setHover(star)}
          onMouseLeave={() => !readonly && setHover(0)}
          style={{
            background: "none",
            border: "none",
            cursor: readonly ? "default" : "pointer",
            fontSize: readonly ? 16 : 22,
            padding: 0,
            color: (hover || value) >= star ? "#F5A623" : "#D1D5DB",
            transition: "color 0.15s",
            lineHeight: 1,
          }}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export function SeatsBar({
  seats,
  booked,
  color,
}: {
  seats: number;
  booked: number;
  color: string;
}) {
  const pct = Math.round((booked / seats) * 100);
  const remaining = seats - booked;
  return (
    <div>
      <div
        style={{
          height: 6,
          background: "#E5E7EB",
          borderRadius: 99,
          overflow: "hidden",
          marginBottom: 4,
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            background: pct >= 90 ? "#EF4444" : pct >= 70 ? "#F59E0B" : color,
            borderRadius: 99,
            transition: "width 0.4s",
          }}
        />
      </div>
      <div
        style={{
          fontSize: 12,
          color: pct >= 90 ? "#EF4444" : "#6B7280",
          fontWeight: pct >= 90 ? 600 : 400,
        }}
      >
        {remaining === 0
          ? "🚫 Sold Out"
          : `${remaining} seat${remaining === 1 ? "" : "s"} left of ${seats}`}
      </div>
    </div>
  );
}

import { useState, useEffect, useCallback } from "react";
import type { EventData, TicketTier } from "../../types";

// ─── Constants ────────────────────────────────────────────────────────────────
const HOLD_SECONDS = 600; // 10 minutes seat hold

// ─── Seat Status Types ────────────────────────────────────────────────────────
type SeatStatus = "available" | "booked" | "held" | "selected";

interface Seat {
  id: string;
  row: string;
  number: number;
  status: SeatStatus;
}

// ─── Countdown Timer ──────────────────────────────────────────────────────────
function CountdownTimer({
  seconds,
  onExpire,
}: {
  seconds: number;
  onExpire: () => void;
}) {
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    if (remaining <= 0) {
      onExpire();
      return;
    }
    const t = setInterval(() => setRemaining((r) => r - 1), 1000);
    return () => clearInterval(t);
  }, [remaining, onExpire]);

  const m = Math.floor(remaining / 60);
  const s = remaining % 60;
  const urgent = remaining < 120;

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        background: urgent ? "#FEF2F2" : "#FFFBEB",
        border: `1px solid ${urgent ? "#FECACA" : "#FDE68A"}`,
        borderRadius: 8,
        padding: "6px 14px",
        fontSize: 13,
        fontWeight: 700,
        color: urgent ? "#DC2626" : "#D97706",
      }}
    >
      ⏱ Seats held for {m}:{String(s).padStart(2, "0")}
    </div>
  );
}

// ─── Legend Item ──────────────────────────────────────────────────────────────
function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div
        style={{
          width: 14,
          height: 14,
          borderRadius: 3,
          background: color,
          flexShrink: 0,
        }}
      />
      <span style={{ fontSize: 11, color: "#6B7280", fontWeight: 500 }}>
        {label}
      </span>
    </div>
  );
}

// ─── Seat Icon ────────────────────────────────────────────────────────────────
function SeatIcon({
  seat,
  onClick,
}: {
  seat: Seat;
  onClick: (id: string) => void;
}) {
  const isClickable = seat.status === "available" || seat.status === "selected";

  const colors: Record<
    SeatStatus,
    { bg: string; border: string; text: string }
  > = {
    available: { bg: "#DCFCE7", border: "#16A34A", text: "#15803D" },
    booked: { bg: "#FEE2E2", border: "#DC2626", text: "#B91C1C" },
    held: { bg: "#FEF9C3", border: "#CA8A04", text: "#A16207" },
    selected: { bg: "#DBEAFE", border: "#2563EB", text: "#1D4ED8" },
  };

  const c = colors[seat.status];

  return (
    <button
      onClick={() => isClickable && onClick(seat.id)}
      title={`${seat.row}${seat.number} — ${seat.status}`}
      style={{
        width: 32,
        height: 28,
        background: c.bg,
        border: `1.5px solid ${c.border}`,
        borderRadius: "5px 5px 3px 3px",
        cursor: isClickable ? "pointer" : "not-allowed",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 9,
        fontWeight: 700,
        color: c.text,
        transition: "all 0.15s ease",
        position: "relative",
        transform: seat.status === "selected" ? "scale(1.1)" : "scale(1)",
        boxShadow:
          seat.status === "selected" ? "0 2px 8px rgba(37,99,235,0.4)" : "none",
      }}
    >
      {/* Seat back (top bar) */}
      <div
        style={{
          position: "absolute",
          top: -4,
          left: 2,
          right: 2,
          height: 5,
          background: c.border,
          borderRadius: "3px 3px 0 0",
          opacity: 0.7,
        }}
      />
      <span style={{ marginTop: 2 }}>
        {seat.row}
        {seat.number}
      </span>
    </button>
  );
}

// ─── Build Seat Grid from Tier Data ──────────────────────────────────────────
function buildSeats(tier: TicketTier): Seat[] {
  const rows = ["A", "B", "C", "D", "E", "F", "G", "H"];
  const seatsPerRow = 10;
  const total = tier.totalSeats;

  const seats: Seat[] = [];

  for (let i = 0; i < total; i++) {
    const rowIdx = Math.floor(i / seatsPerRow);
    const seatNum = (i % seatsPerRow) + 1;
    const row = rows[rowIdx] ?? rows[rows.length - 1];
    const seatId = `${row}${seatNum}`;

    let status: SeatStatus = "available";
    if (tier.bookedSeatList?.some((s) => s.id === seatId)) {
      status = "booked";
    } else if (tier.heldSeatList?.some((s) => s.id === seatId)) {
      status = "held";
    }

    seats.push({
      id: seatId,
      row,
      number: seatNum,
      status,
    });
  }

  return seats;
}

// ─── Main TicketSeatModal ─────────────────────────────────────────────────────
export function TicketSeatModal({
  event,
  tier,
  onClose,
  onProceed,
}: {
  event: EventData;
  tier: TicketTier;
  onClose: () => void;
  onProceed: (selectedSeats: string[]) => void;
}) {
  const [seats, setSeats] = useState<Seat[]>(() => buildSeats(tier));
  const [holdStarted, setHoldStarted] = useState(false);
  const [holdExpired, setHoldExpired] = useState(false);

  const selectedSeats = seats.filter((s) => s.status === "selected");
  const availableSeats = seats.filter((s) => s.status === "available");
  const totalAvailable = availableSeats.length + selectedSeats.length;

  const handleSeatClick = useCallback(
    (seatId: string) => {
      setSeats((prev) =>
        prev.map((s) => {
          if (s.id !== seatId) return s;
          if (s.status === "selected") return { ...s, status: "available" };
          if (s.status === "available") return { ...s, status: "selected" };
          return s;
        }),
      );
      if (!holdStarted) setHoldStarted(true);
    },
    [holdStarted],
  );

  const handleExpire = useCallback(() => {
    setHoldExpired(true);
    setSeats((prev) =>
      prev.map((s) =>
        s.status === "selected" ? { ...s, status: "available" } : s,
      ),
    );
  }, []);

  // Group seats by row for display
  const seatsByRow = seats.reduce<Record<string, Seat[]>>((acc, seat) => {
    if (!acc[seat.row]) acc[seat.row] = [];
    acc[seat.row].push(seat);
    return acc;
  }, {});

  const rows = Object.keys(seatsByRow).sort();

  if (holdExpired) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 1100,
          background: "rgba(0,0,0,0.65)",
          backdropFilter: "blur(6px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1rem",
        }}
      >
        <div
          style={{
            background: "white",
            borderRadius: 20,
            padding: "2.5rem 2rem",
            maxWidth: 360,
            width: "100%",
            textAlign: "center",
            boxShadow: "0 30px 80px rgba(0,0,0,0.3)",
          }}
        >
          <div style={{ fontSize: 52, marginBottom: 14 }}>⏰</div>
          <div
            style={{
              fontFamily: "'Playfair Display', serif",
              fontWeight: 800,
              fontSize: 20,
              color: "#1B2B4E",
              marginBottom: 10,
            }}
          >
            Hold Expired
          </div>
          <p
            style={{
              color: "#6B7280",
              fontSize: 14,
              marginBottom: 24,
              lineHeight: 1.6,
            }}
          >
            Your reserved seats have been released back to the pool. You can
            select again.
          </p>
          <button
            onClick={onClose}
            style={{
              background: "#1B2B4E",
              color: "white",
              border: "none",
              borderRadius: 12,
              padding: "12px 32px",
              fontWeight: 700,
              cursor: "pointer",
              fontSize: 14,
            }}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1100,
        background: "rgba(0,0,0,0.65)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: 22,
          width: "100%",
          maxWidth: 560,
          maxHeight: "92vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 40px 100px rgba(0,0,0,0.35)",
        }}
      >
        {/* ── Header ── */}
        <div
          style={{
            background: "linear-gradient(135deg, #1B2B4E 0%, #2D4080 100%)",
            padding: "1.25rem 1.5rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexShrink: 0,
          }}
        >
          <div>
            <div
              style={{
                color: "rgba(255,255,255,0.6)",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "1px",
                textTransform: "uppercase",
                marginBottom: 4,
              }}
            >
              🎟 Select Your Seats
            </div>
            <div
              style={{
                color: "white",
                fontFamily: "'Playfair Display', serif",
                fontSize: 17,
                fontWeight: 700,
                lineHeight: 1.3,
              }}
            >
              {event.title}
            </div>
            <div
              style={{
                color: "rgba(255,255,255,0.65)",
                fontSize: 12,
                marginTop: 3,
              }}
            >
              {tier.name} — ₹{tier.price} per seat
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.15)",
              border: "none",
              borderRadius: "50%",
              width: 34,
              height: 34,
              cursor: "pointer",
              color: "white",
              fontSize: 18,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            ×
          </button>
        </div>

        {/* ── Scrollable Body ── */}
        <div style={{ overflowY: "auto", flex: 1, padding: "1.25rem 1.5rem" }}>
          {/* Hold Timer */}
          {holdStarted && (
            <div style={{ textAlign: "center", marginBottom: "1rem" }}>
              <CountdownTimer seconds={HOLD_SECONDS} onExpire={handleExpire} />
            </div>
          )}

          {/* Availability Summary */}
          <div
            style={{
              display: "flex",
              gap: 10,
              marginBottom: "1rem",
              flexWrap: "wrap",
            }}
          >
            {[
              {
                label: "Total Seats",
                value: tier.totalSeats,
                bg: "#F9F7F3",
                color: "#1B2B4E",
              },
              {
                label: "Booked",
                value: tier.bookedSeatList?.length || tier.bookedSeats,
                bg: "#FEE2E2",
                color: "#DC2626",
              },
              {
                label: "In Carts",
                value: tier.heldSeatList?.length || tier.heldSeats,
                bg: "#FEF9C3",
                color: "#CA8A04",
              },
              {
                label: "Available",
                value: totalAvailable,
                bg: "#DCFCE7",
                color: "#16A34A",
              },
            ].map(({ label, value, bg, color }) => (
              <div
                key={label}
                style={{
                  background: bg,
                  borderRadius: 10,
                  padding: "8px 14px",
                  flex: "1 1 auto",
                  textAlign: "center",
                  minWidth: 80,
                }}
              >
                <div style={{ fontSize: 16, fontWeight: 800, color }}>
                  {value}
                </div>
                <div
                  style={{
                    fontSize: 10,
                    color: "#9CA3AF",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    marginTop: 2,
                  }}
                >
                  {label}
                </div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div
            style={{
              display: "flex",
              gap: 14,
              flexWrap: "wrap",
              marginBottom: "1rem",
              paddingBottom: "0.875rem",
              borderBottom: "1px solid #F3F4F6",
            }}
          >
            <LegendItem color="#DCFCE7" label="Available" />
            <LegendItem color="#DBEAFE" label="Selected" />
            <LegendItem color="#FEE2E2" label="Booked" />
            <LegendItem color="#FEF9C3" label="In Cart" />
          </div>

          {/* ── Screen/Stage Indicator ── */}
          <div
            style={{
              textAlign: "center",
              marginBottom: "1.25rem",
            }}
          >
            <div
              style={{
                display: "inline-block",
                background: "linear-gradient(90deg, #1B2B4E, #334155)",
                color: "white",
                borderRadius: "0 0 12px 12px",
                padding: "6px 48px",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "2px",
                textTransform: "uppercase",
                boxShadow: "0 4px 16px rgba(27,43,78,0.25)",
              }}
            >
              🎭 STAGE / SCREEN
            </div>
          </div>

          {/* ── Seat Grid ── */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
              alignItems: "center",
            }}
          >
            {rows.map((row) => (
              <div
                key={row}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  width: "100%",
                  justifyContent: "center",
                }}
              >
                {/* Row Label */}
                <div
                  style={{
                    width: 22,
                    textAlign: "center",
                    fontSize: 11,
                    fontWeight: 800,
                    color: "#9CA3AF",
                    flexShrink: 0,
                  }}
                >
                  {row}
                </div>

                {/* Seats in this row */}
                <div
                  style={{
                    display: "flex",
                    gap: 4,
                    flexWrap: "wrap",
                    justifyContent: "center",
                  }}
                >
                  {seatsByRow[row].map((seat, idx) => (
                    <div key={seat.id}>
                      {/* Aisle gap after seat 5 */}
                      {idx === 5 && (
                        <div
                          style={{
                            display: "inline-block",
                            width: 12,
                          }}
                        />
                      )}
                      <SeatIcon seat={seat} onClick={handleSeatClick} />
                    </div>
                  ))}
                </div>

                {/* Row Label (right side) */}
                <div
                  style={{
                    width: 22,
                    textAlign: "center",
                    fontSize: 11,
                    fontWeight: 800,
                    color: "#9CA3AF",
                    flexShrink: 0,
                  }}
                >
                  {row}
                </div>
              </div>
            ))}
          </div>

          {/* ── Selected Seats Summary ── */}
          {selectedSeats.length > 0 && (
            <div
              style={{
                marginTop: "1.25rem",
                padding: "1rem 1.25rem",
                background: "#EFF6FF",
                borderRadius: 14,
                border: "1px solid #BFDBFE",
              }}
            >
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 13,
                  color: "#1D4ED8",
                  marginBottom: 8,
                }}
              >
                🪑 Selected Seats ({selectedSeats.length})
              </div>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 6,
                  marginBottom: 10,
                }}
              >
                {selectedSeats.map((s) => (
                  <span
                    key={s.id}
                    style={{
                      background: "#DBEAFE",
                      color: "#1D4ED8",
                      borderRadius: 6,
                      padding: "3px 10px",
                      fontSize: 12,
                      fontWeight: 700,
                      border: "1px solid #93C5FD",
                    }}
                  >
                    {s.row}
                    {s.number}
                  </span>
                ))}
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 13,
                  color: "#6B7280",
                  borderTop: "1px dashed #BFDBFE",
                  paddingTop: 8,
                }}
              >
                <span>
                  {selectedSeats.length} × ₹{tier.price}
                </span>
                <span
                  style={{
                    fontWeight: 800,
                    fontSize: 15,
                    color: "#1B2B4E",
                  }}
                >
                  ₹{selectedSeats.length * tier.price}
                </span>
              </div>
            </div>
          )}

          {/* ── No Seats Info ── */}
          {totalAvailable === 0 && (
            <div
              style={{
                textAlign: "center",
                padding: "1.5rem",
                color: "#DC2626",
                fontWeight: 700,
                fontSize: 14,
              }}
            >
              🔴 This tier is sold out
            </div>
          )}
        </div>

        {/* ── Footer CTA ── */}
        <div
          style={{
            padding: "1rem 1.5rem",
            borderTop: "1px solid #E5E7EB",
            background: "#FAFAFA",
            flexShrink: 0,
          }}
        >
          {selectedSeats.length === 0 ? (
            <p
              style={{
                textAlign: "center",
                fontSize: 13,
                color: "#9CA3AF",
                margin: 0,
                padding: "6px 0",
              }}
            >
              Tap on a 🟢 seat to select it
            </p>
          ) : (
            <button
              onClick={() => onProceed(selectedSeats.map(s => s.id))}
              style={{
                width: "100%",
                background: "linear-gradient(135deg, #1B2B4E 0%, #2D4080 100%)",
                color: "white",
                border: "none",
                borderRadius: 14,
                padding: "14px",
                fontWeight: 800,
                fontSize: 15,
                cursor: "pointer",
                boxShadow: "0 8px 24px rgba(27,43,78,0.3)",
                transition: "transform 0.15s, box-shadow 0.15s",
                letterSpacing: "0.3px",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform =
                  "translateY(-1px)";
                (e.currentTarget as HTMLButtonElement).style.boxShadow =
                  "0 12px 28px rgba(27,43,78,0.4)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform =
                  "translateY(0)";
                (e.currentTarget as HTMLButtonElement).style.boxShadow =
                  "0 8px 24px rgba(27,43,78,0.3)";
              }}
            >
              Proceed to Payment ({selectedSeats.length} seat
              {selectedSeats.length > 1 ? "s" : ""}) — ₹
              {selectedSeats.length * tier.price + 9 * selectedSeats.length}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

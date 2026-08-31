import { useState, useEffect, useCallback } from "react";
import type { EventData, TicketTier } from "../../types";

const HOLD_SECONDS = 600;

function CountdownTimer({
  seconds,
  onExpire,
}: {
  seconds: number;
  onExpire: () => void;
}) {
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    if (remaining <= 0) { onExpire(); return; }
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
      ⏱ Hold expires in {m}:{String(s).padStart(2, "0")}
    </div>
  );
}

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
  const bookedCount = tier.bookedSeatList?.length ?? tier.bookedSeats;
  const heldCount = tier.heldSeatList?.length ?? tier.heldSeats;
  const available = tier.totalSeats - (bookedCount + heldCount);

  const [qty, setQty] = useState(1);
  const [holdStarted, setHoldStarted] = useState(false);
  const [holdExpired, setHoldExpired] = useState(false);

  const handleExpire = useCallback(() => setHoldExpired(true), []);

  const isSoldOut = available <= 0;
  const maxQty = Math.min(available, 5);

  const fillPct = Math.round((bookedCount / tier.totalSeats) * 100);

  // Generate simple seat IDs for the quantity chosen (auto-assign)
  const generateSeatIds = (count: number): string[] => {
    const rows = ["A", "B", "C", "D", "E", "F", "G", "H"];
    const seatsPerRow = 10;
    const taken = new Set([
      ...(tier.bookedSeatList || []).map((s) => s.id),
      ...(tier.heldSeatList || []).map((s) => s.id),
    ]);

    const assigned: string[] = [];
    outer: for (let i = 0; i < tier.totalSeats; i++) {
      const row = rows[Math.floor(i / seatsPerRow)] || "A";
      const num = (i % seatsPerRow) + 1;
      const id = `${row}${num}`;
      if (!taken.has(id)) {
        assigned.push(id);
        if (assigned.length === count) break outer;
      }
    }
    return assigned;
  };

  const handleProceed = () => {
    const seats = generateSeatIds(qty);
    onProceed(seats);
  };

  if (holdExpired) {
    return (
      <div
        style={{
          position: "fixed", inset: 0, zIndex: 1100,
          background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem",
        }}
      >
        <div
          style={{
            background: "white", borderRadius: 20, padding: "2.5rem 2rem",
            maxWidth: 360, width: "100%", textAlign: "center",
            boxShadow: "0 30px 80px rgba(0,0,0,0.3)",
          }}
        >
          <div style={{ fontSize: 52, marginBottom: 14 }}>⏰</div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 800, fontSize: 20, color: "#1B2B4E", marginBottom: 10 }}>
            Hold Expired
          </div>
          <p style={{ color: "#6B7280", fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
            Your reservation window has closed. Please try again.
          </p>
          <button
            onClick={onClose}
            style={{ background: "#1B2B4E", color: "white", border: "none", borderRadius: 12, padding: "12px 32px", fontWeight: 700, cursor: "pointer", fontSize: 14 }}
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
        position: "fixed", inset: 0, zIndex: 1100,
        background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem",
      }}
    >
      <div
        style={{
          background: "white", borderRadius: 22, width: "100%", maxWidth: 480,
          maxHeight: "92vh", overflow: "hidden", display: "flex", flexDirection: "column",
          boxShadow: "0 40px 100px rgba(0,0,0,0.35)",
        }}
      >
        {/* Header */}
        <div
          style={{
            background: "linear-gradient(135deg, #1B2B4E 0%, #2D4080 100%)",
            padding: "1.25rem 1.5rem",
            display: "flex", justifyContent: "space-between", alignItems: "flex-start",
            flexShrink: 0,
          }}
        >
          <div>
            <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 11, fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", marginBottom: 4 }}>
              🎟 Book Tickets
            </div>
            <div style={{ color: "white", fontFamily: "'Playfair Display', serif", fontSize: 17, fontWeight: 700, lineHeight: 1.3 }}>
              {event.title}
            </div>
            <div style={{ color: "rgba(255,255,255,0.65)", fontSize: 12, marginTop: 3 }}>
              {tier.name} — ₹{tier.price} per ticket
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "50%",
              width: 34, height: 34, cursor: "pointer", color: "white", fontSize: 18,
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div style={{ overflowY: "auto", flex: 1, padding: "1.5rem" }}>

          {/* Hold Timer — shows once user interacts */}
          {holdStarted && (
            <div style={{ textAlign: "center", marginBottom: "1.25rem" }}>
              <CountdownTimer seconds={HOLD_SECONDS} onExpire={handleExpire} />
            </div>
          )}

          {/* Availability Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: "1.5rem" }}>
            {[
              { label: "Total Seats", value: tier.totalSeats, bg: "#F9F7F3", color: "#1B2B4E" },
              { label: "Booked", value: bookedCount, bg: "#FEE2E2", color: "#DC2626" },
              { label: "Available", value: available, bg: "#DCFCE7", color: "#16A34A" },
            ].map(({ label, value, bg, color }) => (
              <div key={label} style={{ background: bg, borderRadius: 12, padding: "12px 8px", textAlign: "center" }}>
                <div style={{ fontSize: 20, fontWeight: 900, color }}>{value}</div>
                <div style={{ fontSize: 10, color: "#9CA3AF", fontWeight: 700, textTransform: "uppercase", marginTop: 3 }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Availability Fill Bar */}
          <div style={{ marginBottom: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontWeight: 700, color: fillPct > 75 ? "#EF4444" : "#6B7280", marginBottom: 6 }}>
              <span>{fillPct > 75 ? "🔥 Filling Fast!" : "🟢 Seats Available"}</span>
              <span>{bookedCount} / {tier.totalSeats} booked</span>
            </div>
            <div style={{ height: 8, background: "#E5E7EB", borderRadius: 99, overflow: "hidden" }}>
              <div
                style={{
                  height: "100%", borderRadius: 99,
                  width: `${fillPct}%`,
                  background: fillPct > 75 ? "linear-gradient(90deg, #EF4444, #F97316)" : "linear-gradient(90deg, #10B981, #34D399)",
                  transition: "width 0.4s ease",
                }}
              />
            </div>
          </div>

          {isSoldOut ? (
            <div style={{ textAlign: "center", padding: "2rem", color: "#DC2626", fontWeight: 700, fontSize: 15, background: "#FEF2F2", borderRadius: 14, border: "1px solid #FECACA" }}>
              🔴 This tier is completely sold out
            </div>
          ) : (
            <>
              {/* Quantity Selector */}
              <div
                style={{
                  background: "#F8FAFC", border: "1.5px solid #E2E8F0",
                  borderRadius: 16, padding: "1.25rem", marginBottom: "1.25rem",
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 700, color: "#1B2B4E", marginBottom: 12 }}>
                  How many tickets?
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <button
                    onClick={() => { setQty((q) => Math.max(1, q - 1)); if (!holdStarted) setHoldStarted(true); }}
                    style={{
                      width: 40, height: 40, borderRadius: "50%", border: "2px solid #1B2B4E",
                      background: "white", fontSize: 20, fontWeight: 700, cursor: qty <= 1 ? "not-allowed" : "pointer",
                      color: qty <= 1 ? "#D1D5DB" : "#1B2B4E",
                      borderColor: qty <= 1 ? "#E5E7EB" : "#1B2B4E",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                    disabled={qty <= 1}
                  >
                    −
                  </button>
                  <div style={{ fontSize: 32, fontWeight: 900, color: "#1B2B4E", minWidth: 50, textAlign: "center" }}>
                    {qty}
                  </div>
                  <button
                    onClick={() => { setQty((q) => Math.min(maxQty, q + 1)); if (!holdStarted) setHoldStarted(true); }}
                    style={{
                      width: 40, height: 40, borderRadius: "50%", border: "2px solid #1B2B4E",
                      background: "#1B2B4E", fontSize: 20, fontWeight: 700, cursor: qty >= maxQty ? "not-allowed" : "pointer",
                      color: qty >= maxQty ? "#9CA3AF" : "white",
                      background: qty >= maxQty ? "#E5E7EB" : "#1B2B4E",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    } as React.CSSProperties}
                    disabled={qty >= maxQty}
                  >
                    +
                  </button>
                  <div style={{ fontSize: 12, color: "#6B7280", flex: 1, paddingLeft: 8 }}>
                    Max {maxQty} per booking
                  </div>
                </div>

                {/* Price Preview */}
                <div
                  style={{
                    marginTop: 16, paddingTop: 14, borderTop: "1px dashed #E2E8F0",
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                  }}
                >
                  <span style={{ fontSize: 13, color: "#6B7280" }}>
                    {qty} × ₹{tier.price}
                  </span>
                  <span style={{ fontSize: 18, fontWeight: 900, color: "#1B2B4E" }}>
                    ₹{qty * tier.price}
                  </span>
                </div>
              </div>

              <div style={{ background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 10, padding: "10px 14px", fontSize: 12, color: "#92400E", marginBottom: "1.25rem" }}>
                ℹ️ Seats are auto-assigned from available slots. Proceed to confirm your booking.
              </div>
            </>
          )}
        </div>

        {/* Footer CTA */}
        <div style={{ padding: "1rem 1.5rem", borderTop: "1px solid #E5E7EB", background: "#FAFAFA", flexShrink: 0 }}>
          {isSoldOut ? (
            <p style={{ textAlign: "center", fontSize: 13, color: "#9CA3AF", margin: 0, padding: "6px 0" }}>
              No seats available for this tier
            </p>
          ) : (
            <button
              onClick={handleProceed}
              style={{
                width: "100%",
                background: "linear-gradient(135deg, #1B2B4E 0%, #2D4080 100%)",
                color: "white", border: "none", borderRadius: 14, padding: "14px",
                fontWeight: 800, fontSize: 15, cursor: "pointer",
                boxShadow: "0 8px 24px rgba(27,43,78,0.3)",
                transition: "transform 0.15s, box-shadow 0.15s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 12px 28px rgba(27,43,78,0.4)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 8px 24px rgba(27,43,78,0.3)";
              }}
            >
              Proceed to Payment — {qty} Ticket{qty > 1 ? "s" : ""} · ₹{qty * tier.price}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

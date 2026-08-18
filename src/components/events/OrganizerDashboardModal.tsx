import { useState, useMemo } from "react";
import type { EventData, TicketTier, BookedSeat } from "../../types";

interface OrganizerDashboardModalProps {
  events: EventData[];
  onClose: () => void;
  syncEnabled: boolean;
  onToggleSync: () => void;
  syncLogs: string[];
  onClearLogs: () => void;
  onForceSync: () => void;
}

export function OrganizerDashboardModal({
  events,
  onClose,
  syncEnabled,
  onToggleSync,
  syncLogs,
  onClearLogs,
  onForceSync,
}: OrganizerDashboardModalProps) {
  const [selectedEventId, setSelectedEventId] = useState<string>(events[0]?.id || "");
  const [selectedTierId, setSelectedTierId] = useState<string>("");

  const event = useMemo(() => {
    return events.find((e) => e.id === selectedEventId) || events[0];
  }, [events, selectedEventId]);

  // Set default tier ID if not set or invalid for selected event
  useMemo(() => {
    if (event && (!selectedTierId || !event.ticketTiers.some((t) => t.id === selectedTierId))) {
      setSelectedTierId(event.ticketTiers[0]?.id || "");
    }
  }, [event, selectedTierId]);

  const tier = useMemo(() => {
    if (!event) return null;
    return event.ticketTiers.find((t) => t.id === selectedTierId) || event.ticketTiers[0];
  }, [event, selectedTierId]);

  // Calculate event-wide aggregates
  const stats = useMemo(() => {
    if (!event) return { totalSeats: 0, totalBooked: 0, totalHeld: 0, revenue: 0 };
    let totalSeats = 0;
    let totalBooked = 0;
    let totalHeld = 0;
    let revenue = 0;

    event.ticketTiers.forEach((t) => {
      totalSeats += t.totalSeats;
      const bookedCount = t.bookedSeatList?.length || t.bookedSeats;
      const heldCount = t.heldSeatList?.length || t.heldSeats;
      totalBooked += bookedCount;
      totalHeld += heldCount;
      revenue += bookedCount * t.price;
    });

    return { totalSeats, totalBooked, totalHeld, revenue };
  }, [event]);

  // Build grid of seats for selected tier
  const seats = useMemo(() => {
    if (!tier) return [];
    const rows = ["A", "B", "C", "D", "E", "F", "G", "H"];
    const seatsPerRow = 10;
    const total = tier.totalSeats;

    const list = [];
    for (let i = 0; i < total; i++) {
      const rowIdx = Math.floor(i / seatsPerRow);
      const seatNum = (i % seatsPerRow) + 1;
      const row = rows[rowIdx] || "A";
      const seatId = `${row}${seatNum}`;

      // Check if booked
      const bookedSeat = tier.bookedSeatList?.find((s) => s.id === seatId);
      // Check if held
      const heldSeat = tier.heldSeatList?.find((s) => s.id === seatId);

      list.push({
        id: seatId,
        row,
        number: seatNum,
        status: bookedSeat ? "booked" : heldSeat ? "held" : "available",
        bookingInfo: bookedSeat,
      });
    }
    return list;
  }, [tier]);

  const seatsByRow = useMemo(() => {
    return seats.reduce<Record<string, typeof seats>>((acc, seat) => {
      if (!acc[seat.row]) acc[seat.row] = [];
      acc[seat.row].push(seat);
      return acc;
    }, {});
  }, [seats]);

  const rows = useMemo(() => {
    return Object.keys(seatsByRow).sort();
  }, [seatsByRow]);

  const [hoveredSeat, setHoveredSeat] = useState<any | null>(null);

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
          borderRadius: 24,
          width: "100%",
          maxWidth: 960,
          maxHeight: "92vh",
          overflowY: "auto",
          boxShadow: "0 30px 80px rgba(0,0,0,0.35)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div
          style={{
            background: "linear-gradient(135deg, #1B2B4E 0%, #152240 100%)",
            padding: "1.5rem 2rem",
            color: "white",
            position: "relative",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <div style={{ color: "#F5A623", fontSize: 11, fontWeight: 800, letterSpacing: "1.5px", textTransform: "uppercase" }}>
              🛠️ Host & Organizer Administration
            </div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", margin: "4px 0 0 0", fontSize: 24, fontWeight: 800 }}>
              Organizer Dashboard
            </h2>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* Event Dropdown */}
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              style={{
                background: "rgba(255,255,255,0.15)",
                color: "white",
                border: "1px solid rgba(255,255,255,0.3)",
                padding: "8px 16px",
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 600,
                outline: "none",
                cursor: "pointer",
              }}
            >
              {events.map((e) => (
                <option key={e.id} value={e.id} style={{ color: "#1B2B4E" }}>
                  {e.title}
                </option>
              ))}
            </select>
            <button
              onClick={onClose}
              style={{
                background: "rgba(255,255,255,0.15)",
                border: "none",
                borderRadius: "50%",
                width: 38,
                height: 38,
                cursor: "pointer",
                color: "white",
                fontSize: 22,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ×
            </button>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div style={{ padding: "2rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
          
          {/* Left Column: Summary Stats & Tiers list */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            
            {/* Stats Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
              <div style={statCardStyle}>
                <div style={{ fontSize: 20, marginBottom: 4 }}>📈</div>
                <div style={statLabelStyle}>Total Booked</div>
                <div style={statValStyle}>
                  {stats.totalBooked} <span style={{ fontSize: 12, fontWeight: 500, color: "#6B7280" }}>/ {stats.totalSeats}</span>
                </div>
              </div>
              <div style={statCardStyle}>
                <div style={{ fontSize: 20, marginBottom: 4 }}>⏳</div>
                <div style={statLabelStyle}>Held In Carts</div>
                <div style={statValStyle}>{stats.totalHeld}</div>
              </div>
              <div style={statCardStyle}>
                <div style={{ fontSize: 20, marginBottom: 4 }}>💰</div>
                <div style={statLabelStyle}>Revenue Generated</div>
                <div style={{ ...statValStyle, color: "#10B981" }}>₹{stats.revenue}</div>
              </div>
            </div>

            {/* Ticket Tier Breakdown (Organizer Seats Assemble Section) */}
            <div style={panelStyle}>
              <h3 style={panelTitleStyle}>🎟️ Seating & Row Breakdown (Easy Assemble)</h3>
              <p style={{ fontSize: 12, color: "#6B7280", margin: "-6px 0 12px 0", lineHeight: 1.4 }}>
                Below is the total number of seats booked for each row/tier. Organizers can use this list to set up physically matching rows at the venue.
              </p>
              
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {event?.ticketTiers.map((t) => {
                  const booked = t.bookedSeatList?.length || t.bookedSeats;
                  const held = t.heldSeatList?.length || t.heldSeats;
                  const available = t.totalSeats - (booked + held);
                  const pct = Math.round((booked / t.totalSeats) * 100);

                  return (
                    <div
                      key={t.id}
                      onClick={() => setSelectedTierId(t.id)}
                      style={{
                        padding: "12px",
                        background: selectedTierId === t.id ? "#EFF6FF" : "#F9F7F3",
                        border: `1.5px solid ${selectedTierId === t.id ? "#1B2B4E" : "#E5E7EB"}`,
                        borderRadius: 12,
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontWeight: 700, fontSize: 14, color: "#1B2B4E" }}>{t.name} Row</span>
                        <span style={{ fontSize: 12, fontWeight: 800, color: "#C84B31" }}>₹{t.price}</span>
                      </div>
                      
                      {/* Row Booked Stats */}
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, margin: "6px 0 4px", fontWeight: 600 }}>
                        <span style={{ color: "#4B5563" }}>
                          Total Seats Booked: <strong style={{ color: "#1B2B4E", fontSize: 13 }}>{booked}</strong>
                        </span>
                        <span style={{ color: "#9CA3AF" }}>
                          Capacity: {t.totalSeats}
                        </span>
                      </div>

                      {/* Mini Progress Bar */}
                      <div style={{ height: 6, background: "#E5E7EB", borderRadius: 99, overflow: "hidden", marginBottom: 6 }}>
                        <div style={{ width: `${pct}%`, height: "100%", background: "#1B2B4E", borderRadius: 99 }} />
                      </div>

                      <div style={{ display: "flex", gap: 10, fontSize: 10, color: "#6B7280", fontWeight: 700 }}>
                        <span style={{ color: "#10B981" }}>🟢 {available} Available</span>
                        {held > 0 && <span style={{ color: "#D97706" }}>⏳ {held} Held in Carts</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Platform Sync Settings */}
            <div style={panelStyle}>
              <h3 style={panelTitleStyle}>🔗 Multi-Platform Synchronization</h3>
              
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#1B2B4E" }}>Simulate External Bookings</div>
                  <div style={{ fontSize: 11, color: "#6B7280" }}>Simulate bookings from BookMyShow & Paytm Insider</div>
                </div>
                <button
                  onClick={onToggleSync}
                  style={{
                    background: syncEnabled ? "#10B981" : "#EF4444",
                    color: "white",
                    border: "none",
                    borderRadius: 20,
                    padding: "6px 14px",
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  {syncEnabled ? "🟢 Active" : "🔴 Stopped"}
                </button>
              </div>

              <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
                <div style={{ flex: 1, background: "#F3F4F6", padding: 10, borderRadius: 10, textAlign: "center" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#1B2B4E" }}>BookMyShow API</div>
                  <div style={{ fontSize: 11, color: "#10B981", fontWeight: 800, marginTop: 2 }}>🟢 Connected</div>
                </div>
                <div style={{ flex: 1, background: "#F3F4F6", padding: 10, borderRadius: 10, textAlign: "center" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#1B2B4E" }}>Paytm Insider API</div>
                  <div style={{ fontSize: 11, color: "#10B981", fontWeight: 800, marginTop: 2 }}>🟢 Connected</div>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#4B5563" }}>ACTIVITY LOG</span>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={onForceSync} style={miniButtonStyle}>Force Sync</button>
                  <button onClick={onClearLogs} style={miniButtonStyle}>Clear Logs</button>
                </div>
              </div>

              {/* Logs Display */}
              <div
                style={{
                  height: 100,
                  overflowY: "auto",
                  background: "#1F2937",
                  color: "#10B981",
                  borderRadius: 10,
                  padding: 10,
                  fontFamily: "monospace",
                  fontSize: 10,
                  lineHeight: 1.4,
                }}
              >
                {syncLogs.length === 0 ? (
                  <div style={{ color: "#9CA3AF", fontStyle: "italic" }}>No activity logs yet. Toggle simulation or click Force Sync.</div>
                ) : (
                  syncLogs.map((log, i) => <div key={i}>{log}</div>)
                )}
              </div>
            </div>

          </div>

          {/* Right Column: Visual Seating Grid with Hover Info */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            
            {/* Visual Grid Container */}
            <div style={{ ...panelStyle, flex: 1, display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <h3 style={{ ...panelTitleStyle, margin: 0 }}>🪑 Visual Seating Layout</h3>
                <span
                  style={{
                    background: "#1B2B4E",
                    color: "white",
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "4px 10px",
                    borderRadius: 6,
                  }}
                >
                  {tier?.name} Row
                </span>
              </div>

              {/* Colors Legend */}
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: "1.25rem", fontSize: 11 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <div style={{ width: 10, height: 10, background: "#DCFCE7", border: "1px solid #16A34A", borderRadius: 2 }} />
                  <span style={{ color: "#6B7280" }}>Available</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <div style={{ width: 10, height: 10, background: "#FEF9C3", border: "1px solid #CA8A04", borderRadius: 2 }} />
                  <span style={{ color: "#6B7280" }}>Held (In Cart)</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <div style={{ width: 10, height: 10, background: "#FEE2E2", border: "1px solid #DC2626", borderRadius: 2 }} />
                  <span style={{ color: "#6B7280" }}>Hapenly 🎪</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <div style={{ width: 10, height: 10, background: "#FFEDD5", border: "1px solid #EA580C", borderRadius: 2 }} />
                  <span style={{ color: "#6B7280" }}>BookMyShow 🎟️</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <div style={{ width: 10, height: 10, background: "#F3E8FF", border: "1px solid #7C3AED", borderRadius: 2 }} />
                  <span style={{ color: "#6B7280" }}>Paytm Insider 🎫</span>
                </div>
              </div>

              {/* Visual Seat Map */}
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "#F9FAF5",
                  border: "1px solid #E5E7EB",
                  borderRadius: 16,
                  padding: "1.5rem",
                  minHeight: 280,
                }}
              >
                {/* Stage */}
                <div
                  style={{
                    width: "80%",
                    background: "#D1D5DB",
                    textAlign: "center",
                    padding: "4px 0",
                    fontSize: 10,
                    fontWeight: 700,
                    color: "#4B5563",
                    letterSpacing: 2,
                    borderRadius: "0 0 10px 10px",
                    marginBottom: 20,
                  }}
                >
                  🎭 STAGE / SCREEN
                </div>

                {/* Seat Rows */}
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {rows.map((row) => (
                    <div key={row} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <span style={{ width: 14, fontSize: 10, fontWeight: 800, color: "#9CA3AF", textAlign: "center" }}>
                        {row}
                      </span>
                      <div style={{ display: "flex", gap: 3 }}>
                        {seatsByRow[row].map((seat, index) => {
                          let bg = "#DCFCE7";
                          let border = "#16A34A";
                          let text = "#15803D";

                          if (seat.status === "held") {
                            bg = "#FEF9C3";
                            border = "#CA8A04";
                            text = "#A16207";
                          } else if (seat.status === "booked") {
                            const platform = seat.bookingInfo?.platform;
                            if (platform === "BookMyShow") {
                              bg = "#FFEDD5";
                              border = "#EA580C";
                              text = "#C2410C";
                            } else if (platform === "Paytm Insider") {
                              bg = "#F3E8FF";
                              border = "#7C3AED";
                              text = "#6D28D9";
                            } else {
                              // Hapenly
                              bg = "#FEE2E2";
                              border = "#DC2626";
                              text = "#B91C1C";
                            }
                          }

                          return (
                            <div
                              key={seat.id}
                              onMouseEnter={() => seat.status !== "available" && setHoveredSeat(seat)}
                              onMouseLeave={() => setHoveredSeat(null)}
                              style={{
                                width: 24,
                                height: 22,
                                background: bg,
                                border: `1.5px solid ${border}`,
                                borderRadius: "4px 4px 2px 2px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 8,
                                fontWeight: 800,
                                color: text,
                                cursor: seat.status === "available" ? "default" : "help",
                                position: "relative",
                              }}
                            >
                              {index === 5 && <div style={{ width: 6 }} />}
                              {seat.row}
                              {seat.number}
                            </div>
                          );
                        })}
                      </div>
                      <span style={{ width: 14, fontSize: 10, fontWeight: 800, color: "#9CA3AF", textAlign: "center" }}>
                        {row}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hover Seating Info Card */}
              <div
                style={{
                  height: 60,
                  marginTop: 12,
                  background: hoveredSeat ? "#F3F4F6" : "transparent",
                  border: hoveredSeat ? "1px solid #E5E7EB" : "1px dashed #E5E7EB",
                  borderRadius: 12,
                  padding: "8px 12px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  fontSize: 12,
                  color: "#1B2B4E",
                }}
              >
                {hoveredSeat ? (
                  <>
                    <div style={{ fontWeight: 800, display: "flex", justifyContent: "space-between" }}>
                      <span>🪑 Seat {hoveredSeat.id}</span>
                      <span style={{ color: "#C84B31" }}>
                        Source: {hoveredSeat.bookingInfo?.platform || "Hapenly Cart"}
                      </span>
                    </div>
                    <div style={{ color: "#6B7280", marginTop: 2, fontSize: 11 }}>
                      {hoveredSeat.status === "held"
                        ? "⚠️ Held in user's cart (Payment in progress)"
                        : `✅ Booked by ${hoveredSeat.bookingInfo?.customerName || "External User"} — ${
                            hoveredSeat.bookingInfo?.bookedAt
                              ? new Date(hoveredSeat.bookingInfo.bookedAt).toLocaleTimeString()
                              : "N/A"
                          }`}
                    </div>
                  </>
                ) : (
                  <div style={{ color: "#9CA3AF", textAlign: "center", fontSize: 11, fontStyle: "italic" }}>
                    Hover over a booked or held seat to inspect booking details.
                  </div>
                )}
              </div>

            </div>

          </div>

        </div>
      </div>
    </div>
  );
}

const statCardStyle: React.CSSProperties = {
  background: "#F9FAF5",
  border: "1px solid #E5E7EB",
  borderRadius: 16,
  padding: "1rem",
  textAlign: "center",
};

const statLabelStyle: React.CSSProperties = {
  fontSize: 10,
  color: "#9CA3AF",
  fontWeight: 700,
  textTransform: "uppercase",
  marginTop: 4,
};

const statValStyle: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 900,
  color: "#1B2B4E",
  marginTop: 2,
};

const panelStyle: React.CSSProperties = {
  background: "white",
  border: "1px solid #E5E7EB",
  borderRadius: 18,
  padding: "1.25rem",
};

const panelTitleStyle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 800,
  color: "#1B2B4E",
  margin: "0 0 12px 0",
  letterSpacing: "0.3px",
  textTransform: "uppercase",
};

const miniButtonStyle: React.CSSProperties = {
  background: "#F3F4F6",
  border: "1px solid #D1D5DB",
  color: "#4B5563",
  borderRadius: 6,
  padding: "2px 8px",
  fontSize: 9,
  fontWeight: 700,
  cursor: "pointer",
};

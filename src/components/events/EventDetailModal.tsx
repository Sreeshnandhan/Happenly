import { useState, useEffect } from "react";
import {
  EventData,
  Category,
  UserAccount,
  Booking,
  TicketTier,
} from "../../types";
import { SeatsBar } from "../common/SeatsBar";

export function EventDetailModal({
  event,
  category,
  onClose,
  onBook,
  user,
  userTotalTickets,
  userBookings,
}: {
  event: EventData;
  category: Category;
  onClose: () => void;
  onBook: (event: EventData, tier: TicketTier) => void; // Opens TicketSeatModal for the selected tier
  user: UserAccount | null;
  userTotalTickets: number;
  userBookings: Booking[];
}) {
  // --- CALCULATIONS ---
  // Aggregate totals for the top header and SeatsBar
  const totalSeats = event.ticketTiers.reduce(
    (sum, t) => sum + t.totalSeats,
    0,
  );
  const totalBooked = event.ticketTiers.reduce(
    (sum, t) => sum + (t.bookedSeatList?.length ?? t.bookedSeats),
    0,
  );
  const totalHeld = event.ticketTiers.reduce(
    (sum, t) => sum + (t.heldSeatList?.length ?? t.heldSeats),
    0,
  );
  const totalRemaining = totalSeats - (totalBooked + totalHeld);

  const alreadyBooked = userBookings
    .filter((b) => b.eventId === event.id)
    .reduce((sum, b) => sum + b.count, 0);

  const detailItems = [
    { icon: "📅", label: "Date & Time", value: event.date },
    { icon: "📍", label: "Location", value: event.location },
    { icon: "👤", label: "Hosted by", value: event.hostedBy },
    { icon: "⏱️", label: "Duration", value: event.duration },
    { icon: "👥", label: "Age Category", value: event.ageCategory },
    {
      icon: "🪑",
      label: "Total Availability",
      value: `${totalRemaining} seats left`,
    },
  ];

  // --- IMAGE SLIDER LOGIC ---
  const images = event.images?.length ? event.images : [event.image];
  const [slideIndex, setSlideIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const timer = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [images.length]);

  return (
    <div
      style={{
        background: "white",
        borderRadius: 20,
        overflow: "hidden",
        boxShadow: "0 30px 80px rgba(0,0,0,0.28)",
        width: "100%",
        maxWidth: 500,
      }}
    >
      {/* --- IMAGE HEADER --- */}
      <div style={{ position: "relative", height: 230, overflow: "hidden" }}>
        {images.map((src, i) => (
          <img
            key={src}
            src={src}
            alt={`${event.title} ${i + 1}`}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: i === slideIndex ? 1 : 0,
              transition: "opacity 0.8s ease-in-out",
            }}
          />
        ))}

        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 55%)",
            zIndex: 1,
          }}
        />

        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 14,
            right: 14,
            zIndex: 2,
            background: "rgba(255,255,255,0.9)",
            border: "none",
            borderRadius: "50%",
            width: 38,
            height: 38,
            cursor: "pointer",
            fontSize: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#1B2B4E",
          }}
        >
          {" "}
          ×{" "}
        </button>

        <div style={{ position: "absolute", bottom: 14, left: 16, zIndex: 2 }}>
          <span
            style={{
              background: category.color,
              color: "white",
              borderRadius: 99,
              padding: "4px 12px",
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            {category.emoji} {category.label}
          </span>
        </div>
      </div>

      {/* --- BODY --- */}
      <div style={{ padding: "1.5rem", maxHeight: "65vh", overflowY: "auto" }}>
        <h2
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 22,
            fontWeight: 700,
            color: "#1B2B4E",
            margin: "0 0 8px",
          }}
        >
          {event.title}
        </h2>

        <p
          style={{
            color: "#4B5563",
            fontSize: 14,
            lineHeight: 1.6,
            marginBottom: "1.25rem",
          }}
        >
          {event.fullDescription}
        </p>

        {/* Info Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "0.625rem",
            marginBottom: "1.5rem",
          }}
        >
          {detailItems.map(({ icon, label, value }) => (
            <div
              key={label}
              style={{
                background: "#F9F7F3",
                borderRadius: 10,
                padding: "10px 12px",
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  color: "#9CA3AF",
                  fontWeight: 700,
                  textTransform: "uppercase",
                }}
              >
                {icon} {label}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "#1B2B4E",
                  fontWeight: 600,
                  marginTop: 2,
                }}
              >
                {value}
              </div>
            </div>
          ))}
        </div>

        {/* Global Progress Bar */}
        <div style={{ marginBottom: "2rem" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 11,
              fontWeight: 700,
              marginBottom: 5,
              color: category.color,
            }}
          >
            <span>EVENT FILLING FAST</span>
            <span>
              {totalBooked} / {totalSeats} Booked
            </span>
          </div>
          <SeatsBar
            seats={totalSeats}
            booked={totalBooked}
            color={category.color}
          />
        </div>

        {/* --- CHANGE: TICKET TIERS SELECTION (District Model) --- */}
        <div style={{ marginBottom: "1.5rem" }}>
          <h3
            style={{
              fontSize: 14,
              fontWeight: 800,
              color: "#1B2B4E",
              marginBottom: "1rem",
              letterSpacing: "0.5px",
            }}
          >
            CHOOSE TICKETS
          </h3>

          {event.ticketTiers.map((tier) => {
            // Logic: Subtract both Booked and Held seats for true availability
            const bookedCount = tier.bookedSeatList?.length ?? tier.bookedSeats;
            const heldCount = tier.heldSeatList?.length ?? tier.heldSeats;
            const tierAvailable = tier.totalSeats - (bookedCount + heldCount);
            const isTierFull = tierAvailable <= 0;
            const userAtLimit = userTotalTickets >= 5;

            return (
              <div
                key={tier.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "1.25rem",
                  background: "#F9F7F3",
                  borderRadius: 14,
                  marginBottom: "10px",
                  border: "1px solid #E5E7EB",
                  transition: "transform 0.2s",
                }}
              >
                <div>
                  <div
                    style={{ fontWeight: 700, fontSize: 15, color: "#1B2B4E" }}
                  >
                    {tier.name}
                  </div>
                  <div
                    style={{
                      color: "#C84B31",
                      fontWeight: 800,
                      fontSize: 18,
                      marginTop: 2,
                    }}
                  >
                    ₹{tier.price}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      marginTop: 5,
                      color: isTierFull ? "#EF4444" : "#10B981",
                    }}
                  >
                    {isTierFull ? "SOLD OUT" : `${tierAvailable} seats left`}
                    {heldCount > 0 && !isTierFull && (
                      <span style={{ color: "#6B7280", fontWeight: 500 }}>
                        {" "}
                        ({heldCount} in carts)
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() =>
                    !isTierFull && !userAtLimit && onBook(event, tier)
                  }
                  disabled={isTierFull || userAtLimit}
                  style={{
                    background:
                      isTierFull || userAtLimit
                        ? "#D1D5DB"
                        : "linear-gradient(135deg, #1B2B4E 0%, #334155 100%)",
                    color: "white",
                    border: "none",
                    borderRadius: 10,
                    padding: "10px 24px",
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: isTierFull || userAtLimit ? "default" : "pointer",
                    boxShadow: isTierFull
                      ? "none"
                      : "0 4px 12px rgba(27,43,78,0.2)",
                    transition: "transform 0.15s, box-shadow 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    if (!isTierFull && !userAtLimit) {
                      (e.currentTarget as HTMLButtonElement).style.transform =
                        "translateY(-1px)";
                      (e.currentTarget as HTMLButtonElement).style.boxShadow =
                        "0 8px 20px rgba(27,43,78,0.35)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.transform =
                      "translateY(0)";
                    (e.currentTarget as HTMLButtonElement).style.boxShadow =
                      isTierFull ? "none" : "0 4px 12px rgba(27,43,78,0.2)";
                  }}
                >
                  {isTierFull ? "SOLD OUT" : "🪑 Select Seats"}
                </button>
              </div>
            );
          })}
        </div>

        {/* User Status Badges */}
        {user && alreadyBooked > 0 && (
          <div
            style={{
              background: "#ECFDF5",
              border: "1px solid #BBF7D0",
              borderRadius: 10,
              padding: "10px",
              fontSize: 12,
              color: "#059669",
              marginBottom: "10px",
              textAlign: "center",
              fontWeight: 600,
            }}
          >
            ✅ You have {alreadyBooked} ticket{alreadyBooked > 1 ? "s" : ""} for
            this event.
          </div>
        )}

        {userTotalTickets >= 5 && (
          <div
            style={{
              background: "#FEF2F2",
              border: "1px solid #FECACA",
              borderRadius: 10,
              padding: "10px",
              fontSize: 12,
              color: "#DC2626",
              textAlign: "center",
              fontWeight: 600,
            }}
          >
            ⚠️ Maximum booking limit (5 tickets) reached.
          </div>
        )}

        {!user && (
          <p
            style={{
              textAlign: "center",
              fontSize: 12,
              color: "#CA8A04",
              marginTop: 10,
              fontWeight: 700,
              background: "#FEF9C3",
              padding: "6px 12px",
              borderRadius: 8,
              border: "1px solid #FDE68A",
              display: "inline-block",
              width: "100%",
              boxSizing: "border-box",
            }}
          >
            🔧 Dev Mode: Booking enabled as Guest (no login required).
          </p>
        )}
      </div>
    </div>
  );
}

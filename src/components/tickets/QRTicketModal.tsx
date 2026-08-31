import { useState } from "react";
import { Booking, EventData } from "../../types";
import { QRCodeSVG } from "../common/QRCodeSVG";

export function QRTicketModal({
  bookings,
  events,
  onClose,
}: {
  bookings: Booking[];
  events: EventData[];
  onClose: () => void;
}) {
  const [idx, setIdx] = useState(0);

  const tickets = bookings.flatMap((b) => {
    const ev = events.find((e) => e.id === b.eventId);
    return Array.from({ length: b.count }, (_, i) => ({
      booking: b,
      ev,
      num: i + 1,
      qrVal: `GATHERUP|${b.id}|${b.eventId}|${b.holderName}|T${i + 1}of${b.count}|${b.eventDate}`,
    }));
  });

  const t = tickets[idx];
  if (!t) return null;

  return (
    <div
      style={{
        background: "white",
        borderRadius: 20,
        overflow: "hidden",
        boxShadow: "0 30px 80px rgba(0,0,0,0.3)",
        maxWidth: 380,
        margin: "0 auto",
      }}
    >
      <div
        style={{
          background: "linear-gradient(135deg, #1B2B4E 0%, #2D4080 100%)",
          padding: "1.5rem",
          color: "white",
          textAlign: "center",
          position: "relative",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 14,
            right: 14,
            background: "rgba(255,255,255,0.15)",
            border: "none",
            borderRadius: "50%",
            width: 34,
            height: 34,
            cursor: "pointer",
            color: "white",
            fontSize: 18,
          }}
        >
          ×
        </button>
        <div style={{ fontSize: 32, marginBottom: 6 }}>🎟️</div>
        <div
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 20,
            fontWeight: 700,
          }}
        >
          Booking Confirmed!
        </div>
      </div>

      <div style={{ padding: "1.5rem" }}>
        <h3
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 18,
            color: "#1B2B4E",
          }}
        >
          {t.ev?.title}
        </h3>
        <div
          style={{ fontSize: 13, color: "#6B7280", marginBottom: "1.25rem" }}
        >
          <div>📅 {t.ev?.date}</div>
          <div>📍 {t.ev?.location}</div>
          <div>👤 {t.booking.holderName}</div>
        </div>

        <div
          style={{
            position: "relative",
            margin: "0 -1.5rem 1.25rem",
            borderTop: "2px dashed #E5E7EB",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: -10,
              left: 0,
              width: 20,
              height: 20,
              borderRadius: "50%",
              background: "#F9F5EE",
              border: "2px dashed #E5E7EB",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: -10,
              right: 0,
              width: 20,
              height: 20,
              borderRadius: "50%",
              background: "#F9F5EE",
              border: "2px dashed #E5E7EB",
            }}
          />
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.875rem",
          }}
        >
          <QRCodeSVG value={t.qrVal} size={160} />
          <div style={{ fontSize: 11, fontFamily: "monospace" }}>
            {t.booking.id}
          </div>
          <div
            style={{
              background: "#EFF6FF",
              color: "#1D4ED8",
              borderRadius: 8,
              padding: "5px 14px",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            Ticket {t.num} of {t.booking.count}
          </div>
        </div>

        {tickets.length > 1 && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 16,
              marginTop: "1.25rem",
            }}
          >
            <button
              onClick={() => setIdx((i) => Math.max(0, i - 1))}
              disabled={idx === 0}
            >
              ‹
            </button>
            <span style={{ fontSize: 13 }}>
              {idx + 1} / {tickets.length}
            </span>
            <button
              onClick={() => setIdx((i) => Math.min(tickets.length - 1, i + 1))}
              disabled={idx === tickets.length - 1}
            >
              ›
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

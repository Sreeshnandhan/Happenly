import { useState, useEffect } from "react";
import { EventData, Category } from "../../types";

interface EventCardProps {
  event: EventData;
  category: Category;
  onClick: () => void;
}

export function EventCard({ event, category, onClick }: EventCardProps) {
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  // Use event.images if available, otherwise fall back to a single image array
  const imageList =
    event.images && event.images.length > 0 ? event.images : [event.image];

  // CHANGE: Calculate total seats left across all tiers (District Model)
  // Logic: Sum of (totalSeats - bookedSeats - heldSeats) for every row
  const totalSeatsLeft = event.ticketTiers.reduce((acc, tier) => {
    const availableInTier =
      tier.totalSeats - (tier.bookedSeats + tier.heldSeats);
    return acc + Math.max(0, availableInTier);
  }, 0);

  // Effect to handle automatic sliding
  useEffect(() => {
    if (imageList.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentImgIndex((prev) => (prev + 1) % imageList.length);
    }, 3500);

    return () => clearInterval(timer);
  }, [imageList.length]);

  return (
    <div
      onClick={onClick}
      style={{
        background: "white",
        borderRadius: 16,
        overflow: "hidden",
        cursor: "pointer",
        boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
        transition: "all 0.3s ease",
        border: "1px solid #E5E7EB",
        position: "relative",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.transform = "translateY(-5px)")
      }
      onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
    >
      {/* --- AUTOMATIC IMAGE SLIDER --- */}
      <div style={{ position: "relative", height: 180, overflow: "hidden" }}>
        {imageList.map((src, index) => (
          <img
            key={src}
            src={src}
            alt={event.title}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: index === currentImgIndex ? 1 : 0,
              transition: "opacity 1s ease-in-out",
            }}
          />
        ))}

        {/* --- INDICATOR DOTS --- */}
        {imageList.length > 1 && (
          <div
            style={{
              position: "absolute",
              bottom: 10,
              left: 0,
              right: 0,
              display: "flex",
              justifyContent: "center",
              gap: 4,
              zIndex: 10,
            }}
          >
            {imageList.map((_, dotIdx) => (
              <div
                key={dotIdx}
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background:
                    dotIdx === currentImgIndex
                      ? "white"
                      : "rgba(255,255,255,0.4)",
                  transition: "background 0.3s ease",
                }}
              />
            ))}
          </div>
        )}

        {/* Category Badge */}
        <div
          style={{
            position: "absolute",
            top: 10,
            left: 10,
            background: "white",
            padding: "4px 10px",
            borderRadius: 20,
            fontSize: 11,
            fontWeight: 800,
            color: category.color,
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            zIndex: 5,
          }}
        >
          {category.emoji} {category.label.toUpperCase()}
        </div>
      </div>

      {/* --- CONTENT AREA --- */}
      <div style={{ padding: "1.25rem" }}>
        <div
          style={{
            fontSize: 12,
            color: "#C84B31",
            fontWeight: 700,
            marginBottom: 4,
          }}
        >
          {event.date}
        </div>
        <h3
          style={{
            fontSize: 17,
            fontWeight: 700,
            color: "#1B2B4E",
            margin: "0 0 8px",
            height: "2.6em",
            overflow: "hidden",
          }}
        >
          {event.title}
        </h3>
        <div style={{ fontSize: 13, color: "#6B7280", marginBottom: 12 }}>
          📍 {event.location}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: 12,
            borderTop: "1px solid #F3F4F6",
          }}
        >
          <span style={{ fontWeight: 800, color: "#1B2B4E", fontSize: 16 }}>
            {event.price}
          </span>
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              // Color turns red if less than 5 total seats left across all tiers
              color: totalSeatsLeft < 5 ? "#DC2626" : "#059669",
            }}
          >
            {totalSeatsLeft === 0 ? "SOLD OUT" : `${totalSeatsLeft} seats left`}
          </span>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { CATEGORIES } from "../../constants";
import type { EventData } from "../../types";

export function HostEventModal({
  onClose,
  onSubmitEvent,
}: {
  onClose: () => void;
  onSubmitEvent?: (newEvent: EventData) => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const categoryId = formData.get("category") as string;
    const eventName = formData.get("event_name") as string;
    const description = formData.get("description") as string;
    const dateVal = formData.get("date") as string;
    const timeVal = formData.get("time") as string;
    const location = formData.get("location") as string;
    const hostedBy = formData.get("hosted_by") as string;
    const duration = formData.get("duration") as string;
    const ageLimit = formData.get("age_limit") as string;
    const seatsCount = parseInt(formData.get("seats") as string) || 30;
    const priceVal = parseInt(formData.get("price") as string) || 0;

    // Build unique ID and date string
    const eventId = `evt-${Date.now()}`;
    const formattedDate = `${new Date(dateVal).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })} · ${timeVal}`;

    // Get placeholder image matching category or fallback
    const matchedCategory = CATEGORIES.find((c) => c.id === categoryId);
    const categoryName = matchedCategory ? matchedCategory.label : "Event";
    const imageMap: Record<string, string> = {
      art: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=700",
      dance: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=700",
      food: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=700",
      mudpot: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=700",
      tech: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=700",
      strangers: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=700",
      cinema: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=700",
      comedy: "https://images.unsplash.com/photo-1585699324551-f6c309eed262?w=700",
    };
    const imageUrl = imageMap[categoryId] || "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=700";

    const newEvent: EventData = {
      id: eventId,
      categoryId,
      title: eventName,
      description,
      fullDescription: description,
      ticketTiers: [
        {
          id: `${eventId}-reg`,
          name: "Regular Admission",
          price: priceVal,
          totalSeats: seatsCount,
          bookedSeats: 0,
          heldSeats: 0,
          bookedSeatList: [],
          heldSeatList: [],
        },
      ],
      location,
      hostedBy,
      duration,
      date: formattedDate,
      ageCategory: ageLimit,
      price: `From ₹${priceVal}`,
      tags: [categoryName, "Newly Added", "Community"],
      image: imageUrl,
      images: [imageUrl],
      isActive: true,
    };

    try {
      // Append web3forms submission optionally
      const web3Data = new FormData();
      web3Data.append("access_key", "YOUR_ACCESS_KEY_HERE");
      web3Data.append("subject", `New Event Created: ${eventName}`);
      web3Data.append("message", `Organizer: ${formData.get("organizer_name")}\nPhone: ${formData.get("organizer_phone")}\nDetails: ${description}`);
      
      // Post to web3forms mock/optional
      await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: web3Data,
      }).catch(() => {});

      // Add to React State instantly
      if (onSubmitEvent) {
        onSubmitEvent(newEvent);
      }
      setSubmitted(true);
    } catch (error) {
      alert("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div
        style={{
          padding: "3rem",
          textAlign: "center",
          background: "white",
          borderRadius: 20,
        }}
      >
        <div style={{ fontSize: 60, marginBottom: "1rem" }}>🎉</div>
        <h2
          style={{ fontFamily: "'Playfair Display', serif", color: "#1B2B4E" }}
        >
          Event Published!
        </h2>
        <p style={{ color: "#6B7280", lineHeight: 1.6 }}>
          Your event details have been processed. The event has been created <br />
          and added to the live listings automatically.
        </p>
        <button
          onClick={onClose}
          style={{
            marginTop: "1.5rem",
            padding: "12px 24px",
            background: "#1B2B4E",
            color: "white",
            border: "none",
            borderRadius: 10,
            cursor: "pointer",
          }}
        >
          Close
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        background: "white",
        borderRadius: 24,
        width: "100%",
        maxWidth: 650,
        maxHeight: "90vh",
        overflowY: "auto",
        boxShadow: "0 20px 50px rgba(0,0,0,0.2)",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "2rem",
          background: "#1B2B4E",
          color: "white",
          position: "relative",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            right: 20,
            top: 20,
            background: "none",
            border: "none",
            color: "white",
            fontSize: 24,
            cursor: "pointer",
          }}
        >
          ×
        </button>
        <h2
          style={{
            fontFamily: "'Playfair Display', serif",
            margin: "0 0 8px 0",
          }}
        >
          Host your event
        </h2>
        <p style={{ margin: 0, opacity: 0.8, fontSize: 14 }}>
          Fill in the details. The event will be published immediately to the site.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ padding: "2rem" }}>
        <div
          style={{
            display: "flex",
            gap: 10,
            background: "#FEF2F2",
            padding: "12px",
            borderRadius: 12,
            marginBottom: "2rem",
            alignItems: "center",
            border: "1px solid #FECACA",
          }}
        >
          <span style={{ fontSize: 20 }}>🔒</span>
          <span style={{ fontSize: 13, color: "#991B1B", fontWeight: 600 }}>
            Admin Only: Events created here are published <strong>immediately</strong> to the live site.
          </span>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1.5rem",
          }}
        >
          {/* Category Dropdown */}
          <div style={{ gridColumn: "span 2" }}>
            <label style={labelStyle}>Select Category *</label>
            <select name="category" required style={inputStyle}>
              <option value="">-- Choose Category --</option>
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.emoji} {c.label}
                </option>
              ))}
            </select>
          </div>

          <div style={{ gridColumn: "span 2" }}>
            <label style={labelStyle}>Event Name *</label>
            <input
              name="event_name"
              required
              placeholder="e.g. Sunset Watercolor Session"
              style={inputStyle}
            />
          </div>

          <div style={{ gridColumn: "span 2" }}>
            <label style={labelStyle}>Description *</label>
            <textarea
              name="description"
              required
              rows={3}
              placeholder="Tell us what makes this event special..."
              style={inputStyle}
            ></textarea>
          </div>

          <div>
            <label style={labelStyle}>Date *</label>
            <input type="date" name="date" required style={inputStyle} />
          </div>

          <div>
            <label style={labelStyle}>Time *</label>
            <input type="time" name="time" required style={inputStyle} />
          </div>

          <div style={{ gridColumn: "span 2" }}>
            <label style={labelStyle}>Location *</label>
            <input
              name="location"
              required
              placeholder="Full address or Venue name"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Hosted by (Brand/Person) *</label>
            <input
              name="hosted_by"
              required
              placeholder="e.g. Studio 14"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Time Duration *</label>
            <input
              name="duration"
              required
              placeholder="e.g. 3 Hours"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Target Age *</label>
            <input
              name="age_limit"
              required
              placeholder="e.g. 18+ or All Ages"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Number of Seats Available *</label>
            <input
              type="number"
              name="seats"
              required
              placeholder="e.g. 50"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Ticket Price (₹) *</label>
            <input
              type="number"
              name="price"
              required
              placeholder="e.g. 299"
              style={inputStyle}
            />
          </div>

          <div
            style={{
              gridColumn: "span 2",
              marginTop: "1rem",
              paddingTop: "1rem",
              borderTop: "1px solid #EEE",
            }}
          >
            <h4 style={{ margin: "0 0 1rem 0", color: "#1B2B4E" }}>
              Organizer Details
            </h4>
          </div>

          <div>
            <label style={labelStyle}>Your Name *</label>
            <input
              name="organizer_name"
              required
              placeholder="Full Name"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Phone Number *</label>
            <input
              type="tel"
              name="organizer_phone"
              required
              placeholder="Contact Number"
              style={inputStyle}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            width: "100%",
            marginTop: "2.5rem",
            padding: "16px",
            background: isSubmitting
              ? "#9CA3AF"
              : "linear-gradient(135deg, #C84B31 0%, #E05B3A 100%)",
            color: "white",
            border: "none",
            borderRadius: 12,
            fontSize: 16,
            fontWeight: 700,
            cursor: isSubmitting ? "default" : "pointer",
            boxShadow: "0 10px 20px rgba(200,75,49,0.3)",
          }}
        >
          {isSubmitting ? "Publishing Event..." : "Publish Event Live"}
        </button>
      </form>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 13,
  fontWeight: 600,
  color: "#4B5563",
  marginBottom: 6,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px",
  borderRadius: 10,
  border: "1px solid #E5E7EB",
  fontSize: 14,
  fontFamily: "inherit",
  boxSizing: "border-box",
};

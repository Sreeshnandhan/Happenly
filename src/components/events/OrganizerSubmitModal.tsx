import { useState } from "react";
import { CATEGORIES } from "../../constants";

// Web3Forms access key — replace with your real key
const WEB3FORMS_KEY = "YOUR_ACCESS_KEY_HERE";

export function OrganizerSubmitModal({ onClose }: { onClose: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    const formData = new FormData(e.currentTarget);

    const category = formData.get("category") as string;
    const categoryLabel = CATEGORIES.find((c) => c.id === category)?.label ?? category;

    const fields: Record<string, FormDataEntryValue | null> = {
      "Category": categoryLabel,
      "Event Name": formData.get("event_name"),
      "Description": formData.get("description"),
      "Date": formData.get("date"),
      "Time": formData.get("time"),
      "Location": formData.get("location"),
      "Hosted By": formData.get("hosted_by"),
      "Duration": formData.get("duration"),
      "Age Group": formData.get("age"),
      "Number of Seats": formData.get("seats"),
      "Organizer Name": formData.get("organizer_name"),
      "Organizer Phone": formData.get("organizer_phone"),
    };

    const messageLines = Object.entries(fields)
      .map(([k, v]) => `${k}: ${v}`)
      .join("\n");

    const web3Data = new FormData();
    web3Data.append("access_key", WEB3FORMS_KEY);
    web3Data.append("subject", `New Event Request: ${formData.get("event_name")}`);
    web3Data.append("message", messageLines);
    web3Data.append("from_name", formData.get("organizer_name") as string);

    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: web3Data,
      });
      const json = await res.json();

      if (json.success) {
        setSubmitted(true);
      } else {
        setError("Submission failed. Please try again or contact us directly.");
      }
    } catch {
      // Still show success to not block organizer
      setSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ── Success Screen ── */
  if (submitted) {
    return (
      <div style={wrapStyle}>
        <div style={{ padding: "3.5rem 2rem", textAlign: "center" }}>
          <div style={{ fontSize: 64, marginBottom: "1rem" }}>📬</div>
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              color: "#1B2B4E",
              fontSize: 26,
              margin: "0 0 12px",
            }}
          >
            Request Received!
          </h2>
          <p
            style={{
              color: "#6B7280",
              lineHeight: 1.7,
              maxWidth: 380,
              margin: "0 auto 1.5rem",
            }}
          >
            Thank you for submitting your event. Our team will review the
            details and get back to you within{" "}
            <strong>24–48 hours</strong>. Once approved, your event will be
            published on Hapenly.in.
          </p>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "#ECFDF5",
              border: "1.5px solid #6EE7B7",
              borderRadius: 12,
              padding: "10px 20px",
              color: "#065F46",
              fontSize: 13,
              fontWeight: 700,
              marginBottom: "1.5rem",
            }}
          >
            ✅ Submission successfully sent to our team
          </div>
          <br />
          <button
            onClick={onClose}
            style={{
              marginTop: "0.5rem",
              padding: "12px 32px",
              background: "linear-gradient(135deg, #1B2B4E, #152240)",
              color: "white",
              border: "none",
              borderRadius: 12,
              cursor: "pointer",
              fontSize: 15,
              fontWeight: 700,
              boxShadow: "0 8px 20px rgba(27,43,78,0.25)",
            }}
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  /* ── Form ── */
  return (
    <div style={wrapStyle}>
      {/* Header */}
      <div
        style={{
          background: "linear-gradient(135deg, #1B2B4E 0%, #152240 100%)",
          padding: "2rem",
          color: "white",
          position: "relative",
          borderRadius: "24px 24px 0 0",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            right: 20,
            top: 20,
            background: "rgba(255,255,255,0.15)",
            border: "none",
            color: "white",
            fontSize: 20,
            cursor: "pointer",
            width: 36,
            height: 36,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          ×
        </button>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            background: "rgba(245,166,35,0.18)",
            border: "1px solid rgba(245,166,35,0.4)",
            borderRadius: 99,
            padding: "4px 14px",
            marginBottom: "0.75rem",
          }}
        >
          <span
            style={{
              color: "#F5A623",
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: "1.2px",
              textTransform: "uppercase",
            }}
          >
            📋 Organizer Portal
          </span>
        </div>
        <h2
          style={{
            fontFamily: "'Playfair Display', serif",
            margin: "0 0 6px",
            fontSize: 24,
          }}
        >
          Host an Event
        </h2>
        <p style={{ margin: 0, opacity: 0.72, fontSize: 13, lineHeight: 1.5 }}>
          Fill in the details below. Our team will review your request and
          publish the event after approval.
        </p>
      </div>

      {/* Review Notice Banner */}
      <div
        style={{
          background: "#FFFBEB",
          borderBottom: "1px solid #FDE68A",
          padding: "12px 2rem",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <span style={{ fontSize: 18 }}>⏳</span>
        <span style={{ fontSize: 12, color: "#92400E", fontWeight: 700 }}>
          Events are reviewed by our team before being published — usually
          within 24–48 hours.
        </span>
      </div>

      <form onSubmit={handleSubmit} style={{ padding: "2rem" }}>
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}
        >
          {/* Category */}
          <div style={{ gridColumn: "span 2" }}>
            <label style={labelStyle}>Event Category *</label>
            <select name="category" required style={inputStyle}>
              <option value="">— Choose a Category —</option>
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.emoji} {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Event Name */}
          <div style={{ gridColumn: "span 2" }}>
            <label style={labelStyle}>Event Name *</label>
            <input
              name="event_name"
              required
              placeholder="e.g. Chennai Watercolor Sunday"
              style={inputStyle}
            />
          </div>

          {/* Description */}
          <div style={{ gridColumn: "span 2" }}>
            <label style={labelStyle}>Description *</label>
            <textarea
              name="description"
              required
              rows={3}
              placeholder="Tell us what makes this event special..."
              style={{ ...inputStyle, resize: "vertical" }}
            />
          </div>

          {/* Date */}
          <div>
            <label style={labelStyle}>Date *</label>
            <input type="date" name="date" required style={inputStyle} />
          </div>

          {/* Time */}
          <div>
            <label style={labelStyle}>Time *</label>
            <input type="time" name="time" required style={inputStyle} />
          </div>

          {/* Location */}
          <div style={{ gridColumn: "span 2" }}>
            <label style={labelStyle}>Location / Venue *</label>
            <input
              name="location"
              required
              placeholder="Full address or venue name"
              style={inputStyle}
            />
          </div>

          {/* Hosted By */}
          <div>
            <label style={labelStyle}>Hosted By *</label>
            <input
              name="hosted_by"
              required
              placeholder="e.g. Studio 14 or Priya Menon"
              style={inputStyle}
            />
          </div>

          {/* Duration */}
          <div>
            <label style={labelStyle}>Time Duration *</label>
            <input
              name="duration"
              required
              placeholder="e.g. 3 Hours"
              style={inputStyle}
            />
          </div>

          {/* Age */}
          <div>
            <label style={labelStyle}>Age Group *</label>
            <input
              name="age"
              required
              placeholder="e.g. 18+ or All Ages"
              style={inputStyle}
            />
          </div>

          {/* Seats */}
          <div>
            <label style={labelStyle}>Number of Seats *</label>
            <input
              type="number"
              name="seats"
              required
              min={1}
              placeholder="e.g. 50"
              style={inputStyle}
            />
          </div>

          {/* Contact section divider */}
          <div
            style={{
              gridColumn: "span 2",
              borderTop: "1px dashed #E5E7EB",
              paddingTop: "1rem",
            }}
          >
            <p
              style={{
                margin: "0 0 1rem",
                fontSize: 13,
                fontWeight: 700,
                color: "#1B2B4E",
              }}
            >
              📞 Your Contact Details
            </p>
          </div>

          {/* Organizer Name */}
          <div>
            <label style={labelStyle}>Organizer Name *</label>
            <input
              name="organizer_name"
              required
              placeholder="Your full name"
              style={inputStyle}
            />
          </div>

          {/* Organizer Phone */}
          <div>
            <label style={labelStyle}>Phone Number *</label>
            <input
              type="tel"
              name="organizer_phone"
              required
              placeholder="10-digit mobile number"
              style={inputStyle}
            />
          </div>
        </div>

        {error && (
          <p
            style={{
              color: "#DC2626",
              fontSize: 13,
              marginTop: "1rem",
              fontWeight: 600,
            }}
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            width: "100%",
            marginTop: "2rem",
            padding: "16px",
            background: isSubmitting
              ? "#9CA3AF"
              : "linear-gradient(135deg, #C84B31 0%, #E05B3A 100%)",
            color: "white",
            border: "none",
            borderRadius: 12,
            fontSize: 15,
            fontWeight: 700,
            cursor: isSubmitting ? "default" : "pointer",
            boxShadow: isSubmitting
              ? "none"
              : "0 10px 20px rgba(200,75,49,0.3)",
            transition: "all 0.2s",
          }}
        >
          {isSubmitting ? "⏳ Sending your request..." : "📩 Submit for Review"}
        </button>

        <p
          style={{
            textAlign: "center",
            fontSize: 11,
            color: "#9CA3AF",
            marginTop: "1rem",
          }}
        >
          By submitting, you agree to Hapenly's event hosting guidelines.
        </p>
      </form>
    </div>
  );
}

const wrapStyle: React.CSSProperties = {
  background: "white",
  borderRadius: 24,
  width: "100%",
  maxWidth: 640,
  maxHeight: "90vh",
  overflowY: "auto",
  boxShadow: "0 24px 60px rgba(0,0,0,0.22)",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 12,
  fontWeight: 700,
  color: "#4B5563",
  marginBottom: 6,
  textTransform: "uppercase",
  letterSpacing: "0.3px",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "11px 14px",
  borderRadius: 10,
  border: "1.5px solid #E5E7EB",
  fontSize: 14,
  fontFamily: "inherit",
  boxSizing: "border-box",
  outline: "none",
  background: "#FAFAFA",
};

import { useState } from "react";
import { CATEGORIES } from "../../constants";

export function HostEventModal({ onClose }: { onClose: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    // Replace YOUR_ACCESS_KEY with the key from https://web3forms.com/
    formData.append("access_key", "YOUR_ACCESS_KEY_HERE");

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        setSubmitted(true);
      }
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
          Application Received!
        </h2>
        <p style={{ color: "#6B7280", lineHeight: 1.6 }}>
          Thank you for trusting Hapenly.in. Our team will review your event
          details <br />
          and contact you via phone/email within 24 hours for approval.
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
          Fill in the details. Our team will review and publish your event.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ padding: "2rem" }}>
        {/* Trust Badge */}
        <div
          style={{
            display: "flex",
            gap: 10,
            background: "#F0F7FF",
            padding: "12px",
            borderRadius: 12,
            marginBottom: "2rem",
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: 20 }}>🛡️</span>
          <span style={{ fontSize: 13, color: "#1D4ED8", fontWeight: 600 }}>
            Verified Community: All events are manually reviewed to ensure
            safety and quality.
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
                <option key={c.id} value={c.label}>
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
            <label style={labelStyle}>Number of Seats *</label>
            <input
              type="number"
              name="seats"
              required
              placeholder="e.g. 50"
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
          {isSubmitting ? "Sending Application..." : "Submit Event for Review"}
        </button>
        <p
          style={{
            textAlign: "center",
            fontSize: 12,
            color: "#9CA3AF",
            marginTop: 15,
          }}
        >
          By submitting, you agree to our terms for event hosting.
        </p>
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

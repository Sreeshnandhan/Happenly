import { useEffect, useRef, useState } from "react";
import { fetchEventCategories, submitEvent } from "../../api/events";
import type { EventCategoryOption } from "../../api/events";
import "./event-submission.css";

export function OrganizerSubmitModal({ onClose }: { onClose: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState<EventCategoryOption[]>([]);
  const [categoryLoading, setCategoryLoading] = useState(true);
  const [categoryError, setCategoryError] = useState("");
  const [categoryReload, setCategoryReload] = useState(0);
  const imageInput = useRef<HTMLInputElement>(null);
  const [image, setImage] = useState<File | null>(null);
  const [imageError, setImageError] = useState("");
  const [preview, setPreview] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    setCategoryLoading(true);
    setCategoryError("");
    fetchEventCategories(controller.signal)
      .then((items) => {
        if (!controller.signal.aborted) {
          setCategories(items);
          if (!items.length)
            setCategoryError(
              "No categories are available. Please contact the Hapenly team.",
            );
        }
      })
      .catch((err) => {
        if (!controller.signal.aborted)
          setCategoryError(
            err instanceof Error ? err.message : "Unable to load categories.",
          );
      })
      .finally(() => {
        if (!controller.signal.aborted) setCategoryLoading(false);
      });
    return () => controller.abort();
  }, [categoryReload]);
  useEffect(() => {
    if (!image) {
      setPreview("");
      return;
    }
    const url = URL.createObjectURL(image);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [image]);
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting || imageError || categoryLoading || categoryError) return;
    const values = new FormData(e.currentTarget);
    const payload = new FormData();
    const fields: Record<string, string> = {
      categoryId: "category",
      name: "event_name",
      description: "description",
      date: "date",
      startTime: "time",
      location: "location",
      hostedBy: "hosted_by",
      duration: "duration",
      ageRequirement: "age",
      totalSeats: "seats",
      ticketPrice: "ticket_price",
      organizerName: "organizer_name",
      organizerPhone: "organizer_phone",
    };
    for (const [apiName, formName] of Object.entries(fields))
      payload.append(apiName, String(values.get(formName) ?? "").trim());
    if (image) payload.append("image", image);
    setIsSubmitting(true);
    setError("");
    try {
      await submitEvent(payload);
      setSubmitted(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Submission failed. Please try again.",
      );
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
            details. Your request is now available in the admin review queue.
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
          Events are reviewed by our team before being published.
        </span>
      </div>
      <form onSubmit={handleSubmit} className="event-submission-form">
        {categoryError && (
          <div role="alert" style={{ color: "#B91C1C", marginBottom: 16 }}>
            {categoryError}{" "}
            <button
              type="button"
              className="event-secondary-button"
              onClick={() => setCategoryReload((n) => n + 1)}
            >
              Retry
            </button>
          </div>
        )}
        <fieldset
          disabled={isSubmitting}
          style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}
        >
          <div className="event-submission-grid">
            {/* Category */}
            <div style={{ gridColumn: "span 2" }}>
              <label style={labelStyle} htmlFor="event-category">
                Event Category *
              </label>
              <select
                id="event-category"
                name="category"
                required
                disabled={categoryLoading || !!categoryError}
                style={inputStyle}
              >
                <option value="">
                  {categoryLoading
                    ? "Loading categories…"
                    : "— Choose a Category —"}
                </option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            {/* Event Name */}
            <div style={{ gridColumn: "span 2" }}>
              <label style={labelStyle} htmlFor="event-event_name">
                Event Name *
              </label>
              <input
                id="event-event_name"
                name="event_name"
                required
                placeholder="e.g. Chennai Watercolor Sunday"
                style={inputStyle}
              />
            </div>
            {/* Description */}
            <div style={{ gridColumn: "span 2" }}>
              <label style={labelStyle} htmlFor="event-description">
                Description *
              </label>
              <textarea
                id="event-description"
                name="description"
                required
                rows={3}
                placeholder="Tell us what makes this event special..."
                style={{ ...inputStyle, resize: "vertical" }}
              />
            </div>
            {/* Date */}
            <div>
              <label style={labelStyle} htmlFor="event-date">
                Date *
              </label>
              <input
                type="date"
                id="event-date"
                name="date"
                required
                style={inputStyle}
              />
            </div>
            {/* Time */}
            <div>
              <label style={labelStyle} htmlFor="event-time">
                Time *
              </label>
              <input
                type="time"
                id="event-time"
                name="time"
                required
                style={inputStyle}
              />
            </div>
            {/* Location */}
            <div style={{ gridColumn: "span 2" }}>
              <label style={labelStyle} htmlFor="event-location">
                Location / Venue *
              </label>
              <input
                id="event-location"
                name="location"
                required
                placeholder="Full address or venue name"
                style={inputStyle}
              />
            </div>
            {/* Hosted By */}
            <div>
              <label style={labelStyle} htmlFor="event-hosted_by">
                Hosted By *
              </label>
              <input
                id="event-hosted_by"
                name="hosted_by"
                required
                placeholder="e.g. Studio 14 or Priya Menon"
                style={inputStyle}
              />
            </div>
            {/* Duration */}
            <div>
              <label style={labelStyle} htmlFor="event-duration">
                Time Duration *
              </label>
              <input
                id="event-duration"
                name="duration"
                required
                placeholder="e.g. 3 Hours"
                style={inputStyle}
              />
            </div>
            {/* Age */}
            <div>
              <label style={labelStyle} htmlFor="event-age">
                Age Group *
              </label>
              <input
                id="event-age"
                name="age"
                required
                placeholder="e.g. 18+ or All Ages"
                style={inputStyle}
              />
            </div>
            {/* Seats */}
            <div>
              <label style={labelStyle} htmlFor="event-seats">
                Number of Seats *
              </label>
              <input
                type="number"
                id="event-seats"
                name="seats"
                required
                min={1}
                placeholder="e.g. 50"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle} htmlFor="event-ticket-price">
                Ticket price (₹) *
              </label>
              <input
                id="event-ticket-price"
                type="number"
                name="ticket_price"
                required
                min="0"
                max="99999999.99"
                step="0.01"
                placeholder="0 for a free event"
                style={inputStyle}
              />
            </div>
            <div style={{ gridColumn: "span 2" }}>
              <label style={labelStyle} htmlFor="event-image">
                Event image (optional)
              </label>
              <input
                ref={imageInput}
                id="event-image"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                style={inputStyle}
                onChange={(event) => {
                  const file = event.target.files?.[0] ?? null;
                  setImageError("");
                  if (
                    file &&
                    (!["image/jpeg", "image/png", "image/webp"].includes(
                      file.type,
                    ) ||
                      file.size > 5 * 1024 * 1024)
                  ) {
                    setImageError(
                      "Choose a JPG, PNG or WebP image, up to 5 MB.",
                    );
                    setImage(null);
                    event.target.value = "";
                    return;
                  }
                  setImage(file);
                }}
              />
              <p style={{ fontSize: 12, color: "#6B7280" }}>
                JPG, PNG or WebP · up to 5 MB · non-animated
              </p>
              {imageError && (
                <p role="alert" style={{ color: "#B91C1C" }}>
                  {imageError}
                </p>
              )}
              {(preview || imageError) && (
                <button
                  type="button"
                  className="event-secondary-button"
                  onClick={() => {
                    setImage(null);
                    setImageError("");
                    if (imageInput.current) imageInput.current.value = "";
                  }}
                >
                  Remove image
                </button>
              )}
              {preview && (
                <img
                  src={preview}
                  alt="Event image preview"
                  style={{
                    width: "100%",
                    maxHeight: 240,
                    objectFit: "contain",
                    borderRadius: 12,
                  }}
                />
              )}
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
              <label style={labelStyle} htmlFor="event-organizer_name">
                Organizer Name *
              </label>
              <input
                id="event-organizer_name"
                name="organizer_name"
                required
                placeholder="Your full name"
                style={inputStyle}
              />
            </div>
            {/* Organizer Phone */}
            <div>
              <label style={labelStyle} htmlFor="event-organizer_phone">
                Phone Number *
              </label>
              <input
                type="tel"
                id="event-organizer_phone"
                name="organizer_phone"
                required
                placeholder="10-digit mobile number"
                style={inputStyle}
              />
            </div>
          </div>
        </fieldset>
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
          disabled={
            isSubmitting || categoryLoading || !!categoryError || !!imageError
          }
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

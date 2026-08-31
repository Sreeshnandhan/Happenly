import { useState } from "react";
import { Feedback, EventData, UserAccount } from "../../types";
import { StarRating } from "../common/StarRating";

export function FeedbackSection({
  feedbacks,
  events,
  user,
  onSubmit,
}: {
  feedbacks: Feedback[];
  events: EventData[];
  user: UserAccount | null;
  onSubmit: (fb: Omit<Feedback, "id">) => void;
}) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [selectedEv, setSelectedEv] = useState(events[0]?.id || "");
  const [submitted, setSubmitted] = useState(false);
  const [focusedArea, setFocusedArea] = useState(false);

  const handleSubmit = () => {
    if (!comment.trim()) return;
    onSubmit({
      eventId: selectedEv,
      username: user!.username,
      rating,
      comment: comment.trim(),
      timestamp: new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    });
    setComment("");
    setRating(5);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3500);
  };

  const avgRating =
    feedbacks.length > 0
      ? (
          feedbacks.reduce((s, f) => s + f.rating, 0) / feedbacks.length
        ).toFixed(1)
      : "5.0";

  return (
    <section style={{ background: "#F9F5EE", padding: "4rem 0" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 1.5rem" }}>
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <span
            style={{
              background: "#C84B31",
              color: "white",
              borderRadius: 99,
              padding: "4px 14px",
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "1px",
              textTransform: "uppercase",
            }}
          >
            Community Reviews
          </span>
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 32,
              fontWeight: 700,
              color: "#1B2B4E",
              margin: "12px 0 6px",
            }}
          >
            What people are saying
          </h2>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              marginBottom: 6,
            }}
          >
            <StarRating value={5} readonly />
            <span style={{ fontWeight: 700, color: "#1B2B4E", fontSize: 18 }}>
              {avgRating}
            </span>
            <span style={{ color: "#6B7280", fontSize: 14 }}>
              · {feedbacks.length} reviews
            </span>
          </div>
        </div>

        {/* Reviews grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "1.25rem",
            marginBottom: "3rem",
          }}
        >
          {feedbacks.slice(0, 6).map((fb) => {
            const ev = events.find((e) => e.id === fb.eventId);
            const colors = [
              "#C84B31",
              "#7C3AED",
              "#D97706",
              "#92400E",
              "#1D4ED8",
              "#059669",
            ];
            const colorIdx = fb.username.charCodeAt(0) % colors.length;
            return (
              <div
                key={fb.id}
                style={{
                  background: "white",
                  borderRadius: 16,
                  padding: "1.25rem",
                  boxShadow: "0 2px 14px rgba(0,0,0,0.06)",
                  border: "1px solid #F3F4F6",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 10,
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                  >
                    <div
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: "50%",
                        background: `linear-gradient(135deg, ${colors[colorIdx]}, ${colors[(colorIdx + 2) % colors.length]})`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontWeight: 700,
                        fontSize: 16,
                        flexShrink: 0,
                      }}
                    >
                      {fb.username[0]}
                    </div>
                    <div>
                      <div
                        style={{
                          fontWeight: 600,
                          color: "#1B2B4E",
                          fontSize: 14,
                        }}
                      >
                        {fb.username}
                      </div>
                      <div style={{ fontSize: 11, color: "#9CA3AF" }}>
                        {fb.timestamp}
                      </div>
                    </div>
                  </div>
                  <StarRating value={fb.rating} readonly />
                </div>
                {ev && (
                  <div
                    style={{
                      fontSize: 11,
                      color: "#C84B31",
                      fontWeight: 600,
                      marginBottom: 6,
                    }}
                  >
                    🎪 {ev.title}
                  </div>
                )}
                <p
                  style={{
                    fontSize: 14,
                    color: "#4B5563",
                    lineHeight: 1.65,
                    margin: 0,
                  }}
                >
                  "{fb.comment}"
                </p>
              </div>
            );
          })}
        </div>

        {/* Form */}
        <div
          style={{
            background: "white",
            borderRadius: 20,
            padding: "2rem",
            boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
            maxWidth: 560,
            margin: "0 auto",
            border: "1px solid #F3F4F6",
          }}
        >
          <h3
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 20,
              color: "#1B2B4E",
              margin: "0 0 1.25rem",
            }}
          >
            ⭐ Share Your Experience
          </h3>
          {!user ? (
            <p style={{ color: "#6B7280", fontSize: 14, lineHeight: 1.6 }}>
              Please sign in to share your review and help others discover great
              events.
            </p>
          ) : submitted ? (
            <div
              style={{
                textAlign: "center",
                padding: "1.5rem 1rem",
                color: "#059669",
              }}
            >
              <div style={{ fontSize: 40, marginBottom: 10 }}>🎉</div>
              <div style={{ fontSize: 16, fontWeight: 700 }}>
                Thank you for your review!
              </div>
            </div>
          ) : (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              <div>
                <label
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#374151",
                    marginBottom: 6,
                    display: "block",
                  }}
                >
                  Event
                </label>
                <select
                  value={selectedEv}
                  onChange={(e) => setSelectedEv(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 10,
                    border: "1.5px solid #E5E7EB",
                    fontSize: 14,
                    fontFamily: "inherit",
                    background: "white",
                    color: "#1B2B4E",
                    outline: "none",
                  }}
                >
                  {events.map((ev) => (
                    <option key={ev.id} value={ev.id}>
                      {ev.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#374151",
                    marginBottom: 8,
                    display: "block",
                  }}
                >
                  Your Rating
                </label>
                <StarRating value={rating} onChange={setRating} />
              </div>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                onFocus={() => setFocusedArea(true)}
                onBlur={() => setFocusedArea(false)}
                placeholder="Tell others what made this event special…"
                rows={3}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: `1.5px solid ${focusedArea ? "#C84B31" : "#E5E7EB"}`,
                  fontSize: 14,
                  fontFamily: "inherit",
                  resize: "vertical",
                  boxSizing: "border-box",
                  outline: "none",
                  color: "#1B2B4E",
                  transition: "border-color 0.2s",
                }}
              />
              <button
                onClick={handleSubmit}
                style={{
                  background: "linear-gradient(135deg, #C84B31, #E05B3A)",
                  color: "white",
                  border: "none",
                  borderRadius: 10,
                  padding: "12px",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                ⭐ Submit Review
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

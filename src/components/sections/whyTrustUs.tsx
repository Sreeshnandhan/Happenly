export function WhyTrustUs() {
  return (
    <section
      style={{
        background: "white",
        padding: "4rem 0",
        borderTop: "1px solid #F3F4F6",
        borderBottom: "1px solid #F3F4F6",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 1.5rem" }}>
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 32,
              fontWeight: 700,
              color: "#1B2B4E",
              margin: "0 0 8px",
            }}
          >
            Why trust GatherUp?
          </h2>
          <p style={{ color: "#6B7280", fontSize: 16, margin: 0 }}>
            Every event, every detail, every ticket — we have you covered.
          </p>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {[
            {
              icon: "🛡️",
              title: "Verified Hosts",
              desc: "Every host is background-checked and community-reviewed before listing on GatherUp.",
            },
            {
              icon: "📲",
              title: "Instant QR Tickets",
              desc: "Book in seconds. Your QR ticket appears in your account immediately after payment.",
            },
            {
              icon: "⭐",
              title: "4.9★ Avg Rating",
              desc: "Over 12,000 attendees have rated their GatherUp experience at 4.9 stars.",
            },
            {
              icon: "↩️",
              title: "Hassle-free Refunds",
              desc: "Cancel up to 48 hours before any event for a complete, no-questions refund.",
            },
            {
              icon: "🏙️",
              title: "Hyperlocal Curation",
              desc: "Every event is hand-curated specifically for Bengaluru communities.",
            },
            {
              icon: "💬",
              title: "Community Reviews",
              desc: "Read authentic reviews from verified attendees before you commit.",
            },
          ].map(({ icon, title, desc }) => (
            <div
              key={title}
              style={{ textAlign: "center", padding: "1.5rem 1rem" }}
            >
              <div style={{ fontSize: 38, marginBottom: 12 }}>{icon}</div>
              <div
                style={{
                  fontWeight: 700,
                  color: "#1B2B4E",
                  marginBottom: 8,
                  fontSize: 15,
                }}
              >
                {title}
              </div>
              <div style={{ fontSize: 13, color: "#6B7280", lineHeight: 1.65 }}>
                {desc}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

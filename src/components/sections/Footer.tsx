import { CATEGORIES } from "../../constants";

export function Footer({
  onSelectCategory,
}: {
  onSelectCategory: (categoryId: string) => void;
}) {
  return (
    <footer
      style={{
        background: "#1B2B4E",
        color: "rgba(255,255,255,0.65)",
        padding: "3.5rem 0 1.5rem",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 1.5rem" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "2.5rem",
            marginBottom: "2.5rem",
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 14,
              }}
            >
              <span style={{ fontSize: 22 }}>🎪</span>
              <span
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: 21,
                  fontWeight: 700,
                  color: "white",
                }}
              >
                Hapenly.in
              </span>
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.7, margin: "0 0 1rem" }}>
              Bengaluru's most trusted platform for community meetups,
              workshops, and cultural events.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              {["📘", "🐦", "📸", "💼"].map((icon, i) => (
                <div
                  key={i}
                  style={{
                    width: 34,
                    height: 34,
                    background: "rgba(255,255,255,0.08)",
                    borderRadius: 8,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 16,
                    cursor: "pointer",
                  }}
                >
                  {icon}
                </div>
              ))}
            </div>
          </div>
          <div>
            <div
              style={{
                fontWeight: 700,
                color: "white",
                marginBottom: 14,
                fontSize: 14,
              }}
            >
              Categories
            </div>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  onSelectCategory(cat.id);
                  document
                    .getElementById("events")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                style={{
                  display: "block",
                  background: "none",
                  border: "none",
                  color: "rgba(255,255,255,0.6)",
                  fontSize: 13,
                  cursor: "pointer",
                  padding: "4px 0",
                  fontFamily: "inherit",
                }}
              >
                {cat.emoji} {cat.label}
              </button>
            ))}
          </div>
          <div>
            <div
              style={{
                fontWeight: 700,
                color: "white",
                marginBottom: 14,
                fontSize: 14,
              }}
            >
              Support
            </div>
            {[
              "Help Center",
              "Refund Policy",
              "Host an Event",
              "Contact Us",
              "Safety Guidelines",
              "Accessibility",
            ].map((item) => (
              <div key={item} style={{ fontSize: 13, padding: "4px 0" }}>
                {item}
              </div>
            ))}
          </div>
          <div>
            <div
              style={{
                fontWeight: 700,
                color: "white",
                marginBottom: 14,
                fontSize: 14,
              }}
            >
              Get in Touch
            </div>
            <div
              style={{
                fontSize: 13,
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              <span>📧 hapenly@gmail.com</span>
              <span>📞 +91 80 4567 8900</span>
              <span>📍Chennai — 600028</span>
              <span>🕘 Mon–Sat, 9am – 7pm</span>
            </div>
          </div>
        </div>

        {/* App download strip */}
        <div
          style={{
            background: "rgba(255,255,255,0.06)",
            borderRadius: 14,
            padding: "1.25rem 1.5rem",
            marginBottom: "2rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div>
            <div style={{ color: "white", fontWeight: 700, fontSize: 16 }}>
              📱 GatherUp App — coming soon
            </div>
            <div style={{ fontSize: 13, marginTop: 2 }}>
              Book events on the go. Get push notifications before events sell
              out.
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            {["App Store", "Google Play"].map((store) => (
              <div
                key={store}
                style={{
                  background: "rgba(255,255,255,0.12)",
                  border: "1px solid rgba(255,255,255,0.18)",
                  borderRadius: 10,
                  padding: "8px 16px",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "white",
                  cursor: "pointer",
                }}
              >
                {store}
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.1)",
            paddingTop: "1.5rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div style={{ fontSize: 13 }}>
            © 2026 Hapenly.in All rights reserved.
          </div>
          <div style={{ display: "flex", gap: "1.5rem", fontSize: 13 }}>
            <span style={{ cursor: "pointer" }}>Privacy Policy</span>
            <span style={{ cursor: "pointer" }}>Terms of Service</span>
            <span style={{ cursor: "pointer" }}>Cookie Policy</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

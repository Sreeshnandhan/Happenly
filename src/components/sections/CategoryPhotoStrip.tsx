import { useState, useEffect } from "react";
import { CATEGORIES } from "../../constants";

const CIRCLE_POOLS: Record<string, string[]> = {
  Art: [
    "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&fit=crop",
    "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=400&fit=crop",
  ],
  Dance: [
    "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=400&fit=crop",
    "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400&fit=crop",
  ],
  Food: [
    "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&fit=crop",
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&fit=crop",
  ],
  "Mud Pot": [
    "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&fit=crop",
    "https://images.unsplash.com/photo-1593150501174-d88aa1b7bb67?w=400&fit=crop",
  ],
  Tech: [
    "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400&fit=crop",
    "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&fit=crop",
  ],
  Strangers: [
    "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&fit=crop",
    "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=400&fit=crop",
  ],
};

export function CategoryPhotoStrip({
  onSelectCategory,
}: {
  onSelectCategory: (id: string) => void;
}) {
  const [imgIndex, setImgIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setImgIndex((prev) => prev + 1), 4000);
    return () => clearInterval(timer);
  }, []);

  const items = [
    { cat: "Art", emoji: "🎨" },
    { cat: "Dance", emoji: "💃" },
    { cat: "Food", emoji: "🍜" },
    { cat: "Mud Pot", emoji: "🏺" },
    { cat: "Tech", emoji: "💻" },
    { cat: "Strangers", emoji: "🤝" },
  ];

  return (
    <section style={{ padding: "4rem 0", background: "#F9F5EE" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 1.5rem" }}>
        <h2
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 32,
            fontWeight: 700,
            color: "#1B2B4E",
            margin: "0 0 2rem",
            textAlign: "center",
          }}
        >
          A little taste of everything
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(6, 1fr)",
            gap: "1rem",
          }}
        >
          {items.map(({ cat, emoji }) => {
            const pool = CIRCLE_POOLS[cat] || [];
            const currentImg = pool[imgIndex % pool.length];
            return (
              <div
                key={cat}
                onClick={() => {
                  const c = CATEGORIES.find((ca) =>
                    ca.label.toLowerCase().includes(cat.toLowerCase()),
                  );
                  if (c) {
                    onSelectCategory(c.id);
                    document
                      .getElementById("events")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }
                }}
                style={{ textAlign: "center", cursor: "pointer" }}
              >
                <div
                  style={{
                    width: "100%",
                    aspectRatio: "1",
                    borderRadius: "50%",
                    overflow: "hidden",
                    marginBottom: 12,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                >
                  <img
                    src={currentImg}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      transition: "all 0.8s ease",
                    }}
                  />
                </div>
                <div style={{ fontSize: 18 }}>{emoji}</div>
                <div
                  style={{ fontWeight: 700, fontSize: 13, color: "#1B2B4E" }}
                >
                  {cat}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

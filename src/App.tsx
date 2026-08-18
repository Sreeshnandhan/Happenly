import { useState, useEffect } from "react";
import type { CSSProperties } from "react";

// Data & Types
import { CATEGORIES, ALL_EVENTS, INITIAL_FEEDBACKS } from "./constants";
import { EventData, UserAccount, Booking, Feedback, TicketTier, BookedSeat } from "./types";

// Components
import { Overlay } from "./components/common/Overlay";
import { AuthModal } from "./components/auth/AuthModal";
import { EventCard } from "./components/events/EventCard";
import { EventDetailModal } from "./components/events/EventDetailModal";
import { QRTicketModal } from "./components/tickets/QRTicketModal";
import { TicketSeatModal } from "./components/tickets/TicketSeatModal";
import { FeedbackSection } from "./components/feedback/FeedbackSection";
import { WhyTrustUs } from "./components/sections/whyTrustUs";
import { CategoryPhotoStrip } from "./components/sections/CategoryPhotoStrip";
import { Footer } from "./components/sections/Footer";
import { HostEventModal } from "./components/events/HostEventModal";
import { PaymentModal } from "./components/tickets/PaymentModal";
import { OrganizerDashboardModal } from "./components/events/OrganizerDashboardModal";

// Styles
import "./index.css";

// Dynamic initializer to populate initial seat bookings across different platforms
const INITIALIZE_EVENTS_SEATS = (allEvents: EventData[]): EventData[] => {
  return allEvents.map((event) => ({
    ...event,
    ticketTiers: event.ticketTiers.map((tier) => {
      const bookedSeatList: BookedSeat[] = [];
      const rows = ["A", "B", "C", "D", "E", "F", "G", "H"];
      const seatsPerRow = 10;
      
      const platforms: ("Hapenly" | "BookMyShow" | "Paytm Insider")[] = [
        "Hapenly",
        "BookMyShow",
        "Paytm Insider",
      ];
      const names = [
        "Ramesh Kumar",
        "Anjali Sharma",
        "Karthik S.",
        "Priya Patel",
        "Vikram Singh",
        "Deepa Nair",
        "Arun V.",
        "Suresh R.",
      ];

      for (let i = 0; i < tier.bookedSeats; i++) {
        const rowIdx = Math.floor(i / seatsPerRow);
        const seatNum = (i % seatsPerRow) + 1;
        const row = rows[rowIdx] || "A";
        const seatId = `${row}${seatNum}`;

        const platform = platforms[i % platforms.length];
        const customerName = platform === "Hapenly" ? names[i % names.length] : undefined;
        const hoursAgo = (i + 1) * 3;
        const bookedAt = new Date(Date.now() - hoursAgo * 3600000).toISOString();

        bookedSeatList.push({
          id: seatId,
          platform,
          customerName,
          bookedAt,
        });
      }

      return {
        ...tier,
        bookedSeatList,
        heldSeatList: [],
      };
    }),
  }));
};

export default function App() {
  // ─── State Management ───
  const [selectedCategory, setSelectedCategory] = useState("art");
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [user, setUser] = useState<UserAccount | null>(null);
  const [users, setUsers] = useState<Map<string, UserAccount>>(new Map());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [showQR, setShowQR] = useState(false);
  const [latestBookings, setLatestBookings] = useState<Booking[]>([]);
  const [pendingBook, setPendingBook] = useState<{
    event: EventData;
    count: number;
  } | null>(null);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>(INITIAL_FEEDBACKS);
  const [events, setEvents] = useState<EventData[]>(() => INITIALIZE_EVENTS_SEATS(ALL_EVENTS));
  const [showHostModal, setShowHostModal] = useState(false);
  // ─── Seat Modal State ───
  const [seatModal, setSeatModal] = useState<{
    event: EventData;
    tier: TicketTier;
  } | null>(null);

  // ─── Seat Hold & Checkout States ───
  const [checkoutState, setCheckoutState] = useState<{
    event: EventData;
    tier: TicketTier;
    selectedSeats: string[];
    expiresAt: number;
  } | null>(null);

  // ─── Organizer View States ───
  const [showOrganizerDashboard, setShowOrganizerDashboard] = useState(false);
  const [syncEnabled, setSyncEnabled] = useState(true);
  const [syncLogs, setSyncLogs] = useState<string[]>([]);
  const [toasts, setToasts] = useState<{ id: string; message: string }[]>([]);

  // ─── Derived Data ───
  const category = CATEGORIES.find((c) => c.id === selectedCategory)!;
  const filteredEvents = events.filter(
    (e) => e.categoryId === selectedCategory,
  );

  const userTotalTickets = user
    ? bookings
        .filter((b) => b.userId === user.id)
        .reduce((sum, b) => sum + b.count, 0)
    : 0;

  const userBookings = user ? bookings.filter((b) => b.userId === user.id) : [];

  // --- Simulated External Platforms Bookings (BookMyShow & Paytm Insider) ---
  const addSyncLog = (message: string) => {
    const time = new Date().toLocaleTimeString();
    setSyncLogs((prev) => [`[${time}] ${message}`, ...prev.slice(0, 49)]);
  };

  const addToast = (message: string) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 5);
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  useEffect(() => {
    if (!syncEnabled) return;

    const interval = setInterval(() => {
      // 40% chance of random booking every 18 seconds
      if (Math.random() > 0.6) {
        // Pick a random event
        const randomEventIdx = Math.floor(Math.random() * events.length);
        const ev = events[randomEventIdx];
        if (!ev) return;

        // Pick a random tier
        const randomTierIdx = Math.floor(Math.random() * ev.ticketTiers.length);
        const tier = ev.ticketTiers[randomTierIdx];
        if (!tier) return;

        // Calculate available seats
        const booked = tier.bookedSeatList?.length ?? tier.bookedSeats;
        const held = tier.heldSeatList?.length ?? tier.heldSeats;
        const available = tier.totalSeats - (booked + held);

        if (available > 0) {
          // Find first available seat ID
          const rows = ["A", "B", "C", "D", "E", "F", "G", "H"];
          const seatsPerRow = 10;
          let selectedSeatId = "";
          
          for (let i = 0; i < tier.totalSeats; i++) {
            const row = rows[Math.floor(i / seatsPerRow)] || "A";
            const num = (i % seatsPerRow) + 1;
            const seatId = `${row}${num}`;

            const isBooked = tier.bookedSeatList?.some((s) => s.id === seatId);
            const isHeld = tier.heldSeatList?.some((s) => s.id === seatId);

            if (!isBooked && !isHeld) {
              selectedSeatId = seatId;
              break;
            }
          }

          if (selectedSeatId) {
            const platforms = ["BookMyShow", "Paytm Insider"] as const;
            const platform = platforms[Math.floor(Math.random() * platforms.length)];
            
            setEvents((prev) =>
              prev.map((e) =>
                e.id === ev.id
                  ? {
                      ...e,
                      ticketTiers: e.ticketTiers.map((t) => {
                        if (t.id !== tier.id) return t;
                        const newBooked = [
                          ...(t.bookedSeatList || []),
                          {
                            id: selectedSeatId,
                            platform,
                            customerName: "External Sync Customer",
                            bookedAt: new Date().toISOString(),
                          },
                        ];
                        return {
                          ...t,
                          bookedSeatList: newBooked,
                          bookedSeats: newBooked.length,
                        };
                      }),
                    }
                  : e,
              ),
            );

            const msg = `📢 Seat ${selectedSeatId} on ${ev.title} (${tier.name}) booked via ${platform}!`;
            addSyncLog(`Sync Success: Seat ${selectedSeatId} booked on ${platform}`);
            addToast(msg);
          }
        }
      }
    }, 18000);

    return () => clearInterval(interval);
  }, [syncEnabled, events]);

  const handleForceSync = () => {
    addSyncLog("Connecting to BookMyShow API gateway...");
    addSyncLog("Connecting to Paytm Insider API gateway...");
    
    // Simulate syncing 1 random seat
    setTimeout(() => {
      // Pick random event
      const ev = events[Math.floor(Math.random() * events.length)];
      if (!ev) return;
      const tier = ev.ticketTiers[Math.floor(Math.random() * ev.ticketTiers.length)];
      if (!tier) return;

      const booked = tier.bookedSeatList?.length ?? tier.bookedSeats;
      const held = tier.heldSeatList?.length ?? tier.heldSeats;
      const available = tier.totalSeats - (booked + held);

      if (available > 0) {
        const rows = ["A", "B", "C", "D", "E", "F", "G", "H"];
        const seatsPerRow = 10;
        let selectedSeatId = "";
        
        for (let i = 0; i < tier.totalSeats; i++) {
          const row = rows[Math.floor(i / seatsPerRow)] || "A";
          const num = (i % seatsPerRow) + 1;
          const seatId = `${row}${num}`;

          const isBooked = tier.bookedSeatList?.some((s) => s.id === seatId);
          const isHeld = tier.heldSeatList?.some((s) => s.id === seatId);

          if (!isBooked && !isHeld) {
            selectedSeatId = seatId;
            break;
          }
        }

        if (selectedSeatId) {
          const platform = Math.random() > 0.5 ? "BookMyShow" : "Paytm Insider";
          setEvents((prev) =>
            prev.map((e) =>
              e.id === ev.id
                ? {
                    ...e,
                    ticketTiers: e.ticketTiers.map((t) => {
                      if (t.id !== tier.id) return t;
                      const newBooked = [
                        ...(t.bookedSeatList || []),
                        {
                          id: selectedSeatId,
                          platform: platform as any,
                          customerName: "Sync Console Forced User",
                          bookedAt: new Date().toISOString(),
                        },
                      ];
                      return {
                        ...t,
                        bookedSeatList: newBooked,
                        bookedSeats: newBooked.length,
                      };
                    }),
                  }
                : e,
            ),
          );
          addSyncLog(`Force Sync Complete: Synced seat ${selectedSeatId} from ${platform}`);
          addToast(`🔄 Forced Sync: Seat ${selectedSeatId} booked via ${platform}!`);
        }
      } else {
        addSyncLog("Force Sync: All databases in sync. No changes.");
      }
    }, 800);
  };

  // ─── Booking Logic ───
  const completeBookingWithTier = (
    ev: EventData,
    tier: TicketTier,
    selectedSeats: string[],
    bookUser: UserAccount,
  ) => {
    const newBooking: Booking = {
      id: `BK-${Date.now().toString(36).toUpperCase()}`,
      eventId: ev.id,
      tierId: tier.id,
      tierName: tier.name,
      eventTitle: ev.title,
      eventDate: ev.date,
      eventLocation: ev.location,
      userId: bookUser.id,
      holderName: bookUser.username,
      count: selectedSeats.length,
      seats: selectedSeats,
      bookedAt: new Date().toISOString(),
    };

    setBookings((prev) => [...prev, newBooking]);
    
    // Update the tier's bookedSeatList and remove from heldSeatList in state
    setEvents((prev) =>
      prev.map((e) =>
        e.id === ev.id
          ? {
              ...e,
              ticketTiers: e.ticketTiers.map((t) => {
                if (t.id !== tier.id) return t;

                const newBookedSeats = selectedSeats.map((seatId) => ({
                  id: seatId,
                  platform: "Hapenly" as const,
                  customerName: bookUser.username,
                  bookedAt: new Date().toISOString(),
                }));

                const updatedBookedList = [...(t.bookedSeatList || []), ...newBookedSeats];
                const updatedHeldList = (t.heldSeatList || []).filter(
                  (h) => !selectedSeats.includes(h.id),
                );

                return {
                  ...t,
                  bookedSeatList: updatedBookedList,
                  heldSeatList: updatedHeldList,
                  bookedSeats: updatedBookedList.length,
                  heldSeats: updatedHeldList.length,
                };
              }),
            }
          : e,
      ),
    );

    setLatestBookings([newBooking]);
    setSeatModal(null);
    setSelectedEvent(null);
    setShowQR(true);
  };

  const handleBookAttempt = (ev: EventData, tier: TicketTier) => {
    /*
    if (!user) {
      setPendingBook({ event: ev, count: 1 });
      setShowAuth(true);
      setAuthMode("login");
      return;
    }
    */
    // Open the seat selection modal
    setSeatModal({ event: ev, tier });
  };

  const handleSeatProceed = (selectedSeats: string[]) => {
    if (!seatModal) return;
    const currentUser = user || { id: "dev-user", username: "Guest User", email: "guest@example.com", phone: "1234567890", password: "" };
    
    const expiresAt = Date.now() + 600 * 1000; // 10 minutes hold timer
    
    // Update held list for this tier
    setEvents((prev) =>
      prev.map((e) =>
        e.id === seatModal.event.id
          ? {
              ...e,
              ticketTiers: e.ticketTiers.map((t) => {
                if (t.id !== seatModal.tier.id) return t;

                const newHeldSeats = selectedSeats.map((seatId) => ({
                  id: seatId,
                  expiresAt,
                  userId: currentUser.id,
                }));

                const updatedHeldList = [...(t.heldSeatList || []), ...newHeldSeats];

                return {
                  ...t,
                  heldSeatList: updatedHeldList,
                  heldSeats: updatedHeldList.length,
                };
              }),
            }
          : e,
      ),
    );

    // Open checkout payment state
    setCheckoutState({
      event: seatModal.event,
      tier: seatModal.tier,
      selectedSeats,
      expiresAt,
    });

    // Close seat modal
    setSeatModal(null);
  };

  const handleCheckoutCancel = () => {
    if (!checkoutState) return;
    const { event: ev, tier, selectedSeats } = checkoutState;

    // Release held seats
    setEvents((prev) =>
      prev.map((e) =>
        e.id === ev.id
          ? {
              ...e,
              ticketTiers: e.ticketTiers.map((t) => {
                if (t.id !== tier.id) return t;

                const updatedHeldList = (t.heldSeatList || []).filter(
                  (h) => !selectedSeats.includes(h.id),
                );

                return {
                  ...t,
                  heldSeatList: updatedHeldList,
                  heldSeats: updatedHeldList.length,
                };
              }),
            }
          : e,
      ),
    );

    setCheckoutState(null);
  };

  const handleHoldExpired = () => {
    if (!checkoutState) return;
    const { event: ev, tier, selectedSeats } = checkoutState;

    setEvents((prev) =>
      prev.map((e) =>
        e.id === ev.id
          ? {
              ...e,
              ticketTiers: e.ticketTiers.map((t) => {
                if (t.id !== tier.id) return t;

                const updatedHeldList = (t.heldSeatList || []).filter(
                  (h) => !selectedSeats.includes(h.id),
                );

                return {
                  ...t,
                  heldSeatList: updatedHeldList,
                  heldSeats: updatedHeldList.length,
                };
              }),
            }
          : e,
      ),
    );

    setCheckoutState(null);
  };

  const handlePaymentSuccess = () => {
    if (!checkoutState) return;
    const currentUser = user || { id: "dev-user", username: "Guest User", email: "guest@example.com", phone: "1234567890", password: "" };
    completeBookingWithTier(
      checkoutState.event,
      checkoutState.tier,
      checkoutState.selectedSeats,
      currentUser,
    );
    setCheckoutState(null);
  };

  // ─── Auth Handlers ───
  const handleAuthSuccess = (loggedUser: UserAccount) => {
    setUser(loggedUser);
    setShowAuth(false);
    if (pendingBook) {
      const { event: ev } = pendingBook;
      setPendingBook(null);
      // After login, reopen the event detail so they can select seats
      setSelectedEvent(ev);
    }
  };

  const handleRegister = (newUser: UserAccount) => {
    setUsers((prev) => new Map(prev).set(newUser.id, newUser));
  };

  const addFeedback = (fb: Omit<Feedback, "id">) => {
    setFeedbacks((prev) => [{ ...fb, id: `fb-${Date.now()}` }, ...prev]);
  };

  const navLinkStyle: CSSProperties = {
    color: "rgba(255,255,255,0.72)",
    fontSize: 14,
    fontWeight: 500,
    textDecoration: "none",
    transition: "color 0.2s",
  };

  return (
    <div
      className="app-wraper"
      style={{
        fontFamily: "'DM Sans', system-ui, sans-serif",
        background: "#F9F5EE",
        minHeight: "100vh",
        color: "#1B2B4E",
      }}
    >
      {/* ── Header / Nav ── */}
      <header
        style={{
          background: "#1B2B4E",
          position: "sticky",
          top: 0,
          zIndex: 200,
          boxShadow: "0 2px 24px rgba(0,0,0,0.22)",
        }}
      >
        <div
          className="main-container"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: 66,
          }}
        >
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 38,
                height: 38,
                flexShrink: 0,
                background: "linear-gradient(135deg, #C84B31, #F5A623)",
                borderRadius: 11,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
              }}
            >
              🎪
            </div>
            <span
              className="header-logo-text"
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 23,
                fontWeight: 900,
                color: "white",
                letterSpacing: "-0.5px",
              }}
            >
              Hapenly.in
            </span>
          </div>

          {/* Nav Links */}
          <nav
            style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}
          >
            <button
              onClick={() => setShowOrganizerDashboard(true)}
              style={{
                background: "linear-gradient(135deg, #F5A623 0%, #D97706 100%)",
                color: "white",
                border: "none",
                borderRadius: 10,
                padding: "8px 16px",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(217,119,6,0.25)",
                marginRight: 4,
              }}
            >
              💼 Organizer Console
            </button>
            <button
              onClick={() => setShowHostModal(true)}
              style={{
                background: "transparent",
                color: "#F5A623",
                border: "1.5px solid #F5A623",
                borderRadius: 10,
                padding: "8px 16px",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Host <span className="nav-links-desktop">an Event</span>
            </button>
            <a
              href="#events"
              className="nav-links-desktop"
              style={navLinkStyle}
            >
              Explore
            </a>
            <a
              href="#feedback"
              className="nav-links-desktop"
              style={navLinkStyle}
            >
              Reviews
            </a>

            {user ? (
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #C84B31, #F5A623)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontWeight: 800,
                    fontSize: 13,
                  }}
                >
                  {user.username[0].toUpperCase()}
                </div>
                <button
                  onClick={() => setUser(null)}
                  style={{
                    color: "rgba(255,255,255,0.6)",
                    fontSize: 11,
                    background: "none",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: 6,
                    padding: "4px 8px",
                    cursor: "pointer",
                  }}
                >
                  Sign out
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setShowAuth(true);
                  setAuthMode("login");
                }}
                style={{
                  background: "#C84B31",
                  color: "white",
                  border: "none",
                  borderRadius: 10,
                  padding: "8px 18px",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Join
              </button>
            )}
          </nav>
        </div>
      </header>

      {/* ── Hero Section ── */}
      <section
        style={{
          position: "relative",
          minHeight: 520,
          background: "#1B2B4E",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
        }}
      >
        <img
          src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1600&h=700&fit=crop&auto=format"
          alt="People gathered"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: 0.28,
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(130deg, rgba(27,43,78,0.97) 45%, rgba(200,75,49,0.25) 100%)",
          }}
        />

        <div
          className="main-container hero-grid"
          style={{ position: "relative", padding: "4rem 0" }}
        >
          <div className="hero-content-wrapper">
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "rgba(245,166,35,0.12)",
                border: "1px solid rgba(245,166,35,0.3)",
                borderRadius: 99,
                padding: "6px 16px",
                marginBottom: "1.25rem",
              }}
            >
              <span
                style={{
                  color: "#F5A623",
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: "1.5px",
                  textTransform: "uppercase",
                }}
              >
                ✦ Chennai's #1 Meetup Platform
              </span>
            </div>
            <h1
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "clamp(32px, 5vw, 52px)",
                fontWeight: 900,
                color: "white",
                lineHeight: 1.14,
                margin: "0 0 1.125rem",
              }}
            >
              Don't Just Hear About It, <br />
              <em style={{ color: "#F5A623", fontStyle: "italic" }}>
                Be There.
              </em>
            </h1>
            <p
              style={{
                color: "rgba(255,255,255,0.72)",
                fontSize: 17,
                lineHeight: 1.7,
                margin: "0 0 2.25rem",
                maxWidth: 480,
              }}
            >
              Discover exclusive events, build meaningful connections, and
              create opportunities that last.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <a
                href="#events"
                style={{
                  background: "linear-gradient(135deg, #C84B31, #E05B3A)",
                  color: "white",
                  borderRadius: 12,
                  padding: "14px 28px",
                  fontSize: 15,
                  fontWeight: 700,
                  textDecoration: "none",
                  boxShadow: "0 8px 24px rgba(200,75,49,0.4)",
                }}
              >
                🎪 Browse Events
              </a>
              <button
                onClick={() => {
                  setShowAuth(true);
                  setAuthMode("register");
                }}
                style={{
                  background: "rgba(255,255,255,0.08)",
                  color: "white",
                  border: "1.5px solid rgba(255,255,255,0.25)",
                  borderRadius: 12,
                  padding: "14px 28px",
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: "pointer",
                  backdropFilter: "blur(4px)",
                }}
              >
                ✨ Join Free
              </button>
            </div>
          </div>

          <div className="stats-grid">
            {[
              { icon: "🎟️", val: "12k+", label: "Tickets" },
              { icon: "🎪", val: "200+", label: "Events" },
              { icon: "⭐", val: "4.9/5", label: "Rating" },
              { icon: "🏙️", val: "6", label: "Categories" },
            ].map(({ icon, val, label }) => (
              <div
                key={label}
                style={{
                  background: "rgba(255,255,255,0.07)",
                  backdropFilter: "blur(8px)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 16,
                  padding: "1.25rem",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: 26, marginBottom: 6 }}>{icon}</div>
                <div
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: 22,
                    fontWeight: 700,
                    color: "#F5A623",
                  }}
                >
                  {val}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "rgba(255,255,255,0.55)",
                    marginTop: 3,
                  }}
                >
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust Bar ── */}
      <div
        style={{
          background: "#152240",
          borderTop: "1px solid rgba(255,255,255,0.07)",
          padding: "1rem 0",
        }}
      >
        <div
          className="main-container trust-bar-content"
          style={{
            display: "flex",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: "2.5rem",
          }}
        >
          {[
            "🔒 Secure Payments",
            "✅ Verified Hosts",
            "📲 Instant QR",
            "↩️ Easy Refunds",
            "🛡️ Safe Community",
          ].map((item) => (
            <span
              key={item}
              style={{
                color: "rgba(255,255,255,0.5)",
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* ── Events Section ── */}
      <section id="events" style={{ padding: "4rem 0" }}>
        <div className="main-container">
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
              Explore by Category
            </span>
            <h2
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "clamp(26px, 4vw, 32px)",
                fontWeight: 700,
                color: "#1B2B4E",
                margin: "12px 0 6px",
              }}
            >
              What's happening near you
            </h2>
            <p style={{ color: "#6B7280", fontSize: 16, margin: 0 }}>
              Pick a category and find your perfect event in Chennai
            </p>
          </div>

          <div
            className="no-scrollbar"
            style={{
              display: "flex",
              gap: "0.75rem",
              overflowX: "auto",
              paddingBottom: "0.8rem",
              marginBottom: "2rem",
            }}
          >
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  style={{
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    background: active ? cat.color : "white",
                    color: active ? "white" : "#4B5563",
                    border: `1.5px solid ${active ? cat.color : "#E5E7EB"}`,
                    borderRadius: 12,
                    padding: "10px 18px",
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  <span style={{ fontSize: 18 }}>{cat.emoji}</span> {cat.label}
                </button>
              );
            })}
          </div>

          {/* Category Banner - FIXED NaN Calculation */}
          <div
            className="category-banner"
            style={{
              marginBottom: "2rem",
              padding: "1.5rem",
              background: category.bgColor,
              borderRadius: 16,
              border: `1.5px solid ${category.color}22`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <span style={{ fontSize: 40 }}>{category.emoji}</span>
              <div>
                <div
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: 20,
                    fontWeight: 700,
                    color: category.color,
                  }}
                >
                  {category.label}
                </div>
                <div style={{ fontSize: 14, color: "#6B7280", marginTop: 2 }}>
                  {filteredEvents.length} events available in Chennai
                </div>
              </div>
              <div
                className="category-banner-right"
                style={{
                  marginLeft: "auto",
                  fontSize: 14,
                  color: category.color,
                  fontWeight: 700,
                }}
              >
                {filteredEvents.reduce(
                  (sum, e) =>
                    sum +
                    e.ticketTiers.reduce(
                      (ts, t) =>
                        ts + (t.totalSeats - t.bookedSeats - t.heldSeats),
                      0,
                    ),
                  0,
                )}{" "}
                seats left
              </div>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "1.5rem",
            }}
          >
            {filteredEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                category={category}
                onClick={() => setSelectedEvent(event)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── Sub Sections ── */}
      <WhyTrustUs />
      <CategoryPhotoStrip onSelectCategory={setSelectedCategory} />

      <div id="feedback">
        <FeedbackSection
          feedbacks={feedbacks}
          events={events}
          user={user}
          onSubmit={addFeedback}
        />
      </div>

      <Footer onSelectCategory={setSelectedCategory} />

      {/* ── Modals ── */}
      {selectedEvent && (
        <Overlay onClose={() => setSelectedEvent(null)}>
          <EventDetailModal
            event={selectedEvent}
            category={
              CATEGORIES.find((c) => c.id === selectedEvent.categoryId)!
            }
            onClose={() => setSelectedEvent(null)}
            onBook={handleBookAttempt}
            user={user}
            userTotalTickets={userTotalTickets}
            userBookings={userBookings}
          />
        </Overlay>
      )}

      {showAuth && (
        <Overlay
          onClose={() => {
            setShowAuth(false);
            setPendingBook(null);
          }}
        >
          <AuthModal
            mode={authMode}
            onToggleMode={() =>
              setAuthMode((m) => (m === "login" ? "register" : "login"))
            }
            onClose={() => {
              setShowAuth(false);
              setPendingBook(null);
            }}
            onSuccess={handleAuthSuccess}
            users={users}
            onRegister={handleRegister}
          />
        </Overlay>
      )}

      {showQR && latestBookings.length > 0 && (
        <Overlay onClose={() => setShowQR(false)}>
          <QRTicketModal
            bookings={latestBookings}
            events={events}
            onClose={() => setShowQR(false)}
          />
        </Overlay>
      )}

      {showHostModal && (
        <Overlay onClose={() => setShowHostModal(false)}>
          <HostEventModal onClose={() => setShowHostModal(false)} />
        </Overlay>
      )}

      {/* ── Ticket Seat Selection Modal ── */}
      {seatModal && (
        <TicketSeatModal
          event={seatModal.event}
          tier={seatModal.tier}
          onClose={() => setSeatModal(null)}
          onProceed={handleSeatProceed}
        />
      )}

      {/* ── Payment Checkout Modal ── */}
      {checkoutState && (
        <PaymentModal
          event={checkoutState.event}
          tier={checkoutState.tier}
          selectedSeats={checkoutState.selectedSeats}
          expiresAt={checkoutState.expiresAt}
          onClose={handleCheckoutCancel}
          onPaymentSuccess={handlePaymentSuccess}
          onHoldExpired={handleHoldExpired}
        />
      )}

      {/* ── Organizer Dashboard Modal ── */}
      {showOrganizerDashboard && (
        <OrganizerDashboardModal
          events={events}
          onClose={() => setShowOrganizerDashboard(false)}
          syncEnabled={syncEnabled}
          onToggleSync={() => setSyncEnabled(!syncEnabled)}
          syncLogs={syncLogs}
          onClearLogs={() => setSyncLogs([])}
          onForceSync={handleForceSync}
        />
      )}

      {/* ── Floating Premium Toasts Container ── */}
      <div
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          gap: 10,
          pointerEvents: "none",
        }}
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            style={{
              background: "#1B2B4E",
              color: "white",
              padding: "14px 20px",
              borderRadius: 14,
              fontSize: 13,
              fontWeight: 600,
              boxShadow: "0 10px 25px rgba(27,43,78,0.3)",
              border: "1px solid rgba(255,255,255,0.1)",
              animation: "slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
              pointerEvents: "auto",
              display: "flex",
              alignItems: "center",
              gap: 8,
              maxWidth: 320,
            }}
          >
            {toast.message}
          </div>
        ))}
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%) translateY(10px);
            opacity: 0;
          }
          to {
            transform: translateX(0) translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

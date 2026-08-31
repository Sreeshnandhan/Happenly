import { useState, useEffect } from "react";
import type { EventData, TicketTier } from "../../types";
import { QRCodeSVG } from "../common/QRCodeSVG";

interface PaymentModalProps {
  event: EventData;
  tier: TicketTier;
  selectedSeats: string[];
  expiresAt: number; // timestamp in ms when hold expires
  onClose: () => void;
  onPaymentSuccess: (details: { name: string; phone: string; email: string }) => void;
  onHoldExpired: () => void;
}

export function PaymentModal({
  event,
  tier,
  selectedSeats,
  expiresAt,
  onClose,
  onPaymentSuccess,
  onHoldExpired,
}: PaymentModalProps) {
  // Booking Info States
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [formErrors, setFormErrors] = useState<string>("");

  // Payment Options
  const [paymentMethod, setPaymentMethod] = useState<"gpay" | "card">("gpay");
  const [isProcessing, setIsProcessing] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);

  // Card input states
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardName, setCardName] = useState("");

  // Booking Flow Steps: "checkout" | "success"
  const [step, setStep] = useState<"checkout" | "success">("checkout");
  const [bookingId, setBookingId] = useState("");
  const [emailSentStatus, setEmailSentStatus] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  // Calculate remaining seconds
  useEffect(() => {
    if (step === "success") return;
    const updateTimer = () => {
      const diff = Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));
      setTimeLeft(diff);
      if (diff <= 0) {
        onHoldExpired();
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [expiresAt, onHoldExpired, step]);

  const basePrice = selectedSeats.length * tier.price;
  const platformFee = 0; // PLATFORM FEE IS FREE!
  const totalAmount = basePrice + platformFee;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  };

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !phone.trim() || !email.trim()) {
      setFormErrors("Please fill in Name, Phone, and Email to complete booking.");
      return;
    }
    setFormErrors("");
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      setBookingId(`BK-${Date.now().toString(36).toUpperCase()}`);
      setEmailSentStatus(true);
      setStep("success");
    }, 1800);
  };

  const handleCardNumberChange = (val: string) => {
    const clean = val.replace(/\D/g, "");
    const formatted = clean.match(/.{1,4}/g)?.join(" ") || clean;
    setCardNumber(formatted.slice(0, 19));
  };

  const handleExpiryChange = (val: string) => {
    const clean = val.replace(/\D/g, "");
    if (clean.length > 2) {
      setCardExpiry(`${clean.slice(0, 2)}/${clean.slice(2, 4)}`);
    } else {
      setCardExpiry(clean);
    }
  };

  const handleEmailTrigger = () => {
    setEmailSentStatus(false);
    setTimeout(() => {
      setEmailSentStatus(true);
    }, 600);
  };

  const handleShare = async () => {
    setIsSharing(true);

    const shareText =
      `🎟️ My Hapenly Ticket\n` +
      `Event: ${event.title}\n` +
      `Date: ${event.date}\n` +
      `Venue: ${event.location}\n` +
      `Attendee: ${name}\n` +
      `Seats: ${selectedSeats.join(", ")} (${selectedSeats.length} ticket${selectedSeats.length > 1 ? "s" : ""})\n` +
      `Booking ID: ${bookingId}\n` +
      `Booked via Hapenly.in`;

    // Try native Web Share API first (works on mobile & modern browsers)
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Hapenly Ticket — ${event.title}`,
          text: shareText,
          url: window.location.href,
        });
        setIsSharing(false);
        return;
      } catch (err) {
        // User cancelled share — just reset
        setIsSharing(false);
        return;
      }
    }

    // Fallback: Copy to clipboard
    try {
      await navigator.clipboard.writeText(shareText);
      setIsSharing(false);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 3000);
    } catch {
      // Final fallback for old browsers
      const el = document.createElement("textarea");
      el.value = shareText;
      el.style.position = "fixed";
      el.style.opacity = "0";
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setIsSharing(false);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 3000);
    }
  };

  // Generate standard ticket QR value
  const ticketQRValue = `HAPENLY|${bookingId}|${event.id}|${name}|Seats:${selectedSeats.join(",")}|${event.date}`;

  if (step === "success") {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 1200,
          background: "rgba(0,0,0,0.65)",
          backdropFilter: "blur(6px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1rem",
        }}
      >
        <div
          style={{
            background: "white",
            borderRadius: 24,
            width: "100%",
            maxWidth: 440,
            boxShadow: "0 30px 80px rgba(0,0,0,0.35)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div
            style={{
              background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
              padding: "1.75rem",
              color: "white",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 42, marginBottom: 8 }}>🎉</div>
            <h2
              style={{
                fontFamily: "'Playfair Display', serif",
                margin: 0,
                fontSize: 22,
                fontWeight: 800,
              }}
            >
              Payment Successful!
            </h2>
            <p style={{ margin: "6px 0 0 0", opacity: 0.9, fontSize: 13 }}>
              Your booking is confirmed. See you there!
            </p>
          </div>

          {/* Ticket Details Body */}
          <div style={{ padding: "1.5rem", overflowY: "auto", maxHeight: "65vh" }}>
            <div
              style={{
                border: "1.5px dashed #E5E7EB",
                borderRadius: 16,
                padding: "1.25rem",
                background: "#FAFAFA",
                position: "relative",
              }}
            >
              {/* Event Info */}
              <h3 style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 700, color: "#1B2B4E" }}>
                {event.title}
              </h3>
              <p style={{ margin: "0 0 10px", fontSize: 12, color: "#6B7280" }}>
                📍 {event.location}
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, fontSize: 12, marginBottom: 12 }}>
                <div>
                  <span style={{ color: "#9CA3AF", display: "block" }}>DATE & TIME</span>
                  <span style={{ fontWeight: 600, color: "#1B2B4E" }}>{event.date}</span>
                </div>
                <div>
                  <span style={{ color: "#9CA3AF", display: "block" }}>BOOKING ID</span>
                  <span style={{ fontWeight: 600, color: "#1B2B4E" }}>{bookingId}</span>
                </div>
                <div>
                  <span style={{ color: "#9CA3AF", display: "block" }}>ATTENDEE</span>
                  <span style={{ fontWeight: 600, color: "#1B2B4E" }}>{name}</span>
                </div>
                <div>
                  <span style={{ color: "#9CA3AF", display: "block" }}>SEAT NO. ({selectedSeats.length} ticket{selectedSeats.length > 1 ? "s" : ""})</span>
                  <span style={{ fontWeight: 700, color: "#1B2B4E", letterSpacing: 0.5 }}>{selectedSeats.join(" · ")}</span>
                </div>
              </div>

              {/* QR Code Section */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  borderTop: "1.5px dashed #E5E7EB",
                  paddingTop: "1.25rem",
                  marginTop: "0.5rem",
                  gap: 8,
                }}
              >
                <div style={{ padding: 10, background: "white", borderRadius: 12, border: "1px solid #E5E7EB" }}>
                  <QRCodeSVG value={ticketQRValue} size={150} />
                </div>
                <span style={{ fontSize: 10, color: "#9CA3AF", fontWeight: 600, letterSpacing: 0.5 }}>
                  SCAN AT GATE TO ENTER
                </span>
              </div>
            </div>

            {/* Email notification panel */}
            <div
              style={{
                marginTop: "1rem",
                background: "#ECFDF5",
                border: "1px solid #A7F3D0",
                borderRadius: 12,
                padding: "10px 14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 18 }}>📧</span>
                <span style={{ fontSize: 12, color: "#065F46", fontWeight: 600 }}>
                  Ticket shared to <strong>{email}</strong>
                </span>
              </div>
              <button
                onClick={handleEmailTrigger}
                style={{
                  background: "white",
                  border: "1px solid #A7F3D0",
                  borderRadius: 6,
                  padding: "4px 8px",
                  fontSize: 10,
                  fontWeight: 700,
                  color: "#059669",
                  cursor: "pointer",
                }}
              >
                {emailSentStatus ? "Resend Mail" : "Sending..."}
              </button>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: "1.25rem" }}>
              <button
                onClick={handleShare}
                disabled={isSharing}
                style={{
                  flex: 1,
                  background: shareCopied ? "#ECFDF5" : "#F3F4F6",
                  color: shareCopied ? "#059669" : "#1B2B4E",
                  border: shareCopied ? "1.5px solid #A7F3D0" : "none",
                  borderRadius: 12,
                  padding: "12px",
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: isSharing ? "default" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  transition: "all 0.2s ease",
                }}
              >
                {isSharing ? (
                  <>⏳ Sharing...</>
                ) : shareCopied ? (
                  <>✅ Copied to Clipboard!</>
                ) : (
                  <>📤 Share Ticket</>
                )}
              </button>
              <button
                onClick={() => onPaymentSuccess({ name, phone, email })}
                style={{
                  flex: 1,
                  background: "linear-gradient(135deg, #1B2B4E 0%, #152240 100%)",
                  color: "white",
                  border: "none",
                  borderRadius: 12,
                  padding: "12px",
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(27,43,78,0.25)",
                }}
              >
                Done
              </button>
            </div>
            {shareCopied && (
              <div style={{ marginTop: 8, background: "#ECFDF5", border: "1px solid #A7F3D0", borderRadius: 8, padding: "8px 12px", fontSize: 11, color: "#059669", fontWeight: 600, textAlign: "center" }}>
                📋 Ticket details copied! Paste in WhatsApp, SMS or Email to share.
              </div>
            )}
            <p style={{ textAlign: "center", fontSize: 11, color: "#9CA3AF", marginTop: 10, margin: "10px 0 0 0" }}>
              📸 Screenshot this QR ticket to enter at the gate offline
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1200,
        background: "rgba(0,0,0,0.65)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: 24,
          width: "100%",
          maxWidth: 500,
          maxHeight: "92vh",
          overflowY: "auto",
          boxShadow: "0 30px 80px rgba(0,0,0,0.35)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div
          style={{
            background: "linear-gradient(135deg, #1B2B4E 0%, #152240 100%)",
            padding: "1.5rem",
            color: "white",
            position: "relative",
            flexShrink: 0,
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
          <div
            style={{
              color: "#F5A623",
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: "1px",
              textTransform: "uppercase",
              marginBottom: 4,
            }}
          >
            💳 Secure Checkout
          </div>
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              margin: 0,
              fontSize: 20,
              fontWeight: 700,
            }}
          >
            Complete Booking
          </h2>
          <p style={{ margin: "4px 0 0 0", opacity: 0.8, fontSize: 13 }}>
            {event.title} — {tier.name}
          </p>
        </div>

        {/* Hold Notice */}
        <div
          style={{
            background: timeLeft < 60 ? "#FEE2E2" : "#FEF3C7",
            padding: "10px 1.5rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: `1px solid ${timeLeft < 60 ? "#FECACA" : "#FDE68A"}`,
          }}
        >
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: timeLeft < 60 ? "#DC2626" : "#A16207",
            }}
          >
            ⚠️ Seats Locked for You
          </span>
          <span
            style={{
              fontFamily: "monospace",
              fontSize: 14,
              fontWeight: 800,
              color: timeLeft < 60 ? "#DC2626" : "#CA8A04",
              background: "white",
              padding: "2px 8px",
              borderRadius: 6,
              border: `1px solid ${timeLeft < 60 ? "#FECACA" : "#FDE68A"}`,
            }}
          >
            {formatTime(timeLeft)}
          </span>
        </div>

        <div style={{ padding: "1.5rem", flex: 1 }}>
          <form onSubmit={handlePay}>
            {/* Booking Details Input Fields */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: "1.5rem" }}>
              <h3 style={{ fontSize: 12, fontWeight: 800, color: "#1B2B4E", margin: "0 0 2px 0", textTransform: "uppercase", letterSpacing: 0.5 }}>
                👤 Attendee Details
              </h3>
              <div>
                <label style={labelStyle}>Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Enter attendee's full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={labelStyle}>Mobile Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={inputStyle}
                  />
                </div>
              </div>
            </div>

            {/* Booking Summary */}
            <div
              style={{
                background: "#F9F7F3",
                borderRadius: 14,
                padding: "1rem",
                marginBottom: "1.5rem",
                border: "1px solid #E5E7EB",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: "#6B7280" }}>Selected Seats</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#1B2B4E" }}>
                  {selectedSeats.join(", ")} ({selectedSeats.length} Seat{selectedSeats.length > 1 ? "s" : ""})
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: "#6B7280" }}>Ticket Price ({selectedSeats.length} × ₹{tier.price})</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#1B2B4E" }}>₹{basePrice}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: "#6B7280" }}>Platform Booking Fee</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#10B981" }}>Free (₹0)</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  borderTop: "1px dashed #D1D5DB",
                  marginTop: 10,
                  paddingTop: 10,
                }}
              >
                <span style={{ fontSize: 14, fontWeight: 700, color: "#1B2B4E" }}>Total Amount</span>
                <span style={{ fontSize: 16, fontWeight: 900, color: "#C84B31" }}>₹{totalAmount}</span>
              </div>
            </div>

            {/* Payment Tabs */}
            <div style={{ display: "flex", gap: 10, marginBottom: "1.25rem" }}>
              <button
                type="button"
                onClick={() => setPaymentMethod("gpay")}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: 12,
                  border: `2px solid ${paymentMethod === "gpay" ? "#4285F4" : "#E5E7EB"}`,
                  background: paymentMethod === "gpay" ? "#F1F5F9" : "white",
                  fontWeight: 700,
                  color: "#1B2B4E",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                <span style={{ fontSize: 16 }}>📱</span> Google Pay UPI
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod("card")}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: 12,
                  border: `2px solid ${paymentMethod === "card" ? "#1B2B4E" : "#E5E7EB"}`,
                  background: paymentMethod === "card" ? "#EFF6FF" : "white",
                  fontWeight: 700,
                  color: "#1B2B4E",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                💳 Credit / Debit Card
              </button>
            </div>

            {formErrors && (
              <div style={{ color: "#EF4444", fontSize: 12, fontWeight: 600, marginBottom: "1rem", textAlign: "center" }}>
                ⚠️ {formErrors}
              </div>
            )}

            {/* GPay Stylized QR Code Panel */}
            {paymentMethod === "gpay" && (
              <div
                style={{
                  marginBottom: "1.5rem",
                  padding: "1.25rem",
                  background: "#F8FAFC",
                  borderRadius: 16,
                  border: "1px solid #E2E8F0",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
                  {/* Mock GPay Logo */}
                  <span style={{
                    background: "#4285F4",
                    color: "white",
                    padding: "3px 8px",
                    borderRadius: 4,
                    fontSize: 11,
                    fontWeight: 900,
                    letterSpacing: -0.5
                  }}>
                    G Pay
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#64748B" }}>UPI Secure Payment</span>
                </div>
                
                {/* QR Code Container */}
                <div
                  style={{
                    background: "white",
                    padding: "14px",
                    borderRadius: 16,
                    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)",
                    border: "1.5px solid #E2E8F0",
                    marginBottom: 10,
                  }}
                >
                  <QRCodeSVG value={`upi://pay?pa=hapenly@okaxis&pn=Hapenly&am=${totalAmount}`} size={140} />
                </div>

                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#1B2B4E" }}>
                    Scan QR to Pay ₹{totalAmount}
                  </div>
                  <div style={{ fontSize: 10, color: "#64748B", marginTop: 4 }}>
                    Compatible with GPay, PhonePe, Paytm, and all UPI Apps
                  </div>
                </div>
              </div>
            )}

            {/* Card Option Panel */}
            {paymentMethod === "card" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: "1.5rem" }}>
                <div>
                  <label style={labelStyle}>Cardholder Name</label>
                  <input
                    type="text"
                    required={paymentMethod === "card"}
                    placeholder="e.g. Ramesh Kumar"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Card Number</label>
                  <input
                    type="text"
                    required={paymentMethod === "card"}
                    placeholder="0000 0000 0000 0000"
                    value={cardNumber}
                    onChange={(e) => handleCardNumberChange(e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div style={{ display: "flex", gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>Expiry (MM/YY)</label>
                    <input
                      type="text"
                      required={paymentMethod === "card"}
                      placeholder="MM/YY"
                      value={cardExpiry}
                      onChange={(e) => handleExpiryChange(e.target.value)}
                      style={inputStyle}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>CVV</label>
                    <input
                      type="password"
                      required={paymentMethod === "card"}
                      placeholder="123"
                      maxLength={3}
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ""))}
                      style={inputStyle}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Pay Button */}
            <button
              type="submit"
              disabled={isProcessing}
              style={{
                width: "100%",
                background: isProcessing
                  ? "#9CA3AF"
                  : "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                color: "white",
                border: "none",
                borderRadius: 14,
                padding: "14px",
                fontSize: 15,
                fontWeight: 800,
                cursor: isProcessing ? "default" : "pointer",
                boxShadow: isProcessing ? "none" : "0 8px 24px rgba(16,185,129,0.3)",
                transition: "all 0.15s ease",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              {isProcessing ? (
                <>
                  <div className="spinner" /> Verification in progress...
                </>
              ) : (
                `Confirm & Pay ₹${totalAmount}`
              )}
            </button>
          </form>

          <button
            onClick={onClose}
            disabled={isProcessing}
            style={{
              width: "100%",
              background: "transparent",
              border: "1.5px solid #E5E7EB",
              color: "#6B7280",
              borderRadius: 14,
              padding: "12px",
              fontSize: 13,
              fontWeight: 700,
              cursor: isProcessing ? "default" : "pointer",
              marginTop: 10,
              transition: "all 0.15s ease",
            }}
          >
            Cancel & Release Seats
          </button>
        </div>
      </div>

      <style>{`
        .spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 11,
  fontWeight: 700,
  color: "#4B5563",
  marginBottom: 4,
  textTransform: "uppercase",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid #E5E7EB",
  fontSize: 13,
  fontFamily: "inherit",
  boxSizing: "border-box",
  outline: "none",
};

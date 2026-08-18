import { useState, useEffect } from "react";
import type { EventData, TicketTier } from "../../types";
import { QRCodeSVG } from "../common/QRCodeSVG";

interface PaymentModalProps {
  event: EventData;
  tier: TicketTier;
  selectedSeats: string[];
  expiresAt: number; // timestamp in ms when hold expires
  onClose: () => void;
  onPaymentSuccess: () => void;
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
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "card">("upi");
  const [upiOption, setUpiOption] = useState<"gpay" | "phonepe" | "qr">("gpay");
  const [isProcessing, setIsProcessing] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);

  // Card input states
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardName, setCardName] = useState("");

  // Calculate remaining seconds
  useEffect(() => {
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
  }, [expiresAt, onHoldExpired]);

  const basePrice = selectedSeats.length * tier.price;
  const platformFee = selectedSeats.length * 9;
  const totalAmount = basePrice + platformFee;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  };

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onPaymentSuccess();
    }, 1500);
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
            <div style={{ display: "flex", justifycontent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: "#6B7280" }}>Selected Seats</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#1B2B4E" }}>
                {selectedSeats.join(", ")} ({selectedSeats.length} Seat{selectedSeats.length > 1 ? "s" : ""})
              </span>
            </div>
            <div style={{ display: "flex", justifycontent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: "#6B7280" }}>Ticket Price ({selectedSeats.length} × ₹{tier.price})</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#1B2B4E" }}>₹{basePrice}</span>
            </div>
            <div style={{ display: "flex", justifycontent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: "#6B7280" }}>Platform Booking Fee</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#1B2B4E" }}>₹{platformFee}</span>
            </div>
            <div
              style={{
                display: "flex",
                justifycontent: "space-between",
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
          <div style={{ display: "flex", gap: 10, marginBottom: "1.5rem" }}>
            <button
              onClick={() => setPaymentMethod("upi")}
              style={{
                flex: 1,
                padding: "12px",
                borderRadius: 12,
                border: `2px solid ${paymentMethod === "upi" ? "#1B2B4E" : "#E5E7EB"}`,
                background: paymentMethod === "upi" ? "#EFF6FF" : "white",
                fontWeight: 700,
                color: "#1B2B4E",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              📱 UPI / Instant
            </button>
            <button
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
              💳 Card (Visa/Master)
            </button>
          </div>

          <form onSubmit={handlePay}>
            {/* UPI Option Panel */}
            {paymentMethod === "upi" && (
              <div style={{ marginBottom: "1.5rem" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <label
                    onClick={() => setUpiOption("gpay")}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "12px",
                      borderRadius: 10,
                      border: "1px solid #E5E7EB",
                      cursor: "pointer",
                      background: upiOption === "gpay" ? "#F9FAF5" : "white",
                    }}
                  >
                    <input
                      type="radio"
                      name="upi_opt"
                      checked={upiOption === "gpay"}
                      onChange={() => setUpiOption("gpay")}
                    />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#1B2B4E" }}>Google Pay / PhonePe</div>
                      <div style={{ fontSize: 11, color: "#6B7280" }}>Pay instantly using your default UPI app</div>
                    </div>
                  </label>

                  <label
                    onClick={() => setUpiOption("qr")}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "12px",
                      borderRadius: 10,
                      border: "1px solid #E5E7EB",
                      cursor: "pointer",
                      background: upiOption === "qr" ? "#F9FAF5" : "white",
                    }}
                  >
                    <input
                      type="radio"
                      name="upi_opt"
                      checked={upiOption === "qr"}
                      onChange={() => setUpiOption("qr")}
                    />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#1B2B4E" }}>UPI QR Code</div>
                      <div style={{ fontSize: 11, color: "#6B7280" }}>Scan QR code from any banking app</div>
                    </div>
                  </label>
                </div>

                {upiOption === "qr" && (
                  <div
                    style={{
                      marginTop: "1.25rem",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "1rem",
                      background: "#F9FAF5",
                      borderRadius: 12,
                      border: "1px dashed #CA8A04",
                    }}
                  >
                    <QRCodeSVG value={`upi://pay?pa=hapenly@okaxis&pn=Hapenly&am=${totalAmount}`} size={130} />
                    <div style={{ fontSize: 11, color: "#CA8A04", fontWeight: 700, marginTop: 8 }}>
                      Scan QR Code to pay ₹{totalAmount}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Card Option Panel */}
            {paymentMethod === "card" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: "1.5rem" }}>
                <div>
                  <label style={labelStyle}>Cardholder Name</label>
                  <input
                    type="text"
                    required
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
                    required
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
                      required
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
                      required
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
                  <div className="spinner" /> Processing Secure Payment...
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

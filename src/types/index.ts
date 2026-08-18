export interface BookedSeat {
  id: string; // e.g. "A3"
  platform: "Hapenly" | "BookMyShow" | "Paytm Insider";
  customerName?: string;
  bookedAt?: string;
}

export interface HeldSeat {
  id: string; // e.g. "A4"
  expiresAt: number; // timestamp in ms
  userId: string;
}

export interface TicketTier {
  id: string;
  name: string; // e.g., "Early Bird", "Regular Ticket", "VIP"
  price: number; // Numeric price for calculations
  totalSeats: number; // Total capacity for this specific tier
  bookedSeats: number; // Seats already paid for
  heldSeats: number; // Seats currently in a user's cart/payment process (BookMyShow style)
  bookedSeatList?: BookedSeat[]; // Detailed list of booked seats
  heldSeatList?: HeldSeat[]; // Detailed list of held seats
}

export interface EventData {
  id: string;
  categoryId: string;
  title: string;
  description: string;
  fullDescription: string;

  // REMOVED: seats: number;
  // REMOVED: seatsBooked: number;

  // ADDED: Array of tiers to support the "District" model
  ticketTiers: TicketTier[];

  location: string;
  hostedBy: string;
  duration: string;
  date: string;
  ageCategory: string;
  price: string; // Display price (e.g., "From ₹199")
  tags: string[];
  image: string; // Main thumbnail
  images?: string[]; // For the image slider
}

export interface Category {
  id: string;
  label: string;
  emoji: string;
  color: string;
  bgColor: string;
}

export interface UserAccount {
  id: string;
  username: string;
  email: string;
  phone: string;
  password: string;
}

/**
 * Updated Booking interface to include Tier information.
 * This makes it "Easy to Assemble" for the Organizer.
 */
export interface Booking {
  id: string;
  eventId: string;
  tierId: string; // The specific tier selected
  tierName: string; // Store the name (e.g. "Early Bird") so it's readable in reports
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
  userId: string;
  holderName: string;
  count: number;
  seats?: string[]; // The specific seats booked, e.g. ["A3", "A4"]
  bookedAt: string;
}

export interface Feedback {
  id: string;
  eventId: string;
  username: string;
  rating: number;
  comment: string;
  timestamp: string;
}

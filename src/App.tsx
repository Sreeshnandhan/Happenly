import { useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'

// ── Types ─────────────────────────────────────────────────────────────────────

interface EventData {
  id: string
  categoryId: string
  title: string
  description: string
  fullDescription: string
  seats: number
  seatsBooked: number
  location: string
  hostedBy: string
  duration: string
  date: string
  ageCategory: string
  image: string
  price: string
  tags: string[]
}

interface Category {
  id: string
  label: string
  emoji: string
  color: string
  bgColor: string
}

interface UserAccount {
  id: string
  username: string
  email: string
  phone: string
  password: string
}

interface Booking {
  id: string
  eventId: string
  eventTitle: string
  eventDate: string
  eventLocation: string
  userId: string
  holderName: string
  count: number
  bookedAt: string
}

interface Feedback {
  id: string
  eventId: string
  username: string
  rating: number
  comment: string
  timestamp: string
}

// ── Constants ─────────────────────────────────────────────────────────────────

const CATEGORIES: Category[] = [
  { id: 'art', label: 'Art Workshop', emoji: '🎨', color: '#C84B31', bgColor: '#FEF2EE' },
  { id: 'dance', label: 'Dance', emoji: '💃', color: '#7C3AED', bgColor: '#F5F3FF' },
  { id: 'food', label: 'Food Festival', emoji: '🍜', color: '#D97706', bgColor: '#FFFBEB' },
  { id: 'mudpot', label: 'Mud Pot', emoji: '🏺', color: '#92400E', bgColor: '#FEF3C7' },
  { id: 'tech', label: 'Tech Meetup', emoji: '💻', color: '#1D4ED8', bgColor: '#EFF6FF' },
  { id: 'strangers', label: 'Strangers Meetup', emoji: '🤝', color: '#059669', bgColor: '#ECFDF5' },
  { id: 'Cinema', label: 'Cinema ', emoji: '🎬', color: '#059669', bgColor: '#ECFDF5' },
  { id: 'Standup comedy ', label: 'Standup comedy ', emoji: '🎤', color: '#059669', bgColor: '#ECFDF5' },
]

const ALL_EVENTS: EventData[] = [
  {
    id: 'art-1', categoryId: 'art',
    title: 'Watercolor Horizon Workshop',
    description: 'Paint breathtaking sunsets using professional watercolor techniques guided by an award-winning artist.',
    fullDescription: "Join Priya Menon for an immersive 3-hour watercolor journey. You'll learn wet-on-wet techniques, color blending, and horizon composition. All materials provided — just bring your curiosity. Refreshments included. You take home your finished painting, mounted and ready to frame.",
    seats: 30, seatsBooked: 18,
    location: 'Studio 14, Koramangala, Bengaluru',
    hostedBy: 'Priya Menon (MFA, Mysore School of Art)',
    duration: '3 hours', date: 'Aug 10, 2026 · 10:00 AM',
    ageCategory: '16+',
    image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=700&h=420&fit=crop&auto=format',
    price: 'Free', tags: ['Painting', 'Beginner Friendly', 'Materials Included'],
  },
  {
    id: 'art-2', categoryId: 'art',
    title: 'Pottery & Soul',
    description: 'Wheel-throwing and hand-building pottery with a master craftsman. Take home your creation.',
    fullDescription: 'Ramesh Kumar, with 20+ years on the wheel, guides you through centering clay, pulling walls, and natural drying. You take home your fired, glazed creation wrapped and ready. All tools and clay provided. Aprons supplied. No prior experience needed.',
    seats: 20, seatsBooked: 15,
    location: 'Clay Corner Studio, Indiranagar, Bengaluru',
    hostedBy: 'Ramesh Kumar, Master Potter',
    duration: '4 hours', date: 'Aug 17, 2026 · 11:00 AM',
    ageCategory: '14+',
    image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=700&h=420&fit=crop&auto=format',
    price: '₹1Free', tags: ['Pottery', 'Hands-on', 'Take Home Piece'],
  },
  {
    id: 'dance-1', categoryId: 'dance',
    title: 'Salsa Night Fever',
    description: 'Latin dance social with a beginner mini-class, live DJ, and vibrant energy for all levels.',
    fullDescription: 'Whether you have two left feet or Latin fire in your hips, Salsa Night Fever welcomes you. Marco & Sunita Dance Co. kick off with a 45-min fundamentals class, followed by 2 hours of social dancing. DJ Ravi spins Colombian salsa all night. Snacks and welcome drinks included.',
    seats: 80, seatsBooked: 45,
    location: 'The Dance Loft, HSR Layout, Bengaluru',
    hostedBy: 'Marco & Sunita Dance Co.',
    duration: '3 hours', date: 'Aug 9, 2026 · 7:00 PM',
    ageCategory: '18+',
    image: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=700&h=420&fit=crop&auto=format',
    price: 'Free', tags: ['Latin Dance', 'All Levels', 'Live DJ'],
  },
  {
    id: 'dance-2', categoryId: 'dance',
    title: 'Bharatanatyam Basics',
    description: 'An introductory session into classical Bharatanatyam with a certified, arangetram-level guru.',
    fullDescription: 'Vidya Shankar, an arangetram-certified dancer and teacher, guides you through foundational adavus (steps), mudras (hand gestures), and facial expressions. Small batch of 40. Comfortable dance practice attire recommended. The beginning of a beautiful classical journey.',
    seats: 40, seatsBooked: 22,
    location: 'Nrithyasalai, Jayanagar, Bengaluru',
    hostedBy: 'Vidya Shankar, Classical Dance Guru',
    duration: '2 hours', date: 'Aug 23, 2026 · 9:00 AM',
    ageCategory: '10+',
    image: 'https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?w=700&h=420&fit=crop&auto=format',
    price: 'Free', tags: ['Classical', 'Indian Art', 'Beginners'],
  },
  {
    id: 'food-1', categoryId: 'food',
    title: 'Street Bites India',
    description: 'Curated food stalls from 15 cities, live cooking demos, and a national food quiz. Family-friendly.',
    fullDescription: 'Embark on a culinary road trip across India without leaving Bengaluru. 15 curated stalls: Kolkata kati rolls, Mumbai pav bhaji, Chennai idli podi, Jaipur ghewar, Lucknowi kebabs, and more. Live cooking shows, food trivia night, and a regional dessert pavilion.',
    seats: 300, seatsBooked: 212,
    location: 'Palace Grounds, Bengaluru',
    hostedBy: 'FoodieCollective India',
    duration: '6 hours', date: 'Aug 15, 2026 · 12:00 PM',
    ageCategory: 'All Ages',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=700&h=420&fit=crop&auto=format',
    price: 'Free', tags: ['Street Food', 'Family Friendly', 'Cultural'],
  },
  {
    id: 'food-2', categoryId: 'food',
    title: 'Ramen & Beyond',
    description: 'Japanese noodle culture: four tasting flights, broth-making workshop, and sake pairing.',
    fullDescription: "Chef Akira Tanaka brings Tokyo to your bowl. Taste four regional ramen styles — shoyu, shio, miso, tonkotsu — learn how broth is built over 18 hours, and discover perfect sake pairings. A truly immersive Japan-in-Bengaluru experience. Limited to 60 seats.",
    seats: 60, seatsBooked: 33,
    location: 'Umami House, MG Road, Bengaluru',
    hostedBy: 'Chef Akira Tanaka',
    duration: '3 hours', date: 'Aug 22, 2026 · 6:30 PM',
    ageCategory: '12+',
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=700&h=420&fit=crop&auto=format',
    price: 'Free', tags: ['Japanese', 'Fine Dining', 'Workshop'],
  },
  {
    id: 'mudpot-1', categoryId: 'mudpot',
    title: 'Earth & Hands',
    description: 'Traditional Terracotta art with village artisans from Karnataka. Lunch included.',
    fullDescription: 'A rare chance to learn traditional Terracotta craftsmanship directly from Channapatna village artisans at Janapada Loka. The day covers earth preparation, coiling, pinching, and natural fire drying. A hearty village lunch is part of the immersive day.',
    seats: 25, seatsBooked: 19,
    location: 'Janapada Loka, Ramanagara, Karnataka',
    hostedBy: 'Kaavya Arts Trust',
    duration: '5 hours', date: 'Aug 16, 2026 · 9:00 AM',
    ageCategory: '8+',
    image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=700&h=420&fit=crop&auto=format',
    price: 'Free', tags: ['Heritage Craft', 'Village Artisans', 'Lunch Included'],
  },
  {
    id: 'mudpot-2', categoryId: 'mudpot',
    title: 'Clay Chronicles',
    description: 'Free-form clay sculpting combined with storytelling of Indus Valley pottery traditions.',
    fullDescription: 'Dr. Anand Rao, archaeologist and potter, blends a history lecture with hands-on clay sculpting. Discover how ancient potters made vessels that lasted millennia while you shape your own clay story. No prior experience needed. You keep your creation.',
    seats: 30, seatsBooked: 14,
    location: 'Heritage Studio, Basavanagudi, Bengaluru',
    hostedBy: 'Dr. Anand Rao, Archaeologist & Potter',
    duration: '3.5 hours', date: 'Aug 30, 2026 · 10:30 AM',
    ageCategory: '14+',
    image: 'https://images.unsplash.com/photo-1493106641515-6b5631de4bb9?w=700&h=420&fit=crop&auto=format',
    price: 'Free', tags: ['History', 'Clay Art', 'Storytelling'],
  },
  {
    id: 'tech-1', categoryId: 'tech',
    title: 'AI Builders Collective',
    description: 'Hands-on LLM fine-tuning, open-stage project demos, and structured speed networking.',
    fullDescription: 'Join 120 AI practitioners for a full-day workshop covering practical LLM fine-tuning on consumer GPUs, RAG pipeline architecture, and AI safety fundamentals. Afternoon: open-stage demos. Evening: structured speed networking. Lunch and dinner provided.',
    seats: 120, seatsBooked: 88,
    location: 'NASSCOM Hub, Whitefield, Bengaluru',
    hostedBy: 'AIforIndia Community',
    duration: '5 hours', date: 'Aug 8, 2026 · 10:00 AM',
    ageCategory: '18+',
    image: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=700&h=420&fit=crop&auto=format',
    price: 'Free', tags: ['AI/ML', 'Networking', 'Demos', 'Meals Included'],
  },
  {
    id: 'tech-2', categoryId: 'tech',
    title: 'Open Source Sunday',
    description: 'Contribute to OSS projects guided by core maintainers. Everyone ships real commits.',
    fullDescription: 'FOSS United organizes this contribution day where you pair with open-source project maintainers to make real commits — from documentation improvements to feature PRs. Mentors from Linux, Mozilla, and Python communities. Everyone ships something by the end.',
    seats: 80, seatsBooked: 41,
    location: 'HasGeek Space, Domlur, Bengaluru',
    hostedBy: 'FOSS United',
    duration: '4 hours', date: 'Aug 24, 2026 · 11:00 AM',
    ageCategory: '16+',
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=700&h=420&fit=crop&auto=format',
    price: 'Free', tags: ['Open Source', 'Coding', 'Community'],
  },
  {
    id: 'strangers-1', categoryId: 'strangers',
    title: '100 Strangers Café',
    description: 'Structured conversation games designed to forge genuine human connections. Arrive alone, leave with friends.',
    fullDescription: "Hello Stranger Network runs this beloved monthly social experiment. Arrive alone, leave with friends. The evening features 3 rounds of curated conversation prompts, a group storytelling game, and an open floor. No phones — just real presence and connection.",
    seats: 100, seatsBooked: 67,
    location: 'Third Wave Coffee, Indiranagar, Bengaluru',
    hostedBy: 'Hello Stranger Network',
    duration: '2.5 hours', date: 'Aug 7, 2026 · 6:00 PM',
    ageCategory: '18+',
    image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=700&h=420&fit=crop&auto=format',
    price: 'Free', tags: ['Social', 'Games', 'Community'],
  },
  {
    id: 'strangers-2', categoryId: 'strangers',
    title: 'First Hello',
    description: 'An ice-breaker evening for introverts — quiet games, story cards, and a shared dinner.',
    fullDescription: 'Introvert Circle India created First Hello as a low-pressure alternative to typical socials. Small tables of 6, facilitated by empathetic hosts, using story card prompts to open natural conversation. Shared vegetarian dinner included. No forced networking.',
    seats: 50, seatsBooked: 28,
    location: 'The Quiet Room, Sadashivanagar, Bengaluru',
    hostedBy: 'Introvert Circle India',
    duration: '3 hours', date: 'Aug 21, 2026 · 7:00 PM',
    ageCategory: '21+',
    image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=700&h=420&fit=crop&auto=format',
    price: 'Free', tags: ['Introverts', 'Dinner Included', 'Small Group'],
  },
  {
    id: 'Cinema ', categoryId: 'Cinema',
    title: 'First Hello',
    description: 'An ice-breaker evening for introverts — quiet games, story cards, and a shared dinner.',
    fullDescription: 'Introvert Circle India created First Hello as a low-pressure alternative to typical socials. Small tables of 6, facilitated by empathetic hosts, using story card prompts to open natural conversation. Shared vegetarian dinner included. No forced networking.',
    seats: 50, seatsBooked: 28,
    location: 'The Quiet Room, Sadashivanagar, Bengaluru',
    hostedBy: 'Introvert Circle India',
    duration: '3 hours', date: 'Aug 21, 2026 · 7:00 PM',
    ageCategory: '21+',
    image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=700&h=420&fit=crop&auto=format',
    price: 'Free', tags: ['Introverts', 'Dinner Included', 'Small Group'],
  },
  {
    id: 'Standup comedy ', categoryId: 'Standup comedy',
    title: 'First Hello',
    description: 'An ice-breaker evening for introverts — quiet games, story cards, and a shared dinner.',
    fullDescription: 'Introvert Circle India created First Hello as a low-pressure alternative to typical socials. Small tables of 6, facilitated by empathetic hosts, using story card prompts to open natural conversation. Shared vegetarian dinner included. No forced networking.',
    seats: 50, seatsBooked: 28,
    location: 'The Quiet Room, Sadashivanagar, Bengaluru',
    hostedBy: 'Introvert Circle India',
    duration: '3 hours', date: 'Aug 21, 2026 · 7:00 PM',
    ageCategory: '21+',
    image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=700&h=420&fit=crop&auto=format',
    price: 'Free', tags: ['Introverts', 'Dinner Included', 'Small Group'],
  },

]

const INITIAL_FEEDBACKS: Feedback[] = [
  { id: 'fb1', eventId: 'art-1', username: 'Ashikaseelan', rating: 5, comment: "Priya is an absolutely inspiring teacher. I painted my first real watercolor and I'm completely hooked!", timestamp: 'July 15, 2026' },
  { id: 'fb2', eventId: 'strangers-1', username: 'Kaviya', rating: 5, comment: 'I came alone and left with four new friends I genuinely want to keep in touch with. A magic evening.', timestamp: 'July 8, 2026' },
  { id: 'fb3', eventId: 'tech-1', username: 'Kalaivani', rating: 4, comment: 'The LLM fine-tuning workshop was dense in the best way. Walked out with a working LoRA adapter!', timestamp: 'July 20, 2026' },
  { id: 'fb4', eventId: 'food-1', username: 'Aishwariya', rating: 5, comment: 'Street Bites India is unmissable every year. The Kolkata egg roll stall was absolute perfection.', timestamp: 'July 14, 2026' },
  { id: 'fb5', eventId: 'dance-1', username: 'Arun', rating: 5, comment: "I stepped on every partner's toes and laughed through all of it. Perfect night out in the city.", timestamp: 'July 10, 2026' },
  { id: 'fb6', eventId: 'mudpot-1', username: 'Arjun N.', rating: 5, comment: 'The village artisans at Janapada Loka are the kindest teachers. My terracotta pot has pride of place on my shelf.', timestamp: 'July 18, 2026' },
]

// ── QR Code SVG (deterministic, visual) ──────────────────────────────────────

function QRCodeSVG({ value, size = 160 }: { value: string; size?: number }) {
  const N = 25

  let seed = 0
  for (let i = 0; i < value.length; i++) {
    seed = (Math.imul(31, seed) + value.charCodeAt(i)) | 0
  }
  seed = Math.abs(seed) || 1

  let s = seed
  const rand = () => {
    s = (Math.imul(1664525, s) + 1013904223) >>> 0
    return s / 0xffffffff
  }

  const finderCell = (r: number, c: number): boolean => {
    if (r === 0 || r === 6 || c === 0 || c === 6) return true
    if (r >= 2 && r <= 4 && c >= 2 && c <= 4) return true
    return false
  }

  const cells = Array.from({ length: N }, (_, r) =>
    Array.from({ length: N }, (_, c): boolean => {
      if (r < 7 && c < 7) return finderCell(r, c)
      if (r < 7 && c >= N - 7) return finderCell(r, c - (N - 7))
      if (r >= N - 7 && c < 7) return finderCell(r - (N - 7), c)
      if (r === 6 || c === 6) return (r + c) % 2 === 0
      return rand() > 0.42
    })
  )

  return (
    <svg width={size} height={size} viewBox={`0 0 ${N} ${N}`} style={{ display: 'block' }}>
      <rect width={N} height={N} fill="white" />
      {cells.flatMap((row, r) =>
        row.flatMap((filled, c) =>
          filled
            ? [<rect key={`${r}-${c}`} x={c} y={r} width={1} height={1} fill="#1B2B4E" />]
            : []
        )
      )}
    </svg>
  )
}

// ── Star Rating ───────────────────────────────────────────────────────────────

function StarRating({ value, onChange, readonly = false }: { value: number; onChange?: (v: number) => void; readonly?: boolean }) {
  const [hover, setHover] = useState(0)
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => !readonly && onChange?.(star)}
          onMouseEnter={() => !readonly && setHover(star)}
          onMouseLeave={() => !readonly && setHover(0)}
          style={{
            background: 'none', border: 'none',
            cursor: readonly ? 'default' : 'pointer',
            fontSize: readonly ? 16 : 22, padding: 0,
            color: (hover || value) >= star ? '#F5A623' : '#D1D5DB',
            transition: 'color 0.15s',
            lineHeight: 1,
          }}
        >
          ★
        </button>
      ))}
    </div>
  )
}

// ── Seats Progress Bar ────────────────────────────────────────────────────────

function SeatsBar({ seats, booked, color }: { seats: number; booked: number; color: string }) {
  const pct = Math.round((booked / seats) * 100)
  const remaining = seats - booked
  return (
    <div>
      <div style={{ height: 6, background: '#E5E7EB', borderRadius: 99, overflow: 'hidden', marginBottom: 4 }}>
        <div style={{
          width: `${pct}%`, height: '100%',
          background: pct >= 90 ? '#EF4444' : pct >= 70 ? '#F59E0B' : color,
          borderRadius: 99, transition: 'width 0.4s',
        }} />
      </div>
      <div style={{ fontSize: 12, color: pct >= 90 ? '#EF4444' : '#6B7280', fontWeight: pct >= 90 ? 600 : 400 }}>
        {remaining === 0 ? '🚫 Sold Out' : `${remaining} seat${remaining === 1 ? '' : 's'} left of ${seats}`}
      </div>
    </div>
  )
}

// ── Modal Overlay ─────────────────────────────────────────────────────────────

function Overlay({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(10,15,30,0.72)',
        backdropFilter: 'blur(6px)',
        zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem', overflowY: 'auto',
      }}
    >
      <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: 540 }}>
        {children}
      </div>
    </div>
  )
}

// ── Input Helper ──────────────────────────────────────────────────────────────

function Field({ label, type = 'text', placeholder, value, onChange }: {
  label: string; type?: string; placeholder: string; value: string;
  onChange: (v: string) => void
}) {
  const [focused, setFocused] = useState(false)
  return (
    <div>
      <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6, display: 'block' }}>{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: '100%', padding: '12px 14px', borderRadius: 10,
          border: `1.5px solid ${focused ? '#C84B31' : '#E5E7EB'}`,
          fontSize: 15, outline: 'none', fontFamily: 'inherit',
          background: '#FAFAFA', boxSizing: 'border-box',
          transition: 'border-color 0.2s', color: '#1B2B4E',
        }}
      />
    </div>
  )
}

// ── Auth Modal ────────────────────────────────────────────────────────────────

function AuthModal({
  mode, onToggleMode, onClose, onSuccess, users, onRegister,
}: {
  mode: 'login' | 'register'
  onToggleMode: () => void
  onClose: () => void
  onSuccess: (user: UserAccount) => void
  users: Map<string, UserAccount>
  onRegister: (user: UserAccount) => void
}) {
  const [identifier, setIdentifier] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = () => {
    setError('')
    if (!identifier || !password) { setError('Please fill in all fields.'); return }
    const user = [...users.values()].find(
      (u) =>
        (u.email === identifier || u.phone === identifier || u.username === identifier) &&
        u.password === password
    )
    if (!user) { setError('Invalid credentials. Check your username / email / phone and password.'); return }
    setLoading(true)
    setTimeout(() => { setLoading(false); onSuccess(user) }, 700)
  }

  const handleRegister = () => {
    setError('')
    if (!username || !email || !phone || !password || !confirm) { setError('All fields are required.'); return }
    if (password !== confirm) { setError('Passwords do not match.'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return }
    if (!/\S+@\S+\.\S+/.test(email)) { setError('Please enter a valid email address.'); return }
    if (!/^\+?[\d\s\-]{10,}$/.test(phone)) { setError('Please enter a valid phone number.'); return }
    const exists = [...users.values()].find((u) => u.email === email || u.phone === phone)
    if (exists) { setError('An account with this email or phone number already exists.'); return }
    setLoading(true)
    setTimeout(() => {
      const newUser: UserAccount = {
        id: `user-${Date.now()}`,
        username, email, phone, password,
      }
      onRegister(newUser)
      setLoading(false)
      onSuccess(newUser)
    }, 900)
  }

  return (
    <div style={{ background: 'white', borderRadius: 20, padding: '2rem', boxShadow: '0 30px 80px rgba(0,0,0,0.25)' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <div style={{
          width: 60, height: 60, background: mode === 'login' ? '#EFF6FF' : '#FEF2EE',
          borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 1rem', fontSize: 26,
        }}>
          {mode === 'login' ? '🔑' : '✨'}
        </div>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700, color: '#1B2B4E', margin: '0 0 6px' }}>
          {mode === 'login' ? 'Welcome Back' : 'Create Your Account'}
        </h2>
        <p style={{ fontSize: 14, color: '#6B7280', margin: 0 }}>
          {mode === 'login'
            ? 'Sign in to book events and access your tickets'
            : 'Join thousands of event-goers across Bengaluru'}
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
        {mode === 'login' ? (
          <>
            <Field label="Username / Email / Phone" placeholder="Enter your username, email, or phone" value={identifier} onChange={setIdentifier} />
            <Field label="Password" type="password" placeholder="Enter your password" value={password} onChange={setPassword} />
          </>
        ) : (
          <>
            <Field label="Username" placeholder="Choose a username" value={username} onChange={setUsername} />
            <Field label="Email Address" type="email" placeholder="your@email.com" value={email} onChange={setEmail} />
            <Field label="Phone Number" type="tel" placeholder="+91 98765 43210" value={phone} onChange={setPhone} />
            <Field label="Password" type="password" placeholder="Minimum 6 characters" value={password} onChange={setPassword} />
            <Field label="Confirm Password" type="password" placeholder="Re-enter your password" value={confirm} onChange={setConfirm} />
          </>
        )}

        {error && (
          <div style={{
            background: '#FEF2F2', border: '1px solid #FECACA',
            borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#DC2626',
          }}>
            ⚠️ {error}
          </div>
        )}

        <button
          onClick={mode === 'login' ? handleLogin : handleRegister}
          disabled={loading}
          style={{
            background: loading ? '#9CA3AF' : 'linear-gradient(135deg, #C84B31 0%, #E05B3A 100%)',
            color: 'white', border: 'none', borderRadius: 12,
            padding: '14px', fontSize: 15, fontWeight: 700,
            cursor: loading ? 'default' : 'pointer', fontFamily: 'inherit',
            transition: 'opacity 0.2s', marginTop: 4, letterSpacing: '0.3px',
          }}
        >
          {loading ? '⏳ Please wait…' : mode === 'login' ? '🚀 Sign In' : '🎉 Create Account & Book'}
        </button>

        <div style={{ textAlign: 'center', fontSize: 14, color: '#6B7280' }}>
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={onToggleMode}
            style={{
              color: '#C84B31', fontWeight: 700, background: 'none',
              border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14,
            }}
          >
            {mode === 'login' ? 'Sign up free' : 'Sign in'}
          </button>
        </div>

        <button
          onClick={onClose}
          style={{
            background: 'none', border: 'none', color: '#9CA3AF',
            fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          Cancel
        </button>
      </div>

      {/* Trust signals */}
      <div style={{
        marginTop: '1.25rem', padding: '10px 14px', background: '#F9F7F3',
        borderRadius: 10, display: 'flex', justifyContent: 'center', gap: '1.5rem',
        flexWrap: 'wrap',
      }}>
        {['🔒 Secure', '✅ Verified', '🛡️ Safe'].map((item) => (
          <span key={item} style={{ fontSize: 12, color: '#6B7280', fontWeight: 500 }}>{item}</span>
        ))}
      </div>
    </div>
  )
}

// ── Event Detail Modal ────────────────────────────────────────────────────────

function EventDetailModal({
  event, category, onClose, onBook, user, userTotalTickets, userBookings,
}: {
  event: EventData
  category: Category
  onClose: () => void
  onBook: (event: EventData, count: number) => void
  user: UserAccount | null
  userTotalTickets: number
  userBookings: Booking[]
}) {
  const [count, setCount] = useState(1)
  const remaining = event.seats - event.seatsBooked
  const alreadyBooked = userBookings
    .filter((b) => b.eventId === event.id)
    .reduce((sum, b) => sum + b.count, 0)
  const maxCanBook = Math.min(remaining, 5 - userTotalTickets)

  const detailItems = [
    { icon: '📅', label: 'Date & Time', value: event.date },
    { icon: '📍', label: 'Location', value: event.location },
    { icon: '👤', label: 'Hosted by', value: event.hostedBy },
    { icon: '⏱️', label: 'Duration', value: event.duration },
    { icon: '👥', label: 'Age Category', value: event.ageCategory },
    { icon: '🪑', label: 'Seats Available', value: `${remaining} of ${event.seats}` },
  ]

  return (
    <div style={{ background: 'white', borderRadius: 20, overflow: 'hidden', boxShadow: '0 30px 80px rgba(0,0,0,0.28)' }}>
      {/* Image Header */}
      <div style={{ position: 'relative', height: 230 }}>
        <img src={event.image} alt={event.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 55%)' }} />
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 14, right: 14,
            background: 'rgba(255,255,255,0.9)', border: 'none',
            borderRadius: '50%', width: 38, height: 38,
            cursor: 'pointer', fontSize: 20, lineHeight: 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 400, color: '#1B2B4E',
          }}
        >
          ×
        </button>
        <div style={{ position: 'absolute', bottom: 14, left: 16 }}>
          <span style={{ background: category.color, color: 'white', borderRadius: 99, padding: '4px 12px', fontSize: 12, fontWeight: 700 }}>
            {category.emoji} {category.label}
          </span>
        </div>
        <div style={{ position: 'absolute', bottom: 14, right: 16 }}>
          <span style={{ background: 'rgba(255,255,255,0.96)', color: '#1B2B4E', borderRadius: 99, padding: '5px 14px', fontSize: 16, fontWeight: 800 }}>
            {event.price}
          </span>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '1.5rem', maxHeight: '60vh', overflowY: 'auto' }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: '#1B2B4E', margin: '0 0 8px', lineHeight: 1.25 }}>
          {event.title}
        </h2>
        <p style={{ color: '#4B5563', fontSize: 14, lineHeight: 1.65, margin: '0 0 1.25rem' }}>{event.fullDescription}</p>

        {/* Detail Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem', marginBottom: '1.25rem' }}>
          {detailItems.map(({ icon, label, value }) => (
            <div key={label} style={{ background: '#F9F7F3', borderRadius: 10, padding: '10px 12px' }}>
              <div style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {icon} {label}
              </div>
              <div style={{ fontSize: 13, color: '#1B2B4E', fontWeight: 600, marginTop: 3 }}>{value}</div>
            </div>
          ))}
        </div>

        {/* Tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: '1.25rem' }}>
          {event.tags.map((tag) => (
            <span
              key={tag}
              style={{
                background: category.bgColor, color: category.color,
                borderRadius: 99, padding: '4px 12px', fontSize: 12, fontWeight: 600,
              }}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Seats */}
        <div style={{ marginBottom: '1.25rem' }}>
          <SeatsBar seats={event.seats} booked={event.seatsBooked} color={category.color} />
        </div>

        {/* Already booked notice */}
        {user && alreadyBooked > 0 && (
          <div style={{
            background: '#ECFDF5', border: '1px solid #BBF7D0', borderRadius: 10,
            padding: '10px 14px', fontSize: 13, color: '#059669', marginBottom: '1rem', fontWeight: 500,
          }}>
            ✅ You have already booked {alreadyBooked} ticket{alreadyBooked > 1 ? 's' : ''} for this event.
          </div>
        )}

        {/* Max tickets notice */}
        {user && userTotalTickets >= 5 ? (
          <div style={{
            background: '#FEF2F2', border: '1px solid #FECACA',
            borderRadius: 10, padding: '12px 14px', fontSize: 13, color: '#DC2626', textAlign: 'center',
          }}>
            ⚠️ You've reached your 5-ticket limit. Each account can book up to 5 tickets total.
          </div>
        ) : remaining === 0 ? (
          <div style={{
            background: '#F3F4F6', borderRadius: 12, padding: '14px',
            fontSize: 15, fontWeight: 700, color: '#9CA3AF', textAlign: 'center',
          }}>
            🚫 This event is Sold Out
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              {user && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: '#F3F4F6', borderRadius: 12, padding: '8px 12px',
                  flexShrink: 0,
                }}>
                  <button
                    onClick={() => setCount((c) => Math.max(1, c - 1))}
                    style={{
                      width: 30, height: 30, border: 'none', background: 'white',
                      borderRadius: 8, cursor: 'pointer', fontSize: 18, fontWeight: 700,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#1B2B4E', lineHeight: 1,
                    }}
                  >
                    −
                  </button>
                  <span style={{ fontSize: 16, fontWeight: 700, color: '#1B2B4E', minWidth: 20, textAlign: 'center' }}>{count}</span>
                  <button
                    onClick={() => setCount((c) => Math.min(maxCanBook, c + 1))}
                    disabled={count >= maxCanBook}
                    style={{
                      width: 30, height: 30, border: 'none',
                      background: count >= maxCanBook ? '#E5E7EB' : 'white',
                      borderRadius: 8, cursor: count >= maxCanBook ? 'default' : 'pointer',
                      fontSize: 18, fontWeight: 700,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: count >= maxCanBook ? '#9CA3AF' : '#1B2B4E', lineHeight: 1,
                    }}
                  >
                    +
                  </button>
                </div>
              )}
              <button
                onClick={() => onBook(event, count)}
                style={{
                  flex: 1,
                  background: 'linear-gradient(135deg, #C84B31 0%, #E05B3A 100%)',
                  color: 'white', border: 'none', borderRadius: 12,
                  padding: '14px', fontSize: 15, fontWeight: 700,
                  cursor: 'pointer', fontFamily: 'inherit', transition: 'opacity 0.2s',
                }}
              >
                {user
                  ? `🎟️ Book ${count} Ticket${count > 1 ? 's' : ''} · ${event.price}`
                  : '🔑 Sign In to Book'}
              </button>
            </div>
            {user && maxCanBook > 0 && (
              <p style={{ fontSize: 11, color: '#9CA3AF', textAlign: 'center', margin: '8px 0 0' }}>
                You can book up to {maxCanBook} more ticket{maxCanBook > 1 ? 's' : ''} · 5 tickets max per account
              </p>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// ── QR Ticket Modal ───────────────────────────────────────────────────────────

function QRTicketModal({ bookings, events, onClose }: {
  bookings: Booking[]
  events: EventData[]
  onClose: () => void
}) {
  const [idx, setIdx] = useState(0)

  const tickets = bookings.flatMap((b) => {
    const ev = events.find((e) => e.id === b.eventId)
    return Array.from({ length: b.count }, (_, i) => ({
      booking: b, ev,
      num: i + 1,
      qrVal: `GATHERUP|${b.id}|${b.eventId}|${b.holderName}|T${i + 1}of${b.count}|${b.eventDate}`,
    }))
  })

  const t = tickets[idx]
  if (!t) return null

  return (
    <div style={{ background: 'white', borderRadius: 20, overflow: 'hidden', boxShadow: '0 30px 80px rgba(0,0,0,0.3)', maxWidth: 380, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #1B2B4E 0%, #2D4080 100%)', padding: '1.5rem', color: 'white', textAlign: 'center', position: 'relative' }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 14, right: 14,
            background: 'rgba(255,255,255,0.15)', border: 'none',
            borderRadius: '50%', width: 34, height: 34,
            cursor: 'pointer', color: 'white', fontSize: 18, lineHeight: 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          ×
        </button>
        <div style={{ fontSize: 32, marginBottom: 6 }}>🎟️</div>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, marginBottom: 2 }}>Booking Confirmed!</div>
        <div style={{ fontSize: 13, opacity: 0.7 }}>Your ticket is ready</div>
        <div style={{ marginTop: 10, background: 'rgba(245,166,35,0.2)', border: '1px solid rgba(245,166,35,0.4)', borderRadius: 99, padding: '4px 16px', display: 'inline-block', fontSize: 13, color: '#F5A623', fontWeight: 600 }}>
          ✅ Payment Successful
        </div>
      </div>

      {/* Ticket Body */}
      <div style={{ padding: '1.5rem' }}>
        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: '#1B2B4E', margin: '0 0 8px', lineHeight: 1.3 }}>
          {t.ev?.title}
        </h3>
        <div style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.8, marginBottom: '1.25rem' }}>
          <div>📅 {t.ev?.date}</div>
          <div>📍 {t.ev?.location}</div>
          <div>👤 {t.booking.holderName}</div>
          <div>⏱️ {t.ev?.duration}</div>
        </div>

        {/* Perforated Divider */}
        <div style={{ position: 'relative', margin: '0 -1.5rem 1.25rem', borderTop: '2px dashed #E5E7EB' }}>
          <div style={{ position: 'absolute', top: -10, left: 0, width: 20, height: 20, borderRadius: '50%', background: '#F9F5EE', border: '2px dashed #E5E7EB' }} />
          <div style={{ position: 'absolute', top: -10, right: 0, width: 20, height: 20, borderRadius: '50%', background: '#F9F5EE', border: '2px dashed #E5E7EB' }} />
        </div>

        {/* QR Code */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.875rem' }}>
          <div style={{
            padding: 14, background: 'white', borderRadius: 14,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)', border: '1px solid #F3F4F6',
          }}>
            <QRCodeSVG value={t.qrVal} size={160} />
          </div>
          <div style={{ fontSize: 11, color: '#9CA3AF', letterSpacing: '1.5px', fontFamily: 'monospace', fontWeight: 600 }}>
            {t.booking.id}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ background: '#EFF6FF', color: '#1D4ED8', borderRadius: 8, padding: '5px 14px', fontSize: 13, fontWeight: 600 }}>
              Ticket {t.num} of {t.booking.count}
            </div>
            <div style={{ background: '#ECFDF5', color: '#059669', borderRadius: 8, padding: '5px 14px', fontSize: 13, fontWeight: 600 }}>
              ✓ Valid
            </div>
          </div>
        </div>

        {/* Multi-ticket navigation */}
        {tickets.length > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, marginTop: '1.25rem' }}>
            <button
              onClick={() => setIdx((i) => Math.max(0, i - 1))}
              disabled={idx === 0}
              style={{
                background: idx === 0 ? '#F3F4F6' : '#1B2B4E',
                color: idx === 0 ? '#9CA3AF' : 'white',
                border: 'none', borderRadius: 10, width: 38, height: 38,
                cursor: idx === 0 ? 'default' : 'pointer', fontSize: 18,
              }}
            >
              ‹
            </button>
            <span style={{ fontSize: 13, color: '#6B7280' }}>{idx + 1} / {tickets.length} tickets</span>
            <button
              onClick={() => setIdx((i) => Math.min(tickets.length - 1, i + 1))}
              disabled={idx === tickets.length - 1}
              style={{
                background: idx === tickets.length - 1 ? '#F3F4F6' : '#1B2B4E',
                color: idx === tickets.length - 1 ? '#9CA3AF' : 'white',
                border: 'none', borderRadius: 10, width: 38, height: 38,
                cursor: idx === tickets.length - 1 ? 'default' : 'pointer', fontSize: 18,
              }}
            >
              ›
            </button>
          </div>
        )}
      </div>

      <div style={{ background: '#F9F5EE', padding: '1rem 1.5rem', textAlign: 'center', fontSize: 12, color: '#9CA3AF' }}>
        Present this QR at the venue entrance · GatherUp Meetups
      </div>
    </div>
  )
}

// ── Event Card ────────────────────────────────────────────────────────────────

function EventCard({ event, category, onClick }: {
  event: EventData; category: Category; onClick: () => void
}) {
  const [hovered, setHovered] = useState(false)
  const remaining = event.seats - event.seatsBooked
  const pct = Math.round((event.seatsBooked / event.seats) * 100)

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'white', borderRadius: 16, overflow: 'hidden',
        cursor: 'pointer',
        boxShadow: hovered ? '0 16px 48px rgba(0,0,0,0.14)' : '0 2px 14px rgba(0,0,0,0.07)',
        transform: hovered ? 'translateY(-5px)' : 'translateY(0)',
        transition: 'all 0.25s ease',
        border: '1px solid #F3F4F6',
      }}
    >
      <div style={{ position: 'relative', height: 188, background: category.bgColor, overflow: 'hidden' }}>
        <img
          src={event.image}
          alt={event.title}
          style={{
            width: '100%', height: '100%', objectFit: 'cover', display: 'block',
            transform: hovered ? 'scale(1.06)' : 'scale(1)',
            transition: 'transform 0.35s ease',
          }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 55%)' }} />
        <div style={{ position: 'absolute', top: 10, left: 10 }}>
          <span style={{ background: category.color, color: 'white', borderRadius: 99, padding: '3px 10px', fontSize: 11, fontWeight: 700 }}>
            {category.emoji} {category.label}
          </span>
        </div>
        <div style={{ position: 'absolute', top: 10, right: 10 }}>
          <span style={{ background: 'rgba(255,255,255,0.95)', color: '#1B2B4E', borderRadius: 99, padding: '3px 10px', fontSize: 12, fontWeight: 700 }}>
            {event.price}
          </span>
        </div>
        {pct >= 88 && remaining > 0 && (
          <div style={{ position: 'absolute', bottom: 10, right: 10 }}>
            <span style={{ background: '#EF4444', color: 'white', borderRadius: 99, padding: '3px 10px', fontSize: 11, fontWeight: 700 }}>
              🔥 Almost Full
            </span>
          </div>
        )}
        {remaining === 0 && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ background: 'white', color: '#1B2B4E', borderRadius: 99, padding: '6px 18px', fontSize: 13, fontWeight: 800 }}>🚫 Sold Out</span>
          </div>
        )}
      </div>

      <div style={{ padding: '1rem' }}>
        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 700, color: '#1B2B4E', margin: '0 0 6px', lineHeight: 1.3 }}>
          {event.title}
        </h3>
        <p style={{
          fontSize: 13, color: '#6B7280', margin: '0 0 10px', lineHeight: 1.55,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {event.description}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 10 }}>
          {[
            { icon: '📅', text: event.date },
            { icon: '📍', text: event.location.split(',')[0] },
            { icon: '👥', text: `Age: ${event.ageCategory} · ${event.duration}` },
          ].map(({ icon, text }) => (
            <div key={text} style={{ fontSize: 12, color: '#4B5563', display: 'flex', alignItems: 'center', gap: 5 }}>
              <span>{icon}</span> {text}
            </div>
          ))}
        </div>

        <SeatsBar seats={event.seats} booked={event.seatsBooked} color={category.color} />

        <button
          onClick={(e) => { e.stopPropagation(); onClick() }}
          style={{
            marginTop: 12, width: '100%',
            background: remaining === 0
              ? '#E5E7EB'
              : `linear-gradient(135deg, ${category.color}ee, ${category.color})`,
            color: remaining === 0 ? '#9CA3AF' : 'white',
            border: 'none', borderRadius: 10,
            padding: '10px', fontSize: 13, fontWeight: 700,
            cursor: remaining === 0 ? 'default' : 'pointer',
            fontFamily: 'inherit', transition: 'opacity 0.2s',
          }}
        >
          {remaining === 0 ? '🚫 Sold Out' : '🎟️ View & Book'}
        </button>
      </div>
    </div>
  )
}

// ── Feedback Section ──────────────────────────────────────────────────────────

function FeedbackSection({ feedbacks, events, user, onSubmit }: {
  feedbacks: Feedback[]
  events: EventData[]
  user: UserAccount | null
  onSubmit: (fb: Omit<Feedback, 'id'>) => void
}) {
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [selectedEv, setSelectedEv] = useState(events[0]?.id || '')
  const [submitted, setSubmitted] = useState(false)
  const [focusedArea, setFocusedArea] = useState(false)

  const handleSubmit = () => {
    if (!comment.trim()) return
    onSubmit({
      eventId: selectedEv,
      username: user!.username,
      rating, comment: comment.trim(),
      timestamp: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
    })
    setComment('')
    setRating(5)
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 3500)
  }

  const avgRating = feedbacks.length > 0
    ? (feedbacks.reduce((s, f) => s + f.rating, 0) / feedbacks.length).toFixed(1)
    : '5.0'

  return (
    <section style={{ background: '#F9F5EE', padding: '4rem 0' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span style={{ background: '#C84B31', color: 'white', borderRadius: 99, padding: '4px 14px', fontSize: 12, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>
            Community Reviews
          </span>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 700, color: '#1B2B4E', margin: '12px 0 6px' }}>
            What people are saying
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 6 }}>
            <StarRating value={5} readonly />
            <span style={{ fontWeight: 700, color: '#1B2B4E', fontSize: 18 }}>{avgRating}</span>
            <span style={{ color: '#6B7280', fontSize: 14 }}>· {feedbacks.length} reviews</span>
          </div>
          <p style={{ color: '#6B7280', fontSize: 16 }}>Real experiences from our community of event-goers</p>
        </div>

        {/* Reviews grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem', marginBottom: '3rem' }}>
          {feedbacks.slice(0, 6).map((fb) => {
            const ev = events.find((e) => e.id === fb.eventId)
            const colors = ['#C84B31', '#7C3AED', '#D97706', '#92400E', '#1D4ED8', '#059669']
            const colorIdx = fb.username.charCodeAt(0) % colors.length
            return (
              <div key={fb.id} style={{
                background: 'white', borderRadius: 16, padding: '1.25rem',
                boxShadow: '0 2px 14px rgba(0,0,0,0.06)', border: '1px solid #F3F4F6',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 42, height: 42, borderRadius: '50%',
                      background: `linear-gradient(135deg, ${colors[colorIdx]}, ${colors[(colorIdx + 2) % colors.length]})`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white', fontWeight: 700, fontSize: 16, flexShrink: 0,
                    }}>
                      {fb.username[0]}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: '#1B2B4E', fontSize: 14 }}>{fb.username}</div>
                      <div style={{ fontSize: 11, color: '#9CA3AF' }}>{fb.timestamp}</div>
                    </div>
                  </div>
                  <StarRating value={fb.rating} readonly />
                </div>
                {ev && (
                  <div style={{ fontSize: 11, color: '#C84B31', fontWeight: 600, marginBottom: 6 }}>
                    🎪 {ev.title}
                  </div>
                )}
                <p style={{ fontSize: 14, color: '#4B5563', lineHeight: 1.65, margin: 0 }}>
                  "{fb.comment}"
                </p>
              </div>
            )
          })}
        </div>

        {/* Leave a review */}
        <div style={{
          background: 'white', borderRadius: 20, padding: '2rem',
          boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
          maxWidth: 560, margin: '0 auto',
          border: '1px solid #F3F4F6',
        }}>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: '#1B2B4E', margin: '0 0 1.25rem' }}>
            ⭐ Share Your Experience
          </h3>
          {!user ? (
            <p style={{ color: '#6B7280', fontSize: 14, lineHeight: 1.6 }}>
              Please sign in to share your review and help others discover great events.
            </p>
          ) : submitted ? (
            <div style={{ textAlign: 'center', padding: '1.5rem 1rem', color: '#059669' }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>🎉</div>
              <div style={{ fontSize: 16, fontWeight: 700 }}>Thank you for your review!</div>
              <div style={{ fontSize: 14, marginTop: 4 }}>Your feedback helps the community.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6, display: 'block' }}>Event</label>
                <select
                  value={selectedEv}
                  onChange={(e) => setSelectedEv(e.target.value)}
                  style={{
                    width: '100%', padding: '10px 12px', borderRadius: 10,
                    border: '1.5px solid #E5E7EB', fontSize: 14, fontFamily: 'inherit',
                    background: 'white', color: '#1B2B4E', outline: 'none',
                  }}
                >
                  {events.map((ev) => <option key={ev.id} value={ev.id}>{ev.title}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8, display: 'block' }}>Your Rating</label>
                <StarRating value={rating} onChange={setRating} />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6, display: 'block' }}>Your Review</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  onFocus={() => setFocusedArea(true)}
                  onBlur={() => setFocusedArea(false)}
                  placeholder="Tell others what made this event special…"
                  rows={3}
                  style={{
                    width: '100%', padding: '10px 12px', borderRadius: 10,
                    border: `1.5px solid ${focusedArea ? '#C84B31' : '#E5E7EB'}`,
                    fontSize: 14, fontFamily: 'inherit', resize: 'vertical',
                    boxSizing: 'border-box', outline: 'none', color: '#1B2B4E',
                    transition: 'border-color 0.2s',
                  }}
                />
              </div>
              <button
                onClick={handleSubmit}
                style={{
                  background: 'linear-gradient(135deg, #C84B31, #E05B3A)',
                  color: 'white', border: 'none', borderRadius: 10,
                  padding: '12px', fontSize: 14, fontWeight: 700,
                  cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                ⭐ Submit Review
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

// ── Main App ──────────────────────────────────────────────────────────────────

export default function App() {
  const [selectedCategory, setSelectedCategory] = useState('art')
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null)
  const [showAuth, setShowAuth] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [user, setUser] = useState<UserAccount | null>(null)
  const [users, setUsers] = useState<Map<string, UserAccount>>(new Map())
  const [bookings, setBookings] = useState<Booking[]>([])
  const [showQR, setShowQR] = useState(false)
  const [latestBookings, setLatestBookings] = useState<Booking[]>([])
  const [pendingBook, setPendingBook] = useState<{ event: EventData; count: number } | null>(null)
  const [feedbacks, setFeedbacks] = useState<Feedback[]>(INITIAL_FEEDBACKS)
  const [events, setEvents] = useState<EventData[]>(ALL_EVENTS)

  const category = CATEGORIES.find((c) => c.id === selectedCategory)!
  const filteredEvents = events.filter((e) => e.categoryId === selectedCategory)

  const userTotalTickets = user
    ? bookings.filter((b) => b.userId === user.id).reduce((sum, b) => sum + b.count, 0)
    : 0
  const userBookings = user ? bookings.filter((b) => b.userId === user.id) : []

  const completeBooking = (ev: EventData, count: number, bookUser: UserAccount) => {
    const totalAlready = bookings
      .filter((b) => b.userId === bookUser.id)
      .reduce((sum, b) => sum + b.count, 0)
    const actualCount = Math.min(count, 5 - totalAlready, ev.seats - ev.seatsBooked)
    if (actualCount <= 0) return

    const newBooking: Booking = {
      id: `BK-${Date.now().toString(36).toUpperCase()}`,
      eventId: ev.id,
      eventTitle: ev.title,
      eventDate: ev.date,
      eventLocation: ev.location,
      userId: bookUser.id,
      holderName: bookUser.username,
      count: actualCount,
      bookedAt: new Date().toISOString(),
    }
    setBookings((prev) => [...prev, newBooking])
    setEvents((prev) =>
      prev.map((e) =>
        e.id === ev.id ? { ...e, seatsBooked: e.seatsBooked + actualCount } : e
      )
    )
    setLatestBookings([newBooking])
    setSelectedEvent(null)
    setShowQR(true)
  }

  const handleBookAttempt = (ev: EventData, count: number) => {
    if (!user) {
      setPendingBook({ event: ev, count })
      setShowAuth(true)
      setAuthMode('login')
      return
    }
    completeBooking(ev, count, user)
  }

  const handleAuthSuccess = (loggedUser: UserAccount) => {
    setUser(loggedUser)
    setShowAuth(false)
    if (pendingBook) {
      const { event: ev, count } = pendingBook
      setPendingBook(null)
      completeBooking(ev, count, loggedUser)
    }
  }

  const handleRegister = (newUser: UserAccount) => {
    setUsers((prev) => new Map(prev).set(newUser.id, newUser))
  }

  const addFeedback = (fb: Omit<Feedback, 'id'>) => {
    setFeedbacks((prev) => [{ ...fb, id: `fb-${Date.now()}` }, ...prev])
  }

  const navLinkStyle: CSSProperties = {
    color: 'rgba(255,255,255,0.72)', fontSize: 14, fontWeight: 500,
    textDecoration: 'none', transition: 'color 0.2s',
  }

  return (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: '#F9F5EE', minHeight: '100vh', color: '#1B2B4E' }}>

      {/* ── Header / Nav ── */}
      <header style={{
        background: '#1B2B4E', position: 'sticky', top: 0, zIndex: 200,
        boxShadow: '0 2px 24px rgba(0,0,0,0.22)',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 66 }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 38, height: 38, flexShrink: 0,
              background: 'linear-gradient(135deg, #C84B31, #F5A623)',
              borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
            }}>
              🎪
            </div>
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 23, fontWeight: 900, color: 'white', letterSpacing: '-0.5px' }}>
              Hapenly.in
            </span>
          </div>

          {/* Nav */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <a href="#events" style={navLinkStyle}>Explore</a>
            <a href="#feedback" style={navLinkStyle}>Reviews</a>

            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                  background: 'linear-gradient(135deg, #C84B31, #F5A623)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontWeight: 800, fontSize: 14,
                }}>
                  {user.username[0].toUpperCase()}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ color: 'white', fontSize: 13, fontWeight: 600, lineHeight: 1 }}>{user.username}</span>
                  <span style={{ color: '#F5A623', fontSize: 11, fontWeight: 600 }}>{userTotalTickets}/5 tickets used</span>
                </div>
                <button
                  onClick={() => setUser(null)}
                  style={{
                    color: 'rgba(255,255,255,0.45)', fontSize: 12, background: 'none',
                    border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8, padding: '4px 10px',
                    cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >
                  Sign out
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => { setShowAuth(true); setAuthMode('login') }}
                  style={{
                    color: 'rgba(255,255,255,0.82)', fontSize: 14, fontWeight: 600,
                    background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: 10, padding: '8px 16px', cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >
                  Sign In
                </button>
                <button
                  onClick={() => { setShowAuth(true); setAuthMode('register') }}
                  style={{
                    background: 'linear-gradient(135deg, #C84B31, #E05B3A)', color: 'white',
                    border: 'none', borderRadius: 10, padding: '8px 18px',
                    fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >
                  Join Free
                </button>
              </div>
            )}
          </nav>
        </div>
      </header>

      {/* ── Hero ── */}
      <section style={{ position: 'relative', minHeight: 520, background: '#1B2B4E', overflow: 'hidden' }}>
        <img
          src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1600&h=700&fit=crop&auto=format"
          alt="People gathered at a live event"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.28 }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(130deg, rgba(27,43,78,0.97) 45%, rgba(200,75,49,0.25) 100%)' }} />

        <div style={{ position: 'relative', maxWidth: 1200, margin: '0 auto', padding: '5rem 1.5rem 4rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(245,166,35,0.12)', border: '1px solid rgba(245,166,35,0.3)', borderRadius: 99, padding: '6px 16px', marginBottom: '1.25rem' }}>
              <span style={{ color: '#F5A623', fontSize: 11, fontWeight: 800, letterSpacing: '1.5px', textTransform: 'uppercase' }}>
                ✦ Chennai's #1 Meetup Platform
              </span>
            </div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(30px, 4.5vw, 52px)', fontWeight: 900, color: 'white', lineHeight: 1.14, margin: '0 0 1.125rem' }}>
              Don't Just Hear About It, <br />
              <em style={{ color: '#F5A623', fontStyle: 'italic' }}>Be There.</em>
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: 17, lineHeight: 1.7, margin: '0 0 2.25rem', maxWidth: 480 }}>
              Discover exclusive events, build meaningful connections, and create opportunities that last.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <a href="#events" style={{
                background: 'linear-gradient(135deg, #C84B31, #E05B3A)', color: 'white',
                borderRadius: 12, padding: '14px 28px', fontSize: 15, fontWeight: 700,
                textDecoration: 'none', display: 'inline-block', boxShadow: '0 8px 24px rgba(200,75,49,0.4)',
              }}>
                🎪 Browse Events
              </a>
              <button
                onClick={() => { setShowAuth(true); setAuthMode('register') }}
                style={{
                  background: 'rgba(255,255,255,0.08)', color: 'white',
                  border: '1.5px solid rgba(255,255,255,0.25)', borderRadius: 12,
                  padding: '14px 28px', fontSize: 15, fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'inherit', backdropFilter: 'blur(4px)',
                }}
              >
                ✨ Join Free
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {[
              { icon: '🎟️', val: '12,000+', label: 'Tickets Booked' },
              { icon: '🎪', val: '200+', label: 'Events Hosted' },
              { icon: '⭐', val: '4.9 / 5', label: 'Average Rating' },
              { icon: '🏙️', val: '6', label: 'Event Categories' },
            ].map(({ icon, val, label }) => (
              <div key={label} style={{
                background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.12)', borderRadius: 16,
                padding: '1.25rem', textAlign: 'center',
              }}>
                <div style={{ fontSize: 26, marginBottom: 6 }}>{icon}</div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: '#F5A623' }}>{val}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 3 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust Bar ── */}
      <div style={{ background: '#152240', borderTop: '1px solid rgba(255,255,255,0.07)', padding: '0.875rem 1.5rem' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '2rem' }}>
          {['🔒 Secure Payments', '✅ Verified Hosts', '📲 Instant QR Tickets', '↩️ Easy Refunds', '🛡️ Safe Community'].map((item) => (
            <span key={item} style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: 500 }}>{item}</span>
          ))}
        </div>
      </div>

      {/* ── Events Section ── */}
      <section id="events" style={{ maxWidth: 1200, margin: '0 auto', padding: '3.5rem 1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <span style={{ background: '#C84B31', color: 'white', borderRadius: 99, padding: '4px 14px', fontSize: 12, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>
            Explore by Category
          </span>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 700, color: '#1B2B4E', margin: '12px 0 6px' }}>
            What's happening near you
          </h2>
          <p style={{ color: '#6B7280', fontSize: 16, margin: 0 }}>Pick a category and find your perfect event in Bengaluru</p>
        </div>

        {/* Category Tabs */}
        <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.5rem', marginBottom: '1.75rem', scrollbarWidth: 'none' }}>
          {CATEGORIES.map((cat) => {
            const active = selectedCategory === cat.id
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                style={{
                  flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8,
                  background: active ? cat.color : 'white',
                  color: active ? 'white' : '#4B5563',
                  border: `2px solid ${active ? cat.color : '#E5E7EB'}`,
                  borderRadius: 12, padding: '10px 18px', fontSize: 14, fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s',
                  boxShadow: active ? `0 4px 18px ${cat.color}44` : '0 1px 4px rgba(0,0,0,0.06)',
                }}
              >
                <span style={{ fontSize: 18 }}>{cat.emoji}</span>
                {cat.label}
              </button>
            )
          })}
        </div>

        {/* Category Banner */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 14, marginBottom: '1.75rem',
          padding: '1rem 1.5rem', background: category.bgColor, borderRadius: 14,
          border: `1.5px solid ${category.color}22`,
        }}>
          <span style={{ fontSize: 36 }}>{category.emoji}</span>
          <div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: category.color }}>
              {category.label}
            </div>
            <div style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>
              {filteredEvents.length} events available · Book your spot today
            </div>
          </div>
          <div style={{ marginLeft: 'auto', fontSize: 13, color: category.color, fontWeight: 600 }}>
            {filteredEvents.reduce((sum, e) => sum + (e.seats - e.seatsBooked), 0)} total seats left
          </div>
        </div>

        {/* Events Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {filteredEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              category={category}
              onClick={() => setSelectedEvent(event)}
            />
          ))}
        </div>
      </section>

      {/* ── Why GatherUp ── */}
      <section style={{ background: 'white', padding: '4rem 0', borderTop: '1px solid #F3F4F6', borderBottom: '1px solid #F3F4F6' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 700, color: '#1B2B4E', margin: '0 0 8px' }}>
              Why trust GatherUp?
            </h2>
            <p style={{ color: '#6B7280', fontSize: 16, margin: 0 }}>Every event, every detail, every ticket — we have you covered.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: '1.5rem' }}>
            {[
              { icon: '🛡️', title: 'Verified Hosts', desc: 'Every host is background-checked and community-reviewed before listing on GatherUp.' },
              { icon: '📲', title: 'Instant QR Tickets', desc: 'Book in seconds. Your QR ticket appears in your account immediately after payment.' },
              { icon: '⭐', title: '4.9★ Avg Rating', desc: 'Over 12,000 attendees have rated their GatherUp experience at 4.9 stars.' },
              { icon: '↩️', title: 'Hassle-free Refunds', desc: 'Cancel up to 48 hours before any event for a complete, no-questions refund.' },
              { icon: '🏙️', title: 'Hyperlocal Curation', desc: 'Every event is hand-curated specifically for Bengaluru communities.' },
              { icon: '💬', title: 'Community Reviews', desc: 'Read authentic reviews from verified attendees before you commit.' },
            ].map(({ icon, title, desc }) => (
              <div key={title} style={{ textAlign: 'center', padding: '1.5rem 1rem' }}>
                <div style={{ fontSize: 38, marginBottom: 12 }}>{icon}</div>
                <div style={{ fontWeight: 700, color: '#1B2B4E', marginBottom: 8, fontSize: 15 }}>{title}</div>
                <div style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.65 }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Category Photo Strip ── */}
      <section style={{ padding: '3rem 0', background: '#F9F5EE' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1.5rem' }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: '#1B2B4E', margin: '0 0 1.5rem', textAlign: 'center' }}>
            A little taste of everything
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0.875rem' }}>
            {[
              { img: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&h=280&fit=crop&auto=format', cat: 'Art', emoji: '🎨' },
              { img: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=400&h=280&fit=crop&auto=format', cat: 'Dance', emoji: '💃' },
              { img: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=280&fit=crop&auto=format', cat: 'Food', emoji: '🍜' },
              { img: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&h=280&fit=crop&auto=format', cat: 'Mud Pot', emoji: '🏺' },
              { img: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400&h=280&fit=crop&auto=format', cat: 'Tech', emoji: '💻' },
              { img: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&h=280&fit=crop&auto=format', cat: 'Strangers', emoji: '🤝' },
            ].map(({ img, cat, emoji }) => (
              <div
                key={cat}
                onClick={() => {
                  const c = CATEGORIES.find((ca) => ca.label.toLowerCase().includes(cat.toLowerCase()) || ca.emoji === emoji)
                  if (c) { setSelectedCategory(c.id); document.getElementById('events')?.scrollIntoView({ behavior: 'smooth' }) }
                }}
                style={{
                  position: 'relative', borderRadius: 14, overflow: 'hidden',
                  aspectRatio: '1', cursor: 'pointer',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
                }}
              >
                <img src={img} alt={cat} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.3s' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent 50%)' }} />
                <div style={{ position: 'absolute', bottom: 8, left: 0, right: 0, textAlign: 'center' }}>
                  <div style={{ fontSize: 16 }}>{emoji}</div>
                  <div style={{ color: 'white', fontSize: 11, fontWeight: 700 }}>{cat}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Feedback ── */}
      <div id="feedback">
        <FeedbackSection
          feedbacks={feedbacks}
          events={events}
          user={user}
          onSubmit={addFeedback}
        />
      </div>

      {/* ── Footer ── */}
      <footer style={{ background: '#1B2B4E', color: 'rgba(255,255,255,0.65)', padding: '3.5rem 0 1.5rem' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '2.5rem', marginBottom: '2.5rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <span style={{ fontSize: 22 }}>🎪</span>
                <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 21, fontWeight: 700, color: 'white' }}>Hapenly.in</span>
              </div>
              <p style={{ fontSize: 13, lineHeight: 1.7, margin: '0 0 1rem' }}>
                Bengaluru's most trusted platform for community meetups, workshops, and cultural events.
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                {['📘', '🐦', '📸', '💼'].map((icon, i) => (
                  <div key={i} style={{
                    width: 34, height: 34, background: 'rgba(255,255,255,0.08)',
                    borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16, cursor: 'pointer',
                  }}>
                    {icon}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontWeight: 700, color: 'white', marginBottom: 14, fontSize: 14 }}>Categories</div>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => { setSelectedCategory(cat.id); document.getElementById('events')?.scrollIntoView({ behavior: 'smooth' }) }}
                  style={{ display: 'block', background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', fontSize: 13, cursor: 'pointer', padding: '4px 0', fontFamily: 'inherit' }}
                >
                  {cat.emoji} {cat.label}
                </button>
              ))}
            </div>
            <div>
              <div style={{ fontWeight: 700, color: 'white', marginBottom: 14, fontSize: 14 }}>Support</div>
              {['Help Center', 'Refund Policy', 'Host an Event', 'Contact Us', 'Safety Guidelines', 'Accessibility'].map((item) => (
                <div key={item} style={{ fontSize: 13, padding: '4px 0' }}>{item}</div>
              ))}
            </div>
            <div>
              <div style={{ fontWeight: 700, color: 'white', marginBottom: 14, fontSize: 14 }}>Get in Touch</div>
              <div style={{ fontSize: 13, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span>📧 hapenly@gmail.com</span>
                <span>📞 +91 80 4567 8900</span>
                <span>📍Chennai — 600028</span>
                <span>🕘 Mon–Sat, 9am – 7pm</span>
              </div>
            </div>
          </div>

          {/* App download strip */}
          <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 14, padding: '1.25rem 1.5rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ color: 'white', fontWeight: 700, fontSize: 16 }}>📱 GatherUp App — coming soon</div>
              <div style={{ fontSize: 13, marginTop: 2 }}>Book events on the go. Get push notifications before events sell out.</div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              {['App Store', 'Google Play'].map((store) => (
                <div key={store} style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.18)', borderRadius: 10, padding: '8px 16px', fontSize: 12, fontWeight: 600, color: 'white', cursor: 'pointer' }}>
                  {store}
                </div>
              ))}
            </div>
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ fontSize: 13 }}>© 2026 Hapenly.in   All rights reserved.</div>
            <div style={{ display: 'flex', gap: '1.5rem', fontSize: 13 }}>
              <span style={{ cursor: 'pointer' }}>Privacy Policy</span>
              <span style={{ cursor: 'pointer' }}>Terms of Service</span>
              <span style={{ cursor: 'pointer' }}>Cookie Policy</span>
            </div>
          </div>
        </div>
      </footer>

      {/* ── Modals ── */}

      {selectedEvent && (
        <Overlay onClose={() => setSelectedEvent(null)}>
          <EventDetailModal
            event={selectedEvent}
            category={CATEGORIES.find((c) => c.id === selectedEvent.categoryId)!}
            onClose={() => setSelectedEvent(null)}
            onBook={handleBookAttempt}
            user={user}
            userTotalTickets={userTotalTickets}
            userBookings={userBookings}
          />
        </Overlay>
      )}

      {showAuth && (
        <Overlay onClose={() => { setShowAuth(false); setPendingBook(null) }}>
          <AuthModal
            mode={authMode}
            onToggleMode={() => setAuthMode((m) => (m === 'login' ? 'register' : 'login'))}
            onClose={() => { setShowAuth(false); setPendingBook(null) }}
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
    </div>
  )
}

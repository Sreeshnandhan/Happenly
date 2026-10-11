import { useEffect, useState } from "react"
import { fetchEventRequests } from "../../api/events"
import type { EventRequestPage } from "../../api/events"

export function AdminEventRequests() {
  const [data, setData] = useState<EventRequestPage | null>(null)
  const [page, setPage] = useState(1)
  const [refresh, setRefresh] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError("")
    setData(null)
    fetchEventRequests(page, controller.signal)
      .then((result) => {
        if (!controller.signal.aborted) setData(result)
      })
      .catch((err) => {
        if (!controller.signal.aborted)
          setError(
            err instanceof Error ? err.message : "Unable to load requests.",
          )
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [page, refresh])

  return (
    <section
      className="event-requests-section"
      aria-labelledby="event-requests-title"
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div>
          <h3
            id="event-requests-title"
            style={{ color: "#1B2B4E", margin: "0 0 6px" }}
          >
            Event requests
          </h3>
          <p style={{ color: "#6B7280", fontSize: 13, margin: 0 }}>
            Organizer submissions waiting for review.
          </p>
        </div>
        <button
          type="button"
          className="event-secondary-button"
          disabled={loading}
          onClick={() => setRefresh((n) => n + 1)}
        >
          Refresh requests
        </button>
      </div>
      {loading && <p role="status">Loading requests…</p>}
      {error && (
        <p role="alert" style={{ color: "#B91C1C" }}>
          {error}
        </p>
      )}
      {!loading && !error && data?.events.length === 0 && (
        <p>No pending event requests.</p>
      )}
      <div style={{ display: "grid", gap: 18, marginTop: 20 }}>
        {data?.events.map((event) => (
          <article key={event.id} className="event-request-card">
            {event.imageUrl ? (
              <a
                href={event.imageUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Open image for ${event.name}`}
              >
                <img
                  src={event.imageUrl}
                  alt={`${event.name} poster`}
                  loading="lazy"
                  style={{
                    width: "100%",
                    maxHeight: 280,
                    objectFit: "contain",
                    display: "block",
                    background: "#F3F4F6",
                    borderRadius: 12,
                  }}
                />
              </a>
            ) : (
              <p style={{ color: "#6B7280" }}>No image attached</p>
            )}
            <div>
              <span
                style={{
                  color: "#92400E",
                  background: "#FFFBEB",
                  padding: "4px 8px",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              >
                {event.status.replace(/_/g, " ")}
              </span>
              <h4 style={{ fontSize: 20, color: "#1B2B4E", margin: "12px 0" }}>
                {event.name}
              </h4>
              <p
                style={{
                  whiteSpace: "pre-wrap",
                  color: "#4B5563",
                  fontSize: 14,
                }}
              >
                {event.description}
              </p>
              <dl className="event-request-details">
                <dt>Category</dt>
                <dd>{event.category.name}</dd>
                <dt>Date / time</dt>
                <dd>
                  {event.date.slice(0, 10)} · {event.startTime}
                </dd>
                <dt>Location</dt>
                <dd>{event.location}</dd>
                <dt>Hosted by</dt>
                <dd>{event.hostedBy}</dd>
                <dt>Duration / age</dt>
                <dd>
                  {event.duration} · {event.ageRequirement || "Not specified"}
                </dd>
                <dt>Seats / ticket</dt>
                <dd>
                  {event.totalSeats} · ₹{Number(event.ticketPrice).toFixed(2)}
                </dd>
                <dt>Contact name</dt>
                <dd>{event.organizerName || event.organizer.name}</dd>
                <dt>Contact phone</dt>
                <dd>
                  {event.organizerPhone ||
                    event.organizer.phone ||
                    "Not provided"}
                </dd>
                <dt>Account email</dt>
                <dd>{event.organizer.email}</dd>
                <dt>Request ID</dt>
                <dd>#{event.id}</dd>
              </dl>
            </div>
          </article>
        ))}
      </div>
      {data && data.total > data.pageSize && (
        <nav
          aria-label="Request pages"
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 12,
            alignItems: "center",
            marginTop: 18,
          }}
        >
          <button
            type="button"
            className="event-secondary-button"
            disabled={loading || page === 1}
            onClick={() => setPage((n) => n - 1)}
          >
            Previous
          </button>
          <span>
            Page {page} of {Math.ceil(data.total / data.pageSize)}
          </span>
          <button
            type="button"
            className="event-secondary-button"
            disabled={loading || page * data.pageSize >= data.total}
            onClick={() => setPage((n) => n + 1)}
          >
            Next
          </button>
        </nav>
      )}
    </section>
  )
}

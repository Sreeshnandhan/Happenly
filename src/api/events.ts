export interface EventCategoryOption {
  id: number
  name: string
}
export interface AdminEventRequest {
  id: number
  name: string
  description: string
  date: string
  startTime: string
  duration: string
  location: string
  hostedBy: string
  ageRequirement: string | null
  totalSeats: number
  ticketPrice: string | number
  status: "SUBMITTED" | "UNDER_REVIEW"
  imageUrl: string | null
  organizerName: string | null
  organizerPhone: string | null
  createdAt: string
  category: { id: number name: string }
  organizer: { id: number name: string email: string phone: string | null }
}
export interface EventRequestPage {
  events: AdminEventRequest[]
  page: number
  pageSize: number
  total: number
}
const BASE = `${(import.meta.env.VITE_API_URL || "").replace(/\/$/, "")}/api/events`

async function readResponse(response: Response) {
  const body = await response.json().catch(() => ({}))
  if (!response.ok)
    throw new Error(
      body.message || `Request failed (${response.status}). Please try again.`,
    )
  return body
}
export async function fetchEventCategories(
  signal?: AbortSignal,
): Promise<EventCategoryOption[]> {
  const body = await readResponse(
    await fetch(`${BASE}/categories`, { credentials: "include", signal }),
  )
  return body.categories
}
export async function submitEvent(formData: FormData) {
  // Do not set Content-Type: the browser supplies the multipart boundary.
  return readResponse(
    await fetch(BASE, {
      method: "POST",
      credentials: "include",
      body: formData,
    }),
  )
}
export async function fetchEventRequests(
  page = 1,
  signal?: AbortSignal,
): Promise<EventRequestPage> {
  return readResponse(
    await fetch(`${BASE}/admin/requests?page=${page}`, {
      credentials: "include",
      signal,
    }),
  )
}

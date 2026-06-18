/** Content entity types exposed by bongolava_job API. */
export type ContentType = 'job' | 'event' | 'contact'

export type UserRole = 'candidate' | 'recruiter' | 'admin'

export interface AuthUser {
  id: number
  name: string
  email: string
  role: UserRole
  phone?: string | null
}

export interface Job {
  id: number
  title: string
  description?: string
  company?: string
  location?: string
  contract_type?: string
  type?: string
  sector?: string
  salary?: string
  is_urgent?: boolean
  urgent?: boolean
  is_remote?: boolean
  remote?: boolean
  status?: string
  created_at?: string
  requirements?: unknown
  responsibilities?: unknown
  tags?: unknown
  contact_email?: string
  contact_phone?: string
  recruiter?: Record<string, string>
  recruiter_id?: number
  [key: string]: unknown
}

export interface Event {
  id: number
  title: string
  description?: string
  long_description?: string
  location?: string
  date?: string
  time?: string
  end_date?: string
  end_time?: string
  type?: string
  organizer?: string
  capacity?: number
  registered?: number
  max_participants?: number
  contact_email?: string
  contact_phone?: string
  address?: string
  [key: string]: unknown
}

export interface Candidate {
  id: number
  first_name?: string
  last_name?: string
  job_target?: string
  location?: string
  skills?: unknown
  experience?: string
  experience_level?: string
  [key: string]: unknown
}

export interface Application {
  id: number
  job_title?: string
  company_name?: string
  applied_at?: string
  status?: string
  [key: string]: unknown
}

export interface ApiListResponse<T> {
  data?: T[]
}

export interface JobSearchFilters {
  keyword?: string
  sector?: string
  contract_type?: string
  location?: string
  sort?: string
  per_page?: number
  page?: number
}

export interface CandidateSearchFilters {
  keyword?: string
  location?: string
  per_page?: number
  page?: number
}

export interface PaginatedMeta {
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export interface PaginatedResponse<T> {
  data: T[]
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export interface EventSearchFilters {
  search?: string
  type?: string
}

/** Content entity types exposed by bongolava_job API. */
export type ContentType = 'job' | 'event' | 'contact'

export type UserRole = 'candidate' | 'recruiter' | 'partenaire' | 'admin'

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
  expires_at?: string
  requirements?: string
  responsibilities?: string
  tags?: string
  contact_email?: string
  contact_phone?: string
  recruiter?: Record<string, string>
  recruiter_id?: number
  image_url?: string | null
  user_type?: 'partenaire' | 'recruiter' | string
  [key: string]: unknown
}

export interface Event {
  id: number
  title: string
  description?: string
  long_description?: string
  location?: string
  date?: string
  horaires?: string
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
  status?: string
  owner_id?: number
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
  job_id?: number
  job_title?: string
  job_location?: string
  candidate_id?: number
  profil_candidat_id?: number
  name?: string
  email?: string
  phone?: string | null
  cover_letter?: string | null
  cv_file?: string | null
  status?: string
  created_at?: string
  [key: string]: unknown
}

export interface RecruiterApplicationSearchFilters {
  keyword?: string
  status?: string
  job_title?: string
  per_page?: number
  page?: number
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
  keyword?: string
  type?: string
  location?: string
  status?: string
  per_page?: number
  page?: number
}

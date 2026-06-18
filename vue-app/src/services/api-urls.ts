/**
 * Centralized API route definitions for bongolava_job (Drupal custom REST API).
 * Base path is resolved at runtime via drupalBasePath.
 */

const PREFIX = 'bongolava_job'

export const API_ROUTES = {
  // Auth
  login: `${PREFIX}/login`,
  logout: `${PREFIX}/logout`,
  me: `${PREFIX}/me`,
  registerCandidate: `${PREFIX}/register/candidate`,
  registerRecruiter: `${PREFIX}/register/recruiter`,

  // Jobs
  jobs: `${PREFIX}/jobs`,
  job: (id: number | string) => `${PREFIX}/jobs/${id}`,
  myJobs: `${PREFIX}/my-jobs`,
  jobApply: (jobId: number | string) => `${PREFIX}/jobs/${jobId}/apply`,
  jobCreate: `${PREFIX}/jobs`,
  jobUpdate: (id: number | string) => `${PREFIX}/jobs/${id}`,
  jobDelete: (id: number | string) => `${PREFIX}/jobs/${id}`,

  // Events
  events: `${PREFIX}/events`,
  event: (id: number | string) => `${PREFIX}/events/${id}`,
  eventRegister: (id: number | string) => `${PREFIX}/events/${id}/register`,

  // Candidates
  candidates: `${PREFIX}/candidates`,
  candidate: (id: number | string) => `${PREFIX}/candidates/${id}`,
  myCandidateProfile: `${PREFIX}/my-candidate-profile`,
  candidateUploadPhoto: `${PREFIX}/candidate/upload-photo`,
  candidateUploadCv: `${PREFIX}/candidate/upload-cv`,
  candidateDeleteCv: `${PREFIX}/candidate/delete-cv`,
  candidateApplications: `${PREFIX}/candidate/applications`,

  // Recruiters
  myRecruiterProfile: `${PREFIX}/my-recruiter-profile`,
  recruiterUploadLogo: `${PREFIX}/recruiter/upload-logo`,

  // Saved jobs
  savedJobs: `${PREFIX}/candidate/saved-jobs`,
  savedJob: (jobId: number | string) => `${PREFIX}/candidate/saved-jobs/${jobId}`,

  // Contact
  contact: `${PREFIX}/contact`,

  // Taxonomies
  taxonomies: `${PREFIX}/taxonomies`,
  taxonomy: (vocabulary: string) => `${PREFIX}/taxonomies/${vocabulary}`,
  taxonomyTerm: (vocabulary: string, termName: string) => `${PREFIX}/taxonomies/${vocabulary}/${termName}`,
  taxonomiesBatch: `${PREFIX}/taxonomies/batch`,
} as const

/** Content types mapped to list/detail API routes. */
export const CONTENT_TYPE_ROUTES = {
  job: { list: API_ROUTES.jobs, detail: API_ROUTES.job },
  event: { list: API_ROUTES.events, detail: API_ROUTES.event },
} as const

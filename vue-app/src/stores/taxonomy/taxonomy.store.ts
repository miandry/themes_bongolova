import { defineStore } from 'pinia'
import { computed } from 'vue'

export interface TaxonomyTerm {
  value: string
  label: string
}

/** Vocabularies used across bongolava_job (sector, contract_type, location, event_type). */
const VOCABULARIES = {
  sector: [
    { value: 'agriculture', label: 'Agriculture & Élevage' },
    { value: 'tourisme', label: 'Tourisme & Hôtellerie' },
    { value: 'industrie', label: 'Industrie & BTP' },
    { value: 'education', label: 'Éducation & Santé' },
    { value: 'informatique', label: 'Informatique & Commerce' },
    { value: 'transport', label: 'Transports & Logistique' },
    { value: 'services', label: 'Services & Administration' },
  ],
  contract_type: [
    { value: 'CDI', label: 'CDI' },
    { value: 'CDD', label: 'CDD' },
    { value: 'Stage', label: 'Stage' },
    { value: 'Freelance', label: 'Freelance' },
  ],
  location: [
    { value: 'Tsiroanomandidy', label: 'Tsiroanomandidy' },
    { value: 'Maintirano', label: 'Maintirano' },
    { value: 'Bongolava', label: 'Bongolava' },
    { value: 'Télé-travail', label: 'Télé-travail' },
  ],
  event_type: [
    { value: 'Salon', label: 'Salon' },
    { value: 'Atelier', label: 'Atelier' },
    { value: 'Conférence', label: 'Conférence' },
    { value: 'Formation', label: 'Formation' },
  ],
} as const satisfies Record<string, TaxonomyTerm[]>

export type VocabularyId = keyof typeof VOCABULARIES

export const useTaxonomyStore = defineStore('taxonomy', () => {
  const sectors = computed(() => VOCABULARIES.sector)
  const contractTypes = computed(() => VOCABULARIES.contract_type)
  const locations = computed(() => VOCABULARIES.location)
  const eventTypes = computed(() => VOCABULARIES.event_type)

  function getTerms(vocabulary: VocabularyId): TaxonomyTerm[] {
    return [...VOCABULARIES[vocabulary]]
  }

  function getLabel(vocabulary: VocabularyId, value: string): string {
    const term = VOCABULARIES[vocabulary].find((t) => t.value === value)
    return term?.label ?? value
  }

  function sectorLabel(value: string): string {
    return getLabel('sector', value)
  }

  return {
    sectors,
    contractTypes,
    locations,
    eventTypes,
    getTerms,
    getLabel,
    sectorLabel,
  }
})

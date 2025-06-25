// Location data with flags for leaderboard filtering
export interface Location {
  code: string
  name: string
  flag: string
  region: 'EU' | 'NA' | 'ASIA' | 'OCEANIA' | 'OTHER'
}

export const LOCATIONS: Location[] = [
  // European Union Locations
  { code: 'at', name: 'Austria', flag: '🇦🇹', region: 'EU' },
  { code: 'be', name: 'Belgium', flag: '🇧🇪', region: 'EU' },
  { code: 'bg', name: 'Bulgaria', flag: '🇧🇬', region: 'EU' },
  { code: 'hr', name: 'Croatia', flag: '🇭🇷', region: 'EU' },
  { code: 'cy', name: 'Cyprus', flag: '🇨🇾', region: 'EU' },
  { code: 'cz', name: 'Czech Republic', flag: '🇨🇿', region: 'EU' },
  { code: 'dk', name: 'Denmark', flag: '🇩🇰', region: 'EU' },
  { code: 'ee', name: 'Estonia', flag: '🇪🇪', region: 'EU' },
  { code: 'fi', name: 'Finland', flag: '🇫🇮', region: 'EU' },
  { code: 'fr', name: 'France', flag: '🇫🇷', region: 'EU' },
  { code: 'de', name: 'Germany', flag: '🇩🇪', region: 'EU' },
  { code: 'gr', name: 'Greece', flag: '🇬🇷', region: 'EU' },
  { code: 'hu', name: 'Hungary', flag: '🇭🇺', region: 'EU' },
  { code: 'ie', name: 'Ireland', flag: '🇮🇪', region: 'EU' },
  { code: 'it', name: 'Italy', flag: '🇮🇹', region: 'EU' },
  { code: 'lv', name: 'Latvia', flag: '🇱🇻', region: 'EU' },
  { code: 'lt', name: 'Lithuania', flag: '🇱🇹', region: 'EU' },
  { code: 'lu', name: 'Luxembourg', flag: '🇱🇺', region: 'EU' },
  { code: 'mt', name: 'Malta', flag: '🇲🇹', region: 'EU' },
  { code: 'nl', name: 'Netherlands', flag: '🇳🇱', region: 'EU' },
  { code: 'pl', name: 'Poland', flag: '🇵🇱', region: 'EU' },
  { code: 'pt', name: 'Portugal', flag: '🇵🇹', region: 'EU' },
  { code: 'ro', name: 'Romania', flag: '🇷🇴', region: 'EU' },
  { code: 'sk', name: 'Slovakia', flag: '🇸🇰', region: 'EU' },
  { code: 'si', name: 'Slovenia', flag: '🇸🇮', region: 'EU' },
  { code: 'es', name: 'Spain', flag: '🇪🇸', region: 'EU' },
  { code: 'se', name: 'Sweden', flag: '🇸🇪', region: 'EU' },
  
  // Other European Locations (Non-EU)
  { code: 'gb', name: 'United Kingdom', flag: '🇬🇧', region: 'EU' },
  { code: 'ch', name: 'Switzerland', flag: '🇨🇭', region: 'EU' },
  { code: 'no', name: 'Norway', flag: '🇳🇴', region: 'EU' },
  { code: 'is', name: 'Iceland', flag: '🇮🇸', region: 'EU' },
  
  // North America
  { code: 'us', name: 'United States', flag: '🇺🇸', region: 'NA' },
  { code: 'ca', name: 'Canada', flag: '🇨🇦', region: 'NA' },
  { code: 'mx', name: 'Mexico', flag: '🇲🇽', region: 'NA' },
  
  // Asia
  { code: 'jp', name: 'Japan', flag: '🇯🇵', region: 'ASIA' },
  { code: 'kr', name: 'South Korea', flag: '🇰🇷', region: 'ASIA' },
  { code: 'cn', name: 'China', flag: '🇨🇳', region: 'ASIA' },
  { code: 'sg', name: 'Singapore', flag: '🇸🇬', region: 'ASIA' },
  { code: 'hk', name: 'Hong Kong', flag: '🇭🇰', region: 'ASIA' },
  { code: 'tw', name: 'Taiwan', flag: '🇹🇼', region: 'ASIA' },
  { code: 'in', name: 'India', flag: '🇮🇳', region: 'ASIA' },
  { code: 'th', name: 'Thailand', flag: '🇹🇭', region: 'ASIA' },
  { code: 'my', name: 'Malaysia', flag: '🇲🇾', region: 'ASIA' },
  { code: 'ph', name: 'Philippines', flag: '🇵🇭', region: 'ASIA' },
  { code: 'id', name: 'Indonesia', flag: '🇮🇩', region: 'ASIA' },
  { code: 'vn', name: 'Vietnam', flag: '🇻🇳', region: 'ASIA' },
  
  // Oceania
  { code: 'au', name: 'Australia', flag: '🇦🇺', region: 'OCEANIA' },
  { code: 'nz', name: 'New Zealand', flag: '🇳🇿', region: 'OCEANIA' },
  
  // Other Popular Locations
  { code: 'br', name: 'Brazil', flag: '🇧🇷', region: 'OTHER' },
  { code: 'ar', name: 'Argentina', flag: '🇦🇷', region: 'OTHER' },
  { code: 'za', name: 'South Africa', flag: '🇿🇦', region: 'OTHER' },
  { code: 'ae', name: 'UAE', flag: '🇦🇪', region: 'OTHER' },
  { code: 'il', name: 'Israel', flag: '🇮🇱', region: 'OTHER' },
  { code: 'tr', name: 'Turkey', flag: '🇹🇷', region: 'OTHER' },
  { code: 'ru', name: 'Russia', flag: '🇷🇺', region: 'OTHER' },
]

// Helper functions
export const getLocationByCode = (code: string): Location | undefined => {
  return LOCATIONS.find(location => location.code === code)
}

export const getLocationsByRegion = (region: Location['region']): Location[] => {
  return LOCATIONS.filter(location => location.region === region)
}

export const getAllEULocations = (): Location[] => {
  return getLocationsByRegion('EU')
}

// Function to add new location (for admin use)
export const addNewLocation = (location: Location): Location[] => {
  // This would typically save to database
  // For now, just return updated array
  return [...LOCATIONS, location]
}

// Function to get flag by location name (fuzzy matching)
export const getFlagByName = (name: string): string => {
  const location = LOCATIONS.find(l => 
    l.name.toLowerCase().includes(name.toLowerCase()) ||
    name.toLowerCase().includes(l.name.toLowerCase())
  )
  return location?.flag || '🌍'
}

/**
 * Meta Ad Library Public Location / Country Catalogue
 * Version: 2026.09-v1
 *
 * Source: Public Meta Ad Library search interface supported country/region parameters.
 * ISO 3166-1 alpha-2 canonical country codes.
 *
 * Ad Library location represents the target market / search distribution context,
 * NOT verified advertiser corporate headquarters.
 */

export interface MetaAdLibraryLocation {
  locationCode: string; // ISO 3166-1 alpha-2 code
  displayName: string;
  region: 'North America' | 'Europe' | 'Asia-Pacific' | 'Latin America' | 'Middle East' | 'Africa';
  aliases: string[];
  isPopular?: boolean;
  status: 'ACTIVE' | 'RESTRICTED';
}

export const META_AD_LIBRARY_LOCATION_CATALOGUE_VERSION = '2026.09-v1';

export const POPULAR_LOCATION_CODES = [
  'US', 'GB', 'CA', 'AU', 'DE', 'FR', 'IN', 'SG', 'AE', 'BD', 'BR', 'JP'
];

export const META_AD_LIBRARY_LOCATIONS: MetaAdLibraryLocation[] = [
  // Popular / Key Commercial Markets
  { locationCode: 'US', displayName: 'United States', region: 'North America', aliases: ['USA', 'America', 'United States of America'], isPopular: true, status: 'ACTIVE' },
  { locationCode: 'GB', displayName: 'United Kingdom', region: 'Europe', aliases: ['UK', 'Britain', 'Great Britain', 'England'], isPopular: true, status: 'ACTIVE' },
  { locationCode: 'CA', displayName: 'Canada', region: 'North America', aliases: ['CAN'], isPopular: true, status: 'ACTIVE' },
  { locationCode: 'AU', displayName: 'Australia', region: 'Asia-Pacific', aliases: ['AUS', 'Oz'], isPopular: true, status: 'ACTIVE' },
  { locationCode: 'DE', displayName: 'Germany', region: 'Europe', aliases: ['Deutschland', 'DEU'], isPopular: true, status: 'ACTIVE' },
  { locationCode: 'FR', displayName: 'France', region: 'Europe', aliases: ['FRA'], isPopular: true, status: 'ACTIVE' },
  { locationCode: 'IN', displayName: 'India', region: 'Asia-Pacific', aliases: ['Bharat', 'IND'], isPopular: true, status: 'ACTIVE' },
  { locationCode: 'SG', displayName: 'Singapore', region: 'Asia-Pacific', aliases: ['SGP'], isPopular: true, status: 'ACTIVE' },
  { locationCode: 'AE', displayName: 'United Arab Emirates', region: 'Middle East', aliases: ['UAE', 'Dubai', 'Abu Dhabi'], isPopular: true, status: 'ACTIVE' },
  { locationCode: 'BD', displayName: 'Bangladesh', region: 'Asia-Pacific', aliases: ['BGD', 'Bangla'], isPopular: true, status: 'ACTIVE' },
  { locationCode: 'BR', displayName: 'Brazil', region: 'Latin America', aliases: ['Brasil', 'BRA'], isPopular: true, status: 'ACTIVE' },
  { locationCode: 'JP', displayName: 'Japan', region: 'Asia-Pacific', aliases: ['Nihon', 'Nippon', 'JPN'], isPopular: true, status: 'ACTIVE' },

  // Europe
  { locationCode: 'AT', displayName: 'Austria', region: 'Europe', aliases: ['Österreich', 'AUT'], status: 'ACTIVE' },
  { locationCode: 'BE', displayName: 'Belgium', region: 'Europe', aliases: ['Belgique', 'België', 'BEL'], status: 'ACTIVE' },
  { locationCode: 'BG', displayName: 'Bulgaria', region: 'Europe', aliases: ['BGR'], status: 'ACTIVE' },
  { locationCode: 'CH', displayName: 'Switzerland', region: 'Europe', aliases: ['Schweiz', 'Suisse', 'CHE'], status: 'ACTIVE' },
  { locationCode: 'CY', displayName: 'Cyprus', region: 'Europe', aliases: ['CYP'], status: 'ACTIVE' },
  { locationCode: 'CZ', displayName: 'Czech Republic', region: 'Europe', aliases: ['Czechia', 'CZE'], status: 'ACTIVE' },
  { locationCode: 'DK', displayName: 'Denmark', region: 'Europe', aliases: ['Danmark', 'DNK'], status: 'ACTIVE' },
  { locationCode: 'EE', displayName: 'Estonia', region: 'Europe', aliases: ['Eesti', 'EST'], status: 'ACTIVE' },
  { locationCode: 'ES', displayName: 'Spain', region: 'Europe', aliases: ['España', 'ESP'], status: 'ACTIVE' },
  { locationCode: 'FI', displayName: 'Finland', region: 'Europe', aliases: ['Suomi', 'FIN'], status: 'ACTIVE' },
  { locationCode: 'GR', displayName: 'Greece', region: 'Europe', aliases: ['Hellas', 'GRC'], status: 'ACTIVE' },
  { locationCode: 'HR', displayName: 'Croatia', region: 'Europe', aliases: ['Hrvatska', 'HRV'], status: 'ACTIVE' },
  { locationCode: 'HU', displayName: 'Hungary', region: 'Europe', aliases: ['Magyarország', 'HUN'], status: 'ACTIVE' },
  { locationCode: 'IE', displayName: 'Ireland', region: 'Europe', aliases: ['Éire', 'IRL'], status: 'ACTIVE' },
  { locationCode: 'IS', displayName: 'Iceland', region: 'Europe', aliases: ['Ísland', 'ISL'], status: 'ACTIVE' },
  { locationCode: 'IT', displayName: 'Italy', region: 'Europe', aliases: ['Italia', 'ITA'], status: 'ACTIVE' },
  { locationCode: 'LI', displayName: 'Liechtenstein', region: 'Europe', aliases: ['LIE'], status: 'ACTIVE' },
  { locationCode: 'LT', displayName: 'Lithuania', region: 'Europe', aliases: ['Lietuva', 'LTU'], status: 'ACTIVE' },
  { locationCode: 'LU', displayName: 'Luxembourg', region: 'Europe', aliases: ['LUX'], status: 'ACTIVE' },
  { locationCode: 'LV', displayName: 'Latvia', region: 'Europe', aliases: ['Latvija', 'LVA'], status: 'ACTIVE' },
  { locationCode: 'MT', displayName: 'Malta', region: 'Europe', aliases: ['MLT'], status: 'ACTIVE' },
  { locationCode: 'NL', displayName: 'Netherlands', region: 'Europe', aliases: ['Holland', 'NLD'], status: 'ACTIVE' },
  { locationCode: 'NO', displayName: 'Norway', region: 'Europe', aliases: ['Norge', 'NOR'], status: 'ACTIVE' },
  { locationCode: 'PL', displayName: 'Poland', region: 'Europe', aliases: ['Polska', 'POL'], status: 'ACTIVE' },
  { locationCode: 'PT', displayName: 'Portugal', region: 'Europe', aliases: ['PRT'], status: 'ACTIVE' },
  { locationCode: 'RO', displayName: 'Romania', region: 'Europe', aliases: ['România', 'ROU'], status: 'ACTIVE' },
  { locationCode: 'RS', displayName: 'Serbia', region: 'Europe', aliases: ['Srbija', 'SRB'], status: 'ACTIVE' },
  { locationCode: 'SE', displayName: 'Sweden', region: 'Europe', aliases: ['Sverige', 'SWE'], status: 'ACTIVE' },
  { locationCode: 'SI', displayName: 'Slovenia', region: 'Europe', aliases: ['Slovenija', 'SVN'], status: 'ACTIVE' },
  { locationCode: 'SK', displayName: 'Slovakia', region: 'Europe', aliases: ['Slovensko', 'SVK'], status: 'ACTIVE' },
  { locationCode: 'UA', displayName: 'Ukraine', region: 'Europe', aliases: ['UKR'], status: 'ACTIVE' },

  // Asia-Pacific
  { locationCode: 'HK', displayName: 'Hong Kong', region: 'Asia-Pacific', aliases: ['HKG'], status: 'ACTIVE' },
  { locationCode: 'ID', displayName: 'Indonesia', region: 'Asia-Pacific', aliases: ['IDN'], status: 'ACTIVE' },
  { locationCode: 'KR', displayName: 'South Korea', region: 'Asia-Pacific', aliases: ['Korea', 'KOR'], status: 'ACTIVE' },
  { locationCode: 'MY', displayName: 'Malaysia', region: 'Asia-Pacific', aliases: ['MYS'], status: 'ACTIVE' },
  { locationCode: 'NZ', displayName: 'New Zealand', region: 'Asia-Pacific', aliases: ['Aotearoa', 'NZL'], status: 'ACTIVE' },
  { locationCode: 'PH', displayName: 'Philippines', region: 'Asia-Pacific', aliases: ['PHL', 'Pilipinas'], status: 'ACTIVE' },
  { locationCode: 'PK', displayName: 'Pakistan', region: 'Asia-Pacific', aliases: ['PAK'], status: 'ACTIVE' },
  { locationCode: 'TH', displayName: 'Thailand', region: 'Asia-Pacific', aliases: ['THA', 'Siam'], status: 'ACTIVE' },
  { locationCode: 'TW', displayName: 'Taiwan', region: 'Asia-Pacific', aliases: ['TWN'], status: 'ACTIVE' },
  { locationCode: 'VN', displayName: 'Vietnam', region: 'Asia-Pacific', aliases: ['VNM'], status: 'ACTIVE' },
  { locationCode: 'LK', displayName: 'Sri Lanka', region: 'Asia-Pacific', aliases: ['LKA', 'Ceylon'], status: 'ACTIVE' },
  { locationCode: 'NP', displayName: 'Nepal', region: 'Asia-Pacific', aliases: ['NPL'], status: 'ACTIVE' },

  // Middle East & North Africa
  { locationCode: 'BH', displayName: 'Bahrain', region: 'Middle East', aliases: ['BHR'], status: 'ACTIVE' },
  { locationCode: 'EG', displayName: 'Egypt', region: 'Middle East', aliases: ['EGY', 'Misr'], status: 'ACTIVE' },
  { locationCode: 'IL', displayName: 'Israel', region: 'Middle East', aliases: ['ISR'], status: 'ACTIVE' },
  { locationCode: 'JO', displayName: 'Jordan', region: 'Middle East', aliases: ['JOR'], status: 'ACTIVE' },
  { locationCode: 'KW', displayName: 'Kuwait', region: 'Middle East', aliases: ['KWT'], status: 'ACTIVE' },
  { locationCode: 'OM', displayName: 'Oman', region: 'Middle East', aliases: ['OMN'], status: 'ACTIVE' },
  { locationCode: 'QA', displayName: 'Qatar', region: 'Middle East', aliases: ['QAT'], status: 'ACTIVE' },
  { locationCode: 'SA', displayName: 'Saudi Arabia', region: 'Middle East', aliases: ['KSA', 'SAU'], status: 'ACTIVE' },
  { locationCode: 'TR', displayName: 'Turkey', region: 'Middle East', aliases: ['Türkiye', 'TUR'], status: 'ACTIVE' },

  // Latin America & Caribbean
  { locationCode: 'AR', displayName: 'Argentina', region: 'Latin America', aliases: ['ARG'], status: 'ACTIVE' },
  { locationCode: 'CL', displayName: 'Chile', region: 'Latin America', aliases: ['CHL'], status: 'ACTIVE' },
  { locationCode: 'CO', displayName: 'Colombia', region: 'Latin America', aliases: ['COL'], status: 'ACTIVE' },
  { locationCode: 'CR', displayName: 'Costa Rica', region: 'Latin America', aliases: ['CRI'], status: 'ACTIVE' },
  { locationCode: 'DO', displayName: 'Dominican Republic', region: 'Latin America', aliases: ['DOM'], status: 'ACTIVE' },
  { locationCode: 'EC', displayName: 'Ecuador', region: 'Latin America', aliases: ['ECU'], status: 'ACTIVE' },
  { locationCode: 'MX', displayName: 'Mexico', region: 'Latin America', aliases: ['MEX', 'Méjico'], status: 'ACTIVE' },
  { locationCode: 'PA', displayName: 'Panama', region: 'Latin America', aliases: ['PAN'], status: 'ACTIVE' },
  { locationCode: 'PE', displayName: 'Peru', region: 'Latin America', aliases: ['PER'], status: 'ACTIVE' },
  { locationCode: 'UY', displayName: 'Uruguay', region: 'Latin America', aliases: ['URY'], status: 'ACTIVE' },

  // Africa
  { locationCode: 'GH', displayName: 'Ghana', region: 'Africa', aliases: ['GHA'], status: 'ACTIVE' },
  { locationCode: 'KE', displayName: 'Kenya', region: 'Africa', aliases: ['KEN'], status: 'ACTIVE' },
  { locationCode: 'MA', displayName: 'Morocco', region: 'Africa', aliases: ['Maroc', 'MAR'], status: 'ACTIVE' },
  { locationCode: 'NG', displayName: 'Nigeria', region: 'Africa', aliases: ['NGA'], status: 'ACTIVE' },
  { locationCode: 'ZA', displayName: 'South Africa', region: 'Africa', aliases: ['RSA', 'ZAF'], status: 'ACTIVE' },
  { locationCode: 'UG', displayName: 'Uganda', region: 'Africa', aliases: ['UGA'], status: 'ACTIVE' },
  { locationCode: 'TZ', displayName: 'Tanzania', region: 'Africa', aliases: ['TZA'], status: 'ACTIVE' }
];

/**
 * Validate that a given location code exists and is ACTIVE in the catalogue.
 */
export function isValidLocationCode(code?: string): boolean {
  if (!code) return false;
  const upper = code.trim().toUpperCase();
  return META_AD_LIBRARY_LOCATIONS.some(loc => loc.locationCode === upper && loc.status === 'ACTIVE');
}

/**
 * Retrieve a location item by ISO 3166-1 alpha-2 code.
 */
export function getLocationByCode(code?: string): MetaAdLibraryLocation | undefined {
  if (!code) return undefined;
  const upper = code.trim().toUpperCase();
  return META_AD_LIBRARY_LOCATIONS.find(loc => loc.locationCode === upper);
}

/**
 * Search locations across display name, ISO code, region, and aliases.
 */
export function searchLocations(query: string): MetaAdLibraryLocation[] {
  const clean = query.trim().toLowerCase();
  if (!clean) return META_AD_LIBRARY_LOCATIONS;

  return META_AD_LIBRARY_LOCATIONS.filter(loc => {
    if (loc.locationCode.toLowerCase() === clean) return true;
    if (loc.displayName.toLowerCase().includes(clean)) return true;
    if (loc.region.toLowerCase().includes(clean)) return true;
    return loc.aliases.some(alias => alias.toLowerCase().includes(clean));
  });
}

/**
 * Retrieve popular convenience locations.
 */
export function getPopularLocations(): MetaAdLibraryLocation[] {
  return META_AD_LIBRARY_LOCATIONS.filter(loc => loc.isPopular);
}

/**
 * Retrieve all supported locations sorted alphabetically by display name.
 */
export function getAllLocations(): MetaAdLibraryLocation[] {
  return [...META_AD_LIBRARY_LOCATIONS].sort((a, b) => a.displayName.localeCompare(b.displayName));
}

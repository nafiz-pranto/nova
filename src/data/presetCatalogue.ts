/**
 * Lead Research Industry Preset Catalogue
 * Version: v2.1.0
 *
 * Grounded in practical commercial search recipes for Meta Ad Library lead research.
 * Distinguishes formal taxonomy from high-intent advertising query recipes.
 */

export type PresetStatus = 'DRAFT' | 'TESTING' | 'ACTIVE' | 'DEPRECATED' | 'RETIRED';

export interface ResearchPreset {
  preset_id: string;
  name: string;
  industry: string;
  sub_industry: string;
  description: string;
  primary_keywords: string[];
  secondary_keywords: string[];
  optional_exclusions?: string[];
  default_location_behavior: {
    defaultLocationCode: string;
    allowsGlobal: boolean;
  };
  website_required: boolean;
  default_result_limit: number;
  version: string;
  status: PresetStatus;
  aliases?: string[];
}

export const PRESET_CATALOGUE_VERSION = 'v2.1.0';

export const RESEARCH_PRESETS: ResearchPreset[] = [
  // ==========================================
  // 1. TECHNOLOGY & SOFTWARE
  // ==========================================
  {
    preset_id: 'tech_saas_b2b',
    name: 'B2B SaaS Platforms',
    industry: 'Technology & Software',
    sub_industry: 'Cloud Software',
    description: 'B2B cloud software providers advertising subscription business tools.',
    primary_keywords: ['saas', 'cloud software', 'business software'],
    secondary_keywords: ['crm', 'erp', 'workflow automation', 'enterprise software'],
    optional_exclusions: ['free software', 'pirate', 'torrent'],
    default_location_behavior: { defaultLocationCode: 'US', allowsGlobal: true },
    website_required: true,
    default_result_limit: 50,
    version: 'v2.1.0',
    status: 'ACTIVE',
    aliases: ['SaaS', 'B2B Software', 'Cloud Platforms', 'Enterprise SaaS']
  },
  {
    preset_id: 'tech_crm_platforms',
    name: 'CRM & Pipeline Software',
    industry: 'Technology & Software',
    sub_industry: 'Sales Technology',
    description: 'Customer relationship management and sales automation software vendors.',
    primary_keywords: ['crm software', 'sales pipeline software', 'lead management software'],
    secondary_keywords: ['pipeline crm', 'contact manager', 'deal tracking'],
    default_location_behavior: { defaultLocationCode: 'US', allowsGlobal: true },
    website_required: true,
    default_result_limit: 50,
    version: 'v2.1.0',
    status: 'ACTIVE',
    aliases: ['CRM', 'Sales CRM', 'Pipeline Tool']
  },
  {
    preset_id: 'tech_devops_cloud',
    name: 'DevOps & Cloud Infrastructure',
    industry: 'Technology & Software',
    sub_industry: 'Developer Tools',
    description: 'Continuous delivery, Kubernetes, cloud hosting, and infrastructure monitoring.',
    primary_keywords: ['devops platform', 'kubernetes management', 'cloud infrastructure'],
    secondary_keywords: ['ci/cd pipeline', 'container orchestration', 'cloud monitoring'],
    default_location_behavior: { defaultLocationCode: 'US', allowsGlobal: true },
    website_required: true,
    default_result_limit: 50,
    version: 'v2.1.0',
    status: 'ACTIVE',
    aliases: ['DevOps', 'Cloud Infra', 'Kubernetes']
  },
  {
    preset_id: 'tech_cybersecurity_b2b',
    name: 'Cybersecurity & Compliance',
    industry: 'Technology & Software',
    sub_industry: 'Security & Privacy',
    description: 'Enterprise endpoint protection, SOC 2 compliance automation, and threat defense.',
    primary_keywords: ['cybersecurity solution', 'soc 2 compliance', 'endpoint security'],
    secondary_keywords: ['vulnerability management', 'data security platform', 'zero trust'],
    default_location_behavior: { defaultLocationCode: 'US', allowsGlobal: true },
    website_required: true,
    default_result_limit: 50,
    version: 'v2.1.0',
    status: 'ACTIVE',
    aliases: ['Cybersecurity', 'SOC 2', 'InfoSec', 'Penetration Testing']
  },
  {
    preset_id: 'tech_fintech_software',
    name: 'FinTech & Billing Software',
    industry: 'Technology & Software',
    sub_industry: 'Financial Technology',
    description: 'Corporate spend management, payroll automation, and recurring billing systems.',
    primary_keywords: ['spend management software', 'payroll software', 'subscription billing'],
    secondary_keywords: ['corporate card', 'invoicing software', 'expense automation'],
    default_location_behavior: { defaultLocationCode: 'US', allowsGlobal: true },
    website_required: true,
    default_result_limit: 50,
    version: 'v2.1.0',
    status: 'ACTIVE',
    aliases: ['FinTech', 'Payroll SaaS', 'Billing Engine']
  },
  {
    preset_id: 'tech_hr_recruitment_saas',
    name: 'HR & ATS Talent Software',
    industry: 'Technology & Software',
    sub_industry: 'Human Resources',
    description: 'Applicant tracking systems, employee onboarding, and HR information systems.',
    primary_keywords: ['applicant tracking system', 'hr software', 'employee onboarding platform'],
    secondary_keywords: ['ats software', 'hris', 'recruitment software'],
    default_location_behavior: { defaultLocationCode: 'US', allowsGlobal: true },
    website_required: true,
    default_result_limit: 50,
    version: 'v2.1.0',
    status: 'ACTIVE',
    aliases: ['HR Tech', 'ATS', 'HRIS', 'Staffing Software']
  },

  // ==========================================
  // 2. HEALTHCARE & MEDICAL
  // ==========================================
  {
    preset_id: 'health_dental_clinics',
    name: 'Dental & Orthodontic Clinics',
    industry: 'Healthcare & Medical',
    sub_industry: 'Dental Services',
    description: 'Private dental practices advertising cosmetic dentistry, implants, and clear aligners.',
    primary_keywords: ['dental implants', 'cosmetic dentist', 'clear aligners'],
    secondary_keywords: ['emergency dentist', 'teeth whitening clinic', 'invisalign dentist'],
    default_location_behavior: { defaultLocationCode: 'US', allowsGlobal: true },
    website_required: true,
    default_result_limit: 50,
    version: 'v2.1.0',
    status: 'ACTIVE',
    aliases: ['Dentist', 'Orthodontist', 'Dental Implants']
  },
  {
    preset_id: 'health_med_spa_aesthetic',
    name: 'Medical Spas & Aesthetics',
    industry: 'Healthcare & Medical',
    sub_industry: 'Aesthetic Medicine',
    description: 'Clinics offering Botox, dermal fillers, laser skin resurfacing, and body contouring.',
    primary_keywords: ['med spa', 'botox clinic', 'laser hair removal'],
    secondary_keywords: ['dermal fillers', 'body contouring', 'skin rejuvenation clinic'],
    default_location_behavior: { defaultLocationCode: 'US', allowsGlobal: true },
    website_required: true,
    default_result_limit: 50,
    version: 'v2.1.0',
    status: 'ACTIVE',
    aliases: ['MedSpa', 'Aesthetic Clinic', 'Cosmetic Dermatology']
  },
  {
    preset_id: 'health_mental_telehealth',
    name: 'Mental Health & Teletherapy',
    industry: 'Healthcare & Medical',
    sub_industry: 'Mental Health',
    description: 'Private therapy practices, online counseling, and licensed mental health clinics.',
    primary_keywords: ['online therapy', 'licensed counselor', 'adhd assessment clinic'],
    secondary_keywords: ['couples therapy', 'telehealth psychiatry', 'anxiety counseling'],
    default_location_behavior: { defaultLocationCode: 'US', allowsGlobal: true },
    website_required: true,
    default_result_limit: 50,
    version: 'v2.1.0',
    status: 'ACTIVE',
    aliases: ['Therapy', 'Telehealth', 'Counseling', 'Psychiatry']
  },
  {
    preset_id: 'health_veterinary_clinics',
    name: 'Veterinary Hospitals & Clinics',
    industry: 'Healthcare & Medical',
    sub_industry: 'Veterinary Medicine',
    description: 'Animal hospitals, urgent pet care, and companion animal veterinary clinics.',
    primary_keywords: ['veterinary hospital', 'animal clinic', 'emergency vet'],
    secondary_keywords: ['pet wellness exam', 'vet surgery clinic', 'canine care center'],
    default_location_behavior: { defaultLocationCode: 'US', allowsGlobal: true },
    website_required: true,
    default_result_limit: 50,
    version: 'v2.1.0',
    status: 'ACTIVE',
    aliases: ['Vet', 'Animal Hospital', 'Veterinarian']
  },
  {
    preset_id: 'health_optometry_eyecare',
    name: 'Optometry & Eye Care Centers',
    industry: 'Healthcare & Medical',
    sub_industry: 'Vision Care',
    description: 'Independent optometrists, LASIK eye surgery clinics, and designer optical boutiques.',
    primary_keywords: ['lasik eye surgery', 'optometrist eye exam', 'designer eyewear clinic'],
    secondary_keywords: ['cataract surgery center', 'vision correction', 'prescription glasses clinic'],
    default_location_behavior: { defaultLocationCode: 'US', allowsGlobal: true },
    website_required: true,
    default_result_limit: 50,
    version: 'v2.1.0',
    status: 'ACTIVE',
    aliases: ['Eye Clinic', 'LASIK', 'Optometrist']
  },

  // ==========================================
  // 3. HOME SERVICES & TRADES
  // ==========================================
  {
    preset_id: 'home_hvac_heating_cooling',
    name: 'HVAC Installation & Repair',
    industry: 'Home Services & Trades',
    sub_industry: 'Climate Control',
    description: 'Air conditioning, heat pump replacement, and furnace repair contractors.',
    primary_keywords: ['ac installation', 'furnace replacement', 'hvac repair contractor'],
    secondary_keywords: ['heat pump installation', 'air conditioning service', 'emergency hvac'],
    default_location_behavior: { defaultLocationCode: 'US', allowsGlobal: true },
    website_required: true,
    default_result_limit: 50,
    version: 'v2.1.0',
    status: 'ACTIVE',
    aliases: ['HVAC', 'Air Conditioning', 'Heating', 'Heat Pump']
  },
  {
    preset_id: 'home_roofing_contractors',
    name: 'Roofing & Siding Contractors',
    industry: 'Home Services & Trades',
    sub_industry: 'Exterior Remodeling',
    description: 'Commercial and residential roof replacement, hail damage repair, and gutter systems.',
    primary_keywords: ['roof replacement contractor', 'roof repair company', 'metal roofing'],
    secondary_keywords: ['storm damage roof inspection', 'residential siding', 'seamless gutters'],
    default_location_behavior: { defaultLocationCode: 'US', allowsGlobal: true },
    website_required: true,
    default_result_limit: 50,
    version: 'v2.1.0',
    status: 'ACTIVE',
    aliases: ['Roofing', 'Roofers', 'Siding Contractor']
  },
  {
    preset_id: 'home_solar_energy',
    name: 'Solar Panel Installation & Batteries',
    industry: 'Home Services & Trades',
    sub_industry: 'Renewable Energy',
    description: 'Residential solar power systems, battery backup storage, and commercial solar EPC.',
    primary_keywords: ['solar panel installation', 'home battery backup', 'commercial solar'],
    secondary_keywords: ['residential solar financing', 'solar roof quote', 'clean energy savings'],
    default_location_behavior: { defaultLocationCode: 'US', allowsGlobal: true },
    website_required: true,
    default_result_limit: 50,
    version: 'v2.1.0',
    status: 'ACTIVE',
    aliases: ['Solar', 'Renewable Energy', 'Solar Financing', 'Solar Panels']
  },
  {
    preset_id: 'home_plumbing_water',
    name: 'Plumbing & Water Filtration',
    industry: 'Home Services & Trades',
    sub_industry: 'Plumbing Systems',
    description: 'Plumbing repairs, tankless water heater installation, and whole-house filtration.',
    primary_keywords: ['emergency plumber', 'water heater replacement', 'whole house water filter'],
    secondary_keywords: ['drain cleaning service', 'tankless water heater', 'sewer line repair'],
    default_location_behavior: { defaultLocationCode: 'US', allowsGlobal: true },
    website_required: true,
    default_result_limit: 50,
    version: 'v2.1.0',
    status: 'ACTIVE',
    aliases: ['Plumber', 'Plumbing', 'Water Heaters']
  },
  {
    preset_id: 'home_pest_control',
    name: 'Pest & Termite Control',
    industry: 'Home Services & Trades',
    sub_industry: 'Pest Management',
    description: 'Exterminator services, termite inspections, bed bug treatments, and rodent exclusion.',
    primary_keywords: ['pest control service', 'termite inspection company', 'bed bug treatment'],
    secondary_keywords: ['commercial exterminator', 'rodent control', 'mosquito defense program'],
    default_location_behavior: { defaultLocationCode: 'US', allowsGlobal: true },
    website_required: true,
    default_result_limit: 50,
    version: 'v2.1.0',
    status: 'ACTIVE',
    aliases: ['Pest Control', 'Exterminator', 'Termite Control']
  },

  // ==========================================
  // 4. FINANCIAL SERVICES
  // ==========================================
  {
    preset_id: 'fin_commercial_lending',
    name: 'Commercial & Business Lending',
    industry: 'Financial Services',
    sub_industry: 'Commercial Financing',
    description: 'Equipment financing, working capital lines of credit, and SBA commercial loans.',
    primary_keywords: ['business loan', 'equipment financing', 'working capital line of credit'],
    secondary_keywords: ['sba loan broker', 'commercial mortgage financing', 'invoice factoring'],
    default_location_behavior: { defaultLocationCode: 'US', allowsGlobal: true },
    website_required: true,
    default_result_limit: 50,
    version: 'v2.1.0',
    status: 'ACTIVE',
    aliases: ['Business Loans', 'Commercial Lending', 'Equipment Lease']
  },
  {
    preset_id: 'fin_wealth_management',
    name: 'Wealth Advisory & Financial Planning',
    industry: 'Financial Services',
    sub_industry: 'Wealth Advisory',
    description: 'Fiduciary financial advisors, retirement planners, and high-net-worth wealth managers.',
    primary_keywords: ['wealth management firm', 'fiduciary financial advisor', 'retirement planning'],
    secondary_keywords: ['estate planning advisory', 'high net worth wealth planner', 'portfolio management'],
    default_location_behavior: { defaultLocationCode: 'US', allowsGlobal: true },
    website_required: true,
    default_result_limit: 50,
    version: 'v2.1.0',
    status: 'ACTIVE',
    aliases: ['Wealth Advisor', 'Financial Planner', 'RIA']
  },
  {
    preset_id: 'fin_tax_accounting_cpa',
    name: 'Tax Advisory & CPA Firms',
    industry: 'Financial Services',
    sub_industry: 'Tax & Accounting',
    description: 'Certified public accountants, corporate tax prep, audit, and outsourced bookkeeping.',
    primary_keywords: ['cpa firm', 'corporate tax advisory', 'outsourced bookkeeping services'],
    secondary_keywords: ['tax resolution specialist', 'fractional cfo services', 'business tax preparation'],
    default_location_behavior: { defaultLocationCode: 'US', allowsGlobal: true },
    website_required: true,
    default_result_limit: 50,
    version: 'v2.1.0',
    status: 'ACTIVE',
    aliases: ['CPA', 'Tax Prep', 'Bookkeeping', 'Accounting Firm']
  },
  {
    preset_id: 'fin_business_insurance',
    name: 'Commercial & Business Insurance',
    industry: 'Financial Services',
    sub_industry: 'Commercial Insurance',
    description: 'General liability, cyber insurance, commercial auto, and workers compensation.',
    primary_keywords: ['commercial insurance broker', 'general liability insurance', 'workers comp insurance'],
    secondary_keywords: ['cyber liability insurance', 'errors and omissions policy', 'business owners policy'],
    default_location_behavior: { defaultLocationCode: 'US', allowsGlobal: true },
    website_required: true,
    default_result_limit: 50,
    version: 'v2.1.0',
    status: 'ACTIVE',
    aliases: ['Commercial Insurance', 'Business Insurance', 'BOP']
  },

  // ==========================================
  // 5. REAL ESTATE & PROPERTY
  // ==========================================
  {
    preset_id: 'real_commercial_brokerage',
    name: 'Commercial Real Estate Brokerages',
    industry: 'Real Estate & Property',
    sub_industry: 'Commercial Properties',
    description: 'Office, retail, and industrial leasing brokers, triple-net investment advisors.',
    primary_keywords: ['commercial real estate broker', 'industrial warehouse lease', 'office space leasing'],
    secondary_keywords: ['retail space commercial lease', 'nnn investment properties', 'commercial property sales'],
    default_location_behavior: { defaultLocationCode: 'US', allowsGlobal: true },
    website_required: true,
    default_result_limit: 50,
    version: 'v2.1.0',
    status: 'ACTIVE',
    aliases: ['CRE', 'Commercial Real Estate', 'Warehouse Lease']
  },
  {
    preset_id: 'real_property_management',
    name: 'Property Management Companies',
    industry: 'Real Estate & Property',
    sub_industry: 'Asset Management',
    description: 'Multifamily residential management, HOA management, and commercial property care.',
    primary_keywords: ['property management company', 'hoa management services', 'multifamily property manager'],
    secondary_keywords: ['rental property management', 'commercial asset management', 'tenant placement agency'],
    default_location_behavior: { defaultLocationCode: 'US', allowsGlobal: true },
    website_required: true,
    default_result_limit: 50,
    version: 'v2.1.0',
    status: 'ACTIVE',
    aliases: ['Property Manager', 'HOA Management', 'Rental Management']
  },
  {
    preset_id: 'real_luxury_brokerages',
    name: 'Luxury Residential Real Estate',
    industry: 'Real Estate & Property',
    sub_industry: 'Residential Brokerage',
    description: 'High-end home brokerages, luxury estate specialists, and waterfront property realtors.',
    primary_keywords: ['luxury real estate agent', 'waterfront homes for sale', 'luxury estate brokerage'],
    secondary_keywords: ['custom home realtor', 'high end listing agent', 'gated community homes'],
    default_location_behavior: { defaultLocationCode: 'US', allowsGlobal: true },
    website_required: true,
    default_result_limit: 50,
    version: 'v2.1.0',
    status: 'ACTIVE',
    aliases: ['Luxury Realtor', 'Real Estate Agent', 'Residential Brokerage']
  },

  // ==========================================
  // 6. PROFESSIONAL & BUSINESS SERVICES
  // ==========================================
  {
    preset_id: 'prof_growth_marketing_agencies',
    name: 'B2B Digital Marketing Agencies',
    industry: 'Professional Services',
    sub_industry: 'Digital Marketing',
    description: 'Performance advertising, SEO agencies, conversion rate optimization, and brand studios.',
    primary_keywords: ['b2b marketing agency', 'performance marketing firm', 'seo agency services'],
    secondary_keywords: ['paid social advertising agency', 'lead generation agency', 'b2b content studio'],
    default_location_behavior: { defaultLocationCode: 'US', allowsGlobal: true },
    website_required: true,
    default_result_limit: 50,
    version: 'v2.1.0',
    status: 'ACTIVE',
    aliases: ['Marketing Agency', 'Growth Agency', 'SEO Agency', 'Lead Gen Agency']
  },
  {
    preset_id: 'prof_it_managed_services',
    name: 'Managed IT Services (MSP)',
    industry: 'Professional Services',
    sub_industry: 'IT Consulting',
    description: 'Outsourced IT helpdesk, network administration, cloud migrations, and MSP support.',
    primary_keywords: ['managed it services', 'msp it provider', 'it support company'],
    secondary_keywords: ['outsourced it helpdesk', 'business network security', 'cloud migration consultant'],
    default_location_behavior: { defaultLocationCode: 'US', allowsGlobal: true },
    website_required: true,
    default_result_limit: 50,
    version: 'v2.1.0',
    status: 'ACTIVE',
    aliases: ['MSP', 'Managed IT', 'IT Helpdesk', 'IT Support']
  },
  {
    preset_id: 'prof_legal_corporate_law',
    name: 'Corporate & Business Law Firms',
    industry: 'Professional Services',
    sub_industry: 'Legal Services',
    description: 'M&A legal counsel, intellectual property attorneys, and corporate formation lawyers.',
    primary_keywords: ['corporate law firm', 'business litigation attorney', 'intellectual property lawyer'],
    secondary_keywords: ['m&a legal advisory', 'trademark attorney', 'employment law firm'],
    default_location_behavior: { defaultLocationCode: 'US', allowsGlobal: true },
    website_required: true,
    default_result_limit: 50,
    version: 'v2.1.0',
    status: 'ACTIVE',
    aliases: ['Law Firm', 'Corporate Attorney', 'Business Lawyer']
  },
  {
    preset_id: 'prof_executive_search_staffing',
    name: 'Executive Search & Staffing Agencies',
    industry: 'Professional Services',
    sub_industry: 'Staffing & Recruiting',
    description: 'Retained executive search, technical recruitment, and healthcare staffing agencies.',
    primary_keywords: ['executive search firm', 'technical staffing agency', 'recruiting agency'],
    secondary_keywords: ['retained executive recruiter', 'locum tenens healthcare staffing', 'it recruitment firm'],
    default_location_behavior: { defaultLocationCode: 'US', allowsGlobal: true },
    website_required: true,
    default_result_limit: 50,
    version: 'v2.1.0',
    status: 'ACTIVE',
    aliases: ['Recruiter', 'Staffing Agency', 'Headhunter', 'Executive Search']
  },

  // ==========================================
  // 7. MANUFACTURING & INDUSTRIAL
  // ==========================================
  {
    preset_id: 'mfg_contract_cnc_machining',
    name: 'Precision CNC Machining & Fabrication',
    industry: 'Manufacturing & Industrial',
    sub_industry: 'Metal Fabrication',
    description: 'Custom CNC milling, precision sheet metal fabrication, and contract manufacturing.',
    primary_keywords: ['cnc machining services', 'precision sheet metal fabrication', 'custom contract manufacturing'],
    secondary_keywords: ['5-axis cnc milling', 'rapid prototyping parts', 'laser cutting services'],
    default_location_behavior: { defaultLocationCode: 'US', allowsGlobal: true },
    website_required: true,
    default_result_limit: 50,
    version: 'v2.1.0',
    status: 'ACTIVE',
    aliases: ['CNC Machining', 'Fabrication', 'Metal Stamping']
  },
  {
    preset_id: 'mfg_industrial_automation',
    name: 'Industrial Automation & Robotics',
    industry: 'Manufacturing & Industrial',
    sub_industry: 'Factory Automation',
    description: 'PLC programming, robotic arm integration, machine vision, and SCADA systems.',
    primary_keywords: ['industrial automation integrator', 'robotics system integrator', 'plc programming services'],
    secondary_keywords: ['machine vision inspection', 'automated conveyor systems', 'scada engineering'],
    default_location_behavior: { defaultLocationCode: 'US', allowsGlobal: true },
    website_required: true,
    default_result_limit: 50,
    version: 'v2.1.0',
    status: 'ACTIVE',
    aliases: ['Industrial Automation', 'Robotics Integrator', 'PLC']
  },
  {
    preset_id: 'mfg_packaging_corrugated',
    name: 'Custom Packaging & Box Manufacturers',
    industry: 'Manufacturing & Industrial',
    sub_industry: 'Packaging Solutions',
    description: 'Corrugated mailer boxes, folding cartons, luxury rigid boxes, and sustainable packaging.',
    primary_keywords: ['custom corrugated boxes', 'folding carton manufacturer', 'custom printed packaging'],
    secondary_keywords: ['rigid gift box supplier', 'sustainable packaging company', 'protective foam inserts'],
    default_location_behavior: { defaultLocationCode: 'US', allowsGlobal: true },
    website_required: true,
    default_result_limit: 50,
    version: 'v2.1.0',
    status: 'ACTIVE',
    aliases: ['Packaging', 'Custom Boxes', 'Corrugated']
  },

  // ==========================================
  // 8. LOGISTICS & TRANSPORTATION
  // ==========================================
  {
    preset_id: 'logistics_3pl_freight',
    name: 'Third-Party Logistics (3PL) & Freight',
    industry: 'Transportation & Logistics',
    sub_industry: 'Freight & Fulfillment',
    description: 'E-commerce fulfillment centers, freight forwarding, cold storage, and intermodal transport.',
    primary_keywords: ['3pl fulfillment warehouse', 'freight brokerage company', 'intermodal transportation'],
    secondary_keywords: ['cold chain storage warehouse', 'ecommerce pick and pack', 'ltl freight shipping'],
    default_location_behavior: { defaultLocationCode: 'US', allowsGlobal: true },
    website_required: true,
    default_result_limit: 50,
    version: 'v2.1.0',
    status: 'ACTIVE',
    aliases: ['3PL', 'Freight Broker', 'Warehousing', 'Fulfillment']
  },
  {
    preset_id: 'logistics_fleet_telematics',
    name: 'Fleet Telematics & GPS Tracking',
    industry: 'Transportation & Logistics',
    sub_industry: 'Fleet Technology',
    description: 'Commercial fleet management software, ELD compliance, and dashcam safety systems.',
    primary_keywords: ['fleet telematics software', 'eld compliance system', 'fleet dash cam safety'],
    secondary_keywords: ['gps fleet tracking', 'driver safety monitoring', 'fuel management system'],
    default_location_behavior: { defaultLocationCode: 'US', allowsGlobal: true },
    website_required: true,
    default_result_limit: 50,
    version: 'v2.1.0',
    status: 'ACTIVE',
    aliases: ['Fleet Management', 'Telematics', 'GPS Tracking']
  },

  // ==========================================
  // 9. EDUCATION & TRAINING
  // ==========================================
  {
    preset_id: 'edu_corporate_compliance_training',
    name: 'Corporate Training & Leadership Development',
    industry: 'Education & Training',
    sub_industry: 'Corporate Education',
    description: 'Executive coaching programs, enterprise compliance e-learning, and sales bootcamps.',
    primary_keywords: ['executive leadership coaching', 'corporate compliance training', 'sales training program'],
    secondary_keywords: ['enterprise lms content', 'management training workshop', 'workplace diversity training'],
    default_location_behavior: { defaultLocationCode: 'US', allowsGlobal: true },
    website_required: true,
    default_result_limit: 50,
    version: 'v2.1.0',
    status: 'ACTIVE',
    aliases: ['Corporate Training', 'Executive Coaching', 'Leadership Training']
  },
  {
    preset_id: 'edu_certifications_bootcamps',
    name: 'Professional Certifications & Bootcamps',
    industry: 'Education & Training',
    sub_industry: 'Professional Skills',
    description: 'Coding bootcamps, cybersecurity certification courses, and PMP credential prep.',
    primary_keywords: ['coding bootcamp', 'cybersecurity certification training', 'pmp exam prep course'],
    secondary_keywords: ['data analytics bootcamp', 'cloud engineer certification', 'tech career training'],
    default_location_behavior: { defaultLocationCode: 'US', allowsGlobal: true },
    website_required: true,
    default_result_limit: 50,
    version: 'v2.1.0',
    status: 'ACTIVE',
    aliases: ['Bootcamp', 'Certification Prep', 'Coding School']
  },

  // ==========================================
  // 10. RETAIL & E-COMMERCE
  // ==========================================
  {
    preset_id: 'retail_dtc_apparel_fashion',
    name: 'Direct-to-Consumer (DTC) Fashion Brands',
    industry: 'Retail & E-commerce',
    sub_industry: 'Apparel & Accessories',
    description: 'Independent apparel brands, sustainable activewear, and designer accessories.',
    primary_keywords: ['sustainable activewear', 'custom leather goods', 'luxury streetwear brand'],
    secondary_keywords: ['dtc apparel brand', 'bamboo clothing', 'minimalist watches brand'],
    default_location_behavior: { defaultLocationCode: 'US', allowsGlobal: true },
    website_required: true,
    default_result_limit: 50,
    version: 'v2.1.0',
    status: 'ACTIVE',
    aliases: ['DTC Apparel', 'Fashion Brand', 'Activewear']
  },
  {
    preset_id: 'retail_subscription_box',
    name: 'Subscription Commerce & Box Services',
    industry: 'Retail & E-commerce',
    sub_industry: 'Subscription Goods',
    description: 'Curated monthly subscription boxes for coffee, grooming, pet supplies, and snacks.',
    primary_keywords: ['monthly subscription box', 'curated coffee subscription', 'pet supply subscription'],
    secondary_keywords: ['grooming subscription box', 'artisan snack box', 'membership club delivery'],
    default_location_behavior: { defaultLocationCode: 'US', allowsGlobal: true },
    website_required: true,
    default_result_limit: 50,
    version: 'v2.1.0',
    status: 'ACTIVE',
    aliases: ['Subscription Box', 'SubBox', 'Subscription Club']
  },

  // ==========================================
  // 11. AUTOMOTIVE
  // ==========================================
  {
    preset_id: 'auto_fleet_commercial_leasing',
    name: 'Commercial Fleet Leasing & Vans',
    industry: 'Automotive',
    sub_industry: 'Commercial Fleet',
    description: 'Work truck upfitting, commercial cargo van leasing, and enterprise fleet acquisition.',
    primary_keywords: ['commercial van leasing', 'work truck upfitting', 'commercial vehicle fleet sales'],
    secondary_keywords: ['cargo van fleet financing', 'box truck lease', 'utility truck body builder'],
    default_location_behavior: { defaultLocationCode: 'US', allowsGlobal: true },
    website_required: true,
    default_result_limit: 50,
    version: 'v2.1.0',
    status: 'ACTIVE',
    aliases: ['Fleet Leasing', 'Commercial Vans', 'Work Trucks']
  },
  {
    preset_id: 'auto_collision_repair_centers',
    name: 'Auto Collision & Body Repair Centers',
    industry: 'Automotive',
    sub_industry: 'Vehicle Repair',
    description: 'Certified collision repair shops, paintless dent repair, and auto body restoration.',
    primary_keywords: ['collision repair center', 'auto body shop repair', 'paintless dent removal'],
    secondary_keywords: ['certified collision center', 'car paint restoration', 'bumper repair service'],
    default_location_behavior: { defaultLocationCode: 'US', allowsGlobal: true },
    website_required: true,
    default_result_limit: 50,
    version: 'v2.1.0',
    status: 'ACTIVE',
    aliases: ['Auto Body', 'Collision Repair', 'Dent Repair']
  },

  // ==========================================
  // 12. CLEANING & FACILITIES MANAGEMENT
  // ==========================================
  {
    preset_id: 'clean_commercial_janitorial',
    name: 'Commercial Janitorial & Office Cleaning',
    industry: 'Cleaning & Facilities',
    sub_industry: 'Janitorial Services',
    description: 'Nightly office cleaning, commercial floor waxing, medical facility disinfection.',
    primary_keywords: ['commercial janitorial service', 'office cleaning company', 'medical facility cleaning'],
    secondary_keywords: ['commercial floor strip and wax', 'post construction cleaning', 'industrial cleaning contractor'],
    default_location_behavior: { defaultLocationCode: 'US', allowsGlobal: true },
    website_required: true,
    default_result_limit: 50,
    version: 'v2.1.0',
    status: 'ACTIVE',
    aliases: ['Janitorial', 'Office Cleaning', 'Commercial Cleaning']
  },
  {
    preset_id: 'clean_disaster_restoration',
    name: 'Water & Fire Disaster Restoration',
    industry: 'Cleaning & Facilities',
    sub_industry: 'Disaster Restoration',
    description: 'Emergency water extraction, smoke and fire cleanup, and certified mold remediation.',
    primary_keywords: ['water damage restoration company', 'fire damage cleanup', 'mold remediation contractor'],
    secondary_keywords: ['emergency water extraction', 'sewage backup cleanup', 'structural drying service'],
    default_location_behavior: { defaultLocationCode: 'US', allowsGlobal: true },
    website_required: true,
    default_result_limit: 50,
    version: 'v2.1.0',
    status: 'ACTIVE',
    aliases: ['Restoration', 'Water Damage', 'Mold Remediation']
  },

  // ==========================================
  // 13. SECURITY SERVICES
  // ==========================================
  {
    preset_id: 'sec_commercial_surveillance_alarms',
    name: 'Commercial Surveillance & Access Control',
    industry: 'Security Services',
    sub_industry: 'Physical Security',
    description: 'Security camera installation, keycard access control systems, and commercial burglar alarms.',
    primary_keywords: ['commercial security camera installation', 'access control systems', 'commercial burglar alarm'],
    secondary_keywords: ['cctv surveillance installer', 'cloud video surveillance', 'keycard door lock installation'],
    default_location_behavior: { defaultLocationCode: 'US', allowsGlobal: true },
    website_required: true,
    default_result_limit: 50,
    version: 'v2.1.0',
    status: 'ACTIVE',
    aliases: ['Security Cameras', 'Access Control', 'Commercial Alarm']
  },

  // ==========================================
  // 14. FITNESS & WELLNESS
  // ==========================================
  {
    preset_id: 'fit_boutique_studios',
    name: 'Boutique Fitness & Pilates Studios',
    industry: 'Fitness & Wellness',
    sub_industry: 'Fitness Centers',
    description: 'Reformer Pilates studios, HIIT training clubs, and boutique fitness franchises.',
    primary_keywords: ['reformer pilates studio', 'boutique fitness club', 'hiit group fitness'],
    secondary_keywords: ['hot yoga studio', 'strength training gym membership', 'spin cycling studio'],
    default_location_behavior: { defaultLocationCode: 'US', allowsGlobal: true },
    website_required: true,
    default_result_limit: 50,
    version: 'v2.1.0',
    status: 'ACTIVE',
    aliases: ['Pilates', 'Gym', 'Fitness Studio', 'HIIT']
  }
];

/**
 * Retrieve a preset by its unique ID, name, or alias.
 */
export function getPresetById(presetId: string): ResearchPreset | undefined {
  if (!presetId) return undefined;
  const exact = RESEARCH_PRESETS.find(p => p.preset_id === presetId);
  if (exact) return exact;
  const lower = presetId.toLowerCase().trim();
  return RESEARCH_PRESETS.find(p => 
    p.preset_id.toLowerCase() === lower ||
    p.preset_id.toLowerCase().replace(/_/g, ' ') === lower ||
    p.name.toLowerCase() === lower ||
    p.aliases?.some(a => a.toLowerCase() === lower) ||
    p.aliases?.some(a => a.toLowerCase().replace(/\s+/g, '_') === lower) ||
    p.name.toLowerCase().includes(lower)
  );
}

/**
 * Retrieve unique list of industries for filtering.
 */
export function getPresetCategories(): string[] {
  const industries = Array.from(new Set(RESEARCH_PRESETS.map(p => p.industry)));
  return industries.sort();
}

/**
 * Search presets across name, industry, sub_industry, keywords, description, and aliases.
 */
export function searchPresets(query: string, industryFilter?: string): ResearchPreset[] {
  const clean = query.trim().toLowerCase();
  
  return RESEARCH_PRESETS.filter(preset => {
    // Check status: only ACTIVE presets for new research
    if (preset.status !== 'ACTIVE') return false;

    // Optional category filtering
    if (industryFilter && industryFilter !== 'ALL' && preset.industry !== industryFilter) {
      return false;
    }

    if (!clean) return true;

    if (preset.name.toLowerCase().includes(clean)) return true;
    if (preset.industry.toLowerCase().includes(clean)) return true;
    if (preset.sub_industry.toLowerCase().includes(clean)) return true;
    if (preset.description.toLowerCase().includes(clean)) return true;
    if (preset.primary_keywords.some(k => k.toLowerCase().includes(clean))) return true;
    if (preset.secondary_keywords.some(k => k.toLowerCase().includes(clean))) return true;
    if (preset.aliases?.some(a => a.toLowerCase().includes(clean))) return true;

    return false;
  });
}

/**
 * Validate a preset definition before activation.
 */
export function validatePreset(preset: Partial<ResearchPreset>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!preset.preset_id || preset.preset_id.trim().length === 0) {
    errors.push('preset_id is required.');
  }
  if (!preset.name || preset.name.trim().length === 0) {
    errors.push('name is required.');
  }
  if (!preset.industry || preset.industry.trim().length === 0) {
    errors.push('industry is required.');
  }
  if (!preset.sub_industry || preset.sub_industry.trim().length === 0) {
    errors.push('sub_industry is required.');
  }
  if (!preset.primary_keywords || preset.primary_keywords.length === 0) {
    errors.push('primary_keywords must have at least one keyword.');
  }
  if (!preset.version || preset.version.trim().length === 0) {
    errors.push('version is required.');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

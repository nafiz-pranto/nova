// src/extension/types.ts
var MAX_FINAL_UNIQUE_RELEVANT_LEADS_PER_RESEARCH = 5e3;

// src/data/presetCatalogue.ts
var RESEARCH_PRESETS = [
  // ==========================================
  // 1. TECHNOLOGY & SOFTWARE
  // ==========================================
  {
    preset_id: "tech_saas_b2b",
    name: "B2B SaaS Platforms",
    industry: "Technology & Software",
    sub_industry: "Cloud Software",
    description: "B2B cloud software providers advertising subscription business tools.",
    primary_keywords: ["saas", "cloud software", "business software"],
    secondary_keywords: ["crm", "erp", "workflow automation", "enterprise software"],
    optional_exclusions: ["free software", "pirate", "torrent"],
    default_location_behavior: { defaultLocationCode: "US", allowsGlobal: true },
    website_required: true,
    default_result_limit: 50,
    version: "v2.1.0",
    status: "ACTIVE",
    aliases: ["SaaS", "B2B Software", "Cloud Platforms", "Enterprise SaaS"]
  },
  {
    preset_id: "tech_crm_platforms",
    name: "CRM & Pipeline Software",
    industry: "Technology & Software",
    sub_industry: "Sales Technology",
    description: "Customer relationship management and sales automation software vendors.",
    primary_keywords: ["crm software", "sales pipeline software", "lead management software"],
    secondary_keywords: ["pipeline crm", "contact manager", "deal tracking"],
    default_location_behavior: { defaultLocationCode: "US", allowsGlobal: true },
    website_required: true,
    default_result_limit: 50,
    version: "v2.1.0",
    status: "ACTIVE",
    aliases: ["CRM", "Sales CRM", "Pipeline Tool"]
  },
  {
    preset_id: "tech_devops_cloud",
    name: "DevOps & Cloud Infrastructure",
    industry: "Technology & Software",
    sub_industry: "Developer Tools",
    description: "Continuous delivery, Kubernetes, cloud hosting, and infrastructure monitoring.",
    primary_keywords: ["devops platform", "kubernetes management", "cloud infrastructure"],
    secondary_keywords: ["ci/cd pipeline", "container orchestration", "cloud monitoring"],
    default_location_behavior: { defaultLocationCode: "US", allowsGlobal: true },
    website_required: true,
    default_result_limit: 50,
    version: "v2.1.0",
    status: "ACTIVE",
    aliases: ["DevOps", "Cloud Infra", "Kubernetes"]
  },
  {
    preset_id: "tech_cybersecurity_b2b",
    name: "Cybersecurity & Compliance",
    industry: "Technology & Software",
    sub_industry: "Security & Privacy",
    description: "Enterprise endpoint protection, SOC 2 compliance automation, and threat defense.",
    primary_keywords: ["cybersecurity solution", "soc 2 compliance", "endpoint security"],
    secondary_keywords: ["vulnerability management", "data security platform", "zero trust"],
    default_location_behavior: { defaultLocationCode: "US", allowsGlobal: true },
    website_required: true,
    default_result_limit: 50,
    version: "v2.1.0",
    status: "ACTIVE",
    aliases: ["Cybersecurity", "SOC 2", "InfoSec", "Penetration Testing"]
  },
  {
    preset_id: "tech_fintech_software",
    name: "FinTech & Billing Software",
    industry: "Technology & Software",
    sub_industry: "Financial Technology",
    description: "Corporate spend management, payroll automation, and recurring billing systems.",
    primary_keywords: ["spend management software", "payroll software", "subscription billing"],
    secondary_keywords: ["corporate card", "invoicing software", "expense automation"],
    default_location_behavior: { defaultLocationCode: "US", allowsGlobal: true },
    website_required: true,
    default_result_limit: 50,
    version: "v2.1.0",
    status: "ACTIVE",
    aliases: ["FinTech", "Payroll SaaS", "Billing Engine"]
  },
  {
    preset_id: "tech_hr_recruitment_saas",
    name: "HR & ATS Talent Software",
    industry: "Technology & Software",
    sub_industry: "Human Resources",
    description: "Applicant tracking systems, employee onboarding, and HR information systems.",
    primary_keywords: ["applicant tracking system", "hr software", "employee onboarding platform"],
    secondary_keywords: ["ats software", "hris", "recruitment software"],
    default_location_behavior: { defaultLocationCode: "US", allowsGlobal: true },
    website_required: true,
    default_result_limit: 50,
    version: "v2.1.0",
    status: "ACTIVE",
    aliases: ["HR Tech", "ATS", "HRIS", "Staffing Software"]
  },
  // ==========================================
  // 2. HEALTHCARE & MEDICAL
  // ==========================================
  {
    preset_id: "health_dental_clinics",
    name: "Dental & Orthodontic Clinics",
    industry: "Healthcare & Medical",
    sub_industry: "Dental Services",
    description: "Private dental practices advertising cosmetic dentistry, implants, and clear aligners.",
    primary_keywords: ["dental implants", "cosmetic dentist", "clear aligners"],
    secondary_keywords: ["emergency dentist", "teeth whitening clinic", "invisalign dentist"],
    default_location_behavior: { defaultLocationCode: "US", allowsGlobal: true },
    website_required: true,
    default_result_limit: 50,
    version: "v2.1.0",
    status: "ACTIVE",
    aliases: ["Dentist", "Orthodontist", "Dental Implants"]
  },
  {
    preset_id: "health_med_spa_aesthetic",
    name: "Medical Spas & Aesthetics",
    industry: "Healthcare & Medical",
    sub_industry: "Aesthetic Medicine",
    description: "Clinics offering Botox, dermal fillers, laser skin resurfacing, and body contouring.",
    primary_keywords: ["med spa", "botox clinic", "laser hair removal"],
    secondary_keywords: ["dermal fillers", "body contouring", "skin rejuvenation clinic"],
    default_location_behavior: { defaultLocationCode: "US", allowsGlobal: true },
    website_required: true,
    default_result_limit: 50,
    version: "v2.1.0",
    status: "ACTIVE",
    aliases: ["MedSpa", "Aesthetic Clinic", "Cosmetic Dermatology"]
  },
  {
    preset_id: "health_mental_telehealth",
    name: "Mental Health & Teletherapy",
    industry: "Healthcare & Medical",
    sub_industry: "Mental Health",
    description: "Private therapy practices, online counseling, and licensed mental health clinics.",
    primary_keywords: ["online therapy", "licensed counselor", "adhd assessment clinic"],
    secondary_keywords: ["couples therapy", "telehealth psychiatry", "anxiety counseling"],
    default_location_behavior: { defaultLocationCode: "US", allowsGlobal: true },
    website_required: true,
    default_result_limit: 50,
    version: "v2.1.0",
    status: "ACTIVE",
    aliases: ["Therapy", "Telehealth", "Counseling", "Psychiatry"]
  },
  {
    preset_id: "health_veterinary_clinics",
    name: "Veterinary Hospitals & Clinics",
    industry: "Healthcare & Medical",
    sub_industry: "Veterinary Medicine",
    description: "Animal hospitals, urgent pet care, and companion animal veterinary clinics.",
    primary_keywords: ["veterinary hospital", "animal clinic", "emergency vet"],
    secondary_keywords: ["pet wellness exam", "vet surgery clinic", "canine care center"],
    default_location_behavior: { defaultLocationCode: "US", allowsGlobal: true },
    website_required: true,
    default_result_limit: 50,
    version: "v2.1.0",
    status: "ACTIVE",
    aliases: ["Vet", "Animal Hospital", "Veterinarian"]
  },
  {
    preset_id: "health_optometry_eyecare",
    name: "Optometry & Eye Care Centers",
    industry: "Healthcare & Medical",
    sub_industry: "Vision Care",
    description: "Independent optometrists, LASIK eye surgery clinics, and designer optical boutiques.",
    primary_keywords: ["lasik eye surgery", "optometrist eye exam", "designer eyewear clinic"],
    secondary_keywords: ["cataract surgery center", "vision correction", "prescription glasses clinic"],
    default_location_behavior: { defaultLocationCode: "US", allowsGlobal: true },
    website_required: true,
    default_result_limit: 50,
    version: "v2.1.0",
    status: "ACTIVE",
    aliases: ["Eye Clinic", "LASIK", "Optometrist"]
  },
  // ==========================================
  // 3. HOME SERVICES & TRADES
  // ==========================================
  {
    preset_id: "home_hvac_heating_cooling",
    name: "HVAC Installation & Repair",
    industry: "Home Services & Trades",
    sub_industry: "Climate Control",
    description: "Air conditioning, heat pump replacement, and furnace repair contractors.",
    primary_keywords: ["ac installation", "furnace replacement", "hvac repair contractor"],
    secondary_keywords: ["heat pump installation", "air conditioning service", "emergency hvac"],
    default_location_behavior: { defaultLocationCode: "US", allowsGlobal: true },
    website_required: true,
    default_result_limit: 50,
    version: "v2.1.0",
    status: "ACTIVE",
    aliases: ["HVAC", "Air Conditioning", "Heating", "Heat Pump"]
  },
  {
    preset_id: "home_roofing_contractors",
    name: "Roofing & Siding Contractors",
    industry: "Home Services & Trades",
    sub_industry: "Exterior Remodeling",
    description: "Commercial and residential roof replacement, hail damage repair, and gutter systems.",
    primary_keywords: ["roof replacement contractor", "roof repair company", "metal roofing"],
    secondary_keywords: ["storm damage roof inspection", "residential siding", "seamless gutters"],
    default_location_behavior: { defaultLocationCode: "US", allowsGlobal: true },
    website_required: true,
    default_result_limit: 50,
    version: "v2.1.0",
    status: "ACTIVE",
    aliases: ["Roofing", "Roofers", "Siding Contractor"]
  },
  {
    preset_id: "home_solar_energy",
    name: "Solar Panel Installation & Batteries",
    industry: "Home Services & Trades",
    sub_industry: "Renewable Energy",
    description: "Residential solar power systems, battery backup storage, and commercial solar EPC.",
    primary_keywords: ["solar panel installation", "home battery backup", "commercial solar"],
    secondary_keywords: ["residential solar financing", "solar roof quote", "clean energy savings"],
    default_location_behavior: { defaultLocationCode: "US", allowsGlobal: true },
    website_required: true,
    default_result_limit: 50,
    version: "v2.1.0",
    status: "ACTIVE",
    aliases: ["Solar", "Renewable Energy", "Solar Financing", "Solar Panels"]
  },
  {
    preset_id: "home_plumbing_water",
    name: "Plumbing & Water Filtration",
    industry: "Home Services & Trades",
    sub_industry: "Plumbing Systems",
    description: "Plumbing repairs, tankless water heater installation, and whole-house filtration.",
    primary_keywords: ["emergency plumber", "water heater replacement", "whole house water filter"],
    secondary_keywords: ["drain cleaning service", "tankless water heater", "sewer line repair"],
    default_location_behavior: { defaultLocationCode: "US", allowsGlobal: true },
    website_required: true,
    default_result_limit: 50,
    version: "v2.1.0",
    status: "ACTIVE",
    aliases: ["Plumber", "Plumbing", "Water Heaters"]
  },
  {
    preset_id: "home_pest_control",
    name: "Pest & Termite Control",
    industry: "Home Services & Trades",
    sub_industry: "Pest Management",
    description: "Exterminator services, termite inspections, bed bug treatments, and rodent exclusion.",
    primary_keywords: ["pest control service", "termite inspection company", "bed bug treatment"],
    secondary_keywords: ["commercial exterminator", "rodent control", "mosquito defense program"],
    default_location_behavior: { defaultLocationCode: "US", allowsGlobal: true },
    website_required: true,
    default_result_limit: 50,
    version: "v2.1.0",
    status: "ACTIVE",
    aliases: ["Pest Control", "Exterminator", "Termite Control"]
  },
  // ==========================================
  // 4. FINANCIAL SERVICES
  // ==========================================
  {
    preset_id: "fin_commercial_lending",
    name: "Commercial & Business Lending",
    industry: "Financial Services",
    sub_industry: "Commercial Financing",
    description: "Equipment financing, working capital lines of credit, and SBA commercial loans.",
    primary_keywords: ["business loan", "equipment financing", "working capital line of credit"],
    secondary_keywords: ["sba loan broker", "commercial mortgage financing", "invoice factoring"],
    default_location_behavior: { defaultLocationCode: "US", allowsGlobal: true },
    website_required: true,
    default_result_limit: 50,
    version: "v2.1.0",
    status: "ACTIVE",
    aliases: ["Business Loans", "Commercial Lending", "Equipment Lease"]
  },
  {
    preset_id: "fin_wealth_management",
    name: "Wealth Advisory & Financial Planning",
    industry: "Financial Services",
    sub_industry: "Wealth Advisory",
    description: "Fiduciary financial advisors, retirement planners, and high-net-worth wealth managers.",
    primary_keywords: ["wealth management firm", "fiduciary financial advisor", "retirement planning"],
    secondary_keywords: ["estate planning advisory", "high net worth wealth planner", "portfolio management"],
    default_location_behavior: { defaultLocationCode: "US", allowsGlobal: true },
    website_required: true,
    default_result_limit: 50,
    version: "v2.1.0",
    status: "ACTIVE",
    aliases: ["Wealth Advisor", "Financial Planner", "RIA"]
  },
  {
    preset_id: "fin_tax_accounting_cpa",
    name: "Tax Advisory & CPA Firms",
    industry: "Financial Services",
    sub_industry: "Tax & Accounting",
    description: "Certified public accountants, corporate tax prep, audit, and outsourced bookkeeping.",
    primary_keywords: ["cpa firm", "corporate tax advisory", "outsourced bookkeeping services"],
    secondary_keywords: ["tax resolution specialist", "fractional cfo services", "business tax preparation"],
    default_location_behavior: { defaultLocationCode: "US", allowsGlobal: true },
    website_required: true,
    default_result_limit: 50,
    version: "v2.1.0",
    status: "ACTIVE",
    aliases: ["CPA", "Tax Prep", "Bookkeeping", "Accounting Firm"]
  },
  {
    preset_id: "fin_business_insurance",
    name: "Commercial & Business Insurance",
    industry: "Financial Services",
    sub_industry: "Commercial Insurance",
    description: "General liability, cyber insurance, commercial auto, and workers compensation.",
    primary_keywords: ["commercial insurance broker", "general liability insurance", "workers comp insurance"],
    secondary_keywords: ["cyber liability insurance", "errors and omissions policy", "business owners policy"],
    default_location_behavior: { defaultLocationCode: "US", allowsGlobal: true },
    website_required: true,
    default_result_limit: 50,
    version: "v2.1.0",
    status: "ACTIVE",
    aliases: ["Commercial Insurance", "Business Insurance", "BOP"]
  },
  // ==========================================
  // 5. REAL ESTATE & PROPERTY
  // ==========================================
  {
    preset_id: "real_commercial_brokerage",
    name: "Commercial Real Estate Brokerages",
    industry: "Real Estate & Property",
    sub_industry: "Commercial Properties",
    description: "Office, retail, and industrial leasing brokers, triple-net investment advisors.",
    primary_keywords: ["commercial real estate broker", "industrial warehouse lease", "office space leasing"],
    secondary_keywords: ["retail space commercial lease", "nnn investment properties", "commercial property sales"],
    default_location_behavior: { defaultLocationCode: "US", allowsGlobal: true },
    website_required: true,
    default_result_limit: 50,
    version: "v2.1.0",
    status: "ACTIVE",
    aliases: ["CRE", "Commercial Real Estate", "Warehouse Lease"]
  },
  {
    preset_id: "real_property_management",
    name: "Property Management Companies",
    industry: "Real Estate & Property",
    sub_industry: "Asset Management",
    description: "Multifamily residential management, HOA management, and commercial property care.",
    primary_keywords: ["property management company", "hoa management services", "multifamily property manager"],
    secondary_keywords: ["rental property management", "commercial asset management", "tenant placement agency"],
    default_location_behavior: { defaultLocationCode: "US", allowsGlobal: true },
    website_required: true,
    default_result_limit: 50,
    version: "v2.1.0",
    status: "ACTIVE",
    aliases: ["Property Manager", "HOA Management", "Rental Management"]
  },
  {
    preset_id: "real_luxury_brokerages",
    name: "Luxury Residential Real Estate",
    industry: "Real Estate & Property",
    sub_industry: "Residential Brokerage",
    description: "High-end home brokerages, luxury estate specialists, and waterfront property realtors.",
    primary_keywords: ["luxury real estate agent", "waterfront homes for sale", "luxury estate brokerage"],
    secondary_keywords: ["custom home realtor", "high end listing agent", "gated community homes"],
    default_location_behavior: { defaultLocationCode: "US", allowsGlobal: true },
    website_required: true,
    default_result_limit: 50,
    version: "v2.1.0",
    status: "ACTIVE",
    aliases: ["Luxury Realtor", "Real Estate Agent", "Residential Brokerage"]
  },
  // ==========================================
  // 6. PROFESSIONAL & BUSINESS SERVICES
  // ==========================================
  {
    preset_id: "prof_growth_marketing_agencies",
    name: "B2B Digital Marketing Agencies",
    industry: "Professional Services",
    sub_industry: "Digital Marketing",
    description: "Performance advertising, SEO agencies, conversion rate optimization, and brand studios.",
    primary_keywords: ["b2b marketing agency", "performance marketing firm", "seo agency services"],
    secondary_keywords: ["paid social advertising agency", "lead generation agency", "b2b content studio"],
    default_location_behavior: { defaultLocationCode: "US", allowsGlobal: true },
    website_required: true,
    default_result_limit: 50,
    version: "v2.1.0",
    status: "ACTIVE",
    aliases: ["Marketing Agency", "Growth Agency", "SEO Agency", "Lead Gen Agency"]
  },
  {
    preset_id: "prof_it_managed_services",
    name: "Managed IT Services (MSP)",
    industry: "Professional Services",
    sub_industry: "IT Consulting",
    description: "Outsourced IT helpdesk, network administration, cloud migrations, and MSP support.",
    primary_keywords: ["managed it services", "msp it provider", "it support company"],
    secondary_keywords: ["outsourced it helpdesk", "business network security", "cloud migration consultant"],
    default_location_behavior: { defaultLocationCode: "US", allowsGlobal: true },
    website_required: true,
    default_result_limit: 50,
    version: "v2.1.0",
    status: "ACTIVE",
    aliases: ["MSP", "Managed IT", "IT Helpdesk", "IT Support"]
  },
  {
    preset_id: "prof_legal_corporate_law",
    name: "Corporate & Business Law Firms",
    industry: "Professional Services",
    sub_industry: "Legal Services",
    description: "M&A legal counsel, intellectual property attorneys, and corporate formation lawyers.",
    primary_keywords: ["corporate law firm", "business litigation attorney", "intellectual property lawyer"],
    secondary_keywords: ["m&a legal advisory", "trademark attorney", "employment law firm"],
    default_location_behavior: { defaultLocationCode: "US", allowsGlobal: true },
    website_required: true,
    default_result_limit: 50,
    version: "v2.1.0",
    status: "ACTIVE",
    aliases: ["Law Firm", "Corporate Attorney", "Business Lawyer"]
  },
  {
    preset_id: "prof_executive_search_staffing",
    name: "Executive Search & Staffing Agencies",
    industry: "Professional Services",
    sub_industry: "Staffing & Recruiting",
    description: "Retained executive search, technical recruitment, and healthcare staffing agencies.",
    primary_keywords: ["executive search firm", "technical staffing agency", "recruiting agency"],
    secondary_keywords: ["retained executive recruiter", "locum tenens healthcare staffing", "it recruitment firm"],
    default_location_behavior: { defaultLocationCode: "US", allowsGlobal: true },
    website_required: true,
    default_result_limit: 50,
    version: "v2.1.0",
    status: "ACTIVE",
    aliases: ["Recruiter", "Staffing Agency", "Headhunter", "Executive Search"]
  },
  // ==========================================
  // 7. MANUFACTURING & INDUSTRIAL
  // ==========================================
  {
    preset_id: "mfg_contract_cnc_machining",
    name: "Precision CNC Machining & Fabrication",
    industry: "Manufacturing & Industrial",
    sub_industry: "Metal Fabrication",
    description: "Custom CNC milling, precision sheet metal fabrication, and contract manufacturing.",
    primary_keywords: ["cnc machining services", "precision sheet metal fabrication", "custom contract manufacturing"],
    secondary_keywords: ["5-axis cnc milling", "rapid prototyping parts", "laser cutting services"],
    default_location_behavior: { defaultLocationCode: "US", allowsGlobal: true },
    website_required: true,
    default_result_limit: 50,
    version: "v2.1.0",
    status: "ACTIVE",
    aliases: ["CNC Machining", "Fabrication", "Metal Stamping"]
  },
  {
    preset_id: "mfg_industrial_automation",
    name: "Industrial Automation & Robotics",
    industry: "Manufacturing & Industrial",
    sub_industry: "Factory Automation",
    description: "PLC programming, robotic arm integration, machine vision, and SCADA systems.",
    primary_keywords: ["industrial automation integrator", "robotics system integrator", "plc programming services"],
    secondary_keywords: ["machine vision inspection", "automated conveyor systems", "scada engineering"],
    default_location_behavior: { defaultLocationCode: "US", allowsGlobal: true },
    website_required: true,
    default_result_limit: 50,
    version: "v2.1.0",
    status: "ACTIVE",
    aliases: ["Industrial Automation", "Robotics Integrator", "PLC"]
  },
  {
    preset_id: "mfg_packaging_corrugated",
    name: "Custom Packaging & Box Manufacturers",
    industry: "Manufacturing & Industrial",
    sub_industry: "Packaging Solutions",
    description: "Corrugated mailer boxes, folding cartons, luxury rigid boxes, and sustainable packaging.",
    primary_keywords: ["custom corrugated boxes", "folding carton manufacturer", "custom printed packaging"],
    secondary_keywords: ["rigid gift box supplier", "sustainable packaging company", "protective foam inserts"],
    default_location_behavior: { defaultLocationCode: "US", allowsGlobal: true },
    website_required: true,
    default_result_limit: 50,
    version: "v2.1.0",
    status: "ACTIVE",
    aliases: ["Packaging", "Custom Boxes", "Corrugated"]
  },
  // ==========================================
  // 8. LOGISTICS & TRANSPORTATION
  // ==========================================
  {
    preset_id: "logistics_3pl_freight",
    name: "Third-Party Logistics (3PL) & Freight",
    industry: "Transportation & Logistics",
    sub_industry: "Freight & Fulfillment",
    description: "E-commerce fulfillment centers, freight forwarding, cold storage, and intermodal transport.",
    primary_keywords: ["3pl fulfillment warehouse", "freight brokerage company", "intermodal transportation"],
    secondary_keywords: ["cold chain storage warehouse", "ecommerce pick and pack", "ltl freight shipping"],
    default_location_behavior: { defaultLocationCode: "US", allowsGlobal: true },
    website_required: true,
    default_result_limit: 50,
    version: "v2.1.0",
    status: "ACTIVE",
    aliases: ["3PL", "Freight Broker", "Warehousing", "Fulfillment"]
  },
  {
    preset_id: "logistics_fleet_telematics",
    name: "Fleet Telematics & GPS Tracking",
    industry: "Transportation & Logistics",
    sub_industry: "Fleet Technology",
    description: "Commercial fleet management software, ELD compliance, and dashcam safety systems.",
    primary_keywords: ["fleet telematics software", "eld compliance system", "fleet dash cam safety"],
    secondary_keywords: ["gps fleet tracking", "driver safety monitoring", "fuel management system"],
    default_location_behavior: { defaultLocationCode: "US", allowsGlobal: true },
    website_required: true,
    default_result_limit: 50,
    version: "v2.1.0",
    status: "ACTIVE",
    aliases: ["Fleet Management", "Telematics", "GPS Tracking"]
  },
  // ==========================================
  // 9. EDUCATION & TRAINING
  // ==========================================
  {
    preset_id: "edu_corporate_compliance_training",
    name: "Corporate Training & Leadership Development",
    industry: "Education & Training",
    sub_industry: "Corporate Education",
    description: "Executive coaching programs, enterprise compliance e-learning, and sales bootcamps.",
    primary_keywords: ["executive leadership coaching", "corporate compliance training", "sales training program"],
    secondary_keywords: ["enterprise lms content", "management training workshop", "workplace diversity training"],
    default_location_behavior: { defaultLocationCode: "US", allowsGlobal: true },
    website_required: true,
    default_result_limit: 50,
    version: "v2.1.0",
    status: "ACTIVE",
    aliases: ["Corporate Training", "Executive Coaching", "Leadership Training"]
  },
  {
    preset_id: "edu_certifications_bootcamps",
    name: "Professional Certifications & Bootcamps",
    industry: "Education & Training",
    sub_industry: "Professional Skills",
    description: "Coding bootcamps, cybersecurity certification courses, and PMP credential prep.",
    primary_keywords: ["coding bootcamp", "cybersecurity certification training", "pmp exam prep course"],
    secondary_keywords: ["data analytics bootcamp", "cloud engineer certification", "tech career training"],
    default_location_behavior: { defaultLocationCode: "US", allowsGlobal: true },
    website_required: true,
    default_result_limit: 50,
    version: "v2.1.0",
    status: "ACTIVE",
    aliases: ["Bootcamp", "Certification Prep", "Coding School"]
  },
  // ==========================================
  // 10. RETAIL & E-COMMERCE
  // ==========================================
  {
    preset_id: "retail_dtc_apparel_fashion",
    name: "Direct-to-Consumer (DTC) Fashion Brands",
    industry: "Retail & E-commerce",
    sub_industry: "Apparel & Accessories",
    description: "Independent apparel brands, sustainable activewear, and designer accessories.",
    primary_keywords: ["sustainable activewear", "custom leather goods", "luxury streetwear brand"],
    secondary_keywords: ["dtc apparel brand", "bamboo clothing", "minimalist watches brand"],
    default_location_behavior: { defaultLocationCode: "US", allowsGlobal: true },
    website_required: true,
    default_result_limit: 50,
    version: "v2.1.0",
    status: "ACTIVE",
    aliases: ["DTC Apparel", "Fashion Brand", "Activewear"]
  },
  {
    preset_id: "retail_subscription_box",
    name: "Subscription Commerce & Box Services",
    industry: "Retail & E-commerce",
    sub_industry: "Subscription Goods",
    description: "Curated monthly subscription boxes for coffee, grooming, pet supplies, and snacks.",
    primary_keywords: ["monthly subscription box", "curated coffee subscription", "pet supply subscription"],
    secondary_keywords: ["grooming subscription box", "artisan snack box", "membership club delivery"],
    default_location_behavior: { defaultLocationCode: "US", allowsGlobal: true },
    website_required: true,
    default_result_limit: 50,
    version: "v2.1.0",
    status: "ACTIVE",
    aliases: ["Subscription Box", "SubBox", "Subscription Club"]
  },
  // ==========================================
  // 11. AUTOMOTIVE
  // ==========================================
  {
    preset_id: "auto_fleet_commercial_leasing",
    name: "Commercial Fleet Leasing & Vans",
    industry: "Automotive",
    sub_industry: "Commercial Fleet",
    description: "Work truck upfitting, commercial cargo van leasing, and enterprise fleet acquisition.",
    primary_keywords: ["commercial van leasing", "work truck upfitting", "commercial vehicle fleet sales"],
    secondary_keywords: ["cargo van fleet financing", "box truck lease", "utility truck body builder"],
    default_location_behavior: { defaultLocationCode: "US", allowsGlobal: true },
    website_required: true,
    default_result_limit: 50,
    version: "v2.1.0",
    status: "ACTIVE",
    aliases: ["Fleet Leasing", "Commercial Vans", "Work Trucks"]
  },
  {
    preset_id: "auto_collision_repair_centers",
    name: "Auto Collision & Body Repair Centers",
    industry: "Automotive",
    sub_industry: "Vehicle Repair",
    description: "Certified collision repair shops, paintless dent repair, and auto body restoration.",
    primary_keywords: ["collision repair center", "auto body shop repair", "paintless dent removal"],
    secondary_keywords: ["certified collision center", "car paint restoration", "bumper repair service"],
    default_location_behavior: { defaultLocationCode: "US", allowsGlobal: true },
    website_required: true,
    default_result_limit: 50,
    version: "v2.1.0",
    status: "ACTIVE",
    aliases: ["Auto Body", "Collision Repair", "Dent Repair"]
  },
  // ==========================================
  // 12. CLEANING & FACILITIES MANAGEMENT
  // ==========================================
  {
    preset_id: "clean_commercial_janitorial",
    name: "Commercial Janitorial & Office Cleaning",
    industry: "Cleaning & Facilities",
    sub_industry: "Janitorial Services",
    description: "Nightly office cleaning, commercial floor waxing, medical facility disinfection.",
    primary_keywords: ["commercial janitorial service", "office cleaning company", "medical facility cleaning"],
    secondary_keywords: ["commercial floor strip and wax", "post construction cleaning", "industrial cleaning contractor"],
    default_location_behavior: { defaultLocationCode: "US", allowsGlobal: true },
    website_required: true,
    default_result_limit: 50,
    version: "v2.1.0",
    status: "ACTIVE",
    aliases: ["Janitorial", "Office Cleaning", "Commercial Cleaning"]
  },
  {
    preset_id: "clean_disaster_restoration",
    name: "Water & Fire Disaster Restoration",
    industry: "Cleaning & Facilities",
    sub_industry: "Disaster Restoration",
    description: "Emergency water extraction, smoke and fire cleanup, and certified mold remediation.",
    primary_keywords: ["water damage restoration company", "fire damage cleanup", "mold remediation contractor"],
    secondary_keywords: ["emergency water extraction", "sewage backup cleanup", "structural drying service"],
    default_location_behavior: { defaultLocationCode: "US", allowsGlobal: true },
    website_required: true,
    default_result_limit: 50,
    version: "v2.1.0",
    status: "ACTIVE",
    aliases: ["Restoration", "Water Damage", "Mold Remediation"]
  },
  // ==========================================
  // 13. SECURITY SERVICES
  // ==========================================
  {
    preset_id: "sec_commercial_surveillance_alarms",
    name: "Commercial Surveillance & Access Control",
    industry: "Security Services",
    sub_industry: "Physical Security",
    description: "Security camera installation, keycard access control systems, and commercial burglar alarms.",
    primary_keywords: ["commercial security camera installation", "access control systems", "commercial burglar alarm"],
    secondary_keywords: ["cctv surveillance installer", "cloud video surveillance", "keycard door lock installation"],
    default_location_behavior: { defaultLocationCode: "US", allowsGlobal: true },
    website_required: true,
    default_result_limit: 50,
    version: "v2.1.0",
    status: "ACTIVE",
    aliases: ["Security Cameras", "Access Control", "Commercial Alarm"]
  },
  // ==========================================
  // 14. FITNESS & WELLNESS
  // ==========================================
  {
    preset_id: "fit_boutique_studios",
    name: "Boutique Fitness & Pilates Studios",
    industry: "Fitness & Wellness",
    sub_industry: "Fitness Centers",
    description: "Reformer Pilates studios, HIIT training clubs, and boutique fitness franchises.",
    primary_keywords: ["reformer pilates studio", "boutique fitness club", "hiit group fitness"],
    secondary_keywords: ["hot yoga studio", "strength training gym membership", "spin cycling studio"],
    default_location_behavior: { defaultLocationCode: "US", allowsGlobal: true },
    website_required: true,
    default_result_limit: 50,
    version: "v2.1.0",
    status: "ACTIVE",
    aliases: ["Pilates", "Gym", "Fitness Studio", "HIIT"]
  }
];

// src/extension/relevanceEngine.ts
var RELEVANCE_STRATEGY_VERSION = 2;
var RELEVANCE_ENGINE_VERSION = "strict-v2";
var BOUNDED_TAXONOMY = {
  furniture: {
    category: "furniture",
    rootTerms: ["furniture", "furnishing", "furnishings", "furnish"],
    productServiceTerms: [
      "chair",
      "table",
      "desk",
      "sofa",
      "couch",
      "bed",
      "mattress",
      "cabinet",
      "wardrobe",
      "dining",
      "bench",
      "drawer",
      "drawers",
      "stool",
      "bookshelf",
      "shelf",
      "shelves",
      "almirah",
      "cupboard",
      "recliner",
      "credenza",
      "workstation",
      "seating",
      "lounge",
      "headboard",
      "nightstand",
      "dresser",
      "vanity",
      "sideboard",
      "armchair",
      "futon",
      "loveseat",
      "ottoman",
      "sectional",
      "ergonomic chair",
      "standing desk",
      "bedroom set"
    ],
    industryDescriptors: [
      "furniture store",
      "furniture retailer",
      "furniture manufacturer",
      "furniture studio",
      "home furniture",
      "office furniture",
      "wood furniture",
      "custom furniture",
      "living room",
      "bedroom set",
      "dining room"
    ],
    conflictingCategories: ["sports", "healthcare", "politics", "gaming", "casino", "education", "news_media"]
  },
  restaurant: {
    category: "restaurant",
    rootTerms: ["restaurant", "dining", "eatery", "bistro", "cafe", "food"],
    productServiceTerms: [
      "menu",
      "cuisine",
      "chef",
      "catering",
      "takeaway",
      "takeout",
      "delivery",
      "breakfast",
      "lunch",
      "dinner",
      "brunch",
      "burger",
      "pizza",
      "pasta",
      "steak",
      "seafood",
      "dessert",
      "cocktails",
      "wine",
      "appetizers",
      "buffet"
    ],
    industryDescriptors: [
      "fine dining",
      "casual dining",
      "restaurant & bar",
      "cafe & bakery",
      "culinary"
    ],
    conflictingCategories: ["sports", "politics", "gaming", "casino"]
  },
  dental: {
    category: "dental",
    rootTerms: ["dentist", "dental", "orthodontist", "orthodontics"],
    productServiceTerms: [
      "teeth",
      "tooth",
      "invisalign",
      "braces",
      "whitening",
      "implants",
      "cleaning",
      "denture",
      "crown",
      "veneer",
      "extraction",
      "cavity",
      "oral surgery"
    ],
    industryDescriptors: ["dental clinic", "dental practice", "family dentistry"],
    conflictingCategories: ["sports", "politics", "gaming", "furniture"]
  },
  roofing: {
    category: "roofing",
    rootTerms: ["roof", "roofing", "roofer"],
    productServiceTerms: [
      "shingles",
      "gutters",
      "siding",
      "leak repair",
      "metal roof",
      "tile roof",
      "flat roof",
      "roof inspection",
      "roof replacement",
      "flashing",
      "soffit"
    ],
    industryDescriptors: ["roofing contractor", "roofing company", "roofing specialists"],
    conflictingCategories: ["sports", "politics", "gaming"]
  },
  real_estate: {
    category: "real_estate",
    rootTerms: ["real estate", "realty", "realtor", "property", "properties"],
    productServiceTerms: [
      "apartment",
      "condo",
      "townhouse",
      "villa",
      "homes for sale",
      "open house",
      "mortgage",
      "brokerage",
      "leasing",
      "tenant",
      "landlord",
      "commercial space"
    ],
    industryDescriptors: ["real estate agency", "property group", "real estate broker"],
    conflictingCategories: ["sports", "politics", "gaming"]
  },
  marketing_agency: {
    category: "marketing_agency",
    rootTerms: ["marketing agency", "digital marketing", "advertising agency", "media agency"],
    productServiceTerms: [
      "seo",
      "ppc",
      "lead generation",
      "social media marketing",
      "branding",
      "content marketing",
      "web design",
      "growth marketing",
      "performance marketing"
    ],
    industryDescriptors: ["creative agency", "marketing partner", "growth agency"],
    conflictingCategories: ["sports", "politics", "gaming"]
  },
  clothing: {
    category: "clothing",
    rootTerms: ["clothing", "apparel", "fashion", "wear", "garments"],
    productServiceTerms: [
      "dress",
      "shirt",
      "pants",
      "t-shirt",
      "jacket",
      "hoodie",
      "shoes",
      "footwear",
      "denim",
      "jeans",
      "boutique",
      "suits",
      "outfit",
      "swimwear"
    ],
    industryDescriptors: ["clothing brand", "fashion boutique", "apparel store"],
    conflictingCategories: ["sports_team", "politics", "gaming"]
  },
  fitness: {
    category: "fitness",
    rootTerms: ["fitness", "gym", "workout", "training"],
    productServiceTerms: [
      "personal trainer",
      "crossfit",
      "bodybuilding",
      "weightlifting",
      "cardio",
      "yoga",
      "pilates",
      "membership",
      "strength training",
      "coaching"
    ],
    industryDescriptors: ["fitness center", "health club", "gym & fitness"],
    conflictingCategories: ["politics", "gaming", "casino"]
  },
  saas: {
    category: "saas",
    rootTerms: ["saas", "cloud software", "business software", "software platform"],
    productServiceTerms: [
      "crm",
      "erp",
      "pipeline",
      "workflow automation",
      "subscription",
      "enterprise software",
      "dashboard",
      "analytics tool",
      "b2b platform"
    ],
    industryDescriptors: ["b2b saas", "software provider", "cloud solution"],
    conflictingCategories: ["sports", "politics", "casino"]
  },
  construction: {
    category: "construction",
    rootTerms: ["construction", "contractor", "builder", "remodeling"],
    productServiceTerms: [
      "renovation",
      "drywall",
      "masonry",
      "excavation",
      "framing",
      "general contractor",
      "commercial building",
      "home addition",
      "deck building",
      "demolition"
    ],
    industryDescriptors: ["construction company", "building contractors"],
    conflictingCategories: ["sports", "politics", "gaming"]
  },
  photography: {
    category: "photography",
    rootTerms: ["photography", "photographer", "photoshoot"],
    productServiceTerms: [
      "portrait",
      "wedding photography",
      "headshots",
      "studio portrait",
      "videography",
      "photo session",
      "commercial photography",
      "event photography"
    ],
    industryDescriptors: ["photo studio", "photography services"],
    conflictingCategories: ["sports_team", "politics", "gaming"]
  },
  hvac: {
    category: "hvac",
    rootTerms: ["hvac", "air conditioning", "heating", "cooling", "ventilation"],
    productServiceTerms: [
      "furnace",
      "heat pump",
      "duct",
      "ductwork",
      "ac repair",
      "thermostat",
      "compressor",
      "refrigerant",
      "boiler",
      "air filter"
    ],
    industryDescriptors: ["hvac contractor", "heating repair", "ac installation"],
    conflictingCategories: ["sports", "politics", "gaming"]
  }
};
var NEGATIVE_CATEGORIES = [
  {
    category: "sports",
    terms: [
      "manchester united",
      "premier league",
      "football club",
      "soccer team",
      "cricket board",
      "champions league",
      "matchday",
      "fifa",
      "uefa",
      "nba",
      "nfl",
      "sports club",
      "women team",
      "head coach",
      "stadium"
    ],
    entityTokens: ["fc", "united", "stadium", "club", "league", "team", "cricket", "football", "fifa", "uefa"],
    penalty: -0.65
  },
  {
    category: "healthcare",
    terms: [
      "health support community",
      "saved my husband",
      "seventy-nine",
      "cancer treatment",
      "diabetes remedy",
      "chronic illness",
      "prescription drug",
      "patient clinical",
      "health injustice",
      "clinical trial",
      "disease cure",
      "medical hospital",
      "dental care clinic"
    ],
    entityTokens: ["hospital", "clinic", "medical", "pharma", "health", "doctor", "patient"],
    penalty: -0.65
  },
  {
    category: "politics",
    terms: [
      "political campaign",
      "election rally",
      "vote for",
      "parliament member",
      "political party",
      "candidate for senate",
      "citizens for governance",
      "ballot initiative",
      "party congress"
    ],
    entityTokens: ["party", "senate", "parliament", "campaign", "governance", "election", "voters"],
    penalty: -0.65
  },
  {
    category: "gaming_casino",
    terms: [
      "online casino",
      "slot machine",
      "jackpot betting",
      "poker chips",
      "crypto casino",
      "betting odds",
      "spin to win",
      "roulette online"
    ],
    entityTokens: ["casino", "betting", "poker", "slots", "jackpot"],
    penalty: -0.65
  },
  {
    category: "news_media",
    terms: [
      "breaking news",
      "daily news",
      "news network",
      "news channel",
      "broadcasting station",
      "journalism report",
      "magazine online"
    ],
    entityTokens: ["news", "media", "journal", "broadcasting", "times", "chronicle", "gazette"],
    penalty: -0.55
  },
  {
    category: "education",
    terms: [
      "university admissions",
      "undergraduate degree",
      "campus tuition",
      "public school district",
      "college alumni",
      "academic curriculum"
    ],
    entityTokens: ["university", "college", "school", "academy", "campus", "alumni"],
    penalty: -0.55
  },
  {
    category: "charity_ngo",
    terms: [
      "charity relief",
      "humanitarian aid",
      "donation campaign",
      "non-profit organization",
      "relief fund",
      "donate now to support"
    ],
    entityTokens: ["charity", "foundation", "relief", "humanitarian", "donation", "ngo"],
    penalty: -0.55
  }
];
var STOP_WORDS = /* @__PURE__ */ new Set([
  "a",
  "about",
  "above",
  "after",
  "again",
  "against",
  "all",
  "am",
  "an",
  "and",
  "any",
  "are",
  "aren",
  "as",
  "at",
  "be",
  "because",
  "been",
  "before",
  "being",
  "below",
  "between",
  "both",
  "but",
  "by",
  "can",
  "cannot",
  "could",
  "did",
  "do",
  "does",
  "doing",
  "down",
  "during",
  "each",
  "few",
  "for",
  "from",
  "further",
  "had",
  "has",
  "have",
  "having",
  "he",
  "her",
  "here",
  "hers",
  "herself",
  "him",
  "himself",
  "his",
  "how",
  "i",
  "if",
  "in",
  "into",
  "is",
  "it",
  "its",
  "itself",
  "just",
  "me",
  "more",
  "most",
  "my",
  "myself",
  "no",
  "nor",
  "not",
  "now",
  "of",
  "off",
  "on",
  "once",
  "only",
  "or",
  "other",
  "ought",
  "our",
  "ours",
  "ourselves",
  "out",
  "over",
  "own",
  "same",
  "she",
  "should",
  "so",
  "some",
  "such",
  "than",
  "that",
  "the",
  "their",
  "theirs",
  "them",
  "themselves",
  "then",
  "there",
  "these",
  "they",
  "this",
  "those",
  "through",
  "to",
  "too",
  "under",
  "until",
  "up",
  "very",
  "was",
  "we",
  "were",
  "what",
  "when",
  "where",
  "which",
  "while",
  "who",
  "whom",
  "why",
  "with",
  "would",
  "you",
  "your",
  "yours",
  "yourself",
  "yourselves"
]);
function stemToken(token) {
  const t = token.toLowerCase().trim();
  if (t.length <= 3) return t;
  if (t.endsWith("ies") && t.length > 4) {
    return t.substring(0, t.length - 3) + "y";
  }
  if (t.endsWith("ses") || t.endsWith("xes") || t.endsWith("zes") || t.endsWith("ches") || t.endsWith("shes")) {
    return t.substring(0, t.length - 2);
  }
  if (t.endsWith("s") && !t.endsWith("ss") && !t.endsWith("us") && !t.endsWith("is")) {
    return t.substring(0, t.length - 1);
  }
  return t;
}
function tokenizeText(text) {
  if (!text) return [];
  return text.toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, " ").split(/[\s-]+/).map((w) => w.trim()).filter((w) => w.length >= 2 && !STOP_WORDS.has(w)).map(stemToken);
}
function extractUrlTokens(urlStr) {
  if (!urlStr) return [];
  try {
    const url = new URL(urlStr.startsWith("http") ? urlStr : `https://${urlStr}`);
    const pathAndQuery = `${url.pathname} ${url.search}`.replace(/[/?&=_.-]/g, " ");
    return tokenizeText(pathAndQuery);
  } catch {
    return tokenizeText(urlStr.replace(/[/?&=_.-]/g, " "));
  }
}
function normalizeEvidence(evidence) {
  const rawAdvertiser = (evidence.advertiserName || "").trim();
  const rawAdCopy = (evidence.adText || "").trim();
  const rawPageName = (evidence.facebookPageName || "").trim();
  const rawCta = (evidence.ctaText || "").trim();
  let rawDomain = (evidence.destinationDomain || "").toLowerCase().trim();
  if (!rawDomain && evidence.destinationUrl) {
    try {
      const u = new URL(evidence.destinationUrl.startsWith("http") ? evidence.destinationUrl : `https://${evidence.destinationUrl}`);
      rawDomain = u.hostname.replace(/^(www\.|m\.|l\.)/, "");
    } catch {
      rawDomain = "";
    }
  }
  return {
    normalizedAdvertiserTokens: tokenizeText(rawAdvertiser),
    normalizedAdTextTokens: tokenizeText(rawAdCopy),
    normalizedDomain: rawDomain,
    normalizedUrlSlug: evidence.destinationUrl ? extractUrlTokens(evidence.destinationUrl).join(" ") : "",
    normalizedPageNameTokens: tokenizeText(rawPageName),
    normalizedCta: rawCta.toLowerCase(),
    advertiserText: rawAdvertiser.toLowerCase(),
    adCopyText: rawAdCopy.toLowerCase()
  };
}
function compileResearchIntent(mode, keywords, presetId, locationCode = "US") {
  const cleanKeywords = keywords.map((k) => k.trim()).filter(Boolean);
  if (mode === "PRESET" && presetId) {
    const preset = RESEARCH_PRESETS.find((p) => p.preset_id === presetId);
    if (preset) {
      return {
        mode: "PRESET",
        keywords: preset.primary_keywords,
        presetId: preset.preset_id,
        presetName: preset.name,
        presetVersion: preset.version,
        targetIndustry: preset.industry,
        targetSubIndustry: preset.sub_industry,
        primaryKeywords: preset.primary_keywords,
        secondaryKeywords: preset.secondary_keywords,
        exclusions: preset.optional_exclusions || [],
        locationCode
      };
    }
  }
  return {
    mode: "CUSTOM",
    keywords: cleanKeywords,
    primaryKeywords: cleanKeywords,
    secondaryKeywords: [],
    exclusions: [],
    locationCode
  };
}
var LeadRelevanceEngine = class _LeadRelevanceEngine {
  static {
    this.VERSION = RELEVANCE_STRATEGY_VERSION;
  }
  static {
    this.ENGINE_VERSION = RELEVANCE_ENGINE_VERSION;
  }
  static {
    this.compileResearchIntent = compileResearchIntent;
  }
  /**
   * Evaluates a single candidate ad against the research intent using the Multi-Stage Pipeline.
   */
  static evaluateCandidate(candidate, intent) {
    const evidence = {
      advertiserName: candidate.pageName,
      adText: candidate.bodyCopy,
      destinationUrl: candidate.destinationUrl,
      destinationDomain: candidate.destinationDomain,
      facebookPageName: candidate.pageName,
      facebookPageUrl: candidate.facebookPageUrl,
      ctaText: candidate.ctaText,
      matchedKeyword: candidate.observedKeyword
    };
    return this.evaluateEvidence(evidence, intent);
  }
  /**
   * Evaluates structured candidate evidence against research intent.
   * Deterministic, explainable, and bounded.
   */
  static evaluateEvidence(evidence, intent) {
    const normalized = normalizeEvidence(evidence);
    const structuredEvidence = [];
    const conflicts = [];
    const reasons = [];
    const matchedKeywords = [];
    const matchedTerms = [];
    const negativeSignals = [];
    const allQueryPhrases = [
      ...intent.primaryKeywords || intent.keywords || [],
      ...intent.secondaryKeywords || []
    ].map((k) => k.toLowerCase().trim()).filter(Boolean);
    const activeTaxonomies = [];
    for (const [key, tax] of Object.entries(BOUNDED_TAXONOMY)) {
      if (allQueryPhrases.some(
        (phrase) => phrase.includes(key) || tax.rootTerms.some((rt) => phrase.includes(rt))
      )) {
        activeTaxonomies.push(tax);
      }
    }
    if (activeTaxonomies.length === 0 && allQueryPhrases.length > 0) {
      const dynamicRoots = [];
      const dynamicStems = [];
      for (const phrase of allQueryPhrases) {
        dynamicRoots.push(phrase);
        for (const tok of tokenizeText(phrase)) {
          dynamicStems.push(tok);
        }
      }
      activeTaxonomies.push({
        category: allQueryPhrases[0],
        rootTerms: Array.from(new Set(dynamicRoots)),
        productServiceTerms: Array.from(new Set(dynamicStems)),
        industryDescriptors: allQueryPhrases,
        conflictingCategories: ["sports", "healthcare", "politics", "gaming", "casino"]
      });
    }
    const coreQueryTokens = /* @__PURE__ */ new Set();
    for (const phrase of allQueryPhrases) {
      for (const t of tokenizeText(phrase)) {
        coreQueryTokens.add(t);
      }
    }
    for (const tax of activeTaxonomies) {
      for (const rt of tax.rootTerms) {
        for (const t of tokenizeText(rt)) {
          coreQueryTokens.add(t);
        }
      }
    }
    const productTerms = /* @__PURE__ */ new Set();
    for (const tax of activeTaxonomies) {
      for (const t of tax.productServiceTerms) {
        productTerms.add(stemToken(t));
      }
    }
    let negativePenalty = 0;
    if (intent.exclusions && intent.exclusions.length > 0) {
      for (const excl of intent.exclusions) {
        const exclLower = excl.toLowerCase();
        if (normalized.advertiserText.includes(exclLower) || normalized.adCopyText.includes(exclLower) || normalized.normalizedDomain.includes(exclLower)) {
          const reason = `Matched preset exclusion rule: "${excl}"`;
          negativeSignals.push(reason);
          conflicts.push({
            type: "CONTRADICTION",
            strength: "STRONG",
            source: "advertiser_name",
            reason,
            matchedSignal: excl,
            reasonCode: "REJECT_PRESET_EXCLUSION"
          });
          negativePenalty -= 0.55;
          break;
        }
      }
    }
    for (const negCat of NEGATIVE_CATEGORIES) {
      const isQueryRelatedToNegCat = allQueryPhrases.some(
        (q) => negCat.terms.some((t) => q.includes(t)) || q.includes(negCat.category) || negCat.category === "sports" && (q.includes("football") || q.includes("cricket") || q.includes("sports"))
      );
      if (isQueryRelatedToNegCat) continue;
      let entityContradictionTerm;
      for (const term of negCat.terms) {
        if (normalized.advertiserText.includes(term) || normalized.normalizedDomain.includes(term.replace(/\s+/g, ""))) {
          entityContradictionTerm = term;
          break;
        }
      }
      if (entityContradictionTerm) {
        const reason = `Advertiser entity identity belongs to unrelated category (${negCat.category}): "${entityContradictionTerm}"`;
        negativeSignals.push(reason);
        conflicts.push({
          type: "CONTRADICTION",
          strength: "STRONG",
          source: "advertiser_name",
          reason,
          matchedSignal: entityContradictionTerm,
          reasonCode: "REJECT_CONTRADICTION_IDENTITY"
        });
        negativePenalty += negCat.penalty;
        continue;
      }
      for (const term of negCat.terms) {
        if (normalized.adCopyText.includes(term) || normalized.normalizedDomain.includes(term.replace(/\s+/g, ""))) {
          const reason = `Unrelated ${negCat.category} signal detected in candidate ad context: "${term}"`;
          negativeSignals.push(reason);
          conflicts.push({
            type: "NEGATIVE_CATEGORY",
            strength: "STRONG",
            source: "ad_text",
            reason,
            matchedSignal: term,
            reasonCode: "REJECT_CONFLICT"
          });
          negativePenalty += negCat.penalty;
          break;
        }
      }
    }
    negativePenalty = Math.max(-0.8, negativePenalty);
    let advertiserNameScore = 0;
    let hasStrongEntityMatch = false;
    let hasModerateEntityMatch = false;
    for (const phrase of allQueryPhrases) {
      if (normalized.advertiserText.includes(phrase)) {
        advertiserNameScore = 0.4;
        hasStrongEntityMatch = true;
        matchedKeywords.push(phrase);
        matchedTerms.push(phrase);
        const reason = `Advertiser name explicitly contains target category query "${phrase}"`;
        reasons.push(reason);
        structuredEvidence.push({
          type: "ENTITY_IDENTITY",
          strength: "STRONG",
          source: "advertiser_name",
          reason,
          matchedSignal: phrase,
          reasonCode: "SIGNAL_ENTITY_NAME_EXACT"
        });
        break;
      }
    }
    if (!hasStrongEntityMatch) {
      const matchedTokensInName = normalized.normalizedAdvertiserTokens.filter((t) => coreQueryTokens.has(t));
      if (matchedTokensInName.length > 0) {
        advertiserNameScore = 0.3;
        hasStrongEntityMatch = true;
        matchedTerms.push(...matchedTokensInName);
        const reason = `Advertiser name contains core target keyword stem(s): ${matchedTokensInName.join(", ")}`;
        reasons.push(reason);
        structuredEvidence.push({
          type: "ENTITY_IDENTITY",
          strength: "STRONG",
          source: "advertiser_name",
          reason,
          matchedSignal: matchedTokensInName.join(", "),
          reasonCode: "SIGNAL_ENTITY_NAME_CORE"
        });
      } else {
        const productTokensInName = normalized.normalizedAdvertiserTokens.filter((t) => productTerms.has(t));
        const matchedSubstringProduct = Array.from(productTerms).filter(
          (pt) => pt.length >= 4 && normalized.advertiserText.includes(pt)
        );
        const combinedProductMatches = Array.from(/* @__PURE__ */ new Set([...productTokensInName, ...matchedSubstringProduct]));
        if (combinedProductMatches.length > 0) {
          advertiserNameScore = 0.25;
          hasModerateEntityMatch = true;
          matchedTerms.push(...combinedProductMatches);
          const reason = `Advertiser name contains target product term(s): ${combinedProductMatches.join(", ")}`;
          reasons.push(reason);
          structuredEvidence.push({
            type: "ENTITY_IDENTITY",
            strength: "MODERATE",
            source: "advertiser_name",
            reason,
            matchedSignal: combinedProductMatches.join(", "),
            reasonCode: "SIGNAL_ENTITY_NAME_PRODUCT"
          });
        }
      }
    }
    let destinationScore = 0;
    let hasDomainCategoryMatch = false;
    if (normalized.normalizedDomain) {
      const domainHasQuery = allQueryPhrases.some(
        (p) => normalized.normalizedDomain.includes(p.replace(/\s+/g, ""))
      );
      const domainHasProduct = Array.from(productTerms).some(
        (t) => t.length >= 4 && normalized.normalizedDomain.includes(t)
      );
      if (domainHasQuery) {
        destinationScore = 0.2;
        hasDomainCategoryMatch = true;
        const reason = `Destination domain "${normalized.normalizedDomain}" explicitly contains target query`;
        reasons.push(reason);
        structuredEvidence.push({
          type: "ENTITY_IDENTITY",
          strength: "STRONG",
          source: "destination_domain",
          reason,
          matchedSignal: normalized.normalizedDomain,
          reasonCode: "SIGNAL_DOMAIN_QUERY_EXACT"
        });
      } else if (domainHasProduct) {
        destinationScore = 0.15;
        hasDomainCategoryMatch = true;
        const reason = `Destination domain "${normalized.normalizedDomain}" contains category product term`;
        reasons.push(reason);
        structuredEvidence.push({
          type: "ENTITY_IDENTITY",
          strength: "MODERATE",
          source: "destination_domain",
          reason,
          matchedSignal: normalized.normalizedDomain,
          reasonCode: "SIGNAL_DOMAIN_PRODUCT"
        });
      }
    }
    let facebookPageScore = 0;
    if (evidence.facebookPageUrl) {
      const pageUrlLower = evidence.facebookPageUrl.toLowerCase();
      const pageHasQuery = allQueryPhrases.some((p) => pageUrlLower.includes(p.replace(/\s+/g, "")));
      if (pageHasQuery) {
        facebookPageScore = hasStrongEntityMatch ? 0.05 : 0.12;
        const reason = `Facebook Page handle/URL reinforces target category identity`;
        reasons.push(reason);
        structuredEvidence.push({
          type: "ENTITY_IDENTITY",
          strength: "MODERATE",
          source: "facebook_page",
          reason,
          matchedSignal: evidence.facebookPageUrl,
          reasonCode: "SIGNAL_PAGE_HANDLE"
        });
      }
    }
    let adCopyScore = 0;
    let adCopyHasPhraseMatch = false;
    for (const phrase of allQueryPhrases) {
      if (normalized.adCopyText.includes(phrase)) {
        adCopyScore += 0.2;
        adCopyHasPhraseMatch = true;
        if (!matchedKeywords.includes(phrase)) matchedKeywords.push(phrase);
        if (!matchedTerms.includes(phrase)) matchedTerms.push(phrase);
        const reason = `Ad copy directly mentions target query "${phrase}"`;
        reasons.push(reason);
        structuredEvidence.push({
          type: "CATEGORY_MATCH",
          strength: "MODERATE",
          source: "ad_text",
          reason,
          matchedSignal: phrase,
          reasonCode: "SIGNAL_COPY_PHRASE"
        });
        break;
      }
    }
    const foundProductTermsInCopy = Array.from(productTerms).filter(
      (t) => normalized.normalizedAdTextTokens.includes(t) || t.length >= 4 && normalized.adCopyText.includes(t)
    );
    let hasProductCatalogEvidence = false;
    if (foundProductTermsInCopy.length > 0) {
      const sampleTerms = foundProductTermsInCopy.slice(0, 5);
      matchedTerms.push(...sampleTerms);
      if (foundProductTermsInCopy.length >= 2) {
        hasProductCatalogEvidence = true;
        const copyAdd = Math.min(0.35, 0.15 + (foundProductTermsInCopy.length - 1) * 0.06);
        adCopyScore += copyAdd;
        const reason = `Ad copy contains specific category product catalog: ${sampleTerms.join(", ")}`;
        reasons.push(reason);
        structuredEvidence.push({
          type: "CATEGORY_MATCH",
          strength: "STRONG",
          source: "ad_text",
          reason,
          matchedSignal: sampleTerms.join(", "),
          reasonCode: "SIGNAL_COPY_PRODUCT_CATALOG"
        });
      } else {
        adCopyScore += 0.12;
        const reason = `Ad copy mentions category product term: ${sampleTerms[0]}`;
        reasons.push(reason);
        structuredEvidence.push({
          type: "CATEGORY_MATCH",
          strength: "WEAK",
          source: "ad_text",
          reason,
          matchedSignal: sampleTerms[0],
          reasonCode: "SIGNAL_COPY_SINGLE_PRODUCT"
        });
      }
    } else if (!adCopyHasPhraseMatch) {
      const matchedTokensInCopy = normalized.normalizedAdTextTokens.filter((t) => coreQueryTokens.has(t));
      if (matchedTokensInCopy.length > 0) {
        adCopyScore += 0.1;
        matchedTerms.push(...matchedTokensInCopy);
        const reason = `Ad copy mentions keyword stem(s): ${matchedTokensInCopy.join(", ")}`;
        reasons.push(reason);
        structuredEvidence.push({
          type: "CATEGORY_MATCH",
          strength: "WEAK",
          source: "ad_text",
          reason,
          matchedSignal: matchedTokensInCopy.join(", "),
          reasonCode: "SIGNAL_COPY_STEM_ONLY"
        });
      }
    }
    adCopyScore = Math.min(0.4, adCopyScore);
    let hasUrlSlugProduct = false;
    if (normalized.normalizedUrlSlug) {
      const slugHasProduct = Array.from(productTerms).some(
        (t) => t.length >= 4 && normalized.normalizedUrlSlug.includes(t)
      );
      const slugHasQuery = Array.from(coreQueryTokens).some(
        (t) => normalized.normalizedUrlSlug.includes(t)
      );
      if (slugHasProduct || slugHasQuery) {
        hasUrlSlugProduct = true;
        destinationScore = Math.max(destinationScore, 0.12);
        const reason = `Destination URL path contains target product category context`;
        reasons.push(reason);
        structuredEvidence.push({
          type: "CATEGORY_MATCH",
          strength: "MODERATE",
          source: "destination_url",
          reason,
          matchedSignal: normalized.normalizedUrlSlug.substring(0, 50),
          reasonCode: "SIGNAL_URL_SLUG_MATCH"
        });
      }
    }
    let commercialScore = 0;
    const commercialCtas = ["shop now", "buy now", "order now", "get quote", "contact us", "order"];
    const hasCommercialCta = commercialCtas.includes(normalized.normalizedCta);
    if (hasCommercialCta) {
      commercialScore += 0.05;
      structuredEvidence.push({
        type: "COMMERCIAL_INTENT",
        strength: "MODERATE",
        source: "cta_text",
        reason: `Commercial action call-to-action ("${evidence.ctaText}")`,
        matchedSignal: evidence.ctaText,
        reasonCode: "SIGNAL_COMMERCIAL_INTENT_CTA"
      });
    }
    const hasPricingInCopy = /(price|discount|sale|off|taka|bdt|usd|\$|€|£|warranty|deal|buy|shop)/i.test(normalized.adCopyText);
    if (hasPricingInCopy) {
      commercialScore = Math.min(0.1, commercialScore + 0.05);
      structuredEvidence.push({
        type: "COMMERCIAL_INTENT",
        strength: "MODERATE",
        source: "ad_text",
        reason: `Commercial pricing, transaction, or sale language observed in ad copy`,
        reasonCode: "SIGNAL_COMMERCIAL_INTENT_PRICE"
      });
    }
    const rawPositiveScore = advertiserNameScore + adCopyScore + destinationScore + facebookPageScore + commercialScore;
    const totalScore = Math.max(0, Math.min(1, rawPositiveScore + negativePenalty));
    let decision = "UNCERTAIN";
    let confidence = "LOW";
    let reasonCode = "UNCERTAIN_AMBIGUOUS_ENTITY";
    const hasStrongConflict = conflicts.some((c) => c.type === "CONTRADICTION" && c.strength === "STRONG") || negativePenalty <= -0.3;
    if (hasStrongConflict) {
      decision = "NOT_RELEVANT";
      confidence = "HIGH";
      reasonCode = conflicts[0]?.reasonCode || "REJECT_CONFLICT";
      reasons.unshift(`Disqualified by Hard Contradiction Gate: ${negativeSignals.join("; ")}`);
    } else {
      const hasOnlyWeakKeywordInCopy = !hasStrongEntityMatch && !hasModerateEntityMatch && !hasDomainCategoryMatch && !hasProductCatalogEvidence;
      if (hasOnlyWeakKeywordInCopy) {
        if (totalScore < 0.18) {
          decision = "NOT_RELEVANT";
          confidence = "HIGH";
          reasonCode = "REJECT_INSUFFICIENT_EVIDENCE";
          reasons.push(`Classified as NOT_RELEVANT: No entity or category evidence found.`);
        } else {
          decision = "UNCERTAIN";
          confidence = "LOW";
          reasonCode = "UNCERTAIN_KEYWORD_ONLY";
          reasons.push(`Classified as UNCERTAIN: Mentioned keyword but lacks independent entity or product evidence.`);
        }
      } else {
        const hasSupportingSignal = adCopyScore >= 0.1 || destinationScore >= 0.12 || commercialScore >= 0.05 || facebookPageScore >= 0.05 || hasProductCatalogEvidence;
        const passesCriterion1 = hasStrongEntityMatch && hasSupportingSignal;
        const passesCriterion2 = hasModerateEntityMatch && (adCopyScore >= 0.15 || destinationScore >= 0.12 || hasProductCatalogEvidence);
        const passesCriterion3 = hasProductCatalogEvidence && (destinationScore >= 0.12 || hasUrlSlugProduct || hasDomainCategoryMatch || adCopyScore >= 0.25 && commercialScore >= 0.05);
        if ((passesCriterion1 || passesCriterion2 || passesCriterion3) && totalScore >= 0.35) {
          decision = "RELEVANT";
          const hasMultiDimensionalCorroboration = hasStrongEntityMatch && hasSupportingSignal || hasProductCatalogEvidence && destinationScore >= 0.12 && commercialScore >= 0.05;
          confidence = totalScore >= 0.6 || hasMultiDimensionalCorroboration ? "HIGH" : "MEDIUM";
          reasonCode = passesCriterion1 ? "ACCEPT_STRONG_ENTITY_MATCH" : "ACCEPT_MULTI_SIGNAL_MATCH";
          reasons.push(
            `Qualified as RELEVANT: ${passesCriterion1 ? "Strong entity identity confirmed with supporting product/commercial evidence" : passesCriterion3 ? "Category product catalog verified with commercial corroboration" : "Entity and category evidence meet sufficiency standards"} (Confidence: ${confidence})`
          );
        } else if (totalScore < 0.22) {
          decision = "NOT_RELEVANT";
          confidence = totalScore < 0.12 ? "HIGH" : "MEDIUM";
          reasonCode = "REJECT_CATEGORY_MISMATCH";
          reasons.push(`Classified as NOT_RELEVANT: Insufficient category evidence (Score: ${(totalScore * 100).toFixed(0)}%)`);
        } else {
          decision = "UNCERTAIN";
          confidence = "LOW";
          reasonCode = "UNCERTAIN_AMBIGUOUS_ENTITY";
          reasons.push(`Classified as UNCERTAIN: Evidence is ambiguous or insufficient to confirm business vertical.`);
        }
      }
    }
    if (evidence.matchedKeyword && !matchedKeywords.includes(evidence.matchedKeyword)) {
      if (decision === "RELEVANT") {
        matchedKeywords.push(evidence.matchedKeyword);
      }
    }
    return {
      decision,
      confidence,
      score: Math.round(totalScore * 100) / 100,
      reasons,
      matchedKeywords,
      matchedTerms: Array.from(new Set(matchedTerms)),
      negativeSignals,
      evidence: structuredEvidence,
      conflicts,
      evidenceBreakdown: {
        advertiserNameScore,
        adCopyScore,
        destinationScore,
        facebookPageScore,
        commercialScore,
        negativePenalty
      },
      strategyVersion: RELEVANCE_STRATEGY_VERSION,
      engineVersion: RELEVANCE_ENGINE_VERSION,
      presetVersion: intent.presetVersion,
      reasonCode
    };
  }
  /**
   * Entity-Level Evaluation: Evaluates multiple ad cards for an advertiser entity
   * to produce the consolidated entity relevance decision without duplicate inflation.
   */
  static evaluateEntity(advertiserName, candidates, intent) {
    if (candidates.length === 0) {
      return this.evaluateEvidence({ advertiserName }, intent);
    }
    const evaluations = candidates.map((c) => this.evaluateCandidate(c, intent));
    const allConflicts = evaluations.flatMap((e) => e.conflicts);
    const hasEntityContradiction = allConflicts.some(
      (c) => c.type === "CONTRADICTION" && c.strength === "STRONG"
    );
    const allNegativeSignals = Array.from(new Set(evaluations.flatMap((e) => e.negativeSignals)));
    const maxNegativePenalty = Math.min(...evaluations.map((e) => e.evidenceBreakdown.negativePenalty));
    if (hasEntityContradiction || maxNegativePenalty <= -0.3) {
      const worstEval = evaluations.find((e) => e.evidenceBreakdown.negativePenalty <= -0.3) || evaluations[0];
      return {
        ...worstEval,
        decision: "NOT_RELEVANT",
        confidence: "HIGH",
        negativeSignals: allNegativeSignals,
        conflicts: allConflicts,
        reasons: [
          `Entity disqualified across ${candidates.length} ad(s) due to hard contradiction: ${allNegativeSignals.join("; ")}`
        ],
        reasonCode: "REJECT_CONTRADICTION_IDENTITY",
        engineVersion: RELEVANCE_ENGINE_VERSION,
        strategyVersion: RELEVANCE_STRATEGY_VERSION
      };
    }
    const seenCopyHashes = /* @__PURE__ */ new Set();
    const distinctAds = [];
    for (const c of candidates) {
      const copyNormalized = (c.bodyCopy || "").toLowerCase().trim().replace(/\s+/g, " ").substring(0, 100);
      if (!seenCopyHashes.has(copyNormalized)) {
        seenCopyHashes.add(copyNormalized);
        distinctAds.push(c);
      }
    }
    evaluations.sort((a, b) => b.score - a.score);
    const bestEval = evaluations[0];
    const combinedKeywords = Array.from(new Set(evaluations.flatMap((e) => e.matchedKeywords)));
    const combinedTerms = Array.from(new Set(evaluations.flatMap((e) => e.matchedTerms)));
    const allEvidence = Array.from(
      new Map(evaluations.flatMap((e) => e.evidence).map((ev) => [`${ev.type}:${ev.source}:${ev.reasonCode}`, ev])).values()
    );
    let consolidatedScore = bestEval.score;
    let decision = bestEval.decision;
    let confidence = bestEval.confidence;
    let reasonCode = bestEval.reasonCode;
    const distinctSupportingAds = distinctAds.filter((ad) => {
      const ev = _LeadRelevanceEngine.evaluateCandidate(ad, intent);
      return ev.decision === "RELEVANT" || ev.evidence.some((e) => e.type === "CATEGORY_MATCH");
    });
    if (allNegativeSignals.length === 0 && distinctSupportingAds.length > 1) {
      const multiCardBoost = Math.min(0.12, (distinctSupportingAds.length - 1) * 0.04);
      consolidatedScore = Math.min(1, consolidatedScore + multiCardBoost);
      if (decision === "UNCERTAIN" && consolidatedScore >= 0.4 && (bestEval.evidenceBreakdown.advertiserNameScore > 0 || bestEval.evidenceBreakdown.adCopyScore >= 0.25)) {
        decision = "RELEVANT";
        reasonCode = "ACCEPT_MULTI_SIGNAL_MATCH";
      }
      if (consolidatedScore >= 0.6) {
        confidence = "HIGH";
      }
      allEvidence.push({
        type: "ENTITY_IDENTITY",
        strength: "STRONG",
        source: "entity_aggregation",
        reason: `Entity confirmed across ${distinctSupportingAds.length} distinct category ads`,
        matchedSignal: `${distinctSupportingAds.length} distinct ads`,
        reasonCode: "SIGNAL_MULTI_AD_CORROBORATION"
      });
    }
    return {
      ...bestEval,
      decision,
      confidence,
      score: Math.round(consolidatedScore * 100) / 100,
      matchedKeywords: combinedKeywords.length > 0 ? combinedKeywords : bestEval.matchedKeywords,
      matchedTerms: combinedTerms,
      evidence: allEvidence,
      conflicts: allConflicts,
      reasons: [
        `Entity evaluated across ${candidates.length} ad card(s) (${distinctAds.length} distinct): status ${decision} (${(consolidatedScore * 100).toFixed(0)}%)`,
        ...bestEval.reasons
      ],
      reasonCode,
      strategyVersion: RELEVANCE_STRATEGY_VERSION,
      engineVersion: RELEVANCE_ENGINE_VERSION
    };
  }
};

// src/extension/bulkStore.ts
var DB_NAME = "leadnoria-research";
var DB_VERSION = 1;
var MemoryStoreFallback = class {
  constructor() {
    this.runs = /* @__PURE__ */ new Map();
    this.ads = /* @__PURE__ */ new Map();
    // key: `${runId}_${libraryId}`
    this.entities = /* @__PURE__ */ new Map();
    // key: `${runId}_${canonicalKey}`
    this.evidence = /* @__PURE__ */ new Map();
    // key: `${runId}_${canonicalKey}`
    this.checkpoints = /* @__PURE__ */ new Map();
    // key: `${runId}_${batchIndex}`
    this.dedupAds = /* @__PURE__ */ new Map();
    // runId -> Set<libraryId>
    this.dedupEntities = /* @__PURE__ */ new Map();
  }
  // runId -> Set<canonicalKey>
  async saveRun(run) {
    this.runs.set(run.runId, JSON.parse(JSON.stringify(run)));
  }
  async getRun(runId) {
    const r = this.runs.get(runId);
    return r ? JSON.parse(JSON.stringify(r)) : null;
  }
  async saveBatch(runId, payload) {
    if (!this.dedupAds.has(runId)) this.dedupAds.set(runId, /* @__PURE__ */ new Set());
    if (!this.dedupEntities.has(runId)) this.dedupEntities.set(runId, /* @__PURE__ */ new Set());
    const adSet = this.dedupAds.get(runId);
    const entSet = this.dedupEntities.get(runId);
    for (const ad of payload.ads) {
      this.ads.set(`${runId}_${ad.libraryId}`, { ...ad, runId });
      adSet.add(ad.libraryId);
    }
    for (const ent of payload.entities) {
      const canonicalKey = ent.canonicalName ? ent.canonicalName.toLowerCase() : ent.name.toLowerCase();
      this.entities.set(`${runId}_${canonicalKey}`, { ...ent, runId, canonicalKey });
      entSet.add(canonicalKey);
    }
    if (payload.evidence) {
      for (const ev of payload.evidence) {
        this.evidence.set(`${runId}_${ev.canonicalKey}`, ev.evidence);
      }
    }
    this.checkpoints.set(`${runId}_${payload.batchIndex}`, payload.checkpoint);
  }
  async getAllRelevantLeads(runId) {
    const results = [];
    for (const [key, ent] of this.entities.entries()) {
      if (key.startsWith(`${runId}_`)) {
        if (!ent.relevanceDecision || ent.relevanceDecision === "RELEVANT") {
          results.push(JSON.parse(JSON.stringify(ent)));
        }
      }
    }
    return results;
  }
  async getEntity(runId, canonicalKey) {
    const ent = this.entities.get(`${runId}_${canonicalKey.toLowerCase()}`);
    return ent ? JSON.parse(JSON.stringify(ent)) : null;
  }
  async getSeenAdIds(runId) {
    return new Set(this.dedupAds.get(runId) || []);
  }
  async getSeenEntityKeys(runId) {
    return new Set(this.dedupEntities.get(runId) || []);
  }
  async getLatestCheckpoint(runId) {
    let latestIndex = -1;
    let latestCp = null;
    for (const [key, cp] of this.checkpoints.entries()) {
      if (key.startsWith(`${runId}_`)) {
        if (cp.batchIndex > latestIndex) {
          latestIndex = cp.batchIndex;
          latestCp = cp;
        }
      }
    }
    return latestCp ? JSON.parse(JSON.stringify(latestCp)) : null;
  }
  async getStorageStats(runId) {
    let totalAds = 0;
    let totalEntities = 0;
    let totalRelevant = 0;
    let totalCheckpoints = 0;
    let bytes = 0;
    for (const [k, v] of this.ads.entries()) {
      if (k.startsWith(`${runId}_`)) {
        totalAds++;
        bytes += JSON.stringify(v).length;
      }
    }
    for (const [k, v] of this.entities.entries()) {
      if (k.startsWith(`${runId}_`)) {
        totalEntities++;
        if (!v.relevanceDecision || v.relevanceDecision === "RELEVANT") totalRelevant++;
        bytes += JSON.stringify(v).length;
      }
    }
    for (const [k, v] of this.checkpoints.entries()) {
      if (k.startsWith(`${runId}_`)) {
        totalCheckpoints++;
        bytes += JSON.stringify(v).length;
      }
    }
    return {
      runId,
      totalAds,
      totalEntities,
      totalRelevantLeads: totalRelevant,
      totalCheckpoints,
      estimatedBytes: bytes
    };
  }
  async clearRun(runId) {
    this.runs.delete(runId);
    this.dedupAds.delete(runId);
    this.dedupEntities.delete(runId);
    for (const k of Array.from(this.ads.keys())) {
      if (k.startsWith(`${runId}_`)) this.ads.delete(k);
    }
    for (const k of Array.from(this.entities.keys())) {
      if (k.startsWith(`${runId}_`)) this.entities.delete(k);
    }
    for (const k of Array.from(this.evidence.keys())) {
      if (k.startsWith(`${runId}_`)) this.evidence.delete(k);
    }
    for (const k of Array.from(this.checkpoints.keys())) {
      if (k.startsWith(`${runId}_`)) this.checkpoints.delete(k);
    }
  }
};
var memoryFallback = new MemoryStoreFallback();
function hasIndexedDB() {
  return typeof indexedDB !== "undefined" && indexedDB !== null;
}
function openDB() {
  return new Promise((resolve, reject) => {
    if (!hasIndexedDB()) {
      return reject(new Error("IndexedDB not available"));
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("runs")) {
        db.createObjectStore("runs", { keyPath: "runId" });
      }
      if (!db.objectStoreNames.contains("ads")) {
        const adStore = db.createObjectStore("ads", { keyPath: ["runId", "libraryId"] });
        adStore.createIndex("by_run", "runId", { unique: false });
      }
      if (!db.objectStoreNames.contains("entities")) {
        const entStore = db.createObjectStore("entities", { keyPath: ["runId", "canonicalKey"] });
        entStore.createIndex("by_run", "runId", { unique: false });
        entStore.createIndex("by_run_decision", ["runId", "relevanceDecision"], { unique: false });
      }
      if (!db.objectStoreNames.contains("evidence")) {
        const evStore = db.createObjectStore("evidence", { keyPath: ["runId", "canonicalKey"] });
        evStore.createIndex("by_run", "runId", { unique: false });
      }
      if (!db.objectStoreNames.contains("checkpoints")) {
        const cpStore = db.createObjectStore("checkpoints", { keyPath: ["runId", "batchIndex"] });
        cpStore.createIndex("by_run", "runId", { unique: false });
      }
      if (!db.objectStoreNames.contains("dedupIndex")) {
        const dedupStore = db.createObjectStore("dedupIndex", { keyPath: ["runId", "idType", "idVal"] });
        dedupStore.createIndex("by_run", "runId", { unique: false });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
async function initBulkStore() {
  if (!hasIndexedDB()) {
    return false;
  }
  try {
    const db = await openDB();
    db.close();
    return true;
  } catch (err) {
    console.warn("[bulkStore] IndexedDB init failed, using memory fallback:", err);
    return false;
  }
}
async function saveRunRecord(run) {
  if (!hasIndexedDB()) {
    return memoryFallback.saveRun(run);
  }
  try {
    const db = await openDB();
    await new Promise((resolve, reject) => {
      const tx = db.transaction("runs", "readwrite");
      tx.objectStore("runs").put(run);
      tx.oncomplete = () => {
        db.close();
        resolve();
      };
      tx.onerror = () => {
        db.close();
        reject(tx.error);
      };
    });
  } catch {
    return memoryFallback.saveRun(run);
  }
}
async function saveBatch(runId, payload) {
  if (!hasIndexedDB()) {
    return memoryFallback.saveBatch(runId, payload);
  }
  try {
    const db = await openDB();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(["ads", "entities", "evidence", "checkpoints", "dedupIndex"], "readwrite");
      const adStore = tx.objectStore("ads");
      const entStore = tx.objectStore("entities");
      const evStore = tx.objectStore("evidence");
      const cpStore = tx.objectStore("checkpoints");
      const dedupStore = tx.objectStore("dedupIndex");
      for (const ad of payload.ads) {
        adStore.put({ ...ad, runId });
        dedupStore.put({ runId, idType: "AD_ID", idVal: ad.libraryId });
      }
      for (const ent of payload.entities) {
        const canonicalKey = ent.canonicalName ? ent.canonicalName.toLowerCase() : ent.name.toLowerCase();
        entStore.put({ ...ent, runId, canonicalKey });
        dedupStore.put({ runId, idType: "ENTITY_KEY", idVal: canonicalKey });
      }
      if (payload.evidence) {
        for (const ev of payload.evidence) {
          evStore.put({ runId, canonicalKey: ev.canonicalKey, evidence: ev.evidence });
        }
      }
      cpStore.put({ ...payload.checkpoint, runId, batchIndex: payload.batchIndex });
      tx.oncomplete = () => {
        db.close();
        resolve();
      };
      tx.onerror = () => {
        db.close();
        reject(tx.error);
      };
    });
  } catch {
    return memoryFallback.saveBatch(runId, payload);
  }
}
async function getAllRelevantLeads(runId) {
  if (!hasIndexedDB()) {
    return memoryFallback.getAllRelevantLeads(runId);
  }
  try {
    const db = await openDB();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction("entities", "readonly");
      const store = tx.objectStore("entities");
      const index = store.index("by_run");
      const request = index.getAll(runId);
      request.onsuccess = () => {
        db.close();
        const records = request.result || [];
        const relevant = records.filter((r) => !r.relevanceDecision || r.relevanceDecision === "RELEVANT");
        resolve(relevant);
      };
      request.onerror = () => {
        db.close();
        reject(request.error);
      };
    });
  } catch {
    return memoryFallback.getAllRelevantLeads(runId);
  }
}
async function getSeenAdIds(runId) {
  if (!hasIndexedDB()) {
    return memoryFallback.getSeenAdIds(runId);
  }
  try {
    const db = await openDB();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction("dedupIndex", "readonly");
      const store = tx.objectStore("dedupIndex");
      const index = store.index("by_run");
      const request = index.getAll(runId);
      request.onsuccess = () => {
        db.close();
        const items = request.result || [];
        const ids = /* @__PURE__ */ new Set();
        for (const it of items) {
          if (it.idType === "AD_ID") ids.add(it.idVal);
        }
        resolve(ids);
      };
      request.onerror = () => {
        db.close();
        reject(request.error);
      };
    });
  } catch {
    return memoryFallback.getSeenAdIds(runId);
  }
}
async function getSeenEntityKeys(runId) {
  if (!hasIndexedDB()) {
    return memoryFallback.getSeenEntityKeys(runId);
  }
  try {
    const db = await openDB();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction("dedupIndex", "readonly");
      const store = tx.objectStore("dedupIndex");
      const index = store.index("by_run");
      const request = index.getAll(runId);
      request.onsuccess = () => {
        db.close();
        const items = request.result || [];
        const keys = /* @__PURE__ */ new Set();
        for (const it of items) {
          if (it.idType === "ENTITY_KEY") keys.add(it.idVal);
        }
        resolve(keys);
      };
      request.onerror = () => {
        db.close();
        reject(request.error);
      };
    });
  } catch {
    return memoryFallback.getSeenEntityKeys(runId);
  }
}

// src/extension/bulkProcessor.ts
function normalizeAdvertiserName(rawName) {
  let name = (rawName || "").trim();
  if (!name || name === "Unknown Advertiser") return "Unknown Advertiser";
  name = name.replace(/\s*·\s*Sponsored.*$/i, "");
  name = name.replace(/\s*Sponsored.*$/i, "");
  name = name.replace(/\s+page$/i, "");
  name = name.replace(/\s*\(official\)$/i, "");
  return name.trim();
}
function getCanonicalEntityKey(pageName, fbPageId) {
  const clean = normalizeAdvertiserName(pageName).toLowerCase();
  if (fbPageId && fbPageId.length > 4) {
    return `fb_${fbPageId}`;
  }
  return `name_${clean.replace(/[^a-z0-9]/g, "_")}`;
}
async function processBatch(candidates, existingEntitiesMap, seenAdLibraryIds, seenEntityKeys, currentCounters, options) {
  const {
    runId,
    countryCode,
    locationName,
    currentKeyword,
    intent,
    effectiveCeiling
  } = options;
  const processedAds = [];
  const updatedEntities = [];
  const newEvidence = [];
  const newAdIdsAdded = [];
  const newEntityKeysAdded = [];
  const counters = {
    rawAds: currentCounters.rawAds,
    normalizedCandidates: currentCounters.normalizedCandidates,
    relevantCandidates: currentCounters.relevantCandidates,
    uncertainCandidates: currentCounters.uncertainCandidates,
    notRelevantCandidates: currentCounters.notRelevantCandidates,
    duplicatesRemoved: currentCounters.duplicatesRemoved,
    finalUniqueLeads: currentCounters.finalUniqueLeads,
    uniqueEntitiesObserved: currentCounters.uniqueEntitiesObserved ?? currentCounters.finalUniqueLeads,
    relevantEntities: currentCounters.relevantEntities ?? currentCounters.finalUniqueLeads,
    uncertainEntities: currentCounters.uncertainEntities ?? currentCounters.uncertainCandidates,
    notRelevantEntities: currentCounters.notRelevantEntities ?? currentCounters.notRelevantCandidates,
    keywordsCompleted: currentCounters.keywordsCompleted ?? 0,
    keywordsTotal: currentCounters.keywordsTotal ?? 1,
    finalUniqueRelevantLeads: currentCounters.finalUniqueRelevantLeads ?? currentCounters.finalUniqueLeads,
    reasonCodes: { ...currentCounters.reasonCodes || {} }
  };
  let safetyLimitReached = (counters.finalUniqueRelevantLeads || counters.finalUniqueLeads) >= effectiveCeiling;
  let newUniqueRelevantLeadsCount = 0;
  for (const cand of candidates) {
    if (seenAdLibraryIds.has(cand.libraryId)) {
      counters.duplicatesRemoved++;
      continue;
    }
    seenAdLibraryIds.add(cand.libraryId);
    newAdIdsAdded.push(cand.libraryId);
    counters.rawAds++;
    counters.normalizedCandidates++;
    processedAds.push(cand);
    const cleanName = normalizeAdvertiserName(cand.pageName);
    const entityKey = getCanonicalEntityKey(cleanName, cand.facebookPageId);
    const existingEntity = existingEntitiesMap.get(entityKey);
    if (existingEntity) {
      counters.duplicatesRemoved++;
      existingEntity.activeAdCount++;
      existingEntity.adCount = (existingEntity.adCount || 0) + 1;
      if (!existingEntity.adLibraryIds.includes(cand.libraryId)) {
        existingEntity.adLibraryIds.push(cand.libraryId);
      }
      if (currentKeyword && !existingEntity.matchedKeywords.includes(currentKeyword)) {
        existingEntity.matchedKeywords.push(currentKeyword);
      }
      if (!existingEntity.destinationUrl && cand.destinationUrl) {
        existingEntity.destinationUrl = cand.destinationUrl;
        existingEntity.destinationDomain = cand.destinationDomain;
        existingEntity.websiteState = "found";
      }
      if (!existingEntity.facebookPageUrl && cand.facebookPageUrl) {
        existingEntity.facebookPageUrl = cand.facebookPageUrl;
        existingEntity.facebookPageState = "found";
      }
      if (!existingEntity.sampleCopy && cand.bodyCopy) {
        existingEntity.sampleCopy = cand.bodyCopy;
      }
      if (!existingEntity.sampleCta && cand.ctaText) {
        existingEntity.sampleCta = cand.ctaText;
      }
      if (!updatedEntities.some((e) => e.id === existingEntity.id)) {
        updatedEntities.push(existingEntity);
      }
      continue;
    }
    counters.uniqueEntitiesObserved = (counters.uniqueEntitiesObserved || 0) + 1;
    seenEntityKeys.add(entityKey);
    newEntityKeysAdded.push(entityKey);
    let evalResult = null;
    if (intent) {
      evalResult = LeadRelevanceEngine.evaluateCandidate(cand, intent);
      if (evalResult.reasonCodes && Array.isArray(evalResult.reasonCodes)) {
        for (const code of evalResult.reasonCodes) {
          counters.reasonCodes[code] = (counters.reasonCodes[code] || 0) + 1;
        }
      }
      if (evalResult.decision === "NOT_RELEVANT") {
        counters.notRelevantCandidates++;
        counters.notRelevantEntities = (counters.notRelevantEntities || 0) + 1;
        continue;
      }
      if (evalResult.decision === "UNCERTAIN") {
        counters.uncertainCandidates++;
        counters.uncertainEntities = (counters.uncertainEntities || 0) + 1;
        continue;
      }
    }
    counters.relevantCandidates++;
    counters.relevantEntities = (counters.relevantEntities || 0) + 1;
    const currentLeadCount = counters.finalUniqueRelevantLeads || counters.finalUniqueLeads;
    if (currentLeadCount >= effectiveCeiling) {
      safetyLimitReached = true;
      break;
    }
    const webState = cand.destinationUrl ? "found" : "not_found";
    const fbState = cand.facebookPageUrl ? "found" : "not_found";
    const newLead = {
      id: `lead_${runId}_${entityKey}`,
      name: cleanName,
      canonicalName: cleanName,
      facebookPageName: cleanName,
      facebookPageUrl: cand.facebookPageUrl,
      facebookPageState: fbState,
      destinationUrl: cand.destinationUrl,
      destinationDomain: cand.destinationDomain,
      websiteState: webState,
      adCount: 1,
      activeAdCount: 1,
      adLibraryIds: [cand.libraryId],
      adLibraryUrl: `https://www.facebook.com/ads/library/?id=${cand.libraryId}`,
      matchedKeywords: currentKeyword ? [currentKeyword] : intent?.primaryKeywords?.slice(0, 1) || [],
      locationCode: countryCode,
      locationName,
      status: webState === "found" ? "QUALIFIED" : "REVIEW_REQUIRED",
      discoveredAt: (/* @__PURE__ */ new Date()).toISOString(),
      sampleCopy: cand.bodyCopy,
      sampleCta: cand.ctaText,
      relevanceScore: evalResult?.score,
      relevanceDecision: evalResult?.decision || "RELEVANT",
      relevanceConfidence: evalResult?.confidence,
      relevanceReasons: evalResult?.reasons,
      relevanceMatchedTerms: evalResult?.matchedTerms,
      relevanceEvidence: evalResult?.evidence,
      relevanceStrategyVersion: evalResult?.strategyVersion,
      engineVersion: evalResult?.engineVersion,
      presetVersion: evalResult?.presetVersion
    };
    existingEntitiesMap.set(entityKey, newLead);
    updatedEntities.push(newLead);
    if (evalResult?.evidence) {
      newEvidence.push({
        canonicalKey: entityKey,
        evidence: evalResult.evidence
      });
    }
    counters.finalUniqueLeads++;
    counters.finalUniqueRelevantLeads = counters.finalUniqueLeads;
    newUniqueRelevantLeadsCount++;
    if (counters.finalUniqueLeads >= effectiveCeiling) {
      safetyLimitReached = true;
      break;
    }
  }
  Object.assign(currentCounters, counters);
  return {
    processedAds,
    updatedEntities,
    newEvidence,
    newAdIdsAdded,
    newEntityKeysAdded,
    counters,
    safetyLimitReached,
    newUniqueRelevantLeadsCount
  };
}

// src/extension/service-worker.ts
console.log("[Meta Ad Library Scraper] Service Worker initializing...");
var SCHEMA_VERSION = 1;
var STALE_JOB_THRESHOLD_MS = 5 * 60 * 1e3;
var cancelledRuns = /* @__PURE__ */ new Set();
async function saveActiveRun(run) {
  if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
    run.lastUpdatedAt = (/* @__PURE__ */ new Date()).toISOString();
    run.schemaVersion = SCHEMA_VERSION;
    await chrome.storage.local.set({
      activeResearchRun: run,
      meta_scraper_active_run: run
    });
  }
}
async function checkStaleJobs() {
  if (typeof chrome === "undefined" || !chrome.storage || !chrome.storage.local) return;
  const data = await chrome.storage.local.get(["activeResearchRun"]);
  const run = data.activeResearchRun;
  if (run && ["STARTING", "NAVIGATING", "COLLECTING", "NORMALIZING"].includes(run.status)) {
    const lastUpdate = new Date(run.lastUpdatedAt).getTime();
    const now = Date.now();
    if (now - lastUpdate > STALE_JOB_THRESHOLD_MS) {
      console.warn("[service-worker] Detected stale job:", run.runId);
      run.status = "RECOVERY_REQUIRED";
      run.stopReason = "BROWSER_INTERRUPTED";
      run.logs.push({
        timestamp: (/* @__PURE__ */ new Date()).toLocaleTimeString(),
        message: "Research session was interrupted due to browser inactivity or background worker restart. Recovery required.",
        stage: "SYSTEM"
      });
      await saveActiveRun(run);
      await appendToHistory(run);
    }
  }
}
async function appendToHistory(run) {
  if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
    const data = await chrome.storage.local.get(["researchHistory", "meta_scraper_history"]);
    const history = Array.isArray(data.researchHistory) ? data.researchHistory : Array.isArray(data.meta_scraper_history) ? data.meta_scraper_history : [];
    const updated = [run, ...history.filter((h) => h.runId !== run.runId)].slice(0, 30);
    await chrome.storage.local.set({
      researchHistory: updated,
      meta_scraper_history: updated
    });
  }
}
function broadcastProgress(run, stage, logMessage) {
  const timestamp = (/* @__PURE__ */ new Date()).toLocaleTimeString();
  run.logs.push({ timestamp, message: logMessage, stage });
  if (run.logs.length > 50) {
    run.logs = run.logs.slice(-50);
  }
  saveActiveRun(run).catch(() => {
  });
  const authoritativeLeadCount = run.counters?.finalUniqueRelevantLeads ?? run.counters?.finalUniqueLeads ?? run.leads.length;
  if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.sendMessage) {
    chrome.runtime.sendMessage({
      type: "RESEARCH_PROGRESS",
      payload: {
        runId: run.runId,
        status: run.status,
        leadCount: authoritativeLeadCount,
        maxResults: run.maxResults,
        totalAdsInspected: run.totalAdsInspected,
        logMessage,
        run
      }
    }).catch(() => {
    });
  }
}
function waitForTabLoad(tabId, timeoutMs = 25e3) {
  return new Promise(async (resolve) => {
    let resolved = false;
    try {
      const currentTab = await chrome.tabs.get(tabId);
      if (currentTab && currentTab.status === "complete") {
        resolved = true;
        resolve();
        return;
      }
    } catch {
    }
    const listener = (updatedTabId, changeInfo) => {
      if (updatedTabId === tabId && changeInfo.status === "complete") {
        if (!resolved) {
          resolved = true;
          chrome.tabs.onUpdated.removeListener(listener);
          resolve();
        }
      }
    };
    chrome.tabs.onUpdated.addListener(listener);
    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        chrome.tabs.onUpdated.removeListener(listener);
        resolve();
      }
    }, timeoutMs);
  });
}
var wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function executeResearchPipeline(payload, providedRunId, providedRun) {
  const runId = providedRunId || `run_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
  cancelledRuns.delete(runId);
  const keywords = payload.keywords.map((k) => k.trim()).filter(Boolean);
  const countryCode = payload.countryCode || "US";
  const isAutoDiscovery = payload.researchMode === "AUTO_DISCOVERY" || payload.maxResults === void 0;
  const effectiveCeiling = isAutoDiscovery ? MAX_FINAL_UNIQUE_RELEVANT_LEADS_PER_RESEARCH : Math.min(Math.max(1, payload.maxResults || MAX_FINAL_UNIQUE_RELEVANT_LEADS_PER_RESEARCH), MAX_FINAL_UNIQUE_RELEVANT_LEADS_PER_RESEARCH);
  const targetLeadCount = isAutoDiscovery ? void 0 : effectiveCeiling;
  const researchIntent = compileResearchIntent(
    payload.mode,
    keywords,
    payload.presetId,
    countryCode
  );
  const initialRun = providedRun || {
    runId,
    researchName: payload.researchName || `${payload.mode === "PRESET" ? payload.presetName || "Preset" : keywords[0]} in ${payload.locationName}`,
    mode: payload.mode,
    presetId: payload.presetId,
    presetName: payload.presetName,
    keywords,
    countryCode,
    locationName: payload.locationName,
    researchMode: isAutoDiscovery ? "AUTO_DISCOVERY" : void 0,
    maxFinalUniqueRelevantLeads: isAutoDiscovery ? MAX_FINAL_UNIQUE_RELEVANT_LEADS_PER_RESEARCH : void 0,
    maxResults: payload.maxResults ?? effectiveCeiling,
    targetLeadCount,
    status: "STARTING",
    leads: [],
    rejectedLeadsCount: 0,
    uncertainLeadsCount: 0,
    relevanceStrategyVersion: RELEVANCE_STRATEGY_VERSION,
    engineVersion: RELEVANCE_ENGINE_VERSION,
    counters: {
      rawAds: 0,
      normalizedCandidates: 0,
      relevantCandidates: 0,
      uncertainCandidates: 0,
      notRelevantCandidates: 0,
      duplicatesRemoved: 0,
      finalUniqueLeads: 0
    },
    logs: [],
    startedAt: (/* @__PURE__ */ new Date()).toISOString(),
    lastUpdatedAt: (/* @__PURE__ */ new Date()).toISOString(),
    schemaVersion: SCHEMA_VERSION,
    totalAdsInspected: 0
  };
  await initBulkStore();
  const seenAdLibraryIds = await getSeenAdIds(runId);
  const seenEntityKeys = await getSeenEntityKeys(runId);
  const existingEntitiesMap = /* @__PURE__ */ new Map();
  const existingLeads = await getAllRelevantLeads(runId);
  for (const lead of existingLeads) {
    const canonicalKey = lead.canonicalName ? lead.canonicalName.toLowerCase() : lead.name.toLowerCase();
    existingEntitiesMap.set(canonicalKey, lead);
  }
  await saveActiveRun(initialRun);
  const startBroadcastMsg = isAutoDiscovery ? `Auto-discovery research initiated in ${payload.locationName}...` : `Research initiated for ${targetLeadCount} leads in ${payload.locationName}...`;
  broadcastProgress(initialRun, "STARTING", startBroadcastMsg);
  let currentTabId = null;
  const startKi = initialRun.activeKeywordIndex || 0;
  const completedKeywords = [...initialRun.frontier?.completedKeywords || []];
  let isStalled = false;
  let batchIndex = initialRun.lastCheckpointBatch || 0;
  try {
    for (let ki = startKi; ki < keywords.length; ki++) {
      if (cancelledRuns.has(runId)) break;
      const currentLeadCount = initialRun.counters?.finalUniqueRelevantLeads ?? initialRun.counters?.finalUniqueLeads ?? existingEntitiesMap.size;
      if (currentLeadCount >= effectiveCeiling) break;
      const currentKeyword = keywords[ki];
      initialRun.activeKeywordIndex = ki;
      initialRun.currentKeyword = currentKeyword;
      initialRun.keywordsCompleted = completedKeywords.length;
      initialRun.totalKeywords = keywords.length;
      initialRun.status = "NAVIGATING";
      const searchUrl = `https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=${encodeURIComponent(countryCode)}&q=${encodeURIComponent(currentKeyword)}`;
      broadcastProgress(initialRun, "NAVIGATING", `Opening Meta Ad Library for "${currentKeyword}" in ${countryCode}...`);
      if (!currentTabId) {
        const tab = await chrome.tabs.create({ url: searchUrl, active: false });
        currentTabId = tab.id || null;
      } else {
        await chrome.tabs.update(currentTabId, { url: searchUrl });
      }
      if (!currentTabId) {
        throw new Error("Failed to create or update browser tab for research.");
      }
      await waitForTabLoad(currentTabId);
      await wait(3e3);
      initialRun.status = "COLLECTING";
      broadcastProgress(initialRun, "COLLECTING", `Connected to Ad Library. Starting ad collection for "${currentKeyword}"...`);
      let consecutiveNoNewCards = 0;
      let scrollAttempts = 0;
      const maxScrolls = isAutoDiscovery ? 60 : Math.max(25, Math.ceil((targetLeadCount || 10) * 3));
      while (scrollAttempts < maxScrolls && !cancelledRuns.has(runId)) {
        const liveCount = initialRun.counters?.finalUniqueRelevantLeads ?? initialRun.counters?.finalUniqueLeads ?? existingEntitiesMap.size;
        if (liveCount >= effectiveCeiling) break;
        scrollAttempts++;
        try {
          const tabCheck = await chrome.tabs.get(currentTabId);
          if (!tabCheck) {
            initialRun.status = "BROWSER_TAB_CLOSED";
            initialRun.stopReason = "BROWSER_TAB_CLOSED";
            broadcastProgress(initialRun, "BROWSER_TAB_CLOSED", "Ad Library tab was closed during research.");
            break;
          }
        } catch {
          initialRun.status = "BROWSER_TAB_CLOSED";
          initialRun.stopReason = "BROWSER_TAB_CLOSED";
          broadcastProgress(initialRun, "BROWSER_TAB_CLOSED", "Ad Library tab was closed during research.");
          break;
        }
        let response = null;
        try {
          response = await chrome.tabs.sendMessage(currentTabId, {
            type: "SCAN_AND_EXTRACT",
            payload: { keyword: currentKeyword, scroll: true }
          });
        } catch (err) {
          try {
            await chrome.scripting.executeScript({
              target: { tabId: currentTabId },
              files: ["content-script.js"]
            });
            await wait(1e3);
            response = await chrome.tabs.sendMessage(currentTabId, {
              type: "SCAN_AND_EXTRACT",
              payload: { keyword: currentKeyword, scroll: true }
            });
          } catch (scriptErr) {
            broadcastProgress(initialRun, "COLLECTING", `Tab communication retry: ${scriptErr.message}`);
          }
        }
        if (response && response.type === "CHALLENGE_DETECTED") {
          const isRateLimit = response.code === "RATE_LIMITED" || response.reason && response.reason.includes("rate limit");
          initialRun.status = isRateLimit ? "RATE_LIMITED" : "CHALLENGED";
          initialRun.challengeReason = response.reason || "Meta Ad Library security challenge presented.";
          initialRun.stopReason = isRateLimit ? "RATE_LIMITED" : "CHALLENGED";
          broadcastProgress(initialRun, initialRun.status, `Access restricted: ${initialRun.challengeReason}`);
          await saveRunRecord(initialRun);
          await saveActiveRun(initialRun);
          await appendToHistory(initialRun);
          return initialRun;
        }
        const candidates = response && response.payload && response.payload.candidates || [];
        if (candidates.length > 0) {
          batchIndex++;
          const batchResult = await processBatch(
            candidates,
            existingEntitiesMap,
            seenAdLibraryIds,
            seenEntityKeys,
            initialRun.counters || {
              rawAds: 0,
              normalizedCandidates: 0,
              relevantCandidates: 0,
              uncertainCandidates: 0,
              notRelevantCandidates: 0,
              duplicatesRemoved: 0,
              finalUniqueLeads: 0,
              uniqueEntitiesObserved: 0,
              relevantEntities: 0,
              uncertainEntities: 0,
              notRelevantEntities: 0,
              keywordsCompleted: completedKeywords.length,
              keywordsTotal: keywords.length,
              finalUniqueRelevantLeads: 0,
              reasonCodes: {}
            },
            {
              runId,
              countryCode,
              locationName: payload.locationName,
              currentKeyword,
              intent: researchIntent,
              effectiveCeiling
            }
          );
          await saveBatch(runId, {
            batchIndex,
            ads: batchResult.processedAds,
            entities: batchResult.updatedEntities,
            evidence: batchResult.newEvidence,
            checkpoint: {
              runId,
              batchIndex,
              timestamp: (/* @__PURE__ */ new Date()).toISOString(),
              activeKeywordIndex: ki,
              currentKeyword,
              rawAdsCount: batchResult.counters.rawAds,
              normalizedCandidatesCount: batchResult.counters.normalizedCandidates,
              uniqueEntitiesCount: batchResult.counters.uniqueEntitiesObserved || 0,
              relevantEntitiesCount: batchResult.counters.relevantEntities || 0,
              uncertainEntitiesCount: batchResult.counters.uncertainEntities || 0,
              notRelevantEntitiesCount: batchResult.counters.notRelevantEntities || 0,
              duplicatesRemovedCount: batchResult.counters.duplicatesRemoved,
              finalUniqueRelevantLeads: batchResult.counters.finalUniqueRelevantLeads || batchResult.counters.finalUniqueLeads,
              seenLibraryIdsCount: seenAdLibraryIds.size,
              seenEntityKeysCount: seenEntityKeys.size
            }
          });
          const allLeadsList = Array.from(existingEntitiesMap.values());
          initialRun.leads = allLeadsList.slice(0, 50);
          initialRun.totalAdsInspected = batchResult.counters.rawAds;
          initialRun.counters = batchResult.counters;
          initialRun.rejectedLeadsCount = batchResult.counters.notRelevantCandidates;
          initialRun.uncertainLeadsCount = batchResult.counters.uncertainCandidates;
          initialRun.lastCheckpointBatch = batchIndex;
          initialRun.currentKeyword = currentKeyword;
          initialRun.keywordsCompleted = completedKeywords.length;
          initialRun.totalKeywords = keywords.length;
          initialRun.entitiesEvaluated = batchResult.counters.uniqueEntitiesObserved || 0;
          initialRun.frontier = {
            activeKeywordIndex: ki,
            keywords,
            currentKeyword,
            completedKeywords: [...completedKeywords],
            seenLibraryIdsCount: seenAdLibraryIds.size,
            seenEntityKeysCount: seenEntityKeys.size,
            lastBatchIndex: batchIndex,
            checkpointTimestamp: (/* @__PURE__ */ new Date()).toISOString()
          };
          if (batchResult.processedAds.length === 0) {
            consecutiveNoNewCards++;
          } else {
            consecutiveNoNewCards = 0;
          }
          candidates.length = 0;
          batchResult.processedAds.length = 0;
          broadcastProgress(
            initialRun,
            "COLLECTING",
            `Discovered ${initialRun.counters.finalUniqueRelevantLeads || initialRun.counters.finalUniqueLeads} leads | Inspected ${initialRun.counters.rawAds} ads | Evaluated ${initialRun.counters.uniqueEntitiesObserved || 0} entities (${currentKeyword})...`
          );
          const finalLeadsCount = initialRun.counters.finalUniqueRelevantLeads || initialRun.counters.finalUniqueLeads;
          if (batchResult.safetyLimitReached || finalLeadsCount >= effectiveCeiling) {
            if (isAutoDiscovery) {
              broadcastProgress(initialRun, "NORMALIZING", `5,000-lead safety limit reached.`);
            } else {
              broadcastProgress(initialRun, "NORMALIZING", `Target lead quota of ${targetLeadCount} reached.`);
            }
            break;
          }
          if (response.payload && response.payload.atBottom && consecutiveNoNewCards >= 2) {
            broadcastProgress(initialRun, "COLLECTING", `Reached end of public search results for "${currentKeyword}".`);
            break;
          }
          if (consecutiveNoNewCards >= 3) {
            isStalled = true;
            broadcastProgress(initialRun, "COLLECTING", `No additional ad cards loaded for "${currentKeyword}". Moving forward.`);
            break;
          }
        } else {
          broadcastProgress(initialRun, "COLLECTING", `Waiting for ad cards to render (attempt ${scrollAttempts})...`);
          await wait(2e3);
        }
      }
      completedKeywords.push(currentKeyword);
      initialRun.keywordsCompleted = completedKeywords.length;
      if ((initialRun.counters?.finalUniqueRelevantLeads || initialRun.counters?.finalUniqueLeads || 0) >= effectiveCeiling) {
        break;
      }
    }
    const finalLeadCount = initialRun.counters?.finalUniqueRelevantLeads ?? initialRun.counters?.finalUniqueLeads ?? existingEntitiesMap.size;
    if (cancelledRuns.has(runId)) {
      initialRun.status = "CANCELLED";
      initialRun.stopReason = "USER_CANCELLED";
      broadcastProgress(initialRun, "CANCELLED", `Research was explicitly cancelled by user.`);
    } else if (initialRun.stopReason === "BROWSER_TAB_CLOSED" || initialRun.status === "BROWSER_TAB_CLOSED") {
      initialRun.status = "BROWSER_TAB_CLOSED";
      initialRun.stopReason = "BROWSER_TAB_CLOSED";
      broadcastProgress(initialRun, "BROWSER_TAB_CLOSED", `Research halted because the Ad Library tab was closed.`);
    } else if (initialRun.status === "CHALLENGED" || initialRun.status === "RATE_LIMITED" || initialRun.status === "BLOCKED") {
    } else if (finalLeadCount >= effectiveCeiling) {
      initialRun.status = "COMPLETED";
      if (isAutoDiscovery) {
        initialRun.stopReason = "SAFETY_LIMIT_REACHED";
        broadcastProgress(
          initialRun,
          "COMPLETED",
          `Research stopped at the current system safety limit of 5,000 unique relevant leads.`
        );
      } else {
        initialRun.stopReason = "TARGET_REACHED";
        broadcastProgress(
          initialRun,
          "COMPLETED",
          `Target lead quota of ${targetLeadCount} reached.`
        );
      }
    } else {
      initialRun.status = "PARTIAL";
      if (initialRun.totalAdsInspected === 0) {
        initialRun.stopReason = "NO_NEW_RESULTS_OBSERVED";
      } else if (isStalled) {
        initialRun.stopReason = "SOURCE_PROGRESS_STALLED";
      } else {
        initialRun.stopReason = "SOURCE_EXHAUSTED";
      }
      initialRun.completedAt = (/* @__PURE__ */ new Date()).toISOString();
      const completionMsg = isAutoDiscovery ? `Auto-discovery finished (${initialRun.status} / ${initialRun.stopReason}): ${finalLeadCount} qualifying unique relevant leads discovered from ${initialRun.totalAdsInspected} public ads.` : `Research finished (${initialRun.status} / ${initialRun.stopReason}): ${finalLeadCount} of ${targetLeadCount} requested unique relevant leads observed from ${initialRun.totalAdsInspected} public ads.`;
      broadcastProgress(
        initialRun,
        initialRun.status,
        completionMsg
      );
    }
  } catch (err) {
    initialRun.status = "FAILED";
    initialRun.stopReason = "FAILED";
    initialRun.challengeReason = err.message || "Unexpected error occurred during research.";
    broadcastProgress(initialRun, "FAILED", `Error: ${initialRun.challengeReason}`);
  } finally {
    if (currentTabId) {
      try {
        await chrome.tabs.remove(currentTabId);
      } catch {
      }
    }
    initialRun.completedAt = (/* @__PURE__ */ new Date()).toISOString();
    await saveRunRecord(initialRun);
    await saveActiveRun(initialRun);
    await appendToHistory(initialRun);
    if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.sendMessage) {
      chrome.runtime.sendMessage({
        type: "RESEARCH_COMPLETED",
        payload: { run: initialRun }
      }).catch(() => {
      });
    }
  }
  return initialRun;
}
if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.onMessage) {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "START_RESEARCH") {
      chrome.storage.local.get(["activeResearchRun"], (data) => {
        const activeRun = data.activeResearchRun;
        if (activeRun && ["STARTING", "NAVIGATING", "COLLECTING", "NORMALIZING"].includes(activeRun.status)) {
          const lastUpdate = new Date(activeRun.lastUpdatedAt).getTime();
          if (Date.now() - lastUpdate < STALE_JOB_THRESHOLD_MS) {
            sendResponse({ success: false, error: "A research job is already active." });
            return;
          }
        }
        const runId = `run_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
        const isAutoDiscovery = message.payload.researchMode === "AUTO_DISCOVERY" || message.payload.maxResults === void 0;
        const effectiveCeiling = isAutoDiscovery ? MAX_FINAL_UNIQUE_RELEVANT_LEADS_PER_RESEARCH : Math.min(Math.max(1, message.payload.maxResults || MAX_FINAL_UNIQUE_RELEVANT_LEADS_PER_RESEARCH), MAX_FINAL_UNIQUE_RELEVANT_LEADS_PER_RESEARCH);
        const targetLeadCount = isAutoDiscovery ? void 0 : effectiveCeiling;
        const keywords = message.payload.keywords.map((k) => (k || "").trim()).filter(Boolean);
        const initialRun = {
          runId,
          researchName: message.payload.researchName || `${message.payload.mode === "PRESET" ? message.payload.presetName || "Preset" : keywords[0]} in ${message.payload.locationName}`,
          mode: message.payload.mode,
          presetId: message.payload.presetId,
          presetName: message.payload.presetName,
          keywords,
          countryCode: message.payload.countryCode || "US",
          locationName: message.payload.locationName,
          researchMode: isAutoDiscovery ? "AUTO_DISCOVERY" : void 0,
          maxFinalUniqueRelevantLeads: isAutoDiscovery ? MAX_FINAL_UNIQUE_RELEVANT_LEADS_PER_RESEARCH : void 0,
          maxResults: message.payload.maxResults ?? effectiveCeiling,
          targetLeadCount,
          status: "STARTING",
          leads: [],
          rejectedLeadsCount: 0,
          uncertainLeadsCount: 0,
          relevanceStrategyVersion: RELEVANCE_STRATEGY_VERSION,
          engineVersion: RELEVANCE_ENGINE_VERSION,
          counters: {
            rawAds: 0,
            normalizedCandidates: 0,
            relevantCandidates: 0,
            uncertainCandidates: 0,
            notRelevantCandidates: 0,
            duplicatesRemoved: 0,
            finalUniqueLeads: 0
          },
          logs: [],
          startedAt: (/* @__PURE__ */ new Date()).toISOString(),
          lastUpdatedAt: (/* @__PURE__ */ new Date()).toISOString(),
          schemaVersion: SCHEMA_VERSION,
          totalAdsInspected: 0
        };
        saveActiveRun(initialRun).catch(() => {
        });
        executeResearchPipeline(message.payload, runId, initialRun).catch((err) => {
          console.error("[service-worker] Background pipeline error:", err);
        });
        sendResponse({ success: true, runId, run: initialRun });
      });
      return true;
    }
    if (message.type === "STOP_RESEARCH" || message.type === "CANCEL_RESEARCH") {
      const runId = message.payload?.runId;
      if (runId) {
        cancelledRuns.add(runId);
      }
      chrome.storage.local.get(["activeResearchRun"], (data) => {
        if (data && data.activeResearchRun) {
          const run = data.activeResearchRun;
          run.status = "CANCELLED";
          run.stopReason = "USER_CANCELLED";
          saveActiveRun(run).catch(() => {
          });
        }
      });
      sendResponse({ success: true, message: "Cancellation signal sent." });
      return false;
    }
    if (message.type === "GET_STATE") {
      chrome.storage.local.get(["activeResearchRun"], (result) => {
        sendResponse({ activeResearchRun: result.activeResearchRun || null });
      });
      return true;
    }
    if (message.type === "GET_HISTORY") {
      chrome.storage.local.get(["researchHistory"], (result) => {
        sendResponse({ history: result.researchHistory || [] });
      });
      return true;
    }
    if (message.type === "CLEAR_HISTORY") {
      chrome.storage.local.set({ researchHistory: [] }, () => {
        sendResponse({ success: true });
      });
      return true;
    }
    if (message.type === "GET_ALL_LEADS_FOR_EXPORT") {
      const targetRunId = message.payload?.runId;
      if (!targetRunId) {
        sendResponse({ success: false, error: "runId required" });
        return false;
      }
      getAllRelevantLeads(targetRunId).then((leads) => {
        sendResponse({ success: true, leads });
      }).catch((err) => {
        sendResponse({ success: false, error: err.message });
      });
      return true;
    }
    if (message.type === "RESUME_RESEARCH") {
      const targetRunId = message.payload?.runId;
      chrome.storage.local.get(["activeResearchRun"], async (data) => {
        const activeRun = data.activeResearchRun;
        if (!activeRun || targetRunId && activeRun.runId !== targetRunId) {
          sendResponse({ success: false, error: "No matching research run available to resume." });
          return;
        }
        activeRun.status = "STARTING";
        await saveActiveRun(activeRun);
        executeResearchPipeline(
          {
            mode: activeRun.mode,
            presetId: activeRun.presetId,
            presetName: activeRun.presetName,
            keywords: activeRun.keywords,
            countryCode: activeRun.countryCode,
            locationName: activeRun.locationName,
            researchName: activeRun.researchName,
            researchMode: activeRun.researchMode,
            maxResults: activeRun.maxResults
          },
          activeRun.runId,
          activeRun
        ).catch((err) => {
          console.error("[service-worker] Resume execution error:", err);
        });
        sendResponse({ success: true, run: activeRun });
      });
      return true;
    }
    return false;
  });
}
if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.onInstalled) {
  chrome.runtime.onInstalled.addListener(() => {
    console.log("[Meta Ad Library Scraper] Extension installed successfully.");
  });
}
checkStaleJobs().catch((err) => console.error("[service-worker] checkStaleJobs error:", err));
//# sourceMappingURL=service-worker.js.map

(() => {
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

  // src/extension/metaAdapter.ts
  function checkForBotChallenge(doc) {
    const text = doc.body ? doc.body.innerText : "";
    if (text.includes("Security Check") || text.includes("Enter the characters you see below")) {
      return { isBlocked: true, reason: "Meta Security Check / CAPTCHA challenge presented.", code: "CHALLENGED" };
    }
    if (text.includes("You\u2019re Temporarily Blocked") || text.includes("You are temporarily blocked") || text.includes("Rate limit exceeded") || text.includes("Too Many Requests")) {
      return { isBlocked: true, reason: "Meta access temporarily rate-limited.", code: "RATE_LIMITED" };
    }
    if (text.includes("Log In to Facebook") && doc.querySelectorAll('input[type="password"]').length > 0) {
      const hasAdCards = Array.from(doc.querySelectorAll("span, div")).some(
        (el) => el.textContent && el.textContent.includes("Library ID:")
      );
      if (!hasAdCards) {
        return { isBlocked: true, reason: "Meta mandatory login dialog restricting public ad library access.", code: "CHALLENGED" };
      }
    }
    return { isBlocked: false };
  }
  function extractUrlFromShim(rawHref) {
    if (!rawHref || typeof rawHref !== "string") return {};
    let targetUrl = rawHref.trim();
    try {
      const parsed = new URL(targetUrl);
      const host = parsed.hostname.toLowerCase();
      if (host.includes("facebook.com") && (parsed.pathname === "/l.php" || parsed.pathname.includes("/l.php"))) {
        const uParam = parsed.searchParams.get("u");
        if (uParam) {
          targetUrl = decodeURIComponent(uParam);
        }
      }
      const finalParsed = new URL(targetUrl);
      const finalHost = finalParsed.hostname.toLowerCase();
      const fbInternalDomains = [
        "facebook.com",
        "fb.com",
        "fb.me",
        "meta.com",
        "messenger.com",
        "instagram.com",
        "threads.net",
        "whatsapp.com"
      ];
      const isInternal = fbInternalDomains.some(
        (domain) => finalHost === domain || finalHost.endsWith("." + domain)
      );
      if (isInternal) {
        if (finalHost.includes("instagram.com")) {
          return {
            destinationUrl: targetUrl,
            domain: "instagram.com"
          };
        }
        return {};
      }
      const cleanDomain = finalHost.replace(/^www\./, "");
      return {
        destinationUrl: targetUrl,
        domain: cleanDomain
      };
    } catch {
      return {};
    }
  }
  function extractFacebookPageInfo(href, linkText) {
    if (!href) return {};
    try {
      const parsed = new URL(href);
      const host = parsed.hostname.toLowerCase();
      if (!host.includes("facebook.com") && !host.includes("fb.com")) return {};
      const path = parsed.pathname;
      if (path === "/" || path.startsWith("/ads/") || path.startsWith("/policy") || path.startsWith("/help") || path.startsWith("/settings") || path.startsWith("/legal") || path.includes("terms")) {
        return {};
      }
      const cleanUrl = `https://www.facebook.com${path}`;
      return {
        pageUrl: cleanUrl,
        pageName: linkText?.trim() || void 0
      };
    } catch {
      return {};
    }
  }
  function extractAdCardsFromDocument(doc, observedKeyword) {
    const candidates = [];
    const seenLibraryIds = /* @__PURE__ */ new Set();
    const allElements = Array.from(doc.querySelectorAll("div, span"));
    const idElements = allElements.filter((el) => {
      return el.children.length === 0 && el.textContent && el.textContent.includes("Library ID:");
    });
    for (const idEl of idElements) {
      const text = idEl.textContent || "";
      const match = text.match(/Library ID:\s*([0-9]+)/i);
      if (!match) continue;
      const libraryId = match[1];
      if (seenLibraryIds.has(libraryId)) continue;
      seenLibraryIds.add(libraryId);
      let container = idEl;
      let cardRoot = null;
      while (container && container.parentElement && container.parentElement !== doc.body) {
        if (container.parentElement.children.length > 3 && container.querySelectorAll("a").length > 0 && container.offsetHeight > 150) {
          cardRoot = container;
          break;
        }
        container = container.parentElement;
      }
      if (!cardRoot) {
        let fallback = idEl.parentElement;
        for (let i = 0; i < 7; i++) {
          if (fallback && fallback.parentElement && fallback.parentElement !== doc.body) {
            fallback = fallback.parentElement;
          }
        }
        cardRoot = fallback || idEl;
      }
      const cardFullText = cardRoot.innerText || cardRoot.textContent || "";
      const isActive = !cardFullText.includes("Inactive") && (cardFullText.includes("Active") || true);
      let startedRunning = "";
      const dateMatch = cardFullText.match(/Started running on ([^\n~·]+)/i);
      if (dateMatch) {
        startedRunning = dateMatch[1].trim();
      } else {
        const rangeMatch = cardFullText.match(/([0-9]{1,2}\s+[A-Za-z]{3}\s+[0-9]{4}\s*-\s*[0-9]{1,2}\s+[A-Za-z]{3}\s+[0-9]{4})/i);
        if (rangeMatch) startedRunning = rangeMatch[1].trim();
      }
      const hasMultipleVersions = cardFullText.includes("This ad has multiple versions");
      let pageName = "Unknown Advertiser";
      let facebookPageUrl;
      let facebookPageId;
      const links = Array.from(cardRoot.querySelectorAll("a"));
      for (const link of links) {
        const href = link.href || "";
        const linkText = link.innerText || link.textContent || "";
        const fbInfo = extractFacebookPageInfo(href, linkText);
        if (fbInfo.pageUrl) {
          facebookPageUrl = fbInfo.pageUrl;
          if (linkText && linkText.trim() && !pageName || pageName === "Unknown Advertiser") {
            pageName = linkText.trim();
          }
          const idMatch = fbInfo.pageUrl.match(/facebook\.com\/([0-9]{5,})/);
          if (idMatch) facebookPageId = idMatch[1];
          break;
        }
      }
      if (pageName === "Unknown Advertiser") {
        const sponsoredIndex = cardFullText.indexOf("Sponsored");
        if (sponsoredIndex > 0) {
          const textBefore = cardFullText.substring(0, sponsoredIndex).trim();
          const lines = textBefore.split("\n").map((l) => l.trim()).filter(Boolean);
          const lastLine = lines.pop();
          if (lastLine && lastLine.length > 1 && !lastLine.includes("Library ID") && !lastLine.includes("Active")) {
            pageName = lastLine;
          }
        }
      }
      let destinationUrl;
      let destinationDomain;
      let ctaText;
      for (const link of links) {
        const href = link.href || "";
        const dest = extractUrlFromShim(href);
        if (dest.destinationUrl) {
          destinationUrl = dest.destinationUrl;
          destinationDomain = dest.domain;
          const text2 = (link.innerText || link.textContent || "").trim();
          if (text2 && text2.length < 50) {
            ctaText = text2.split("\n").pop()?.trim();
          }
          break;
        }
      }
      if (!ctaText) {
        const ctaPatterns = ["Learn more", "Shop Now", "Sign Up", "Contact Us", "Apply Now", "Book Now", "Get Quote", "Download"];
        for (const pattern of ctaPatterns) {
          if (cardFullText.includes(pattern)) {
            ctaText = pattern;
            break;
          }
        }
      }
      let bodyCopy = "";
      const bodyMatch = cardFullText.match(/Sponsored\s*\n([\s\S]{10,350})/);
      if (bodyMatch) {
        bodyCopy = bodyMatch[1].trim().replace(/\n+/g, " ");
      } else {
        bodyCopy = cardFullText.substring(0, 200).replace(/\n+/g, " ");
      }
      candidates.push({
        libraryId,
        pageName,
        facebookPageUrl,
        facebookPageId,
        destinationUrl,
        destinationDomain,
        isActive,
        startedRunning,
        hasMultipleVersions,
        bodyCopy: bodyCopy.substring(0, 300),
        ctaText,
        observedKeyword,
        rawText: cardFullText.substring(0, 200)
      });
    }
    return candidates;
  }

  // src/extension/content-script.ts
  console.log("[Meta Ad Library Scraper] Content script active on:", window.location.href);
  try {
    if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.sendMessage) {
      chrome.runtime.sendMessage({
        type: "CONTENT_SCRIPT_READY",
        payload: { url: window.location.href, timestamp: Date.now() }
      }).catch(() => {
      });
    }
  } catch {
  }
  if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.onMessage) {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === "SCAN_AND_EXTRACT") {
        const keyword = message.payload?.keyword || "";
        const shouldScroll = message.payload?.scroll ?? true;
        const challenge = checkForBotChallenge(document);
        if (challenge.isBlocked) {
          sendResponse({
            type: "CHALLENGE_DETECTED",
            reason: challenge.reason,
            code: challenge.code || "CHALLENGED"
          });
          return true;
        }
        const candidates = extractAdCardsFromDocument(document, keyword);
        if (shouldScroll) {
          const prevScrollY = window.scrollY;
          window.scrollBy({ top: 1200, behavior: "smooth" });
          setTimeout(() => {
            const updatedCandidates = extractAdCardsFromDocument(document, keyword);
            sendResponse({
              type: "CANDIDATES_COLLECTED",
              payload: {
                candidates: updatedCandidates,
                count: updatedCandidates.length,
                scrolled: window.scrollY > prevScrollY,
                atBottom: window.innerHeight + window.scrollY >= document.body.offsetHeight - 200
              }
            });
          }, 1200);
          return true;
        }
        sendResponse({
          type: "CANDIDATES_COLLECTED",
          payload: {
            candidates,
            count: candidates.length,
            scrolled: false,
            atBottom: false
          }
        });
        return true;
      }
      return false;
    });
  }
})();
//# sourceMappingURL=content-script.js.map

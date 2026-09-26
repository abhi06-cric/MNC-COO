import microsoftImg from "../assets/image/companies/microsoft.jpg";
import googleImg from "../assets/image/companies/google.jpg";
import metaImg from "../assets/image/companies/meta.jpg";
import appleImg from "../assets/image/companies/apple.jpg";
import amazonImg from "../assets/image/companies/amazon.jpg";
import goldmanSachsImg from "../assets/image/companies/goldman_sachs.jpg";
import jpmorganImg from "../assets/image/companies/jpmorgan.jpg";
import ibmImg from "../assets/image/companies/ibm.jpg";
import linkedinImg from "../assets/image/companies/linkedin.jpg";
import deloitteImg from "../assets/image/companies/deloitte.jpg";


export const companyShowcase = [
  {
    id: "microsoft",
    name: "Microsoft Corporation",
    shortName: "Microsoft",
    image: microsoftImg,
    sector: "Enterprise Software & Cloud Computing",
    headquarters: "Redmond, Washington, United States",
    founded: "1975",
    valuation: "₹3.15+ Trillion",
    metricLabel: "Cloud Presence",
    metricValue: "60+ Azure Regions",
    tagline: "Empowering every person and organization on the planet to achieve more.",
    description:
      "Microsoft stands at the vanguard of the modern enterprise era. From architecting the foundational Windows OS and Microsoft 365 productivity suite to pioneering enterprise-grade artificial intelligence through Azure OpenAI Service, Microsoft anchors global digital infrastructure across Fortune 500 corporations, governments, and sovereign institutions worldwide.",
    pillars: ["Azure Cloud", "Enterprise AI & Copilot", "Microsoft 365", "GitHub Ecosystem"],
    website: "https://www.microsoft.com"
  },
  {
    id: "google",
    name: "Google (Alphabet Inc.)",
    shortName: "Google",
    image: googleImg,
    sector: "Search, Artificial Intelligence & Cloud Platforms",
    headquarters: "Mountain View, California, United States",
    founded: "1998",
    valuation: "₹2.15+ Trillion",
    metricLabel: "Daily Queries",
    metricValue: "8.5+ Billion",
    tagline: "Organizing the world's information and making it universally accessible and useful.",
    description:
      "A global cornerstone of internet connectivity and artificial intelligence research, Google powers the world's primary gateway to knowledge through Google Search, Android, YouTube, and Google DeepMind. Google Cloud Platform (GCP) delivers hyperscale infrastructure, real-time analytics, and enterprise generative AI solutions for global commerce.",
    pillars: ["Google DeepMind & Gemini", "Google Cloud Platform", "Search Engine Dominance", "Android OS"],
    website: "https://about.google"
  },
  {
    id: "meta",
    name: "Meta Platforms, Inc.",
    shortName: "Meta",
    image: metaImg,
    sector: "Social Technologies & Immersive Computing",
    headquarters: "Menlo Park, California, United States",
    founded: "2004",
    valuation: "₹1.45+ Trillion",
    metricLabel: "Active Family",
    metricValue: "3.2+ Billion Daily",
    tagline: "Building technologies that help people connect, find communities, and grow businesses.",
    description:
      "Meta connects billions of humans across Facebook, Instagram, WhatsApp, and Threads. By championing open-source artificial intelligence with the Llama foundational model family and pioneering spatial reality through Reality Labs, Meta is redefining modern interpersonal communication and digital commerce.",
    pillars: ["Llama Open-Source AI", "Instagram & WhatsApp Ecosystem", "Reality Labs & Quest", "Global Ad Infrastructure"],
    website: "https://about.meta.com"
  },
  {
    id: "apple",
    name: "Apple Inc.",
    shortName: "Apple",
    image: appleImg,
    sector: "Consumer Electronics, Silicon & Software",
    headquarters: "Cupertino, California, United States",
    founded: "1976",
    valuation: "₹3.40+ Trillion",
    metricLabel: "Active Devices",
    metricValue: "2.2+ Billion Worldwide",
    tagline: "Think Different — Integrating hardware, software, and services with uncompromising elegance.",
    description:
      "Renowned for exquisite industrial design, uncompromising user privacy, and proprietary Apple Silicon (M-series & A-series), Apple designs the hardware and software systems that define personal computing, mobile smartphones, wearable health monitoring, and high-margin digital subscription services.",
    pillars: ["Apple Silicon Architecture", "iPhone & Mac Ecosystem", "Apple Services & iCloud", "Privacy by Design"],
    website: "https://www.apple.com"
  },
  {
    id: "amazon",
    name: "Amazon.com, Inc.",
    shortName: "Amazon",
    image: amazonImg,
    sector: "Global E-Commerce & Hyperscale Cloud Infrastructure",
    headquarters: "Seattle, Washington, United States",
    founded: "1994",
    valuation: "₹2.05+ Trillion",
    metricLabel: "AWS Cloud Share",
    metricValue: "#1 Global Infrastructure",
    tagline: "Earth's most customer-centric company and the backbone of modern cloud computing.",
    description:
      "Amazon revolutionized international retail, supply-chain logistics, and enterprise computing. Amazon Web Services (AWS) serves as the world's most comprehensive and broadly adopted cloud platform, powering financial systems, healthcare applications, defense networks, and high-growth technology unicorns across every continent.",
    pillars: ["AWS Hyperscale Cloud", "Global Fulfillment Network", "Prime Ecosystem", "Bedrock GenAI Platform"],
    website: "https://www.amazon.com"
  },
  {
    id: "goldman_sachs",
    name: "The Goldman Sachs Group, Inc.",
    shortName: "Goldman Sachs",
    image: goldmanSachsImg,
    sector: "Global Investment Banking, Securities & Asset Management",
    headquarters: "New York City, New York, United States",
    founded: "1869",
    valuation: "₹165+ Billion",
    metricLabel: "Assets Supervised",
    metricValue: "₹2.8+ Trillion",
    tagline: "Advising the world's leading companies, governments, and financial institutions.",
    description:
      "For over 150 years, Goldman Sachs has engineered premier financial advisory, capital raising, prime brokerage, and asset management services. The institution finances cross-border mergers and acquisitions, provides institutional liquidity, and spearheads quantitative algorithmic trading systems across the globe.",
    pillars: ["M&A Advisory & Underwriting", "Global Markets & Trading", "Asset & Wealth Management", "Institutional Finance"],
    website: "https://www.goldmansachs.com"
  },
  {
    id: "jpmorgan",
    name: "JPMorgan Chase & Co.",
    shortName: "JPMorgan Chase",
    image: jpmorganImg,
    sector: "Diversified Financial Services & Commercial Banking",
    headquarters: "New York City, New York, United States",
    founded: "1799",
    valuation: "₹590+ Billion",
    metricLabel: "Total Assets",
    metricValue: "₹4.1+ Trillion",
    tagline: "The largest bank in the United States and a leader in worldwide financial stability.",
    description:
      "JPMorgan Chase operates as a pillar of global economic stability, managing trillions in assets and facilitating trillions in daily transactions. Its Corporate & Investment Bank orchestrates capital markets for multinational corporations, while its retail and wealth wings safeguard consumer deposits and institutional endowments.",
    pillars: ["Corporate & Investment Bank", "Asset Management", "Treasury & Payments Network", "FinTech & AI Innovation"],
    website: "https://www.jpmorganchase.com"
  },
  {
    id: "ibm",
    name: "International Business Machines (IBM)",
    shortName: "IBM",
    image: ibmImg,
    sector: "Hybrid Cloud, Enterprise AI & Quantum Systems",
    headquarters: "Armonk, New York, United States",
    founded: "1911",
    valuation: "₹195+ Billion",
    metricLabel: "Patents & Research",
    metricValue: "110+ Years Innovation",
    tagline: "Let's create the solutions that transform businesses and redefine industries.",
    description:
      "IBM represents one of the most resilient and transformative engineering giants in corporate history. Today, through Red Hat OpenShift, the watsonx generative AI platform, and groundbreaking quantum computing hardware (IBM Quantum System Two), IBM powers mission-critical hybrid cloud deployments for the world's largest banks and airlines.",
    pillars: ["watsonx Enterprise AI", "Red Hat Hybrid Cloud", "Quantum Computing", "Mainframe zSystems"],
    website: "https://www.ibm.com"
  },
  {
    id: "linkedin",
    name: "LinkedIn Corporation",
    shortName: "LinkedIn",
    image: linkedinImg,
    sector: "Professional Social Network & Economic Graph",
    headquarters: "Sunnyvale, California, United States",
    founded: "2003",
    valuation: "Part of Microsoft",
    metricLabel: "Global Members",
    metricValue: "1.0+ Billion Worldwide",
    tagline: "Connecting the world's professionals to make them more productive and successful.",
    description:
      "LinkedIn is the preeminent global professional network, cataloging the Economic Graph of workers, skills, jobs, and institutions across 200+ territories. It serves as the primary recruiting, enterprise B2B sales intelligence, and continuous professional learning hub for executives and talent worldwide.",
    pillars: ["Economic Graph Mapping", "Talent Solutions & Hiring", "B2B Marketing Solutions", "LinkedIn Learning"],
    website: "https://www.linkedin.com"
  },
  {
    id: "deloitte",
    name: "Deloitte Touche Tohmatsu Limited",
    shortName: "Deloitte",
    image: deloitteImg,
    sector: "Audit, Consulting, Tax & Enterprise Advisory",
    headquarters: "London, United Kingdom / Global Network",
    founded: "1845",
    valuation: "₹67+ Billion Revenue",
    metricLabel: "Professional Workforce",
    metricValue: "450,000+ Specialists",
    tagline: "Making an impact that matters for clients, people, and society.",
    description:
      "As the largest member of the Big Four professional services networks, Deloitte guides Fortune Global 500 executives through regulatory complexity, enterprise digital transformation, cyber resilience, and financial assurance. Its global practice spans every major market and jurisdiction.",
    pillars: ["Digital & Cloud Advisory", "Strategic M&A Consulting", "Financial Audit & Assurance", "Enterprise Cyber Defense"],
    website: "https://www.deloitte.com"
  }
];

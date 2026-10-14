// Scores a pasted job description against evidence shown on this site.
// Skills are things the portfolio can back up; gaps are things a role might ask for
// that the portfolio does not show. Anything unrecognised is ignored rather than guessed.

type Skill = { id: string; label: string; pattern: RegExp; weight: number; evidence: string };
type Gap = { id: string; label: string; pattern: RegExp; weight: number; note: string };

export type Hit = { id: string; label: string; quote: string; detail: string; optional: boolean };

export type MatchResult = {
  score: number | null;
  verdict: string;
  matches: Hit[];
  gaps: Hit[];
  notes: string[];
  lowConfidence: boolean;
};

const YEARS_OF_EXPERIENCE = 10;

const skills: Skill[] = [
  { id: "ai", label: "AI and LLM features", pattern: /\b(ai|llms?|genai|generative ai|large language models?|gpt|openai|claude|anthropic|groq|ollama)\b/i, weight: 3, evidence: "Role-scoped AI assistant live in BiznizFlowPilot, with fallback across Groq, Claude and Ollama." },
  { id: "agents", label: "Agents and tool calling", pattern: /\b(ai agents?|agentic|agents?|tool[- ]?(use|calling)|function[- ]calling|mcp)\b/i, weight: 3, evidence: "AI Growth Platform: one schema-validated tool call per step, step limits, and server re-checks before a run counts as done." },
  { id: "guardrails", label: "AI guardrails and approval", pattern: /\b(guardrails?|responsible ai|ai governance|ai safety|human[- ]in[- ]the[- ]loop|approval workflows?|explainab(le|ility))\b/i, weight: 2, evidence: "SEO-GEO Agent: rules decide what is safe, the LLM only rewords, and a person approves before live writes." },
  { id: "architecture", label: "Systems architecture", pattern: /\b(architect(s|ure|ural|ing)?|system design|solutions? design|technical design|design decisions)\b/i, weight: 3, evidence: "Technical owner across 8+ business units at Tax Consulting SA, aligning each design with the CTO before build." },
  { id: "automation", label: "Automation and integration", pattern: /\b(automat(e|ed|ion|ions|ing)\b(?!\s+test)|workflows?|integrat(e|ed|ion|ions|ing)|rpa|zapier|make\.com|n8n)\b/i, weight: 3, evidence: "About 75-80% of current project work is AI and automation; layered automations onto existing HubSpot, CRM and ERP platforms." },
  { id: "multitenant", label: "Multi-tenant SaaS", pattern: /\b(multi[- ]?tenan(t|cy)|saas|tenant isolation)\b/i, weight: 2, evidence: "BiznizFlowPilot scopes every query to a tenant with a CI guard; Plinth enforces tenant scope with PostgreSQL row-level security." },
  { id: "events", label: "Event-driven systems", pattern: /\b(event[- ]driven|events? sourcing|message (queues?|brokers?)|queues?|celery|redis|background (jobs|workers)|outbox|asynchronous processing|idempoten(t|cy))\b/i, weight: 2, evidence: "Transactional event outbox claimed with SKIP LOCKED, capped-backoff retries and idempotency keys (Celery, Redis)." },
  { id: "python", label: "Python and FastAPI", pattern: /\b(python|fastapi|django)\b/i, weight: 2, evidence: "BiznizFlowPilot, LendFlow and the SEO-GEO Agent are built on FastAPI; Prime Vest runs on Django REST Framework." },
  { id: "dotnet", label: ".NET and C#", pattern: /(\.net\b|\bdotnet\b|\bc#|\basp\.net\b|\bef core\b|\bentity framework\b)/i, weight: 2, evidence: "AI Growth Platform runs on .NET 10 and EF Core; current client work is on .NET." },
  { id: "postgres", label: "PostgreSQL and SQL", pattern: /\b(postgres(ql)?|sql|relational databases?|database design|data model(l)?ing)\b/i, weight: 2, evidence: "Designed 94 PostgreSQL tables in one live ERP, with tenant data and an audit log." },
  { id: "frontend", label: "React, Next.js and TypeScript", pattern: /\b(react(\.js)?(?! native)|next\.?js|typescript|javascript|astro|front[- ]?end)\b/i, weight: 2, evidence: "Next.js clients for the ERP, PaySlip Checker and Prime Vest; Astro sites with Lighthouse audits in CI; a React configurator that improved order processing by 25%." },
  { id: "electron", label: "Desktop apps (Electron)", pattern: /\b(electron|desktop app(s|lications?)?)\b/i, weight: 1, evidence: "BiznizFlowPilot ships an Electron desktop client alongside the web app." },
  { id: "azure", label: "Azure", pattern: /\bazure\b/i, weight: 2, evidence: "BiznizFlowPilot is hosted on Azure; current client projects run on Azure and AWS." },
  { id: "aws", label: "AWS", pattern: /\b(aws|amazon web services)\b/i, weight: 2, evidence: "Ran infrastructure on AWS, Azure and OCI at Baher Al-Damasy Group." },
  { id: "oci", label: "Oracle Cloud (OCI)", pattern: /\b(oci|oracle cloud)\b/i, weight: 1, evidence: "Ran OCI infrastructure, codified with Terraform and OCI CLI." },
  { id: "iac", label: "Infrastructure as code", pattern: /\b(terraform|bicep|infrastructure[- ]as[- ]code|iac)\b/i, weight: 2, evidence: "Infrastructure on OCI, AWS and Azure codified with Terraform; Plinth staging in Terraform; the Shapers Church platform in Azure Bicep." },
  { id: "testing", label: "Automated testing and CI", pattern: /\b(automated test(s|ing)?|unit test(s|ing)?|integration test(s|ing)?|tdd|test coverage|ci\/cd|ci|continuous (integration|delivery|deployment))\b/i, weight: 2, evidence: "1,380+ automated tests guard BiznizFlowPilot; GitHub Actions runs the suites for Plinth, the AI Growth Platform and client sites." },
  { id: "security", label: "Security, audit and compliance", pattern: /\b(security|secure|encryption|audit(s|ing| logs?| trails?)?|compliance|popia|gdpr|rbac|role[- ]based access|access control|authenticat(e|ion)|authori[sz]ation)\b/i, weight: 2, evidence: "Built authentication, encryption, audit logging and backups into systems holding financial data." },
  { id: "business", label: "ERP, CRM and business systems", pattern: /\b(erp|crm|hubspot|salesforce|business systems|invoicing|payroll|accounting|finance systems?)\b/i, weight: 2, evidence: "Built a live ERP covering inventory, VAT invoicing, finance and HR/payroll; integrated HubSpot, CRM and ERP platforms." },
  { id: "mobile", label: "Cross-platform mobile (Expo)", pattern: /\b(react native|expo|ios|android|mobile (apps?|applications?|development)|cross[- ]platform)\b/i, weight: 2, evidence: "Two Expo apps for iOS and Android: the Shapers Church member app (Liquid Glass, push notifications, QR tickets, kids check-in) and MiXiT (realtime chat, scored matching, offline-first data)." },
  { id: "offline", label: "Offline-first apps and PWAs", pattern: /\b(offline[- ]first|offline (mode|support|sync)|pwas?|progressive web apps?|service workers?|indexeddb)\b/i, weight: 1, evidence: "ARCHITEKT: an installable PWA that caches questions in IndexedDB and syncs offline answers idempotently; MiXiT's offline-first data layer." },
  { id: "node", label: "Node.js backends", pattern: /\b(node(\.js)?|fastify|express(\.js)?|nestjs|prisma)\b/i, weight: 2, evidence: "MiXiT's modular Fastify and Prisma API; Plinth's Node.js platform with PostgreSQL row-level security." },
  { id: "realtime", label: "Realtime messaging", pattern: /\b(websockets?|socket\.io|real[- ]?time|chat)\b/i, weight: 1, evidence: "MiXiT: Socket.io messaging with read receipts and group rooms." },
  { id: "docker", label: "Docker and containers", pattern: /\b(docker(-compose)?|containeri[sz]ed|containers)\b/i, weight: 1, evidence: "Docker Compose for local stacks on Prime Vest, Plinth and the Shapers Church platform." },
  { id: "payments", label: "Payments integration", pattern: /\b(payments?|payment gateways?|payfast|paystack|stripe)\b/i, weight: 1, evidence: "PayFast on the Zoya site and Paystack on Prime Vest." },
  { id: "fintech", label: "Fintech, lending and payroll", pattern: /\b(fintech|lending|loans?|kyc|underwriting|credit|paye|payroll|tax)\b/i, weight: 2, evidence: "LendFlow loan origination (KYC, affordability, fraud, decisioning); PaySlip Checker and an SA tax engine for PAYE and UIF." },
  { id: "cms", label: "WordPress and CMS platforms", pattern: /\b(wordpress|php|cms|drupal|shopify|aem|adobe experience manager)\b/i, weight: 1, evidence: "Custom WordPress themes, Drupal, Shopify and Adobe Experience Manager; the SEO-GEO Agent writes through the WordPress REST API." },
  { id: "ecommerce", label: "E-commerce and conversion", pattern: /\b(e-?commerce|conversion(s| rate)?|checkout|marketplace)\b/i, weight: 1, evidence: "30% more e-commerce conversions from cart-abandonment automation and a redesigned checkout; architected a multi-tenant marketplace." },
  { id: "performance", label: "Web performance and SEO", pattern: /\b(seo|core web vitals|pagespeed|lighthouse|web performance)\b/i, weight: 1, evidence: "Average Google PageSpeed score of 90+ across 10+ production client sites." },
  { id: "leadership", label: "Technical leadership and stakeholders", pattern: /\b(tech(nical)? lead(ership)?|team lead|lead(ing)? (a )?team|mentor(s|ing|ship)?|stakeholders?|client[- ]facing|consult(ant|ants|ing)|cross[- ]functional)\b/i, weight: 2, evidence: "Team lead at EQ4; embedded technical owner for consultants across 8+ business units, running 2-4 projects at once." },
];

const gaps: Gap[] = [
  { id: "native-mobile", label: "Native iOS/Android (Swift, Kotlin)", pattern: /\b(swift(ui)?|kotlin|objective-c|jetpack compose|flutter|native (ios|android|mobile))\b/i, weight: 3, note: "Mobile work shown here is cross-platform Expo, not native Swift or Kotlin." },
  { id: "java", label: "Java / JVM", pattern: /\b(java|spring( boot)?|jvm|scala)\b/i, weight: 2, note: "No Java or JVM work is shown here." },
  { id: "go", label: "Go", pattern: /\b[Gg]olang\b|^Go\b|\bGo (developer|engineer)|\b(?:in|with|using|and|or) Go\b|\bGo,|, Go\b/, weight: 2, note: "No Go work is shown here." },
  { id: "rust-cpp", label: "Rust or C++", pattern: /(\brust\b|c\+\+)/i, weight: 2, note: "No systems-language (Rust or C++) work is shown here." },
  { id: "ruby", label: "Ruby on Rails", pattern: /\b(ruby|rails)\b/i, weight: 2, note: "No Ruby or Rails work is shown here." },
  { id: "k8s", label: "Kubernetes", pattern: /\b(kubernetes|k8s|helm|eks|aks|gke)\b/i, weight: 2, note: "Kubernetes isn't shown here; the live ERP runs behind Caddy on Azure." },
  { id: "gcp", label: "Google Cloud", pattern: /\b(gcp|google cloud|bigquery|vertex ai)\b/i, weight: 1, note: "Cloud work shown is Azure, AWS and OCI, not Google Cloud." },
  { id: "data", label: "Big data and streaming", pattern: /\b(kafka|spark|databricks|snowflake|airflow|dbt|data warehous(e|ing)|data lakes?|streaming data)\b/i, weight: 2, note: "Large-scale data platforms (Kafka, Spark, warehouses) aren't shown here." },
  { id: "ml", label: "Training ML models", pattern: /\b(pytorch|tensorflow|scikit[- ]learn|model training|train(ing)? (ml |machine learning )?models|fine[- ]tun(e|es|ed|ing)|computer vision|deep learning|mlops)\b/i, weight: 2, note: "I build products on top of models; training or fine-tuning them isn't shown here." },
  { id: "frontend-other", label: "Angular, Vue or Svelte", pattern: /\b(angular|vue(\.js)?|svelte)\b/i, weight: 1, note: "Front-end work shown is React and Next.js." },
  { id: "people", label: "People management", pattern: /\b(people manag(er|ement)|direct reports|line manag(er|ement)|engineering manager|hiring and (growing|building))\b/i, weight: 2, note: "I've led teams as a technical lead; formal people management isn't shown here." },
];

const OPTIONAL = /nice[- ]to[- ]have|\bbonus\b|preferred|desirable|\ba plus\b|is a plus|advantageous|beneficial|\bideally\b/i;
const REQUIRED_HEADER = /requirement|responsibilit|must[- ]have|qualification|what you('|’)ll|about you|you have|you will|essential|skills/i;

type Sentence = { text: string; optional: boolean };

function splitSentences(text: string): Sentence[] {
  const sentences: Sentence[] = [];
  let optionalSection = false;
  for (const raw of text.split(/\n+/)) {
    const line = raw.replace(/^[\s•\-*·]+/, "").trim();
    if (!line) continue;
    const isHeader = line.length <= 50 && !/[.!?]$/.test(line) && !/,/.test(line);
    if (isHeader && OPTIONAL.test(line)) optionalSection = true;
    else if (isHeader && REQUIRED_HEADER.test(line)) optionalSection = false;
    for (const part of line.split(/(?<=[.!?;])\s+/)) {
      if (part.trim()) sentences.push({ text: part.trim(), optional: optionalSection || OPTIONAL.test(part) });
    }
  }
  return sentences;
}

// Quotes the whole requirement line; only run-on paragraphs get trimmed around the match.
function quoteAround(sentence: string, pattern: RegExp) {
  if (sentence.length <= 320) return sentence;
  const index = Math.max(0, sentence.search(pattern));
  const start = Math.max(0, index - 120);
  return `${start > 0 ? "…" : ""}${sentence.slice(start, start + 320).trim()}…`;
}

// Prefer a required sentence over an optional one, so "Python is a plus" doesn't
// downgrade a role that also lists Python as a hard requirement.
function findMention(sentences: Sentence[], pattern: RegExp) {
  const found = sentences.filter((sentence) => pattern.test(sentence.text));
  if (!found.length) return null;
  const best = found.find((sentence) => !sentence.optional) ?? found[0];
  return { quote: quoteAround(best.text, pattern), optional: best.optional };
}

function findYearsRequired(sentences: Sentence[]) {
  const pattern = /(\d{1,2})\s*\+?\s*(?:(?:-|–|to)\s*\d{1,2}\s*)?\+?\s*years?/i;
  for (const sentence of sentences) {
    const match = sentence.text.match(pattern);
    if (match) return { years: Number(match[1]), quote: quoteAround(sentence.text, pattern), optional: sentence.optional };
  }
  return null;
}

export function scoreJob(text: string): MatchResult {
  const sentences = splitSentences(text);
  const matches: Hit[] = [];
  const missing: Hit[] = [];
  const notes: string[] = [];
  let earned = 0;
  let possible = 0;

  // Whatever the job title names is the core of the role, so it counts double.
  const title = sentences[0]?.text ?? "";
  const weigh = (base: number, pattern: RegExp, optional: boolean) =>
    base * (pattern.test(title) ? 2 : 1) * (optional ? 0.5 : 1);

  for (const skill of skills) {
    const mention = findMention(sentences, skill.pattern);
    if (!mention) continue;
    const weight = weigh(skill.weight, skill.pattern, mention.optional);
    earned += weight;
    possible += weight;
    matches.push({ id: skill.id, label: skill.label, quote: mention.quote, detail: skill.evidence, optional: mention.optional });
  }

  for (const gap of gaps) {
    const mention = findMention(sentences, gap.pattern);
    if (!mention) continue;
    possible += weigh(gap.weight, gap.pattern, mention.optional);
    missing.push({ id: gap.id, label: gap.label, quote: mention.quote, detail: gap.note, optional: mention.optional });
  }

  const years = findYearsRequired(sentences);
  if (years && years.years <= YEARS_OF_EXPERIENCE) {
    earned += 2;
    possible += 2;
    matches.unshift({ id: "years", label: `${years.years}+ years of experience`, quote: years.quote, detail: `${YEARS_OF_EXPERIENCE}+ years shipping web and business systems, since 2015.`, optional: years.optional });
  } else if (years) {
    possible += 2;
    missing.unshift({ id: "years", label: `${years.years}+ years of experience`, quote: years.quote, detail: `I have ${YEARS_OF_EXPERIENCE}+ years, so this asks for more than I can show.`, optional: years.optional });
  }

  if (/\b(on[- ]?site|in[- ]office|office[- ]based|relocat(e|ion))\b/i.test(text)) {
    notes.push("The role mentions on-site work or relocation. I'm in Johannesburg and open to hybrid and client-embedded work, so location is worth a conversation.");
  } else if (/\b(remote|hybrid)\b/i.test(text)) {
    notes.push("Remote or hybrid work suits me. I already work embedded with distributed teams.");
  }
  if (/\b(bachelor'?s?|master'?s?|degree|bsc|msc|diploma)\b/i.test(text)) {
    notes.push("The role mentions formal qualifications, which this site doesn't list. Ask me for details.");
  }
  if (/\bsecurity clearance\b/i.test(text)) {
    notes.push("The role mentions security clearance, which this site doesn't cover.");
  }

  const recognised = matches.length + missing.length;
  let score = possible > 0 ? Math.round((earned / possible) * 100) : null;

  // Adjacent skills can't make up for missing the thing the role is named after,
  // or a heavyweight requirement the role lists as essential.
  const coreGap =
    gaps.find((gap) => gap.pattern.test(title)) ??
    gaps.find((gap) => gap.weight >= 3 && missing.some((hit) => hit.id === gap.id && !hit.optional));
  if (coreGap && score !== null) score = Math.min(score, 45);

  return { score, verdict: verdictFor(score, coreGap?.label), matches, gaps: missing, notes, lowConfidence: score !== null && recognised < 4 };
}

function verdictFor(score: number | null, coreGap?: string) {
  if (coreGap) return `Weak fit. The core of this role (${coreGap}) isn't something I can show evidence for, and I'd rather say so now.`;
  if (score === null) return "I couldn't find requirements I recognise. Paste the full description, including the requirements list.";
  if (score >= 80) return "Strong fit. Most of what this role asks for is backed by work I've shipped.";
  if (score >= 55) return "Partial fit. A solid core, with gaps worth talking through.";
  return "Weak fit. This role leans on skills I can't show evidence for, and I'd rather say so now.";
}

export const sampleJobs = [
  {
    label: "AI engineer",
    text: `Senior AI Engineer
About the role
We're a growing SaaS company building AI agents that automate back-office work for small and medium businesses: invoicing, reconciliations and customer follow-ups. You'll join a team of six engineers and own the agent platform end to end.
What you'll do
- Design and ship LLM-powered features that act on real customer data.
- Build the guardrails around them: permission checks, human-in-the-loop approval for risky actions, and audit trails.
- Own background processing for long-running agent tasks.
- Work with product and customer success to turn messy workflows into reliable automation.
What you'll need
- 5+ years of software engineering experience, including production work in Python and FastAPI.
- Solid PostgreSQL skills, including data modelling for a multi-tenant product.
- Experience with event-driven architecture and background workers such as Celery and Redis.
- A track record of shipping AI features that real users depend on.
Nice to have
- Azure or AWS experience.
- Kubernetes.
Location
Remote or hybrid within South Africa.`,
  },
  {
    label: "Solutions architect",
    text: `Solutions Architect, Financial Services
About the role
A financial services group with several business units is consolidating how it automates client work. You will own the technical design of integration and automation projects, working closely with business stakeholders and the CTO.
Responsibilities
- Produce solution designs and architecture decision records for each initiative before build starts.
- Integrate existing CRM and ERP platforms, including HubSpot, rather than replacing them.
- Guide delivery teams through implementation and review their work against the design.
- Make sure systems that hold client financial data meet security and compliance requirements.
Requirements
- 8+ years in software, including at least 3 in an architecture role.
- Strong .NET and Azure experience, with infrastructure as code in Terraform.
- Security and compliance experience (POPIA), including audit logging and encryption.
- Comfortable presenting trade-offs to non-technical stakeholders.
- Bachelor's degree in Computer Science or similar.
Location
Hybrid, Johannesburg (three days a week in the office).`,
  },
  {
    label: "Mobile lead",
    text: `Senior Mobile Engineer
About the role
Our consumer fintech app has 400,000 monthly users. We're looking for a senior engineer to lead development of our native iOS and Android apps.
What you'll do
- Lead a squad of four mobile engineers.
- Own app architecture, release quality and performance on both platforms.
- Work with product stakeholders on the roadmap.
Requirements
- 6+ years building mobile apps with Swift and Kotlin.
- CI/CD for mobile releases and automated testing.
- Experience publishing to the App Store and Google Play.
Nice to have
- Experience with React Native.
Location
On-site in Cape Town.`,
  },
];

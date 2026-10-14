import PortfolioClient from "@/components/PortfolioClient";

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Lehakoe Thinane",
  jobTitle: "Systems Designer & Architect",
  url: "https://leonard-thinane.vercel.app",
  description:
    "Systems designer, architect and AI engineer with ten years of shipping web and business systems, focused on AI that stays inside controlled boundaries.",
  email: "mailto:lehakoe.thinane@gmail.com",
  address: { "@type": "PostalAddress", addressLocality: "Johannesburg", addressCountry: "ZA" },
  sameAs: ["https://github.com/LehakoeThinane", "https://linkedin.com/in/lehakoe-stanley-thinane-38b854188"],
  knowsAbout: [
    "Systems architecture",
    "AI engineering",
    "LLM guardrails",
    "Multi-tenant SaaS",
    "Event-driven architecture",
    "ERP systems",
    "Business automation",
    "FastAPI",
    ".NET",
    "PostgreSQL",
    "Next.js",
    "Azure",
    "AWS",
  ],
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd).replace(/</g, "\\u003c") }}
      />
      <PortfolioClient />
    </>
  );
}

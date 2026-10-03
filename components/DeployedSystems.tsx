import { BarChart3, Bot, CheckCircle2, PanelsTopLeft } from "lucide-react";

const systems = [
  {
    icon: PanelsTopLeft,
    name: "BiznizFlowPilot",
    status: "live - app.mmnexus.co.za",
    description:
      "Multi-tenant ERP for South African SMEs: inventory, sales, VAT invoicing, finance, HR/payroll, workflows, and an AI assistant.",
    boundary:
      "Every query is tenant-scoped, and a CI guard fails builds on queries outside the repository layer.",
    tags: ["FastAPI", "PostgreSQL", "Celery", "Next.js", "Azure"],
  },
  {
    icon: Bot,
    name: "AI Growth Platform",
    status: "MVP",
    description: "Agent runtime for growth planning and incident triage.",
    boundary:
      "One validated tool call per step. Write permission comes from the operator, never the model.",
    tags: [".NET 10", "EF Core", "OpenAI function calling"],
  },
  {
    icon: BarChart3,
    name: "SEO-GEO Agent",
    status: "MVP",
    description: "Crawls a site, finds SEO issues, and applies approved fixes to WordPress.",
    boundary:
      "Rules decide what is safe to apply. The LLM only improves wording.",
    tags: ["FastAPI", "WordPress REST API", "OpenAI", "Groq", "Ollama"],
  },
];

export default function DeployedSystems() {
  return (
    <section id="systems" className="space-y-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div className="max-w-2xl space-y-3">
          <p className="font-mono text-sm uppercase tracking-[0.18em] text-[#10B981]">
            Deployed systems
          </p>
          <h2 className="text-3xl font-bold text-white">Built for repeatable operating rhythm</h2>
        </div>
        <div className="inline-flex w-fit items-center gap-2 rounded-md border border-[#1F2937] bg-[#050505] px-3 py-2 font-mono text-sm text-gray-400">
          <CheckCircle2 size={16} className="text-[#10B981]" />
          production-minded
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {systems.map((system) => {
          const Icon = system.icon;

          return (
            <article
              key={system.name}
              className="flex min-h-[260px] flex-col rounded-lg border border-[#1F2937] bg-[#050505] p-5"
            >
              <div className="mb-5 flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-md border border-[#06B6D4]/30 bg-[#06B6D4]/10 text-[#06B6D4]">
                  <Icon size={20} />
                </div>
                <span className="font-mono text-xs uppercase tracking-[0.18em] text-gray-600">
                  active
                </span>
              </div>

              <h3 className="text-lg font-semibold text-white">{system.name}</h3>
              <p className="mt-1 font-mono text-xs uppercase tracking-[0.16em] text-[#10B981]">
                {system.status}
              </p>
              <p className="mt-3 leading-7 text-gray-400">{system.description}</p>
              <p className="mt-4 flex-1 border-t border-[#1F2937] pt-4 text-sm leading-6 text-gray-500">
                <span className="text-gray-300">Boundary:</span> {system.boundary}
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                {system.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md border border-[#1F2937] px-2 py-1 font-mono text-xs text-gray-500"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

import { ChevronDown } from "lucide-react";

const navItems = [
  { label: "Architecture", href: "#topology" },
  { label: "Live demo", href: "#demo" },
  { label: "Components", href: "#systems" },
  { label: "Decisions", href: "#decisions" },
  { label: "Interactive CV", href: "#cv" },
];

export default function SystemHeader() {
  return (
    <header className="relative z-20">
      <div className="mx-auto mb-6 flex max-w-[62rem] items-center gap-2 px-1 pt-4 text-sm text-slate-300">
        <span>Lehakoe Thinane - Systems Designer & Architect</span>
        <ChevronDown size={14} className="text-slate-500" />
      </div>

      <div className="mx-auto flex max-w-[62rem] items-center justify-between rounded-2xl border border-[#274363] bg-[#0b233d]/90 px-3 py-2 shadow-[0_20px_70px_rgba(0,0,0,0.35)] backdrop-blur">
        <a
          href="#contact"
          className="flex items-center gap-2 rounded-xl px-2 py-3 font-mono text-sm font-semibold text-slate-300"
        >
          <span className="grid h-6 w-6 place-items-center rounded-full bg-[#1d3947]">
            <span className="h-2.5 w-2.5 rounded-full bg-[#2fc483]" />
          </span>
          Available for new roles
        </a>

        <nav className="hidden items-center gap-6 text-sm font-mono text-gray-400 md:flex">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="transition-colors hover:text-[#10B981]"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <a
          href="mailto:lehakoe.thinane@gmail.com?subject=CV%20request"
          className="rounded-2xl bg-[#ff8248] px-6 py-4 text-sm font-bold text-[#1f1008] shadow-[0_10px_30px_rgba(255,130,72,0.2)] transition-colors hover:bg-[#ff9a68]"
        >
          Request CV
        </a>
      </div>
    </header>
  );
}

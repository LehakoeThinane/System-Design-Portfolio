"use client";

import { useEffect, useRef, useState } from "react";
import { sampleJobs, scoreJob, type Hit, type MatchResult } from "@/lib/cvMatcher";

const EMAIL = "lehakoe.thinane@gmail.com";

function summarize(result: MatchResult) {
  return [
    `Requirement coverage: ${result.score ?? "n/a"}%`,
    result.verdict,
    "",
    `Backed by evidence: ${result.matches.map((hit) => hit.label).join(", ") || "none"}`,
    `Gaps: ${result.gaps.map((hit) => hit.label).join(", ") || "none found"}`,
  ].join("\n");
}

function mailtoFor(result: MatchResult, jobText: string) {
  const job = jobText.length > 1500 ? `${jobText.slice(0, 1500)}…` : jobText;
  const body = `Hi Lehakoe,\n\nI ran our role through your matcher.\n\n${summarize(result)}\n\nThe role:\n${job}\n`;
  return `mailto:${EMAIL}?subject=${encodeURIComponent("Role match from your portfolio")}&body=${encodeURIComponent(body)}`;
}

export default function CvMatcher() {
  const [jobText, setJobText] = useState("");
  const [activeSample, setActiveSample] = useState<string | null>(null);
  const [result, setResult] = useState<MatchResult | null>(null);
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Grow the box with its content so a pasted description is never hidden behind a scrollbar.
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.max(textarea.scrollHeight, 280)}px`;
  }, [jobText]);

  function runMatch(text: string) {
    setResult(scoreJob(text));
    setCopied(false);
  }

  function trySample(label: string, text: string) {
    setActiveSample(label);
    setJobText(text);
    runMatch(text);
  }

  async function copySummary() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(summarize(result));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  const hasScore = result !== null && result.score !== null;

  return (
    <div className="no-print grid items-start gap-5 lg:grid-cols-2">
      <div className="card p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <label htmlFor="job" className="eyebrow">Job description</label>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-[var(--dim)]">Try a sample</span>
            {sampleJobs.map((sample) => (
              <button
                key={sample.label}
                type="button"
                aria-pressed={activeSample === sample.label}
                className={`focus-ring rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${
                  activeSample === sample.label
                    ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--text)]"
                    : "border-[var(--border-strong)] text-[var(--muted)] hover:text-[var(--text)]"
                }`}
                onClick={() => trySample(sample.label, sample.text)}
              >
                {sample.label}
              </button>
            ))}
          </div>
        </div>
        <textarea
          ref={textareaRef}
          id="job"
          rows={10}
          className="focus-ring mt-4 block w-full resize-none overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--bg)] p-4 text-sm leading-6 text-[var(--text)] placeholder:text-[var(--dim)]"
          placeholder="Paste the full job description, including the requirements and nice-to-have lists."
          value={jobText}
          onChange={(event) => {
            setJobText(event.target.value);
            setActiveSample(null);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter" && (event.ctrlKey || event.metaKey) && jobText.trim()) runMatch(jobText);
          }}
        />
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
          <button type="button" disabled={!jobText.trim()} className="btn-primary focus-ring" onClick={() => runMatch(jobText)}>
            Match me
          </button>
          <span className="text-xs text-[var(--dim)]">Ctrl + Enter · runs in your browser, nothing is sent anywhere</span>
        </div>
      </div>

      <div className="card p-5 sm:p-6 lg:sticky lg:top-24" aria-live="polite">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="eyebrow">Requirement coverage</p>
          {hasScore ? (
            <p className="text-xs text-[var(--dim)]">
              {result.matches.length} of {result.matches.length + result.gaps.length} recognised requirements backed by evidence
            </p>
          ) : null}
        </div>
        <div className="mt-4 flex items-end gap-4">
          <p className="text-5xl font-semibold tracking-tight tabular-nums text-[var(--text)]">{hasScore ? `${result.score}%` : "—"}</p>
        </div>
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[var(--surface-strong)]">
          <div className="h-full rounded-full bg-[var(--accent)] transition-[width] duration-700" style={{ width: `${hasScore ? result.score : 0}%` }} />
        </div>
        <p className="mt-4 text-[15px] leading-7 text-[var(--text)]">
          {result ? result.verdict : "Pick a sample or paste a role. You'll see which requirements I can back with work I've shipped, which I can't, and the line in the job description each one came from."}
        </p>
        {result?.lowConfidence ? (
          <p className="mt-2 text-xs leading-5 text-[var(--dim)]">Only a few requirements were recognised, so treat this score as rough.</p>
        ) : null}

        {hasScore ? (
          <div className="mt-6 grid gap-6">
            <HitList title="Evidence" hits={result.matches} tone="match" empty="Nothing in this role matched work shown here." />
            <HitList title="Honest gaps" hits={result.gaps} tone="gap" empty="No gaps recognised. Ask me about anything this matcher can't read." />
            {result.notes.length ? (
              <div>
                <p className="eyebrow">Worth knowing</p>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-[var(--muted)]">
                  {result.notes.map((note) => <li key={note}>{note}</li>)}
                </ul>
              </div>
            ) : null}
            <div className="flex flex-wrap gap-3 border-t border-[var(--border)] pt-5">
              <a className="btn-primary focus-ring" href={mailtoFor(result, jobText)}>Email me this match</a>
              <button type="button" className="btn-secondary focus-ring" onClick={copySummary}>
                {copied ? "Copied ✓" : "Copy summary"}
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function HitList({ title, hits, tone, empty }: { title: string; hits: Hit[]; tone: "match" | "gap"; empty: string }) {
  return (
    <div>
      <p className="eyebrow">
        {title} <span className="text-[var(--dim)]">· {hits.length}</span>
      </p>
      {hits.length ? (
        <ul className="mt-3 divide-y divide-[var(--border)] border-y border-[var(--border)]">
          {hits.map((hit) => (
            <li key={hit.id} className="grid gap-1.5 py-4">
              <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-[var(--text)]">
                <span aria-hidden="true" className={tone === "match" ? "text-[var(--green)]" : "text-[var(--red)]"}>{tone === "match" ? "✓" : "✕"}</span>
                {hit.label}
                {hit.optional ? <span className="rounded border border-[var(--border-strong)] px-1.5 py-0.5 text-[0.68rem] font-medium text-[var(--dim)]">nice to have</span> : null}
              </p>
              <p className="border-l-2 border-[var(--border-strong)] pl-3 text-[13px] leading-6 text-[var(--dim)] italic">{hit.quote}</p>
              <p className="text-sm leading-6 text-[var(--muted)]">{hit.detail}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-[var(--muted)]">{empty}</p>
      )}
    </div>
  );
}

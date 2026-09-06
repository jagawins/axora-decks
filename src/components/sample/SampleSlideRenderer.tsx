import type { SampleSlideBody } from "@/data/sample-decks";

interface Props {
  body: SampleSlideBody;
  accent: string;
  /** Compact mode tightens type for the hero panel */
  compact?: boolean;
}

const SEVERITY_LABEL: Record<string, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

export default function SampleSlideRenderer({ body, accent, compact }: Props) {
  const pad = compact ? "p-5 sm:p-6" : "p-6 sm:p-9";
  const h = compact
    ? "text-base sm:text-lg font-semibold tracking-tight"
    : "text-lg sm:text-2xl font-semibold tracking-tight";
  const label = "text-[11px] font-semibold uppercase tracking-[0.18em]";
  const bodyText = compact ? "text-[13px] leading-relaxed" : "text-sm sm:text-[15px] leading-relaxed";

  switch (body.kind) {
    case "cover":
      return (
        <div className={`h-full flex flex-col justify-center ${pad}`}>
          <span className={`${label} mb-4`} style={{ color: accent }}>
            {body.badge}
          </span>
          <h3 className={`${compact ? "text-xl sm:text-2xl" : "text-2xl sm:text-4xl"} font-semibold tracking-tight text-white`}>
            {body.headline}
          </h3>
          <p className="mt-2 text-sm text-white/55">{body.subline}</p>
          <ul className="mt-6 space-y-1.5 border-t border-white/10 pt-4">
            {body.meta.map((m) => (
              <li key={m} className="text-[13px] text-white/60">
                {m}
              </li>
            ))}
          </ul>
        </div>
      );

    case "recommendation":
      return (
        <div className={`h-full flex flex-col ${pad}`}>
          <span className={`${label} mb-3`} style={{ color: accent }}>
            Recommendation
          </span>
          <h3 className={`${h} text-white`}>{body.headline}</h3>
          <p className={`${bodyText} mt-3 text-white/75`}>{body.recommendation}</p>
          <ul className="mt-4 space-y-2 flex-1">
            {body.rationale.map((r) => (
              <li key={r} className="flex gap-2.5">
                <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: accent }} />
                <span className="text-[13px] leading-relaxed text-white/65">{r}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 border-t border-white/10 pt-3 text-[12px] text-white/50">{body.decision}</p>
        </div>
      );

    case "evidence":
      return (
        <div className={`h-full flex flex-col ${pad}`}>
          <span className={`${label} mb-3`} style={{ color: accent }}>
            Evidence
          </span>
          <h3 className={`${h} text-white mb-4`}>{body.headline}</h3>
          <div className="flex-1 divide-y divide-white/10">
            {body.rows.map((row) => (
              <div key={row.label} className="flex items-baseline justify-between gap-4 py-2.5">
                <span className="text-[13px] text-white/55">{row.label}</span>
                <span className="text-right">
                  <span className="block text-sm font-semibold tabular-nums" style={{ color: accent }}>
                    {row.value}
                  </span>
                  <span className="block text-[11px] text-white/40">{row.note}</span>
                </span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[11px] italic text-white/35">{body.footnote}</p>
        </div>
      );

    case "metrics":
      return (
        <div className={`h-full flex flex-col ${pad}`}>
          <span className={`${label} mb-4`} style={{ color: accent }}>
            Results
          </span>
          <h3 className={`${h} text-white mb-4`}>{body.headline}</h3>
          <div className="grid flex-1 grid-cols-2 gap-3 content-center">
            {body.stats.map((s) => (
              <div key={s.label} className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-3">
                <div className="text-lg font-semibold tabular-nums sm:text-xl" style={{ color: accent }}>
                  {s.value}
                </div>
                <div className="mt-0.5 text-[11px] text-white/45">{s.label}</div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[11px] italic text-white/35">{body.footnote}</p>
        </div>
      );

    case "risks":
      return (
        <div className={`h-full flex flex-col ${pad}`}>
          <span className={`${label} mb-3`} style={{ color: accent }}>
            Risks
          </span>
          <h3 className={`${h} text-white mb-4`}>{body.headline}</h3>
          <div className="flex-1 space-y-2.5">
            {body.risks.map((r) => (
              <div key={r.risk} className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-[13px] font-medium text-white/80">{r.risk}</p>
                  <span
                    className="shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
                    style={{ color: accent, borderColor: `${accent}55` }}
                  >
                    {SEVERITY_LABEL[r.severity]}
                  </span>
                </div>
                <p className="mt-1 text-[12px] text-white/50">{r.mitigation}</p>
              </div>
            ))}
          </div>
        </div>
      );

    case "next_steps":
      return (
        <div className={`h-full flex flex-col ${pad}`}>
          <span className={`${label} mb-3`} style={{ color: accent }}>
            Next steps
          </span>
          <h3 className={`${h} text-white mb-4`}>{body.headline}</h3>
          <ol className="flex-1 space-y-3">
            {body.steps.map((s, i) => (
              <li key={s.action} className="flex gap-3">
                <span
                  className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold"
                  style={{ background: `${accent}22`, color: accent }}
                >
                  {i + 1}
                </span>
                <span>
                  <span className="block text-[13px] text-white/80">{s.action}</span>
                  <span className="block text-[11px] text-white/45">
                    {s.owner} · {s.when}
                  </span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      );
  }
}

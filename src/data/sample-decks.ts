/**
 * Shared illustrative sample decks.
 *
 * IMPORTANT: every company, number and quote below is FICTIONAL and exists only
 * to demonstrate deck structure. Nothing here describes a real AXIVA customer,
 * real performance, or real market data. All surfaces that render this data must
 * label it as illustrative sample content.
 *
 * This module is the single source of truth for the homepage hero panel,
 * the landing "examples" section and the /demo sample explorer, so the three
 * stay consistent.
 */

export type SampleSlideBody =
  | {
      kind: "cover";
      headline: string;
      subline: string;
      badge: string;
      meta: string[];
    }
  | {
      kind: "recommendation";
      headline: string;
      recommendation: string;
      rationale: string[];
      decision: string;
    }
  | {
      kind: "evidence";
      headline: string;
      rows: { label: string; value: string; note: string }[];
      footnote: string;
    }
  | {
      kind: "metrics";
      headline: string;
      stats: { value: string; label: string }[];
      footnote: string;
    }
  | {
      kind: "risks";
      headline: string;
      risks: { risk: string; mitigation: string; severity: "high" | "medium" | "low" }[];
    }
  | {
      kind: "next_steps";
      headline: string;
      steps: { action: string; owner: string; when: string }[];
    };

export interface SampleSlide {
  id: string;
  /** Short label used in slide selectors */
  label: string;
  body: SampleSlideBody;
  /** Illustrative speaker note */
  speakerNote: string;
  /** Illustrative anticipated questions */
  questions: { question: string; answer: string }[];
}

export interface SampleDeck {
  id: string;
  title: string;
  /** Fictional organisation name */
  organisation: string;
  audience: string;
  deckType: string;
  /** Short one-line description of the decision at stake */
  premise: string;
  accent: string;
  surface: string;
  slides: SampleSlide[];
}

export const SAMPLE_DECKS: SampleDeck[] = [
  {
    id: "board-update",
    title: "Q4 board update",
    organisation: "Northwind Systems (fictional)",
    audience: "Board of directors",
    deckType: "Board update",
    premise: "Approve the FY26 operating plan and the shift of spend into enterprise.",
    accent: "#3b82f6",
    surface: "#0b1628",
    slides: [
      {
        id: "cover",
        label: "Cover",
        body: {
          kind: "cover",
          headline: "Q4 board update",
          subline: "Northwind Systems · FY26 operating plan",
          badge: "Illustrative sample · board update",
          meta: ["Prepared for: Board of directors", "Decision required: FY26 plan approval", "Reading time: 9 minutes"],
        },
        speakerNote:
          "Set the frame in two sentences: the quarter landed ahead of plan, and the decision today is where FY26 spend goes. Do not walk the numbers yet.",
        questions: [
          {
            question: "What exactly are you asking the board to approve?",
            answer: "One thing: the FY26 operating plan, including the move of 4 points of spend from mid-market to enterprise.",
          },
        ],
      },
      {
        id: "recommendation",
        label: "Recommendation",
        body: {
          kind: "recommendation",
          headline: "Move four points of spend into enterprise for FY26",
          recommendation:
            "Approve the FY26 plan with enterprise as the primary growth motion and mid-market held flat.",
          rationale: [
            "Enterprise deals closed at 2.1x the contract value of mid-market this year",
            "Mid-market payback stretched from 14 to 19 months",
            "Enterprise pipeline already covers 61% of the FY26 target",
          ],
          decision: "Decision requested: approve, approve with a staged release, or defer to the February meeting.",
        },
        speakerNote:
          "Lead with the recommendation, not the analysis. Then give the three reasons and stop talking. The board will choose the path.",
        questions: [
          {
            question: "Why not fund both motions?",
            answer: "Funding both keeps enterprise hiring below the coverage we need to hit the FY26 number. The plan is a choice, not a cut.",
          },
          {
            question: "What happens to mid-market?",
            answer: "Held flat, not stopped. Self-serve continues to carry it, and we revisit in Q3 if payback improves.",
          },
        ],
      },
      {
        id: "evidence",
        label: "Evidence",
        body: {
          kind: "evidence",
          headline: "What the quarter actually showed",
          rows: [
            { label: "Revenue", value: "$34.2M", note: "7% ahead of the internal plan" },
            { label: "Enterprise ACV", value: "$118K", note: "Up from $56K a year earlier" },
            { label: "Mid-market payback", value: "19 months", note: "Was 14 months at the start of the year" },
            { label: "Net retention", value: "108%", note: "Enterprise cohort at 121%" },
          ],
          footnote: "Illustrative figures for a fictional company. Not AXIVA performance data.",
        },
        speakerNote:
          "Four rows only. If a director pulls on one number, go deeper verbally rather than adding slides.",
        questions: [
          {
            question: "Is the payback shift seasonal?",
            answer: "It held across three quarters, so we are treating it as structural until proven otherwise.",
          },
        ],
      },
      {
        id: "risks",
        label: "Risks",
        body: {
          kind: "risks",
          headline: "What could break this plan",
          risks: [
            {
              risk: "Enterprise hiring slips past Q1",
              mitigation: "Two offers already signed; recruiter capacity doubled for January",
              severity: "high",
            },
            {
              risk: "Mid-market churn accelerates once spend is flat",
              mitigation: "Retention play funded separately, reviewed monthly",
              severity: "medium",
            },
            {
              risk: "Security review lengthens enterprise cycles",
              mitigation: "Compliance pack completed ahead of the plan start",
              severity: "low",
            },
          ],
        },
        speakerNote:
          "Name the hiring risk before anyone else does. Credibility comes from raising the weakest link yourself.",
        questions: [
          {
            question: "What is the trigger to reverse the plan?",
            answer: "Two consecutive quarters of enterprise coverage below 1.8x. That is written into the plan.",
          },
        ],
      },
      {
        id: "next-steps",
        label: "Next steps",
        body: {
          kind: "next_steps",
          headline: "If approved today",
          steps: [
            { action: "Release FY26 hiring plan for enterprise", owner: "CRO", when: "Within one week" },
            { action: "Publish revised mid-market targets", owner: "VP Growth", when: "By month end" },
            { action: "Report first coverage checkpoint", owner: "CFO", when: "February board meeting" },
          ],
        },
        speakerNote:
          "Close on ownership and dates. A board update that ends without named owners gets relitigated next quarter.",
        questions: [
          {
            question: "When do we see evidence this is working?",
            answer: "First coverage checkpoint in February, full read by the end of Q2.",
          },
        ],
      },
    ],
  },
  {
    id: "investor-pitch",
    title: "Series A investor pitch",
    organisation: "MediFlow (fictional)",
    audience: "Series A investors",
    deckType: "Investor pitch",
    premise: "Raise a $15M round against a clinical documentation problem.",
    accent: "#38bdf8",
    surface: "#0a1a2b",
    slides: [
      {
        id: "cover",
        label: "Cover",
        body: {
          kind: "cover",
          headline: "MediFlow",
          subline: "Clinical documentation, automated end to end",
          badge: "Illustrative sample · investor pitch",
          meta: ["Round: Series A", "Raising: $15M", "Use of funds: sales, product, compliance"],
        },
        speakerNote: "Say the company, the category and the ask in the first fifteen seconds.",
        questions: [
          { question: "How much and at what stage?", answer: "$15M Series A, following a $3.5M seed." },
        ],
      },
      {
        id: "recommendation",
        label: "The ask",
        body: {
          kind: "recommendation",
          headline: "Fund the clinical rollout, not the experiment",
          recommendation: "Invest $15M to take a proven single-specialty product into three new specialties.",
          rationale: [
            "The product is live in 127 fictional clinics with a 94% renewal rate",
            "Each new specialty reuses 80% of the existing model work",
            "Sales cycle has compressed from 141 days to 88 days",
          ],
          decision: "Decision requested: lead the round, join the round, or pass with feedback.",
        },
        speakerNote: "Investors fund a next step, not a vision. Be explicit that this money buys expansion, not discovery.",
        questions: [
          { question: "What is the round buying that the seed did not?", answer: "Distribution. The clinical model already works in one specialty." },
        ],
      },
      {
        id: "metrics",
        label: "Traction",
        body: {
          kind: "metrics",
          headline: "Traction to date",
          stats: [
            { value: "$2.4M", label: "Annual recurring revenue" },
            { value: "127", label: "Clinics live" },
            { value: "94%", label: "Renewal rate" },
            { value: "88 days", label: "Average sales cycle" },
          ],
          footnote: "Fictional figures for demonstration. Not a real company.",
        },
        speakerNote: "Four numbers, then silence. Let them ask which one they distrust.",
        questions: [
          { question: "How concentrated is revenue?", answer: "Top five accounts are 22% of ARR, down from 41% last year." },
        ],
      },
      {
        id: "evidence",
        label: "Evidence",
        body: {
          kind: "evidence",
          headline: "Why clinics keep it",
          rows: [
            { label: "Documentation time", value: "-38%", note: "Measured across 24 pilot clinics" },
            { label: "Note accuracy", value: "97.1%", note: "Reviewed by clinical staff sample" },
            { label: "Prior authorisation", value: "2 hours", note: "Previously 11 days on average" },
            { label: "Expansion revenue", value: "31%", note: "Share of new ARR from existing clinics" },
          ],
          footnote: "Illustrative sample content.",
        },
        speakerNote: "Retention is the argument here. Growth without retention reads as churn deferred.",
        questions: [
          { question: "Who validated the accuracy figure?", answer: "Clinical leads at the pilot sites, on a sampled review, not a published study." },
        ],
      },
      {
        id: "risks",
        label: "Risks",
        body: {
          kind: "risks",
          headline: "The three things that could go wrong",
          risks: [
            { risk: "Specialty expansion takes longer than modelled", mitigation: "Two specialties already in design partnership", severity: "high" },
            { risk: "Incumbent EHR bundles a competing feature", mitigation: "Integration-first strategy keeps us inside their workflow", severity: "medium" },
            { risk: "Regulatory review of AI documentation tightens", mitigation: "Audit trail and human sign-off shipped by default", severity: "medium" },
          ],
        },
        speakerNote: "Naming the incumbent risk yourself is stronger than being asked about it.",
        questions: [
          { question: "What if the EHR shuts you out?", answer: "We sell the outcome, not the integration, and we keep a direct capture path." },
        ],
      },
      {
        id: "next-steps",
        label: "Next steps",
        body: {
          kind: "next_steps",
          headline: "Process from here",
          steps: [
            { action: "Share data room and clinical references", owner: "CEO", when: "This week" },
            { action: "Technical and security deep dive", owner: "CTO", when: "Week two" },
            { action: "Target close", owner: "CEO and lead investor", when: "Six weeks" },
          ],
        },
        speakerNote: "End with a process, not a plea. A defined timeline creates its own pressure.",
        questions: [
          { question: "Is there a lead already?", answer: "Two firms in diligence; we are running a defined six-week process." },
        ],
      },
    ],
  },
  {
    id: "strategy-review",
    title: "Strategy review",
    organisation: "CloudSync (fictional)",
    audience: "Executive committee",
    deckType: "Strategy review",
    premise: "Choose between two go-to-market motions for the next four quarters.",
    accent: "#818cf8",
    surface: "#0f172a",
    slides: [
      {
        id: "cover",
        label: "Cover",
        body: {
          kind: "cover",
          headline: "Where we compete next",
          subline: "CloudSync · four-quarter strategy review",
          badge: "Illustrative sample · strategy review",
          meta: ["Prepared for: Executive committee", "Decision required: pick one motion", "Owner: Chief Strategy Officer"],
        },
        speakerNote: "State that this is a choosing meeting, not an informing meeting.",
        questions: [{ question: "Is this decided already?", answer: "No. There is a recommendation and a real alternative." }],
      },
      {
        id: "recommendation",
        label: "Recommendation",
        body: {
          kind: "recommendation",
          headline: "Lead with the regulated verticals",
          recommendation: "Concentrate the next four quarters on healthcare and financial services rather than broad mid-market.",
          rationale: [
            "Win rate in regulated accounts is 34% against 19% elsewhere",
            "Compliance work is already paid for and is a barrier for smaller rivals",
            "Average contract value is roughly double the general market",
          ],
          decision: "Decision requested: commit to regulated verticals, or hold the broad motion for two more quarters.",
        },
        speakerNote: "The alternative must be stated fairly or the room will not trust the recommendation.",
        questions: [
          { question: "Does this shrink the market?", answer: "It narrows the target list and raises the conversion rate. Modelled revenue is higher, not lower." },
        ],
      },
      {
        id: "evidence",
        label: "Evidence",
        body: {
          kind: "evidence",
          headline: "What the pipeline data says",
          rows: [
            { label: "Regulated win rate", value: "34%", note: "Against 19% in the general market" },
            { label: "Average contract value", value: "$96K", note: "General market $48K" },
            { label: "Sales cycle", value: "104 days", note: "Longer, but more predictable" },
            { label: "Reference willingness", value: "72%", note: "Of regulated customers agree to reference" },
          ],
          footnote: "Fictional data for illustration only.",
        },
        speakerNote: "Concede the longer cycle openly. It is the honest cost of the recommendation.",
        questions: [
          { question: "Can we absorb a longer cycle?", answer: "Yes, with the current cash runway, and the predictability improves forecasting." },
        ],
      },
      {
        id: "risks",
        label: "Risks",
        body: {
          kind: "risks",
          headline: "What we are accepting",
          risks: [
            { risk: "Concentration in two verticals", mitigation: "Neither vertical exceeds 45% of pipeline under the plan", severity: "medium" },
            { risk: "Longer cycles delay revenue recognition", mitigation: "Quarterly staged targets rather than annual", severity: "medium" },
            { risk: "Team lacks regulated-sector experience", mitigation: "Two senior hires and a partner channel", severity: "high" },
          ],
        },
        speakerNote: "The hiring risk is the real one. Everything else is manageable.",
        questions: [{ question: "What if the hires fall through?", answer: "The partner channel carries the first two quarters." }],
      },
      {
        id: "next-steps",
        label: "Next steps",
        body: {
          kind: "next_steps",
          headline: "First thirty days",
          steps: [
            { action: "Re-cut the target account list", owner: "Revenue operations", when: "Two weeks" },
            { action: "Confirm two senior hires", owner: "Chief Revenue Officer", when: "Thirty days" },
            { action: "Set quarterly staged targets", owner: "Finance", when: "Thirty days" },
          ],
        },
        speakerNote: "Three actions, three owners. Anything more and nothing gets done.",
        questions: [{ question: "Who owns the whole decision?", answer: "The Chief Strategy Officer, reporting monthly." }],
      },
    ],
  },
  {
    id: "quarterly-review",
    title: "Quarterly programme review",
    organisation: "City Innovation Lab (fictional)",
    audience: "Programme steering group",
    deckType: "Quarterly review",
    premise: "Decide whether to extend the digital services programme for another year.",
    accent: "#34d399",
    surface: "#0a1a12",
    slides: [
      {
        id: "cover",
        label: "Cover",
        body: {
          kind: "cover",
          headline: "Digital services: quarter one review",
          subline: "City Innovation Lab · programme steering group",
          badge: "Illustrative sample · quarterly review",
          meta: ["Prepared for: Steering group", "Decision required: extend or close", "Period: Quarter one"],
        },
        speakerNote: "Open with the decision on the table so the review has a purpose.",
        questions: [{ question: "Is closure a real option?", answer: "Yes. The evidence supports extension, but closure is costed." }],
      },
      {
        id: "recommendation",
        label: "Recommendation",
        body: {
          kind: "recommendation",
          headline: "Extend the programme for four more quarters",
          recommendation: "Extend with a narrowed scope: permits, inspections and payments only.",
          rationale: [
            "Permit processing fell from 21 days to 7 days",
            "The three narrowed services account for 84% of measured benefit",
            "Two remaining workstreams have not produced measurable change",
          ],
          decision: "Decision requested: extend narrowed, extend in full, or close at quarter two.",
        },
        speakerNote: "Recommending a narrower version of your own programme buys credibility for the rest.",
        questions: [{ question: "Why drop two workstreams?", answer: "They have no measurable benefit after two quarters, so they do not earn the funding." }],
      },
      {
        id: "metrics",
        label: "Results",
        body: {
          kind: "metrics",
          headline: "Measured outcomes this quarter",
          stats: [
            { value: "7 days", label: "Permit processing (was 21)" },
            { value: "89%", label: "Enquiries resolved without staff" },
            { value: "4.2/5", label: "Resident satisfaction" },
            { value: "$2.1M", label: "Avoided cost" },
          ],
          footnote: "Illustrative figures for a fictional public body.",
        },
        speakerNote: "Give the baseline with every improvement, or the numbers mean nothing.",
        questions: [{ question: "How is avoided cost calculated?", answer: "Staff hours removed at loaded cost, excluding one-off implementation." }],
      },
      {
        id: "risks",
        label: "Risks",
        body: {
          kind: "risks",
          headline: "Open risks",
          risks: [
            { risk: "Legacy finance system migration is behind", mitigation: "Phased cut-over agreed with the vendor", severity: "high" },
            { risk: "Security audit outstanding", mitigation: "Scheduled before the extension starts", severity: "medium" },
            { risk: "Year-two funding not confirmed", mitigation: "Narrowed scope reduces the requirement by 31%", severity: "medium" },
          ],
        },
        speakerNote: "The funding risk is the reason for the narrowed scope. Connect the two explicitly.",
        questions: [{ question: "What if funding is refused?", answer: "The narrowed scope can run on existing budget for two quarters." }],
      },
      {
        id: "next-steps",
        label: "Next steps",
        body: {
          kind: "next_steps",
          headline: "Actions on approval",
          steps: [
            { action: "Confirm narrowed scope with service owners", owner: "Programme director", when: "Two weeks" },
            { action: "Close two workstreams and reassign staff", owner: "Operations lead", when: "One month" },
            { action: "Complete security audit", owner: "Chief information officer", when: "Before quarter two" },
          ],
        },
        speakerNote: "Say who tells the two closing teams, and when. That detail is what makes it real.",
        questions: [{ question: "What happens to the staff?", answer: "Reassigned to the three continuing services, no reduction planned." }],
      },
    ],
  },
];

export const SAMPLE_DECK_IDS = SAMPLE_DECKS.map((d) => d.id);

/** Resolve a deck id from an untrusted query parameter. Falls back to the first deck. */
export function resolveSampleDeck(raw: string | null | undefined): SampleDeck {
  if (typeof raw === "string") {
    const match = SAMPLE_DECKS.find((d) => d.id === raw.trim().toLowerCase());
    if (match) return match;
  }
  return SAMPLE_DECKS[0];
}

export function getSampleDeck(id: string): SampleDeck | undefined {
  return SAMPLE_DECKS.find((d) => d.id === id);
}

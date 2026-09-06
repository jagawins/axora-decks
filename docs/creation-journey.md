# Creation journey — click ledger

Purpose: count the deliberate in-app activations (button/link taps) between a
person's intent and a usable deck. This is a **code-inspected** ledger of the
current implementation, not an end-to-end measurement. Text entry and any
provider / authentication / billing steps are listed separately, because they are
not app clicks and their real cost depends on the provider.

"<= 10 clicks" is a design target only. It stays a target until the flow is
measured end to end with real accounts.

## A. Signed-in person, homepage brief

| # | Activation | Where |
|---|------------|-------|
| 1 | Focus/type into the homepage brief field (text entry, see note) | `Hero.tsx` |
| 1 | Primary hero action → `/create` (brief carried in the draft) | `Hero.tsx` |
| 2 | **Generate deck** | `Create.tsx` |
| 3 | **Edit & export** (opens the editor) | `Preview.tsx` |

**App clicks to a usable deck in review: 2** (hero action + Generate).
Third click opens the editor. Configuration presets, Customize and
"More ways to create" are optional and add 1 click each when used.

## B. New guest, homepage brief

| # | Activation | Where |
|---|------------|-------|
| 1 | Primary hero action → `/create` | `Hero.tsx` |
| 2 | **Continue — set up a free account** (brief saved in this tab) | `Create.tsx` |
| — | Account setup: provider button or email + password + confirmation (auth steps, not app clicks) | `Auth.tsx` |
| 3 | **Generate deck** — the restored brief needs only this one deliberate action | `Create.tsx` |
| 4 | **Edit & export** | `Preview.tsx` |

**App clicks: 3** to a generated deck, 4 including opening the editor, plus the
authentication steps. Generation never runs automatically on an auth callback,
a reload or back navigation.

## C. Pro export (PowerPoint / PDF)

| # | Activation | Where |
|---|------------|-------|
| 1 | **Edit & export** from Preview | `Preview.tsx` |
| 2 | Export menu | `ExportMenu.tsx` (in the editor) |
| 3 | Chosen format (PPTX / PDF) | `ExportMenu.tsx` |
| — | If the account is on the free plan, the existing upgrade gate opens; checkout is a billing step handled by the payment provider, not counted here | `UpgradeGateModal.tsx` |

**App clicks from Preview to an export request: 3.** The paid gate is unchanged
and is not bypassed; there is no second exporter.

## Notes

- Text entry (typing or pasting the brief) is deliberately not counted as a click.
- Authentication and billing steps happen on provider surfaces and vary; they are
  listed but not counted.
- Free plan, derived from `src/lib/subscription.ts`: 10 projects and 10 AI
  generations per month. PowerPoint and PDF export require Pro.

# Creation journey — click ledger

Purpose: count the deliberate in-app activations (button/link taps) between a
person's intent and a usable deck. This is a **code-inspected** ledger of the
current implementation, not an end-to-end measurement with real accounts,
real generation or real payments.

Counting rules used here:

- App actions = button/link activations inside AXIVA, **including** the app's own
  authentication buttons and form submit (`src/pages/Auth.tsx`).
- Outside the app = provider-hosted screens only (Google/Apple/Microsoft consent),
  the email confirmation click in the person's mailbox, the browser's own
  print/save dialog, and the payment provider's checkout.
- Text entry and field focus are listed but never counted as activations.
- "<= 10 actions" is a design target only. It stays a target until the whole flow
  is measured end to end with real accounts, so nothing here claims it is verified.

## A. Signed-in person, homepage brief → deck in review

| # | Activation | Where (code) |
|---|------------|--------------|
| — | Focus and type the brief (text entry, not counted) | `Hero.tsx` |
| 1 | Primary hero action → `/create` (brief stored in the draft) | `Hero.tsx` (`navigate("/create")`) |
| 2 | **Generate deck** → `/preview/:id` | `Create.tsx` |

**App activations to a generated deck in review: 2.** Configuration presets,
Customize and "More ways to create" are optional and add 1 activation each when
used. Generation never runs automatically on mount, reload, back navigation or an
auth callback.

## B. New guest, homepage brief

| # | Activation | Where (code) |
|---|------------|--------------|
| — | Focus and type the brief (text entry, not counted) | `Hero.tsx` |
| 1 | Primary hero action → `/auth?mode=signup&next=%2Fcreate` | `Hero.tsx` |
| 2 | Choose an authentication method (e.g. **Continue with Google**, or focus the email/password fields — provider button counts, typing does not) | `Auth.tsx` |
| 3 | **Create account** submit (email/password route only; the provider route replaces this step with the provider's own screens) | `Auth.tsx` |
| 4 | **Generate deck** on the restored brief | `Create.tsx` |

**App activations: 3–4** depending on the method chosen (provider route: hero +
provider button + Generate = 3; email route: hero + method focus/submit +
Generate = 4).

Variable steps **outside** the app, not counted and not verified here:

- provider consent screens (account chooser, permission grant),
- email confirmation: opening the mailbox and clicking the confirmation link,
- any additional verification the provider requires.

Onboarding, when the account needs it, adds its own activations.

## C. Pro export (PowerPoint / PDF), from Preview

| # | Activation | Where (code) |
|---|------------|--------------|
| 1 | **Edit & export** → `/editor/:id` | `Preview.tsx` (labelled control, available on mobile and desktop) |
| 2 | **Export** menu in the editor header (present at both breakpoints) | `ExportMenu.tsx`, mounted in `Editor.tsx` |
| 3 | Chosen format — **Export as PDF** or **Export as PowerPoint** | `ExportMenu.tsx` → `exportPdf` / `exportPptx` in `Editor.tsx` |

**App activations from Preview to an export request: 3.**

Beyond those three:

- **PDF**: `exportPdf` opens the existing `/print/:id` route synchronously from the
  click. The browser's own print/save dialog then needs at least one more action
  from the person (choose "Save as PDF", then Save). That dialog is not ours and is
  not counted.
- **PowerPoint**: `exportPptx` builds the file and downloads it; the browser may add
  a save prompt depending on its settings.
- **Free accounts**: both formats open the existing upgrade gate instead. Buying Pro
  is handled on the payment provider's checkout and adds an unknown number of steps.
  The paid gate is unchanged and is not bypassed, and there is no second exporter.

## Notes

- Free plan, derived from `src/lib/subscription.ts`: 10 projects and 10 AI
  generations per month. PowerPoint and PDF export require Pro.
- The Create page shows this as general plan information; it does not assume the
  signed-in person is on the free plan.
- No end-to-end timing or total-click figure in this document has been measured
  with a real session, real database writes or a real purchase.

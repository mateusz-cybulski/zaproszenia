# Reporting

The severity ladder and format for a standalone review. `better-interface` replaces both when it orchestrates.

**Severity.** `HIGH` prevents a task, hides content from assistive technology or creates a systemic failure. `MEDIUM` makes an interaction meaningfully harder. `LOW` is isolated polish. This domain's share of `better-interface`'s escalation triggers is `HIGH` on sight. That is a missing accessible name, a missing focus indicator and a pointer path with no keyboard path. It is also motion ignoring reduced motion, loss at 320px or 200% and meaning carried by color alone.

**Format.** Group findings under the principle each violates, ordered by severity, one row per root cause listing every location it appears in:

| Severity | Location | Before | After | Why |
| --- | --- | --- | --- | --- |

`Location` is `path/to/file:line`. `Why` names the WCAG criterion or principle and the user impact.

End with `Block` when any `HIGH` remains, `Approve` otherwise, leaving the rest in the table as work to do. Never `Approve` coverage you did not inspect. With nothing to report, state "No actionable accessibility findings" and report verification.

## Known automated-scanner false positives

Radix (and shadcn/ui) modals trip rule engines in ways that are not barriers. Confirm once with a Tab cycle that focus stays inside the open dialog and every item shows a focus ring, then do not report:

- `aria-hidden-focus` on the page behind an open modal, and on Radix's focus guards (`span[data-radix-focus-guard]`): the page is hidden from assistive tech and focus is trapped in the dialog.
- `landmarks/region` on the dialog itself (`role="dialog"` portalled outside `<main>`).
- `focus-visible` on a `ToggleGroup` or other roving-tabindex root: focus moves straight to an item, which carries the ring.


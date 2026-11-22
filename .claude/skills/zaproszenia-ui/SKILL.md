---
name: zaproszenia-ui
description: "Use when building or changing a dialog or a page layout in this project's frontend (src/frontend): every dialog's pinned header and scrolling DialogBody, DialogTitleBar with the edited name (DialogNameField) for guests, events and templates, focus return from dialogs opened by a link (useReturnFocus), and the project's accessibility scope: desktop only, checked at 200% zoom, no 320 px reflow. Project-specific; the general rules are in nextjs-best-practices, tailwind-best-practices and better-accessibility."
license: MIT
metadata:
  version: "1.1.0"
---

# UI conventions of this project

What the general skills cannot know about this frontend: its own dialog components and decisions taken for this product. Synced skills (`mise run agents`) are replaced on every sync, so project-only rules live here.

## 1. Dialog layout

Every dialog (`@/shared/ui/dialog`) has a header and a body, so the header and the close button never scroll away:

```tsx
<DialogContent className="max-w-2xl">
  <DialogHeader>
    <DialogTitle>…</DialogTitle>
    <DialogDescription>…</DialogDescription>
  </DialogHeader>
  <DialogBody>{/* form, list, buttons */}</DialogBody>
</DialogContent>
```

- `DialogContent` does not scroll; the header stays at the top with a line under it; **only `DialogBody` scrolls**. Never put content straight into `DialogContent` or give it its own padding or `overflow`.
- Something that must stay in view while a long body scrolls (the template editor's page preview) is `sticky top-0` inside `DialogBody`.
- **Focus returns to what opened the dialog** (`better-accessibility`). A dialog that is a route (opened by a `Link`, closed with `useDismiss`) has no `DialogTrigger`, so it gets `onCloseAutoFocus={useReturnFocus()}` from `@/shared/lib/dialogs`.

### Dialogs that edit something with a name

**A dialog that edits something with a name** (a guest, an event, a template) has no title or description. Its header is `DialogTitleBar`, with the name itself in the middle:

```tsx
<DialogContent className="max-w-2xl" aria-describedby={undefined}>
  <DialogTitleBar
    start={/* switches and status: section switch, verification badge, page picker */}
    end={/* the main action: <FormStatus /> and the submit button */}
  >
    <DialogNameField label="Nazwa wydarzenia" title={event?.name ?? "Nowe wydarzenie"} form={form.id} … />
  </DialogTitleBar>
  <DialogBody>…</DialogBody>
</DialogContent>
```

- `DialogNameField` (`@/shared/ui/dialog-name-field`) is the name input, centred, with a screen-reader-only `DialogTitle` (`title`) and its error under it. `aria-describedby={undefined}` on `DialogContent` says there is no description.
- The name and the submit button sit outside the `<form>`: they join it with `form={form.id}`. So the dialog owns the form state: a `use<Thing>Form` hook in the slice's `model` wraps `useServerForm`, the dialog calls it and passes it to the form component, which renders only the body fields.
- Variants (the event's Szczegóły / Szablony / Goście) switch in `start`, not under the header. Switching scrolls the body back to the top (a ref on `DialogBody`). The form that owns the name stays mounted (hidden) in every variant.
- The side columns are equal so the name stays centred; when the dialog is too narrow (200% zoom) they keep their content and the name narrows, up to 18rem wide otherwise. If `start` or `end` still does not fit, shorten the labels (the action's label does not repeat the name: "Utwórz", not "Utwórz wydarzenie").
- Secondary actions of the record (the event's "Zaproszenia" and "Koperty") go in `end` before the main action, as outline buttons with an icon; below `lg` only the icon shows (`max-lg:sr-only` on the label, a tooltip with the full name), so the name keeps its room at 200% zoom. Pick icons that tell the actions apart.
- Lists and cards open a record with "Otwórz" (the dialog does more than edit).
- Other dialogs (confirmations, the trash, uploads) keep `DialogHeader` with a title and a description.

## 2. Accessibility scope

Writing follows `better-accessibility`, checking uses the AccessLint skills (`accessibility-scan`, `-inspect`, `-audit`, `-fix`, `-diff`). For this product:

- **Desktop only.** Check zoom at 200% on a 1440 px screen, i.e. a 720 px wide viewport (WCAG 1.4.4): no sideways page scroll, nothing covered, every title visible. The Tailwind recipes are in `tailwind-best-practices` section 4.
- **Reflow at 320 px (1.4.10) is out of scope** by the product's decision and documented in the user instructions and the case study: do not report or fix it, although `better-accessibility` asks for it.

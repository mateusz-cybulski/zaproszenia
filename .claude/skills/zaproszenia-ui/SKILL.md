---
name: zaproszenia-ui
description: "Use when building or changing a dialog or a page layout in this project's frontend (src/frontend): every dialog's pinned header and scrolling DialogBody, DialogTitleBar with the edited name (DialogNameField) for guests, events and templates, focus return from dialogs opened by a link (useReturnFocus), loading skeletons, the unsaved-changes guard, one save per dialog, the date and time picker, list rows that open their record (TableRowLink) and selecting many guests with a bulk-action toolbar, the shared helpers by their names here (useServerForm, FormField, useAction, ConfirmActionDialog, Pagination, TableRowLink), the project's accessibility scope: desktop only, checked at 200% zoom, no 320 px reflow, and keeping the user guide (/instruction, /instruction/pl) and its screenshots in step with the UI. Project-specific; the general rules are in nextjs-best-practices, tailwind-best-practices and better-accessibility."
license: MIT
metadata:
  version: "1.8.0"
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
- **Focus returns to what opened the dialog** (`better-accessibility`). A dialog that is a route (opened by a `Link`, closed with `useDismiss`) has no `DialogTrigger`, so it gets `onCloseAutoFocus={useReturnFocus()}` from `@/shared/lib/dialogs`. The opener is the last focus outside any dialog, recorded by `DialogOpenerTracker` in the root layout (`@/_app/layout`); never capture it when the dialog mounts.

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
- Secondary actions of the record go in `end` before the main action, grouped in **one** outline dropdown with an icon (the event's "Do druku" with "Zaproszenia (PDF)" and "Koperty (PDF)"), not a button each; below `lg` the trigger shows only its icon (`max-lg:sr-only` on the label, a tooltip), so the name keeps its room at 200% zoom. Radix opens a menu on pointer down, so a busy menu stays closed through a controlled `open`, not through `aria-disabled`.
- Lists and cards open a record with "Otwórz" (the dialog does more than edit).
- Other dialogs (confirmations, the trash, uploads) keep `DialogHeader` with a title and a description.

## 2. Accessibility scope

Writing follows `better-accessibility`, checking uses the AccessLint skills (`accessibility-scan`, `-inspect`, `-audit`, `-fix`, `-diff`). For this product:

- **Desktop only.** Check zoom at 200% on a 1440 px screen, i.e. a 720 px wide viewport (WCAG 1.4.4): no sideways page scroll, nothing covered, every title visible. The Tailwind recipes are in `tailwind-best-practices` section 4.
- **Reflow at 320 px (1.4.10) is out of scope** by the product's decision and documented in the user instructions and the case study: do not report or fix it, although `better-accessibility` asks for it.

## 3. Loading, leaving and dates

- **Loading** (the general rules are in `nextjs-best-practices`, Loading states). The kit has `Skeleton`, `Spinner` (`decorative` next to text such as "Zapisywanie…" and inside a badge or control that has its own label; never a raw `LoaderCircle` with `animate-spin`; sized with `h-4 w-4` so small buttons and badges can shrink it like their icons; a `Button` that runs an operation takes `pending` and its `icon` as props instead: it swaps the icon for the spinner and sets `aria-disabled`, so call sites never write their own `pending ? <Spinner /> : <Icon />`), `TableSkeleton`, `CardGridSkeleton`, `DialogSkeleton` (`header="title-bar"` or `"header"`, at the dialog's width) and `PagePreview` for a rendered page (box with the page's proportions, skeleton until loaded). Each `_pages` slice keeps its page title and description in `config/page-copy.ts`, shared by the page and its skeleton, and exports its loading components from `ui/<slice>-loading-routes.tsx`; `app/**/loading.tsx` only re-exports them.
- **Leaving a form**: every form dialog closes through `useDiscardGuard(dirty, dismiss)` and renders `DiscardChangesDialog` (`@/shared/lib/dialogs`, `@/shared/ui/discard-changes-dialog`); a page form calls `useUnsavedChangesWarning(form.dirty)`. When the form state lives in the dialog's content (the event dialog), the content renders the `Dialog` itself.
- **One "Zapisz" per dialog**: the event dialog's details and template choice are one form (`EventSections` wraps both sections; `EventDetailsFields` and `TemplateChoiceFields` render fields only), saved by `updateEventAction` in one `PUT /events/{id}`; the template selects stay mounted, their previews load when the section opens. A section never has its own save button. "Zapisz" in the event dialog keeps the dialog open and says "Zapisano." in the header (`FormStatus` with a success message); the form's baseline moves to the saved values in `useServerForm`, so closing after a save does not ask about unsaved changes.
- **Dates and times are picked, never typed**: a field with `inputType: "datetime-local"` renders `DateTimeInput` (the kit's `DateTimePicker`: a calendar and hour/minute lists, the whole field opens it).

## 4. Lists

- **A row opens its record through one real link.** The name in the first text column is `TableRowLink` (`@/shared/ui/table-row-link`), whose click area covers the row; the row gets `ROW_WITH_LINK` (focus on the link outlines the whole row) and every cell with its own controls (checkbox, menu, delete) gets `ABOVE_ROW_LINK`. Never `onClick` or `role="link"` on a `<tr>`, and no separate "Otwórz" button. `GuestTable` and `EventTable` take `hrefFor`.
- **Selecting many rows**: the guest list keeps the selection in `GuestSelectionProvider` above the table, so it survives paging and searching. The header checkbox ("select the page") shows only its own choice, never a state computed from single rows; it starts unticked on each page (`key` from the page's ids). Bulk actions sit in an always visible toolbar (`role="toolbar"`) above the table, so the layout does not jump and dialogs return focus to their trigger; with nothing selected its buttons are `aria-disabled`, except verification, which then covers every guest not yet verified. Selections are checked again in the Server Action (`isGuestSelection`, at most 1000 ids, as the API).

## 5. Shared helpers by their names here

`nextjs-best-practices` describes these as patterns; this is what they are called in this frontend.

| Pattern | Here |
|---|---|
| One shared form hook | `useServerForm({ schema, action, defaultValue, onSuccess })` from `@/shared/lib/server-form` |
| Field and status components | `FormField` (`@/shared/ui/form-field`, config with `required`, `hint`, `inputType: "datetime-local"`, `options`), `FormStatus` (`@/shared/ui/form-status`) |
| Action result and action hook | `ActionResult` (`@/shared/lib/actions`), `useAction(action, { onSuccess })` (`@/shared/lib/action-call`) |
| Row that opens its record | `TableRowLink`, `ROW_WITH_LINK`, `ABOVE_ROW_LINK` (`@/shared/ui/table-row-link`) |
| Confirm dialog | `ConfirmActionDialog` (`@/shared/ui/confirm-action-dialog`); soft or permanent delete: `DeleteChoiceDialog` |
| Paged lists | `parsePage()` (`@/shared/lib/pagination`), `pageSchema(itemSchema)` and `Page<Item>` (`@/shared/api`), `Pagination` (`@/shared/ui/pagination`, "51–100 z 137"), `withQuery(path, params)` (`@/shared/routes`); dialog page parameters `deleted_page`, `guests_page` |
| Branded ids | `recordIdSchema` / `recordIdParamSchema` (`@/shared/lib/record-id`), e.g. `GuestId`, `isGuestId`, `parseGuestId` |
| A button that waits | `Button` with `pending` and `icon` |

UI copy is Polish. The labels the shared rules name in English are, here: "Zapisz", "Zapisz i …" / "… bez zapisywania" / "Wróć" (before generating), "Wróć do edycji" / "Wyjdź bez zapisywania" (leaving a form), "Ładowanie" (spinner).

## 6. User guide

The public guide at `/instruction` (English) and `/instruction/pl` (Polish) describes every screen, with screenshots (`_pages/instruction`).

- **A change the user sees updates the guide in the same branch**: a new feature, a renamed label, a moved button or a new warning changes the text of both languages and retakes the screenshots that show it. A change that does not reach the screen (a refactor, an API detail) leaves the guide alone.
- Both languages are data with the same section ids and screenshots: `config/content-english.ts` and `config/content-polish.ts`. Labels of the app are marked `**…**`. The app is Polish only, so the English text gives the Polish label in bold with its meaning in parentheses where it first appears.
- Screenshots are retaken with `npm run screenshots:instruction` in `src/frontend` (`scripts/instruction-screenshots/README.md`): a separate Compose project with sample data, never the user's local database. Look through them before committing; they are committed with the UI change.

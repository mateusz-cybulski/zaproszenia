---
name: nextjs-best-practices
description: "Use when writing, changing or reviewing Next.js code in this repo: pages, layouts, components, route handlers, server actions (and calling them from buttons and dialogs with useAction and ConfirmActionDialog), dialog layout (pinned header, title bar with the edited name, switches and main action, scrolling body), proxy.ts, next.config, data fetching and caching, images, metadata, env vars. Next.js 16 App Router rules for components built from a Next template (e.g. src/frontend), deployed as a standalone container on Cloud Run, which must pass the component's ESLint and tsc lefthook checks."
license: MIT
metadata:
  version: "1.13.0"
  next: "16"
---

# Next.js best practices (Next 16, App Router)

The rules below assume a component like `src/frontend`: Next 16, React 19, TypeScript, `output: "standalone"`, deployed to Cloud Run by Terraform. Check the component's `package.json` first. If its Next major is not 16, verify each API below against the docs for that version (https://nextjs.org/docs, index at https://nextjs.org/docs/llms.txt) before using it.

## 1. Server and Client Components

- Every component is a Server Component unless it needs the browser: state, effects, event handlers, browser APIs, context providers.
- Put `"use client"` on the smallest interactive leaf, not on a page or layout. A client component imports only client code; pass server-rendered parts in as `children`.
- Props crossing into a client component must be serializable: no functions (except Server Actions), class instances or `Date` objects you rely on as `Date`.
- Never read secrets in client components. Only `NEXT_PUBLIC_*` variables reach the browser. Guard server-only modules with `import "server-only"`.

```tsx
// app/products/page.tsx (server)
export default async function Page() {
  const products = await getProducts();
  return <ProductList products={products} filter={<FilterBar />} />;
}
// app/products/filter-bar.tsx
"use client";
export function FilterBar() { /* useState, onChange ... */ }
```

- Separate a multi-line hook call from the statements around it with a blank line: `useEffect`, `useLayoutEffect` and any other hook whose callback spans several lines. An effect is a separate step of the component, not part of the declarations above it.

```tsx
const succeed = useEffectEvent(() => onSuccess?.());

useEffect(() => {
  if (lastResult?.status === "success") {
    succeed();
  }
}, [lastResult]);

return { form, fields };
```

## 2. Data fetching and caching

- Fetch in Server Components (`async` pages, layouts, components), not in `useEffect`. Call your own data functions directly; do not `fetch` your own Route Handlers from the server.
- Start independent requests together: `const [a, b] = await Promise.all([getA(), getB()])`.
- Stream slow parts: wrap them in `<Suspense fallback={...}>` or add `loading.tsx` to the route segment.
- Dynamic code runs at request time by default. Caching is opt-in through Cache Components: enable `cacheComponents: true` in `next.config.ts`, then mark cached functions/components with `"use cache"`, set lifetime with `cacheLife(...)` and tags with `cacheTag(...)`.
- Invalidation:
  - `updateTag(tag)` in a Server Action when the user must see their own write immediately,
  - `revalidateTag(tag, "max")` for stale-while-revalidate (the one-argument form is deprecated),
  - `revalidatePath(path)` for a whole route,
  - `refresh()` in a Server Action to re-render uncached data only.
- `cookies()`, `headers()`, `draftMode()`, `params` and `searchParams` are async. Always `await` them.

## 3. Mutations and APIs

- Use Server Actions (`"use server"`) for forms and mutations from your own UI. Use `<form action={action}>`, `useActionState` for results and errors, `useFormStatus` for pending state.
- Use Route Handlers (`app/**/route.ts`) for external callers: webhooks, other services, public APIs.
- A Server Action is a public endpoint. Validate input on the server (e.g. with a schema) and check authorization inside every action.
- An id argument is typed with the entity's branded id (`id: GuestId`) so our own callers cannot pass the wrong one, **and** checked in the first line (`if (!isGuestId(id)) return { error: … }`), because a caller outside our code can send anything. The check is the boundary: keep it even though the type already says `GuestId`.
- After a mutation, invalidate with the APIs from section 2 or `redirect()`. Do not rely on client-side refetching.

### Forms with fields (Conform)

Forms are Conform (`@conform-to/react`, `@conform-to/zod/v4`) on top of `useActionState`, through `useServerForm({ schema, action, defaultValue, onSuccess })` from `@/shared/lib/server-form`. One zod schema validates in the browser and again in the action.

```ts
// the action
const submission = parseWithZod(formData, { schema: guestFormSchema });
if (submission.status !== "success") return submission.reply();
const result = await createGuest(submission.value);
if (!result.ok) return submission.reply({ formErrors: [FAILURE_MESSAGES[result.reason]] });
revalidatePath(routes.guests(), "layout");
return submission.reply();
```

- **Validate on submit, re-validate on input** (`shouldValidate: "onSubmit"`, `shouldRevalidate: "onInput"`). Not on blur: pressing a dialog's close button blurs the field, the error grows the vertically centred dialog and moves the button before the click lands, so the dialog needs a second click.
- **Reply to success with a plain `submission.reply()`.** `reply({ resetForm: true })` returns only `{ initialValue: null }`, without `status: "success"`, so `onSuccess` (closing the dialog) never runs. A form that closes on success needs no reset; one that stays on screen resets on the client in `onSuccess` (`form.reset()` or a new `key`).
- **A form that stays on screen keeps what was saved.** React 19 resets a `<form action>` after the action, back to the values it rendered with, so a settings form would show empty or stale fields after a successful save. `useServerForm` returns `formProps` that submit from `onSubmit` (Conform validates, then the action runs in `startTransition`), which React does not reset; `action` stays for a browser without JavaScript. Spread `formProps` on the form, never `action={formAction}` alone.
- Fields render through `FormField` with Conform's field metadata; `FormStatus` announces the form error or success message.

### Calling actions from buttons and dialogs

Forms with fields use `<form action>` + `useActionState` (above). Everything else that calls a Server Action from a click (delete, restore, copy, confirm) goes through **one shared hook and one shared dialog**, never a hand-written `useTransition` + `useState` pair per component:

- Every such action returns `ActionResult` = `{ error?: string }` (in this repo: `@/shared/lib/actions`): a message the user can read, or nothing on success. Failures are returned, not thrown.
- `useAction(action, { onSuccess })` (`@/shared/lib/action-call`) returns `{ run, pending, error, setError }`: `run(...args)` clears the error, runs the action in a transition, then shows `error` or calls `onSuccess`.

```tsx
const copy = useAction(() => copyTemplateAction(template.id));
<Button onClick={() => copy.run()} disabled={copy.pending}>{copy.pending ? "Kopiowanie…" : "Kopiuj"}</Button>
<p role="alert" className="empty:hidden">{copy.error}</p>
```

- "Open, confirm, run; success closes, an error stays in the dialog" is `ConfirmActionDialog` (`@/shared/ui/confirm-action-dialog`): `trigger`, `title`, `description`, `confirmLabel`/`pendingLabel`, `action`, `tone`, optional `children` and `confirmDisabled` (e.g. "type DELETE to confirm"). Several choices in one dialog (soft or permanent delete) build on `useAction` the same way (`DeleteChoiceDialog`).
- Shared buttons stay presentational: they take `pending` and an `onX` callback, and the component that owns the action holds the `useAction`. Two actions in one row are two hooks; show `first.error ?? second.error`.
- Client hooks live in their own `shared/lib` topic (`action-call`, `server-form`), never in an index that `"use server"` files import: a Server Action module must not pull a `"use client"` module through a shared barrel.
- A raw `startTransition` is fine only where no `ActionResult` comes back: router navigation (search as you type), or client SDK flows such as sign-in.

### Dialog layout

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
- Other dialogs (confirmations, the trash, uploads) keep `DialogHeader` with a title and a description.

### Paged lists

- The page is in the URL (`/guests?page=2&q=kow`), read on the server with `parsePage()` (`@/shared/lib/pagination`; anything odd is page 1), and fetched by the entity's list function, which parses the API's envelope with `pageSchema(itemSchema)` (`@/shared/api`) into `Page<Item>`.
- `Pagination` (`@/shared/ui/pagination`) renders "51–100 z 137", previous and next, and `1 … 4 5 6 … 12`, as links from `hrefForPage(page)`; build them with `withQuery(path, params)` (`@/shared/routes`), leaving page 1 and empty values out. A page past the end says it is empty and links back.
- **A dialog over a list has its own page parameter** (`deleted_page`, `guests_page`), so the list behind keeps its page when the dialog is opened by URL.
- Changing the search starts again at page 1 (the search URL carries only `q`).
- A picker inside a dialog searches on the server and appends with "Show more"; "add all matching" calls an API endpoint with the same search instead of collecting ids in the browser.

## 4. Routing files

- Segment files: `layout.tsx`, `page.tsx`, `loading.tsx`, `error.tsx` (must be `"use client"`), `not-found.tsx`, `global-error.tsx`, `route.ts`.
- Use route groups `(name)` to share layouts without changing URLs; private folders `_name` for colocated non-route code.
- Parallel route slots need an explicit `default.tsx`, or the build fails.
- Metadata: export `metadata: Metadata` or `generateMetadata()` from layouts/pages. Never hand-write `<head>` tags. `app/robots.ts`, `app/sitemap.ts` and `opengraph-image.tsx` generate those files.
- Request interception lives in `proxy.ts` (exported function `proxy`), which replaces the deprecated `middleware.ts`. Keep it thin: redirects, rewrites, header checks.
- Typed props: `PageProps<"/blog/[slug]">`, `LayoutProps<"/blog">` and `RouteContext<"/api/items/[id]">` are global helpers generated by Next. They exist only after `next dev`, `next build` or `next typegen`; the lefthook `tsc --noEmit` check runs without them, so run `npx next typegen` first if you use them, or type `params` explicitly as `Promise<{ slug: string }>`.

## 5. Assets and performance

- Images: `next/image` with `width`/`height` or `fill` + `sizes`. For the LCP image use `preload` (or `loading="eager"` / `fetchPriority="high"`); `priority` is deprecated in Next 16. Remote images need `images.remotePatterns`; local images with query strings need `images.localPatterns`.
- Fonts: `next/font` (self-hosted, no layout shift). Links: `next/link`. Third-party scripts: `next/script` with a `strategy`.
- Keep client bundles small: avoid heavy libraries in `"use client"` files, load heavy widgets with `next/dynamic`.
- `next/image` optimization runs inside the container on Cloud Run; keep `images.qualities` minimal (default `[75]`).

## 6. Config and env in this repo

- Keep `output: "standalone"` in `next.config.ts`. The production `Dockerfile` copies `.next/standalone`, `.next/static` and `public`, then runs `node server.js` on `PORT=8080`.
- Terraform injects every service's URL into every service as `<NAME>_URL` (e.g. `API_URL`, `FRONTEND_URL`, see `.config/terraform/services.tf`). These are runtime env vars on Cloud Run:
  - read them only in server code,
  - read them in code that runs per request (e.g. after `await connection()` from `next/server`, or inside a Server Action / Route Handler). In a statically prerendered page `process.env.API_URL` is read at build time, when it is not set.
- `NEXT_PUBLIC_*` values are inlined at build time. They cannot come from Cloud Run runtime env. Pass runtime values to the client as props from a Server Component instead.
- `serverRuntimeConfig` and `publicRuntimeConfig` are removed in Next 16. Use env vars.
- Locally, `docker compose up --watch` runs `Dockerfile.dev` (`next dev`); Compose Watch syncs the source into the container and rebuilds on `package.json`/`package-lock.json` changes (see `platform`). `WATCHPACK_POLLING` is not needed: Turbopack does not read it. After moving or renaming files Turbopack can keep serving the old module ("Module not found" or an old component); `docker restart <project>-frontend-1` fixes it without rebuilding the image. Put local-only env in the component's `compose.yml`, not in code.

## 7. TypeScript and lint

- Code must pass the component's lefthook checks (`src/<name>/lefthook.yml`), which `.github/workflows/checks.yml` runs again over the whole project on every push (see `platform`): `eslint --max-warnings=0` (`eslint-config-next` core-web-vitals + typescript) and a whole-project `tsc --noEmit`. Run them before finishing: `cd src/<name> && npx --no-install eslint --max-warnings=0 . && npx --no-install tsc --noEmit`.
- `next lint` no longer exists; `next build` does not lint. Use ESLint directly.
- `tsconfig.json` has `strict` and `noUncheckedIndexedAccess`: `items[0]` and `record[key]` are `T | undefined`, so a missing element is handled, not assumed away. Destructured array items (`const [first] = items`) too.
- **Typed lint rules.** `tsc` accepts code that these catch, so `eslint.config.mjs` turns them on with typed linting (below): `no-floating-promises`, `no-misused-promises` and `await-thenable` (a promise nobody waits for, an `async` function where a plain one is expected), the `no-unsafe-*` family (an `any` flowing on unchecked; type a JSON body as `unknown` and parse it), `no-unnecessary-condition` (a check the types say can never fail, i.e. dead code or a type that lies), `switch-exhaustiveness-check` (a `default` counts), and `no-deprecated`. Fix the finding; do not disable the rule on the line. A Server Action that redirects returns `Promise<Result | undefined>`, since the caller receives undefined after the redirect.
- **No deprecated APIs.** `@typescript-eslint/no-deprecated` makes a deprecated type or function fail the lint instead of only showing struck through:

```js
{
  files: ["**/*.{ts,tsx}"],
  languageOptions: { parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname } },
  rules: { "@typescript-eslint/no-deprecated": "error", "@typescript-eslint/no-floating-promises": "error", /* ... */ },
}
```

  Use the replacement the deprecation names. In React 19.2+ types, for example, `FormEvent` is deprecated: an `onSubmit` handler takes `SubmitEvent<HTMLFormElement>` (its `nativeEvent.submitter` is typed), an `onChange` handler `ChangeEvent`. When unsure of a type's current name, read it in `node_modules/@types/react/index.d.ts` rather than writing it from memory.
- No `any`. Type exported `metadata` as `Metadata`. Prefer `import type` for type-only imports.
- `typescript` is aliased to TS 6 for typescript-eslint; `@typescript/native` is TS 7. Do not "fix" the aliases in `package.json`.

## 8. Accessibility

For UI changes, check them with the `accessibility-scan` skill and fix findings with `accessibility-fix`. Use semantic HTML (`<main>`, `<nav>`, `<button>`), set `lang` on `<html>`, give every `next/image` a meaningful `alt` (empty `alt=""` only for decorative images).

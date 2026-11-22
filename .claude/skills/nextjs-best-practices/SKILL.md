---
name: nextjs-best-practices
description: "Use when writing, changing or reviewing Next.js code in this repo: pages, layouts, components, route handlers, server actions (forms through one shared Conform hook, and calls from buttons and dialogs through one shared action hook and confirm dialog), proxy.ts, next.config, data fetching and caching, images, metadata, env vars. Next.js 16 App Router rules for components built from a Next template (e.g. src/frontend), deployed as a standalone container on Cloud Run, which must pass the component's ESLint and tsc lefthook checks."
license: MIT
metadata:
  version: "1.17.0"
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
- An id argument is typed with the entity's branded id (`id: CustomerId`) so our own callers cannot pass the wrong one, **and** checked in the first line (`if (!isCustomerId(id)) return { error: … }`), because a caller outside our code can send anything. The check is the boundary: keep it even though the type already says `CustomerId`.
- After a mutation, invalidate with the APIs from section 2 or `redirect()`. Do not rely on client-side refetching.
- **A new field from another service is optional at first.** The frontend and the API deploy independently, so the new frontend may meet the old API: parse the field with a default (`item_count: z.int().nonnegative().default(0)`, `.optional()` where no default makes sense) and make it required in a later change, after the API has shipped it. Check the parse with the old response before the pull request (`api-structure`, Changing a response).
- A Route Handler that takes a body bounds it **before** reading it: reject a `Content-Length` over the limit with 413, then read through a counting reader that stops at the limit. `await request.text()` / `request.json()` first and checking the length afterwards has already buffered whatever the caller sent.

### Forms with fields (Conform)

Forms are Conform (`@conform-to/react`, `@conform-to/zod/v4`) on top of `useActionState`. Wrap the two in **one shared form hook** in `shared/lib` (e.g. `useServerForm({ schema, action, defaultValue, onSuccess })` returning `{ form, fields, formProps, pending, lastResult }`), so every form behaves the same. One zod schema validates in the browser and again in the action.

```ts
// the action
const submission = parseWithZod(formData, { schema: orderFormSchema });
if (submission.status !== "success") return submission.reply();
const result = await createOrder(submission.value);
if (!result.ok) return submission.reply({ formErrors: [FAILURE_MESSAGES[result.reason]] });
revalidatePath(routes.orders(), "layout");
return submission.reply();
```

- **Validate on submit, re-validate on input** (`shouldValidate: "onSubmit"`, `shouldRevalidate: "onInput"`). Not on blur: pressing a dialog's close button blurs the field, the error grows the vertically centred dialog and moves the button before the click lands, so the dialog needs a second click.
- **Reply to success with a plain `submission.reply()`.** `reply({ resetForm: true })` returns only `{ initialValue: null }`, without `status: "success"`, so `onSuccess` (closing the dialog) never runs. A form that closes on success needs no reset; one that stays on screen resets on the client in `onSuccess` (`form.reset()` or a new `key`).
- **A form that stays on screen keeps what was saved.** React 19 resets a `<form action>` after the action, back to the values it rendered with, so a settings form would show empty or stale fields after a successful save. The form hook returns `formProps` that submit from `onSubmit` (Conform validates, then the action runs in `startTransition`), which React does not reset; `action` stays for a browser without JavaScript. Spread `formProps` on the form, never `action={formAction}` alone.
- Fields render through one shared field component that takes Conform's field metadata (label, hint, error, `aria-describedby`); one shared status component announces the form error or success message.
- **An action that reads the saved data (generate, export, send) asks about unsaved changes first.** Check `form.dirty` (the dialog owns the form's state for this) and offer "Save and …", "… without saving" and "Back". "Save and continue" remembers the action in a ref, submits the form (`requestSubmit()` on the element with `form.id`) and runs the action in `onSuccess`; a failed save (`lastResult.status === "error"` or `form.allErrors`) clears it, so a later plain save does not trigger it.
- **A control that is not a native input** (a date picker, a combobox) joins the form through Conform's `useInputControl({ key, name, formId, initialValue })`: Conform keeps the value in a hidden base input of the form, so it is submitted, validated and counted in `form.dirty` like a typed value. A `<button>` trigger cannot carry `aria-invalid`: link the error with `aria-describedby` and style the state with a data attribute.
- **The dialog's main button is the form's submit button** (`type="submit" form={form.id}` in the header): without a submit button Enter in a field does nothing (implicit submission presses it).
- **One button that saves several sections saves one form.** Sections of a dialog under one save button are one `<form>` and one Server Action, not several forms submitted together (that needs its own success bookkeeping and can save half). Switch sections with `hidden`; when the action replaces the whole resource (PUT), keep every field it sends mounted, or an unopened section saves as empty. Parts with their own save stay outside the form.
- **Closing a form dialog with unsaved changes asks first** (close button, Escape, a click outside), with "Keep editing" as the default, and `beforeunload` warns on reload. Next cannot stop a link navigation, so a page form only gets the reload warning.
- Conform tracks values from real input events. Browser tests type with CDP `Input.insertText` (and keys), not by setting `.value` and dispatching a synthetic event, which leaves `form.dirty` false; a `<select>` change needs an `input` event as well as `change`.

### Calling actions from buttons and dialogs

Forms with fields use `<form action>` + `useActionState` (above). Everything else that calls a Server Action from a click (delete, restore, copy, confirm) goes through **one shared hook and one shared dialog**, never a hand-written `useTransition` + `useState` pair per component:

- Every such action returns one result type, e.g. `ActionResult = { error?: string }`: a message the user can read, or nothing on success. Failures are returned, not thrown.
- A shared hook, e.g. `useAction(action, { onSuccess })` returning `{ run, pending, error, setError }`: `run(...args)` clears the error, runs the action in a transition, then shows `error` or calls `onSuccess`.

```tsx
const archive = useAction(() => archiveOrderAction(order.id));
<Button onClick={() => archive.run()} pending={archive.pending}>Archive</Button>
<p role="alert" className="empty:hidden">{archive.error}</p>
```

- "Open, confirm, run; success closes, an error stays in the dialog" is one shared confirm dialog built on that hook (`trigger`, `title`, `description`, confirm and pending labels, `action`, `tone`, optional extra content and a disabled confirm, e.g. "type DELETE to confirm"). Several choices in one dialog (soft or permanent delete) build on the hook the same way.
- Shared buttons stay presentational: they take `pending` and an `onX` callback, and the component that owns the action holds the hook. Two actions in one row are two hooks; show `first.error ?? second.error`.
- Client hooks live in their own `shared/lib` topic (one folder per hook), never in an index that `"use server"` files import: a Server Action module must not pull a `"use client"` module through a shared barrel.
- A raw `startTransition` is fine only where no action result comes back: router navigation (search as you type), or client SDK flows such as sign-in.
- **A run over many records from the browser** (check, send or export each, with a progress bar) does not call a Server Action per record: Server Actions from one page run one after another and cannot be cancelled. Expose one record's step as a Route Handler, call it with `fetch` from a few parallel workers sharing one `AbortController` ("Stop" aborts them at once), count the results in state, and refresh the list once at the end (`router.refresh()`), not per record. Read `signal.aborted` through a function inside the loop: TypeScript keeps the value of its first check.

### Loading states

- **Every route that loads server data has a `loading.tsx`**, and so does every dialog route in a parallel slot (`@modal/(.)[id]/loading.tsx`): without one nothing happens after a click until the server answers. The skeleton has the final shape: the page's real header with skeleton rows or cards, a dialog opening at once at its final width.
- In development Next does not prefetch, so a skeleton appears with the server's first answer; in production visible links prefetch it and it shows at once. To see and test one, delay the server component briefly (and remove the delay before committing): throttling the network delays the skeleton as much as the content.

### Paged lists

- The page is in the URL (`/orders?page=2&q=smith`), read on the server by one shared parser (anything odd is page 1), and fetched by the entity's list function, which parses the API's envelope (`items`, `total`, `page`, `size`) with one generic schema into a `Page<Item>` type.
- One shared pagination component renders the range ("51–100 of 137"), previous and next, and `1 … 4 5 6 … 12`, as links from `hrefForPage(page)`; build them with one URL helper that leaves page 1 and empty values out. A page past the end says it is empty and links back.
- **A dialog over a list has its own page parameter** (`archived_page`, `items_page`), so the list behind keeps its page when the dialog is opened by URL.
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
- Locally, `docker compose up --watch` runs `Dockerfile.dev` (`next dev`); Compose Watch syncs the source into the container and rebuilds on `package.json`/`package-lock.json` changes (see `platform`). `WATCHPACK_POLLING` is not needed: Turbopack does not read it. After adding, moving or renaming files Turbopack can keep serving the old module ("Module not found" or an old component); `docker restart <project>-frontend-1` fixes it without rebuilding the image. Put local-only env in the component's `compose.yml`, not in code.

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

Writing accessible UI follows `better-accessibility` (WCAG 2.2 AA: semantics, keyboard and focus, names, forms, announcements, alt text, motion, zoom); checking it uses the AccessLint skills (`accessibility-scan` for a changed page, `accessibility-inspect` for keyboard and focus, `accessibility-audit` for the whole app, `accessibility-fix`, `accessibility-diff`). A project that narrows the scope (e.g. desktop only) says so in its own skill. Next and React specifics:

- **A `<script>` element only in the root layout, never in a client component.** React never runs a `<script>` it renders on the client. A script that must run before the first paint (the theme class) stays an inline `<script dangerouslySetInnerHTML={{ __html: … }} />` in the root layout's `<head>`: the server renders it into the HTML and the browser runs it before painting. Do **not** move it to `next/script` with `strategy="beforeInteractive"`: in the App Router that queues inline code (`self.__next_s.push(…)`) until Next's runtime loads, after the first paint, so a dark page flashes light (measured: light first frame every time). React 19.2 still warns "Encountered a script tag…" in development when it client-renders the root layout (error and not-found pages); that warning is expected there.

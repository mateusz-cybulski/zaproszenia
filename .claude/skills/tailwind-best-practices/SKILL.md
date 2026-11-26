---
name: tailwind-best-practices
description: "Use when writing, changing or reviewing styles in a component that uses Tailwind CSS (tailwindcss in package.json): class names in JSX/TSX, the Tailwind entry CSS (@import \"tailwindcss\", @theme, @custom-variant, @utility, @source), design tokens, variants and the cn() helper, dark mode, responsive and container queries, focus and motion accessibility, class sorting and linting, and adding UI kit components with the shadcn/ui CLI. Tailwind CSS v4 (CSS-first configuration). Pair with feature-sliced-design for where the files live."
license: MIT
metadata:
  version: "1.8.0"
  tailwind: "4"
---

# Tailwind CSS best practices (v4)

Tailwind v4 is configured in CSS, not in `tailwind.config.js`. Many v3 habits are wrong now; section 8 lists them. Reference: https://tailwindcss.com/docs. Check the component's `package.json`: if `tailwindcss` is 3.x, stop and verify every rule below against the v3 docs.

Where the files go (entry CSS, `cn()`, UI kit) is decided by `feature-sliced-design`.

## 1. Entry CSS and tokens

One entry stylesheet per app, imported once from the root layout:

```css
@import "tailwindcss";

@custom-variant dark (&:where(.dark, .dark *));

@theme {
  --color-brand: oklch(0.62 0.19 255);
  --color-brand-foreground: oklch(0.98 0 0);
  --color-surface: oklch(1 0 0);
  --color-muted: oklch(0.55 0.02 255);
  --radius-card: 0.75rem;
  --breakpoint-xs: 30rem;
}

@theme inline {
  --font-sans: var(--font-inter), system-ui, sans-serif;
}
```

- Tokens live in `@theme`, in the namespace that creates the utility: `--color-*` -> `bg-*`/`text-*`, `--font-*`, `--text-*`, `--radius-*`, `--shadow-*`, `--breakpoint-*`, `--container-*`, `--ease-*`, `--animate-*`. Base spacing is one variable, `--spacing`.
- Name tokens by role (`brand`, `surface`, `muted`, `danger`), not by value (`blue-500`).
- To drop the default palette and allow only project colors: `--color-*: initial;` at the top of `@theme`.
- Use `@theme inline` when a token references another variable (e.g. a `next/font` variable), so the utility uses that variable directly.
- `@theme` must be top-level. Plain CSS variables without a utility go in `:root`.
- Use OKLCH for colors, like the default palette.

## 2. Writing classes

- Use tokens, not arbitrary values. `bg-[#3b82f6]`, `mt-[13px]`, `text-[15px]` mean a token is missing: add it to `@theme` or use the nearest scale step. Arbitrary values are fine for one-off geometry that is not a design decision (`grid-cols-[1fr_auto]`, `max-h-[calc(100dvh-(--spacing(16)))]`).
- Read CSS variables with the v4 shorthand: `bg-(--chart-color)`, not `bg-[var(--chart-color)]`.
- **Never build class names dynamically.** Tailwind scans source files as text; `bg-${color}-500` or `"text-" + size` is never generated. Map values to complete class names:

```tsx
const tone = {
  info: "bg-sky-100 text-sky-900",
  danger: "bg-red-100 text-red-900",
} as const;

<p className={tone[status]} />
```

- Do not put two conflicting classes on one element (`p-2 p-4`): the order in `className` does not decide which wins, the order in the generated stylesheet does. When classes come from several places, merge with `cn()`.
- `!important` is a suffix in v4: `bg-red-500!`. Avoid it; fix the conflict instead.
- Prefer shorthands and logical properties when they say the same thing: `size-8` over `w-8 h-8`, `px-4` over `pl-4 pr-4`, `ms-2`/`me-2` when the layout must follow text direction.

## 3. Reuse: components, variants, `cn()`

Reuse in this order:

1. A loop: render the repeated element from data once.
2. A React component with props. This is the main reuse mechanism.
3. A variant map or `cva` inside that component for its visual variants.
4. Custom CSS in `@layer components` or `@utility` only for things utilities cannot express.

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

```tsx
const variants = {
  primary: "bg-brand text-brand-foreground hover:bg-brand/90",
  ghost: "bg-transparent text-brand hover:bg-brand/10",
} as const;

export function Button({ variant = "primary", className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
        "disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
```

- `className` from a parent is for placement (margin, width, grid position). A new look is a new variant, not a parent override.
- Stay within the design system. Screens are built from the UI kit (`shared/ui`) and its variants only; a page or feature never restyles a kit component: no extra colours, borders, rings, shadows, radii or backgrounds through `className`.

| Off the design system | Within it |
|---|---|
| `<Card className="ring-destructive/30">` for a danger zone | a plain `Card`; the danger is carried by the `destructive` button and the copy |
| `<Button className="bg-green-600">` | an existing variant, or a new `variant` in `shared/ui/button` used everywhere it applies |
| `<Badge className="border-amber-500 text-amber-700">` for a status | a status token (`--color-warning`) mapped in one config, used by every status badge |

  When a design genuinely needs a look the kit lacks, add the variant to the kit component (and tokens to `@theme`) first, then use it; never a one-off override in one screen. If unsure whether a look exists, look at the component's variants before writing classes.
- **A component's job does not change its look.** An input is the kit `Input` at the kit's height, font size, weight and alignment, whether it holds a name in a dialog's header, a search query or a form field; its error text is the same as a form field's. Without an explicit request from the user, do not enlarge, embolden, centre or otherwise restyle an element because of where it sits or what it does. Placement is still the parent's: width, position, the column it sits in. When the user does ask for a different look, it becomes a kit variant used everywhere it applies. Accessibility comes first: when the kit's look fails WCAG 2.2 (contrast, target size, visible focus, reflow), fix the kit component itself, for every screen, not the one place that shows it.
- No `@apply` to build component classes (`.btn { @apply ... }`): it is a second styling system next to components. `@apply` is acceptable only for styling markup you do not control (CMS HTML, third-party widgets), ideally scoped.
- Custom utilities with `@utility`, not `@layer utilities`, so variants work: `@utility scrollbar-none { scrollbar-width: none; }` -> `md:scrollbar-none`.
- Custom variants with `@custom-variant`: `@custom-variant theme-contrast (&:where([data-contrast=more] *));`.
- CSS modules or `<style>` blocks that use `@apply`/`@variant` need `@reference "<path to entry css>";` at the top.

### The UI kit comes from shadcn/ui

A component with `components.json` in its root takes its UI kit from shadcn/ui (style, aliases and the kit folder are in that file; here the kit is `@/shared/ui`).

1. **Look in shadcn first.** Before writing a kit component (input, toggle, checkbox, tooltip, select, tabs, pagination, popover, slider...), check https://ui.shadcn.com/docs/components and add it with the CLI: `npx shadcn add <name>`. A hand-written radio group, checkbox or pagination misses the keyboard handling and ARIA that the Radix-based one has.
2. **Preview, never overwrite.** Run `npx shadcn add <name> --dry-run` first: adding a component also re-adds the kit files it depends on (pagination brings `button`), and `--overwrite` replaces our edits to them (it once reverted the destructive button's contrast fix). Add only the new files; keep ours. After adding, `git diff` every existing kit file the CLI reports as updated and restore ours (it can report a file both updated and skipped; keep a copy of files the dry run lists as overwritten).
3. **Fix the `cn` import.** The CLI writes `import { cn } from "cn"` and adds an npm package `cn`, ignoring the `utils` alias. Change the import to `@/shared/lib/css` and remove the package (`npm uninstall cn`).
4. **Adapt inside the kit, once.** Behaviour the app needs everywhere goes into the kit file itself, e.g. `PaginationLink` renders Next's `Link` (client navigation) instead of `<a>`, and screen-reader text in the app's language; `Button` honours `aria-disabled` (ignores clicks and Enter, looks disabled, stays focusable), so a button waiting for the server uses `aria-disabled={pending}` instead of `disabled`, which drops focus to `<body>` (`better-accessibility`). Native `disabled` stays for an action that is genuinely unavailable. Screens still do not restyle kit components (above).
5. **Compose on top, in a separate file.** App-level components built from kit parts keep their own name and file (`ListPagination` in `list-pagination.tsx` on top of shadcn's `pagination.tsx`), so a later `shadcn add` cannot overwrite them.
6. Write a kit component by hand only when shadcn has none, in its style: `data-slot`, variants with `cva`, design tokens, `cn()`.

## 4. Responsive and layout

- Mobile-first: unprefixed classes are the mobile style, `sm:`/`md:`/`lg:` add from that width up. `text-center sm:text-left`, not `sm:text-center` for mobile.
- Ranges: `md:max-lg:flex`; below a breakpoint: `max-md:hidden`.
- Components whose layout depends on their own width use container queries: `@container` on the parent, `@md:flex-row` on the child; named: `@container/card` + `@sm/card:...`. Pages and page sections use breakpoints.
- Keep breakpoint and container tokens in one unit (rem).
- Layout with `flex`/`grid` and `gap-*`, not margins between siblings. `space-x-*`/`space-y-*` only for simple stacks.
- Use dynamic viewport units for full-height layouts: `min-h-dvh`, not `h-screen`.
- **Reserve the space of media whose size is known** (a page preview, a thumbnail): a box with `aspect-ratio` from the data (inline `style`, since class names cannot be built at runtime) and a skeleton until `onLoad`. An `<img>` without a size is 0 px until it loads and then pushes everything below it. A cached image can load before React attaches `onLoad`: check `complete && naturalWidth` once mounted.
- **Layouts survive 200% zoom** (`better-accessibility`; a 1440 px screen becomes a 720 px viewport). In Tailwind:
  - a header or toolbar with a title and actions wraps (`flex flex-wrap gap-x-4 gap-y-3`) and gives the title a minimum width (`min-w-60 flex-1`), instead of `truncate` squeezing the title to nothing under the actions;
  - a grid or flex item that holds wide content (a table, a long line) may shrink: grid tracks `minmax(0,1fr)` (`grid-cols-[minmax(0,1fr)]`), flex items `min-w-0`, so the wide content scrolls in its own `overflow-x-auto` container instead of the whole page. A plain `grid` track is `auto` and grows to its widest child; Table cells that hold free text (names, addresses) wrap (`whitespace-normal`; kit tables default to `whitespace-nowrap`): without it one long row widens the table and pushes a dialog's buttons out of view.
  - columns that must not overlap keep their content (`minmax(max-content,1fr)`) and the flexible part shrinks (`minmax(0,18rem)`), e.g. a header with a name between switches and actions.

## 5. States, dark mode, accessibility

- Dark mode: `dark:` follows `prefers-color-scheme` by default. For a user toggle, the project overrides it once with `@custom-variant dark (&:where(.dark, .dark *));` (or a `data-theme` attribute) and sets the class on `<html>`. Better still, define tokens that switch with the theme so components do not need `dark:` at all:

```css
@theme inline { --color-surface: var(--surface); }
:root { --surface: oklch(1 0 0); }
.dark { --surface: oklch(0.2 0.02 255); }
```

  `@theme inline` matters here: the utility then uses `var(--surface)` directly, so the value switches wherever `.dark` is set, not only on `<html>`.

- Accessibility rules (focus rings, reduced motion, contrast, target size, screen-reader text) are in `better-accessibility`; in Tailwind they are spelled `focus-visible:`, `motion-safe:` / `motion-reduce:`, `sr-only`.
- State from ARIA and data attributes instead of extra props: `aria-expanded:rotate-180`, `aria-invalid:border-danger`, `data-[state=open]:block`, `group-hover:`, `peer-checked:`.
- Cursor: v4 preflight gives buttons the default arrow, not the pointer. Restore it once in the entry CSS, not with `cursor-pointer` on every button:

```css
@layer base {
  button:not(:disabled),
  [role="button"]:not([aria-disabled="true"]),
  select:not(:disabled),
  ::file-selector-button {
    cursor: pointer;
  }
}
```

  Copied UI kits (shadcn/ui) also set `cursor-default` on menu and select items; change those to `cursor-pointer`. Use `cursor-pointer` in markup only for clickable elements that are not buttons (a `<label>` styled as a toggle).

## 6. Class detection and bundle size

- Tailwind scans the project automatically, skipping `.gitignore`d files, `node_modules`, CSS and lockfiles.
- `@source` paths are relative to the CSS file that contains them. With the entry CSS in `src/<name>/src/_app/styles/globals.css`, the component root is `../../../`.
- Classes used only inside a package in `node_modules` (a shared UI library): add `@source "../../../node_modules/@acme/ui";`.
- Exclude folders with `@source not "../../legacy";` (here `src/<name>/src/legacy`).
- Safelisting is `@source inline("...")` (the `safelist` config key is gone). Use it only for classes that really come from outside the source, e.g. a CMS: `@source inline("{hover:,}bg-red-{100..900..100}");`. Do not use it to rescue dynamic class names: fix them as in section 2.
- `@theme static` only when the CSS variables must exist even if unused (e.g. read from JS).

## 7. Sorting and linting

Set this up once per component, then keep it passing:

- Class order: `prettier-plugin-tailwindcss` (it must be the last Prettier plugin):

```json
{
  "plugins": ["prettier-plugin-tailwindcss"],
  "tailwindStylesheet": "./src/_app/styles/globals.css",
  "tailwindFunctions": ["cn", "clsx", "cva"]
}
```

- Class correctness: `eslint-plugin-better-tailwindcss` (supports v4 and flat config). Point it at the entry CSS with the `entryPoint` setting and enable its recommended config; follow the plugin's README for the exact flat-config import. It catches unknown classes, conflicting classes, concatenated (dynamic) class names, duplicates and deprecated v3 names. Use one Tailwind ESLint plugin, not two.
- Both run through the component's existing lefthook ESLint job (`src/<name>/lefthook.yml`); add a Prettier check next to it if Prettier is used.

## 8. v3 habits to fix

| v3 | v4 |
|---|---|
| `tailwind.config.js` `theme.extend` | `@theme { --color-...: ...; }` in CSS |
| `@tailwind base; @tailwind components; @tailwind utilities;` | `@import "tailwindcss";` |
| `darkMode: "class"` | `@custom-variant dark (&:where(.dark, .dark *));` |
| `safelist: [...]` | `@source inline("...")` |
| `content: [...]` | automatic detection, `@source` / `@source not` |
| `!bg-red-500` | `bg-red-500!` |
| `bg-[var(--x)]` | `bg-(--x)` |
| `theme("colors.red.500")` | `var(--color-red-500)` |
| `@layer utilities { .x {} }` | `@utility x {}` |
| `@tailwindcss/container-queries` plugin | built in: `@container`, `@md:` |
| `bg-opacity-50` | `bg-black/50` |
| buttons show the pointer cursor | buttons show the default cursor: restore it in `@layer base` (section 5) |
| `shadow-sm`, `rounded-sm`, `blur-sm` (old scale) | renamed scale in v4: check the upgrade guide (`shadow-xs`, `rounded-xs`, ...) before copying v3 snippets |

## 9. Before finishing

1. No dynamic class names, no unexplained arbitrary values, no conflicting classes on one element.
2. Kit components (`shared/ui`) are used as they are or through their variants: no `className` that changes their colour, border, ring, shadow, radius or background, nor their size, font or alignment because of the job they do there (section 3).
3. The changed markup passes `better-accessibility`'s "Before you finish" table.
4. Run in `src/<name>`: `npx --no-install eslint --max-warnings=0 .` and `npx --no-install tsc --noEmit` (plus `npx --no-install prettier --check .` if Prettier is set up).

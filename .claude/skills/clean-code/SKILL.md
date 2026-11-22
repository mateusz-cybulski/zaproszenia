---
name: clean-code
description: "Use whenever you write or change code in this repo, in any language: how to name variables, functions, types and constants so the name says what the thing is (full words, no abbreviations, no names made of a bare number like Text300), that deprecated APIs are never used (the lint and mypy fail on them), when a literal number or string must become a named constant, how to group related constants (limits, sizes, timeouts) and related field types in one typed namespace (a @final class such as TextLimit or TextField) instead of a dictionary with string keys or copies in several layers, and the naming convention that keeps those namespaces from clashing with variables. Applies to Python, TypeScript and the rest; code-reviewer checks the same rules in reviews."
license: MIT
metadata:
  version: "1.2.1"
---

# Clean code: names and constants

Code is read far more often than it is written. A reader should understand what a value is from its name alone, and find every rule that applies to it in one place. Language-specific details live in other skills (`fastapi-expert`, `api-structure`, `nextjs-best-practices`, `feature-sliced-design`); these rules apply on top of them, in every language.

## 1. Names say what the thing is

- **Full words.** `event`, not `e`/`ev`/`evt`; `error`, not `err`; `response`, not `res`; `button`, not `btn`. The full table is in `code-reviewer` ("Project rule: no abbreviations in names"). Allowed: acronyms that are the normal word (`id`, `url`, `api`, `html`, `json`, `db`, `uuid`, `ui`), `i`/`j` as plain loop counters, and names fixed from outside (a library's parameter, an external API's field).
- **By meaning, not by a value or shape.** A name made of a type word and a number tells the reader nothing about what the thing is for.

| Bad | Good | Why |
|---|---|---|
| `Text300`, `Text5000` | `TextField.OptionalShort`, `TextField.OptionalLong` | says what the field holds; the limit lives in one constant |
| `MAX_300`, `TIMEOUT_30` | `TextLimit.SHORT`, `REQUEST_TIMEOUT_SECONDS` | the number is the value, not the name |
| `data`, `info`, `item`, `result` (alone) | `orders`, `customer`, `invoice`, `payment_result` | names the business concept |
| `flag`, `check` | `is_paid`, `has_invoice`, `address_complete` | booleans read as yes/no questions |
| `handle()`, `process()` | `restore_order()`, `render_invoice()` | verb + what it acts on |

- **Units in the name** when a number has one and the type does not carry it: `timeout_seconds`, `size_mm`, `max_bytes`.
- **If a name needs a comment to be understood, rename it** (see `remove-comments`).

## 2. No deprecated APIs

Code never calls or types against something its library marks deprecated. Use the replacement the deprecation message names. The checks enforce it: `@typescript-eslint/no-deprecated` in TypeScript (`nextjs-best-practices`), mypy's `deprecated` error code in Python (`python-tooling`). A deprecation found later is fixed, not suppressed.

## 3. No magic values

A literal that encodes a rule (a limit, a size, a timeout, a status, a role, a path segment) gets a name, **once**, and every place that applies the rule reads it from there.

- A number repeated in two layers is a bug waiting to happen. Example: `String(300)` on the column and `max_length=300` in the request schema. Change one, and the API accepts text the database rejects (or the other way round).
- Not every literal is magic: `0`, `1`, `""`, `100` in a percentage, an index in a two-element tuple, values in a test that state the example are fine as they are.
- Copy the user sees (labels, messages) is not a constant to share; it belongs to the screen or response that shows it.

## 4. Related constants and types live together, in a typed namespace

Constants that describe one concept (text limits, paper sizes, retry settings), and field types built on them, are grouped in one object: the reader finds all of them in one place, one import brings the whole group, member names stay short (`TextField.OptionalShort`, not `OptionalShortText`), and the type checker checks every use.

**Use a namespace with typed, read-only members, not a dictionary with string keys.** In Python that is a class marked `@final` (no subclass can override a member) whose members are `Final` (no code can reassign them); mypy enforces both. With a dictionary:
- a typo (`LIMITS["shrot"]`) fails only at run time; type checkers and the editor cannot help;
- the value type is the union of all values, so each read needs a cast or loses precision;
- it can be changed at run time.

```python
# Python: a final class used as a namespace, members marked Final
from typing import Final, final

@final
class TextLimit:
    SHORT: Final = 300   # one line: names, positions, street
    LONG: Final = 5000   # paragraphs

@final
class TextField:
    Short = Annotated[str, Field(min_length=1, max_length=TextLimit.SHORT)]
    OptionalShort = Annotated[str | None, Field(max_length=TextLimit.SHORT), ...]

full_name: Mapped[str | None] = mapped_column(String(TextLimit.SHORT))  # model
venue_name: TextField.OptionalShort = None                               # schema
```

Type aliases as class members work with mypy `--strict` and Pydantic alike: the member is the `Annotated` type itself.

Use `enum.StrEnum` / `IntEnum` instead when the members are a closed set of **choices** (statuses, kinds) rather than settings: an enum value can be stored and validated, a limit cannot be "one of" anything.

```ts
// TypeScript: a const object, read-only and fully typed; the constant's name is UPPER_SNAKE_CASE
export const TEXT_LIMIT = {
  short: 300,
  long: 5000,
} as const;

type TextLimitName = keyof typeof TEXT_LIMIT; // "short" | "long"
```

TypeScript types cannot be members of an object: there, only constants are grouped this way; types stay module-level `export type`.

### Naming the namespaces

The convention keeps a namespace from ever clashing with a variable of the same word (`text`, `limit`), so short member names are safe:

| What | Container | Container name | Member names | Example |
|---|---|---|---|---|
| Group of constants | Python: `@final` class with `Final` members | `PascalCase` `<Concept><Kind>` (it is a class): `TextLimit`, `PaperSize`, `RequestTimeout` | `UPPER_SNAKE` | `TextLimit.SHORT` |
| Group of constants | TS/JS: `as const` object | `UPPER_SNAKE` `<CONCEPT>_<KIND>` (it is a constant): `TEXT_LIMIT`, `DELETE_COPY`, `FAILURE_MESSAGES` | `camelCase` keys; data values as keys in lookup maps (`FAILURE_MESSAGES["not-found"]`) | `TEXT_LIMIT.short` |
| Group of field types | Python `@final` class | `PascalCase` `<Concept>Field`: `TextField` | `PascalCase` (they are types); `Optional` prefix when the field may be empty, no prefix when it is required | `TextField.OptionalShort` |
| Variables, parameters, modules | — | `snake_case` / `camelCase`, never the bare container name | — | `text`, `field_text` |

- **In TypeScript and JavaScript every module-level constant is `UPPER_SNAKE_CASE`**: a fixed primitive (`MAX_PDF_BYTES`, `DELETE_CONFIRMATION`) and a fixed object or array (copy, labels, lookup maps, option lists, form field configs: `DELETE_COPY`, `VERIFICATION_STATUS_LABELS`, `COUNTRIES`, `ADDRESS_FIELDS`). Keys inside stay `camelCase`. In Python the group is a class, so it is `PascalCase` with `UPPER_SNAKE` members (`TextLimit.SHORT`).
- A `const` binding alone does not make a constant. `camelCase` stays for locals inside functions, functions, components, hooks, zod schemas, objects of functions (`routes.orders()`), stateful instances (a `Map` used as a cache, a `Set` of listeners, an `Intl.DateTimeFormat`), and names a framework requires (`export const metadata` in Next).
- **The container always has a suffix** saying what it holds (`Limit`, `Size`, `Field`, `Copy`, `Labels`). A bare concept (`Text`, `Paper`) is left free for variables and classes of the business concept itself.
- **The concept joins related containers**: `TextLimit.SHORT` and `TextField.OptionalShort` read as a pair; the frontend mirror is `TEXT_LIMIT.short`.
- Members are named by their meaning (`SHORT`, `A5`, `MAX_ATTEMPTS`), not by their value.
- **Do not group in a lowercase module instead** (`from app.schemas import text`, then `text.OptionalShort`): the module name collides with every local `text` variable.
- A type with its own validation (`Country`, `Timezone`) stays a separate module-level alias; the namespace holds the family that differs only by limit and optionality.
- Put the group in the lowest layer that every user can import (in a FastAPI component: `app/models/base.py`, see `api-structure`; in a frontend: the slice's `config` segment, or `shared/config` when several slices need it, see `feature-sliced-design`).
- A frontend and an API in different languages cannot share the object. The API is the source of truth for its own limits; the frontend repeats only what it needs for immediate feedback, and the API still validates.

## 5. Checklist

1. Every new name is full words and says what the thing is, not what value or shape it has.
2. No deprecated API is used; the lint and mypy fail on one.
3. No rule-carrying literal appears twice; each has one named home.
4. Related constants and field types are members of one typed namespace (a `@final` class, an `as const` object, or an enum for choices), not a string-keyed dictionary or a lowercase module.
5. Namespaces follow the naming table, never a bare word a variable could use: in Python a `PascalCase` class with `UPPER_SNAKE` members, in TS/JS an `UPPER_SNAKE` constant with `camelCase` keys.
6. The namespace sits in a layer every user can import without breaking the import rules.

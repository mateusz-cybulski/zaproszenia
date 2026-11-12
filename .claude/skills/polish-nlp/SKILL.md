---
name: polish-nlp
description: "Use when Python code analyses or generates Polish word forms: lemmatisation, morphological tags, inflection (declining names, nouns, adjectives), search normalisation for Polish text, with Morfeusz 2 (the morfeusz2 package) and its bundled SGJP dictionary. Covers installation (wheel platforms, Docker), the analyse/generate API, lemma and tag formats, ambiguity handling, licensing and testing."
license: MIT
metadata:
  version: "1.0.0"
  morfeusz2: "1.99.15"
  dictionary: "sgjp-2026.06.01"
---

# Polish morphology with Morfeusz 2 and SGJP

Facts below were checked against `morfeusz2` 1.99.15 (PyPI, June 2026) with its bundled dictionary `pl.sgjp.sgjp-2026.06.01`, on CPython 3.14. Site: http://morfeusz.sgjp.pl/ (manual: http://download.sgjp.pl/morfeusz/Morfeusz2.pdf).

## 1. Installation and platforms

- `uv add morfeusz2`. The wheel contains the library and the SGJP analysis dictionary (about 40 MB installed); nothing else to download.
- Wheels are `cp310-abi3`, so they work on Python 3.10+ including 3.14, but **only for `manylinux_2_28_x86_64`, `macosx_11_0_universal2` and `win_amd64`. There is no Linux aarch64 wheel and no sdist.**
  - Every container in this repo is `linux/amd64`, locally and on Cloud Run (see `platform`), and `python:3.14-slim` (Debian, glibc newer than 2.28) installs the x86_64 wheel fine.
  - Natively on the Mac (`uv run` outside Docker) the universal2 wheel works too.
  - Alpine (musl) images cannot use the wheel.
- Only the SGJP dictionary is bundled: `Morfeusz(dict_name="polimorf")` fails with `RuntimeError: Failed to load analyzer dictionary`. Polimorf would need its own dictionary files and `dict_path`.
- No type stubs: add a mypy override for `morfeusz2` (see `python-tooling`) and wrap the library in a small typed module.

## 2. API

```python
import morfeusz2

m = morfeusz2.Morfeusz()  # analyse + generate, SGJP, ~0.1 s to create
m.dict_id()               # 'pl.sgjp.sgjp-2026.06.01'
```

Constructor options worth knowing (keyword arguments):

| Option | Default | Use |
|---|---|---|
| `analyse`, `generate` | `True`, `True` | set one to `False` to load only what you need |
| `expand_tags` | `False` | split `sg:nom.acc` alternatives into separate results |
| `case_handling` | `CONDITIONALLY_CASE_SENSITIVE` | `morfeusz2.IGNORE_CASE` for text in all caps or lower case |
| `whitespace` | `SKIP_WHITESPACES` | `KEEP_WHITESPACES` to keep spacing tokens |
| `dict_name`, `dict_path` | bundled SGJP | other dictionaries |

### analyse(text)

Returns a list of DAG edges `(start, end, (orth, lemma, tag, names, labels))`. All interpretations of every segment are returned; segments are numbered nodes, and several edges can share a span:

```python
>>> m.analyse("Zamki stały w Krakowie")
[(0, 1, ('Zamki', 'Zamek', 'subst:pl:nom.acc.voc:m3', ['człon_nazwy_geograficznej'], [])),
 (0, 1, ('Zamki', 'zamek:Sm3~a', 'subst:pl:nom.acc.voc:m3', ['nazwa_pospolita'], [])),
 (0, 1, ('Zamki', 'zamek:Sm3~u', 'subst:pl:nom.acc.voc:m3', ['nazwa_pospolita'], [])),
 (1, 2, ('stały', 'stać:Vi', 'praet:pl:m2.m3.f.n:imperf', [], [])),
 (1, 2, ('stały', 'stały', 'adj:sg:nom.voc:m1.m2.m3:pos', [], [])),
 (2, 3, ('w', 'w', 'prep:loc:nwok', [], [])),
 (3, 4, ('Krakowie', 'Kraków', 'subst:sg:loc:m3', ['nazwa_geograficzna'], [])),
 ...]
```

- `names`: name classification (`nazwa_pospolita`, `nazwa_geograficzna`, `imię`, `nazwisko`, ...). `labels`: stylistic/domain qualifiers (e.g. `pot.` colloquial).
- Unknown words get the tag `ign` with the word itself as lemma (`('xyzqw', 'xyzqw', 'ign', [], [])`). Morfeusz is a dictionary, not a guesser.
- Punctuation gets `interp`.

### generate(lemma)

Returns every form of the lemma as `(orth, lemma, tag, names, labels)`:

```python
>>> [form for form, _, tag, _, _ in m.generate("Kraków") if ":sg:loc:" in tag]
['Krakowie']
```

Pass the lemma without the homonym suffix ("zamek", not "zamek:Sm3~a") to get all homonyms, then filter by the suffix or tag.

## 3. Lemma and tag formats

- **Lemma = base form + optional `:` homonym/part-of-speech qualifier**: `zamek:Sm3~a` (zamek, gen. *zamka*: lock) vs `zamek:Sm3~u` (gen. *zamku*: castle), `stać:Vi` / `stać:Vp`, `a:C` (conjunction). The base form is `lemma.split(":", 1)[0]`. Keep the full lemma when you must tell homonyms apart.
- Lemmas are case-sensitive: `Zamek` (a place name) and `zamek` are different.
- **Tags are positional, colon-separated**: part of speech first, then grammatical categories. `subst:sg:loc:m3` = noun, singular, locative, masculine inanimate. Dots mark alternatives inside one position: `subst:pl:nom.acc.voc:m3` matches nominative, accusative or vocative. Use `expand_tags=True` or split on `.` per position; never compare whole tag strings.
- Common values: number `sg`/`pl`; case `nom gen dat acc inst loc voc`; gender `m1` (masculine personal), `m2` (animate), `m3` (inanimate), `f`, `n`; parts of speech include `subst`, `adj`, `adv`, `fin`, `praet`, `inf`, `impt`, `ger`, `pact`, `ppas`, `prep`, `conj`, `qub`, `num`, `ppron12`, `ppron3`, `interp`, `ign`. The full tagset is in the manual.

## 4. Using it in an app

- **Ambiguity is the normal case.** Every common word has several interpretations ("nie" is a particle, conjunction, interjection or a pronoun form). For search and indexing, keep all distinct base lemmas of a token; for anything that needs one interpretation per word you need a tagger (context-aware disambiguation), which Morfeusz is not. Do not pick "the first result".
- Typical search normalisation: lower-case, analyse with `IGNORE_CASE`, take the set of base lemmas per token (`ign` tokens keep the original word), index and query on those sets.
- Inflecting names (e.g. "Pan Kowalski" -> "Panu Kowalskiemu"): `generate()` with the lemma, filter by case/number/gender from the tag; surnames not in SGJP return nothing: fall back to the original form and say so.
- **One instance per thread.** Thread safety is not documented: create the instance per thread (`threading.local`) or at startup in a single-worker process and call it from async endpoints directly (analysis is fast, pure CPU). Do not share one instance across a thread pool.
- Creating an instance costs about 0.1 s and tens of MB: do it once at startup (FastAPI `lifespan` or a cached factory), not per request.
- Wrap it in a small typed module (`app/morphology.py`) returning your own dataclasses (`Interpretation(orth, base, lemma, tag, names)`), so the rest of the code and the tests do not depend on tuples.

## 5. Licensing and attribution

- Morfeusz 2 and the bundled inflectional data (SGJP, also Polimorf) are released under the **2-clause BSD licence**. Copyright: Institute of Computer Science PAS (program, Polimorf data) and the SGJP authors (Zygmunt Saloni, Włodzimierz Gruszczyński, Marcin Woliński, Robert Wołosz, Danuta Skowrońska). `m.dict_copyright()` returns the exact notice for the loaded dictionary.
- Binary redistribution (a Docker image you hand to others, a desktop app) must reproduce that copyright notice and the licence text in documentation or "About"/licences page. A hosted service that does not distribute binaries has no such obligation, but crediting is good practice.
- Publications using it are asked to cite: Witold Kieraś, Marcin Woliński, "Morfeusz 2 – analizator i generator fleksyjny dla języka polskiego", *Język Polski* XCVII(1):75–83, 2017.
- The licence covers the list of inflected forms used for analysis, not the full SGJP dictionary (definitions etc.), which is not published under it.

## 6. Testing

- Morfeusz is deterministic for a given dictionary version: unit tests may call it directly (no network), but assert on sets of base lemmas or on the tags you filter by, not on full result lists, which change between dictionary releases.
- Pin `morfeusz2` in `uv.lock` and upgrade deliberately; check `dict_id()` in a test so a dictionary change is visible in review.
- Tests run in the amd64 container and natively on macOS (universal2 wheel). Never switch the component to an arm64 image: there is no wheel for it.

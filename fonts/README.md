# Typefaces

Two families, served from this origin rather than from Google, so that reading
the page does not report the visitor to a third party.

| Family | Files | Role |
|---|---|---|
| **Archivo** | `archivo-300-800-*.woff2` | Everything set in the sans. One variable font carrying both a weight axis (300 to 800) and a width axis (62% to 125%), which the design uses: the wordmark and the small caps are condensed rather than tracked. |
| **Azeret Mono** | `azeret-mono-{400,500,700}-*.woff2` | Course numbers, controls, and anything that has to line up in a column. |

## Subsets

The files are Google's own subsets with their `unicode-range` declarations kept
intact, so a browser downloads only what it renders. An English page fetches
`latin` and never touches `latin-ext` or `vietnamese`. Four files, roughly
170 kB, on a typical load.

Do not merge these into one file per family. That would trade a working
subsetting scheme for a single larger download.

## Replacing or updating them

1. Request the CSS from `fonts.googleapis.com/css2?...` **with a current browser
   user agent**. An older or absent UA gets you TTF or WOFF instead of WOFF2,
   and static instances instead of the variable font.
2. Confirm the response still says `font-stretch: 62% 125%` for Archivo. If it
   says a single value, you have been handed a static cut and the width axis
   will silently stop working.
3. Download each URL, keep the `unicode-range` lines with it, and update the
   `@font-face` block at the top of the stylesheet in `index.html`.

## Licence

Both are under the SIL Open Font License 1.1, which permits this use and
requires the licence to travel with the files. Full text in `OFL-archivo.txt`
and `OFL-azeretmono.txt`.

- Archivo: Copyright 2020 The Archivo Project Authors, https://github.com/Omnibus-Type/Archivo
- Azeret Mono: Copyright 2021 The Azeret Project Authors, https://github.com/displaay/azeret

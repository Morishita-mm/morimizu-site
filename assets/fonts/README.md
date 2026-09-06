# Noto Sans JP

`noto-sans-jp-full.woff2` is the complete Noto Sans JP variable font (100–900),
losslessly converted to WOFF2 with fontverter 2.0.0 (via subset-font 2.7.0).

- Source: https://github.com/google/fonts/blob/295d98a7a0c17c68f1341eaeea354e7960ea70d3/ofl/notosansjp/NotoSansJP%5Bwght%5D.ttf
- Original TTF SHA-256: `c2f3b4d463500a2ddcd3849cded1fceeb9fd6d1c32e6cbecd568453ba50fc68f`
- Font version: 2.004-H2
- License: SIL Open Font License 1.1; see `OFL.txt`.

`npm run prepare:fonts` generates disjoint home/site/article character subsets.
Builds run this after article synchronization, so newly published characters
are included automatically. The complete font remains a lazy fallback for
characters outside the generated corpus. No weight axes or shaping features
are removed.

During migration, 8,610 glyph/weight combinations in the existing Google-served
subsets were compared with this original: all advance widths and vector paths
were identical. Browser screenshots and A4 portrait/landscape PDFs are also
checked separately.

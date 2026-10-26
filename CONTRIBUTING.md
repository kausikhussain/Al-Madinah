# Contributing to Al-Madinah Vector Edition

Thank you for contributing to the preservation, discovery, and technical accessibility of the official Mushaf Al-Madinah vector resources.

Because this project handles sacred Quranic content, all contributions are held to rigorous standards of reverence, content fidelity, and cryptographic integrity.

---

## 1. Non-Negotiable Content Integrity

1. **Authoritative Assets are Read-Only**: Never edit, optimize, rename, overwrite, or touch any `.ai` file in `quran-pages/`.
2. **Zero Synthetic Generation**: Do not add AI-generated calligraphy, neural vector reconstructions, or OCR substitutions.
3. **Strict Asset Separation**:
   - `quran-pages/`: Original authoritative `.ai` files only.
   - `public/previews/`: Derived vector SVGs generated through verified tooling.
   - `public/data/pages.json`: Machine-generated cryptographic manifest.
4. **Transparent Defect Reporting**: If a conversion script produces clipping, missing diacritics, or rendering artifacts, flag the issue. Never manually patch or draw over Quranic artwork.

---

## 2. Local Development & Setup

### Prerequisites
- **Node.js**: Version 20 or higher
- **Python 3**: (Recommended) with `PyMuPDF` installed (`pip install pymupdf`) for instantaneous vector SVG extraction
- **Inkscape**: (Optional fallback) for vector SVG conversion

### Workflow
```sh
# 1. Run static validation
npm run build

# 2. Convert vector assets to SVG derivatives
npm run convert

# 3. Generate cryptographic manifest with SHA-256 hashes
npm run manifest

# 4. Verify all manifest mappings and outputs
npm run verify:assets

# 5. Serve locally and inspect in browser
npm run serve
```

---

## 3. Pull-Request Integrity Checklist

Before opening a pull request, verify and check off all items:

- [ ] **No Quranic Source Files Were Altered**: `git status quran-pages/` shows zero modified files.
- [ ] **Strict Filename Pattern Preserved**: Every source asset matches `NNN___Hafs39__DM.ai`.
- [ ] **Build & Validation Pass**: Both `npm run build` and `npm run verify:assets` pass without errors.
- [ ] **Visual Verification Conducted**: Representative pages (including dense diacritical text, ornamented surah headers, and marginal marks) were visually inspected.
- [ ] **Bilingual & RTL Testing**: Both English (LTR) and Arabic (RTL) interfaces were tested for proper layout, typography, and reading order.
- [ ] **Accessibility & Keyboard Navigation**: Verified keyboard shortcuts (`+`, `-`, `0`, `w`, `p`, `f`, arrow keys) and visible focus rings.
- [ ] **Rights & Attribution Intact**: KFGQPC ownership statements and official rights links remain prominent and unaltered.
- [ ] **No Permissive Licensing Over Sacred Artwork**: No open-source license has been applied to the Quranic artwork.

# Al-Madinah Vector Edition
## مصحف المدينة النبوية — النسخة المتجهية الرقمية

<div dir="rtl">

### نبذة عن المشروع
هذا المشروع واجهة رقمية مستقلة وعالية الدقة لاستكشاف **المعاينات المتجهية المشتقة والمتحقق منها** لصفحات مصحف المدينة النبوية (رواية حفص عن عاصم — إصدار 1439هـ).

المصدر الفني المرجعي معتمد وصادر عن **مجمع الملك فهد لطباعة المصحف الشريف** بالمدينة المنورة، المملكة العربية السعودية.

تظل ملفات المصحف الأصلية بصيغة Adobe Illustrator (`quran-pages/*.ai`) مصونة بالكامل، دون أي تعديل، أو إعادة كتابة، أو استبدال للخطوط، أو معالجة توليدية بالذكاء الاصطناعي.

- **الموقع الرسمي للمجمع:** https://dm.qurancomplex.gov.sa/
- **شروط وحقوق الاستخدام الرسمية:** https://dm.qurancomplex.gov.sa/rights/
- **المستودع المصدري الأصلي:** https://github.com/MushafAlMadinahVector/MushafAlMadinahVector

</div>

---

## Purpose & Scope

The **Al-Madinah Vector Edition** repository provides a restrained, museum-grade editorial web interface, automated conversion pipeline, and cryptographic verification framework for the official Mushaf Al-Madinah vector publication.

### Core Guarantees:
1. **Sacred Source Integrity**: Authoritative vector assets in `quran-pages/` are immutable and read-only. Calligraphic artwork, verse markers, diacritics, and marginal ornaments are never modified, smoothed, or altered.
2. **Deterministic Vector Derivation**: Previews in `public/previews/*.svg` are exact vector derivatives extracted from the embedded `%PDF-1.5%` stream of the original `.ai` files. No OCR text substitutions or AI approximations are permitted.
3. **Cryptographic Traceability**: Every page preview is indexed in `public/data/pages.json` with its source filename, byte count, and SHA-256 integrity hash.
4. **Governed Rights & Attribution**: All rights in the Quranic calligraphy belong to the King Fahd Glorious Quran Printing Complex. Frontend application code is maintained as independent open-source tooling.

---

## Repository Architecture

```text
Al-Madinah/
├── quran-pages/                  # Authoritative .ai files (604 pages, Hafs 39) — read-only
├── public/
│   ├── data/
│   │   └── pages.json            # Generated cryptographic manifest (SHA-256, Surah, Juz)
│   └── previews/                 # Derived vector SVG previews (git-isolated derivatives)
├── scripts/
│   ├── convert-previews.py       # PyMuPDF vector SVG extraction engine
│   ├── convert-previews.mjs      # Multi-engine CLI runner (PyMuPDF / Inkscape)
│   ├── generate-manifest.mjs     # SHA-256 hashing and metadata generator
│   ├── verify-manifest.mjs       # Build and asset integrity validator
│   └── quran-data.mjs            # 604-page canonical Surah (1-114) and Juz (1-30) mapping
├── docs/
│   └── AUDIT.md                  # Comprehensive repository audit and technical assessment
├── index.html                    # High-end, accessible, bilingual editorial UI
├── styles.css                    # Design system (parchment palette, typography, RTL support)
├── app.js                        # Interactive viewer, pan/zoom, search, and integrity inspector
├── CONTRIBUTING.md               # Contribution policies and PR integrity checklist
├── LICENSE                       # Official KFGQPC bilingual rights and disclaimer notice
└── package.json                  # Scripts and engine configuration (Node >= 20)
```

---

## Quickstart & Local Execution

Requires **Node.js 20+** and optionally **Python 3 with PyMuPDF** for high-speed conversion.

### 1. Build and Verify
```sh
npm run build
```
The build process validates the manifest and referenced assets. In the absence of local vector files, it safely completes in asset-safe mode without crashing.

### 2. Launch Local Interface
```sh
npm run serve
```
Launches the static HTTP server at `http://localhost:3000`.

---

## Vector Conversion Pipeline

The official Adobe Illustrator `.ai` files (`NNN___Hafs39__DM.ai`) contain embedded `%PDF-1.5%` vector streams. The conversion tooling extracts clean, pure vector SVGs without rasterization or glyph clipping:

```sh
# 1. Place authorised .ai files in quran-pages/
# 2. Convert to vector SVGs using PyMuPDF (or Inkscape)
npm run convert

# 3. Generate cryptographic manifest with SHA-256 checksums
npm run manifest

# 4. Verify asset integrity
npm run verify:assets
```

---

## Interactive Viewer Capabilities

- **Bilingual Interface**: Seamless instant toggle between English (LTR) and Arabic (RTL) with tailored typography (`Amiri`, `Cormorant Garamond`, `Inter`).
- **Interactive Pan & Drag**: Smooth mouse click-and-drag and touch gestures when zoomed into calligraphy.
- **Precision Zoom**: Stepped zoom (`+`, `-`), Fit Width (`W`), Fit Page (`P`), Reset (`0`), and Double-Click toggle.
- **Keyboard Navigation**: Flip through pages using Left/Right arrows, `F` for distraction-free Fullscreen, and `Esc` to exit modals.
- **Cryptographic Inspector**: Direct modal access to the page's SHA-256 hash, byte count, source filename, and upstream provenance.
- **Canonical Quran Index**: Real-time filtering across all 114 Surahs, 30 Juz, and page numbers (1–604).

---

## Rights, Ownership & Governance

### Quranic Calligraphic Artwork
All Quranic calligraphy, composition, and original artwork are the intellectual property of the **King Fahd Glorious Quran Printing Complex (KFGQPC)**, Al-Madinah Al-Munawwarah, Kingdom of Saudi Arabia.

Under the [official KFGQPC terms](https://dm.qurancomplex.gov.sa/rights/), the digital copy may be used free of charge across personal, institutional, web, software, and printing contexts. Commercial physical printing of physical copies in Saudi Arabia remains subject to specific regulations.

### Frontend Application Code
Original application code (`app.js`, `styles.css`, `index.html`, and `scripts/`) is independent frontend tooling designed to make the official resources accessible. It does not alter, replace, or supersede the rights applicable to the underlying Quranic calligraphy.

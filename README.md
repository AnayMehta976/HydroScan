# HydroScan

### Making Microplastic Pollution Visible

**HydroScan** is a portable, offline, low-cost optical device that screens water for microplastic contamination on-site — no laboratory, no chemicals, no internet required.

> Conrad Challenge 2025–26 | Anay Mehta & Yuvraj Nikum

[![Live Site](https://img.shields.io/badge/Live%20Site-hydro--scan--six.vercel.app-blue?style=flat&logo=vercel)](https://hydro-scan-six.vercel.app/) [![Watch the Demo](https://img.shields.io/badge/Watch%20Demo-YouTube-red?style=flat&logo=youtube)](https://www.youtube.com/watch?v=5f7OmmbQsqY)

---

## The Problem

Microplastics — plastic particles smaller than 5 mm — have been detected in oceans, rivers, groundwater, bottled water, municipal drinking supplies, human blood, lung tissue, and placental samples. Despite growing awareness, routine monitoring remains rare outside academic research.

The reason: existing detection methods (FTIR and Raman spectroscopy) require expensive lab equipment, trained professionals, chemical preparation, and per-sample fees. Frequent testing is simply impractical for households, schools, NGOs, and communities — especially in remote or disaster-affected regions.

**When contamination cannot be measured, it is ignored.**

---

## The Solution

HydroScan enables rapid, on-site microplastic screening using controlled optical illumination, digital imaging, and an offline machine learning model running on embedded hardware.

### How It Works

1. **Sample placement** — A water sample is placed inside a sealed transparent chamber engineered to minimize ambient light interference.
2. **Illumination** — LEDs illuminate the sample from fixed angles. Microplastic particles scatter and refract light differently from the surrounding fluid due to differences in refractive index, shape, and surface structure.
3. **Image capture** — A fixed-position camera module (connected to a Raspberry Pi 4) captures the resulting scattering patterns consistently across every test.
4. **Preprocessing** — Background subtraction and contrast normalization reduce noise and improve signal quality.
5. **ML inference** — A trained classification model analyzes spatial and intensity-based features from the processed image — fully offline, no cloud required.
6. **Result** — The device outputs one of three contamination categories:

| Category | Concentration | Scattering Pattern |
|----------|--------------|--------------------|
| Low | 0–50 particles / L | Minimal scattering |
| Medium | 50–500 particles / L | Clearly detectable, sparse scattering |
| High | > 500 particles / L | Dense, high-intensity scattering |

Results are intuitive and decision-ready — no technical training required to interpret them.

---

## Key Features

- **Fully offline** — all inference runs on embedded hardware (Raspberry Pi 4); no internet or cloud dependency
- **No consumables** — reusable indefinitely after a one-time purchase; zero cost per test
- **No chemicals** — purely optical, non-destructive measurement
- **Portable** — designed for field deployment, disaster response, and remote environments
- **Affordable** — unit cost ~₹8,000 ($89); priced at ~₹12,000 ($133)

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Embedded hardware | Raspberry Pi 4 |
| Imaging | Camera module (fixed position) |
| Illumination | LED array (fixed angles) |
| Image preprocessing | Background subtraction, contrast normalization |
| ML model | Image classification (offline inference) |
| Enclosure | Custom optical chamber (ambient-light minimized) |
| Dashboard | Next.js (TypeScript), deployed on Vercel |

---

## Validation

- Built and tested a working physical prototype with transparent sampling chamber, LED illumination, camera module, and embedded compute
- Prepared water samples across all three contamination ranges and confirmed consistent, visually distinct scattering patterns
- Captured labeled image sets under standardized conditions and trained an initial ML classification model with consistent differentiation across categories
- Conducted dozens of repeated test cycles — no consumables, no component replacement — confirming zero marginal cost per test
- Refined enclosure design, lighting uniformity, and camera alignment iteratively to improve model robustness
- Usability tested with peers and mentors; confirmed operation without specialized technical training

---

## Target Users

- Environmentally conscious **households**
- **Schools and educational institutions**
- **NGOs** and community water-monitoring groups
- **Researchers** and citizen scientists
- **Disaster-response teams** and local authorities in low-infrastructure regions

---

## Business Model

| | Value |
|----|-------|
| Unit price | ₹12,000 / $133 |
| Unit cost | ₹8,000 / $89 |
| Gross margin | ~33% |
| Revenue model | One-time device sale (no recurring fees) |
| Future streams | Software upgrades, institutional analytics, licensing |

---

## Team

**Anay Mehta** — System architecture, machine learning, software development. Designs the optical analysis pipeline, trains the classification model, and manages hardware–software integration.

**Yuvraj Nikum** — Hardware development and physical prototyping. Leads enclosure design, optical chamber construction, illumination layout, and electronics integration.

Formed at school through a shared interest in applying engineering and computer science to real-world environmental problems.

---

## Running the Dashboard

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## License

This project is proprietary. Core optical configuration, data pipeline, and ML models are trade secrets. All rights reserved © 2025–26 Anay Mehta & Yuvraj Nikum.

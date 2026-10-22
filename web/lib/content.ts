export const links = {
  github: "https://github.com/AnayMehta976/HydroScan",
  youtubeId: "5f7OmmbQsqY",
  youtube: "https://www.youtube.com/watch?v=5f7OmmbQsqY",
};

export const navItems = [
  { id: "problem", label: "Problem" },
  { id: "how", label: "How it works" },
  { id: "pipeline", label: "Pipeline" },
  { id: "try", label: "Try a scan" },
  { id: "build", label: "The build" },
  { id: "business", label: "Business" },
  { id: "team", label: "Team" },
];

export const foundIn = [
  "oceans",
  "rivers",
  "groundwater",
  "bottled water",
  "drinking water",
  "human blood",
  "lung tissue",
  "placentas",
];

export const comparison = [
  { label: "Where it runs", lab: "Specialist laboratory", hydro: "On-site, anywhere" },
  { label: "Cost per test", lab: "Per-sample fees", hydro: "₹0 after purchase" },
  { label: "Chemicals", lab: "Sample preparation", hydro: "None, purely optical" },
  { label: "Who can run it", lab: "Trained professionals", hydro: "Anyone, one button" },
  { label: "Internet", lab: "Lab infrastructure", hydro: "Not needed" },
  { label: "What you get", lab: "Detailed polymer analysis", hydro: "Low, Medium or High screening" },
];

export const steps = [
  {
    title: "Place the sample",
    short: "Sealed chamber",
    body: "A water sample goes into a glass dish inside a sealed chamber. The enclosure blocks ambient light, so every test starts from the same conditions.",
  },
  {
    title: "Light it up",
    short: "One LED strip on three walls",
    body: "A single white LED strip runs along three inside walls at water level and lights the sample from the sides. Plastic particles scatter and refract light differently from the water around them, so they glow against the dark.",
  },
  {
    title: "Capture",
    short: "Camera Module v3 NOIR",
    body: "A fixed camera looks straight down and takes several frames per scan, so a single bad frame never decides the result.",
  },
  {
    title: "Clean up the image",
    short: "Raspberry Pi 4",
    body: "The Pi crops to the water, evens out the lighting and masks LED reflections, so glare is never mistaken for a particle.",
  },
  {
    title: "Find and judge every particle",
    short: "OpenCV + ML, offline",
    body: "Computer vision finds and separates each particle and scores how plastic-like it is. A trained model then classifies the sample, entirely on the device.",
  },
  {
    title: "Read the result",
    short: "16×2 LCD",
    body: "The screen shows the level, a relative index and the particle count, for example HIGH 74% n=74. An annotated image and a log entry are saved too.",
  },
];

/** Each step matches an image rendered by running HydroScan's detector. */
export const pipeline = [
  { title: "Crop to the water", body: "Only the region of interest inside the dish is analysed.", img: "/pipeline/stage-1-raw.webp" },
  { title: "Even out the lighting", body: "CLAHE balances the LED light, so corners and centre are treated the same.", img: "/pipeline/stage-2-clahe.webp" },
  { title: "Mask the glare", body: "Saturated LED reflections are found and blocked out, shown here in orange.", img: "/pipeline/stage-3-glare.webp" },
  { title: "Find bright specks", body: "A white top-hat filter lifts small bright particles off the slowly varying background.", img: "/pipeline/stage-4-tophat.webp" },
  { title: "Make both detectors agree", body: "The top-hat result and an adaptive threshold must both fire for a pixel to count. Noise drops out.", img: "/pipeline/stage-5-binary.webp" },
  { title: "Split touching particles", body: "A watershed step separates specks stuck together. Each colour is one particle.", img: "/pipeline/stage-6-split.webp" },
  { title: "Score and count", body: "Colour, solidity and shape give each particle a plastic score. Green is counted as plastic; orange is debris and left out.", img: "/pipeline/stage-7-annotated.webp" },
];

export const levels = [
  { key: "low", name: "Low", range: "0–50 particles / L", pattern: "Minimal scattering", lcd: ["LOW   12%  n=12", "Water looks OK"], particles: 7 },
  { key: "medium", name: "Medium", range: "50–500 particles / L", pattern: "Sparse but clearly detectable", lcd: ["MEDIUM 41% n=41", "Test again soon"], particles: 26 },
  { key: "high", name: "High", range: "Over 500 particles / L", pattern: "Dense, high-intensity scattering", lcd: ["HIGH  74%  n=74", "Investigate"], particles: 64 },
] as const;

export const modelStats = [
  { value: 88, prefix: "~", suffix: "%", label: "accuracy on held-out images" },
  { value: 100, prefix: "", suffix: "%", label: "recall on HIGH samples" },
  { value: 500, prefix: "", suffix: "", label: "labelled training images" },
  { value: 5, prefix: "", suffix: "", label: "classes, including non-plastic" },
];

export const modelClasses = ["clean", "low", "medium", "high", "non_plastic"];

export const features = [
  { title: "Fully offline", body: "Every step runs on the Raspberry Pi. No internet, no cloud account.", tag: "No signal needed" },
  { title: "No consumables", body: "Reusable indefinitely after one purchase. Zero cost per test.", tag: "₹0 per test" },
  { title: "No chemicals", body: "A purely optical, non-destructive measurement.", tag: "Light only" },
  { title: "Portable", body: "Runs from a USB-C power bank, so it goes where the water is.", tag: "Power bank" },
  { title: "Easy to read", body: "One button and a plain Low, Medium or High result anyone can act on.", tag: "One button" },
  { title: "Affordable", body: "About ₹8,000 in parts, from widely available components.", tag: "≈ ₹8,000" },
];

export const bom = [
  { item: "Raspberry Pi 4", cost: 4000 },
  { item: "Camera Module v3 NOIR", cost: 2500 },
  { item: "Miscellaneous", cost: 450 },
  { item: "Power components", cost: 300 },
  { item: "Enclosure", cost: 300 },
  { item: "16×2 I2C LCD", cost: 250 },
  { item: "White LEDs", cost: 200 },
];

export const validation = [
  "Built a working prototype: transparent sampling chamber, LED illumination, camera module and embedded computer.",
  "Prepared samples across all three contamination ranges and confirmed visibly distinct scattering patterns.",
  "Captured labelled image sets under standard conditions and trained a model that separates the categories.",
  "Ran dozens of repeated test cycles with no consumables or replacement parts: zero cost per test.",
  "Refined the enclosure, lighting uniformity and camera alignment over several iterations.",
  "Tested with peers and mentors, who ran it without any specialised training.",
];

export const users = [
  { title: "Households", body: "Families who want to know what’s in their water." },
  { title: "Schools", body: "Hands-on environmental science in the classroom." },
  { title: "NGOs", body: "Community water-monitoring programmes." },
  { title: "Researchers", body: "Citizen scientists and quick field screening." },
  { title: "Disaster response", body: "Local authorities in low-infrastructure regions." },
];

export const business = {
  price: { inr: "₹12,000", usd: "$133" },
  cost: { inr: "₹8,000", usd: "$89" },
  margin: 33,
  streams: ["Software upgrades", "Institutional analytics", "Licensing"],
  funding: [
    "Refining the prototype",
    "Optimising manufacturing",
    "Pilots with schools, NGOs and research institutions",
    "Training the model on real-world captures",
  ],
};

export const team = [
  {
    name: "Anay Mehta",
    role: "Hardware, edge computing and prototyping",
    body: "Designed and built the device: the light-sealed optical chamber, the three-wall LED illumination and the fixed camera geometry that keeps every scan consistent. Integrated the Raspberry Pi 4 as the edge computer and wrote the code that runs on it, from the button, LED switching and camera capture to the LCD readout, so the whole scan happens on the device with no internet.",
    initials: "AM",
  },
  {
    name: "Yuvraj Nikum",
    role: "Machine learning and computer vision",
    body: "Led the entire machine-learning side: designed the OpenCV analysis pipeline that finds and scores each particle, built the synthetic training dataset, and trained and evaluated the Random Forest classifier that turns each image into a Low, Medium or High result.",
    initials: "YN",
  },
];

export const links = {
  github: "https://github.com/AnayMehta976/HydroScan",
  youtubeId: "5f7OmmbQsqY",
  youtube: "https://www.youtube.com/watch?v=5f7OmmbQsqY",
};

export const navItems = [
  { id: "problem", label: "Problem" },
  { id: "how", label: "How it works" },
  { id: "technology", label: "Technology" },
  { id: "prototype", label: "Prototype" },
  { id: "business", label: "Business" },
  { id: "team", label: "Team" },
];

export const foundIn = [
  "Oceans",
  "Rivers",
  "Groundwater",
  "Bottled water",
  "Municipal drinking water",
  "Human blood",
  "Lung tissue",
  "Placental samples",
];

export const comparison = [
  { label: "Where it runs", lab: "Specialist laboratory", hydro: "On-site, anywhere" },
  { label: "Cost per test", lab: "Per-sample fees", hydro: "₹0 after purchase" },
  { label: "Chemicals", lab: "Sample preparation needed", hydro: "None, purely optical" },
  { label: "Who can run it", lab: "Trained professionals", hydro: "Anyone, one button" },
  { label: "Internet", lab: "Lab infrastructure", hydro: "Not needed" },
  { label: "What you get", lab: "Detailed polymer analysis", hydro: "Low / Medium / High screening" },
];

export const steps = [
  {
    title: "Place the sample",
    short: "Sealed chamber",
    body: "A water sample goes into a transparent glass dish inside a sealed chamber. The enclosure blocks ambient light so every test starts from the same conditions.",
  },
  {
    title: "Illuminate",
    short: "Fixed-angle LEDs",
    body: "White LEDs light the sample from fixed angles. Plastic particles scatter and refract light differently from the water around them, because of their refractive index, shape and surface.",
  },
  {
    title: "Capture",
    short: "Camera Module v3 NOIR",
    body: "A fixed camera connected to a Raspberry Pi 4 photographs the scattering pattern. Several frames are taken per scan so one bad frame never decides the result.",
  },
  {
    title: "Clean up the image",
    short: "Preprocessing",
    body: "The image is cropped to the water, lighting is evened out, and LED reflections are masked so glare is never mistaken for a particle.",
  },
  {
    title: "Analyse on the device",
    short: "OpenCV + ML, offline",
    body: "Computer vision finds and separates every particle and scores how plastic-like it is. A trained model then classifies the sample, entirely on the Pi with no cloud.",
  },
  {
    title: "Read the result",
    short: "16×2 LCD",
    body: "The LCD shows the contamination level, a relative index and the particle count, for example HIGH 74% n=74. An annotated image and a log entry are saved too.",
  },
];

export const pipeline = [
  { title: "Crop to the water", body: "Only the region of interest is analysed." },
  { title: "Even out the lighting", body: "CLAHE balances uneven LED illumination so corners and centre are treated the same." },
  { title: "Mask glare", body: "Large saturated blobs from LED reflections are detected and excluded." },
  { title: "Double detection", body: "A top-hat filter and an adaptive threshold must both agree a pixel is a particle, which removes most noise." },
  { title: "Split touching particles", body: "A watershed step separates specks stuck together, so two count as two." },
  { title: "Score each particle", body: "Colour, solidity and shape give every blob a 0–1 plastic score. Sand and organic debris are left out of the count." },
  { title: "Combine frames", body: "The median count and averaged features across all good frames give the final reading." },
];

export const levels = [
  {
    key: "low",
    name: "Low",
    range: "0–50 particles / L",
    pattern: "Minimal scattering",
    lcd: ["LOW   12%  n=12", "Water looks OK"],
  },
  {
    key: "medium",
    name: "Medium",
    range: "50–500 particles / L",
    pattern: "Sparse but clearly detectable scattering",
    lcd: ["MEDIUM 41% n=41", "Test again soon"],
  },
  {
    key: "high",
    name: "High",
    range: "Over 500 particles / L",
    pattern: "Dense, high-intensity scattering",
    lcd: ["HIGH  74%  n=74", "Investigate"],
  },
] as const;

export const modelStats = [
  { value: 88, suffix: "%", prefix: "~", label: "accuracy on held-out images" },
  { value: 100, suffix: "%", prefix: "", label: "recall on HIGH samples" },
  { value: 500, suffix: "", prefix: "", label: "labelled training images" },
  { value: 5, suffix: "", prefix: "", label: "classes, including non-plastic" },
];

export const modelClasses = ["clean", "low", "medium", "high", "non_plastic"];

export const features = [
  { title: "Fully offline", body: "All analysis runs on the Raspberry Pi. No internet or cloud account." },
  { title: "No consumables", body: "Reusable indefinitely after one purchase. Zero cost per test." },
  { title: "No chemicals", body: "A purely optical, non-destructive measurement." },
  { title: "Portable", body: "Runs from a USB-C power bank, built for field work and disaster response." },
  { title: "Easy to read", body: "One button, and a plain Low, Medium or High result anyone can act on." },
  { title: "Affordable", body: "About ₹8,000 in parts, built from widely available components." },
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
  "Built a working prototype with a transparent sampling chamber, LED illumination, camera module and embedded computer.",
  "Prepared water samples across all three contamination ranges and confirmed consistent, visually distinct scattering patterns.",
  "Captured labelled image sets under standard conditions and trained a classification model that separates the categories reliably.",
  "Ran dozens of repeated test cycles with no consumables or replacement parts, confirming zero cost per test.",
  "Refined the enclosure, lighting uniformity and camera alignment over several iterations to make the model more robust.",
  "Tested with peers and mentors, who operated it without any specialised training.",
];

export const users = [
  { title: "Households", body: "Families who want to know what is in their water." },
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
};

export const team = [
  {
    name: "Anay Mehta",
    role: "Hardware and prototyping",
    body: "Led the enclosure design, optical chamber construction, illumination layout and electronics integration.",
    initials: "AM",
  },
  {
    name: "Yuvraj Nikum",
    role: "System architecture, machine learning and software",
    body: "Designed the optical analysis pipeline, trained the classification model and integrated the hardware with the software.",
    initials: "YN",
  },
];

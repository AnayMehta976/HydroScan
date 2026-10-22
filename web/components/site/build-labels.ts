/** Components called out in the exploded view. Kept separate so the page can list them without loading three.js. */
export type BuildLabel = { n: number; name: string; note: string; side: "left" | "right" };

export const LABELS: BuildLabel[] = [
  { n: 1, name: "Scan button", note: "Starts a scan", side: "right" },
  { n: 2, name: "Top housing", note: "Light-tight, holds the electronics", side: "left" },
  { n: 3, name: "16×2 LCD", note: "Shows level, index and count", side: "right" },
  { n: 4, name: "Raspberry Pi 4", note: "Runs OpenCV and the model offline", side: "left" },
  { n: 5, name: "Camera Module v3 NOIR", note: "Looks straight down at the water", side: "right" },
  { n: 6, name: "White LED strip", note: "One strip on three walls, at dish height", side: "left" },
  { n: 7, name: "Chamber walls", note: "Black outside, white inside", side: "left" },
  { n: 8, name: "Glass dish", note: "Holds the water sample", side: "right" },
  { n: 9, name: "Base", note: "Keeps the dish at a fixed height", side: "left" },
  { n: 10, name: "USB-C power bank", note: "Runs it anywhere, no mains", side: "right" },
];

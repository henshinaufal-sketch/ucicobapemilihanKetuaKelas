export type Candidate = { id: string; name: string; image: string; motto: string };

export const CANDIDATES: Candidate[] = [
  { id: "naruto", name: "Naruto", image: "/candidates/naruto.jpg", motto: "Pantang menyerah, itulah jalan ninjaku!" },
  { id: "doraemon", name: "Doraemon", image: "/candidates/doraemon.png", motto: "Ada alat untuk setiap masalah kelas." },
  { id: "shinchan", name: "Shinchan", image: "/candidates/shinchan.jpg", motto: "Kelas santai, kelas bahagia." },
];

export const isCandidate = (id: string) => CANDIDATES.some((c) => c.id === id);

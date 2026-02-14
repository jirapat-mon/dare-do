export interface AvatarFrame {
  key: string;
  nameTh: string;
  nameEn: string;
  // CSS classes or SVG for the frame
  borderStyle: string; // tailwind border classes
  glowColor?: string; // optional glow effect
  pointsCost: number; // 0 = free
  category: "free" | "premium";
}

export const AVATAR_FRAMES: AvatarFrame[] = [
  // 10 Free frames
  { key: "default", nameTh: "พื้นฐาน", nameEn: "Default", borderStyle: "border-2 border-gray-600", pointsCost: 0, category: "free" },
  { key: "orange", nameTh: "ส้มสด", nameEn: "Orange", borderStyle: "border-2 border-orange-500", pointsCost: 0, category: "free" },
  { key: "blue", nameTh: "ฟ้าใส", nameEn: "Blue", borderStyle: "border-2 border-blue-500", pointsCost: 0, category: "free" },
  { key: "green", nameTh: "เขียวสด", nameEn: "Green", borderStyle: "border-2 border-green-500", pointsCost: 0, category: "free" },
  { key: "purple", nameTh: "ม่วง", nameEn: "Purple", borderStyle: "border-2 border-purple-500", pointsCost: 0, category: "free" },
  { key: "pink", nameTh: "ชมพู", nameEn: "Pink", borderStyle: "border-2 border-pink-500", pointsCost: 0, category: "free" },
  { key: "cyan", nameTh: "ฟ้าน้ำทะเล", nameEn: "Cyan", borderStyle: "border-2 border-cyan-500", pointsCost: 0, category: "free" },
  { key: "yellow", nameTh: "เหลือง", nameEn: "Yellow", borderStyle: "border-2 border-yellow-500", pointsCost: 0, category: "free" },
  { key: "red", nameTh: "แดง", nameEn: "Red", borderStyle: "border-2 border-red-500", pointsCost: 0, category: "free" },
  { key: "white", nameTh: "ขาว", nameEn: "White", borderStyle: "border-2 border-white", pointsCost: 0, category: "free" },
  // Premium frames (cost points)
  { key: "fire", nameTh: "เปลวไฟ", nameEn: "Fire", borderStyle: "border-3 border-orange-500", glowColor: "rgba(249,115,22,0.5)", pointsCost: 500, category: "premium" },
  { key: "ice", nameTh: "น้ำแข็ง", nameEn: "Ice", borderStyle: "border-3 border-cyan-400", glowColor: "rgba(34,211,238,0.5)", pointsCost: 500, category: "premium" },
  { key: "gold", nameTh: "ทอง", nameEn: "Gold", borderStyle: "border-3 border-yellow-400", glowColor: "rgba(250,204,21,0.5)", pointsCost: 1000, category: "premium" },
  { key: "diamond", nameTh: "เพชร", nameEn: "Diamond", borderStyle: "border-3 border-white", glowColor: "rgba(255,255,255,0.5)", pointsCost: 2000, category: "premium" },
  { key: "rainbow", nameTh: "สายรุ้ง", nameEn: "Rainbow", borderStyle: "border-3 border-transparent", glowColor: "linear-gradient(45deg, #f97316, #a855f7, #3b82f6, #22c55e)", pointsCost: 3000, category: "premium" },
  { key: "neon_pink", nameTh: "นีออนชมพู", nameEn: "Neon Pink", borderStyle: "border-3 border-pink-400", glowColor: "rgba(236,72,153,0.6)", pointsCost: 800, category: "premium" },
  { key: "emerald", nameTh: "มรกต", nameEn: "Emerald", borderStyle: "border-3 border-emerald-400", glowColor: "rgba(52,211,153,0.5)", pointsCost: 800, category: "premium" },
  { key: "thunder", nameTh: "สายฟ้า", nameEn: "Thunder", borderStyle: "border-3 border-yellow-300", glowColor: "rgba(253,224,71,0.6)", pointsCost: 1500, category: "premium" },
  { key: "shadow", nameTh: "เงา", nameEn: "Shadow", borderStyle: "border-3 border-gray-800", glowColor: "rgba(0,0,0,0.8)", pointsCost: 600, category: "premium" },
  { key: "legendary", nameTh: "ตำนาน", nameEn: "Legendary", borderStyle: "border-4 border-yellow-500", glowColor: "rgba(234,179,8,0.7)", pointsCost: 5000, category: "premium" },
];

export function getFrame(key: string): AvatarFrame {
  return AVATAR_FRAMES.find(f => f.key === key) || AVATAR_FRAMES[0];
}

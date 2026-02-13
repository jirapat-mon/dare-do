// Thai Provinces — 77 provinces with regions, codes, and hex grid positions

export interface Province {
  code: string;
  nameTh: string;
  nameEn: string;
  region: "north" | "northeast" | "central" | "east" | "west" | "south";
  row: number;
  col: number;
}

export const REGIONS = {
  north: { nameTh: "ภาคเหนือ", nameEn: "North", color: "#22c55e" },
  northeast: { nameTh: "ภาคตะวันออกเฉียงเหนือ", nameEn: "Northeast", color: "#3b82f6" },
  central: { nameTh: "ภาคกลาง", nameEn: "Central", color: "#f97316" },
  east: { nameTh: "ภาคตะวันออก", nameEn: "East", color: "#a855f7" },
  west: { nameTh: "ภาคตะวันตก", nameEn: "West", color: "#ec4899" },
  south: { nameTh: "ภาคใต้", nameEn: "South", color: "#06b6d4" },
} as const;

export type RegionKey = keyof typeof REGIONS;

export const PROVINCES: Province[] = [
  // ภาคเหนือ (North) — 9
  { code: "MSN", nameTh: "แม่ฮ่องสอน", nameEn: "Mae Hong Son", region: "north", row: 0, col: 0 },
  { code: "CRI", nameTh: "เชียงราย", nameEn: "Chiang Rai", region: "north", row: 0, col: 2 },
  { code: "CMI", nameTh: "เชียงใหม่", nameEn: "Chiang Mai", region: "north", row: 1, col: 1 },
  { code: "LPN", nameTh: "ลำพูน", nameEn: "Lamphun", region: "north", row: 1, col: 2 },
  { code: "PYO", nameTh: "พะเยา", nameEn: "Phayao", region: "north", row: 1, col: 3 },
  { code: "NAN", nameTh: "น่าน", nameEn: "Nan", region: "north", row: 1, col: 4 },
  { code: "LPG", nameTh: "ลำปาง", nameEn: "Lampang", region: "north", row: 2, col: 1 },
  { code: "PRE", nameTh: "แพร่", nameEn: "Phrae", region: "north", row: 2, col: 2 },
  { code: "UTD", nameTh: "อุตรดิตถ์", nameEn: "Uttaradit", region: "north", row: 2, col: 3 },
  // ภาคตะวันออกเฉียงเหนือ (Northeast) — 20
  { code: "LEI", nameTh: "เลย", nameEn: "Loei", region: "northeast", row: 3, col: 4 },
  { code: "NBP", nameTh: "หนองบัวลำภู", nameEn: "Nong Bua Lam Phu", region: "northeast", row: 3, col: 5 },
  { code: "UDN", nameTh: "อุดรธานี", nameEn: "Udon Thani", region: "northeast", row: 3, col: 6 },
  { code: "NKI", nameTh: "หนองคาย", nameEn: "Nong Khai", region: "northeast", row: 3, col: 7 },
  { code: "BKN", nameTh: "บึงกาฬ", nameEn: "Bueng Kan", region: "northeast", row: 3, col: 8 },
  { code: "CPM", nameTh: "ชัยภูมิ", nameEn: "Chaiyaphum", region: "northeast", row: 4, col: 4 },
  { code: "KKN", nameTh: "ขอนแก่น", nameEn: "Khon Kaen", region: "northeast", row: 4, col: 5 },
  { code: "KSN", nameTh: "กาฬสินธุ์", nameEn: "Kalasin", region: "northeast", row: 4, col: 6 },
  { code: "SNK", nameTh: "สกลนคร", nameEn: "Sakon Nakhon", region: "northeast", row: 4, col: 7 },
  { code: "NPM", nameTh: "นครพนม", nameEn: "Nakhon Phanom", region: "northeast", row: 4, col: 8 },
  { code: "NMA", nameTh: "นครราชสีมา", nameEn: "Nakhon Ratchasima", region: "northeast", row: 5, col: 4 },
  { code: "MKM", nameTh: "มหาสารคาม", nameEn: "Maha Sarakham", region: "northeast", row: 5, col: 5 },
  { code: "RET", nameTh: "ร้อยเอ็ด", nameEn: "Roi Et", region: "northeast", row: 5, col: 6 },
  { code: "YST", nameTh: "ยโสธร", nameEn: "Yasothon", region: "northeast", row: 5, col: 7 },
  { code: "MDH", nameTh: "มุกดาหาร", nameEn: "Mukdahan", region: "northeast", row: 5, col: 8 },
  { code: "BRM", nameTh: "บุรีรัมย์", nameEn: "Buri Ram", region: "northeast", row: 6, col: 5 },
  { code: "SRN", nameTh: "สุรินทร์", nameEn: "Surin", region: "northeast", row: 6, col: 6 },
  { code: "SSK", nameTh: "ศรีสะเกษ", nameEn: "Si Sa Ket", region: "northeast", row: 6, col: 7 },
  { code: "ACR", nameTh: "อำนาจเจริญ", nameEn: "Amnat Charoen", region: "northeast", row: 6, col: 8 },
  { code: "UBN", nameTh: "อุบลราชธานี", nameEn: "Ubon Ratchathani", region: "northeast", row: 7, col: 8 },
  // ภาคกลาง (Central) — 22
  { code: "TAK", nameTh: "ตาก", nameEn: "Tak", region: "central", row: 3, col: 0 },
  { code: "STI", nameTh: "สุโขทัย", nameEn: "Sukhothai", region: "central", row: 3, col: 1 },
  { code: "PLK", nameTh: "พิษณุโลก", nameEn: "Phitsanulok", region: "central", row: 3, col: 2 },
  { code: "PNB", nameTh: "เพชรบูรณ์", nameEn: "Phetchabun", region: "central", row: 3, col: 3 },
  { code: "KPT", nameTh: "กำแพงเพชร", nameEn: "Kamphaeng Phet", region: "central", row: 4, col: 1 },
  { code: "PCT", nameTh: "พิจิตร", nameEn: "Phichit", region: "central", row: 4, col: 2 },
  { code: "NSW", nameTh: "นครสวรรค์", nameEn: "Nakhon Sawan", region: "central", row: 4, col: 3 },
  { code: "UTI", nameTh: "อุทัยธานี", nameEn: "Uthai Thani", region: "central", row: 5, col: 1 },
  { code: "CNT", nameTh: "ชัยนาท", nameEn: "Chai Nat", region: "central", row: 5, col: 2 },
  { code: "LRI", nameTh: "ลพบุรี", nameEn: "Lop Buri", region: "central", row: 5, col: 3 },
  { code: "SPB", nameTh: "สุพรรณบุรี", nameEn: "Suphan Buri", region: "central", row: 6, col: 1 },
  { code: "ATG", nameTh: "อ่างทอง", nameEn: "Ang Thong", region: "central", row: 6, col: 2 },
  { code: "SBR", nameTh: "สิงห์บุรี", nameEn: "Sing Buri", region: "central", row: 6, col: 3 },
  { code: "SRI", nameTh: "สระบุรี", nameEn: "Saraburi", region: "central", row: 6, col: 4 },
  { code: "NPT", nameTh: "นครปฐม", nameEn: "Nakhon Pathom", region: "central", row: 7, col: 1 },
  { code: "AYA", nameTh: "พระนครศรีอยุธยา", nameEn: "Ayutthaya", region: "central", row: 7, col: 2 },
  { code: "NBI", nameTh: "นนทบุรี", nameEn: "Nonthaburi", region: "central", row: 7, col: 3 },
  { code: "PTE", nameTh: "ปทุมธานี", nameEn: "Pathum Thani", region: "central", row: 7, col: 4 },
  { code: "NYK", nameTh: "นครนายก", nameEn: "Nakhon Nayok", region: "central", row: 7, col: 5 },
  { code: "BKK", nameTh: "กรุงเทพฯ", nameEn: "Bangkok", region: "central", row: 8, col: 2 },
  { code: "SKN", nameTh: "สมุทรสาคร", nameEn: "Samut Sakhon", region: "central", row: 8, col: 1 },
  { code: "SPK", nameTh: "สมุทรปราการ", nameEn: "Samut Prakan", region: "central", row: 8, col: 3 },
  // ภาคตะวันออก (East) — 7
  { code: "SKW", nameTh: "สระแก้ว", nameEn: "Sa Kaeo", region: "east", row: 7, col: 6 },
  { code: "PRI", nameTh: "ปราจีนบุรี", nameEn: "Prachin Buri", region: "east", row: 7, col: 7 },
  { code: "CCO", nameTh: "ฉะเชิงเทรา", nameEn: "Chachoengsao", region: "east", row: 8, col: 4 },
  { code: "CBI", nameTh: "ชลบุรี", nameEn: "Chon Buri", region: "east", row: 8, col: 5 },
  { code: "RYG", nameTh: "ระยอง", nameEn: "Rayong", region: "east", row: 9, col: 5 },
  { code: "CTI", nameTh: "จันทบุรี", nameEn: "Chanthaburi", region: "east", row: 9, col: 6 },
  { code: "TRT", nameTh: "ตราด", nameEn: "Trat", region: "east", row: 9, col: 7 },
  // ภาคตะวันตก (West) — 5
  { code: "KRI", nameTh: "กาญจนบุรี", nameEn: "Kanchanaburi", region: "west", row: 6, col: 0 },
  { code: "RBR", nameTh: "ราชบุรี", nameEn: "Ratchaburi", region: "west", row: 8, col: 0 },
  { code: "SKM", nameTh: "สมุทรสงคราม", nameEn: "Samut Songkhram", region: "west", row: 9, col: 0 },
  { code: "PBI", nameTh: "เพชรบุรี", nameEn: "Phetchaburi", region: "west", row: 9, col: 1 },
  { code: "PKN", nameTh: "ประจวบคีรีขันธ์", nameEn: "Prachuap Khiri Khan", region: "west", row: 10, col: 1 },
  // ภาคใต้ (South) — 14
  { code: "CPN", nameTh: "ชุมพร", nameEn: "Chumphon", region: "south", row: 11, col: 1 },
  { code: "RNG", nameTh: "ระนอง", nameEn: "Ranong", region: "south", row: 11, col: 0 },
  { code: "SNI", nameTh: "สุราษฎร์ธานี", nameEn: "Surat Thani", region: "south", row: 12, col: 1 },
  { code: "PNA", nameTh: "พังงา", nameEn: "Phang Nga", region: "south", row: 12, col: 0 },
  { code: "PKT", nameTh: "ภูเก็ต", nameEn: "Phuket", region: "south", row: 13, col: 0 },
  { code: "KBI", nameTh: "กระบี่", nameEn: "Krabi", region: "south", row: 13, col: 1 },
  { code: "NST", nameTh: "นครศรีธรรมราช", nameEn: "Nakhon Si Thammarat", region: "south", row: 13, col: 2 },
  { code: "TRG", nameTh: "ตรัง", nameEn: "Trang", region: "south", row: 14, col: 1 },
  { code: "PLG", nameTh: "พัทลุง", nameEn: "Phatthalung", region: "south", row: 14, col: 2 },
  { code: "STN", nameTh: "สตูล", nameEn: "Satun", region: "south", row: 15, col: 1 },
  { code: "SKA", nameTh: "สงขลา", nameEn: "Songkhla", region: "south", row: 15, col: 2 },
  { code: "PTN", nameTh: "ปัตตานี", nameEn: "Pattani", region: "south", row: 15, col: 3 },
  { code: "YLA", nameTh: "ยะลา", nameEn: "Yala", region: "south", row: 16, col: 2 },
  { code: "NWT", nameTh: "นราธิวาส", nameEn: "Narathiwat", region: "south", row: 16, col: 3 },
];

export const GRID_ROWS = 17;
export const GRID_COLS = 9;

export function getProvince(code: string): Province | undefined {
  return PROVINCES.find((p) => p.code === code);
}

export function getProvincesByRegion(region: RegionKey): Province[] {
  return PROVINCES.filter((p) => p.region === region);
}

export function getProvinceOptions(): { value: string; label: string; labelEn: string }[] {
  return PROVINCES
    .sort((a, b) => a.nameTh.localeCompare(b.nameTh, "th"))
    .map((p) => ({ value: p.code, label: p.nameTh, labelEn: p.nameEn }));
}

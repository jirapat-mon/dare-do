// Thailand province SVG polygon paths
// Simplified but geographically recognizable coordinates
// viewBox: 0 0 500 800
// Each province is a polygon with approximate geographic positions

export interface ProvinceMapPath {
  code: string;
  // SVG polygon points string "x1,y1 x2,y2 ..."
  points: string;
  // Center point for label placement
  cx: number;
  cy: number;
}

export const PROVINCE_PATHS: ProvinceMapPath[] = [
  // =============================================
  // NORTH (ภาคเหนือ) — 9 provinces
  // =============================================
  // Mae Hong Son (MSN) — far west, bordering Myanmar
  { code: "MSN", points: "80,40 100,30 115,45 118,70 115,100 105,115 85,110 70,90 65,60", cx: 92, cy: 72 },
  // Chiang Rai (CRI) — far north, bordering Laos/Myanmar
  { code: "CRI", points: "175,5 200,0 225,5 240,20 235,50 220,60 200,55 185,60 170,50 165,30", cx: 202, cy: 32 },
  // Chiang Mai (CMI) — large province below Mae Hong Son/Chiang Rai
  { code: "CMI", points: "115,45 140,35 170,30 170,50 185,60 180,80 170,100 150,110 130,105 118,95 115,100 118,70", cx: 148, cy: 72 },
  // Lamphun (LPN) — small province south of Chiang Mai
  { code: "LPN", points: "150,110 170,100 180,110 178,130 165,140 148,135 140,120", cx: 162, cy: 120 },
  // Phayao (PYO) — east of Chiang Rai
  { code: "PYO", points: "220,60 235,50 248,60 250,80 240,95 225,90 215,80", cx: 233, cy: 74 },
  // Nan (NAN) — far northeast of north region, bordering Laos
  { code: "NAN", points: "248,60 270,45 290,55 295,80 285,110 270,120 255,110 245,95 250,80", cx: 270, cy: 82 },
  // Lampang (LPG) — central north
  { code: "LPG", points: "170,100 180,80 215,80 225,90 220,110 200,120 180,130 170,120 165,110", cx: 195, cy: 105 },
  // Phrae (PRE) — east of Lampang
  { code: "PRE", points: "225,90 240,95 250,105 248,125 235,135 220,130 220,110", cx: 234, cy: 112 },
  // Uttaradit (UTD) — southeast of Phrae
  { code: "UTD", points: "250,105 255,110 270,120 275,140 260,155 245,150 235,140 235,135 248,125", cx: 255, cy: 132 },

  // =============================================
  // NORTHEAST (ภาคตะวันออกเฉียงเหนือ) — 20 provinces
  // =============================================
  // Loei (LEI) — west of northeast, bordering Laos
  { code: "LEI", points: "275,140 290,130 310,135 320,155 310,175 295,180 280,175 270,160 260,155", cx: 290, cy: 158 },
  // Nong Bua Lam Phu (NBP)
  { code: "NBP", points: "310,175 320,155 340,155 350,170 345,185 330,190 315,185", cx: 330, cy: 174 },
  // Udon Thani (UDN) — large, north-central Isan
  { code: "UDN", points: "340,155 355,140 375,140 390,150 390,170 380,185 365,190 345,185 350,170", cx: 367, cy: 168 },
  // Nong Khai (NKI) — along Mekong, bordering Laos
  { code: "NKI", points: "320,125 340,115 365,115 385,120 390,135 390,150 375,140 355,140 340,155 320,155 310,135", cx: 355, cy: 135 },
  // Bueng Kan (BKN) — far northeast along Mekong
  { code: "BKN", points: "390,115 410,105 435,110 445,125 440,140 425,145 405,140 390,135 385,120", cx: 418, cy: 126 },
  // Chaiyaphum (CPM) — west of Isan
  { code: "CPM", points: "280,195 295,180 310,195 330,190 340,200 335,225 320,235 300,230 285,220", cx: 310, cy: 210 },
  // Khon Kaen (KKN) — center of Isan
  { code: "KKN", points: "330,190 345,185 365,190 375,200 370,225 355,235 340,230 335,225 340,200", cx: 354, cy: 210 },
  // Kalasin (KSN)
  { code: "KSN", points: "375,200 390,195 405,200 405,225 395,235 380,235 370,225", cx: 389, cy: 216 },
  // Sakon Nakhon (SNK) — north-central Isan
  { code: "SNK", points: "390,170 405,160 425,160 440,170 435,190 420,200 405,200 390,195 380,185", cx: 412, cy: 182 },
  // Nakhon Phanom (NPM) — east, along Mekong
  { code: "NPM", points: "425,160 440,155 455,160 460,180 455,200 440,205 425,200 420,200 435,190 440,170", cx: 442, cy: 180 },
  // Nakhon Ratchasima (NMA) — Korat, large southern Isan
  { code: "NMA", points: "285,240 300,230 320,235 340,240 355,250 350,280 330,290 305,285 285,270", cx: 320, cy: 262 },
  // Maha Sarakham (MKM)
  { code: "MKM", points: "355,235 370,230 385,235 385,255 375,265 360,260 355,250 340,240 340,230", cx: 365, cy: 248 },
  // Roi Et (RET)
  { code: "RET", points: "385,235 395,235 410,235 420,250 415,270 400,275 390,270 385,255", cx: 400, cy: 255 },
  // Yasothon (YST)
  { code: "YST", points: "420,250 430,240 445,245 448,265 440,275 425,275 415,270", cx: 432, cy: 258 },
  // Mukdahan (MDH) — east, along Mekong
  { code: "MDH", points: "440,205 455,200 465,215 462,240 448,250 445,245 430,240 420,230 420,220 425,200", cx: 445, cy: 226 },
  // Buri Ram (BRM)
  { code: "BRM", points: "330,290 350,280 365,290 370,310 355,320 335,315 325,305", cx: 348, cy: 302 },
  // Surin (SRN)
  { code: "SRN", points: "365,290 380,280 400,285 405,305 395,318 375,320 370,310", cx: 385, cy: 302 },
  // Si Sa Ket (SSK)
  { code: "SSK", points: "400,285 415,278 435,285 438,305 425,318 410,318 405,305", cx: 418, cy: 300 },
  // Amnat Charoen (ACR)
  { code: "ACR", points: "440,275 455,268 468,278 465,298 455,305 445,300 435,285 448,265", cx: 452, cy: 284 },
  // Ubon Ratchathani (UBN) — large, far southeast Isan
  { code: "UBN", points: "425,318 438,305 455,305 468,298 480,310 478,340 460,350 440,345 425,335", cx: 452, cy: 325 },

  // =============================================
  // CENTRAL (ภาคกลาง) — 22 provinces
  // =============================================
  // Tak (TAK) — large, western border
  { code: "TAK", points: "80,130 105,115 115,125 130,130 140,150 130,180 120,200 100,210 80,200 65,170 70,145", cx: 102, cy: 165 },
  // Sukhothai (STI)
  { code: "STI", points: "170,120 180,130 200,135 210,150 200,165 185,170 170,160 160,145 165,130", cx: 185, cy: 148 },
  // Phitsanulok (PLK)
  { code: "PLK", points: "200,135 220,130 235,140 245,155 245,170 230,180 215,175 200,165 210,150", cx: 222, cy: 156 },
  // Phetchabun (PNB) — large, straddles central/northeast
  { code: "PNB", points: "245,155 260,155 275,160 280,175 280,195 270,210 255,215 240,205 235,185 230,180 245,170", cx: 258, cy: 185 },
  // Kamphaeng Phet (KPT)
  { code: "KPT", points: "140,150 155,145 170,150 175,170 165,185 150,190 135,180 130,165", cx: 155, cy: 168 },
  // Phichit (PCT)
  { code: "PCT", points: "175,170 190,165 210,170 215,190 205,200 190,205 178,195 170,185", cx: 192, cy: 185 },
  // Nakhon Sawan (NSW) — junction of rivers
  { code: "NSW", points: "215,190 230,180 240,195 255,215 245,230 225,235 210,225 200,210 205,200", cx: 225, cy: 212 },
  // Uthai Thani (UTI)
  { code: "UTI", points: "135,195 150,190 165,200 168,220 155,235 140,230 130,215", cx: 150, cy: 215 },
  // Chai Nat (CNT)
  { code: "CNT", points: "168,220 180,210 200,215 205,230 195,245 178,245 168,235", cx: 186, cy: 230 },
  // Lop Buri (LRI)
  { code: "LRI", points: "210,225 225,220 245,230 255,240 250,260 235,270 218,265 210,250", cx: 232, cy: 245 },
  // Suphan Buri (SPB)
  { code: "SPB", points: "140,245 155,235 170,240 178,260 170,280 155,285 140,275 135,260", cx: 157, cy: 262 },
  // Ang Thong (ATG) — small
  { code: "ATG", points: "178,260 195,255 205,265 200,280 188,285 178,278", cx: 190, cy: 270 },
  // Sing Buri (SBR) — small
  { code: "SBR", points: "195,245 210,240 220,250 215,265 205,265 195,255", cx: 207, cy: 254 },
  // Saraburi (SRI)
  { code: "SRI", points: "235,255 250,250 265,258 268,278 255,290 240,285 232,272 235,270", cx: 250, cy: 272 },
  // Nakhon Pathom (NPT)
  { code: "NPT", points: "135,300 155,290 170,295 175,310 168,325 150,328 138,318", cx: 155, cy: 310 },
  // Ayutthaya (AYA)
  { code: "AYA", points: "185,285 200,280 215,285 220,300 210,312 195,315 185,305", cx: 200, cy: 298 },
  // Nonthaburi (NBI) — small, near Bangkok
  { code: "NBI", points: "175,310 190,305 200,312 198,325 185,330 175,322", cx: 187, cy: 317 },
  // Pathum Thani (PTE)
  { code: "PTE", points: "200,300 215,295 228,302 230,318 220,328 205,325 200,312", cx: 214, cy: 313 },
  // Nakhon Nayok (NYK)
  { code: "NYK", points: "255,290 270,285 285,295 282,312 270,318 258,310", cx: 270, cy: 302 },
  // Bangkok (BKK) — small but important
  { code: "BKK", points: "185,335 200,330 210,335 210,350 200,358 185,355 180,345", cx: 196, cy: 345 },
  // Samut Sakhon (SKN) — small, coastal
  { code: "SKN", points: "165,340 178,335 185,345 182,358 170,362 162,352", cx: 174, cy: 350 },
  // Samut Prakan (SPK) — small, coastal east of Bangkok
  { code: "SPK", points: "210,350 225,345 235,355 232,368 218,372 208,365", cx: 221, cy: 360 },

  // =============================================
  // EAST (ภาคตะวันออก) — 7 provinces
  // =============================================
  // Sa Kaeo (SKW) — east border, bordering Cambodia
  { code: "SKW", points: "305,295 325,290 340,300 338,325 320,335 305,325 298,310", cx: 320, cy: 312 },
  // Prachin Buri (PRI)
  { code: "PRI", points: "270,295 290,285 305,295 298,320 285,330 270,325 262,310", cx: 283, cy: 308 },
  // Chachoengsao (CCO)
  { code: "CCO", points: "240,330 258,322 270,330 275,350 262,365 245,360 238,345", cx: 256, cy: 345 },
  // Chon Buri (CBI) — coastal, includes Pattaya
  { code: "CBI", points: "258,365 275,355 290,360 295,385 282,400 268,398 255,388 252,375", cx: 274, cy: 380 },
  // Rayong (RYG) — coastal
  { code: "RYG", points: "282,400 295,390 312,395 315,412 300,420 285,415", cx: 298, cy: 406 },
  // Chanthaburi (CTI) — coastal, bordering Cambodia
  { code: "CTI", points: "312,395 330,388 348,395 350,418 335,428 318,422 315,412", cx: 332, cy: 408 },
  // Trat (TRT) — far east, coastal
  { code: "TRT", points: "348,395 368,390 378,400 375,420 360,430 350,425 350,418", cx: 362, cy: 410 },

  // =============================================
  // WEST (ภาคตะวันตก) — 5 provinces
  // =============================================
  // Kanchanaburi (KRI) — large, western border, bordering Myanmar
  { code: "KRI", points: "65,210 80,200 100,210 120,220 135,240 140,260 140,295 125,310 100,320 80,310 60,280 50,250 55,225", cx: 96, cy: 265 },
  // Ratchaburi (RBR)
  { code: "RBR", points: "100,320 125,310 140,320 148,340 140,360 120,365 105,355 95,340", cx: 122, cy: 340 },
  // Samut Songkhram (SKM) — smallest province
  { code: "SKM", points: "148,355 162,352 170,362 165,375 155,378 145,370", cx: 157, cy: 365 },
  // Phetchaburi (PBI) — coastal west
  { code: "PBI", points: "105,370 120,365 140,370 145,395 132,412 115,415 100,400 98,385", cx: 120, cy: 392 },
  // Prachuap Khiri Khan (PKN) — long narrow coastal
  { code: "PKN", points: "100,415 115,415 132,420 138,450 135,480 125,510 110,520 95,505 88,470 90,440", cx: 114, cy: 468 },

  // =============================================
  // SOUTH (ภาคใต้) — 14 provinces
  // =============================================
  // Chumphon (CPN)
  { code: "CPN", points: "110,530 125,520 140,528 148,555 140,575 125,580 112,568 105,548", cx: 126, cy: 552 },
  // Ranong (RNG) — west coast, narrow
  { code: "RNG", points: "82,520 95,515 108,525 105,548 98,565 85,560 75,545 76,530", cx: 92, cy: 540 },
  // Surat Thani (SNI) — large, includes Samui
  { code: "SNI", points: "98,580 115,575 135,578 155,585 162,610 150,630 130,635 110,628 95,610", cx: 128, cy: 605 },
  // Phang Nga (PNA) — west coast
  { code: "PNA", points: "72,590 85,580 100,588 98,615 88,635 75,638 65,625 62,605", cx: 80, cy: 610 },
  // Phuket (PKT) — island
  { code: "PKT", points: "55,650 68,645 75,655 72,672 62,678 52,668", cx: 64, cy: 662 },
  // Krabi (KBI) — coastal
  { code: "KBI", points: "88,640 105,632 118,640 122,665 112,678 95,675 85,660", cx: 104, cy: 658 },
  // Nakhon Si Thammarat (NST) — large, east coast
  { code: "NST", points: "130,638 150,632 168,640 178,660 172,685 155,695 135,690 122,672 122,655", cx: 150, cy: 665 },
  // Trang (TRG) — south-west coast
  { code: "TRG", points: "95,685 112,680 125,690 128,712 118,725 102,722 90,710", cx: 110, cy: 705 },
  // Phatthalung (PLG)
  { code: "PLG", points: "130,695 145,690 158,698 160,718 148,728 135,725 128,712", cx: 145, cy: 712 },
  // Satun (STN) — far south-west
  { code: "STN", points: "85,730 100,725 115,730 118,750 108,762 92,758 82,745", cx: 100, cy: 745 },
  // Songkhla (SKA) — includes Hat Yai
  { code: "SKA", points: "135,728 148,725 165,730 172,750 165,770 148,775 135,765 130,748", cx: 150, cy: 750 },
  // Pattani (PTN)
  { code: "PTN", points: "172,750 188,745 200,755 198,772 185,780 172,775 165,770", cx: 184, cy: 764 },
  // Yala (YLA) — far south
  { code: "YLA", points: "148,778 165,775 178,782 180,798 168,808 152,805 142,795", cx: 162, cy: 792 },
  // Narathiwat (NWT) — far south-east
  { code: "NWT", points: "180,780 198,775 212,785 210,805 198,815 185,810 178,798", cx: 195, cy: 795 },
];

// Additional connecting lines/shapes for borders (optional decorative)
// These can be used to draw region boundaries or coastlines
export const THAILAND_OUTLINE = "M80,40 L100,30 L140,35 L175,5 L200,0 L225,5 L240,20 L270,45 L295,80 L310,135 L320,125 L365,115 L410,105 L445,125 L460,180 L468,278 L480,310 L478,340 L460,350 L440,345 L425,335 L438,305 L405,305 L395,318 L375,320 L355,320 L335,315 L325,305 L340,300 L338,325 L320,335 L305,325 L290,360 L295,385 L315,412 L350,418 L375,420 L378,400 L368,390 L348,395 L330,388 L312,395 L295,390 L282,400 L268,398 L255,388 L252,375 L245,360 L238,345 L232,368 L218,372 L208,365 L200,358 L182,358 L170,362 L155,378 L145,370 L140,360 L120,365 L105,370 L100,400 L90,440 L88,470 L95,505 L110,520 L82,520 L75,545 L72,590 L62,605 L55,650 L52,668 L62,678 L72,672 L75,655 L88,640 L85,660 L90,710 L82,745 L92,758 L108,762 L118,750 L115,730 L128,712 L130,748 L135,765 L148,775 L152,805 L168,808 L180,798 L198,815 L212,785 L200,755 L188,745 L172,750 L165,730 L178,660 L168,640 L162,610 L155,585 L148,555 L140,528 L135,480 L138,450 L132,420 L132,412 L140,395 L145,395 L148,340 L140,320 L125,310 L100,320 L80,310 L60,280 L50,250 L55,225 L65,210 L70,145 L65,60 L80,40";

// ViewBox dimensions
export const MAP_VIEWBOX = "0 0 500 820";
export const MAP_WIDTH = 500;
export const MAP_HEIGHT = 820;

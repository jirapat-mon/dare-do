import Link from "next/link";

export const metadata = {
  title: "เงื่อนไขการใช้งาน | DareDo",
  description: "ข้อกำหนดและเงื่อนไขการใช้งาน DareDo - แพลตฟอร์มสัญญาผูกมัดตนเอง",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white">
      {/* Header */}
      <div className="border-b border-[#1A1A1A] py-6 px-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Link
            href="/"
            className="text-orange-500 hover:text-orange-400 transition text-sm"
          >
            ← กลับหน้าหลัก
          </Link>
          <h1 className="text-2xl font-bold">เงื่อนไขการใช้งาน</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Important Notice */}
        <div className="bg-[#111111] border border-orange-500/30 rounded-2xl p-6 mb-12">
          <p className="text-orange-500 font-bold text-lg mb-2">
            ข้อความสำคัญ
          </p>
          <p className="text-gray-300 leading-relaxed">
            DareDo เป็น<span className="text-white font-semibold">แพลตฟอร์มสัญญาผูกมัดตนเอง (Self-Commitment Contract Platform)</span>{" "}
            ที่ใช้หลักจิตวิทยา Loss Aversion เป็นแรงจูงใจในการสร้างวินัย{" "}
            <span className="text-orange-500 font-semibold">
              ไม่ใช่การพนันหรือเกมเสี่ยงโชคในทุกกรณี
            </span>
          </p>
        </div>

        {/* Section 1 */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-orange-500 mb-4 flex items-center gap-3">
            <span className="w-8 h-8 bg-orange-500 text-black rounded-full flex items-center justify-center text-sm font-black">
              1
            </span>
            คำจำกัดความและลักษณะของบริการ
          </h2>
          <div className="text-gray-300 leading-relaxed space-y-4 pl-11">
            <p>
              DareDo คือแพลตฟอร์มออนไลน์ที่ให้บริการ &quot;สัญญาผูกมัดตนเอง&quot;
              (Self-Commitment Contract) โดยผู้ใช้สามารถตั้งเป้าหมายส่วนบุคคล
              และวางเงินมัดจำเป็นแรงจูงใจในการบรรลุเป้าหมาย
            </p>
            <p>
              เงินมัดจำที่วางไว้จะถูกคืนให้แก่
              <span className="text-white font-semibold"> ผู้ใช้คนเดิม </span>
              เมื่อทำภารกิจสำเร็จตามเงื่อนไข (หักค่าบริการ 10%)
              ไม่มีการส่งต่อเงินไปยังบุคคลอื่น
            </p>
          </div>
        </section>

        {/* Section 2 */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-orange-500 mb-4 flex items-center gap-3">
            <span className="w-8 h-8 bg-orange-500 text-black rounded-full flex items-center justify-center text-sm font-black">
              2
            </span>
            ไม่ใช่การพนัน — เหตุผลทางกฎหมาย
          </h2>
          <div className="text-gray-300 leading-relaxed space-y-4 pl-11">
            <div className="bg-[#111111] border border-[#1A1A1A] rounded-xl p-5 space-y-3">
              <div className="flex items-start gap-3">
                <span className="text-green-500 mt-1">✓</span>
                <p>
                  <strong className="text-white">ไม่มีการเดิมพันระหว่างบุคคล</strong>{" "}
                  — ผู้ใช้วางเงินมัดจำกับตนเอง ไม่มีคู่แข่งหรืออีกฝ่าย
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-green-500 mt-1">✓</span>
                <p>
                  <strong className="text-white">ไม่มีองค์ประกอบของโชคหรือดวง</strong>{" "}
                  — ผลลัพธ์ขึ้นอยู่กับการกระทำของผู้ใช้ 100%
                  ไม่มีการสุ่มหรือปัจจัยภายนอก
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-green-500 mt-1">✓</span>
                <p>
                  <strong className="text-white">เงินคืนสู่ผู้ใช้คนเดิม</strong>{" "}
                  — ไม่มีการย้ายเงินจากผู้แพ้ไปผู้ชนะ
                  เงินมัดจำจะคืนให้ผู้ใช้ที่ทำสำเร็จ
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-green-500 mt-1">✓</span>
                <p>
                  <strong className="text-white">ค่าธรรมเนียม 10% เป็นค่าบริการ</strong>{" "}
                  — เป็นค่าดำเนินการแพลตฟอร์ม
                  ไม่ใช่ส่วนต่างกำไรจากการพนัน
                </p>
              </div>
            </div>
            <p className="text-gray-400 text-sm italic">
              อ้างอิง: พ.ร.บ.การพนัน พ.ศ. 2478 กำหนดว่าการพนันต้องมีองค์ประกอบ
              &quot;การเสี่ยงโชค&quot; และ &quot;การเดิมพันระหว่างบุคคล&quot; ซึ่ง DareDo
              ไม่มีองค์ประกอบทั้งสองดังกล่าว
            </p>
          </div>
        </section>

        {/* Section 3 */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-orange-500 mb-4 flex items-center gap-3">
            <span className="w-8 h-8 bg-orange-500 text-black rounded-full flex items-center justify-center text-sm font-black">
              3
            </span>
            เงื่อนไขการใช้งาน
          </h2>
          <div className="text-gray-300 leading-relaxed space-y-4 pl-11">
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-orange-500">•</span>
                ผู้ใช้ต้องมีอายุ <strong className="text-white">18 ปีขึ้นไป</strong>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-500">•</span>
                ผู้ใช้ต้องลงทะเบียนด้วยอีเมลจริงและข้อมูลที่ถูกต้อง
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-500">•</span>
                เป้าหมายที่ตั้งต้องเป็นกิจกรรมที่ถูกกฎหมายและไม่เป็นอันตราย
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-500">•</span>
                หลักฐานที่ส่งต้องเป็นรูปภาพจริง ถ่ายในวันที่กำหนด
                พร้อมรหัสประจำวัน
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-500">•</span>
                ห้ามใช้รูปเก่าหรือรูปตัดต่อ (ถือเป็นการฝ่าฝืนเงื่อนไข)
              </li>
            </ul>
          </div>
        </section>

        {/* Section 4 */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-orange-500 mb-4 flex items-center gap-3">
            <span className="w-8 h-8 bg-orange-500 text-black rounded-full flex items-center justify-center text-sm font-black">
              4
            </span>
            นโยบายการเงินและการคืนเงิน
          </h2>
          <div className="text-gray-300 leading-relaxed space-y-4 pl-11">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#111111] border border-green-500/20 rounded-xl p-5">
                <p className="text-green-500 font-bold mb-2">
                  ทำสำเร็จ ✓
                </p>
                <p>
                  ได้รับเงินมัดจำคืน 90% (หักค่าบริการแพลตฟอร์ม 10%)
                  ภายใน 7 วันทำการ
                </p>
              </div>
              <div className="bg-[#111111] border border-red-500/20 rounded-xl p-5">
                <p className="text-red-500 font-bold mb-2">
                  ไม่สำเร็จ ✗
                </p>
                <p>
                  เงินมัดจำถูกยึดเข้าระบบทั้งหมด
                  ตามสัญญาที่ผู้ใช้ยอมรับก่อนเริ่มต้น
                </p>
              </div>
            </div>
            <p className="text-gray-400 text-sm">
              การชำระเงินรองรับ: บัตรเครดิต, บัตรเดบิต (Visa/Mastercard/JCB)
              และ QR Code PromptPay
            </p>
          </div>
        </section>

        {/* Section 5 */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-orange-500 mb-4 flex items-center gap-3">
            <span className="w-8 h-8 bg-orange-500 text-black rounded-full flex items-center justify-center text-sm font-black">
              5
            </span>
            ข้อจำกัดความรับผิด
          </h2>
          <div className="text-gray-300 leading-relaxed space-y-4 pl-11">
            <p>
              DareDo เป็นเพียงเครื่องมือช่วยสร้างวินัยส่วนบุคคล
              แพลตฟอร์มไม่รับผิดชอบต่อผลลัพธ์ของเป้าหมายที่ผู้ใช้ตั้งไว้
              และไม่รับประกันว่าผู้ใช้จะบรรลุเป้าหมาย
            </p>
            <p>
              การตัดสินว่าหลักฐานผ่านหรือไม่ผ่าน
              เป็นดุลยพินิจของทีมงานตรวจสอบ (Admin)
              ซึ่งจะพิจารณาตามเกณฑ์ที่กำหนดอย่างเป็นธรรม
            </p>
          </div>
        </section>

        {/* Section 6 */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-orange-500 mb-4 flex items-center gap-3">
            <span className="w-8 h-8 bg-orange-500 text-black rounded-full flex items-center justify-center text-sm font-black">
              6
            </span>
            ความเป็นส่วนตัวและความปลอดภัย
          </h2>
          <div className="text-gray-300 leading-relaxed space-y-4 pl-11">
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-orange-500">•</span>
                ข้อมูลส่วนตัวและรูปภาพหลักฐานจะถูกเก็บรักษาอย่างปลอดภัย
                ด้วยการเข้ารหัส SSL 256-bit
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-500">•</span>
                รูปภาพหลักฐานใช้เพื่อการตรวจสอบเท่านั้น
                จะไม่ถูกเผยแพร่สู่สาธารณะ
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-500">•</span>
                ข้อมูลการชำระเงินถูกประมวลผลผ่านผู้ให้บริการที่ได้มาตรฐาน
                PCI-DSS
              </li>
            </ul>
          </div>
        </section>

        {/* Section 7 */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-orange-500 mb-4 flex items-center gap-3">
            <span className="w-8 h-8 bg-orange-500 text-black rounded-full flex items-center justify-center text-sm font-black">
              7
            </span>
            การระงับข้อพิพาท
          </h2>
          <div className="text-gray-300 leading-relaxed space-y-4 pl-11">
            <p>
              ข้อตกลงนี้อยู่ภายใต้กฎหมายแห่งราชอาณาจักรไทย
              หากมีข้อพิพาทเกิดขึ้น ทั้งสองฝ่ายตกลงที่จะเจรจาหาทางออกร่วมกันก่อน
              หากไม่สามารถตกลงได้ ให้ใช้การอนุญาโตตุลาการตามกฎหมายไทย
            </p>
          </div>
        </section>

        {/* Last Updated */}
        <div className="text-center text-gray-600 text-sm border-t border-[#1A1A1A] pt-8">
          <p>อัปเดตล่าสุด: กุมภาพันธ์ 2025</p>
          <Link
            href="/"
            className="text-orange-500 hover:text-orange-400 transition mt-4 inline-block"
          >
            ← กลับหน้าหลัก
          </Link>
        </div>
      </div>
    </main>
  );
}

import Link from "next/link";

export default function HomePage() {
  return (
    <main className="relative">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 py-20 overflow-hidden">
        {/* Background Gradient Glow */}
        <div className="absolute inset-0 bg-gradient-radial from-orange-primary/10 via-transparent to-transparent opacity-50"></div>
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at center, rgba(255, 107, 0, 0.05) 0%, transparent 70%)",
          }}
        ></div>

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
            กล้าเดิมพัน
            <br />
            <span className="text-orange-500">กับตัวเอง</span>ไหม?
          </h1>

          <p className="text-xl md:text-2xl text-gray-300 mb-4 max-w-3xl mx-auto leading-relaxed">
            วางเงินมัดจำ → ทำภารกิจให้สำเร็จ → ได้เงินคืน
          </p>

          <p className="text-lg md:text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
            หรือ<span className="text-orange-500 font-bold"> เสียทั้งหมด</span>
          </p>

          <Link
            href="/create"
            className="inline-block bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white text-lg md:text-xl font-bold px-10 py-5 rounded-full transition-all duration-300 animate-[glow-pulse_2s_ease-in-out_infinite]"
          >
            สร้างสัญญากับตัวเอง
          </Link>

          <p className="mt-6 text-sm text-gray-500">เริ่มต้นเพียง ฿100</p>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 bg-black">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black text-center mb-16">
            มันทำงาน<span className="text-orange-500">ยังไง?</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-[#111111] border border-[#1A1A1A] rounded-2xl p-8 hover:border-orange-500 transition-all duration-300">
              <div className="text-6xl mb-6">🎯</div>
              <h3 className="text-2xl font-bold mb-4">ตั้งเป้าหมาย</h3>
              <p className="text-gray-400 leading-relaxed">
                เลือกสิ่งที่จะทำ วางเงินเดิมพัน เลือกระยะเวลา
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-[#111111] border border-[#1A1A1A] rounded-2xl p-8 hover:border-orange-500 transition-all duration-300">
              <div className="text-6xl mb-6">📸</div>
              <h3 className="text-2xl font-bold mb-4">ส่งหลักฐานทุกวัน</h3>
              <p className="text-gray-400 leading-relaxed">
                ถ่ายรูปพร้อมรหัสประจำวัน ส่งก่อนเวลาหมด
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-[#111111] border border-[#1A1A1A] rounded-2xl p-8 hover:border-orange-500 transition-all duration-300">
              <div className="text-6xl mb-6">💰</div>
              <h3 className="text-2xl font-bold mb-4">รับเงินคืน</h3>
              <p className="text-gray-400 leading-relaxed">
                ทำสำเร็จครบทุกวัน ได้เงินคืน 90%{" "}
                <span className="text-orange-500 font-semibold">
                  ล้มเหลว เสียทั้งหมด
                </span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 bg-[#0A0A0A] border-t border-orange-500/20">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div>
              <div className="text-4xl md:text-5xl font-black text-orange-500 mb-2">
                87%
              </div>
              <p className="text-gray-400 text-lg">ผู้ใช้ทำสำเร็จ</p>
            </div>

            <div>
              <div className="text-4xl md:text-5xl font-black text-orange-500 mb-2">
                ฿2.5M+
              </div>
              <p className="text-gray-400 text-lg">เงินเดิมพันสะสม</p>
            </div>

            <div>
              <div className="text-4xl md:text-5xl font-black text-orange-500 mb-2">
                10,000+
              </div>
              <p className="text-gray-400 text-lg">สัญญาที่สร้าง</p>
            </div>
          </div>
        </div>
      </section>

      {/* Motivation/Quote Section */}
      <section className="py-32 px-4 bg-black">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-orange-500 text-6xl mb-6">"</div>
          <blockquote className="text-3xl md:text-4xl italic font-light text-gray-200 mb-8 leading-relaxed">
            คนเราไม่กลัวความล้มเหลว...
            <br />
            <span className="text-orange-500 font-normal">แต่กลัวเสียเงิน</span>
          </blockquote>
          <p className="text-gray-500 text-lg">— หลักจิตวิทยา Loss Aversion</p>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-black to-[#0A0A0A]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black mb-12">
            พร้อมท้าทาย<span className="text-orange-500">ตัวเอง</span>ยัง?
          </h2>

          <Link
            href="/create"
            className="inline-block bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white text-lg md:text-xl font-bold px-10 py-5 rounded-full transition-all duration-300 animate-[glow-pulse_2s_ease-in-out_infinite]"
          >
            เริ่มเดิมพันเลย
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-black border-t border-[#1A1A1A]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-6">
            <p className="text-gray-500 mb-4">© 2025 DareDo. All rights reserved.</p>
            <div className="flex justify-center gap-6 text-sm">
              <Link
                href="/about"
                className="text-gray-500 hover:text-orange-500 transition"
              >
                เกี่ยวกับเรา
              </Link>
              <Link
                href="/terms"
                className="text-gray-500 hover:text-orange-500 transition"
              >
                เงื่อนไข
              </Link>
              <Link
                href="/contact"
                className="text-gray-500 hover:text-orange-500 transition"
              >
                ติดต่อ
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}

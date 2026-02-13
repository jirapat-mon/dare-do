รายละเอียดโปรเจกต์: "The Discipline Bet" (เว็บแอปสัญญาใจวางเงินมัดจำ)

1. ภาพรวมโปรเจกต์ (Project Overview)
   เว็บแอปที่ช่วยให้คนสร้างวินัยผ่านการ "วางเงินเดิมพันกับตัวเอง"

แนวคิดหลัก: ใช้ความกลัวการสูญเสียเงิน (Loss Aversion) เป็นแรงผลักดัน

รูปแบบ: Mobile-First Web App (Standalone)

ระบบยืนยัน: ผู้ใช้อัปโหลดรูปภาพหลักฐาน และ Admin ตรวจสอบผ่านหน้า Dashboard หลังบ้าน

2. ขั้นตอนการใช้งาน (User Flow)
   เข้าสู่ระบบ: ลงทะเบียน/ล็อกอินผ่าน Email (ใช้ Magic Link หรือ Password)

สร้างสัญญา (The Bet): \* ระบุเป้าหมาย (เช่น "วิ่ง 5 กม.", "ตื่นก่อน 6 โมงเช้า")

ระบุระยะเวลา (เช่น 7 วัน, 30 วัน)

ระบุจำนวนเงินมัดจำ (Stakes)

ชำระเงิน: จ่ายเงินมัดจำผ่านระบบ Stripe หรือ PromptPay (เงินจะถูกเก็บไว้ในระบบ)

ส่งหลักฐานรายวัน: ผู้ใช้อัปโหลดรูปภาพหลักฐานภายในเวลาที่กำหนด (Deadline) ในแต่ละวัน

Admin ตรวจสอบ: Admin เข้าดูรูปที่ส่งมาแล้วกด "อนุมัติ" (Approve) หรือ "ปฏิเสธ" (Reject)

สรุปผล: \* ทำสำเร็จ: ได้เงินคืน (หักค่าธรรมเนียมระบบ 10%)

ทำไม่สำเร็จ: เงินถูกยึดเข้าระบบ

3. โครงสร้างฐานข้อมูล (Database Schema)
   users: id, email, created_at

contracts: id, user_id, goal_name, total_stakes, status (active/success/failed), start_date, end_date, daily_deadline

submissions: id, contract_id, image_url, status (pending/approved/rejected), submitted_at, admin_notes

4. รายละเอียดหน้าจอ (Page Requirements)
   หน้า Landing Page: เน้นคำคมแรงผลักดันและปุ่ม "เริ่มเดิมพันกับตัวเอง"

หน้า Dashboard: แสดงสถานะสัญญาปัจจุบัน, Progress Bar, และปุ่ม "ส่งหลักฐานวันนี้"

หน้าสร้างสัญญา (Create Bet): ฟอร์มกรอกเป้าหมายและจำนวนเงิน พร้อมคำนวณค่าธรรมเนียม 10% ให้ดูทันที

หน้า Admin Panel: หน้าเฉพาะสำหรับ Admin เพื่อดูรายการรูปภาพที่รอตรวจ พร้อมปุ่ม Approve/Reject

5. ระบบป้องกันการโกง (Anti-Cheat)
   Daily Code: ทุกๆ วันระบบจะเจน "รหัสสั้นๆ" (เช่น #WIN99) ให้ผู้ใช้เขียนใส่กระดาษวางข้างหลักฐานแล้วถ่ายรูป เพื่อป้องกันการใช้รูปเก่า

Timestamp: ระบบจะบันทึกเวลาที่อัปโหลดรูปจริง ห้ามส่งย้อนหลัง

6. Stack เทคโนโลยีที่แนะนำ (Tech Stack)
   Frontend: Next.js + Tailwind CSS

UI Component: Shadcn UI

Backend/Database: Supabase (Auth + DB + Storage สำหรับเก็บรูป)

Payment: Stripe หรือระบบแจ้งโอนเงินแบบ Manual

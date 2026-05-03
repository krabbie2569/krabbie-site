import Link from 'next/link'

// krabbie.com — public landing page
export default function HomePage() {
  return (
    <main className="min-h-screen bg-krabbie-bg">

      {/* NAV */}
      <nav className="bg-krabbie-dark px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🦀</span>
          <span className="font-syne text-white text-xl font-extrabold">
            Krabbie<span className="text-orange-500">.com</span>
          </span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/templates" className="text-gray-400 hover:text-white text-sm transition-colors">
            Templates
          </Link>
          <Link href="#pricing" className="text-gray-400 hover:text-white text-sm transition-colors">
            ราคา
          </Link>
          <Link href="/signup" className="btn-primary text-sm">
            เริ่มใช้งาน ฟรี!
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="bg-krabbie-dark text-center py-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center text-[20rem] opacity-[0.03] pointer-events-none select-none">
          🦀
        </div>
        <span className="font-mono text-orange-500 text-[0.65rem] tracking-[4px] uppercase block mb-4">
          เว็บสำเร็จรูปให้เช่า · SaaS Platform
        </span>
        <h1 className="font-syne font-extrabold text-white text-5xl md:text-7xl leading-none mb-4">
          เว็บ<span className="text-orange-500">ง่ายๆ</span><br />แค่หนีบเดียว
        </h1>
        <p className="text-gray-400 text-base max-w-md mx-auto mb-8 leading-relaxed">
          ไม่ต้องเขียนโค้ด ไม่ต้องจ้างโปรแกรมเมอร์<br />
          สมัครแล้วได้เว็บพร้อม subdomain ของตัวเองทันที
        </p>
        <div className="inline-flex items-baseline gap-2 bg-orange-500/10 border border-orange-500/30 rounded-lg px-5 py-3 mb-8">
          <span className="font-syne text-orange-500 text-3xl font-extrabold">150</span>
          <span className="text-gray-400 text-sm">฿ / เดือน · ยกเลิกได้ทุกเมื่อ</span>
        </div>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="/signup" className="btn-primary">
            🦀 ทดลองฟรี 1 เดือน
          </Link>
          <Link href="/templates" className="btn-outline border-gray-600 text-gray-300 hover:border-orange-500 hover:text-orange-500">
            ดู Templates
          </Link>
        </div>
        <p className="font-mono text-teal-DEFAULT text-xs mt-4">
          ✓ ฟรี 1 เดือน · ✓ ไม่ต้องบัตรเครดิต · ✓ ยกเลิกได้ทุกเมื่อ
        </p>
      </section>

      {/* FEATURES */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <div className="sec-label mb-4">ทำไมต้อง Krabbie</div>
        <h2 className="text-2xl mb-8">ครบ จบ ในที่เดียว</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: '⚡', title: 'ได้เว็บทันที', desc: 'สมัครปุ๊บ ได้ shop.krabbie.com ของตัวเองทันที ไม่ต้องรอ setup' },
            { icon: '📱', title: 'มือถือใช้ได้', desc: 'ลูกค้าจองผ่านมือถือได้เลย responsive ทุก device' },
            { icon: '🔔', title: 'แจ้งเตือนทันที', desc: 'มีการจองใหม่แจ้งเตือน push ทันที ไม่พลาดลูกค้า' },
            { icon: '💰', title: 'ราคาถูก', desc: 'เพียง 150 ฿/เดือน ค่าโดเมน ค่า server รวมหมดแล้ว' },
            { icon: '🌐', title: 'subdomain ของตัวเอง', desc: 'shop.krabbie.com ดูเป็นมืออาชีพ ลูกค้าจำง่าย' },
            { icon: '⚙️', title: 'จัดการง่าย', desc: 'Admin dashboard ครบ จัดการคิว บริการ และการจองได้ทันที' },
          ].map((f) => (
            <div key={f.title} className="card hover:border-orange-300 transition-colors">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-syne text-base font-bold mb-1">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TEMPLATES */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <div className="sec-label mb-4">Templates ที่มี</div>
        <h2 className="text-2xl mb-2">เลือก Template ที่ใช่สำหรับธุรกิจของคุณ</h2>
        <p className="text-gray-500 text-sm mb-10">พร้อมใช้งานทันที ไม่ต้องเขียนโค้ด</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {[
            {
              id: 'booking-service',
              emoji: '📅',
              name: 'ระบบจองบริการ',
              desc: 'นวด · ฝึกสอน · ช่างภาพ · ซ่อม',
              tags: ['ร้านนวด', 'โค้ชส่วนตัว', 'ช่างภาพ'],
              color: '#ff6b00',
              bg: 'linear-gradient(135deg,#fff8f0,#ffe0c0)',
            },
            {
              id: 'booking-rental',
              emoji: '📷',
              name: 'ระบบเช่าสินค้า',
              desc: 'กล้อง · เสื้อผ้า · อุปกรณ์',
              tags: ['ร้านเช่ากล้อง', 'เช่าชุด', 'เช่าอุปกรณ์'],
              color: '#E91E8C',
              bg: 'linear-gradient(135deg,#fff0f8,#f8e0ff)',
            },
            {
              id: 'shop-general',
              emoji: '🛍️',
              name: 'ร้านขายสินค้าออนไลน์',
              desc: 'เสื้อผ้า · handmade · ของตกแต่งบ้าน',
              tags: ['ร้าน handmade', 'ของตกแต่ง', 'ของฝาก'],
              color: '#1E293B',
              bg: 'linear-gradient(135deg,#f1f5f9,#e2e8f0)',
            },
            {
              id: 'food-qr-menu',
              emoji: '🍜',
              name: 'QR เมนูดิจิทัล',
              desc: 'ร้านอาหาร · คาเฟ่ · บาร์เครื่องดื่ม',
              tags: ['ร้านอาหาร', 'คาเฟ่', 'ฟู้ดทรัค'],
              color: '#6F4E37',
              bg: 'linear-gradient(135deg,#fff8f0,#fde8d0)',
            },
          ].map((t) => (
            <div key={t.id} style={{ background: t.bg }} className="rounded-2xl p-6 hover:scale-[1.01] hover:shadow-lg transition-all">
              <div className="flex items-start gap-4 mb-4">
                <div className="text-4xl leading-none">{t.emoji}</div>
                <div>
                  <h3 className="font-syne font-bold text-base mb-0.5" style={{ color: t.color }}>{t.name}</h3>
                  <p className="text-gray-500 text-xs">{t.desc}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-5">
                {t.tags.map(tag => (
                  <span key={tag} className="text-[10px] font-mono px-2 py-0.5 rounded-full"
                    style={{ background: `${t.color}18`, color: t.color }}>
                    {tag}
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <Link href={`/demo/${t.id}`} target="_blank"
                  className="flex-1 text-center py-2 rounded-xl border-2 text-xs font-bold transition-all hover:opacity-80"
                  style={{ borderColor: t.color, color: t.color, background: 'white' }}>
                  👁 ดูตัวอย่าง
                </Link>
                <Link href={`/signup?template=${t.id}`}
                  className="flex-1 text-center py-2 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90"
                  style={{ background: t.color }}>
                  ใช้ Template นี้ →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="bg-krabbie-dark py-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <span className="font-mono text-orange-500 text-[0.65rem] tracking-[3px] uppercase block mb-3">ราคา</span>
          <h2 className="font-syne text-white text-3xl font-extrabold mb-8">Simple Pricing</h2>
          <div className="bg-[#2a1f10] border border-orange-500/30 rounded-2xl p-8 max-w-sm mx-auto">
            <div className="font-mono text-orange-500 text-xs mb-2">STANDARD PLAN</div>
            <div className="flex items-baseline gap-1 justify-center mb-1">
              <span className="font-syne text-white text-5xl font-extrabold">150</span>
              <span className="text-gray-400">฿/เดือน</span>
            </div>
            <div className="font-mono text-teal-DEFAULT text-xs mb-6">ทดลองฟรี 1 เดือนแรก</div>
            <ul className="text-left space-y-2 mb-6">
              {['เว็บ + subdomain ของตัวเอง', 'ระบบจองออนไลน์ 24/7', 'Admin dashboard', 'Web Push แจ้งเตือน', 'Backup ทุกคืน', 'Support ผ่าน Line'].map((item) => (
                <li key={item} className="flex items-center gap-2 text-gray-300 text-sm">
                  <span className="text-teal-DEFAULT">✓</span> {item}
                </li>
              ))}
            </ul>
            <Link href="/signup" className="block w-full text-center btn-primary">
              เริ่มทดลองฟรี →
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-krabbie-dark border-t border-gray-800 py-6 text-center font-mono text-xs text-gray-500">
        <div className="text-2xl mb-2">🦀</div>
        <div><span className="text-orange-500">Krabbie.com</span> · เว็บสำเร็จรูปให้เช่า</div>
        <div className="mt-1">"เว็บง่ายๆ แค่หนีบเดียว"</div>
      </footer>

    </main>
  )
}

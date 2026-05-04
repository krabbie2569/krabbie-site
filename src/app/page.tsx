export const runtime = 'edge'

import Link from 'next/link'
import styles from './page.module.css'
import ScrollReveal from '@/components/ScrollReveal'
import TemplatesSection from '@/components/TemplatesSection'
import HomeNav from '@/components/HomeNav'

export default function HomePage() {
  const s = styles
  return (
    <div className={s.page}>
      <ScrollReveal />

      {/* ── NAV ── */}
      <nav className={s.nav}>
        <Link href="/" className={s.logo}>
          🦀 Krabbie<span className={s.logoAccent}>.com</span>
        </Link>
        <HomeNav />
      </nav>

      {/* ── HERO ── */}
      <section className={s.hero}>
        <div className={s.sky} />

        {/* Clouds */}
        <svg className={`${s.cloud} ${s.cloud1}`} width="140" height="60" viewBox="0 0 140 60">
          <ellipse cx="70" cy="42" rx="60" ry="22" fill="white"/>
          <ellipse cx="50" cy="36" rx="30" ry="20" fill="white"/>
          <ellipse cx="90" cy="34" rx="28" ry="18" fill="white"/>
          <ellipse cx="70" cy="30" rx="22" ry="16" fill="white"/>
        </svg>
        <svg className={`${s.cloud} ${s.cloud2}`} width="180" height="70" viewBox="0 0 180 70">
          <ellipse cx="90" cy="52" rx="76" ry="22" fill="white"/>
          <ellipse cx="65" cy="44" rx="34" ry="22" fill="white"/>
          <ellipse cx="115" cy="40" rx="32" ry="20" fill="white"/>
          <ellipse cx="90" cy="34" rx="26" ry="18" fill="white"/>
        </svg>
        <svg className={`${s.cloud} ${s.cloud3}`} width="120" height="55" viewBox="0 0 120 55">
          <ellipse cx="60" cy="38" rx="52" ry="20" fill="white"/>
          <ellipse cx="42" cy="32" rx="26" ry="18" fill="white"/>
          <ellipse cx="80" cy="30" rx="24" ry="16" fill="white"/>
        </svg>

        <div className={s.sun} />

        {/* Price bubble */}
        <div className={s.priceFloat}>
          <div className={s.priceTag}>เริ่มต้น</div>
          <div className={s.priceBig}>150<span style={{ fontSize: '1rem' }}>฿</span></div>
          <div className={s.priceSmall}>/เดือน</div>
        </div>

        {/* Sea */}
        <div className={s.seaBack} />
        <div className={s.seaMid} />
        <div className={s.waveWrap}>
          <div className={`${s.wave} ${s.w1}`}>
            <svg viewBox="0 0 1440 80" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0,40 C180,80 360,0 540,40 C720,80 900,0 1080,40 C1260,80 1350,20 1440,40 L1440,80 L0,80 Z" fill="rgba(255,255,255,0.55)"/>
            </svg>
          </div>
          <div className={`${s.wave} ${s.w2}`}>
            <svg viewBox="0 0 1440 80" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0,55 C120,20 300,70 480,45 C660,20 840,65 1020,40 C1200,15 1320,55 1440,35 L1440,80 L0,80 Z" fill="rgba(255,255,255,0.45)"/>
            </svg>
          </div>
          <div className={`${s.wave} ${s.w3}`}>
            <svg viewBox="0 0 1440 80" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0,30 C240,65 480,10 720,45 C960,80 1200,15 1440,50 L1440,80 L0,80 Z" fill="rgba(255,255,255,0.3)"/>
            </svg>
          </div>
        </div>
        <div className={s.foamLine} />
        <div className={s.beach} />

        {/* Hero text */}
        <div className={s.heroContent}>
          <div className={s.heroEyebrow}>🦀 เปิดตัวใหม่ · สร้างเว็บได้วันนี้เลย</div>
          <h1 className={s.heroH1}>
            มีเว็บร้านค้า<br />เป็นของตัวเอง<br /><span className={s.hl}>ง่ายมาก!</span>
          </h1>
          <p className={s.heroSub}>
            เลือก template กรอกชื่อร้าน แค่นั้นก็ได้เว็บพร้อมใช้ทันที ไม่ต้องรู้โค้ด ไม่ต้องจ้างโปรแกรมเมอร์
          </p>
          <div className={s.heroBtns}>
            <Link href="/signup" className={s.btnHero}>ทดลองฟรี 14 วัน 🦀</Link>
            <a href="#templates" className={s.btnGhost}>ดู Template ก่อน</a>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className={s.how} id="how">
        <div className={s.sectionInner}>
          <span className={`${s.eyebrow} reveal`}>วิธีใช้งาน</span>
          <h2 className={`${s.secH} reveal`}>
            แค่ <em className={s.secHem}>3 ขั้นตอน</em><br />ได้เว็บเลย 🦀
          </h2>
          <div className={s.steps}>
            {[
              { num: '01', icon: '🎨', cls: s.i1, title: 'เลือก Template', desc: 'จองบริการ ขายของ หรือ QR เมนูอาหาร เลือกแบบที่เหมาะกับร้านคุณ' },
              { num: '02', icon: '✏️', cls: s.i2, title: 'ตั้งชื่อร้าน',   desc: 'กรอกชื่อร้าน ระบบสร้าง yourshop.krabbie.com ให้อัตโนมัติทันที' },
              { num: '03', icon: '🚀', cls: s.i3, title: 'ใช้งานได้เลย!', desc: 'เว็บพร้อมใช้ใน 1 นาที ลูกค้าจองหรือซื้อได้ทันที ไม่ต้องรอ' },
            ].map(({ num, icon, cls, title, desc }) => (
              <div key={num} className={`${s.step} reveal`}>
                <div className={s.stepBg}>{num}</div>
                <div className={`${s.stepIcon} ${cls}`}>{icon}</div>
                <h3>{title}</h3>
                <p>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TEMPLATES ── */}
      <section className={s.templates} id="templates">
        <div className={s.sectionInner}>
          <span className={`${s.eyebrow} reveal`}>Template</span>
          <h2 className={`${s.secH} reveal`}>
            เลือก Template<br /><em className={s.secHem}>ที่ใช่สำหรับคุณ</em>
          </h2>
          <p className={`${s.secP} reveal`}>ทุก template มีหน้าลูกค้า + Admin ครบ พร้อมแจ้งเตือน real-time</p>
          <TemplatesSection />
        </div>
      </section>

      {/* ── OCEAN DIVIDER ── */}
      <div className={s.oceanDivider}>
        <svg viewBox="0 0 1200 80" preserveAspectRatio="none" style={{ position: 'absolute', bottom: 0, width: '100%', height: '100%' }}>
          <path d="M0,40 C200,80 400,0 600,40 C800,80 1000,0 1200,40 L1200,80 L0,80 Z" fill="#0099CC"/>
        </svg>
      </div>

      {/* ── PRICING ── */}
      <section className={s.pricing} id="pricing">
        <div className={s.sectionInner}>
          <span className={`${s.eyebrow} ${s.pricingEyebrow} reveal`}>ราคา</span>
          <h2 className={`${s.secH} ${s.pricingH} reveal`}>
            ราคาเดียว<br /><em className={s.secHem} style={{ color: '#F4D03F' }}>ไม่มีซ่อน</em>
          </h2>
          <p className={`${s.secP} ${s.pricingP} reveal`}>ทุก feature ในราคาเดียว ไม่มีค่าแรกเข้า ยกเลิกได้ทุกเดือน</p>
          <div className={s.priceCards}>

            {/* Free */}
            <div className={`${s.priceCard} reveal`}>
              <div className={s.planName}>Free</div>
              <div className={s.planPrice}><sup>฿</sup>0<sub>/เดือน</sub></div>
              <div className={s.planDesc}>ทดลองฟรี 14 วัน ไม่ต้องใส่บัตร</div>
              <ul className={s.planFeatures}>
                <li>ทุก feature ครบ 14 วัน</li>
                <li>หน้าร้าน + จองออนไลน์</li>
                <li>Admin dashboard</li>
                <li>Subdomain .krabbie.com</li>
              </ul>
              <Link href="/signup" className={`${s.planBtn} ${s.btnOutlineW}`}>เริ่มฟรีเลย</Link>
            </div>

            {/* Basic */}
            <div className={`${s.priceCard} reveal`}>
              <div className={s.planName}>Basic</div>
              <div className={s.planPrice}><sup>฿</sup>150<sub>/เดือน</sub></div>
              <div className={s.planDesc}>เปิดร้านจริง — ครบทุกอย่าง</div>
              <ul className={s.planFeatures}>
                <li>หน้าจอง/ขายของ 1 หน้า</li>
                <li>Admin dashboard</li>
                <li>อัพโหลดสลิป → รอยืนยัน</li>
                <li>Subdomain ฟรี (.krabbie.com)</li>
                <li>ไม่จำกัดออเดอร์/เดือน</li>
              </ul>
              <Link href="/signup" className={`${s.planBtn} ${s.btnOutlineW}`}>เริ่มใช้งาน</Link>
            </div>

            {/* Pro */}
            <div className={`${s.priceCard} ${s.priceCardHot} reveal`}>
              <div className={s.hotLabel}>⭐ ยอดนิยม</div>
              <div className={s.planName} style={{ marginTop: '1rem' }}>Pro</div>
              <div className={s.planPrice}><sup>฿</sup>299<sub>/เดือน</sub></div>
              <div className={s.planDesc}>ชำระเงินอัตโนมัติ + LINE notify</div>
              <ul className={s.planFeatures}>
                <li>ทุกอย่างใน Basic</li>
                <li>QR PromptPay อัตโนมัติ</li>
                <li>แจ้งเตือน LINE ทุกออเดอร์</li>
                <li>รายงานสรุปยอด รายวัน/เดือน</li>
                <li>Priority Support</li>
              </ul>
              <Link href="/signup?plan=pro" className={`${s.planBtn} ${s.btnYellow}`}>ทดลองฟรีเลย! →</Link>
            </div>

          </div>
          <p className="reveal" style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontFamily: "'Space Mono',monospace", fontSize: '0.72rem', marginTop: '1.5rem' }}>
            ทดลองฟรี 14 วัน · ไม่ต้องใส่บัตรเครดิต · ยกเลิกได้ทุกเมื่อ
          </p>
        </div>
      </section>

      {/* ── WAVE BACK ── */}
      <div className={s.waveBottom}>
        <svg viewBox="0 0 1200 80" preserveAspectRatio="none" style={{ position: 'absolute', bottom: 0, width: '100%', height: '100%' }}>
          <path d="M0,40 C300,0 600,80 900,40 C1050,20 1150,50 1200,40 L1200,80 L0,80 Z" fill="#E8F8FF"/>
        </svg>
      </div>

      {/* ── TESTIMONIALS ── */}
      <section className={s.testi}>
        <div className={s.sectionInner}>
          <span className={`${s.eyebrow} reveal`}>รีวิว</span>
          <h2 className={`${s.secH} reveal`}>
            ลูกค้าพูดถึง<br /><em className={s.secHem}>Krabbie ว่ายังไง</em> 🦀
          </h2>
          <div className={s.testiGrid}>
            {[
              {
                icon: '👗', name: 'มาลี จ.', role: 'ร้านชุดเช่า · template จองบริการ',
                text: '"สมัครตอนเช้า สายๆ มีเว็บจองชุดเช่าพร้อมใช้แล้ว ลูกค้าจองผ่านเว็บได้เลยไม่ต้องมาทักไลน์ทีละคน ง่ายมากจริงๆ"',
              },
              {
                icon: '🍜', name: 'สมชาย ก.', role: 'ครัวบ้านสวน · template QR อาหาร',
                text: '"ร้านอาหารมี 12 โต๊ะ พอใช้ QR สั่งอาหาร พนักงานว่างขึ้นเยอะมาก ลูกค้าพอใจเพราะสั่งได้เร็ว 150 บาทคุ้มมากๆ"',
              },
              {
                icon: '🍰', name: 'นภา ว.', role: 'Sweet Home Bakery · template ขายของ',
                text: '"ขายขนมออนไลน์มาก่อน ยุ่งมาก พอมาใช้ Krabbie กรอกชื่อสินค้า ราคา รูป เสร็จเลย ลูกค้าโอนมาแล้วแจ้งเตือนทันที"',
              },
            ].map(({ icon, name, role, text }) => (
              <div key={name} className={`${s.testiCard} reveal`}>
                <div className={s.stars}>★★★★★</div>
                <p className={s.testiText}>{text}</p>
                <div className={s.testiWho}>
                  <div className={s.avatar}>{icon}</div>
                  <div>
                    <div className={s.whoName}>{name}</div>
                    <div className={s.whoRole}>{role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className={s.cta}>
        <h2 className={`${s.secH} ${s.ctaH} reveal`} style={{ textAlign: 'center' }}>
          พร้อมให้ <em className={s.secHem}>แครบบี้</em><br />ช่วยสร้างเว็บแล้วหรือยัง?
        </h2>
        <p className={`${s.ctaP} reveal`}>ทดลองฟรี 14 วัน ไม่ต้องใส่บัตรเครดิต ยกเลิกได้ทุกเมื่อ ไม่มีผูกมัด</p>
        <div className={`${s.ctaBtns} reveal`}>
          <Link href="/signup" className={s.btnHero}>ทดลองฟรีเลย →</Link>
          <a href="#templates" className={s.btnGhost}>ดู template ก่อน</a>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className={s.footer}>
        <div className={s.ft}>
          <div>
            <div className={s.logo} style={{ fontSize: '1.3rem' }}>🦀 Krabbie<span className={s.logoAccent}>.com</span></div>
            <p className={s.ftBrandP}>เว็บสำเร็จรูปสำหรับธุรกิจเล็กๆ ของคนไทย</p>
            <p className={s.ftBrandMotto}>"เว็บง่ายๆ แค่หนีบเดียว" 🦀</p>
          </div>
          <div>
            <div className={s.ftColH}>Template</div>
            <a href="#templates" className={s.ftColA}>จองบริการ</a>
            <a href="#templates" className={s.ftColA}>ขายของ</a>
            <a href="#templates" className={s.ftColA}>QR อาหาร</a>
          </div>
          <div>
            <div className={s.ftColH}>บริษัท</div>
            <a href="#" className={s.ftColA}>เกี่ยวกับเรา</a>
            <a href="#" className={s.ftColA}>ติดต่อ</a>
            <a href="#" className={s.ftColA}>นโยบายความเป็นส่วนตัว</a>
          </div>
          <div>
            <div className={s.ftColH}>ช่วยเหลือ</div>
            <a href="#" className={s.ftColA}>FAQ</a>
            <a href="#" className={s.ftColA}>คู่มือใช้งาน</a>
            <a href="#" className={s.ftColA}>LINE: @krabbie</a>
          </div>
        </div>
        <div className={s.ftBottom}>
          <span>© 2026 <span className={s.ftOrange}>Krabbie.com</span> · All rights reserved</span>
          <span>Made with 🦀 in Thailand</span>
        </div>
      </footer>

    </div>
  )
}

import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

const TEAL = '#0f766e'
const TEAL_HOVER = '#14b8a6'

const sectionPadding = 'px-6 md:px-12 lg:px-24'
const maxW = 'max-w-7xl mx-auto'

function getInitialTheme(): string {
  try {
    const stored = localStorage.getItem('theme')
    if (stored === 'dark' || stored === 'light') return stored
  } catch {}
  return 'light'
}

type Theme = 'light' | 'dark'

interface Palette {
  pageBg: string
  sectionBg: string
  heading: string
  body: string
  cardBg: string
  cardBorder: string
  navbarBg: string
  navbarBorder: string
  logoBg: string
  logoText: string
  btnOutline: string
  btnOutlineHover: string
  btnOutlineText: string
  btnSolidBg: string
  btnSolidText: string
  illustrationBg: string
  badgeBg: string
  footerBg: string
  footerText: string
  footerHover: string
  cardHeading: string
  cardBody: string
  heroSectionBg: string
}

const lightPalette: Palette = {
  pageBg: '#f8fafc',
  sectionBg: '#f8fafc',
  heading: '#0f172a',
  body: '#475569',
  cardBg: '#ffffff',
  cardBorder: '#e2e8f0',
  navbarBg: TEAL,
  navbarBorder: 'transparent',
  logoBg: 'rgba(255,255,255,0.2)',
  logoText: '#ffffff',
  btnOutline: 'rgba(255,255,255,0.3)',
  btnOutlineHover: 'rgba(255,255,255,0.5)',
  btnOutlineText: '#ffffff',
  btnSolidBg: '#ffffff',
  btnSolidText: TEAL,
  illustrationBg: '#f0fdfa',
  badgeBg: '#ffffff',
  footerBg: '#1a202c',
  footerText: '#a0aec0',
  footerHover: '#ffffff',
  cardHeading: '#0f172a',
  cardBody: '#475569',
  heroSectionBg: '#f8fafc',
}

const darkPalette: Palette = {
  pageBg: '#0f172a',
  sectionBg: '#0f172a',
  heading: '#f1f5f9',
  body: '#94a3b8',
  cardBg: '#1e293b',
  cardBorder: '#334155',
  navbarBg: '#1e293b',
  navbarBorder: '#334155',
  logoBg: 'rgba(241,245,249,0.1)',
  logoText: '#f1f5f9',
  btnOutline: '#475569',
  btnOutlineHover: '#64748b',
  btnOutlineText: '#f1f5f9',
  btnSolidBg: '#f1f5f9',
  btnSolidText: '#0f172a',
  illustrationBg: '#1e293b',
  badgeBg: '#334155',
  footerBg: '#0f172a',
  footerText: '#64748b',
  footerHover: '#f1f5f9',
  cardHeading: '#f1f5f9',
  cardBody: '#94a3b8',
  heroSectionBg: '#0f172a',
}

const LandingPage: React.FC = () => {
  const [theme, setTheme] = useState<Theme>(getInitialTheme() as Theme)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    try { localStorage.setItem('theme', theme) } catch {}
  }, [theme])

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light')

  const isDark = theme === 'dark'
  const c: Palette = isDark ? darkPalette : lightPalette
  const cardBase = 'rounded-lg border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-t-[#0f766e]'

  return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: "'Inter', sans-serif", backgroundColor: c.pageBg }}>
      {/* ─── NAVBAR ─── */}
      <header
        className={`${sectionPadding} py-4 flex items-center justify-between w-full sticky top-0 z-50`}
        style={{ backgroundColor: c.navbarBg, borderBottom: `1px solid ${c.navbarBorder}` }}
      >
        <div className={`${maxW} w-full flex items-center justify-between`}>
          <div className="flex items-center gap-2">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm"
              style={{ backgroundColor: c.logoBg, color: c.logoText }}
            >
              M
            </div>
            <span className="font-bold text-lg" style={{ color: c.logoText }}>MediCampus</span>
          </div>
          <div className="flex items-center gap-3">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200"
              style={{ backgroundColor: 'transparent', color: c.logoText }}
              aria-label={isDark ? 'Activar modo claro' : 'Activar modo oscuro'}
            >
              {isDark ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>
            <Link to="/seguridad/login">
              <button
                className="px-4 py-1.5 text-xs font-medium rounded-lg transition-all duration-200"
                style={{
                  backgroundColor: 'transparent',
                  color: c.btnOutlineText,
                  border: `1px solid ${c.btnOutline}`,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = c.btnOutlineHover }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = c.btnOutline }}
              >
                Iniciar Sesión
              </button>
            </Link>
            <Link to="/seguridad/register">
              <button
                className="px-4 py-1.5 text-xs font-medium rounded-lg transition-all duration-200"
                style={{
                  backgroundColor: c.btnSolidBg,
                  color: c.btnSolidText,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9' as any }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = '1' as any }}
              >
                Registrarse
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* ─── 1. HERO SECTION ─── */}
      <section className={`${sectionPadding} py-20 md:py-28`} style={{ backgroundColor: c.heroSectionBg }}>
        <div className={`${maxW} flex flex-col md:flex-row items-center gap-12`}>
          {/* Left column */}
          <div className="flex-1">
            <h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6"
              style={{ color: c.heading, fontFamily: "'Inter', sans-serif" }}
            >
              Bienestar Universitario
            </h1>
            <p className="text-lg md:text-xl leading-relaxed mb-8 max-w-xl" style={{ color: c.body }}>
              Cuidamos de tu salud para que puedas dar lo mejor de ti.
              Accede a consultas médicas, odontológicas, apoyo psicológico
              y gestión de permisos académicos desde un solo lugar.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link to="/seguridad/login">
                <button
                  className="px-8 py-3.5 rounded-lg font-semibold text-base transition-all duration-200"
                  style={{ backgroundColor: TEAL, color: '#ffffff' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = TEAL_HOVER }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = TEAL }}
                >
                  Agendar Cita
                </button>
              </Link>
              <Link to="/seguridad/register">
                <button
                  className="px-8 py-3.5 rounded-lg font-semibold text-base transition-all duration-200"
                  style={{
                    backgroundColor: 'transparent',
                    color: TEAL,
                    border: `2px solid ${TEAL}`,
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = TEAL; e.currentTarget.style.borderColor = TEAL; e.currentTarget.style.color = '#ffffff' }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.borderColor = TEAL; e.currentTarget.style.color = TEAL }}
                >
                  Conocer Más
                </button>
              </Link>
            </div>
          </div>

          {/* Right column — image with elegant overlay */}
          <div className="flex-1 flex items-center justify-center">
            <div
              className="relative w-80 h-80 md:w-96 md:h-96 rounded-2xl overflow-hidden"
            >
              {/* Full-size background image */}
              <img
                src="/logo-unl.jpg"
                alt="Campus UNL"
                className="absolute inset-0 w-full h-full object-cover"
                onError={({ currentTarget }) => {
                  currentTarget.style.display = 'none';
                }}
              />
              {/* Semi-transparent dark overlay for readability */}
              <div className="absolute inset-0" style={{ backgroundColor: 'rgba(15,23,42,0.15)' }} />
              {/* Decorative circle */}
              <div
                className="absolute rounded-full"
                style={{
                  width: '220px', height: '220px',
                  top: '-30px', right: '-40px',
                  backgroundColor: TEAL,
                  opacity: 0.15,
                }}
              />
              {/* Medical cross icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <svg width="120" height="120" viewBox="0 0 24 24" fill="none" style={{ opacity: 0.25 }}>
                  <rect x="9" y="3" width="6" height="18" rx="1" fill="#ffffff" />
                  <rect x="3" y="9" width="18" height="6" rx="1" fill="#ffffff" />
                </svg>
              </div>
              {/* Heartbeat line */}
              <svg
                className="absolute bottom-12 left-8"
                width="200" height="60" viewBox="0 0 200 60"
                style={{ opacity: 0.35 }}
              >
                <polyline
                  points="0,30 30,30 40,10 50,50 60,20 70,40 80,30 200,30"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {/* Bottom-right circle */}
              <div
                className="absolute rounded-full"
                style={{
                  width: '140px', height: '140px',
                  bottom: '-30px', left: '-40px',
                  backgroundColor: TEAL,
                  opacity: 0.12,
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ─── 2. NUESTROS SERVICIOS DE BIENESTAR ─── */}
      <section className={`${sectionPadding} py-20`} style={{ backgroundColor: c.sectionBg }}>
        <div className={maxW}>
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: c.heading }}>
              Nuestros Servicios de Bienestar
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: c.body }}>
              Ofrecemos atención integral para acompañarte en tu vida universitaria.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <Link to="/seguridad/login" className="block">
              <div
                className={`${cardBase} p-8 h-full`}
                style={{ backgroundColor: c.cardBg, borderColor: c.cardBorder }}
              >
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 text-white text-2xl font-bold"
                  style={{ backgroundColor: TEAL }}
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3" style={{ color: c.cardHeading }}>
                  Medicina General y Odontología
                </h3>
                <p className="text-sm leading-relaxed mb-6" style={{ color: c.cardBody }}>
                  Consulta clínica primaria, chequeos preventivos y atención odontológica
                  integral para la comunidad estudiantil.
                </p>
                <span className="text-sm font-semibold inline-flex items-center gap-1 transition-colors duration-200" style={{ color: TEAL }}>
                  Ver horarios &rarr;
                </span>
              </div>
            </Link>

            {/* Card 2 */}
            <Link to="/seguridad/login" className="block">
              <div
                className={`${cardBase} p-8 h-full`}
                style={{ backgroundColor: c.cardBg, borderColor: c.cardBorder }}
              >
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 text-white text-2xl font-bold"
                  style={{ backgroundColor: TEAL }}
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3" style={{ color: c.cardHeading }}>
                  Bienestar Psicológico
                </h3>
                <p className="text-sm leading-relaxed mb-6" style={{ color: c.cardBody }}>
                  Espacios confidenciales de orientación, soporte emocional y talleres de
                  salud mental para tu desarrollo académico.
                </p>
                <span className="text-sm font-semibold inline-flex items-center gap-1 transition-colors duration-200" style={{ color: TEAL }}>
                  Ver horarios &rarr;
                </span>
              </div>
            </Link>

            {/* Card 3 */}
            <Link to="/seguridad/login" className="block">
              <div
                className={`${cardBase} p-8 h-full`}
                style={{ backgroundColor: c.cardBg, borderColor: c.cardBorder }}
              >
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 text-white text-2xl font-bold"
                  style={{ backgroundColor: TEAL }}
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
                    <rect x="9" y="3" width="6" height="4" rx="1" />
                    <path d="M9 14l2 2 4-4" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3" style={{ color: c.cardHeading }}>
                  Trabajo Social y Permisos
                </h3>
                <p className="text-sm leading-relaxed mb-6" style={{ color: c.cardBody }}>
                  Validación y justificación de certificados médicos por enfermedad,
                  gestión de apoyos y seguimiento de casos vulnerables.
                </p>
                <span className="text-sm font-semibold inline-flex items-center gap-1 transition-colors duration-200" style={{ color: TEAL }}>
                  Ver horarios &rarr;
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── 3. ¿CÓMO AGENDAR TU CITA? ─── */}
      <section className={`${sectionPadding} py-20`} style={{ backgroundColor: c.sectionBg }}>
        <div className={maxW}>
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: c.heading }}>
              ¿Cómo Agendar tu Cita?
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: c.body }}>
              En solo tres pasos puedes acceder a todos nuestros servicios de bienestar universitario.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {/* Step 1 */}
            <div className="text-center">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-xl font-bold text-white"
                style={{ backgroundColor: TEAL }}
              >
                1
              </div>
              <h3 className="text-xl font-bold mb-3" style={{ color: c.heading }}>
                Identifícate
              </h3>
              <p className="text-sm leading-relaxed max-w-xs mx-auto" style={{ color: c.body }}>
                Inicia sesión con tus credenciales institucionales de la UNL.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-xl font-bold text-white"
                style={{ backgroundColor: TEAL }}
              >
                2
              </div>
              <h3 className="text-xl font-bold mb-3" style={{ color: c.heading }}>
                Elige tu Especialidad
              </h3>
              <p className="text-sm leading-relaxed max-w-xs mx-auto" style={{ color: c.body }}>
                Selecciona el área clínica, el profesional y el horario disponible
                que mejor se adapte a ti.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-xl font-bold text-white"
                style={{ backgroundColor: TEAL }}
              >
                3
              </div>
              <h3 className="text-xl font-bold mb-3" style={{ color: c.heading }}>
                Confirma y Asiste
              </h3>
              <p className="text-sm leading-relaxed max-w-xs mx-auto" style={{ color: c.body }}>
                Recibe tu recordatorio digital al instante y acude a tu consulta
                en el campus.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 4. BANNER DE CIERRE ─── */}
      <section className={`${sectionPadding} py-20 md:py-24`} style={{ backgroundColor: TEAL }}>
        <div className={`${maxW} text-center`}>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            ¿Necesitas atención médica o registrar un justificativo?
          </h2>
          <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
            Estamos aquí para cuidar de ti. Agenda tu cita en minutos y recibe la
            atención que mereces.
          </p>
          <Link to="/seguridad/login">
            <button
              className="px-10 py-4 rounded-lg font-bold text-base transition-all duration-200"
              style={{ backgroundColor: '#ffffff', color: TEAL }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f0fdfa' }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#ffffff' }}
            >
              Agendar Cita Ahora
            </button>
          </Link>
        </div>
      </section>

      {/* ─── 5. FOOTER ─── */}
      <footer
        className={`${sectionPadding} py-8`}
        style={{ backgroundColor: c.footerBg }}
      >
        <div className={`${maxW} flex flex-col md:flex-row items-center justify-between gap-4`}>
          <span className="text-sm" style={{ color: c.footerText }}>
            Universidad Nacional de Loja &copy; {new Date().getFullYear()}
          </span>
          <div className="flex items-center gap-6">
            <a href="#" className="text-sm transition-colors duration-200" style={{ color: c.footerText }}
               onMouseEnter={(e) => { e.currentTarget.style.color = c.footerHover }}
               onMouseLeave={(e) => { e.currentTarget.style.color = c.footerText }}
            >
              Soporte
            </a>
            <a href="#" className="text-sm transition-colors duration-200" style={{ color: c.footerText }}
               onMouseEnter={(e) => { e.currentTarget.style.color = c.footerHover }}
               onMouseLeave={(e) => { e.currentTarget.style.color = c.footerText }}
            >
              Términos
            </a>
            <a href="#" className="text-sm transition-colors duration-200" style={{ color: c.footerText }}
               onMouseEnter={(e) => { e.currentTarget.style.color = c.footerHover }}
               onMouseLeave={(e) => { e.currentTarget.style.color = c.footerText }}
            >
              Ubicación
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import TopBar from '@/components/layout/TopBar'
import PageLayout from '@/components/layout/PageLayout'
import { useAdmin } from '@/context/AdminContext'
import { supabase } from '@/lib/supabase'
import { useTestModal } from '@/context/TestModalContext'

type Step = 'info' | 'form' | 'success'

// ─── Scholarship levels ───────────────────────────────────────────────────────

const BECA_LEVELS = [
  {
    id: 'sobresaliente',
    label: 'Sobresaliente',
    range: '9.5 o más',
    beca: 'Beca 50% colegiatura + 50% inscripción',
    color: '#059669',
    bg: '#ecfdf5',
  },
  {
    id: 'muy-alto',
    label: 'Muy alto',
    range: '9.0 – 9.49',
    beca: 'Beca 40% colegiatura + 50% inscripción',
    color: '#2563eb',
    bg: '#eff6ff',
  },
  {
    id: 'alto',
    label: 'Alto',
    range: '8.5 – 8.99',
    beca: 'Beca 30% colegiatura + 50% inscripción',
    color: '#7c3aed',
    bg: '#f5f3ff',
  },
  {
    id: 'base',
    label: '7.0 – 8.49',
    range: '7.0 – 8.49',
    beca: '50% de descuento en inscripción',
    color: '#d97706',
    bg: '#fffbeb',
  },
]

// ─── Tuition discount per level ───────────────────────────────────────────────

const TUITION_DISCOUNT: Record<string, number> = {
  sobresaliente: 0.5,
  'muy-alto': 0.4,
  alto: 0.3,
  base: 0,
}

// ─── Parse "$4,650/mes" or "$7,000" → 4650 ───────────────────────────────────

function parsePriceMXN(price: string): number {
  return parseFloat(price.replace(/[^0-9.]/g, '')) || 0
}

// ─── Format as MXN ───────────────────────────────────────────────────────────

function fmt(n: number): string {
  return n.toLocaleString('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 })
}

// ─── Selected career (passed from Carreras page) ──────────────────────────────

interface SelectedCareer {
  id: string
  name: string
  monthly_price: string
  enrollment_price: string
  modality: string
}

function readSelectedCareer(): SelectedCareer | null {
  try {
    const raw = localStorage.getItem('selectedBecaCareer')
    return raw ? (JSON.parse(raw) as SelectedCareer) : null
  } catch {
    return null
  }
}

export default function MiBeca() {
  const { values } = useAdmin()
  const { openTest } = useTestModal()
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('info')
  const [selectedCareer, setSelectedCareer] = useState<SelectedCareer | null>(readSelectedCareer)
  const [selectedLevel, setSelectedLevel] = useState<string | null>(
    () => localStorage.getItem('selectedBecaLevel')
  )

  const selectLevel = (id: string) => {
    const next = selectedLevel === id ? null : id
    setSelectedLevel(next)
    if (next) localStorage.setItem('selectedBecaLevel', next)
    else localStorage.removeItem('selectedBecaLevel')
  }
  const [loading, setLoading] = useState(false)
  const [careerOverride, setCareerOverride] = useState(false)
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    career: selectedCareer?.name ?? '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await supabase.from('leads').insert([{
        nombre: `${form.firstName}${form.lastName ? ' ' + form.lastName : ''}`,
        email: form.email,
        telefono: form.phone || null,
        career: form.career || selectedCareer?.name || null,
        source: 'pwa-mi-beca',
        tags: ['pwa', 'beca-solicitada'],
      }])
      setStep('success')
    } catch (err) {
      console.error(err)
      setStep('success') // show success even if DB fails
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-dvh bg-white">
      <TopBar title="Mi Beca" showBack onBack={() => navigate(-1)} />
      <PageLayout>

        {step === 'info' && (
          <>
            {/* Back button */}
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 text-base font-semibold text-[#1B3070] pt-4 pb-2 hover:opacity-70 active:scale-95 transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
              </svg>
              Volver
            </button>
            {/* Hero */}
            <div className="pt-4 pb-6">
              <div className="w-14 h-14 rounded-2xl bg-[#1B3070] flex items-center justify-center mb-4 shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#E6B400" strokeWidth={1.5} className="w-7 h-7">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0" />
                </svg>
              </div>
              <h1 className="font-black text-[#1B3070] text-[2.6rem] md:text-[3.2rem] leading-[1.05]">
                Calcula tu beca
              </h1>
              <p className="text-gray-400 text-lg md:text-xl mt-3">
                Tu promedio define tu nivel. Descúbrelo en segundos.
              </p>
            </div>

            {/* ── Selected career summary ────────────────────────────────── */}
            {selectedCareer && (
              <div className="mb-5 p-4 rounded-2xl bg-[#1B3070]/5 border border-[#1B3070]/15">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black uppercase tracking-[0.18em] text-[#1B3070]/60 mb-1.5">Carrera seleccionada</p>
                    <p className="font-black text-[#1B3070] text-lg leading-tight mb-2">{selectedCareer.name}</p>
                    <div className="flex gap-4 text-base text-gray-500 flex-wrap">
                      {selectedCareer.monthly_price && (
                        <span><span className="font-semibold text-gray-700">Colegiatura:</span> {selectedCareer.monthly_price}</span>
                      )}
                      {selectedCareer.enrollment_price && (
                        <span><span className="font-semibold text-gray-700">Inscripción:</span> {selectedCareer.enrollment_price}</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      localStorage.removeItem('selectedBecaCareer')
                      setSelectedCareer(null)
                      setForm(f => ({ ...f, career: '' }))
                    }}
                    className="w-7 h-7 rounded-full bg-gray-200 hover:bg-gray-300 active:scale-90 transition-all flex items-center justify-center flex-shrink-0 mt-0.5"
                    title="Limpiar carrera"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none" className="w-3 h-3">
                      <path d="M4 4l8 8M12 4l-8 8" stroke="#6b7280" strokeWidth={1.8} strokeLinecap="round"/>
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* ── Scholarship levels ─────────────────────────────────────── */}
            <p className="text-base font-black uppercase tracking-[0.18em] text-gray-400 mb-3">
              Tu promedio → Tu beca
            </p>
            <div className="space-y-2.5 mb-6">
              {BECA_LEVELS.map((level) => {
                const isSelected = selectedLevel === level.id
                return (
                  <button
                    key={level.id}
                    onClick={() => selectLevel(level.id)}
                    className="w-full text-left rounded-2xl border-2 p-4 transition-all active:scale-[0.98] shadow-sm"
                    style={{
                      background: isSelected ? level.bg : '#fff',
                      borderColor: isSelected ? level.color : '#e5e7eb',
                      boxShadow: isSelected ? `0 4px 16px ${level.color}22` : '0 1px 4px rgba(0,0,0,0.05)',
                    }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className="text-sm font-black uppercase tracking-wider px-3 py-1 rounded-full"
                            style={{ background: level.color + '18', color: level.color }}
                          >
                            {level.label}
                          </span>
                          <span className="text-sm text-gray-400 font-medium">{level.range}</span>
                        </div>
                        <p className="text-base font-semibold text-gray-800 leading-snug">{level.beca}</p>
                      </div>
                      <div
                        className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all"
                        style={{
                          borderColor: isSelected ? level.color : '#d1d5db',
                          background: isSelected ? level.color : 'transparent',
                        }}
                      >
                        {isSelected && (
                          <svg viewBox="0 0 12 12" fill="white" className="w-3 h-3">
                            <path d="M2 6l3 3 5-5" stroke="white" strokeWidth={1.8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* ── FOMO strip ────────────────────────────────────────────── */}
            <div className="flex gap-3 mb-6">
              <div className="flex-1 flex items-center gap-2 p-3 rounded-xl bg-amber-50 border border-amber-100">
                <span className="text-amber-500 text-base">⏳</span>
                <p className="text-sm font-semibold text-amber-700 leading-snug">Beneficios válidos hasta el 31 de agosto</p>
              </div>
              <div className="flex-1 flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-100">
                <span className="text-red-400 text-base">🔒</span>
                <p className="text-sm font-semibold text-red-700 leading-snug">Cupos limitados por generación</p>
              </div>
            </div>

            {/* ── Confirmation panel (shown when level selected) ─────────── */}
            {selectedLevel && (() => {
              const level = BECA_LEVELS.find(l => l.id === selectedLevel)!
              const tuitionDiscount = TUITION_DISCOUNT[level.id] ?? 0
              const hasCareer = !!selectedCareer

              // Real prices from selected career
              const tuitionBase = hasCareer ? parsePriceMXN(selectedCareer!.monthly_price) : 0
              const enrollmentBase = hasCareer ? parsePriceMXN(selectedCareer!.enrollment_price) : 0
              const tuitionFinal = tuitionBase * (1 - tuitionDiscount)
              const enrollmentFinal = enrollmentBase * 0.5

              return (
                <div
                  className="rounded-2xl border-2 p-5 mb-5"
                  style={{ borderColor: level.color + '55', background: level.bg }}
                >
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: level.color }}>
                      <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4">
                        <path d="M3 8l3.5 3.5 6.5-7" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-black text-gray-900 text-base leading-tight">Perfecto. Ya tienes un nivel de beca asignado</p>
                      <p className="text-sm mt-0.5 font-medium" style={{ color: level.color }}>{level.label} · {level.beca}</p>
                    </div>
                  </div>

                  {/* Real price breakdown (only when career is selected) */}
                  {hasCareer && tuitionBase > 0 && (
                    <div className="mb-4 space-y-2 bg-white/70 rounded-xl p-3 border border-gray-100">
                      <p className="text-sm font-black uppercase tracking-wider text-gray-400 mb-2">Tu costo con beca</p>

                      {tuitionDiscount > 0 ? (
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm text-gray-600">Colegiatura mensual</p>
                            <p className="text-sm text-gray-400">Base: <span className="line-through">{fmt(tuitionBase)}</span></p>
                          </div>
                          <span className="font-black text-lg" style={{ color: level.color }}>{fmt(tuitionFinal)}</span>
                        </div>
                      ) : (
                        <div className="flex justify-between items-center">
                          <p className="text-sm text-gray-600">Colegiatura mensual</p>
                          <span className="font-black text-lg text-gray-800">{fmt(tuitionBase)}</span>
                        </div>
                      )}

                      {enrollmentBase > 0 && (
                        <div className="flex justify-between items-center border-t border-gray-100 pt-2">
                          <div>
                            <p className="text-sm text-gray-600">Inscripción</p>
                            <p className="text-sm text-gray-400">Base: <span className="line-through">{fmt(enrollmentBase)}</span></p>
                          </div>
                          <span className="font-black text-lg" style={{ color: level.color }}>{fmt(enrollmentFinal)}</span>
                        </div>
                      )}

                      <p className="text-sm text-gray-400 pt-1 border-t border-gray-100">
                        Los costos exactos se confirman con tu asesor
                      </p>
                    </div>
                  )}

                  {/* Next step buttons — shown when no career selected */}
                  {!hasCareer && (
                    <div className="flex gap-2 mb-3">
                      <Link
                        to="/carreras"
                        className="flex-1 text-center py-3 rounded-xl border-2 text-sm font-black active:scale-95 transition-transform bg-white"
                        style={{ borderColor: level.color, color: level.color }}
                      >
                        Explorar carreras
                      </Link>
                      <button
                        onClick={openTest}
                        className="flex-1 text-center py-3 rounded-xl text-sm font-black text-white active:scale-95 transition-transform"
                        style={{ background: level.color }}
                      >
                        Test vocacional IA
                      </button>
                    </div>
                  )}

                  <button
                    onClick={() => setStep('form')}
                    className="w-full py-3.5 rounded-xl text-base font-black text-white active:scale-95 transition-transform"
                    style={{ background: level.color }}
                  >
                    Activar mi beca con un asesor
                  </button>
                </div>
              )
            })()}

            {/* Next start */}
            <div className="mb-6 p-3.5 rounded-xl bg-[#1B3070]/5 border border-[#1B3070]/10">
              <p className="text-sm text-gray-500 mb-0.5">Próxima fecha de inicio</p>
              <p className="text-base font-black text-[#1B3070]">1 de septiembre de 2026</p>
              <p className="text-sm text-gray-400 mt-0.5">Sin examen de admisión · Proceso en 5 pasos</p>
            </div>

            <button
              onClick={() => setStep('form')}
              className="w-full bg-[#1B3070] text-white font-bold py-4 rounded-2xl text-base active:scale-95 transition-transform"
            >
              Solicitar mi beca ahora
            </button>
          </>
        )}

        {step === 'form' && (
          <>
            <div className="pt-6 pb-4">
              <h2 className="font-black text-[#1B3070] text-2xl">Cuéntanos de ti</h2>
              <p className="text-gray-500 text-base mt-1">Completa el formulario y te contactaremos.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-semibold text-gray-600 mb-1 block">Nombre *</label>
                  <input
                    required
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1B3070]"
                    placeholder="Juan"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600 mb-1 block">Apellido *</label>
                  <input
                    required
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1B3070]"
                    placeholder="García"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-600 mb-1 block">Correo electrónico *</label>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1B3070]"
                  placeholder="juan@email.com"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-600 mb-1 block">Teléfono</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1B3070]"
                  placeholder="+52 55 1234 5678"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-600 mb-1 block">Carrera de interés</label>
                {selectedCareer && !careerOverride ? (
                  <div className="flex items-center justify-between border border-[#1B3070]/30 bg-[#1B3070]/5 rounded-xl px-3 py-2.5">
                    <div>
                      <p className="text-xs text-[#1B3070]/60 font-medium mb-0.5">Carrera seleccionada</p>
                      <p className="text-base font-semibold text-[#1B3070] leading-tight">{selectedCareer.name}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setCareerOverride(true)
                        setForm(f => ({ ...f, career: '' }))
                      }}
                      className="text-sm text-gray-400 underline underline-offset-2 ml-3 flex-shrink-0"
                    >
                      Cambiar
                    </button>
                  </div>
                ) : (
                  <select
                    value={form.career}
                    onChange={(e) => setForm({ ...form, career: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1B3070] bg-white"
                  >
                    <option value="">Selecciona una carrera</option>
                    {values.careers.filter(c => c.active).map((c) => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#1B3070] disabled:bg-gray-300 text-white font-bold py-4 rounded-2xl text-base mt-2"
              >
                {loading ? 'Enviando...' : 'Solicitar beca'}
              </button>

              <button
                type="button"
                onClick={() => setStep('info')}
                className="w-full text-gray-400 text-base py-2"
              >
                Volver
              </button>
            </form>
          </>
        )}

        {step === 'success' && (
          <div className="flex flex-col items-center text-center pt-16 pb-8">
            <div className="w-20 h-20 rounded-full bg-green-50 border-2 border-green-200 flex items-center justify-center mb-5">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth={2} className="w-10 h-10">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <h2 className="font-black text-[#1B3070] text-2xl mb-2">¡Solicitud enviada!</h2>
            <p className="text-gray-500 text-base max-w-sm leading-relaxed">
              Hemos recibido tu solicitud. Un asesor de admisiones te contactará en las próximas horas para guiarte en el proceso — sin examen de ingreso.
            </p>
            <div className="mt-6 p-4 bg-[#1B3070]/5 rounded-2xl w-full text-left">
              <p className="text-sm text-gray-500 mb-1">También puedes contactarnos directamente:</p>
              <p className="text-[#1B3070] font-semibold text-base">{values.contactPhone}</p>
              <p className="text-[#1B3070] font-semibold text-base">{values.contactEmail}</p>
            </div>
            <button
              onClick={() => setStep('info')}
              className="mt-6 text-[#1B3070] font-semibold text-base underline"
            >
              Volver a becas
            </button>
          </div>
        )}

      </PageLayout>
    </div>
  )
}

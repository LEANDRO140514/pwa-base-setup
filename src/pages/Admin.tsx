import { useState } from 'react'
import TopBar from '@/components/layout/TopBar'
import PageLayout from '@/components/layout/PageLayout'
import { useAdmin } from '@/context/AdminContext'
import type { Banner, Career } from '@/context/AdminContext'

type AdminSection = 'overview' | 'hero' | 'banners' | 'careers' | 'general'

export default function Admin() {
  const {
    values,
    updateValues,
    updateHero,
    updateBanner,
    addBanner,
    removeBanner,
    updateCareer,
    addCareer,
    removeCareer,
  } = useAdmin()

  const [section, setSection] = useState<AdminSection>('overview')
  const [saved, setSaved] = useState(false)

  const showSaved = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="flex flex-col min-h-dvh bg-gray-50">
      <TopBar
        title="Panel de Administración"
        showBack={section !== 'overview'}
        onBack={() => setSection('overview')}
      />

      {/* Saved toast */}
      {saved && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg">
          ✓ Guardado correctamente
        </div>
      )}

      <PageLayout>
        {section === 'overview' && (
          <div className="pt-4">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-widest mb-4">
              Custom Values
            </p>
            <div className="space-y-2">
              {[
                { key: 'hero' as AdminSection, label: 'Hero / Texto principal', icon: '📝', desc: 'Headline, subtítulo y CTA' },
                { key: 'banners' as AdminSection, label: 'Banners', icon: '🖼️', desc: `${values.banners.length} banner(s) configurado(s)` },
                { key: 'careers' as AdminSection, label: 'Carreras', icon: '🎓', desc: `${values.careers.length} carrera(s) activa(s)` },
                { key: 'general' as AdminSection, label: 'General', icon: '⚙️', desc: 'Nombre, contacto, redes' },
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={() => setSection(item.key)}
                  className="w-full flex items-center gap-3 bg-white rounded-2xl p-4 text-left hover:bg-gray-50 transition-colors border border-gray-100"
                >
                  <span className="text-xl">{item.icon}</span>
                  <div className="flex-1">
                    <p className="font-semibold text-[#1B3070] text-sm">{item.label}</p>
                    <p className="text-gray-400 text-xs">{item.desc}</p>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-gray-300">
                    <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" />
                  </svg>
                </button>
              ))}
            </div>
          </div>
        )}

        {section === 'hero' && (
          <HeroEditor hero={values.hero} onSave={(h) => { updateHero(h); showSaved() }} />
        )}

        {section === 'banners' && (
          <BannersEditor
            banners={values.banners}
            onUpdate={updateBanner}
            onAdd={addBanner}
            onRemove={removeBanner}
            onSave={showSaved}
          />
        )}

        {section === 'careers' && (
          <CareersEditor
            careers={values.careers}
            onUpdate={updateCareer}
            onAdd={addCareer}
            onRemove={removeCareer}
            onSave={showSaved}
          />
        )}

        {section === 'general' && (
          <GeneralEditor values={values} onSave={(v) => { updateValues(v); showSaved() }} />
        )}
      </PageLayout>
    </div>
  )
}

// ─── Sub-editors ────────────────────────────────────────────────────────────

function HeroEditor({
  hero,
  onSave,
}: {
  hero: typeof useAdmin extends () => { values: { hero: infer H } } ? H : never
  onSave: (h: Partial<typeof hero>) => void
}) {
  const [form, setForm] = useState({ ...hero })

  return (
    <div className="pt-4 space-y-4">
      <h2 className="font-bold text-[#1B3070] text-base">Hero / Texto Principal</h2>
      <Field label="Headline" value={form.headline} onChange={(v) => setForm({ ...form, headline: v })} />
      <Field label="Subtítulo" value={form.subheadline} onChange={(v) => setForm({ ...form, subheadline: v })} />
      <Field label="Texto CTA" value={form.ctaText} onChange={(v) => setForm({ ...form, ctaText: v })} />
      <Field label="Link CTA" value={form.ctaLink} onChange={(v) => setForm({ ...form, ctaLink: v })} />
      <SaveButton onClick={() => onSave(form)} />
    </div>
  )
}

function BannersEditor({
  banners,
  onUpdate,
  onAdd,
  onRemove,
  onSave,
}: {
  banners: Banner[]
  onUpdate: (id: string, patch: Partial<Banner>) => void
  onAdd: (b: Omit<Banner, 'id'>) => void
  onRemove: (id: string) => void
  onSave: () => void
}) {
  return (
    <div className="pt-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-[#1B3070] text-base">Banners</h2>
        <button
          onClick={() =>
            onAdd({
              imageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800',
              title: 'Nuevo Banner',
              subtitle: 'Subtítulo',
              ctaText: 'Ver más',
              ctaLink: '/',
              active: true,
            })
          }
          className="bg-[#E6B400] text-[#1B3070] text-xs font-bold px-3 py-1.5 rounded-full"
        >
          + Agregar
        </button>
      </div>
      {banners.map((b) => (
        <div key={b.id} className="bg-white border border-gray-100 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-[#1B3070] text-sm truncate">{b.title}</p>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer">
                <input
                  type="checkbox"
                  checked={b.active}
                  onChange={(e) => { onUpdate(b.id, { active: e.target.checked }); onSave() }}
                  className="accent-[#1B3070]"
                />
                Activo
              </label>
              <button onClick={() => { onRemove(b.id); onSave() }} className="text-red-400 text-xs font-semibold">Eliminar</button>
            </div>
          </div>
          <Field label="URL imagen" value={b.imageUrl} onChange={(v) => onUpdate(b.id, { imageUrl: v })} />
          <Field label="Título" value={b.title} onChange={(v) => onUpdate(b.id, { title: v })} />
          <Field label="Subtítulo" value={b.subtitle || ''} onChange={(v) => onUpdate(b.id, { subtitle: v })} />
          <SaveButton onClick={onSave} />
        </div>
      ))}
    </div>
  )
}

function CareersEditor({
  careers,
  onUpdate,
  onAdd,
  onRemove,
  onSave,
}: {
  careers: Career[]
  onUpdate: (id: string, patch: Partial<Career>) => void
  onAdd: (c: Omit<Career, 'id'>) => void
  onRemove: (id: string) => void
  onSave: () => void
}) {
  return (
    <div className="pt-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-[#1B3070] text-base">Carreras</h2>
        <button
          onClick={() =>
            onAdd({ name: 'Nueva Carrera', area: 'Área', duration: '4 años', modality: 'presencial', description: 'Descripción', active: true })
          }
          className="bg-[#E6B400] text-[#1B3070] text-xs font-bold px-3 py-1.5 rounded-full"
        >
          + Agregar
        </button>
      </div>
      {careers.map((c) => (
        <div key={c.id} className="bg-white border border-gray-100 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-[#1B3070] text-sm truncate">{c.name}</p>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer">
                <input type="checkbox" checked={c.active} onChange={(e) => { onUpdate(c.id, { active: e.target.checked }); onSave() }} className="accent-[#1B3070]" />
                Activa
              </label>
              <button onClick={() => { onRemove(c.id); onSave() }} className="text-red-400 text-xs font-semibold">Eliminar</button>
            </div>
          </div>
          <Field label="Nombre" value={c.name} onChange={(v) => onUpdate(c.id, { name: v })} />
          <Field label="Área" value={c.area} onChange={(v) => onUpdate(c.id, { area: v })} />
          <Field label="Duración" value={c.duration} onChange={(v) => onUpdate(c.id, { duration: v })} />
          <Field label="Descripción" value={c.description} onChange={(v) => onUpdate(c.id, { description: v })} multiline />
          <SaveButton onClick={onSave} />
        </div>
      ))}
    </div>
  )
}

function GeneralEditor({
  values,
  onSave,
}: {
  values: ReturnType<typeof useAdmin>['values']
  onSave: (v: Partial<ReturnType<typeof useAdmin>['values']>) => void
}) {
  const [form, setForm] = useState({
    appName: values.appName,
    appTagline: values.appTagline,
    contactEmail: values.contactEmail,
    contactPhone: values.contactPhone,
    whatsappNumber: values.whatsappNumber,
  })
  return (
    <div className="pt-4 space-y-4">
      <h2 className="font-bold text-[#1B3070] text-base">General</h2>
      <Field label="Nombre de la app" value={form.appName} onChange={(v) => setForm({ ...form, appName: v })} />
      <Field label="Tagline" value={form.appTagline} onChange={(v) => setForm({ ...form, appTagline: v })} />
      <Field label="Email de contacto" value={form.contactEmail} onChange={(v) => setForm({ ...form, contactEmail: v })} />
      <Field label="Teléfono" value={form.contactPhone} onChange={(v) => setForm({ ...form, contactPhone: v })} />
      <Field label="WhatsApp" value={form.whatsappNumber} onChange={(v) => setForm({ ...form, whatsappNumber: v })} />
      <SaveButton onClick={() => onSave(form)} />
    </div>
  )
}

// ─── Reusable field ─────────────────────────────────────────────────────────

function Field({
  label,
  value,
  onChange,
  multiline = false,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  multiline?: boolean
}) {
  return (
    <div>
      <label className="text-xs font-semibold text-gray-500 mb-1 block">{label}</label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#1B3070] resize-none"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#1B3070]"
        />
      )}
    </div>
  )
}

function SaveButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full bg-[#1B3070] text-white font-bold py-2.5 rounded-xl text-sm"
    >
      Guardar cambios
    </button>
  )
}

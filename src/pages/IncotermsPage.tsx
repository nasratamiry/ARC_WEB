import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowRightLeft, CheckCircle2, Ship, Truck } from 'lucide-react'
import Seo from '../shared/components/Seo'
import { SectionContainer } from '../shared/ui'

function IncotermsPage() {
  const { t, i18n } = useTranslation()
  const isRtl = i18n.dir() === 'rtl'
  const isFaOrPs = i18n.language.startsWith('fa') || i18n.language.startsWith('ps')

  const terms = useMemo(
    () => [
      'exw',
      'fca',
      'fas',
      'fob',
      'cfr',
      'cif',
      'cpt',
      'cip',
      'dap',
      'dpu',
      'ddp',
    ],
    [],
  )

  const featured = useMemo(() => ['exw', 'fob', 'cif', 'ddp'], [])
  const groups = useMemo(() => ['e', 'f', 'c', 'd'], [])
  const flowSteps = useMemo(() => ['factory', 'transport', 'port', 'shipping', 'destination'], [])

  return (
    <SectionContainer>
      <Seo title={t('incoterms.hero.title')} description={t('incoterms.hero.subtitle')} />
      <div dir={isRtl ? 'rtl' : 'ltr'} className={`${isRtl ? 'text-right' : 'text-left'} space-y-10 lg:space-y-12`}>
        <section className="rounded-3xl border border-[#00E2FF]/30 bg-white/90 p-6 shadow-sm sm:p-8 lg:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#00E2FF]">{t('incoterms.hero.eyebrow')}</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">{t('incoterms.hero.title')}</h1>
          <p className="mt-3 max-w-3xl text-sm text-gray-600 sm:text-base">{t('incoterms.hero.subtitle')}</p>
          <p className="mt-4 max-w-3xl text-sm text-gray-600">{t('incoterms.hero.description')}</p>
        </section>

        <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-lg font-semibold text-slate-900">{t('incoterms.what.title')}</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <li key={n} className="flex items-start gap-2 text-sm text-gray-600">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#00E2FF]" />
                <span>{t(`incoterms.what.points.${n}`)}</span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">{t('incoterms.classification.title')}</h2>
          <div className="mt-4 grid items-stretch gap-4 md:grid-cols-2 xl:grid-cols-4">
            {groups.map((group) => (
              <article key={group} className="flex h-full flex-col rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:shadow-md">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#00E2FF]">{t(`incoterms.classification.${group}.label`)}</p>
                <h3 className="mt-2 text-lg font-semibold text-slate-900">{t(`incoterms.classification.${group}.name`)}</h3>
                <p className="mt-2 text-sm text-gray-600">{t(`incoterms.classification.${group}.description`)}</p>
                <p className="mt-auto rounded-xl bg-[#00E2FF]/10 px-2 py-2 text-center text-[10px] font-medium leading-tight text-slate-800 sm:px-3 sm:text-xs sm:leading-5 sm:whitespace-nowrap">
                  {t(`incoterms.classification.${group}.responsibility`)}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-lg font-semibold text-slate-900">{t('incoterms.table.title')}</h2>
          <div className="mt-4 overflow-x-auto">
            <table
              dir={isFaOrPs ? 'rtl' : 'ltr'}
              className={`min-w-full border-separate border-spacing-0 text-sm ${isFaOrPs ? 'text-right' : 'text-left'}`}
            >
              <thead>
                <tr>
                  {['code', 'name', 'transport', 'seller', 'buyer'].map((head) => (
                    <th key={head} className="border-b border-gray-200 bg-slate-50 px-4 py-3 font-semibold text-slate-700 first:rounded-tl-xl last:rounded-tr-xl">
                      {t(`incoterms.table.columns.${head}`)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {terms.map((code) => (
                  <tr key={code} className="align-top">
                    <td className="border-b border-gray-100 px-4 py-3 font-semibold text-slate-900">{code.toUpperCase()}</td>
                    <td className="border-b border-gray-100 px-4 py-3 text-gray-700">{t(`incoterms.terms.${code}.name`)}</td>
                    <td className="border-b border-gray-100 px-4 py-3 text-gray-600">{t(`incoterms.terms.${code}.transport`)}</td>
                    <td className="border-b border-gray-100 px-4 py-3 text-gray-600">{t(`incoterms.terms.${code}.seller`)}</td>
                    <td className="border-b border-gray-100 px-4 py-3 text-gray-600">{t(`incoterms.terms.${code}.buyer`)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">{t('incoterms.featured.title')}</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {featured.map((code) => (
              <article key={code} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:shadow-md">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#00E2FF]">{code.toUpperCase()}</p>
                <h3 className="mt-2 text-lg font-semibold text-slate-900">{t(`incoterms.terms.${code}.name`)}</h3>
                <p className="mt-2 text-sm text-gray-600">{t(`incoterms.featured.${code}`)}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-lg font-semibold text-slate-900">{t('incoterms.flow.title')}</h2>
          <p className="mt-2 text-sm text-gray-600">{t('incoterms.flow.subtitle')}</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-5">
            {flowSteps.map((step, index) => (
              <div key={step} className="relative rounded-2xl border border-gray-100 bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wide text-[#00E2FF]">{index + 1}</span>
                  <span className="text-gray-400">
                    {index < 2 ? <Truck className="h-4 w-4" /> : index === 2 ? <Ship className="h-4 w-4" /> : <ArrowRightLeft className="h-4 w-4" />}
                  </span>
                </div>
                <h3 className="mt-2 text-sm font-semibold text-slate-900">{t(`incoterms.flow.steps.${step}.title`)}</h3>
                <p className="mt-1 text-xs text-gray-600">{t(`incoterms.flow.steps.${step}.transfer`)}</p>
              </div>
            ))}
          </div>
        </section>

      </div>
    </SectionContainer>
  )
}

export default IncotermsPage

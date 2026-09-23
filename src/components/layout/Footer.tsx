import { useTranslation } from 'react-i18next'

export function Footer() {
  const { t } = useTranslation()
  return <footer className="px-2 pb-1 text-sm text-fg-subtle">{t('common.footer')}</footer>
}

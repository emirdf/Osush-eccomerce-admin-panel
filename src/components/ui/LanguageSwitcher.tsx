import { Languages } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { LANGUAGES } from '@/lib/i18n'
import { buttonClasses } from './styles'
import { DropdownMenu } from './DropdownMenu'

export function LanguageSwitcher() {
  const { t, i18n } = useTranslation()

  return (
    <DropdownMenu
      label={t('common.language.label')}
      triggerClassName={buttonClasses({ variant: 'ghost', size: 'md', className: 'gap-1.5 px-2.5' })}
      trigger={
        <>
          <Languages className="size-5" aria-hidden="true" />
          <span className="text-sm font-semibold uppercase">{i18n.language}</span>
        </>
      }
      items={LANGUAGES.map((lang) => ({
        key: lang,
        label: t(`common.language.${lang}`),
        checked: i18n.language === lang,
        onSelect: () => void i18n.changeLanguage(lang),
      }))}
    />
  )
}

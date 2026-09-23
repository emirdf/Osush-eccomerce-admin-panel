import { Bell, Image as ImageIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { TabLinks } from '@/components/ui/TabLinks'

/** Switches between banners and notifications inside the "Ads" section. */
export function AdsSectionTabs() {
  const { t } = useTranslation()
  return (
    <TabLinks
      label={t('ads.tabs.label')}
      tabs={[
        { to: '/ads', label: t('ads.tabs.banners'), icon: ImageIcon },
        { to: '/notifications', label: t('ads.tabs.notifications'), icon: Bell },
      ]}
    />
  )
}
